const fs = require('fs');
const path = require('path');

const files = [
  path.join(process.cwd(), 'www', 'engine.js'),
  path.join(process.cwd(), 'android', 'app', 'src', 'main', 'assets', 'public', 'engine.js'),
];

function replaceSlice(source, startMarker, endMarker, replacement) {
  const start = source.indexOf(startMarker);
  if (start === -1) return source;
  const end = source.indexOf(endMarker, start);
  if (end === -1) return source;
  return source.slice(0, start) + replacement + source.slice(end);
}

const toneCompatibleBlock = `const COMMUNITY_EMOJI_TONE_COMPATIBLE = new Set([
  "👍",
  "👎",
  "👋",
  "🤚",
  "🖐",
  "✋",
  "👌",
  "🤌",
  "🤏",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "🤙",
  "👈",
  "👉",
  "👆",
  "👇",
  "☝️",
  "✊",
  "👊",
  "🤛",
  "🤜",
  "👏",
  "🙌",
  "👐",
  "🙏",
  "💪",
  "🫶",
  "🫰",
  "🤝",
  "🖖",
]);
`;

const recentLoaderBlock = `function loadCommunityEmojiRecent() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COMMUNITY_EMOJI_RECENT_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((emoji) => normalizeMojibake(emoji))
      .map((emoji) => String(emoji || "").trim())
      .filter(Boolean)
      .slice(0, COMMUNITY_EMOJI_RECENT_LIMIT);
  } catch {
    return [];
  }
}

`;

const recentPanelBlock = `function getCommunityEmojiCategoriesForPanel() {
  return [
    {
      id: "recent",
      icon: "🕘",
      title: "Recent",
      keywords: "recent last used",
      emojis: Array.isArray(communityEmojiRecent) ? communityEmojiRecent : [],
    },
    ...COMMUNITY_CHAT_EMOJI_CATEGORIES,
  ];
}
`;

const countryVisualsBlock = `const CONTACT_COUNTRY_VISUALS = {
  "United States": { shortCode: "USA", flag: "🇺🇸" },
  Canada: { shortCode: "CAN", flag: "🇨🇦" },
  "United Kingdom": { shortCode: "GBR", flag: "🇬🇧" },
  Nigeria: { shortCode: "NGA", flag: "🇳🇬" },
  Ghana: { shortCode: "GHA", flag: "🇬🇭" },
  Kenya: { shortCode: "KEN", flag: "🇰🇪" },
  India: { shortCode: "IND", flag: "🇮🇳" },
  Pakistan: { shortCode: "PAK", flag: "🇵🇰" },
  Philippines: { shortCode: "PHL", flag: "🇵🇭" },
  Australia: { shortCode: "AUS", flag: "🇦🇺" },
  "South Africa": { shortCode: "ZAF", flag: "🇿🇦" },
  Other: { shortCode: "INTL", flag: "🌍" },
};
`;

for (const file of files) {
  let source = fs.readFileSync(file, 'utf8');
  source = replaceSlice(source, 'function loadCommunityEmojiRecent()', 'function saveCommunityEmojiRecent(', recentLoaderBlock);
  source = replaceSlice(source, 'function getCommunityEmojiCategoriesForPanel()', 'function getCommunityEmojiCategoryById(', recentPanelBlock);
  source = replaceSlice(source, 'const COMMUNITY_EMOJI_TONE_COMPATIBLE = new Set([', 'function loadCommunityEmojiRecent()', toneCompatibleBlock);
  source = replaceSlice(source, 'const CONTACT_COUNTRY_VISUALS = {', 'const CONTACT_COUNTRY_OPTIONS = (() => {', countryVisualsBlock);
  fs.writeFileSync(file, source, 'utf8');
}
