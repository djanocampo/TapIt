import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTapIt } from '../../store';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { MobileFramePreview } from '../../components/profile/MobileFramePreview';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Building, 
  Briefcase, 
  Check, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles,
  Share2,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';
import { triggerConfetti } from '../../lib/utils';

export const ProfileEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profiles, updateProfile, links, activeProfile } = useTapIt();

  const targetProfile = profiles.find((p) => p.id === id) || activeProfile;

  const [formData, setFormData] = useState({
    displayName: targetProfile.displayName || '',
    slug: targetProfile.slug || '',
    headline: targetProfile.headline || '',
    bio: targetProfile.bio || '',
    avatar: targetProfile.avatar || '',
    company: targetProfile.company || '',
    jobTitle: targetProfile.jobTitle || '',
    email: targetProfile.email || '',
    phone: targetProfile.phone || '',
    location: targetProfile.location || '',
    website: targetProfile.website || '',
    linkedin: targetProfile.socials?.linkedin || '',
    github: targetProfile.socials?.github || '',
    twitter: targetProfile.socials?.twitter || '',
    instagram: targetProfile.socials?.instagram || '',
    youtube: targetProfile.socials?.youtube || '',
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (targetProfile) {
      setFormData({
        displayName: targetProfile.displayName || '',
        slug: targetProfile.slug || '',
        headline: targetProfile.headline || '',
        bio: targetProfile.bio || '',
        avatar: targetProfile.avatar || '',
        company: targetProfile.company || '',
        jobTitle: targetProfile.jobTitle || '',
        email: targetProfile.email || '',
        phone: targetProfile.phone || '',
        location: targetProfile.location || '',
        website: targetProfile.website || '',
        linkedin: targetProfile.socials?.linkedin || '',
        github: targetProfile.socials?.github || '',
        twitter: targetProfile.socials?.twitter || '',
        instagram: targetProfile.socials?.instagram || '',
        youtube: targetProfile.socials?.youtube || '',
      });
    }
  }, [targetProfile.id]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsSaved(false);

    // Auto update store for real-time live preview synchronization!
    if (field in targetProfile.socials || ['linkedin', 'github', 'twitter', 'instagram', 'youtube'].includes(field)) {
      updateProfile(targetProfile.id, {
        socials: {
          ...targetProfile.socials,
          [field]: value,
        },
      });
    } else {
      updateProfile(targetProfile.id, {
        [field]: value,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(targetProfile.id, {
      displayName: formData.displayName,
      slug: formData.slug.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      headline: formData.headline,
      bio: formData.bio,
      avatar: formData.avatar,
      company: formData.company,
      jobTitle: formData.jobTitle,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      website: formData.website,
      socials: {
        linkedin: formData.linkedin,
        github: formData.github,
        twitter: formData.twitter,
        instagram: formData.instagram,
        youtube: formData.youtube,
      },
    });

    setIsSaved(true);
    triggerConfetti();
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/profiles" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white font-display flex items-center gap-2">
              Editing: {targetProfile.name} Profile
            </h2>
            <p className="text-xs text-slate-400">
              Live updates reflect on your public profile and NFC tap endpoints in real-time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/@${targetProfile.slug}`} target="_blank">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Open Public Profile
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            leftIcon={isSaved ? <Check className="w-4 h-4 text-slate-950" /> : undefined}
          >
            {isSaved ? 'Changes Saved!' : 'Save Profile'}
          </Button>
        </div>
      </div>

      {/* Split-Screen: Editor (Left) & Real-Time Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-6">
          {/* Identity & Bio */}
          <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Public Identity & Bio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Display Name"
                value={formData.displayName}
                onChange={(e) => handleChange('displayName', e.target.value)}
                required
              />
              <Input
                label="Custom URL Slug"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                helperText={`tapit.app/@${formData.slug}`}
                required
              />
            </div>

            <Input
              label="Avatar Image URL"
              value={formData.avatar}
              onChange={(e) => handleChange('avatar', e.target.value)}
              placeholder="https://..."
            />

            <Input
              label="Headline / Tagline"
              value={formData.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              placeholder="e.g. Information Systems Student | QA Tester | Systems Analyst"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                About / Bio
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="w-full rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                placeholder="Share your background, open opportunities, and specializations..."
              />
            </div>
          </div>

          {/* Professional & Contact Info */}
          <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-400" />
              Professional & Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Job Title"
                value={formData.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
                leftIcon={<Briefcase className="w-4 h-4" />}
                placeholder="e.g. QA Engineer"
              />
              <Input
                label="Company / Org"
                value={formData.company}
                onChange={(e) => handleChange('company', e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
                placeholder="e.g. Nexus Tech Systems"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Phone Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                leftIcon={<MapPin className="w-4 h-4" />}
                placeholder="e.g. Metro Manila, Philippines"
              />
              <Input
                label="Personal Website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                leftIcon={<Globe className="w-4 h-4" />}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="bg-[#0d1322] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              Social Media Accounts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="LinkedIn Profile URL"
                value={formData.linkedin}
                onChange={(e) => handleChange('linkedin', e.target.value)}
                leftIcon={<Linkedin className="w-4 h-4" />}
                placeholder="https://linkedin.com/in/..."
              />
              <Input
                label="GitHub Profile URL"
                value={formData.github}
                onChange={(e) => handleChange('github', e.target.value)}
                leftIcon={<Github className="w-4 h-4" />}
                placeholder="https://github.com/..."
              />
              <Input
                label="X / Twitter URL"
                value={formData.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                leftIcon={<Twitter className="w-4 h-4" />}
                placeholder="https://x.com/..."
              />
              <Input
                label="Instagram URL"
                value={formData.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                leftIcon={<Instagram className="w-4 h-4" />}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </form>

        {/* Real-Time Live Preview Frame */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Real-Time Phone Preview
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync
            </span>
          </div>

          <MobileFramePreview
            profile={targetProfile}
            links={links}
          />
        </div>
      </div>
    </div>
  );
};
