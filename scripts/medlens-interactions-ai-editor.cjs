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
const EDITOR_VERSION = 'medlens-interactions-ai-editor-v1-structured';
const TARGET_DB_FILES = [
  path.join(ROOT, 'medlens-interactions-database.js'),
  path.join(ROOT, 'www', 'medlens-interactions-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-interactions-database.js'),
];

function parseArgs(argv) {
  const args = { apply: false, all: false, limit: 1, pair: [], model: process.env.OPENAI_MODEL || 'gpt-5-mini', source: TARGET_DB_FILES[0], output: '', skipEdited: false };
  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--apply') args.apply = true;
    else if (value === '--all') args.all = true;
    else if (value === '--skip-edited') args.skipEdited = true;
    else if (value === '--limit') args.limit = Math.max(1, Number(argv[++i] || 1));
    else if (value === '--model') args.model = argv[++i];
    else if (value === '--source') args.source = path.resolve(process.cwd(), argv[++i]);
    else if (value === '--output') args.output = path.resolve(process.cwd(), argv[++i] || '');
    else if (value === '--pair') args.pair.push(argv[++i]);
    else if (value === '--help') args.help = true;
  }
  return args;
}

function printHelp() {
  console.log([
    'Usage:',
    '  node scripts/medlens-interactions-ai-editor.cjs --all --limit 5 --skip-edited --apply',
    '  node scripts/medlens-interactions-ai-editor.cjs --pair "Warfarin + Ibuprofen" --apply',
    '',
    'Run the interaction importer first if no records exist.',
    'Environment: OPENAI_API_KEY required in backend/.env or shell environment.',
  ].join('\n'));
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
  for (const id of ids) lines.push(`window.MEDLENS_INTERACTIONS_DATABASE[${JSON.stringify(id)}] = ${JSON.stringify(entries[id], null, 2)};`, '');
  fs.writeFileSync(filePath, `${lines.join('\n').trimEnd()}\n`, 'utf8');
}

function responseText(json) {
  if (typeof json.output_text === 'string') return json.output_text.trim();
  const chunks = [];
  for (const item of json.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

function isEdited(record) {
  return record && record.editor && record.editor.editorVersion === EDITOR_VERSION;
}

function findSelected(entries, args) {
  let records = Object.values(entries);
  if (args.skipEdited) records = records.filter((record) => !isEdited(record));
  if (args.pair.length) {
    const wanted = new Set(args.pair.map((pair) => pair.toLowerCase().replace(/\s+/g, ' ').trim()));
    records = records.filter((record) => wanted.has(record.drugs.join(' + ').toLowerCase()) || wanted.has(record.drugs.slice().reverse().join(' + ').toLowerCase()));
  } else if (!args.all) {
    records = records.slice(0, 1);
  }
  return records.slice(0, args.limit);
}

function buildPrompt(record) {
  return [
    'Rewrite this drug-drug interaction record into a concise, polished MedLens interaction safety card.',
    'Do not invent facts beyond the supplied source text. If a field is uncertain, say what is known and keep it conservative.',
    'Audience: pharmacists, nurses, pharmacy students, and careful patients.',
    '',
    'Return strict JSON with these string fields only:',
    'clinicalConcern, mechanism, management, monitoring, counseling, evidence, reviewNote',
    '',
    'Style rules:',
    '- Write clear, professional, educational language.',
    '- Remove repetition and raw database wording.',
    '- Make management practical and safety-first. Prioritize the most salient action only.',
    '- Keep each field very brief: ideally one sentence, maximum two short sentences. These cards are quick safety summaries, not drug articles.',
    '- Never say â€œno interactionâ€ unless the source directly supports that. Prefer â€œno MedLens record availableâ€ only outside this editor.',
    '',
    `Drug pair: ${record.drugs.join(' + ')}`,
    `Severity: ${record.severity || 'unknown'}`,
    `Source: ${record.source || 'MedLens interaction source'}`,
    '',
    'Source text:',
    record.sourceText || JSON.stringify(record, null, 2),
  ].join('\n');
}

async function editWithOpenAi(record, args) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing. Add it to backend/.env before running the interaction AI editor.');
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: args.model,
      input: [
        { role: 'system', content: 'You are a careful medical editor. Rewrite only from provided source text and return valid JSON.' },
        { role: 'user', content: buildPrompt(record) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI request failed (${res.status}): ${await res.text()}`);
  const text = responseText(await res.json());
  if (!text) throw new Error('OpenAI response did not contain output text.');
  return JSON.parse(text);
}

function applyEdit(record, edited, model) {
  return {
    ...record,
    clinicalConcern: edited.clinicalConcern || record.clinicalConcern || '',
    mechanism: edited.mechanism || record.mechanism || '',
    management: edited.management || record.management || '',
    monitoring: edited.monitoring || record.monitoring || '',
    counseling: edited.counseling || record.counseling || '',
    evidence: edited.evidence || record.evidence || '',
    editor: {
      provider: 'OpenAI',
      model,
      editedAt: new Date().toISOString(),
      editorVersion: EDITOR_VERSION,
      reviewNote: edited.reviewNote || '',
    },
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) return printHelp();
  const entries = readDatabaseEntries(args.source);
  const selected = findSelected(entries, args);
  if (!selected.length) {
    console.log('No interaction records selected.');
    return;
  }
  const editedEntries = {};
  for (const [index, record] of selected.entries()) {
    process.stdout.write(`\n[${index + 1}/${selected.length}] Editing ${record.drugs.join(' + ')} with ${args.model}... `);
    const edited = await editWithOpenAi(record, args);
    const next = applyEdit(record, edited, args.model);
    editedEntries[next.id] = next;
    process.stdout.write('done\n');
    if (args.apply) {
      for (const target of TARGET_DB_FILES) {
        const targetEntries = readDatabaseEntries(target);
        targetEntries[next.id] = next;
        writeDatabaseFile(target, targetEntries);
      }
      console.log(`Saved ${next.drugs.join(' + ')} into all MedLens interaction database files.`);
    }
  }
  if (args.output) {
    fs.writeFileSync(args.output, JSON.stringify(Object.values(editedEntries), null, 2), 'utf8');
    return;
  }
  if (!args.apply) {
    console.log('\nPreview edited records:');
    Object.values(editedEntries).forEach((record) => console.log(`${record.drugs.join(' + ')} | ${record.severity}`));
    console.log('Run again with --apply to save.');
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || error);
  process.exitCode = 1;
});