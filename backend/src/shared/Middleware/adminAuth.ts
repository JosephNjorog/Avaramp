import { Request, Response, NextFunction } from "express";
import { prisma } from "../database/prisma";

// Verify ADMIN role from the database on every request, not just the JWT claim.
// This means a demoted admin loses access immediately without waiting for token expiry.
export async function adminAuth(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user?.sub) {
    return res.status(403).json({ success: false, error: "Forbidden: Admin access required", code: "FORBIDDEN" });
  }
  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.sub }, select: { role: true } });
    if (!dbUser || dbUser.role !== "ADMIN") {
      return res.status(403).json({ success: false, error: "Forbidden: Admin access required", code: "FORBIDDEN" });
    }
    next();
  } catch {
    return res.status(500).json({ success: false, error: "Internal server error", code: "SERVER_ERROR" });
  }
}
