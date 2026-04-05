import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

const service = new UserService();

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.createUser(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.getUser(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  // GET /users/me — returns the authenticated user's profile
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const result = await service.getUser(userId);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  // PATCH /users/me — update profile fields
  async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const result = await service.updateUser(userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }

  // GET /users/me/webhooks — paginated webhook delivery log
  async webhooks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.sub;
      const limit  = Math.min(parseInt(req.query.limit  as string) || 50, 200);
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await service.getWebhookDeliveries(userId, limit, offset);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
}
