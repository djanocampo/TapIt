# TapIt — Smart NFC Digital Identity & Link Management Platform

## Project Vision
TapIt is a modern, high-converting, smart digital identity, link management, and NFC-powered sharing platform with real-time simulated analytics, dynamic QR codes, digital business cards, and comprehensive multi-profile management.

## Core Tagline
> **Tap. Connect. Analyze.**
> *Your digital identity, one tap away.*

## Key Personas & Roles
1. **Visitor / Guest**: Taps NFC or scans QR, views mobile-first public profile, saves contact (.vcf vCard), clicks links, views socials.
2. **Registered User (e.g., Djan Ocampo)**: Manages multiple profiles (Professional, Personal, Creator, Business), customizes themes/fonts/buttons, manages links (drag & drop reorder, live click stats), assigns/activates/disables physical NFC cards, generates branded QR codes, tracks deep analytics (views, NFC taps, QR scans, CTR).
3. **Administrator**: Platform overview, user moderation, profile directory, NFC card token inventory & batch generation, suspicious tap monitor, system settings.

## Technology Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables + Framer Motion
- **Icons**: Lucide Icons
- **State Management**: Zustand / Typed State Store with LocalStorage Persistence & Mock Seeds
- **Routing**: React Router DOM (v6)
- **Data Visualization**: Recharts
- **NFC / QR**: Dynamic QR Code generator (PNG/SVG export), vCard (.vcf) exporter, NFC Tap & Token URL simulator
