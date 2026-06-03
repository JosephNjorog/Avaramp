/**
 * Safaricom Daraja API — M-Pesa settlement service
 *
 * Covers:
 *  B2C  → personal M-Pesa phone numbers  (CommandID: BusinessPayment)
 *  B2B  → Till numbers                    (CommandID: BusinessBuyGoods)
 *  B2B  → Paybill numbers                 (CommandID: BusinessPayBill)
 *
 * Required env vars:
 *   DARAJA_CONSUMER_KEY        — from developer.safaricom.co.ke
 *   DARAJA_CONSUMER_SECRET     — from developer.safaricom.co.ke
 *   DARAJA_SHORTCODE           — your business shortcode (till or paybill)
 *   DARAJA_INITIATOR_NAME      — initiator name set in Safaricom portal
 *   DARAJA_SECURITY_CREDENTIAL — initiator password encrypted with Safaricom cert
 *   DARAJA_B2C_RESULT_URL      — public HTTPS URL (e.g. https://yourserver/daraja/b2c/result)
 *   DARAJA_B2B_RESULT_URL      — public HTTPS URL (e.g. https://yourserver/daraja/b2b/result)
 *   DARAJA_TIMEOUT_URL         — public HTTPS URL for timeout callbacks
 *   DARAJA_SANDBOX             — "true" for sandbox, omit for production
 *
 * SecurityCredential generation:
 *   node -e "
 *     const crypto = require('crypto');
 *     const fs = require('fs');
 *     const cert = fs.readFileSync('./safaricom_cert.cer', 'utf8');
 *     const enc = crypto.publicEncrypt(
 *       { key: cert, padding: crypto.constants.RSA_PKCS1_PADDING },
 *       Buffer.from('YOUR_INITIATOR_PASSWORD')
 *     );
 *     console.log(enc.toString('base64'));
 *   "
 *   Certs: sandbox.cer and production.cer available at developer.safaricom.co.ke/docs
 */
import axios, { AxiosInstance } from "axios";
import { logger } from "../../shared/Utils/Logger";

export interface DarajaTransferResult {
  conversationId:         string;   // Safaricom OriginatorConversationID — use as receipt
  originatorConversationId: string;
}

interface B2COptions {
  phone:     string;        // 254712345678 (no + prefix)
  amount:    number;        // KES amount (integer or decimal)
  reference: string;        // payment ID or order ref
  remarks:   string;
}

interface B2BOptions {
  partyB:    string;        // till or paybill number
  amount:    number;
  accountRef?: string;      // paybill account reference
  reference: string;
  remarks:   string;
  type:      "till" | "paybill";
}

export class DarajaService {
  private readonly sandbox: boolean;
  private readonly base: string;
  private readonly client: AxiosInstance;

  private accessToken:   string | null = null;
  private tokenExpiry:   number        = 0;

  constructor() {
    this.sandbox = process.env.DARAJA_SANDBOX === "true";
    this.base    = this.sandbox
      ? "https://sandbox.safaricom.co.ke"
      : "https://api.safaricom.co.ke";

    this.client = axios.create({ baseURL: this.base, timeout: 30_000 });
  }

  // ── OAuth token (cached, auto-refreshed) ─────────────────────────────────
  private async token(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry - 60_000) {
      return this.accessToken;
    }

    const key    = process.env.DARAJA_CONSUMER_KEY!;
    const secret = process.env.DARAJA_CONSUMER_SECRET!;
    const creds  = Buffer.from(`${key}:${secret}`).toString("base64");

    const { data } = await this.client.get(
      "/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${creds}` } }
    );

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + parseInt(data.expires_in) * 1000;
    return this.accessToken!;
  }

  // ── B2C: send to personal M-Pesa phone number ────────────────────────────
  async sendB2C(opts: B2COptions): Promise<DarajaTransferResult> {
    const token = await this.token();

    const phone = opts.phone.replace(/^\+/, "").replace(/^0/, "254");

    const payload = {
      OriginatorConversationID: `AVR-${opts.reference}-${Date.now()}`,
      InitiatorName:            process.env.DARAJA_INITIATOR_NAME!,
      SecurityCredential:       process.env.DARAJA_SECURITY_CREDENTIAL!,
      CommandID:                "BusinessPayment",
      Amount:                   Math.round(opts.amount),
      PartyA:                   process.env.DARAJA_SHORTCODE!,
      PartyB:                   phone,
      Remarks:                  opts.remarks.slice(0, 100),
      QueueTimeOutURL:          process.env.DARAJA_TIMEOUT_URL!,
      ResultURL:                process.env.DARAJA_B2C_RESULT_URL!,
      Occasion:                 opts.reference.slice(0, 100),
    };

    logger.info({ paymentRef: opts.reference, phone, amount: opts.amount }, "Daraja B2C initiated");

    const { data } = await this.client.post(
      "/mpesa/b2c/v3/paymentrequest",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.ResponseCode !== "0") {
      throw new Error(`Daraja B2C failed: [${data.ResponseCode}] ${data.ResponseDescription}`);
    }

    return {
      conversationId:          data.ConversationID,
      originatorConversationId: data.OriginatorConversationID,
    };
  }

  // ── B2B: send to Till or Paybill ─────────────────────────────────────────
  async sendB2B(opts: B2BOptions): Promise<DarajaTransferResult> {
    const token = await this.token();

    // CommandID: BusinessBuyGoods → till,  BusinessPayBill → paybill
    const commandID = opts.type === "till" ? "BusinessBuyGoods" : "BusinessPayBill";
    // ReceiverIdentifierType: 2 = Till,  4 = Paybill
    const receiverType = opts.type === "till" ? "2" : "4";

    const payload: Record<string, string | number> = {
      Initiator:              process.env.DARAJA_INITIATOR_NAME!,
      SecurityCredential:     process.env.DARAJA_SECURITY_CREDENTIAL!,
      CommandID:              commandID,
      SenderIdentifierType:   "4",         // 4 = Paybill/Shortcode (your account)
      ReceiverIdentifierType: receiverType,
      Amount:                 Math.round(opts.amount),
      PartyA:                 process.env.DARAJA_SHORTCODE!,
      PartyB:                 opts.partyB,
      AccountReference:       (opts.accountRef ?? opts.reference).slice(0, 12),
      Remarks:                opts.remarks.slice(0, 100),
      QueueTimeOutURL:        process.env.DARAJA_TIMEOUT_URL!,
      ResultURL:              process.env.DARAJA_B2B_RESULT_URL!,
    };

    logger.info(
      { paymentRef: opts.reference, partyB: opts.partyB, type: opts.type, amount: opts.amount },
      "Daraja B2B initiated"
    );

    const { data } = await this.client.post(
      "/mpesa/b2b/v1/paymentrequest",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.ResponseCode !== "0") {
      throw new Error(`Daraja B2B failed: [${data.ResponseCode}] ${data.ResponseDescription}`);
    }

    return {
      conversationId:           data.ConversationID,
      originatorConversationId: data.OriginatorConversationID,
    };
  }

  // ── Check if Daraja is configured ────────────────────────────────────────
  static isConfigured(): boolean {
    return !!(
      process.env.DARAJA_CONSUMER_KEY &&
      process.env.DARAJA_CONSUMER_SECRET &&
      process.env.DARAJA_SHORTCODE &&
      process.env.DARAJA_INITIATOR_NAME &&
      process.env.DARAJA_SECURITY_CREDENTIAL &&
      process.env.DARAJA_B2C_RESULT_URL &&
      process.env.DARAJA_B2B_RESULT_URL &&
      process.env.DARAJA_TIMEOUT_URL
    );
  }
}

export const darajaService = new DarajaService();
