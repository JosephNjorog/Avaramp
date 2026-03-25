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
}
