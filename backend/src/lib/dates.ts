export function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();

  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  // Defensive fallback: avoid throwing in API serializers.
  // If this triggers, it indicates a schema mismatch or unexpected driver parser.
  return new Date(0).toISOString();
}

