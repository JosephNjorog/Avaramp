# ── shared / middleware / rateLimit.ts ────────────────────────
cat > backend / src / shared / middleware / rateLimit.ts << 'EOF'
import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    message: { error: "Too many requests, please try again later." },
});

export const paymentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10,
    message: { error: "Payment rate limit exceeded." },
});
