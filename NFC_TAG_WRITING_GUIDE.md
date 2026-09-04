# TapIt — NFC Tag Writing & Hardware Provisioning Guide

> **Official Hardware & Engineering Guide**: Comprehensive documentation for programming, claiming, testing, and managing physical NFC smart cards, keyfobs, and stickers using the **TapIt Web NFC Engine**.
>
> **Core Technologies**: W3C Web NFC API (`NDEFReader`), Dynamic Cloud Token Engine (`/t/:token`), NXP NTAG213 / NTAG215 / NTAG216 standards, and Chromium Hardware Permission Architecture.

---

## 📑 Table of Contents

1. [System Architecture & Dynamic Cloud Routing](#1-system-architecture--dynamic-cloud-routing)
2. [Supported NFC Chipsets & Specifications](#2-supported-nfc-chipsets--specifications)
3. [Physical Antenna Positioning by Device](#3-physical-antenna-positioning-by-device)
4. [Step-by-Step: Writing / Programming an NFC Card](#4-step-by-step-writing--programming-an-nfc-card)
5. [Link Format Modes: Dynamic Token vs. Direct Profile](#5-link-format-modes-dynamic-token-vs-direct-profile)
6. [Card Registration & Activation Workflows](#6-card-registration--activation-workflows)
7. [Testing Your NFC Card & Live Telemetry Resolution](#7-testing-your-nfc-card--live-telemetry-resolution)
8. [Chrome Mobile Configuration & Local Development](#8-chrome-mobile-configuration--local-development)
9. [Hardware Error Matrix & Troubleshooting](#9-hardware-error-matrix--troubleshooting)
10. [Production Deployment Requirements](#10-production-deployment-requirements)
11. [Codebase Reference & Component Map](#11-codebase-reference--component-map)

---

## 1. System Architecture & Dynamic Cloud Routing

TapIt employs a **Cloud-Decoupled Dynamic Routing Engine**. Unlike traditional static business cards that burn a hardcoded URL into the chip, TapIt cards store a compact, permanent cloud token:

```
┌────────────────────────────────────────────────────────┐
│               Physical NFC Smart Card                  │
│       NTAG213/215 Chip (Stores NDEF URI Record)        │
│          e.g.  https://tapit.app/t/8xK29mQ             │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ Physical Tap (<4cm)
                            ▼
┌────────────────────────────────────────────────────────┐
│           NFCTapHandler.tsx  (/t/:token)               │
│                                                        │
│  1. Intercepts incoming hardware token                │
│  2. Records Tap Telemetry (Time, OS, Browser, Device)  │
│  3. Queries Card Status in Global Store                │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       [ Card is Active ]       [ Card is Inactive/Lost ]
                │                        │
                ▼                        ▼
┌────────────────────────┐      ┌────────────────────────┐
│ Dynamic Public Profile │      │ DisabledCardPage.tsx   │
│  /@username?src=nfc    │      │ (Privacy Safe Shield)  │
└────────────────────────┘      └────────────────────────┘
```

### Key Architectural Superpowers
1. **Zero Hardware Re-flashing**: Change your phone number, social links, resume, or switch from your *Work Profile* to your *Creator Persona* in 1 click from the dashboard. The physical card never needs to be rewritten.
2. **Instant Kill Switch**: If a card is misplaced or stolen, the owner can disable it in real time. Any subsequent taps immediately display a secure deactivation shield with zero sensitive personal information exposed.
3. **Universal Compatibility**: A short URL (`https://tapit.app/t/<TOKEN>`) consumes fewer than 32 bytes, leaving massive headroom on even the smallest NTAG213 tags.

---

## 2. Supported NFC Chipsets & Specifications

The TapIt Web NFC Writer is fully compliant with **NFC Forum Type 2 Tag** specifications:

| Chipset Family | Total EEPROM | User Memory | URL Character Limit | Write Endurance | Data Retention | Recommended Use Case |
|---|:---:|:---:|:---:|:---:|:---:|---|
| **NXP NTAG213** | 180 Bytes | 144 Bytes | ~130 chars | 100,000 cycles | 10 Years | Standard PVC Smart Cards & Keyfobs (Fastest read response) |
| **NXP NTAG215** | 540 Bytes | 504 Bytes | ~490 chars | 100,000 cycles | 10 Years | Premium Metal & Wood Cards, Posters, Badges |
| **NXP NTAG216** | 924 Bytes | 888 Bytes | ~850 chars | 100,000 cycles | 10 Years | High-Capacity Tags, Direct VCard storage |
| **Mifare Ultralight EV1** | 64–128 Bytes | 48–102 Bytes | ~40–90 chars | 10,000 cycles | 10 Years | Ultra-thin adhesive stickers & wristbands |

> [!TIP]
> TapIt tokens are deliberately designed to be under 30 characters (e.g. `https://tapit.app/t/8xK29mQ`), ensuring instantaneous read/write times (<250ms) across all chipsets.

---

## 3. Physical Antenna Positioning by Device

NFC communication requires near-field magnetic coupling within **0 to 4 cm (0 to 1.5 inches)**. Ensure the physical card is aligned with the phone's internal NFC antenna coil:

```
┌────────────────────────┐   ┌────────────────────────┐   ┌────────────────────────┐
│     Google Pixel /     │   │      Samsung Galaxy    │   │      Apple iPhone      │
│     OnePlus / Xiaomi   │   │         S20 - S24      │   │       (XR to 16 Pro)   │
├────────────────────────┤   ├────────────────────────┤   ├────────────────────────┤
│  ┌──────────────────┐  │   │  [Camera Bump]         │   │  ┌──────────────────┐  │
│  │   [Camera Bar]   │  │   │                        │   │  │  TOP EDGE ANTENNA│  │
│  └──────────────────┘  │   │  ┌──────────────────┐  │   │  └──────────────────┘  │
│  ┌──────────────────┐  │   │  │  CENTER-BACK NFC │  │   │                        │
│  │  UPPER-BACK NFC  │  │   │  │   ANTENNA ZONE   │  │   │                        │
│  └──────────────────┘  │   │  └──────────────────┘  │   │                        │
│                        │   │                        │   │                        │
│                        │   │                        │   │                        │
└────────────────────────┘   └────────────────────────┘   └────────────────────────┘
```

* **Samsung Galaxy Devices**: Antenna is located in the **center-back** of the chassis.
* **Google Pixel / Xiaomi / Sony**: Antenna is located in the **upper-third** near the camera visor.
* **Apple iPhone (iOS 13+)**: Antenna is located along the **top bezel / top edge**.
* **Protective Phone Cases**: Heavy metal cases or thick card wallets may weaken the magnetic field. Remove thick metallic cases during initial writing.

---

## 4. Step-by-Step: Writing / Programming an NFC Card

Direct in-app NFC programming is executed via [WebNFCWriterModal.tsx](file:///d:/TapIt/src/components/nfc/WebNFCWriterModal.tsx).

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Step 1      │       │     Step 2      │       │     Step 3      │       │     Step 4      │
│   Select Card   │  ──►  │   Choose Mode   │  ──►  │   Tap & Hold    │  ──►  │ Write Complete! │
│  Token Identity │       │ Dynamic / Direct│       │ Keep Steady 1s  │       │  Haptic + Audio │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Procedure

#### Step 1: Open the NFC Writer
* Navigate to **Dashboard > [My TapIt Cards](file:///d:/TapIt/src/pages/dashboard/MyCardsPage.tsx)**.
* Tap **"Write NFC Tag"** in the top action header, or tap **"Write Tag"** on any specific card.

#### Step 2: Configure Target Card & Link Format
* Choose which card token to write from your registered cards.
* Select your preferred mode:
  * **Dynamic Token Link** *(Recommended)*: `https://tapit.app/t/8xK29mQ`
  * **Direct Profile Link**: `https://tapit.app/@username`

#### Step 3: Start Sensor Listening
* Tap the primary button: **"Start NFC Writing"**.
* Chrome will present the browser permission prompt:
  > *"tapit.app wants to use NFC"* ➔ Tap **Allow**.

#### Step 4: Touch and Hold Card to Device
* The terminal transitions into the live radar scanning state:
  > **📡 Sensor Active • Hold Card to Device**  
  > *"Keep the card touching the back of your phone until writing completes. Do not move it!"*
* Place the NFC card flat against your phone's antenna coil.

#### Step 5: Instant Flashing & Confirmation
* In less than **500 milliseconds**, Chrome writes the NDEF URL record to the microchip.
* **Multi-Sensory Confirmation**:
  * **Haptic Vibration**: Dual-pulse pulse sequence (`[100ms, 50ms, 100ms]`).
  * **Audio Chime**: Harmonized rising 2-tone chime (880 Hz ➔ 1760 Hz).
  * **Visual Confetti**: Celebration burst with confirmation badge:
    > **✓ Writing Complete!**  
    > *"Card Successfully Programmed! You may now remove your card from the device."*

---

## 5. Link Format Modes: Dynamic Token vs. Direct Profile

| Feature Comparison | Dynamic Token Link (`/t/:token`) | Direct Profile Link (`/@username`) |
|---|:---:|:---:|
| **URL Example** | `https://tapit.app/t/8xK29mQ` | `https://tapit.app/@djan` |
| **Cloud Profile Reassignment** | **Yes** (Instant 1-click update) | No (Requires physical re-flash) |
| **Instant Kill Switch / Lock** | **Yes** (Protects lost cards) | No (Link remains permanent) |
| **Hardware Tap Analytics** | **Yes** (Logs device, OS, time) | Partial (Only general page views) |
| **Offline Direct Access** | Requires DNS/Cloud resolution | Direct slug navigation |
| **Recommended For** | Smart Cards, Keyfobs, Badges | Printed QR Codes, Static Posters |

---

## 6. Card Registration & Activation Workflows

TapIt offers two activation pathways:

### Method A: In-Dashboard Manual Claiming
1. Open **[MyCardsPage.tsx](file:///d:/TapIt/src/pages/dashboard/MyCardsPage.tsx)**.
2. Click **"Claim Card"**.
3. Type the 7-character alphanumeric **Hardware Token** printed on your card or packaging (e.g. `8xK29mQ`).
4. Select the initial profile persona (e.g. *Executive Profile* or *Personal Persona*).
5. Click **"Claim & Activate Card"**.
6. The card immediately enters active state, and the **Web NFC Writer Modal** automatically opens to program the physical chip.

### Method B: 1-Click Physical Tap-to-Claim Wizard
1. Tap a brand-new, unassigned TapIt card against any smartphone.
2. The phone opens `https://tapit.app/t/<TOKEN>`.
3. [NFCTapHandler.tsx](file:///d:/TapIt/src/pages/nfc/NFCTapHandler.tsx) recognizes the card is unassigned and routes to [UnclaimedCardPage.tsx](file:///d:/TapIt/src/pages/nfc/UnclaimedCardPage.tsx).
4. The user completes the 3-step activation wizard:
   * **Step 1**: Token Verification (`TOKEN: 8xK29mQ` Verified).
   * **Step 2**: Profile Assignment & Custom Labeling.
   * **Step 3**: 1-Click **"Program / Write Physical NFC Tag"** directly in-browser.

---

## 7. Testing Your NFC Card & Live Telemetry Resolution

### Physical Tap Verification
1. Lock your phone or navigate to the home screen.
2. Ensure **NFC is switched ON** in the device's Quick Settings.
3. Tap the physical card against the phone's antenna.
4. The device triggers a native push banner linking to `https://tapit.app/t/<TOKEN>`.
5. Tapping the notification opens the live profile (`/@username?src=nfc`).

### Real-Time Telemetry Tracking
Every tap is logged in the [AnalyticsPage.tsx](file:///d:/TapIt/src/pages/dashboard/AnalyticsPage.tsx):
* **Total Taps Counter**: Increments in real time.
* **Device Telemetry**: Breakdown by Android, iOS, or Desktop.
* **Hourly Velocity Chart**: Real-time traffic analysis.

---

## 8. Chrome Mobile Configuration & Local Development

### Why Chrome Requires Secure Contexts
The W3C Web NFC standard (`window.NDEFReader`) is a powerful hardware API restricted to **Secure Contexts (HTTPS or localhost)** to protect user hardware from malicious background scanning.

### Local Development Setup (Testing over Wi-Fi)
When running your Vite dev server locally (`http://192.168.x.x:5173`), Chrome on Android disables Web NFC by default unless the IP origin is explicitly allowlisted.

#### 1-Minute Chrome Flags Setup:
1. Open Google Chrome on your Android test device.
2. In the address bar, navigate to:
   ```
   chrome://flags/#unsafely-treat-insecure-origin-as-secure
   ```
3. In the text area provided, enter your local dev server address:
   ```
   http://192.168.254.138:5173
   ```
4. Change the dropdown from **Disabled** to **Enabled**.
5. Tap the blue **Relaunch** button at the bottom of Chrome.
6. Refresh `http://192.168.254.138:5173` — Web NFC is now fully unlocked!

---

## 9. Hardware Error Matrix & Troubleshooting

| Error / Symptom | Root Cause | Exact Resolution |
|---|---|---|
| **Android shows "New tag scanned: Empty tag"** | Card was touched to the phone *before* clicking "Start NFC Writing". Android OS captured the blank tag at the system level. | 1. Dismiss the white Android dialog.<br>2. Click **"Start NFC Writing"** in TapIt first.<br>3. Grant Chrome permission.<br>4. Touch the card only when the radar says **"📡 Sensor Active"**. |
| **`NotAllowedError: NFC permission was denied`** | User dismissed or blocked Chrome's NFC permission prompt. | Tap the 🔒 lock icon in Chrome's URL bar ➔ Site Settings ➔ Reset Permissions ➔ Allow NFC. |
| **`NotSupportedError: Web NFC is not available`** | Browser is not Chromium-based or running on iOS Chrome / Safari. | Use Google Chrome on Android. (iOS does not yet support Web NFC in browsers; iOS users write via Native shortcuts or read directly via CoreNFC). |
| **`NetworkError: Tag transfer failed`** | Card was pulled away before the write transaction completed. | Keep card steady and flat against the phone for at least 1 full second until the green checkmark appears. |
| **`AbortError`** | Writing was cancelled by user closing modal or resetting sensor. | Click **"Start NFC Writing"** again to restart the sensor session. |
| **Card not detected / No vibration** | NFC antenna alignment issue or thick metallic phone case. | Remove heavy phone case and align card directly with the center-back (Samsung) or top-back (Pixel). |

---

## 10. Production Deployment Requirements

When deployed to production (e.g., Vercel, Netlify, Cloudflare Pages, or custom domain):
* **Automatic HTTPS**: Production domains with valid SSL/TLS certificates are automatically treated as Trusted Secure Contexts by Chrome.
* **No Chrome Flags Required**: End-users on Android Chrome can write NFC tags out-of-the-box with standard browser permission prompts.
* **Cross-Origin Isolation**: Ensure standard `Permissions-Policy: nfc=*` or self-origin permissions are permitted.

---

## 11. Codebase Reference & Component Map

| Component / File | Architecture & Responsibility |
|---|---|
| [WebNFCWriterModal.tsx](file:///d:/TapIt/src/components/nfc/WebNFCWriterModal.tsx) | Master Web NFC writing terminal, NDEF payload generator, multi-frequency audio synth, haptic feedback, and radar animation. |
| [NFCTapHandler.tsx](file:///d:/TapIt/src/pages/nfc/NFCTapHandler.tsx) | Intercepts `/t/:token` incoming hardware taps, resolves active profile, logs telemetry, and redirects. |
| [UnclaimedCardPage.tsx](file:///d:/TapIt/src/pages/nfc/UnclaimedCardPage.tsx) | 3-Step Claim Wizard for unassigned physical cards with direct write modal integration. |
| [DisabledCardPage.tsx](file:///d:/TapIt/src/pages/nfc/DisabledCardPage.tsx) | Privacy shield shown when a deactivated/lost card is tapped. |
| [MyCardsPage.tsx](file:///d:/TapIt/src/pages/dashboard/MyCardsPage.tsx) | User card management suite, status toggles, profile reassignments, and writer modal trigger. |
| [CardInventoryPage.tsx](file:///d:/TapIt/src/pages/admin/CardInventoryPage.tsx) | Admin hardware batch generator, inventory registry, and token provisioner. |
| [NFCCardPreview.tsx](file:///d:/TapIt/src/components/nfc/NFCCardPreview.tsx) | 3D interactive smart card visualizer (Matte Black and Ceramic finishes). |
| [store/index.tsx](file:///d:/TapIt/src/store/index.tsx) | Central state store managing `cards`, `claimCard`, `toggleCardStatus`, and `recordCardTap`. |

---

*Documentation maintained by the TapIt Core Architecture Team.*

