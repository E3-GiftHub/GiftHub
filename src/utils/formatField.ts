export default function formatField(field: string | null | undefined): string {
  if (undefined === field) return "undefined";
  if (!field) return "not-set";
  if (field === "") return "not-set";
  return field;
}
