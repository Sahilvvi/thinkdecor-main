/**
 * Shrinks a room photo before it's sent anywhere. Phone photos are often
 * 3-8 MB / 12 MP, but Gemini's output is ~1 MP, so anything past ~1536px on
 * the long edge only makes the upload and the model slower without making
 * the result any better. Falls back to the original file if the browser
 * can't decode it (the server still validates type and size).
 */
export const MAX_SEND_DIMENSION = 1536;

export async function downscaleImage(
  file: Blob,
  { maxDimension = MAX_SEND_DIMENSION, quality = 0.88 }: { maxDimension?: number; quality?: number } = {},
): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    // Already small and already a JPEG: re-encoding would only lose quality.
    if (scale === 1 && file.type === 'image/jpeg') return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    // Keep whichever is smaller — a tiny PNG can beat its JPEG re-encode.
    return blob && blob.size < file.size ? blob : file;
  } finally {
    bitmap.close();
  }
}

/** Same as downscaleImage, but keeps a File (name + type) for storage uploads. */
export async function downscaleFile(file: File): Promise<File> {
  const blob = await downscaleImage(file);
  if (blob === file) return file;
  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}
