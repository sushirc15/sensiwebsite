# 🎰 SENSEI SLOTS - Official Streamer Website & Leaderboard

A modern, high-converting, responsive single-page website for Kick streamer **SENSEI** (Sensei Slots) promoting his **Cooked.com** partnership, referral code, and **$1,000 Monthly Prize Leaderboard**.

Inspired by the dark aesthetic, glowing accents, and clean card layouts of top gaming leaderboards.

---

## ✨ Features

- **🔴 Neon Crimson & Samurai Aesthetic:** Dark velvet obsidian background (`#07080b`), glowing borders, and radiant accents paired with the streamer's signature samurai avatar.
- **✨ 60fps Particle Canvas:** Lightweight HTML5 canvas system rendering slow-drifting red embers and gold sparkles.
- **⚡ Animated Hero Section:** Floating streamer avatar with rotating aura rings, radar stream beacon, headline glow, and direct CTA buttons for Cooked.com and Kick.
- **📋 Interactive Promo Code Box:** 
  - One-click copy for promo code `SENSEI`.
  - Confetti burst celebration.
  - Synthesized subtle audio feedback via Web Audio API.
  - Interactive toast notifications.
- **🏆 Glowing Prize Leaderboard ($1,000 Pool):**
  - Live 4-digit countdown timer (Days, Hours, Minutes, Seconds).
  - 🥇 1st ($500), 🥈 2nd ($250), 🥉 3rd ($75), and 4th–8th places with gold/silver/bronze medals and glow effects.
  - Interactive tab toggle between **"Prize Breakdown"** and **"Live Standings"** (with live search filter).
- **🌐 Social Media Cards:** High-impact cards with hover glow linking to Kick, Bio Site, X (Twitter), Instagram, and Facebook.
- **❓ FAQ Accordion:** Clean dropdown FAQ addressing qualification, prize payouts, and VIP rakeback perks.
- **🛡️ 18+ Responsible Gambling Footer:** Includes required legal disclaimers and direct link to [BeGambleAware.org](https://www.begambleaware.org/).
- **⚙️ Centralized Configuration:** Easily edit all codes, prizes, dates, wagers, and links inside `config.js` without touching HTML!

---

## 🚀 Quick Start

### 1. View Locally
Simply double-click `index.html` to open in any web browser, or serve it using any local HTTP server:

```bash
# Using Python
python3 -m http.server 3000

# Using Node (npx)
npx serve .
```

Then visit `http://localhost:3000` in your browser.

---

## 🛠️ How to Customize (`config.js`)

All links, prizes, referral codes, countdown timers, and leaderboard entries are located in **`config.js`**:

```javascript
const CONFIG = {
  // Brand & Streamer details
  brand: {
    name: "SENSEI SLOTS",
    streamerName: "SENSEI",
    heroImage: "assets/sensei-hero.jpg"
  },

  // Referral Code & Affiliate Link
  referral: {
    code: "SENSEI",
    signupUrl: "https://cooked.com/?auth=register&referral_source=SENSEI"
  },

  // Countdown timer target date
  countdown: {
    targetDate: "2026-10-31T23:59:59Z", // Change to your desired season end date
  },

  // Prize table distribution
  prizePool: {
    total: "$1,000",
    prizes: [
      { place: "1st", rank: 1, prize: "$500", rawPrize: 500, tier: "gold" },
      { place: "2nd", rank: 2, prize: "$250", rawPrize: 250, tier: "silver" },
      { place: "3rd", rank: 3, prize: "$75", rawPrize: 75, tier: "bronze" },
      ...
    ]
  },

  // Live standings (update manually or link to live API)
  liveStandings: [ ... ],

  // Social Links
  socials: [ ... ]
};
```

---

## 📁 Project Structure

```
sensi website/
├── assets/
│   └── sensei-hero.jpg      # Streamer samurai avatar image
├── config.js                # Centralized configuration (links, prizes, dates, standings)
├── index.html               # Main responsive single-page landing site
├── styles.css               # Neon glows, keyframes, typography, and styling
├── script.js                # Particle engine, countdown timer, copy logic, audio SFX
└── README.md                # Documentation & editing guide
```

---

## 🌐 1-Click Deployment

You can deploy this site instantly to any static hosting provider:
- **Vercel:** Drag and drop this folder onto [vercel.com](https://vercel.com).
- **Netlify:** Drag and drop onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages:** Push to a repository and enable GitHub Pages in repository settings.
