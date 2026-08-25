import React, { useState } from 'react';
import { Profile } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QRCodeGenerator } from '../qr/QRCodeGenerator';
import { Copy, Check, Share2, Smartphone, Download } from 'lucide-react';
import { copyToClipboard, downloadVCard } from '../../lib/utils';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const [copied, setCopied] = useState(false);
  const profileUrl = `${window.location.origin}/@${profile.slug}`;

  const handleCopy = async () => {
    await copyToClipboard(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.displayName} - TapIt Digital Identity`,
        text: profile.headline,
        url: profileUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share TapIt Profile"
      description="Anyone who taps your NFC card or scans this QR code will see your profile instantly."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* QR Code */}
        <QRCodeGenerator
          url={profileUrl}
          title={profile.displayName}
          subtitle={profile.headline}
          fgColor={profile.theme.accentColor || '#06b6d4'}
          bgColor="#070a13"
          size={180}
          showDownloadButtons={false}
        />

        {/* URL Pill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <div className="truncate font-mono text-cyan-400 font-medium">
            {profileUrl}
          </div>
          <Button
            variant="outline"
            size="xs"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => downloadVCard(profile)}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Save vCard (.vcf)
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleNativeShare}
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Native Share
          </Button>
        </div>
      </div>
    </Modal>
  );
};
