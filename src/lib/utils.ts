import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import { Profile } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#38bdf8'],
    });
  } catch (e) {
    console.log('Confetti triggered', e);
  }
}

/**
 * Generate a standard vCard (.vcf) format string
 */
export function generateVCard(profile: Profile): string {
  const nameParts = profile.displayName.split(' ');
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const firstName = nameParts[0] || profile.displayName;

  let vcard = 'BEGIN:VCARD\r\nVERSION:3.0\r\n';
  vcard += `N:${lastName};${firstName};;;\r\n`;
  vcard += `FN:${profile.displayName}\r\n`;
  if (profile.jobTitle || profile.headline) {
    vcard += `TITLE:${profile.jobTitle || profile.headline}\r\n`;
  }
  if (profile.company) {
    vcard += `ORG:${profile.company}\r\n`;
  }
  if (profile.email) {
    vcard += `EMAIL;type=INTERNET;type=WORK:${profile.email}\r\n`;
  }
  if (profile.phone) {
    vcard += `TEL;type=CELL:${profile.phone}\r\n`;
  }
  if (profile.website) {
    vcard += `URL:${profile.website}\r\n`;
  }
  if (profile.location) {
    vcard += `ADR;type=WORK:;;${profile.location};;;;\r\n`;
  }
  if (profile.bio) {
    vcard += `NOTE:${profile.bio.replace(/\n/g, '\\n')}\r\n`;
  }
  vcard += `URL;type=TapItProfile:${window.location.origin}/@${profile.slug}\r\n`;
  vcard += 'END:VCARD\r\n';

  return vcard;
}

export function downloadVCard(profile: Profile) {
  const vcard = generateVCard(profile);
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${profile.slug}-contact.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return Promise.resolve(successful);
  }
}
