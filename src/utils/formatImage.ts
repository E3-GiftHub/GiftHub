export default function formatImage(
  picture: string | null | undefined,
  defaultPicture: string,
): string {
  if (undefined === picture) return defaultPicture;
  if (!picture) return defaultPicture;
  if (picture === "") return defaultPicture;
  return picture;
}
