# Requirements — TapIt Platform

## 1. Public & Marketing Experience
- [x] **Hero Section**: Tagline "Everything You Share. One Tap Away.", dynamic NFC tap demo animation, CTA to "Create Your TapIt" & "Explore How It Works".
- [x] **Features Page**: Highlight NFC, Custom Profiles, Smart Analytics, QR Sharing, Multi-Profiles, Card Management.
- [x] **How It Works**: 3-step interactive breakdown (Create → Tap → Connect).
- [x] **QR Sharing Page**: Dedicated share demo page.
- [x] **NFC Card Activation Route (`/t/:cardToken`)**:
  - Handles active card tokens -> Redirect to assigned profile with `?src=nfc` and logs tap analytics.
  - Handles unclaimed card tokens -> Shows unclaimed card claim screen with CTA to connect profile.
  - Handles disabled card tokens -> Shows security notice / disabled card page.
- [x] **Public Profile (`/@:username` or `/:username/:slug`)**:
  - Mobile-first responsive presentation with live theme renderer.
  - Profile photo, headline, bio, badges, verified mark.
  - Links list with custom icons, badges, click animation, and direct analytics logging.
  - Social media icon bar.
  - "Save Contact" (.vcf vCard file generation & download).
  - "Share Profile" with QR popup and copy link.
  - "Powered by TapIt" badge.

## 2. Authentication & Role System
- [x] Sign Up (Full name, Email, Username with live availability check, Password, Confirm).
- [x] Login & Logout with Remember Me.
- [x] Forgot Password & Reset Password flows.
- [x] Demo Mode Switcher (Guest / Registered User "Djan Ocampo" / Admin) with zero-friction switching.
- [x] Protected routes for Dashboard and Admin.

## 3. User Dashboard
- [x] **Overview**: Personalized greeting ("Good evening, Djan 👋"), 4 primary KPI cards (Profile Views, NFC Taps, Link Clicks, Unique Visitors), traffic chart, live recent activity stream, top links, active card preview, quick share bar.
- [x] **My Profiles**: Grid/list of profiles (Professional, Personal, Creator, Business), create, edit, duplicate, archive, delete, switch active.
- [x] **Profile Editor**: Real-time live smartphone preview side-by-side, edit details, headline, bio, location, phone, email, website.
- [x] **Appearance Studio**: Real-time theme picker (Minimal, Professional, Dark Velvet, Cyberpunk Neon, Sunset Aura, Glassmorphism, Luxury Gold), button shapes (Rounded, Pill, Glass, Outline), custom background color/gradient, font pairings.
- [x] **My Links**: Add custom links or presets (Portfolio, LinkedIn, GitHub, Resume, Instagram, YouTube, X, TikTok, etc.), enable/disable toggle, drag & drop reorder, live click counters, edit/duplicate/delete.
- [x] **My TapIt Cards**: Registered card inventory, card preview card graphics with NFC chip aesthetic, status badges (Active, Disabled), tap count, profile reassignment modal, one-click disable/re-enable.
- [x] **NFC Card Claim & Register Wizard**: Interactive card claiming flow (`/t/:token` or manual token entry), claim confirmation, and profile binding.
- [x] **QR Code Studio**: Customizable QR code (color, pattern, logo icon, frame), high-res PNG / SVG download, printable card sheet generator.
- [x] **Analytics Dashboard**: Full breakdown of Views, Taps, Scans, Clicks, CTR, Engagement Rate, Daily/Weekly/Monthly traffic charts, Traffic Source doughnut (NFC 62%, QR 21%, Direct 12%, Other 5%), Top links click ranking, Card comparison performance table.
- [x] **Account Settings**: User profile info, username change with preview, password update, notification toggles, theme mode (dark/light), data export, danger zone.

## 4. Admin Dashboard
- [x] **Admin Overview**: Platform stats (Total users 12,483, Active profiles 9,842, Registered cards 6,294, Total visits 1,248,392), platform traffic chart, quick management shortcuts.
- [x] **User Management**: Searchable, filterable table of users, role badge, status badge, suspend/reactivate account, view user profiles & cards.
- [x] **Profile Directory**: Searchable profiles across all users, inspect slug, owner, link count, status, moderation controls.
- [x] **NFC Card Inventory & Batch Generator**: List of all card tokens, status (Active/Unclaimed/Disabled/Suspended), batch token generation tool, reassignment & manual override.
- [x] **Platform Analytics & Suspicious Tap Monitor**: Global telemetry, device & geographic breakdown, fraud/suspicious tap alert detector.
- [x] **System Settings**: Global maintenance toggle, supported link platforms manager, rate limiting toggles, subscription tier feature configs.

## 5. Interactive Simulators & UX Polish
- [x] **Interactive NFC Tap & QR Scan Simulator Modal**: Allows testing any card tap or QR scan from anywhere in the app, with realistic smartphone tap animation and direct navigation!
- [x] **Dark / Light Mode**: Seamless theme switching with curated modern dark palette (#090D16, #0F172A, accent cyan #06B6D4 / purple #8B5CF6 / emerald #10B981).
