/**
 * TapIt Sovereign Identity Engine
 * Minimalist Card Activation Sticker Generator.
 * 
 * Optimized specifically for physical printing and sticking onto physical NFC cards.
 * Contains ONLY:
 * 1. TapIt branding
 * 2. Name of the user
 * 3. High-contrast QR code
 * 4. Small text: "scan me first to finish registration"
 */

export interface VoucherData {
  userName: string;
  cardToken?: string;
  material?: string;
  inviteToken?: string;
  inviteUrl: string;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Convert an HTMLCanvasElement or SVGSVGElement into an image source.
 */
async function resolveQRImageSource(
  source: HTMLCanvasElement | SVGSVGElement
): Promise<CanvasImageSource> {
  if (source instanceof HTMLCanvasElement) {
    return source;
  }

  const svgData = new XMLSerializer().serializeToString(source);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  URL.revokeObjectURL(url);
  return img;
}

/**
 * Creates a clean, minimalist card sticker canvas.
 * Dimensions: 600 x 680 px (ultra crisp, perfectly proportioned for physical card sticker printing).
 */
export async function createVoucherCanvas(
  qrElement: HTMLCanvasElement | SVGSVGElement,
  data: VoucherData,
  theme: 'light' | 'dark' = 'light'
): Promise<HTMLCanvasElement> {
  const qrImage = await resolveQRImageSource(qrElement);

  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  const width = canvas.width;
  const height = canvas.height;
  const isDark = theme === 'dark';

  // 1. Background
  if (isDark) {
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, width, height);

    // Subtle outer border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    drawRoundRect(ctx, 16, 16, width - 32, height - 32, 24);
    ctx.stroke();
  } else {
    // Clean, crisp white background (ideal for physical sticker printing - no ink bleeding)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle outer border (acts as a peel / cut guide when printing)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    drawRoundRect(ctx, 16, 16, width - 32, height - 32, 24);
    ctx.stroke();
  }

  // 2. TapIt Branding (Centered at top)
  // Cyan brand accent dot
  ctx.beginPath();
  ctx.arc(245, 52, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#06b6d4';
  ctx.fill();

  // "TAPIT"
  ctx.textAlign = 'left';
  ctx.fillStyle = isDark ? '#ffffff' : '#0a0f1d';
  ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('TAPIT', 260, 60);

  // 3. Name of the User
  ctx.textAlign = 'center';
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.font = '800 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const displayName = data.userName?.trim() || 'New Member';
  ctx.fillText(displayName, width / 2, 102);

  // 4. Large, High-Contrast QR Code
  const qrBoxSize = 360;
  const qrBoxX = (width - qrBoxSize) / 2; // 120
  const qrBoxY = 126;

  // Pure white card backing for QR code
  ctx.fillStyle = '#ffffff';
  drawRoundRect(ctx, qrBoxX - 8, qrBoxY - 8, qrBoxSize + 16, qrBoxSize + 16, 20);
  ctx.fill();

  // Fine border around QR card for crisp visual framing
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw the QR code
  ctx.drawImage(qrImage, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize);

  // 5. Small Call-to-Action Text: "scan me first to finish registration"
  const pillW = 420;
  const pillH = 46;
  const pillX = (width - pillW) / 2;
  const pillY = 530;

  ctx.fillStyle = isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.08)';
  ctx.strokeStyle = isDark ? 'rgba(6, 182, 212, 0.45)' : 'rgba(6, 182, 212, 0.35)';
  ctx.lineWidth = 1.5;
  drawRoundRect(ctx, pillX, pillY, pillW, pillH, 23);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
  ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('scan me first to finish registration', width / 2, pillY + 28);

  return canvas;
}

/**
 * Triggers a browser download of the minimal card sticker PNG.
 */
export async function downloadQRVoucher(
  qrElement: HTMLCanvasElement | SVGSVGElement,
  data: VoucherData,
  theme: 'light' | 'dark' = 'light'
): Promise<void> {
  const canvas = await createVoucherCanvas(qrElement, data, theme);
  const dataUrl = canvas.toDataURL('image/png');

  const cleanName = (data.userName || 'member')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = `tapit-sticker-${cleanName}.png`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
