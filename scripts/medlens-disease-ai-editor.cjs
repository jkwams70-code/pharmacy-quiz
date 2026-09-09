#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadEnvFile(envPath, options = {}) {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2].replace(/^["']|["']$/g, '');
    if (options.override || !process.env[key] || process.env[key] === 'put_your_api_key_here') process.env[key] = value;
  }
}

function loadLocalEnv() {
  loadEnvFile(path.resolve(__dirname, '..', '.env'));
  loadEnvFile(path.resolve(__dirname, '..', 'backend', '.env'), { override: true });
}

loadLocalEnv();

const ROOT = path.resolve(__dirname, '..');
const TARGET_DB_FILES = [
  path.join(ROOT, 'medlens-disease-database.js'),
  path.join(ROOT, 'www', 'medlens-disease-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-disease-database.js'),
];
const EDITOR_VERSION = 'medlens-disease-ai-editor-v1-nine-tab-standard';

const SECTION_DEFS = [
  { key: 'overview', label: 'Overview', standard: 'Open with a practical high-yield orientation: what the condition is, why it matters, who is commonly affected, and the key clinical idea to remember. Target 120-180 words.' },
  { key: 'causesRiskFactors', label: 'Causes & Risk Factors', standard: 'Explain only the important causes, drivers, triggers, and risk factors. Separate modifiable and non-modifiable risks when useful. Target 120-220 words.' },
  { key: 'clinicalPresentation', label: 'Clinical Presentation', standard: 'Show typical symptoms/signs, severity clues, and red flags. Mention special presentations only when clinically useful. Use bullets for scanning. Target 140-240 words.' },
  { key: 'diagnosis', label: 'Diagnosis', standard: 'Organize key diagnostic criteria, tests, interpretation, and urgent evaluation triggers. Use a compact table when helpful. Avoid exhaustive differential lists. Target 150-260 words.' },
  { key: 'treatmentManagement', label: 'Treatment & Management', standard: 'Make management practical and high-yield: initial approach, non-drug care, key medicines, escalation, monitoring, referral/hospitalization triggers, and follow-up. Target 180-300 words.' },
  { key: 'complications', label: 'Complications', standard: 'Separate acute and chronic complications. Highlight only serious/life-threatening complications in a warning callout. Avoid rare lists unless they change care. Target 100-180 words.' },
  { key: 'prevention', label: 'Prevention', standard: 'Focus on prevention actions that matter: lifestyle, screening, vaccination/prophylaxis, trigger control, and risk reduction. Target 100-180 words.' },
  { key: 'patientEducation', label: 'Patient Education', standard: 'Write patient-friendly counseling: self-care, adherence, what to monitor, when to seek urgent care, and common misconceptions. Target 100-180 words.' },
  { key: 'clinicalEvidence', label: 'Clinical Evidence', standard: 'Brief evidence or guideline snapshot: what is well established, what is uncertain, and why it matters clinically. Avoid citation dumps. Target 90-160 words.' },
];

const ALLOWED_HTML = [
  'p', 'ul', 'ol', 'li', 'strong', 'em', 'u', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div class="medlens-callout clinical"',
  'div class="medlens-callout warning"',
  'div class="medlens-callout dose"',
  'div class="medlens-callout patient"',
  'span class="medlens-callout-label"',
].join(', ');

function parseArgs(argv) {
  const args = { apply: false, all: false, limit: 1, model: process.env.OPENAI_MODEL || 'gpt-5-mini', source: TARGET_DB_FILES[0], output: '', diseases: [], skipEdited: false };
  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--apply') args.apply = true;
    else if (value === '--all') args.all = true;
    else if (value === '--skip-edited') args.skipEdited = true;
    else if (value === '--disease') args.diseases.push(argv[++i] || '');
    else if (value === '--limit') args.limit = Math.max(1, Number(argv[++i]) || 1);
    else if (value === '--model') args.model = argv[++i] || args.model;
    else if (value === '--source') args.source = path.resolve(process.cwd(), argv[++i] || '');
    else if (value === '--output') args.output = path.resolve(process.cwd(), argv[++i] || '');
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
    '  node scripts/medlens-disease-ai-editor.cjs --disease "Asthma" --apply',
    '  node scripts/medlens-disease-ai-editor.cjs --all --limit 5 --skip-edited --apply',
    '',
    'Run the fetcher first if the disease is not already in medlens-disease-database.js.',
  ].join('\n'));
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

function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|table)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<t[hd][^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function collectSourceText(disease) {
  const chunks = [];
  const oldKeys = ['overview', 'etiology', 'presentation', 'diagnosis', 'management', 'complications', 'prevention'];
  for (const key of oldKeys) {
    const text = stripHtml(disease[key]);
    if (text) chunks.push(`${key}:\n${text}`);
  }
  if (Array.isArray(disease.rawSources)) {
    for (const source of disease.rawSources) {
      const text = String(source?.sourceText || '').trim();
      if (text) chunks.push(`${source.provider || 'source'} ${source.title || disease.name}:\n${text}`);
    }
  }
  return chunks.join('\n\n').slice(0, 18000);
}

function isCurrentAiEdited(disease) {
  return Boolean(disease?.editor?.editorVersion === EDITOR_VERSION);
}

function diseaseSortName(disease) {
  return String(disease?.name || disease?.id || '').toLowerCase();
}

function findDiseases(entries, args) {
  let list = Object.values(entries).sort((a, b) => diseaseSortName(a).localeCompare(diseaseSortName(b)));
  if (args.skipEdited) list = list.filter((disease) => !isCurrentAiEdited(disease));
  if (args.all) return list.slice(0, args.limit);
  const needles = args.diseases.map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
  if (!needles.length) throw new Error('Provide --disease <name-or-id>, or use --all --limit <n>.');
  return needles.map((needle) => {
    const exact = list.find((disease) => [disease.id, disease.name].some((value) => String(value || '').toLowerCase() === needle));
    if (exact) return exact;
    const partial = list.find((disease) => [disease.id, disease.name].some((value) => String(value || '').toLowerCase().includes(needle)));
    if (!partial) throw new Error(`Disease not found: ${needle}`);
    return partial;
  });
}

function responseText(json) {
  if (typeof json.output_text === 'string') return json.output_text;
  const chunks = [];
  for (const item of json.output || []) {
    for (const content of item.content || []) {
      if ((content.type === 'output_text' || content.type === 'text') && content.text) chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

function sectionJsonSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      title: { type: 'string' },
      articleHtml: { type: 'string' },
      sourceUsed: { type: 'boolean' },
      visualPrompt: { type: 'string' },
      reviewNotes: { type: 'array', items: { type: 'string' } },
    },
    required: ['title', 'articleHtml', 'sourceUsed', 'visualPrompt', 'reviewNotes'],
  };
}

function buildSectionPrompt(disease, def, sourceText) {
  return [
    'You are the MedLens disease article editor.',
    '',
    `Rewrite the provided disease source material into the MedLens article tab: ${def.label}.`,
    'Audience: pharmacy students, pharmacists, nurses, and careful patients.',
    '',
    'Required section standard:',
    def.standard,
    '',
    'Hard rules:',
    '- Preserve medical meaning and do not invent facts not supported by the source material.',
    'MedLens editorial standard:',
    '- Write the most clinically useful 20-30% of the source, not a compressed copy of everything available.',
    '- Prefer high-yield learning and care decisions over exhaustive detail.',
    '- Each tab should feel like professional notes: spacious, scannable, calm, and intentionally organized.',
    '- Avoid clumpy paragraphs. Use short paragraphs, bullets, compact tables, and one useful callout when appropriate.',
    '- Remove raw encyclopedia/source phrasing, duplicate statements, citation brackets, edit notes, and irrelevant history/trivia.',
    '- Write as a professional MedLens educational article, not copied source text.',
    '- Use spacious paragraphs, bullet lists, tables, and highlighted teaching callouts when useful.',
    '- Keep each tab concise but complete: usually 2-4 short paragraphs, 3-6 bullets, or one compact table plus key notes.',
    '- Do not include external links or h1/h2/h3 headings inside articleHtml.',
    `- Use only these HTML tags/classes: ${ALLOWED_HTML}.`,
    '',
    'Callout guidance:',
    '- Use <div class="medlens-callout warning"><span class="medlens-callout-label">Red flag</span><p>...</p></div> for dangerous symptoms or urgent complications.',
    '- Use <div class="medlens-callout clinical"><span class="medlens-callout-label">Clinical note</span><p>...</p></div> for practical interpretation.',
    '- Use <div class="medlens-callout patient"><span class="medlens-callout-label">Patient education</span><p>...</p></div> for patient-facing advice.',
    '',
    'Return JSON only for this one section.',
    '',
    JSON.stringify({ disease: { id: disease.id, name: disease.name, category: disease.category, sourceProvider: disease.sourceProvider, sourceUrl: disease.sourceUrl }, section: def, sourceText }, null, 2),
  ].join('\n');
}

async function editSectionWithOpenAi(disease, def, sourceText, args) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing. Add it to backend/.env before running the disease AI editor.');
  let res;
  try {
    res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: args.model,
        input: [
          { role: 'system', content: 'You are a careful medical editor. Rewrite only from provided source text and return valid JSON.' },
          { role: 'user', content: buildSectionPrompt(disease, def, sourceText) },
        ],
        text: { format: { type: 'json_schema', name: 'medlens_disease_section', strict: true, schema: sectionJsonSchema() } },
      }),
    });
  } catch (error) {
    const cause = error.cause ? ` Cause: ${error.cause.code || ''} ${error.cause.message || error.cause}`.trim() : '';
    throw new Error(`OpenAI network request failed while editing ${def.label}: ${error.message}.${cause}`);
  }
  if (!res.ok) throw new Error(`OpenAI request failed while editing ${def.label} (${res.status}): ${await res.text()}`);
  const text = responseText(await res.json());
  if (!text) throw new Error(`OpenAI response did not contain output text for ${def.label}.`);
  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableOpenAiError(error) {
  return /ECONNRESET|ETIMEDOUT|ENOTFOUND|fetch failed|\(429\)|\(500\)|\(502\)|\(503\)|\(504\)/i.test(String(error?.message || error));
}

async function editSectionWithRetry(disease, def, sourceText, args) {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await editSectionWithOpenAi(disease, def, sourceText, args);
    } catch (error) {
      if (attempt === maxAttempts || !isRetryableOpenAiError(error)) throw error;
      const delayMs = 2000 * attempt;
      process.stdout.write(`retry ${attempt}/${maxAttempts} after ${delayMs / 1000}s... `);
      await sleep(delayMs);
    }
  }
}

async function editDiseaseWithOpenAi(disease, args) {
  const sourceText = collectSourceText(disease);
  if (!sourceText) throw new Error(`No source material available for ${disease.name || disease.id}. Run the disease fetcher first.`);
  const sections = {};
  const reviewNotes = [];
  for (const def of SECTION_DEFS) {
    process.stdout.write(`\n  - ${def.label}... `);
    const edited = await editSectionWithRetry(disease, def, sourceText, args);
    sections[def.key] = {
      title: edited.title || def.label,
      articleHtml: edited.articleHtml || '',
      sourceUsed: Boolean(edited.sourceUsed && edited.articleHtml),
      visualPrompt: edited.visualPrompt || '',
    };
    if (Array.isArray(edited.reviewNotes)) reviewNotes.push(...edited.reviewNotes.map((note) => `${def.label}: ${note}`));
    process.stdout.write('done');
  }
  return { editorVersion: EDITOR_VERSION, articleStyle: 'MedLens educational disease article', heroImagePrompt: `Professional medical education illustration for ${disease.name || disease.id}, clean clinical style, no text labels.`, sections, reviewNotes };
}

function applyEditedArticle(disease, edited, model) {
  const next = JSON.parse(JSON.stringify(disease));
  next.aiEdited = true;
  next.needsReview = true;
  next.editor = { provider: 'OpenAI', model, editedAt: new Date().toISOString(), editorVersion: edited.editorVersion, articleStyle: edited.articleStyle, reviewNotes: edited.reviewNotes || [], heroImagePrompt: edited.heroImagePrompt || '' };
  next.monograph = next.monograph && typeof next.monograph === 'object' ? next.monograph : {};
  for (const def of SECTION_DEFS) {
    const section = edited.sections?.[def.key];
    if (!section?.sourceUsed || !section.articleHtml) continue;
    next.monograph[def.key] = { title: section.title || def.label, detailsHtml: section.articleHtml, visualPrompt: section.visualPrompt || '', aiEdited: true };
  }
  return next;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing. Add it to backend/.env before running the disease AI editor.');
  const entries = readDatabaseEntries(args.source);
  const selected = findDiseases(entries, args);
  if (!selected.length) {
    console.log('No matching diseases found to edit.');
    return;
  }
  console.log(`Selected ${selected.length} disease${selected.length === 1 ? '' : 's'} for AI editing.`);
  const editedEntries = {};
  for (const [index, disease] of selected.entries()) {
    process.stdout.write(`\n[${index + 1}/${selected.length}] Editing ${disease.name || disease.id} with ${args.model}... `);
    const edited = await editDiseaseWithOpenAi(disease, args);
    const next = applyEditedArticle(disease, edited, args.model);
    editedEntries[next.id] = next;
    process.stdout.write('done\n');
    if (args.apply) {
      for (const target of TARGET_DB_FILES) {
        const targetEntries = readDatabaseEntries(target);
        targetEntries[next.id] = next;
        writeDatabaseFile(target, targetEntries);
      }
      console.log(`Saved ${next.name || next.id} into all MedLens disease database files.`);
    }
  }
  if (args.output) {
    fs.writeFileSync(args.output, JSON.stringify(Object.values(editedEntries), null, 2), 'utf8');
    return;
  }
  if (!args.apply) {
    console.log('\nPreview edited entries:');
    Object.values(editedEntries).forEach((entry) => console.log(formatEntry(entry), '\n'));
    console.log('Run again with --apply to save.');
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});