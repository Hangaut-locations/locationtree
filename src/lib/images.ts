// The API receives photos as text fields, and multer rejects any field over 1 MB.
const MAX_DATA_URL_LENGTH = 900_000;

const readAsDataURL = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

/** Resizes and re-encodes a photo as a JPEG data URL small enough to upload. */
export const compressImage = async (file: File): Promise<string> => {
  const original = await readAsDataURL(file);
  const image = await loadImage(original);

  let maxSide = 1600;
  let quality = 0.82;
  let result = original;

  for (let attempt = 0; attempt < 6; attempt++) {
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    result = canvas.toDataURL("image/jpeg", quality);

    if (result.length <= MAX_DATA_URL_LENGTH) return result;
    maxSide = Math.round(maxSide * 0.8);
    quality = Math.max(0.5, quality - 0.08);
  }

  return result;
};
