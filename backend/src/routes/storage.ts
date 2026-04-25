import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "stream";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from "@workspace/api-zod";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";
import { ObjectPermission } from "../lib/objectAcl";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

function localObjectIdFromWildcard(wildcardPath: string): string | null {
  if (!wildcardPath.startsWith("local/")) return null;
  const id = wildcardPath.slice("local/".length);
  if (!id) return null;
  // Keep it strict: only UUID-ish / safe characters.
  if (!/^[a-zA-Z0-9-]+$/.test(id)) return null;
  return id;
}

function getLocalStoragePaths(id: string): { dataPath: string; metaPath: string } {
  const dir = objectStorageService.getLocalObjectDir();
  return {
    dataPath: path.join(dir, id),
    metaPath: path.join(dir, `${id}.json`),
  };
}

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 */
router.post("/storage/uploads/request-url", async (req: Request, res: Response) => {
  const parsed = RequestUploadUrlBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required fields" });
    return;
  }

  try {
    const { name, size, contentType } = parsed.data;

    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

    res.json(
      RequestUploadUrlResponse.parse({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Error generating upload URL");
    const nodeEnv = process.env["NODE_ENV"] ?? "development";
    const includeDetails = nodeEnv !== "production" || !process.env["REPL_ID"];
    res.status(500).json({
      error: "Failed to generate upload URL",
      ...(includeDetails
        ? {
            detail:
              error instanceof Error
                ? error.message
                : typeof error === "string"
                  ? error
                  : JSON.stringify(error),
          }
        : {}),
    });
  }
});

/**
 * PUT /storage/uploads/local/:id
 *
 * Local development upload endpoint (non-Replit).
 * The frontend uploads raw bytes to this endpoint using the returned uploadURL.
 */
router.put("/storage/uploads/local/:id", async (req: Request, res: Response) => {
  const id = String(req.params.id || "");
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    res.status(400).json({ error: "Invalid upload id" });
    return;
  }

  try {
    const { dataPath, metaPath } = getLocalStoragePaths(id);
    await fsp.mkdir(path.dirname(dataPath), { recursive: true });

    const contentType = String(req.headers["content-type"] ?? "application/octet-stream");

    await new Promise<void>((resolve, reject) => {
      const stream = fs.createWriteStream(dataPath);
      stream.once("error", reject);
      stream.once("finish", resolve);
      req.pipe(stream);
    });

    await fsp.writeFile(
      metaPath,
      JSON.stringify({ contentType, createdAt: new Date().toISOString() }),
      "utf8",
    );

    res.status(200).json({ ok: true, objectPath: `/objects/local/${id}` });
  } catch (error) {
    req.log.error({ err: error }, "Error in local upload");
    res.status(500).json({ error: "Failed to store upload" });
  }
});

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 * IMPORTANT: Always provide this endpoint when object storage is set up.
 */
router.get("/storage/public-objects/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;
    const file = await objectStorageService.searchPublicObject(filePath);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const response = await objectStorageService.downloadObject(file);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    req.log.error({ err: error }, "Error serving public object");
    res.status(500).json({ error: "Failed to serve public object" });
  }
});

/**
 * GET /storage/objects/*
 *
 * Serve object entities from PRIVATE_OBJECT_DIR.
 * These are served from a separate path from /public-objects and can optionally
 * be protected with authentication or ACL checks based on the use case.
 */
router.get("/storage/objects/*path", async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join("/") : raw;
    const objectPath = `/objects/${wildcardPath}`;

    const localId = localObjectIdFromWildcard(wildcardPath);
    if (localId) {
      const { dataPath, metaPath } = getLocalStoragePaths(localId);
      if (!fs.existsSync(dataPath)) {
        res.status(404).json({ error: "Object not found" });
        return;
      }

      let contentType = "application/octet-stream";
      try {
        const meta = JSON.parse(await fsp.readFile(metaPath, "utf8")) as { contentType?: unknown };
        if (typeof meta.contentType === "string" && meta.contentType.trim()) {
          contentType = meta.contentType;
        }
      } catch {
        // ignore
      }

      res.status(200);
      res.setHeader("Content-Type", contentType);
      fs.createReadStream(dataPath).pipe(res);
      return;
    }

    const objectFile = await objectStorageService.getObjectEntityFile(objectPath);

    // --- Protected route example (uncomment when using replit-auth) ---
    // if (!req.isAuthenticated()) {
    //   res.status(401).json({ error: "Unauthorized" });
    //   return;
    // }
    // const canAccess = await objectStorageService.canAccessObjectEntity({
    //   userId: req.user.id,
    //   objectFile,
    //   requestedPermission: ObjectPermission.READ,
    // });
    // if (!canAccess) {
    //   res.status(403).json({ error: "Forbidden" });
    //   return;
    // }

    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, "Object not found");
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

export default router;
