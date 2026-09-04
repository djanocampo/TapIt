/**
 * Canvas utility for cropping, rotating, and scaling images using react-easy-crop coordinates.
 * Generates an optimized, crisp 512x512 square image (JPEG/WebP) ideal for circular avatars.
 */

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    // Required to prevent tainted canvas with cross-origin images
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FlipOptions {
  horizontal: boolean;
  vertical: boolean;
}

export interface CroppedImageResult {
  dataUrl: string;
  blob: Blob;
}

/**
 * Crops and rotates an image onto an HTML5 Canvas, returning both a base64 Data URL and a binary Blob.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  flip: FlipOptions = { horizontal: false, vertical: false },
  outputSize = 512
): Promise<CroppedImageResult> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context is not supported');
  }

  const rotRad = getRadianAngle(rotation);

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas center to image center to allow rotating and flipping
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);

  // Create cropped canvas
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Cropped canvas 2D context is not supported');
  }

  // Set output dimensions (512x512 delivers crisp clarity while keeping filesize compact)
  croppedCanvas.width = outputSize;
  croppedCanvas.height = outputSize;

  croppedCtx.imageSmoothingEnabled = true;
  croppedCtx.imageSmoothingQuality = 'high';

  // Draw the selected crop region onto the output canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob conversion failed'));
          return;
        }
        const dataUrl = croppedCanvas.toDataURL('image/jpeg', 0.92);
        resolve({ dataUrl, blob });
      },
      'image/jpeg',
      0.92
    );
  });
}
