#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

try {
  require(path.resolve(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: path.resolve(__dirname, '..', 'backend', '.env') });
} catch (_) {
  try { require('dotenv').config({ path: path.resolve(__dirname, '..', 'backend', '.env') }); } catch (_) {}
}

const ROOT = path.resolve(__dirname, '..');
const DRUG_DB_FILE = path.join(ROOT, 'www', 'medlens-database.js');
const TARGET_DB_FILES = [
  path.join(ROOT, 'medlens-interactions-database.js'),
  path.join(ROOT, 'www', 'medlens-interactions-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-interactions-database.js'),
];
const EXTRACTOR_VERSION = 'medlens-interactions-label-extractor-v1';

const CLASS_ALIASES = {
  nsaids: ['ibuprofen', 'naproxen', 'diclofenac', 'indomethacin', 'ketorolac', 'celecoxib', 'meloxicam', 'aspirin'],
  anticoagulants: ['warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'edoxaban', 'heparin', 'enoxaparin'],
  antiplatelets: ['aspirin', 'clopidogrel', 'prasugrel', 'ticagrelor', 'dipyridamole'],
  'strong cyp3a inhibitors': ['clarithromycin', 'erythromycin', 'itraconazole', 'ketoconazole', 'voriconazole', 'posaconazole', 'ritonavir', 'cobicistat'],
  'cyp3a inhibitors': ['clarithromycin', 'erythromycin', 'itraconazole', 'ketoconazole', 'verapamil', 'diltiazem', 'ritonavir'],
  'cyp2c9 inhibitors': ['amiodarone', 'fluconazole', 'metronidazole', 'trimethoprim-sulfamethoxazole'],
  'qt-prolonging drugs': ['amiodarone', 'sotalol', 'dofetilide', 'quinidine', 'azithromycin', 'clarithromycin', 'haloperidol'],
  'potassium-sparing diuretics': ['spironolactone', 'eplerenone', 'amiloride', 'triamterene'],
  'ace inhibitors': ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'benazepril'],
  arbs: ['losartan', 'valsartan', 'candesartan', 'irbesartan', 'olmesartan'],
};

function slug(value) {
  return String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function readDrugEntries(filePath) {
  global.window = { MEDLENS_DATABASE: {} };
  require(filePath);
  return Object.values(global.window.MEDLENS_DATABASE || {});
}

function readInteractionEntries(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const entries = {};
  const re = /window\.MEDLENS_INTERACTIONS_DATABASE\[(["'`])([^"'`]+)\1\]\s*=\s*({[\s\S]*?});(?=\s*(?:window\.MEDLENS_INTERACTIONS_DATABASE\[|$))/g;
  let match;
  while ((match = re.exec(content))) entries[match[2]] = JSON.parse(match[3]);
  return entries;
}

function writeInteractionFile(filePath, entries) {
  const ids = Object.keys(entries).sort((a, b) => a.localeCompare(b));
  const lines = ['window.MEDLENS_INTERACTIONS_DATABASE = window.MEDLENS_INTERACTIONS_DATABASE || {};', ''];
  for (const id of ids) lines.push(`window.MEDLENS_INTERACTIONS_DATABASE[${JSON.stringify(id)}] = ${JSON.stringify(entries[id], null, 2)};`, '');
  fs.writeFileSync(filePath, `${lines.join('\n').trimEnd()}\n`, 'utf8');
}

function pairId(subject, object) {
  return [slug(subject), slug(object)].sort().join('__');
}

function responseText(json) {
  if (typeof json.output_text === 'string') return json.output_text.trim();
  const chunks = [];
  for (const item of json.output || []) {
    for (const content of item.content || []) if (content.type === 'output_text' && content.text) chunks.push(content.text);
  }
  return chunks.join('\n').trim();
}

function buildSourceText(drug) {
  return [
    drug.interactions && `DRUG INTERACTIONS:\n${stripHtml(drug.interactions)}`,
    drug.warnings && `WARNINGS:\n${stripHtml(drug.warnings)}`,
    drug.contraindications && `CONTRAINDICATIONS:\n${stripHtml(drug.contraindications)}`,
    drug.mechanism && `MECHANISM:\n${stripHtml(drug.mechanism)}`,
    drug.pharmacokinetics && `PHARMACOKINETICS:\n${stripHtml(drug.pharmacokinetics)}`,
  ].filter(Boolean).join('\n\n').slice(0, 14000);
}

function buildPrompt(drug, sourceText) {
  return [
    'Extract only source-backed drug interaction warnings from this FDA/openFDA/DailyMed-derived label material.',
    'Do not invent interaction facts. If the text does not support a usable interaction, return an empty interactions array.',
    '',
    'Return strict JSON: {"interactions":[...]}',
    'Each interaction object must contain:',
    'objectName, objectType, severity, confidence, clinicalConcern, mechanism, management, monitoring, counseling, sourceQuote',
    '',
    'Rules:',
    '- objectName is either an exact drug/ingredient name or a drug class named by the source.',
    '- objectType must be "exact-drug", "drug-class", or "substance".',
    '- severity must be contraindicated, major, moderate, minor, or unknown.',
    '- confidence must be exact-label, class-label, or needs-review.',
    '- Keep clinicalConcern, mechanism, management, monitoring, and counseling brief: one short sentence each.',
    '- Keep sourceQuote brief: the smallest source phrase supporting the interaction.',
    '- Prefer important/salient interactions only. Ignore vague non-actionable boilerplate.',
    '',
    JSON.stringify({
      sourceDrug: drug.generic || drug.brand || drug.id,
      brand: drug.brand || '',
      class: drug.class || '',
      route: drug.route || '',
      source: drug.sourceLink || drug.monograph?.source?.url || 'openFDA/DailyMed label',
      sourceText,
    }, null, 2),
  ].join('\n');
}

async function extractWithOpenAi(drug, sourceText, args) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing. Add it to backend/.env before running this extractor.');
  let res;
  try {
    res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: args.model,
        input: [
          { role: 'system', content: 'You extract conservative, source-backed clinical interaction records and return valid JSON only.' },
          { role: 'user', content: buildPrompt(drug, sourceText) },
        ],
      }),
    });
  } catch (error) {
    const cause = error.cause ? ` Cause: ${error.cause.code || ''} ${error.cause.message || error.cause}`.trim() : '';
    throw new Error(`OpenAI network request failed while extracting interactions: ${error.message}.${cause}`);
  }
  if (!res.ok) throw new Error(`OpenAI extraction failed (${res.status}): ${await res.text()}`);
  const text = responseText(await res.json());
  if (!text) throw new Error('OpenAI response had no output text.');
  return JSON.parse(text);
}

function isRetryableOpenAiError(error) {
  return /ECONNRESET|ETIMEDOUT|ENOTFOUND|fetch failed|network request failed|terminated|UND_ERR|\(429\)|\(500\)|\(502\)|\(503\)|\(504\)/i.test(String(error && error.message ? error.message : error));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractWithRetry(drug, sourceText, args) {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await extractWithOpenAi(drug, sourceText, args);
    } catch (error) {
      if (attempt === maxAttempts || !isRetryableOpenAiError(error)) throw error;
      const delayMs = 2000 * attempt;
      process.stdout.write(`retry ${attempt}/${maxAttempts} after ${delayMs / 1000}s... `);
      await sleep(delayMs);
    }
  }
  throw new Error('Unable to extract interactions after retries.');
}
function expandKnownClass(record) {
  const key = String(record.objectName || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return CLASS_ALIASES[key] || [];
}

function normalizeInteraction(sourceDrug, drug, item) {
  const objectName = String(item.objectName || '').trim();
  if (!objectName) return null;
  const type = item.objectType === 'exact-drug' ? 'exact-pair' : 'class-level';
  const id = pairId(sourceDrug, objectName);
  return {
    id,
    drugs: [sourceDrug, objectName],
    normalizedDrugs: [slug(sourceDrug), slug(objectName)].sort(),
    type,
    severity: String(item.severity || 'unknown').toLowerCase(),
    sourceType: 'FDA label-derived',
    sourceDrug,
    sourceDrugId: drug.id || '',
    confidence: item.confidence || (type === 'exact-pair' ? 'exact-label' : 'class-label'),
    clinicalConcern: String(item.clinicalConcern || '').trim(),
    mechanism: String(item.mechanism || '').trim(),
    management: String(item.management || '').trim(),
    monitoring: String(item.monitoring || '').trim(),
    counseling: String(item.counseling || '').trim(),
    evidence: type === 'exact-pair' ? 'Exact interaction described in FDA/openFDA label material.' : 'Class-level warning derived from FDA/openFDA label material.',
    sourceText: String(item.sourceQuote || '').trim(),
    source: drug.sourceLink || drug.monograph?.source?.url || 'openFDA/DailyMed label',
    sourceUrl: drug.sourceLink || drug.monograph?.source?.url || 'https://open.fda.gov/apis/drug/label/',
    classMembers: type === 'class-level' ? expandKnownClass(item) : [],
    needsReview: item.confidence !== 'exact-label',
    extractedAt: new Date().toISOString(),
    extractorVersion: EXTRACTOR_VERSION,
  };
}

function parseArgs(argv) {
  const args = { apply: false, all: false, limit: 1, drugs: [], model: process.env.OPENAI_MODEL || 'gpt-5-mini', skipExisting: false };
  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--apply') args.apply = true;
    else if (value === '--all') args.all = true;
    else if (value === '--limit') args.limit = Math.max(1, Number(argv[++i] || 1));
    else if (value === '--drug') args.drugs.push(String(argv[++i] || '').toLowerCase());
    else if (value === '--model') args.model = argv[++i];
    else if (value === '--skip-existing') args.skipExisting = true;
    else if (value === '--help') args.help = true;
  }
  return args;
}

function printHelp() {
  console.log([
    'Usage:',
    '  node scripts/medlens-interactions-label-extractor.cjs --drug warfarin --apply',
    '  node scripts/medlens-interactions-label-extractor.cjs --all --limit 5 --skip-existing --apply',
    '',
    'Reads the drug database, extracts source-backed interaction records from label sections,',
    'and writes only to medlens-interactions-database.js files.',
  ].join('\n'));
}

function selectDrugs(drugs, args, existing) {
  let selected = drugs.filter((drug) => buildSourceText(drug));
  if (args.drugs.length) {
    selected = selected.filter((drug) => {
      const haystack = [drug.id, drug.generic, drug.brand].join(' ').toLowerCase();
      return args.drugs.some((term) => haystack.includes(term));
    });
  } else if (!args.all) {
    selected = selected.slice(0, 1);
  }
  if (args.skipExisting) {
    selected = selected.filter((drug) => !Object.values(existing).some((record) => record.sourceDrugId === drug.id && record.extractorVersion === EXTRACTOR_VERSION));
  }
  return selected.slice(0, args.limit);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) return printHelp();
  const existing = readInteractionEntries(TARGET_DB_FILES[0]);
  const drugs = readDrugEntries(DRUG_DB_FILE);
  const selected = selectDrugs(drugs, args, existing);
  if (!selected.length) {
    console.log('No drugs selected. They may already be extracted or may not have source interaction text.');
    return;
  }
  const generated = [];
  for (const [index, drug] of selected.entries()) {
    const sourceDrug = drug.generic || drug.brand || drug.id;
    process.stdout.write(`\n[${index + 1}/${selected.length}] Extracting label interactions for ${sourceDrug}... `);
    const result = await extractWithRetry(drug, buildSourceText(drug), args);
    const records = (result.interactions || []).map((item) => normalizeInteraction(sourceDrug, drug, item)).filter(Boolean);
    generated.push(...records);
    process.stdout.write(`${records.length} record(s)\n`);
  }
  if (!args.apply) {
    console.log('\nPreview only. Run again with --apply to save.');
    generated.forEach((record) => console.log(`${record.drugs.join(' + ')} | ${record.severity} | ${record.type}`));
    return;
  }
  for (const target of TARGET_DB_FILES) {
    const entries = readInteractionEntries(target);
    for (const record of generated) entries[record.id] = record;
    writeInteractionFile(target, entries);
  }
  console.log(`Saved ${generated.length} source-backed interaction records into all MedLens interaction database files.`);
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});
