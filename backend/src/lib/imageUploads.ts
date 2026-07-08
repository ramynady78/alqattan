import fs from "node:fs/promises";
import path from "node:path";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ALLOWED_STATIC_IMAGE_PATHS = new Set(["/api/static/placeholder.svg"]);

const objectStorageService = new ObjectStorageService();

function isAllowedImageMimeType(contentType: string | null | undefined) {
  if (!contentType) return false;
  return ALLOWED_IMAGE_MIME_TYPES.has(contentType.trim().toLowerCase());
}

function isAllowedImageExtension(value: string) {
  const parsed = new URL(value, "http://local.test");
  const extension = path.extname(parsed.pathname).toLowerCase();
  return ALLOWED_IMAGE_EXTENSIONS.has(extension);
}

async function readLocalObjectContentType(objectPath: string) {
  const id = objectPath.replace("/objects/local/", "").trim();
  if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) return null;

  const dir = objectStorageService.getLocalObjectDir();
  const metaPath = path.join(dir, `${id}.json`);

  try {
    const meta = JSON.parse(await fs.readFile(metaPath, "utf8")) as { contentType?: unknown };
    return typeof meta.contentType === "string" ? meta.contentType : null;
  } catch {
    return null;
  }
}

async function isStoredImageObject(objectPath: string) {
  if (ALLOWED_STATIC_IMAGE_PATHS.has(objectPath)) {
    return true;
  }

  if (objectPath.startsWith("/objects/local/")) {
    return isAllowedImageMimeType(await readLocalObjectContentType(objectPath));
  }

  if (objectPath.startsWith("/objects/")) {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      const [metadata] = await objectFile.getMetadata();
      const contentType = typeof metadata.contentType === "string" ? metadata.contentType : null;
      return isAllowedImageMimeType(contentType);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) return false;
      throw error;
    }
  }

  return isAllowedImageExtension(objectPath);
}

export async function assertValidImageObjectPath(
  objectPath: string | null | undefined,
  required = false,
) {
  const value = typeof objectPath === "string" ? objectPath.trim() : "";
  if (!value) {
    if (required) {
      const error = new Error("Only image files are allowed");
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }
    return;
  }

  const isValid = await isStoredImageObject(value);
  if (!isValid) {
    const error = new Error("Only image files are allowed");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }
}

export async function assertValidImageObjectPaths(paths: string[] | null | undefined) {
  const values = Array.isArray(paths) ? paths : [];
  for (const value of values) {
    await assertValidImageObjectPath(value, true);
  }
}
