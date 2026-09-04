#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DB_FILES = [
  path.join(ROOT, 'medlens-interactions-database.js'),
  path.join(ROOT, 'www', 'medlens-interactions-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-interactions-database.js'),
];

const SEED_INTERACTIONS = [
  {
    drugs: ['Warfarin', 'Ibuprofen'],
    severity: 'major',
    clinicalConcern: 'Higher bleeding risk, including gastrointestinal bleeding.',
    mechanism: 'Warfarin reduces clotting factor activity while ibuprofen inhibits platelet function and can injure the gastric mucosa.',
    management: 'Avoid routine combined use when possible. Prefer acetaminophen/paracetamol for short-term pain or fever unless contraindicated. If an NSAID is necessary, use the lowest dose for the shortest time and involve the prescriber.',
    monitoring: 'Monitor for bruising, black stools, vomiting blood, unexplained weakness, falling hemoglobin, and INR changes.',
    counseling: 'Do not start ibuprofen or other NSAIDs while taking warfarin unless a clinician has reviewed the risk.',
    source: 'MedLens seed interaction',
  },
  {
    drugs: ['Warfarin', 'Metronidazole'],
    severity: 'major',
    clinicalConcern: 'Marked INR elevation and serious bleeding may occur.',
    mechanism: 'Metronidazole can inhibit warfarin metabolism, increasing anticoagulant exposure.',
    management: 'Avoid if a reasonable alternative exists. If used together, arrange closer INR follow-up and consider warfarin dose adjustment under prescriber supervision.',
    monitoring: 'Check INR more frequently during therapy and shortly after metronidazole is stopped. Watch for bleeding symptoms.',
    counseling: 'Report nosebleeds, gum bleeding, dark urine, black stools, or unusual bruising promptly.',
    source: 'MedLens seed interaction',
  },
  {
    drugs: ['Lisinopril', 'Ibuprofen'],
    severity: 'moderate',
    clinicalConcern: 'Reduced blood pressure control and increased risk of kidney injury, especially in dehydration, older age, heart failure, or chronic kidney disease.',
    mechanism: 'NSAIDs can reduce renal prostaglandin-mediated blood flow and blunt the antihypertensive effect of ACE inhibitors.',
    management: 'Use the lowest effective NSAID dose for the shortest duration. Consider acetaminophen/paracetamol for pain when appropriate.',
    monitoring: 'Monitor blood pressure, serum creatinine, potassium, urine output, and hydration status.',
    counseling: 'Avoid dehydration and seek care for reduced urination, dizziness, swelling, or worsening blood pressure.',
    source: 'MedLens seed interaction',
  },
  {
    drugs: ['Lisinopril', 'Spironolactone'],
    severity: 'major',
    clinicalConcern: 'Potentially dangerous hyperkalemia and kidney function decline.',
    mechanism: 'Both medicines can increase serum potassium; the risk rises further with renal impairment or potassium supplements.',
    management: 'Use only when clinically justified with planned laboratory monitoring. Avoid potassium supplements and potassium-containing salt substitutes unless specifically directed.',
    monitoring: 'Check serum potassium and renal function after initiation, after dose changes, and during acute illness.',
    counseling: 'Seek care for muscle weakness, palpitations, severe fatigue, or fainting.',
    source: 'MedLens seed interaction',
  },
  {
    drugs: ['Metformin', 'Metoprolol'],
    severity: 'moderate',
    clinicalConcern: 'Beta-blockers may make hypoglycemia harder to recognize.',
    mechanism: 'Metoprolol can blunt adrenergic warning symptoms such as tremor and palpitations.',
    management: 'Continue when clinically indicated, but strengthen glucose self-monitoring and hypoglycemia education.',
    monitoring: 'Monitor blood glucose patterns, especially when meals are missed, exercise changes, or diabetes therapy is intensified.',
    counseling: 'Sweating, confusion, hunger, and unusual tiredness can still signal low blood sugar even if palpitations are absent.',
    source: 'MedLens seed interaction',
  },
  {
    drugs: ['Metronidazole', 'Metformin'],
    severity: 'moderate',
    clinicalConcern: 'Possible increased risk of lactic acidosis in susceptible patients.',
    mechanism: 'The concern is greatest when acute illness, dehydration, sepsis, alcohol use, or renal impairment reduces metformin clearance or tissue oxygenation.',
    management: 'Use caution in patients with renal impairment or acute systemic illness. Consider temporarily holding metformin when clinically appropriate.',
    monitoring: 'Monitor renal function and symptoms such as severe weakness, muscle pain, abdominal distress, rapid breathing, or unusual sleepiness.',
    counseling: 'Maintain hydration and seek urgent care for symptoms suggestive of lactic acidosis.',
    source: 'MedLens seed interaction',
  },
  {
    drugs: ['Atorvastatin', 'Clarithromycin'],
    severity: 'major',
    clinicalConcern: 'Increased statin exposure with risk of myopathy or rhabdomyolysis.',
    mechanism: 'Clarithromycin inhibits CYP3A4 and transport pathways involved in atorvastatin disposition.',
    management: 'Prefer a non-interacting antibiotic when possible, or temporarily hold/reduce atorvastatin based on prescriber direction.',
    monitoring: 'Monitor for muscle pain, weakness, dark urine, and creatine kinase if symptoms occur.',
    counseling: 'Report unexplained muscle symptoms promptly, especially if accompanied by fever or dark urine.',
    source: 'MedLens seed interaction',
  },
  {
    drugs: ['Sertraline', 'Ibuprofen'],
    severity: 'moderate',
    clinicalConcern: 'Increased bleeding risk, especially gastrointestinal bleeding.',
    mechanism: 'SSRIs may impair platelet serotonin uptake; NSAIDs add platelet and gastrointestinal mucosal effects.',
    management: 'Avoid unnecessary NSAID use. Consider acetaminophen/paracetamol or gastroprotection in higher-risk patients when an NSAID is necessary.',
    monitoring: 'Monitor for bruising, black stools, vomiting blood, anemia symptoms, and persistent stomach pain.',
    counseling: 'Ask before adding over-the-counter ibuprofen, naproxen, aspirin, or combination cold/pain products.',
    source: 'MedLens seed interaction',
  },
  {
    drugs: ['Sildenafil', 'Nitroglycerin'],
    severity: 'contraindicated',
    clinicalConcern: 'Severe, potentially life-threatening hypotension.',
    mechanism: 'Both medicines increase nitric oxide-cGMP signaling, causing additive vasodilation.',
    management: 'Do not combine. Nitrates should not be used within the clinically relevant window after sildenafil; emergency chest pain plans should be reviewed with the prescriber.',
    monitoring: 'If accidental co-use occurs, monitor blood pressure and symptoms urgently in a medical setting.',
    counseling: 'Never use nitroglycerin for chest pain after sildenafil unless emergency clinicians know about the recent dose.',
    source: 'MedLens seed interaction',
  },
  {
    drugs: ['Paracetamol', 'Ibuprofen'],
    severity: 'minor',
    clinicalConcern: 'No clinically important adverse interaction is expected for most patients when each medicine is dosed correctly.',
    mechanism: 'They work through different analgesic and anti-inflammatory pathways.',
    management: 'They may be used together or alternated when appropriate, but avoid exceeding the maximum daily dose of either medicine.',
    monitoring: 'Monitor total daily dose, liver risk with paracetamol/acetaminophen, and stomach/kidney risk with ibuprofen.',
    counseling: 'Check combination products so you do not accidentally double-dose paracetamol/acetaminophen.',
    source: 'MedLens seed interaction',
  },
];

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function pairId(drugs) {
  return drugs.map(slug).sort().join('__');
}

function normalizeSeverity(value) {
  const text = String(value || '').toLowerCase();
  if (['contraindicated', 'major', 'moderate', 'minor'].includes(text)) return text;
  if (text === 'severe') return 'major';
  return 'unknown';
}

function normalizeRecord(record) {
  const drugs = Array.isArray(record.drugs) ? record.drugs.map(String).map((x) => x.trim()).filter(Boolean) : [];
  if (drugs.length !== 2) throw new Error(`Interaction record must contain exactly two drugs: ${JSON.stringify(record)}`);
  const id = record.id || pairId(drugs);
  const sourceText = record.sourceText || [
    record.clinicalConcern,
    record.mechanism,
    record.management,
    record.monitoring,
    record.counseling,
  ].filter(Boolean).join('\n');
  return {
    id,
    drugs,
    normalizedDrugs: drugs.map(slug).sort(),
    severity: normalizeSeverity(record.severity),
    clinicalConcern: String(record.clinicalConcern || record.desc || '').trim(),
    mechanism: String(record.mechanism || '').trim(),
    management: String(record.management || '').trim(),
    monitoring: String(record.monitoring || '').trim(),
    counseling: String(record.counseling || '').trim(),
    evidence: String(record.evidence || '').trim(),
    source: String(record.source || 'Imported interaction source').trim(),
    sourceText,
    updatedAt: record.updatedAt || new Date().toISOString(),
  };
}

function readDatabaseEntries(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const entries = {};
  const re = /window\.MEDLENS_INTERACTIONS_DATABASE\[(["'`])([^"'`]+)\1\]\s*=\s*({[\s\S]*?});(?=\s*(?:window\.MEDLENS_INTERACTIONS_DATABASE\[|$))/g;
  let match;
  while ((match = re.exec(content))) entries[match[2]] = JSON.parse(match[3]);
  return entries;
}

function writeDatabaseFile(filePath, entries) {
  const ids = Object.keys(entries).sort((a, b) => a.localeCompare(b));
  const lines = ['window.MEDLENS_INTERACTIONS_DATABASE = window.MEDLENS_INTERACTIONS_DATABASE || {};', ''];
  for (const id of ids) {
    lines.push(`window.MEDLENS_INTERACTIONS_DATABASE[${JSON.stringify(id)}] = ${JSON.stringify(entries[id], null, 2)};`, '');
  }
  fs.writeFileSync(filePath, `${lines.join('\n').trimEnd()}\n`, 'utf8');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted && char === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === ',') {
      row.push(cell);
      cell = '';
    } else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  const headers = rows.shift().map((h) => h.trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function loadRecords(args) {
  if (args.seed) return SEED_INTERACTIONS;
  if (!args.file) throw new Error('Provide --seed or --file path/to/interactions.json|csv.');
  const filePath = path.resolve(process.cwd(), args.file);
  const text = fs.readFileSync(filePath, 'utf8');
  if (filePath.toLowerCase().endsWith('.csv')) return parseCsv(text);
  const parsed = JSON.parse(text);
  return Array.isArray(parsed) ? parsed : Object.values(parsed);
}

function parseArgs(argv) {
  const args = { apply: false, seed: false, file: '' };
  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--apply') args.apply = true;
    else if (value === '--seed') args.seed = true;
    else if (value === '--file') args.file = argv[++i];
    else if (value === '--help') args.help = true;
  }
  return args;
}

function printHelp() {
  console.log([
    'Usage:',
    '  node scripts/medlens-interactions-importer.cjs --seed --apply',
    '  node scripts/medlens-interactions-importer.cjs --file interactions.json --apply',
    '  node scripts/medlens-interactions-importer.cjs --file interactions.csv --apply',
    '',
    'CSV columns: drugs, severity, clinicalConcern, mechanism, management, monitoring, counseling, evidence, source',
    'For CSV, put the two drugs in the drugs column separated by +, /, |, or ;.',
  ].join('\n'));
}

function normalizeCsvRecord(record) {
  if (typeof record.drugs === 'string') {
    return { ...record, drugs: record.drugs.split(/\s*(?:\+|\/|\||;)\s*/).filter(Boolean) };
  }
  return record;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) return printHelp();
  const normalized = loadRecords(args).map(normalizeCsvRecord).map(normalizeRecord);
  const preview = {};
  for (const record of normalized) preview[record.id] = record;
  console.log(`Prepared ${normalized.length} interaction records.`);
  if (!args.apply) {
    console.log('Preview only. Run again with --apply to write into MedLens interaction database files.');
    Object.values(preview).forEach((record) => console.log(`${record.drugs.join(' + ')} | ${record.severity}`));
    return;
  }
  for (const target of TARGET_DB_FILES) {
    const entries = readDatabaseEntries(target);
    for (const record of normalized) entries[record.id] = record;
    writeDatabaseFile(target, entries);
  }
  console.log(`Saved ${normalized.length} interaction records into all MedLens interaction database files.`);
}

main();
