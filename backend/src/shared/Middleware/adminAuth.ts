import { Request, Response, NextFunction } from "express";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      error: "Forbidden: Admin access required",
      code: "FORBIDDEN",
    });
  }
  next();
}
