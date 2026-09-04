#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DB_FILES = [
  path.join(ROOT, 'medlens-disease-database.js'),
  path.join(ROOT, 'www', 'medlens-disease-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-disease-database.js'),
];

const PRESETS = {
  common: [
    'Asthma',
    'Chronic obstructive pulmonary disease',
    'Type 2 diabetes mellitus',
    'Hypertension',
    'Heart failure',
    'Malaria',
    'Tuberculosis',
    'Pneumonia',
    'Peptic ulcer disease',
    'Migraine',
  ],
  cardiometabolic: ['Hypertension', 'Heart failure', 'Dyslipidemia', 'Type 2 diabetes mellitus', 'Coronary artery disease'],
  respiratory: ['Asthma', 'Chronic obstructive pulmonary disease', 'Pneumonia', 'Tuberculosis'],
  infection: ['Malaria', 'Tuberculosis', 'Pneumonia', 'HIV/AIDS', 'Urinary tract infection'],
};

function parseArgs(argv) {
  const args = { apply: false, preset: [], diseases: [], limit: 0, source: 'wikipedia' };
  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--apply') args.apply = true;
    else if (value === '--preset') args.preset.push(argv[++i] || '');
    else if (value === '--disease') args.diseases.push(argv[++i] || '');
    else if (value === '--limit') args.limit = Math.max(0, Number(argv[++i]) || 0);
    else if (value === '--source') args.source = String(argv[++i] || 'wikipedia').toLowerCase();
    else if (value === '--help' || value === '-h') {
      printUsage();
      process.exit(0);
    } else if (value.startsWith('-')) throw new Error(`Unknown flag: ${value}`);
    else args.diseases.push(value);
  }
  return args;
}

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/medlens-disease-fetcher.cjs --disease "Asthma" --apply',
    '  node scripts/medlens-disease-fetcher.cjs --preset common --limit 5 --apply',
    '',
    'Flags:',
    '  --disease <name>  Fetch one disease by name',
    '  --preset <name>   common, cardiometabolic, respiratory, infection',
    '  --limit <n>       Limit selected diseases',
    '  --apply           Write into medlens-disease-database.js copies',
  ].join('\n'));
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'disease';
}

function titleCase(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (m) => m.toUpperCase());
}

function readDatabaseEntries(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const entries = {};
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /window\.MEDLENS_DISEASE_DATABASE\[(?:"([^"]+)"|'([^']+)')\]\s*=\s*({[\s\S]*?})\s*;/g;
  let match;
  while ((match = regex.exec(content))) {
    const id = match[1] || match[2];
    entries[id] = JSON.parse(match[3]);
  }
  return entries;
}

function formatEntry(disease) {
  return `window.MEDLENS_DISEASE_DATABASE[${JSON.stringify(disease.id)}] = ${JSON.stringify(disease, null, 2)};`;
}

function writeDatabaseFile(filePath, entries) {
  const ids = Object.keys(entries).sort((a, b) => a.localeCompare(b));
  const lines = ['window.MEDLENS_DISEASE_DATABASE = window.MEDLENS_DISEASE_DATABASE || {};', ''];
  for (const id of ids) {
    lines.push(formatEntry(entries[id]));
    lines.push('');
  }
  fs.writeFileSync(filePath, `${lines.join('\n').trimEnd()}\n`, 'utf8');
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'MedLens/1.0 educational disease fetcher' } });
  if (!res.ok) throw new Error(`Fetch failed ${res.status}: ${url}`);
  return res.json();
}

async function fetchWikipediaExtract(title) {
  const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&titles=${encodeURIComponent(title)}&format=json&origin=*`;
  const extract = await fetchJson(extractUrl);
  const page = Object.values(extract?.query?.pages || {})[0] || {};
  const sourceText = String(page.extract || '').replace(/\n{3,}/g, '\n\n').trim();
  const resolvedTitle = String(page.title || title).trim();
  if (!sourceText || page.missing) return null;
  return { title: resolvedTitle, sourceText };
}

async function resolveWikipediaTitle(name) {
  const exact = await fetchWikipediaExtract(name);
  if (exact) return exact;

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
  const search = await fetchJson(searchUrl);
  const title = search?.query?.search?.[0]?.title || name;
  return fetchWikipediaExtract(title);
}

async function fetchWikipediaDisease(name) {
  const resolved = await resolveWikipediaTitle(name);
  if (!resolved?.sourceText) throw new Error(`No source text found for ${name}`);
  const { title, sourceText } = resolved;
  return {
    id: slugify(title),
    name: titleCase(title),
    category: 'Disease',
    icon: '&#x2695;',
    sourceStatus: 'fetched',
    sourceProvider: 'Wikipedia MediaWiki API',
    sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(String(title).replace(/ /g, '_'))}`,
    rawSources: [{ provider: 'Wikipedia', title, sourceText }],
    overview: `<p>${sourceText.split(/\n\n/)[0].slice(0, 700)}</p>`,
    fetchedAt: new Date().toISOString(),
  };
}

function collectTerms(args) {
  const terms = [];
  for (const preset of args.preset) {
    const list = PRESETS[String(preset || '').toLowerCase()];
    if (!list) throw new Error(`Unknown preset: ${preset}`);
    terms.push(...list);
  }
  terms.push(...args.diseases);
  const unique = Array.from(new Set(terms.map((term) => String(term || '').trim()).filter(Boolean)));
  return args.limit > 0 ? unique.slice(0, args.limit) : unique;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.source !== 'wikipedia') throw new Error('Only --source wikipedia is currently implemented.');
  const terms = collectTerms(args);
  if (!terms.length) throw new Error('Provide --disease <name> or --preset <name>.');
  console.log(`Selected ${terms.length} disease${terms.length === 1 ? '' : 's'} for fetching.`);
  const fetched = [];
  for (const [index, term] of terms.entries()) {
    process.stdout.write(`[${index + 1}/${terms.length}] Fetching ${term}... `);
    const disease = await fetchWikipediaDisease(term);
    fetched.push(disease);
    process.stdout.write('done\n');
    if (args.apply) {
      for (const target of TARGET_DB_FILES) {
        const entries = readDatabaseEntries(target);
        entries[disease.id] = { ...(entries[disease.id] || {}), ...disease };
        writeDatabaseFile(target, entries);
      }
      console.log(`Saved ${disease.name} into all MedLens disease database files.`);
    }
  }
  if (!args.apply) {
    console.log('\nPreview fetched entries:');
    fetched.forEach((entry) => console.log(formatEntry(entry), '\n'));
    console.log('Run again with --apply to save.');
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
