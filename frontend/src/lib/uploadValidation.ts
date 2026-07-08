const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

function getFileExtension(fileName: string) {
  const trimmed = fileName.trim();
  const parts = trimmed.split(".");
  if (parts.length < 2) return "";
  return parts.pop()?.toLowerCase() ?? "";
}

export function validateImageFile(file: File): string | null {
  const contentType = file.type.toLowerCase();
  const extension = getFileExtension(file.name);

  if (!contentType.startsWith("image/")) {
    return "يسمح فقط برفع ملفات الصور";
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(contentType)) {
    return "صيغة الصورة غير مدعومة. الصيغ المسموحة: JPG, JPEG, PNG, WEBP, GIF";
  }

  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    return "امتداد الملف غير صالح. الصيغ المسموحة: JPG, JPEG, PNG, WEBP, GIF";
  }

  return null;
}
