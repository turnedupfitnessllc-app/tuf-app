import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import pantherRouter from "./routes/panther.js";
import jarvisRouter from "./routes/jarvis.js"; // legacy alias — kept for backward compat
import coachingRouter from "./routes/coaching.js";
import voiceRouter from "./routes/voice.js";
import dbRouter from "./routes/database.js";
import videoRouter from "./routes/video.js";
import stripeRouter from "./routes/stripe.js";
import fuelRouter from "./routes/fuel.js";
import mindsetRouter from "./routes/mindset.js";
import programRouter from "./routes/program.js";
import animationRouter from "./routes/animation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Stripe webhook needs raw body BEFORE express.json()
  app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use("/api/panther", pantherRouter); // The Panther System — primary route
  app.use("/api/jarvis", pantherRouter);  // legacy alias — keeps old client calls working
  app.use("/api/coaching", coachingRouter);
  app.use("/api/voice", voiceRouter);
  app.use("/api/db", dbRouter);
  app.use("/api/video", videoRouter);
  app.use("/api/stripe", stripeRouter);
  app.use("/api/fuel", fuelRouter);
  app.use("/api/mindset", mindsetRouter);
  app.use("/api/program", programRouter);
  app.use("/api/animation", animationRouter);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "TUF App Server",
      timestamp: new Date().toISOString(),
    });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`API available at http://localhost:${port}/api/`);
  });
}

startServer().catch(console.error);
