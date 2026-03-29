import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../Utils/Errors";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new UnauthorizedError());
  }
  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = payload;
    next();
  } catch {
    next(new UnauthorizedError());
  }
}
