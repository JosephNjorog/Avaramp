import express        from "express";
import cors           from "cors";
import helmet         from "helmet";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({
    status:    "ok",
    service:   "avaramp-backend",
    timestamp: new Date().toISOString(),
  });
});

// Placeholder — routes added as modules are completed
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    success: false,
    error:   err.message || "Internal server error",
  });
});

export { app };
