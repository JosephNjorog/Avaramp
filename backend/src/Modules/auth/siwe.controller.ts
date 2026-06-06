import { Request, Response, NextFunction } from "express";
import { SiweService } from "./siwe.service";
import { z } from "zod";
import { ValidationError } from "../../shared/Utils/Errors";

const service = new SiweService();

const verifySchema = z.object({
  address:   z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid address"),
  message:   z.string().min(1),
  signature: z.string().regex(/^0x[0-9a-fA-F]+$/, "Invalid signature"),
});

const updateSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export class SiweController {
  async nonce(req: Request, res: Response, next: NextFunction) {
    try {
      const address = req.query.address as string;
      if (!address) throw new ValidationError("address query param required");
      const result = await service.getNonce(address);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = verifySchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
      const result = await service.verify(parsed.data);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async profile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.sub;
      const result = await service.getProfile(userId);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.sub;
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.errors[0].message);
      const result = await service.updateProfile(userId, parsed.data);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}
