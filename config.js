/**
 * SENSEI SLOTS - CONFIGURATION FILE
 * Edit links, referral code, prize pool, countdown timer, and particle physics here.
 */
const CONFIG = {
  // Brand & Media Assets
  brand: {
    name: "SENSEI SLOTS",
    streamerName: "SENSEI",
    title: "SENSEI SLOTS LEADERBOARD",
    tagline: "High Stakes • Daily Giveaways • Elite VIP Perks",
    description: "Join the official Sensei Slots community on Cooked.com. Use code SENSEI for exclusive deposit bonuses, daily rakeback, and your ticket into our monthly $1,000 cash leaderboard!",
    heroImage: "sensei-hero.png",     // Isolated black samurai cutout
    logoImage: "sensei-logo.jpg",     // Circular blood moon logo
  },

  // Kick Live Stream Status & Embed Settings
  stream: {
    channel: "senseislots",
    kickUrl: "https://kick.com/senseislots",
    embedUrl: "https://player.kick.com/senseislots",
    isLive: false, // Set to true when live streaming, false when offline (or dynamic)
    streamTitle: "🔥 HIGH STAKES SLOTS & $1,000 CASH DROP!",
    viewers: "1,420",
    offlineMessage: "Sensei is offline right now",
    offlineSchedule: "Streams daily at 7:00 PM EST • Turn on notifications on Kick to get notified!",
  },

  // Fire Flakes & Embers Particle Physics
  particles: {
    countDesktop: 80,
    countMobile: 30,
    colors: ["#ff5c70", "#e63950", "#ff8a3d", "#f5c542"],
    minSize: 2,
    maxSize: 7,
    speedMinY: 0.4,
    speedMaxY: 1.4,
    windLeanRight: 0.35, // Mild drift to the right matching his flowing robe
    swayFrequency: 0.02,
  },

  // Loading Screen & Knife-Slice
  loader: {
    minDisplayTimeMs: 1800,
    sliceDurationMs: 400,
    splitDurationMs: 600,
    soundEnabledDefault: false,
  },

  // Referral & Affiliate Info
  referral: {
    code: "SENSEI",
    signupUrl: "https://cooked.com/?auth=register&referral_source=SENSEI",
    bonusText: "Instant VIP Rakeback + 100% Deposit Match",
  },

  // Countdown Target Date for Leaderboard
  countdown: {
    targetDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    label: "April Season Ends In:",
  },

  // Prize Pool Distribution ($1,000 Total)
  prizePool: {
    total: "$1,000",
    currency: "USD",
    season: "Monthly Sprint",
    prizes: [
      { place: "1st", rank: 1, prize: "$500", rawPrize: 500, badge: "🥇", samuraiRank: "SHŌGUN", kanji: "将軍", icon: "crown", tier: "gold", color: "#F5C542" },
      { place: "2nd", rank: 2, prize: "$250", rawPrize: 250, badge: "🥈", samuraiRank: "DAIMYŌ", kanji: "大名", icon: "shield", tier: "silver", color: "#E2E8F0" },
      { place: "3rd", rank: 3, prize: "$75", rawPrize: 75, badge: "🥉", samuraiRank: "HATAMOTO", kanji: "旗本", icon: "swords", tier: "bronze", color: "#D97706" },
      { place: "4th", rank: 4, prize: "$50", rawPrize: 50, badge: "4th", samuraiRank: "SAMURAI", kanji: "武士", icon: "sword", tier: "standard", color: "#E63950" },
      { place: "5th", rank: 5, prize: "$40", rawPrize: 40, badge: "5th", samuraiRank: "RONIN", kanji: "浪人", icon: "sword", tier: "standard", color: "#E63950" },
      { place: "6th", rank: 6, prize: "$35", rawPrize: 35, badge: "6th", samuraiRank: "SHINOBI", kanji: "忍", icon: "flame", tier: "standard", color: "#E63950" },
      { place: "7th", rank: 7, prize: "$30", rawPrize: 30, badge: "7th", samuraiRank: "WARRIOR", kanji: "侍", icon: "flame", tier: "standard", color: "#E63950" },
      { place: "8th", rank: 8, prize: "$20", rawPrize: 20, badge: "8th", samuraiRank: "WARRIOR", kanji: "侍", icon: "flame", tier: "standard", color: "#E63950" },
    ]
  },

  // Live Leaderboard Standings
  liveStandings: [
    { rank: 1, user: "RoninK***9", wagered: "$48,920.00", prize: "$500", points: "48,920 pts", badge: "🥇" },
    { rank: 2, user: "KatanaW***r", wagered: "$32,150.50", prize: "$250", points: "32,150 pts", badge: "🥈" },
    { rank: 3, user: "ShadowS***x", wagered: "$19,840.00", prize: "$75", points: "19,840 pts", badge: "🥉" },
    { rank: 4, user: "NinjaS***s", wagered: "$12,410.20", prize: "$50", points: "12,410 pts", badge: "4th" },
    { rank: 5, user: "CookedD***e", wagered: "$9,850.00", prize: "$40", points: "9,850 pts", badge: "5th" },
    { rank: 6, user: "ViperB***t", wagered: "$7,620.80", prize: "$35", points: "7,620 pts", badge: "6th" },
    { rank: 7, user: "RedMoon***7", wagered: "$5,340.00", prize: "$30", points: "5,340 pts", badge: "7th" },
    { rank: 8, user: "LuckyS***i", wagered: "$3,890.10", prize: "$20", points: "3,890 pts", badge: "8th" },
  ],

  // Socials
  socials: [
    {
      name: "Kick",
      title: "Kick Live Channel",
      handle: "kick.com/senseislots",
      url: "https://kick.com/senseislots",
      badge: "LIVE STREAMS",
      description: "Tune in to daily slot streams, massive bonus hunts, community battles, and instant live wheel spins!"
    },
    {
      name: "Official Bio Site",
      title: "Official Bio Site",
      handle: "bio.site/SENSEISLOTS",
      url: "https://bio.site/SENSEISLOTS",
      badge: "ALL LINKS",
      description: "One centralized portal for all Sensei Slots links, VIP offers, schedules, and verified affiliate channels."
    },
    {
      name: "Cooked on X",
      title: "Cooked on X",
      handle: "@cookedcom",
      url: "https://x.com/cookedcom",
      badge: "UPDATES",
      description: "Stay ahead with instant platform announcements, flash code drops, and casino release schedules."
    },
    {
      name: "Cooked Instagram",
      title: "Cooked Instagram",
      handle: "@cookedcom",
      url: "https://www.instagram.com/cookedcom",
      badge: "CLIPS",
      description: "Watch insane max-win reels, big multiplier hit reactions, and weekly high-roller moments."
    },
    {
      name: "Cooked Facebook Hub",
      title: "Cooked Facebook Hub",
      handle: "facebook.com/cookedcom",
      url: "https://facebook.com/cookedcom",
      badge: "COMMUNITY",
      description: "Engage with players worldwide, discover featured streamer spotlights, and participate in weekly community challenges."
    }
  ],

  // Footer & Disclaimer
  footer: {
    disclaimer: "18+ only. Gamble responsibly. Please check your local laws before participating. Not affiliated with Kick or any unauthorized entities. Play with what you can afford to lose.",
    responsibleGamblingUrl: "https://www.begambleaware.org/",
    responsibleGamblingText: "BeGambleAware.org",
    copyright: `© ${new Date().getFullYear()} Sensei Slots. All Rights Reserved. Powered by Cooked.com partnership.`
  }
};

if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
if (typeof globalThis !== "undefined") {
  globalThis.CONFIG = CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG;
}
