import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/_debug", (_req, res) => {
  const nodeEnv = process.env["NODE_ENV"] ?? "development";
  if (nodeEnv === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const storage = new ObjectStorageService();
  res.json({
    nodeEnv,
    hasReplId: Boolean(process.env["REPL_ID"]),
    objectStorageMode: (process.env["OBJECT_STORAGE_MODE"] ?? "").trim() || "auto",
    localObjectStorageDir: storage.getLocalObjectDir(),
  });
});

export default router;
