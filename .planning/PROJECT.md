# TapIt — Smart NFC Digital Identity & Link Management Platform

## Project Vision
TapIt is a modern, high-converting, smart digital identity, link management, and NFC-powered sharing platform with real-time simulated analytics, dynamic QR codes, digital business cards, and comprehensive multi-profile management.

## Core Tagline
> **Tap. Connect. Analyze.**
> *Your digital identity, one tap away.*

## Key Personas & Roles (Strictly 2 Users)
1. **Admin (Role: Admin)**: `admin@tapit.app`
   - **Admin Console (`/admin`)**: Hardware token inventory batch provisioning, system telemetry, Web NFC chip programmer & flasher, and platform controls.
   - **User Dashboard (`/dashboard`)**: Full preview and cross-management access.
2. **Djan (Role: User)**: `djan.ocampo@tapit.app`
   - **User Dashboard (`/dashboard`)**: Manages digital profiles (Professional, Personal, Creator, Business), custom themes, links, QR Studio, and assigned NFC smart cards.
   - **Restricted Access**: Cannot access `/admin` (auto-redirects to `/dashboard`).
3. **Public Visitors**: Mobile-first public profile view (`/@djan`, `/t/:token`), vCard (.vcf) contact saving, and NFC contactless tap landing.

## Technology Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables + Framer Motion
- **Icons**: Lucide Icons
- **State Management**: Zustand / Typed State Store with LocalStorage Persistence & Mock Seeds
- **Routing**: React Router DOM (v6)
- **Data Visualization**: Recharts
- **NFC / QR**: Dynamic QR Code generator (PNG/SVG export), vCard (.vcf) exporter, NFC Tap & Token URL simulator
