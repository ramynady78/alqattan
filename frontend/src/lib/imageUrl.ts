export function toImageUrl(objectPath: string | null): string {
  if (!objectPath) return "";
  if (objectPath.startsWith("http")) return objectPath;
  if (objectPath.startsWith("/static/")) return `/api${objectPath}`;
  return `/api/storage${objectPath}`;
}
