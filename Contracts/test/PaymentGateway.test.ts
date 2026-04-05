import { expect }            from "chai";
import { ethers }            from "hardhat";
import { SignerWithAddress }  from "@nomicfoundation/hardhat-ethers/signers";
import {
  PaymentGateway,
  MerchantRegistry,
} from "../typechain-types";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** 6-decimal USDC amount helper */
const usdc = (n: number) => BigInt(n) * 1_000_000n;

/** Random bytes32 payment ID */
const pid = () => ethers.hexlify(ethers.randomBytes(32));

// ── Minimal ERC-20 mock ───────────────────────────────────────────────────────
// We deploy an in-process ERC-20 so we don't need a real USDC fork.

const ERC20_ABI = [
  "function mint(address to, uint256 amount) external",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
];

// ── Test suite ────────────────────────────────────────────────────────────────

describe("PaymentGateway", () => {
  let gateway  : PaymentGateway;
  let registry : MerchantRegistry;
  let mockUsdc : any; // ERC20Mock

  let admin    : SignerWithAddress;
  let operator : SignerWithAddress;
  let treasury : SignerWithAddress;
  let merchant : SignerWithAddress;
  let payer    : SignerWithAddress;
  let stranger : SignerWithAddress;

  const FEE_BPS = 150n; // 1.5%

  beforeEach(async () => {
    [admin, operator, treasury, merchant, payer, stranger] = await ethers.getSigners();

    // ── Deploy mock USDC ─────────────────────────────────────────────────────
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUsdc = await MockERC20.deploy("USD Coin", "USDC", 6);

    // ── Deploy MerchantRegistry ──────────────────────────────────────────────
    const RegistryFactory = await ethers.getContractFactory("MerchantRegistry");
    registry = (await RegistryFactory.deploy(admin.address)) as unknown as MerchantRegistry;

    // ── Deploy PaymentGateway ─────────────────────────────────────────────────
    const GatewayFactory = await ethers.getContractFactory("PaymentGateway");
    gateway = (await GatewayFactory.deploy(
      admin.address,
      await mockUsdc.getAddress(),
      await registry.getAddress(),
      FEE_BPS,
      treasury.address
    )) as unknown as PaymentGateway;

    // ── Wire up roles ────────────────────────────────────────────────────────
    const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
    await registry.connect(admin).grantRole(OPERATOR_ROLE, operator.address);
    await gateway.connect(admin).grantRole(OPERATOR_ROLE, operator.address);
    await registry.connect(admin).setGateway(await gateway.getAddress());

    // ── Register merchant ─────────────────────────────────────────────────────
    await registry.connect(operator).register(merchant.address, "Acme Shop", 0);

    // ── Fund payer with mock USDC ─────────────────────────────────────────────
    await mockUsdc.mint(payer.address, usdc(10_000));
    await mockUsdc.connect(payer).approve(await gateway.getAddress(), ethers.MaxUint256);
  });

  // ── deposit() ──────────────────────────────────────────────────────────────

  describe("deposit()", () => {
    it("creates a PENDING payment and emits PaymentCreated", async () => {
      const id     = pid();
      const amount = usdc(100);
      const fee    = (amount * FEE_BPS) / 10_000n;
      const net    = amount - fee;

      await expect(gateway.connect(payer).deposit(id, merchant.address, amount))
        .to.emit(gateway, "PaymentCreated")
        .withArgs(id, payer.address, merchant.address, amount, fee, net);

      const p = await gateway.getPayment(id);
      expect(p.status).to.equal(0); // PENDING
      expect(p.grossAmount).to.equal(amount);
      expect(p.protocolFee).to.equal(fee);
      expect(p.netAmount).to.equal(net);
    });

    it("accumulates protocol fee in accruedFees", async () => {
      const amount = usdc(100);
      await gateway.connect(payer).deposit(pid(), merchant.address, amount);
      const expected = (amount * FEE_BPS) / 10_000n;
      expect(await gateway.accruedFees()).to.equal(expected);
    });

    it("pulls USDC from depositor into gateway", async () => {
      const amount      = usdc(200);
      const gatewayAddr = await gateway.getAddress();
      const before      = await mockUsdc.balanceOf(gatewayAddr);

      await gateway.connect(payer).deposit(pid(), merchant.address, amount);
      expect(await mockUsdc.balanceOf(gatewayAddr)).to.equal(before + amount);
    });

    it("reverts on duplicate paymentId", async () => {
      const id = pid();
      await gateway.connect(payer).deposit(id, merchant.address, usdc(50));
      await expect(
        gateway.connect(payer).deposit(id, merchant.address, usdc(50))
      ).to.be.revertedWith("Duplicate paymentId");
    });

    it("reverts for inactive merchant", async () => {
      const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
      await registry.connect(admin).grantRole(OPERATOR_ROLE, admin.address);
      await registry.connect(admin).deactivate(merchant.address);

      await expect(
        gateway.connect(payer).deposit(pid(), merchant.address, usdc(50))
      ).to.be.revertedWith("Merchant not active");
    });

    it("reverts on zero amount", async () => {
      await expect(
        gateway.connect(payer).deposit(pid(), merchant.address, 0n)
      ).to.be.revertedWith("Amount is zero");
    });
  });

  // ── settle() ──────────────────────────────────────────────────────────────

  describe("settle()", () => {
    let paymentId: string;
    const amount = usdc(100);

    beforeEach(async () => {
      paymentId = pid();
      await gateway.connect(payer).deposit(paymentId, merchant.address, amount);
    });

    it("transfers net USDC to merchant and emits PaymentSettled", async () => {
      const net    = amount - (amount * FEE_BPS) / 10_000n;
      const before = await mockUsdc.balanceOf(merchant.address);

      await expect(gateway.connect(operator).settle(paymentId))
        .to.emit(gateway, "PaymentSettled")
        .withArgs(paymentId, merchant.address, net);

      expect(await mockUsdc.balanceOf(merchant.address)).to.equal(before + net);
    });

    it("marks payment SETTLED (status = 2)", async () => {
      await gateway.connect(operator).settle(paymentId);
      expect((await gateway.getPayment(paymentId)).status).to.equal(2);
    });

    it("calls recordSettlement on registry", async () => {
      await gateway.connect(operator).settle(paymentId);
      const m = await registry.getMerchant(merchant.address);
      expect(m.totalSettled).to.be.gt(0n);
    });

    it("reverts on double-settle", async () => {
      await gateway.connect(operator).settle(paymentId);
      await expect(
        gateway.connect(operator).settle(paymentId)
      ).to.be.revertedWith("Not pending");
    });

    it("reverts for non-operator", async () => {
      await expect(
        gateway.connect(stranger).settle(paymentId)
      ).to.be.reverted;
    });
  });

  // ── refund() ──────────────────────────────────────────────────────────────

  describe("refund()", () => {
    let paymentId: string;
    const amount = usdc(100);

    beforeEach(async () => {
      paymentId = pid();
      await gateway.connect(payer).deposit(paymentId, merchant.address, amount);
    });

    it("returns gross USDC to depositor and emits PaymentRefunded", async () => {
      const before = await mockUsdc.balanceOf(payer.address);

      await expect(gateway.connect(operator).refund(paymentId))
        .to.emit(gateway, "PaymentRefunded")
        .withArgs(paymentId, payer.address, amount);

      expect(await mockUsdc.balanceOf(payer.address)).to.equal(before + amount);
    });

    it("decrements accruedFees by the protocol fee", async () => {
      const feeBefore = await gateway.accruedFees();
      await gateway.connect(operator).refund(paymentId);
      expect(await gateway.accruedFees()).to.equal(0n);
    });

    it("marks payment REFUNDED (status = 3)", async () => {
      await gateway.connect(operator).refund(paymentId);
      expect((await gateway.getPayment(paymentId)).status).to.equal(3);
    });

    it("reverts double-refund", async () => {
      await gateway.connect(operator).refund(paymentId);
      await expect(
        gateway.connect(operator).refund(paymentId)
      ).to.be.revertedWith("Not pending");
    });
  });

  // ── markFailed() ──────────────────────────────────────────────────────────

  describe("markFailed()", () => {
    it("marks payment FAILED (status = 4) without moving funds", async () => {
      const id = pid();
      await gateway.connect(payer).deposit(id, merchant.address, usdc(50));
      const gwBefore = await mockUsdc.balanceOf(await gateway.getAddress());

      await expect(gateway.connect(operator).markFailed(id))
        .to.emit(gateway, "PaymentFailed")
        .withArgs(id);

      expect((await gateway.getPayment(id)).status).to.equal(4);
      expect(await mockUsdc.balanceOf(await gateway.getAddress())).to.equal(gwBefore);
    });
  });

  // ── withdrawTreasury() ────────────────────────────────────────────────────

  describe("withdrawTreasury()", () => {
    beforeEach(async () => {
      await gateway.connect(payer).deposit(pid(), merchant.address, usdc(1000));
    });

    it("transfers fees to treasury address", async () => {
      const accrued = await gateway.accruedFees();
      const before  = await mockUsdc.balanceOf(treasury.address);

      await gateway.connect(admin).withdrawTreasury(accrued);
      expect(await mockUsdc.balanceOf(treasury.address)).to.equal(before + accrued);
    });

    it("emits TreasuryWithdrawn", async () => {
      const accrued = await gateway.accruedFees();
      await expect(gateway.connect(admin).withdrawTreasury(accrued))
        .to.emit(gateway, "TreasuryWithdrawn")
        .withArgs(treasury.address, accrued);
    });

    it("reverts if withdrawing more than accrued", async () => {
      const accrued = await gateway.accruedFees();
      await expect(
        gateway.connect(admin).withdrawTreasury(accrued + 1n)
      ).to.be.revertedWith("Insufficient fees");
    });

    it("reverts for non-treasury role caller", async () => {
      await expect(
        gateway.connect(stranger).withdrawTreasury(1n)
      ).to.be.reverted;
    });
  });

  // ── Admin functions ────────────────────────────────────────────────────────

  describe("setProtocolFee()", () => {
    it("updates fee and emits ProtocolFeeUpdated", async () => {
      await expect(gateway.connect(admin).setProtocolFee(200n))
        .to.emit(gateway, "ProtocolFeeUpdated")
        .withArgs(150n, 200n);
      expect(await gateway.protocolFeeBps()).to.equal(200n);
    });

    it("reverts if fee > 5%", async () => {
      await expect(
        gateway.connect(admin).setProtocolFee(501n)
      ).to.be.revertedWith("Fee > 5%");
    });
  });

  describe("setTreasury()", () => {
    it("updates treasury address", async () => {
      await expect(gateway.connect(admin).setTreasury(stranger.address))
        .to.emit(gateway, "TreasuryUpdated")
        .withArgs(treasury.address, stranger.address);
      expect(await gateway.treasury()).to.equal(stranger.address);
    });

    it("reverts on zero address", async () => {
      await expect(
        gateway.connect(admin).setTreasury(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });
  });

  // ── Pause ─────────────────────────────────────────────────────────────────

  describe("pause / unpause", () => {
    it("prevents deposits when paused", async () => {
      await gateway.connect(admin).pause();
      await expect(
        gateway.connect(payer).deposit(pid(), merchant.address, usdc(10))
      ).to.be.revertedWithCustomError(gateway, "EnforcedPause");
    });

    it("allows deposits after unpause", async () => {
      await gateway.connect(admin).pause();
      await gateway.connect(admin).unpause();
      await expect(
        gateway.connect(payer).deposit(pid(), merchant.address, usdc(10))
      ).not.to.be.reverted;
    });
  });
});
