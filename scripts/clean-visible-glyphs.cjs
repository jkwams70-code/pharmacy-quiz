const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function s(...codes) {
  return String.fromCharCode(...codes);
}

function cp(codePoint) {
  return String.fromCodePoint(codePoint);
}

const replacements = [
  [s(0x00C3, 0x00D7), s(0x00D7)],
  [s(0x00C2, 0x00B7), s(0x00B7)],
  [s(0x00E2, 0x20AC, 0x00A6), s(0x2026)],
  [s(0x00E2, 0x20AC, 0x201D), s(0x2014)],
  [s(0x00E2, 0x2020, 0x2019), s(0x2192)],
  [s(0x00E2, 0x2020, 0x0090), s(0x2190)],
  [s(0x00E2, 0x2020, 0x2018), s(0x2191)],
  [s(0x00E2, 0x2020, 0x201C), s(0x2193)],
  [s(0x00E2, 0x0153, 0x2022), s(0x2715)],
  [s(0x00E2, 0x0153, 0x017D), s(0x270E)],
  [s(0x00F0, 0x0178, 0x2014, 0x2018), cp(0x1F5D1)],
  [s(0x00F0, 0x0178, 0x2018, 0x0081), cp(0x1F441)],
  ['�', '-'],
];

function normalizeVisibleGlyphs(text) {
  let next = text;
  for (const [from, to] of replacements) {
    next = next.split(from).join(to);
  }
  next = next.replace(/�/g, '');
  return next;
}

function updateFile(filePath, { lineScoped = false, lineWindows = [] } = {}) {
  if (!fs.existsSync(filePath)) {
    return { changed: false, remaining: [] };
  }

  const original = fs.readFileSync(filePath, 'utf8');
  let updated = original;

  if (lineScoped) {
    const lines = original.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const lineNumber = i + 1;
      const inWindow = lineWindows.some(([start, end]) => lineNumber >= start && lineNumber <= end);
      if (inWindow) {
        lines[i] = normalizeVisibleGlyphs(lines[i]);
      }
    }
    updated = lines.join('\n');
  } else {
    updated = normalizeVisibleGlyphs(updated);
  }

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
  }

  const remaining = [];
  const scanText = fs.readFileSync(filePath, 'utf8');
  const scanLines = scanText.split(/\r?\n/);
  scanLines.forEach((line, index) => {
    if (/[ÃÂâðŸ�]/.test(line) && !line.includes('MOJIBAKE_REPLACEMENTS') && !line.includes('normalizeMojibake') && !line.includes('sanitizeMojibake')) {
      remaining.push(`${filePath}:${index + 1}: ${line.trim()}`);
    }
  });

  return { changed: updated !== original, remaining };
}

const targets = [
  { path: 'www/admin/news-studio.html' },
  { path: 'admin/news-studio.html' },
  { path: 'android/app/src/main/assets/public/admin/news-studio.html' },
  { path: 'www/news.html' },
  { path: 'android/app/src/main/assets/public/news.html' },
  { path: 'www/news-story.html' },
  { path: 'android/app/src/main/assets/public/news-story.html' },
  { path: 'admin/index.html' },
  { path: 'www/engine.js', lineScoped: true, lineWindows: [[31690, 31730], [35040, 35060]] },
  { path: 'android/app/src/main/assets/public/engine.js', lineScoped: true, lineWindows: [[31690, 31730], [35040, 35060]] },
];

let changedCount = 0;
const remaining = [];

for (const target of targets) {
  const result = updateFile(path.join(ROOT, target.path), target);
  if (result.changed) {
    changedCount += 1;
    console.log(`Updated ${target.path}`);
  }
  remaining.push(...result.remaining);
}

console.log(`Files changed: ${changedCount}`);
if (remaining.length > 0) {
  console.log('Remaining suspicious lines:');
  for (const line of remaining) {
    console.log(line);
  }
}
