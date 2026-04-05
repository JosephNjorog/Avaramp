import { expect }          from "chai";
import { ethers }          from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { MerchantRegistry } from "../typechain-types";

describe("MerchantRegistry", () => {
  let registry : MerchantRegistry;
  let admin    : SignerWithAddress;
  let operator : SignerWithAddress;
  let gateway  : SignerWithAddress;
  let merchant : SignerWithAddress;
  let stranger : SignerWithAddress;

  const OPERATOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("OPERATOR_ROLE"));
  const GATEWAY_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("GATEWAY_ROLE"));

  beforeEach(async () => {
    [admin, operator, gateway, merchant, stranger] = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("MerchantRegistry");
    registry = (await Factory.deploy(admin.address)) as unknown as MerchantRegistry;

    // Grant operator role to separate signer
    await registry.connect(admin).grantRole(OPERATOR_ROLE, operator.address);
    // Grant gateway role
    await registry.connect(admin).setGateway(gateway.address);
  });

  // ── Registration ──────────────────────────────────────────────────────────

  describe("register()", () => {
    it("registers a new merchant and emits event", async () => {
      await expect(
        registry.connect(operator).register(merchant.address, "Acme Ltd", 100)
      )
        .to.emit(registry, "MerchantRegistered")
        .withArgs(merchant.address, "Acme Ltd", 100);

      const m = await registry.getMerchant(merchant.address);
      expect(m.wallet).to.equal(merchant.address);
      expect(m.name).to.equal("Acme Ltd");
      expect(m.feeBps).to.equal(100);
      expect(m.active).to.equal(true);
      expect(m.totalSettled).to.equal(0n);
    });

    it("increments totalMerchants", async () => {
      await registry.connect(operator).register(merchant.address, "Acme Ltd", 0);
      expect(await registry.totalMerchants()).to.equal(1n);
    });

    it("reverts on duplicate registration", async () => {
      await registry.connect(operator).register(merchant.address, "Acme Ltd", 0);
      await expect(
        registry.connect(operator).register(merchant.address, "Acme Ltd 2", 0)
      ).to.be.revertedWith("Already registered");
    });

    it("reverts on zero wallet", async () => {
      await expect(
        registry.connect(operator).register(ethers.ZeroAddress, "Name", 0)
      ).to.be.revertedWith("Invalid wallet");
    });

    it("reverts on empty name", async () => {
      await expect(
        registry.connect(operator).register(merchant.address, "", 0)
      ).to.be.revertedWith("Name required");
    });

    it("reverts if fee exceeds 5%", async () => {
      await expect(
        registry.connect(operator).register(merchant.address, "Name", 501)
      ).to.be.revertedWith("Max fee 5%");
    });

    it("reverts for non-operator", async () => {
      await expect(
        registry.connect(stranger).register(merchant.address, "Name", 0)
      ).to.be.reverted;
    });
  });

  // ── Deactivate / Reactivate ───────────────────────────────────────────────

  describe("deactivate() / reactivate()", () => {
    beforeEach(async () => {
      await registry.connect(operator).register(merchant.address, "Acme", 0);
    });

    it("deactivates an active merchant", async () => {
      await expect(registry.connect(operator).deactivate(merchant.address))
        .to.emit(registry, "MerchantDeactivated")
        .withArgs(merchant.address);

      expect(await registry.isActive(merchant.address)).to.equal(false);
    });

    it("reactivates a deactivated merchant", async () => {
      await registry.connect(operator).deactivate(merchant.address);
      await expect(registry.connect(operator).reactivate(merchant.address))
        .to.emit(registry, "MerchantReactivated")
        .withArgs(merchant.address);

      expect(await registry.isActive(merchant.address)).to.equal(true);
    });

    it("reverts deactivate if already inactive", async () => {
      await registry.connect(operator).deactivate(merchant.address);
      await expect(
        registry.connect(operator).deactivate(merchant.address)
      ).to.be.revertedWith("Not active");
    });

    it("reverts reactivate if already active", async () => {
      await expect(
        registry.connect(operator).reactivate(merchant.address)
      ).to.be.revertedWith("Already active");
    });
  });

  // ── Fee override ──────────────────────────────────────────────────────────

  describe("setFeeOverride()", () => {
    beforeEach(async () => {
      await registry.connect(operator).register(merchant.address, "Acme", 100);
    });

    it("updates fee and emits event", async () => {
      await expect(registry.connect(operator).setFeeOverride(merchant.address, 200))
        .to.emit(registry, "MerchantFeeOverridden")
        .withArgs(merchant.address, 200);

      const m = await registry.getMerchant(merchant.address);
      expect(m.feeBps).to.equal(200);
    });

    it("reverts for unknown merchant", async () => {
      await expect(
        registry.connect(operator).setFeeOverride(stranger.address, 100)
      ).to.be.revertedWith("Unknown merchant");
    });

    it("reverts if new fee > 5%", async () => {
      await expect(
        registry.connect(operator).setFeeOverride(merchant.address, 501)
      ).to.be.revertedWith("Max 5%");
    });
  });

  // ── Effective fee ─────────────────────────────────────────────────────────

  describe("effectiveFee()", () => {
    it("returns custom override when set", async () => {
      await registry.connect(operator).register(merchant.address, "Acme", 120);
      expect(await registry.effectiveFee(merchant.address, 150n)).to.equal(120n);
    });

    it("returns defaultBps when merchant fee is 0", async () => {
      await registry.connect(operator).register(merchant.address, "Acme", 0);
      expect(await registry.effectiveFee(merchant.address, 150n)).to.equal(150n);
    });
  });

  // ── Settlement recording ──────────────────────────────────────────────────

  describe("recordSettlement()", () => {
    beforeEach(async () => {
      await registry.connect(operator).register(merchant.address, "Acme", 0);
    });

    it("increments totalSettled", async () => {
      await registry.connect(gateway).recordSettlement(merchant.address, 1_000_000n);
      const m = await registry.getMerchant(merchant.address);
      expect(m.totalSettled).to.equal(1_000_000n);
    });

    it("reverts for non-gateway caller", async () => {
      await expect(
        registry.connect(stranger).recordSettlement(merchant.address, 1_000_000n)
      ).to.be.reverted;
    });
  });

  // ── Paginated list ────────────────────────────────────────────────────────

  describe("getMerchants()", () => {
    it("returns empty array for out-of-range offset", async () => {
      const list = await registry.getMerchants(0n, 10n);
      expect(list.length).to.equal(0);
    });

    it("returns paginated results", async () => {
      const signers = await ethers.getSigners();
      const m1 = signers[6];
      const m2 = signers[7];
      await registry.connect(operator).register(merchant.address, "Acme", 0);
      await registry.connect(operator).register(m1.address, "Beta", 0);
      await registry.connect(operator).register(m2.address, "Gamma", 0);

      const page = await registry.getMerchants(1n, 2n);
      expect(page.length).to.equal(2);
      expect(page[0].wallet).to.equal(m1.address);
      expect(page[1].wallet).to.equal(m2.address);
    });
  });
});
