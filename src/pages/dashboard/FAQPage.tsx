import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  CreditCard, 
  UserSquare2, 
  Link2, 
  QrCode, 
  BarChart3, 
  Smartphone, 
  Download, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Radio, 
  Settings,
  ArrowRight
} from 'lucide-react';
import { BitsInfinityEmblem } from '../../components/common/BitsBrandElements';
import { Button } from '../../components/ui/Button';

interface FAQItem {
  id: string;
  category: 'cards' | 'profiles' | 'contacts' | 'qr' | 'account';
  question: string;
  shortAnswer: string;
  detailedAnswer: React.ReactNode;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: 'q1-card-destination',
    category: 'cards',
    question: 'Can I change what profile opens when someone taps my physical card without buying a new one?',
    shortAnswer: 'Yes, absolutely—and it happens instantly without replacing or reprogramming the card chip.',
    detailedAnswer: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <p>
          <strong className="text-white">Yes, absolutely—and it happens instantly!</strong> Your physical TapIt card is powered by dynamic cloud routing, meaning you never need to purchase a replacement card or reprogram the physical chip.
        </p>
        <div className="bg-[#050c18] border border-white/[0.08] rounded-2xl p-4 space-y-2">
          <p className="font-semibold text-cyan-300 text-xs uppercase tracking-wider">How to switch your card destination:</p>
          <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
            <li>Go to <strong className="text-white">My NFC Cards</strong> in the sidebar (or tap <strong className="text-white">Cards</strong> on mobile).</li>
            <li>On your card preview, find the dropdown labeled <strong className="text-cyan-400">&quot;When tapped, open:&quot;</strong>.</li>
            <li>Select any profile you want (such as switching from your <em>Work Profile</em> to your <em>Personal Profile</em>).</li>
          </ol>
        </div>
        <p className="text-xs text-slate-400">
          The change goes live immediately worldwide. The very next person who taps your physical card will see your newly selected profile.
        </p>
      </div>
    ),
  },
  {
    id: 'q2-save-contact',
    category: 'contacts',
    question: 'How do new connections save my contact details directly to their phone?',
    shortAnswer: 'They simply tap the "Save Contact (.vcf)" button on your profile, and their phone opens their native contacts app.',
    detailedAnswer: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <p>
          When someone taps your card or scans your QR code, your public profile opens directly in their browser. They tap the primary button labeled <strong className="text-cyan-400">Save Contact (.vcf)</strong> (also pinned on the mobile floating action bar at the bottom).
        </p>
        <p>
          Their phone will immediately launch their native Contacts app (Apple Contacts or Google Contacts) with your full name, phone number, email address, company, job title, and website pre-filled. They simply press <strong className="text-white">Save</strong>—no manual typing required!
        </p>
      </div>
    ),
  },
  {
    id: 'q3-no-app-needed',
    category: 'contacts',
    question: 'Does the other person need to download the TapIt app to view my card?',
    shortAnswer: 'No app or account is required. TapIt works 100% natively in any smartphone web browser.',
    detailedAnswer: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <p>
          <strong className="text-white">No app or registration is required!</strong> TapIt is completely frictionless.
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
          <li><strong>For NFC Tapping:</strong> On modern iPhones and Android smartphones, the recipient holds their phone near your physical card and a notification appears automatically.</li>
          <li><strong>For QR Codes:</strong> The recipient can scan your matrix code with their regular smartphone camera app.</li>
        </ul>
        <p className="text-xs text-slate-400">
          Your public profile opens in Safari, Chrome, or their default web browser instantly.
        </p>
      </div>
    ),
  },
  {
    id: 'q4-profiles-vs-links',
    category: 'profiles',
    question: 'What is the difference between "My Profiles" and "Link Manager"?',
    shortAnswer: '"My Profiles" manages your high-level personas, while "Link Manager" manages the specific destination buttons within each persona.',
    detailedAnswer: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <p>
          Think of them in two simple layers:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#050c18] border border-white/[0.08]">
            <p className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <UserSquare2 className="w-3.5 h-3.5" />
              My Profiles (Personas)
            </p>
            <p className="text-slate-400 leading-relaxed">
              Your overall digital identities (e.g., Executive Business, Creative Portfolio, or Personal Social). Each has its own avatar photo, bio, color theme, and unique web link (<code className="text-cyan-400 font-mono">/@your-slug</code>).
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#050c18] border border-white/[0.08]">
            <p className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Link Manager (Destinations)
            </p>
            <p className="text-slate-400 leading-relaxed">
              The individual interactive buttons (LinkedIn, Instagram, WhatsApp, Calendly, Portfolio) that appear inside whichever profile is currently active.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'q5-lost-card',
    category: 'cards',
    question: 'What should I do if my physical TapIt card gets lost or misplaced?',
    shortAnswer: 'Go to My NFC Cards and flip the status toggle from Active to Disabled in seconds.',
    detailedAnswer: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <p>
          You can protect your personal information immediately without waiting for customer support:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-300">
          <li>Navigate to <strong className="text-white">My NFC Cards</strong> (or tap <strong className="text-white">Cards</strong> on mobile).</li>
          <li>Locate your card and switch the status toggle from <strong className="text-emerald-400">Active</strong> to <strong className="text-rose-400">Disabled</strong>.</li>
        </ol>
        <p className="text-xs text-slate-400">
          Anyone who taps the disabled card will see a secure holding screen indicating that the card is currently paused. When you locate your card, switch it back to <strong className="text-emerald-400">Active</strong> to instantly restore functionality.
        </p>
      </div>
    ),
  },
  {
    id: 'q6-qr-codes',
    category: 'qr',
    question: 'Where can I get a QR code for printed flyers, booth banners, or digital presentations?',
    shortAnswer: 'Go to QR Code Studio, select your profile, and download For Screens (PNG) or For Print (SVG).',
    detailedAnswer: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <p>
          In your dashboard, click <strong className="text-white">QR Code Studio</strong> (or tap <strong className="text-white">More</strong> → <strong className="text-white">QR Code Studio</strong> on mobile):
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
          <li>Under <strong className="text-white">&quot;1. Choose Profile Target:&quot;</strong>, tap which profile you want to generate a code for.</li>
          <li>Click <strong className="text-cyan-400">For Screens (PNG)</strong> for high-resolution images to place in email signatures, LinkedIn posts, or slide decks.</li>
          <li>Click <strong className="text-purple-400">For Print (SVG)</strong> for infinite-resolution vector graphics ready for print shops, business cards, roll-up banners, and merchandise.</li>
          <li>Click <strong className="text-white">Printable Sheet</strong> to generate an instant cut-out card matrix directly from your browser printer.</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'q7-multiple-cards',
    category: 'cards',
    question: 'Can I connect more than one physical TapIt card to my account?',
    shortAnswer: 'Yes! Multiple cards or smart tags appear independently in your dashboard and can point to different profiles.',
    detailedAnswer: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <p>
          <strong className="text-white">Yes!</strong> If you own multiple TapIt hardware products (such as a card in your wallet, an extra card for trade shows, or a smart keychain fob), each one appears separately under <strong className="text-white">My NFC Cards</strong> (or <strong className="text-white">Cards</strong> on mobile).
        </p>
        <p className="text-xs text-slate-400">
          You can assign each card to open a completely different profile independently, or have them all point to the same persona.
        </p>
      </div>
    ),
  },
  {
    id: 'q8-credentials-settings',
    category: 'account',
    question: 'How do I update my account password or login email?',
    shortAnswer: 'Go to Account Settings to update your personal credentials and security password.',
    detailedAnswer: (
      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <p>
          Navigate to <strong className="text-white">Account Settings</strong> in the sidebar (or tap <strong className="text-white">More</strong> → <strong className="text-white">Account Settings</strong> on mobile):
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
          <li>Under <strong className="text-white">Personal Credentials</strong>, update your Full Name, Username, or Email Address and click <strong className="text-cyan-400">Save Account Changes</strong>.</li>
          <li>Under <strong className="text-white">Security & Password</strong>, enter your current password, type your new password, and click <strong className="text-purple-400">Update Password</strong>.</li>
        </ul>
      </div>
    ),
  },
];

export const FAQPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'playbook' | 'faqs'>('playbook');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openAccordionIds, setOpenAccordionIds] = useState<Record<string, boolean>>({
    'q1-card-destination': true,
  });

  const toggleAccordion = (id: string) => {
    setOpenAccordionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortAnswer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-bits-azure/40 via-bits-navy/90 to-bits-midnight border border-bits-vapor/15 shadow-card-bits relative overflow-hidden backdrop-blur-xl">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-bits-cyan bg-bits-azure/30 border border-bits-cyan/30 px-3 py-0.5 rounded-full mb-1">
            <BitsInfinityEmblem size={12} />
            <span>TapIt Client Playbook & Help Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white font-display">
            How-To Guide & Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Everything you need to maximize your physical smart cards, route your digital personas, and save contacts effortlessly.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center p-1.5 rounded-2xl bg-[#050c18]/80 border border-white/[0.08] relative z-10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('playbook')}
            className={`flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
              activeTab === 'playbook'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>6-Step Playbook</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faqs')}
            className={`flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
              activeTab === 'faqs'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Common FAQs</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: 6-STEP NAVIGATION PLAYBOOK
          ======================================================== */}
      {activeTab === 'playbook' && (
        <div className="space-y-6">
          {/* Quick UI Reference Table */}
          <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-5 sm:p-6 shadow-card-bits backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Quick Navigation Terminology Reference
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Desktop vs Mobile Matching</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#050c18] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Profiles</span>
                <p className="text-white font-semibold">Sidebar: <strong className="text-cyan-400">My Profiles</strong></p>
                <p className="text-slate-400 text-[11px]">Mobile Nav: <strong className="text-cyan-400">Profiles</strong></p>
              </div>
              <div className="p-3 rounded-2xl bg-[#050c18] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Link Destinations</span>
                <p className="text-white font-semibold">Sidebar: <strong className="text-cyan-400">Link Manager</strong></p>
                <p className="text-slate-400 text-[11px]">Mobile Nav: <strong className="text-cyan-400">Links</strong></p>
              </div>
              <div className="p-3 rounded-2xl bg-[#050c18] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Smart NFC Cards</span>
                <p className="text-white font-semibold">Sidebar: <strong className="text-cyan-400">My NFC Cards</strong></p>
                <p className="text-slate-400 text-[11px]">Mobile Nav: <strong className="text-cyan-400">Cards</strong></p>
              </div>
              <div className="p-3 rounded-2xl bg-[#050c18] border border-white/[0.06]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">QR Code Studio</span>
                <p className="text-white font-semibold">Sidebar: <strong className="text-cyan-400">QR Code Studio</strong></p>
                <p className="text-slate-400 text-[11px]">Mobile: <strong className="text-cyan-400">More → QR Studio</strong></p>
              </div>
            </div>
          </div>

          {/* 6 Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits flex flex-col justify-between backdrop-blur-xl hover:border-cyan-500/30 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Step 1
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Identity Setup</span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <UserSquare2 className="w-4 h-4 text-cyan-400" />
                  Set Up Your Profile & Digital Card
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Go to <strong className="text-white">My Profiles</strong> (or tap <strong className="text-white">Profiles</strong> on mobile) and click <strong className="text-cyan-400">Edit Details</strong>.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Under the <strong className="text-white">Bio & Details</strong> tab, upload your photo with zoom & crop.</li>
                  <li>Enter your <strong className="text-white">Display Name</strong>, <strong className="text-white">Job Title</strong>, and <strong className="text-white">Headline</strong>.</li>
                  <li>Check <strong className="text-white">Display email address publicly</strong> and <strong className="text-white">Display phone number publicly</strong> so clients can reach you.</li>
                  <li>Click the glowing <strong className="text-cyan-400">Save Profile</strong> button at the top right.</li>
                </ul>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <Link to="/dashboard/profiles">
                  <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}>
                    Open My Profiles
                  </Button>
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits flex flex-col justify-between backdrop-blur-xl hover:border-cyan-500/30 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Step 2
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Destinations</span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-cyan-400" />
                  Add Your Links & Social Networks
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Inside the Profile Editor, click the <strong className="text-white">Links & Socials</strong> tab, or navigate to <strong className="text-white">Link Manager</strong> in the sidebar (tab <strong className="text-white">Links</strong> on mobile).
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Click <strong className="text-cyan-400">Add Link</strong> to open the destination modal.</li>
                  <li>Choose an icon (LinkedIn, Instagram, WhatsApp, Website, etc.).</li>
                  <li>Enter your link title and destination URL, then click <strong className="text-white">Save Link</strong>.</li>
                  <li>Drag the six-dot grip handle to reorder, or toggle the green switch to temporarily hide any link.</li>
                </ul>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <Link to="/dashboard/links">
                  <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}>
                    Open Link Manager
                  </Button>
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits flex flex-col justify-between backdrop-blur-xl hover:border-cyan-500/30 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Step 3
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Physical Card Routing</span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  Route Your Physical TapIt Smart Card
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Navigate to <strong className="text-white">My NFC Cards</strong> in the sidebar (or tap <strong className="text-white">Cards</strong> on mobile).
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Look for the card section labeled <strong className="text-cyan-400">&quot;When tapped, open:&quot;</strong>.</li>
                  <li>Click the dropdown and select any profile you want to open upon tap.</li>
                  <li><strong className="text-emerald-400">Instant real-time update:</strong> No chip reprogramming needed!</li>
                  <li>If your card is ever lost, flip the status toggle from <strong className="text-emerald-400">Active</strong> to <strong className="text-rose-400">Disabled</strong> to freeze it instantly.</li>
                </ul>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <Link to="/dashboard/cards">
                  <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}>
                    Manage Smart Cards
                  </Button>
                </Link>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits flex flex-col justify-between backdrop-blur-xl hover:border-cyan-500/30 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Step 4
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Digital Matrix</span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  Download Your High-Res QR Code
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click <strong className="text-white">QR Code Studio</strong> in the sidebar (or tap <strong className="text-white">More</strong> → <strong className="text-white">QR Code Studio</strong> on mobile).
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>Under <strong className="text-white">&quot;1. Choose Profile Target:&quot;</strong>, tap your desired persona.</li>
                  <li>Click <strong className="text-cyan-400">For Screens (PNG)</strong> for social headers, slides, or wallpapers.</li>
                  <li>Click <strong className="text-purple-400">For Print (SVG)</strong> for ultra-sharp vector graphics for flyers and posters.</li>
                  <li>Click <strong className="text-white">Printable Sheet</strong> to print instant cut-out QR matrix cards.</li>
                </ul>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <Link to="/dashboard/qr">
                  <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}>
                    Open QR Studio
                  </Button>
                </Link>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits flex flex-col justify-between backdrop-blur-xl hover:border-cyan-500/30 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Step 5
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Frictionless Save</span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  How Connections Save You in 1 Tap
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When someone taps your card or scans your QR code, your public profile opens directly at <code className="text-cyan-400 font-mono">tapit.app/@your-slug</code>.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li>They tap the primary button: <strong className="text-cyan-400">Save Contact (.vcf)</strong>.</li>
                  <li>Their phone opens their native Contacts app with your name, phone, email, and job title pre-filled.</li>
                  <li>They tap <strong className="text-white">Save</strong>—you are stored in their address book forever without typing!</li>
                </ul>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Works seamlessly on both iPhone (iOS) and Android
                </span>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6 shadow-card-bits flex flex-col justify-between backdrop-blur-xl hover:border-cyan-500/30 transition">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Step 6
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">Plain-Language Telemetry</span>
                </div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Track Live Taps & Engagement
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Click <strong className="text-white">Deep Telemetry</strong> in the sidebar (or tap <strong className="text-white">More</strong> → <strong className="text-white">Analytics Studio</strong> on mobile).
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                  <li><strong className="text-white">&quot;Who connected with you?&quot;</strong> — Total reach split between Physical NFC Taps and QR Scans.</li>
                  <li><strong className="text-white">&quot;What did they engage with?&quot;</strong> — Total link clicks and top-performing links.</li>
                  <li><strong className="text-white">&quot;Where are they coming from?&quot;</strong> — Device breakdown (iOS vs Android vs Desktop).</li>
                </ul>
              </div>
              <div className="pt-4 mt-4 border-t border-white/[0.06]">
                <Link to="/dashboard/analytics">
                  <Button variant="secondary" size="xs" rightIcon={<ArrowRight className="w-3.5 h-3.5 text-cyan-400" />}>
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: FREQUENTLY ASKED QUESTIONS
          ======================================================== */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-bits-navy/90 border border-bits-vapor/15 shadow-card-bits backdrop-blur-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or keywords..."
                className="w-full bg-[#050c18] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              {[
                { id: 'all', label: 'All Questions' },
                { id: 'cards', label: 'Smart Cards' },
                { id: 'contacts', label: 'Saving Contacts' },
                { id: 'profiles', label: 'Profiles & Links' },
                { id: 'qr', label: 'QR Codes' },
                { id: 'account', label: 'Account' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-[#050c18] hover:bg-white/[0.06] text-slate-400 hover:text-white border border-white/[0.06]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accordion Questions List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-bits-navy/90 border border-bits-vapor/15 rounded-3xl p-6">
                <p className="text-sm font-semibold text-slate-300">No matching questions found.</p>
                <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting &quot;All Questions&quot;.</p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = Boolean(openAccordionIds[faq.id]);

                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden backdrop-blur-xl ${
                      isOpen
                        ? 'bg-[#0a152e] border-cyan-500/40 shadow-glow-cyan/20'
                        : 'bg-bits-navy/90 border-bits-vapor/15 hover:border-cyan-500/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAccordion(faq.id)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 transition ${
                          isOpen ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' : 'bg-white/[0.05] text-slate-400'
                        }`}>
                          <HelpCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                            {faq.question}
                          </h4>
                          {!isOpen && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {faq.shortAnswer}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-1 rounded-lg bg-white/[0.05] text-slate-400 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 border-t border-white/[0.06]">
                        {faq.detailedAnswer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
