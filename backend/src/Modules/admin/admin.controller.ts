import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";

const svc = new AdminService();

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ── Merchants ─────────────────────────────────────────────────────────────────

export async function getMerchants(req: Request, res: Response, next: NextFunction) {
  try {
    const page   = parseInt(req.query.page as string)  || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const data   = await svc.getMerchants(page, limit, search);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

export async function getMerchantById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getMerchantById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateMerchant(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.updateMerchant(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ── Payments ──────────────────────────────────────────────────────────────────

export async function getPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const page   = parseInt(req.query.page as string)  || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const filters = {
      status:     req.query.status     as string | undefined,
      merchantId: req.query.merchantId as string | undefined,
      currency:   req.query.currency   as string | undefined,
      search:     req.query.search     as string | undefined,
    };
    const data = await svc.getPayments(page, limit, filters);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

export async function getPaymentById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getPaymentById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page   = parseInt(req.query.page as string)  || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const data   = await svc.getUsers(page, limit, search);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

export async function updateUserKyc(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.updateUserKyc(req.params.id, req.body.kycStatus);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function makeUserAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.makeUserAdmin(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ── Financials ────────────────────────────────────────────────────────────────

export async function getFinancials(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getFinancials();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ── Settlements ───────────────────────────────────────────────────────────────

export async function getSettlements(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getSettlements();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ── Webhooks ──────────────────────────────────────────────────────────────────

export async function getWebhooks(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = parseInt(req.query.page as string)  || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data  = await svc.getWebhooks(page, limit);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

export async function retryWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.retryWebhook(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ── Consent ───────────────────────────────────────────────────────────────────

export async function getConsentRecords(req: Request, res: Response, next: NextFunction) {
  try {
    const page   = parseInt(req.query.page as string)  || 1;
    const limit  = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const data   = await svc.getConsentRecords(page, limit, search);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
}

export async function exportConsentCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const csv = await svc.exportConsentCsv();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="consent-records.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
