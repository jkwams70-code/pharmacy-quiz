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
    const value = match[2].replace(/^['"]|['"]$/g, '');
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
  path.join(ROOT, 'medlens-database.js'),
  path.join(ROOT, 'www', 'medlens-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-database.js'),
];
const DEFAULT_SKIP_LIST_FILE = path.join(__dirname, 'medlens-ai-editor-skip.json');

const SOURCE_SECTION_DEFS = {
  overview: ['overview'],
  indicationDosage: ['indications', 'dose'],
  mechanism: ['mechanism', 'pharmacokinetics'],
  warningsContraindications: ['warnings', 'contraindications'],
  sideEffects: ['sideEffects'],
  interactions: ['interactions'],
  specialPopulation: ['pregnancy', 'pediatricUse', 'geriatricUse'],
  clinicalEvidence: ['clinicalStudies'],
  practicalInformation: ['formulation', 'storage', 'overdosage', 'patientInfo'],
};

const SOURCE_SECTION_LABELS = {
  overview: 'Overview',
  indications: 'Indications',
  dose: 'Dosage & Administration',
  mechanism: 'Mechanism of Action',
  pharmacokinetics: 'Pharmacokinetics',
  warnings: 'Warnings & Precautions',
  contraindications: 'Contraindications',
  sideEffects: 'Adverse Reactions',
  interactions: 'Drug Interactions',
  pregnancy: 'Pregnancy & Lactation',
  pediatricUse: 'Pediatric Use',
  geriatricUse: 'Geriatric Use',
  clinicalStudies: 'Clinical Studies',
  formulation: 'Formulations & Strengths',
  storage: 'Storage & Handling',
  overdosage: 'Overdosage',
  patientInfo: 'Patient Counseling',
};

const SECTION_DEFS = [
  { key: 'overview', label: 'Overview', standard: 'Write a polished high-yield orientation: what the drug is, class/route, main clinical role, and the one or two points a learner must remember. Target 120-180 words. Include one concise clinical callout only if it adds value.' },
  { key: 'indicationDosage', label: 'Indication & Dosage', standard: 'This is the richest and most important tab. Build a table-first dosing note grouped by approved indication. Include indication, adult dose, pediatric dose only when source supports it, maximum dose, titration, renal/hepatic adjustment, administration timing, and major dose-limiting cautions. After the table, add 2-4 short practical dose notes. Do not compress dosing into vague prose.' },
  { key: 'mechanism', label: 'Mechanism of Action', standard: 'Teach the mechanism clearly but briefly: simple explanation, key receptor/enzyme/transporter detail, and why that mechanism produces benefit or risk. Include only clinically useful pharmacokinetic points. Target 120-220 words.' },
  { key: 'warningsContraindications', label: 'Warnings & Contraindication', standard: 'Safety-first professional notes. Start with only the most important warning callout when supported. Then separate into Do not use, Use caution, and Monitor closely. Remove legal label phrasing and repetition. Target 150-280 words.' },
  { key: 'sideEffects', label: 'Adverse Reactions', standard: 'Keep it high-yield. Separate common/tolerability effects from serious urgent reactions. Avoid long adverse-event dumps and manufacturer reporting text. Use bullets and one warning callout only for major danger signs. Target 120-220 words.' },
  { key: 'interactions', label: 'Drug Interactions', standard: 'Group salient interactions by clinical action: Avoid, Use with caution, Monitor/adjust. Explain concern and practical response briefly. Do not list every theoretical interaction. Use a compact table when it improves scanning. Target 120-220 words.' },
  { key: 'specialPopulation', label: 'Special Population', standard: 'Concise notes for Pregnancy, Lactation, Pediatric use, Geriatric use, renal/hepatic impairment if source supports them. Say only what changes care. Target 120-220 words.' },
  { key: 'clinicalEvidence', label: 'Clinical Evidence', standard: 'Give a brief practical evidence snapshot: what was studied, in whom, what benefit/safety signal matters, and limitations. Avoid trial-data dumps. Target 100-180 words.' },
  { key: 'practicalInformation', label: 'Practical Information', standard: 'Short real-world use notes: formulations/strengths, storage/handling, overdosage first steps, and patient counseling. Use compact bullets/cards. Target 100-180 words.' },
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
  const args = {
    apply: false,
    all: false,
    limit: 1,
    model: process.env.OPENAI_MODEL || 'gpt-5-mini',
    source: TARGET_DB_FILES[0],
    drugs: [],
    skipEdited: false,
    ignoreSkipList: false,
    output: '',
    input: '',
  };

  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--apply') args.apply = true;
    else if (value === '--all') args.all = true;
    else if (value === '--skip-edited') args.skipEdited = true;
    else if (value === '--ignore-skip-list') args.ignoreSkipList = true;
    else if (value === '--drug') {
      if (!argv[i + 1]) throw new Error('Missing value for --drug');
      args.drugs.push(argv[++i]);
    } else if (value === '--limit') {
      if (!argv[i + 1]) throw new Error('Missing value for --limit');
      args.limit = Number(argv[++i]);
      if (!Number.isFinite(args.limit) || args.limit < 1) throw new Error('--limit must be a positive number');
    } else if (value === '--output') {
      if (!argv[i + 1]) throw new Error('Missing value for --output');
      args.output = path.resolve(process.cwd(), argv[++i]);
    } else if (value === '--input') {
      if (!argv[i + 1]) throw new Error('Missing value for --input');
      args.input = path.resolve(process.cwd(), argv[++i]);
    } else if (value === '--model') {
      if (!argv[i + 1]) throw new Error('Missing value for --model');
      args.model = argv[++i];
    } else if (value === '--source') {
      if (!argv[i + 1]) throw new Error('Missing value for --source');
      args.source = path.resolve(process.cwd(), argv[++i]);
    } else if (value === '--help' || value === '-h') {
      printUsage();
      process.exit(0);
    } else if (value.startsWith('-')) throw new Error(`Unknown flag: ${value}`);
    else args.drugs.push(value);
  }

  return args;
}

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/medlens-ai-editor.cjs --drug sertraline --apply',
    '  node scripts/medlens-ai-editor.cjs --drug "Warfarin Sodium" --model gpt-5 --apply',
    '  node scripts/medlens-ai-editor.cjs --all --limit 5 --apply',
    '',
    'Flags:',
    '  --drug <name-or-id>  Edit a specific drug by id, brand, or generic name',
    '  --all               Edit drugs from the database in alphabetical order',
    '  --limit <n>         Maximum drugs to edit when using --all. Default: 1',
    '  --model <model>     OpenAI model. Default: OPENAI_MODEL or gpt-5-mini',
    '  --apply             Write edited articles into all MedLens database files',
    '  --skip-edited       Skip drugs already edited with the current MedLens nine-tab standard (also automatic with --all)',
    '  --output <file>     Write edited JSON to a file without changing database files',
    '  --input <file>      Read source drug records from a JSON file',
    '',
    'Environment:',
    '  OPENAI_API_KEY      Required',
    '  OPENAI_MODEL        Optional default model override',
  ].join('\n'));
}

function readDatabaseEntries(filePath) {
  const entries = {};
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /window\.MEDLENS_DATABASE\[(?:"([^"]+)"|'([^']+)')\]\s*=\s*({[\s\S]*?})\s*;/g;
  let match;
  while ((match = regex.exec(content))) {
    const id = match[1] || match[2];
    entries[id] = JSON.parse(match[3]);
  }
  return entries;
}

function formatDatabaseEntry(drug) {
  return `window.MEDLENS_DATABASE[${JSON.stringify(drug.id)}] = ${JSON.stringify(drug, null, 2)};`;
}

function writeDatabaseFile(filePath, entries) {
  const sorted = Object.keys(entries).sort((a, b) => a.localeCompare(b));
  const lines = ['window.MEDLENS_DATABASE = window.MEDLENS_DATABASE || {};', ''];
  for (const id of sorted) {
    lines.push(formatDatabaseEntry(entries[id]));
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

function collectSectionHtml(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(collectSectionHtml).filter(Boolean).join('\n');
  if (typeof value !== 'object') return String(value || '');
  if (value.adult || value.pediatric) {
    return [
      value.detailsHtml,
      value.adult && value.adult.detailsHtml,
      value.pediatric && value.pediatric.detailsHtml,
    ].filter(Boolean).join('\n');
  }
  return [value.detailsHtml, value.details, value.html, value.body, value.content, value.text, value.summaryHtml, value.summary]
    .filter(Boolean)
    .join('\n');
}

function getDrugSourceSection(drug, key) {
  if (drug.monograph && drug.monograph[key]) return drug.monograph[key];
  if (drug[key]) return drug[key];
  const sourceLabel = drug.sourceLabel && typeof drug.sourceLabel === 'object' ? drug.sourceLabel : {};
  const labelKeys = {
    overview: ['description'],
    indications: ['indications_and_usage'],
    dose: ['dosage_and_administration'],
    mechanism: ['clinical_pharmacology'],
    pharmacokinetics: ['clinical_pharmacology'],
    warnings: ['warnings_and_cautions', 'boxed_warning'],
    contraindications: ['contraindications'],
    sideEffects: ['adverse_reactions'],
    interactions: ['drug_interactions'],
    pregnancy: ['pregnancy'],
    pediatricUse: ['pediatric_use'],
    geriatricUse: ['geriatric_use'],
    clinicalStudies: ['clinical_studies'],
    formulation: ['how_supplied'],
    storage: ['storage_and_handling'],
    overdosage: ['overdosage'],
    patientInfo: ['patient_information', 'package_label_principal_display_panel'],
  };
  return (labelKeys[key] || []).map((labelKey) => sourceLabel[labelKey]).filter(Boolean);
}

function buildSourcePayload(drug) {
  const sections = {};
  for (const def of SECTION_DEFS) {
    const sourceKeys = SOURCE_SECTION_DEFS[def.key] || [def.key];
    const chunks = [];
    for (const sourceKey of sourceKeys) {
      const source = getDrugSourceSection(drug, sourceKey);
      const html = collectSectionHtml(source);
      const text = stripHtml(html);
      if (text) chunks.push(`${SOURCE_SECTION_LABELS[sourceKey] || sourceKey}:\n${text}`);
    }
    const sourceText = chunks.join('\n\n').trim();
    if (sourceText) sections[def.key] = { label: def.label, standard: def.standard, sourceText: sourceText.slice(0, 12000) };
  }
  return {
    drug: {
      id: drug.id,
      brand: drug.brand,
      generic: drug.generic,
      class: drug.class,
      route: drug.route,
      components: drug.components,
    },
    sections,
  };
}
function hasMedLensAiArticle(drug) {
  return Boolean(drug && typeof drug === 'object' && (drug.aiEdited || drug.editor));
}

function isCurrentAiEdited(drug) {
  return hasMedLensAiArticle(drug);
}

function loadBaselineSkipIds(args = {}) {
  if (args.ignoreSkipList || !fs.existsSync(DEFAULT_SKIP_LIST_FILE)) return new Set();
  try {
    const parsed = JSON.parse(fs.readFileSync(DEFAULT_SKIP_LIST_FILE, 'utf8'));
    const ids = Array.isArray(parsed) ? parsed : parsed.drugIds;
    return new Set((Array.isArray(ids) ? ids : []).map((id) => String(id || '').trim()).filter(Boolean));
  } catch (error) {
    throw new Error('Could not read ' + DEFAULT_SKIP_LIST_FILE + ': ' + error.message);
  }
}
function drugSortName(drug) {
  return String((drug && (drug.brand || drug.generic || drug.id)) || '').toLowerCase();
}

function findDrugs(entries, args) {
  let list = Object.values(entries).sort((a, b) => drugSortName(a).localeCompare(drugSortName(b)));
  if (args.skipEdited || args.all) {
    const baselineSkipIds = loadBaselineSkipIds(args);
    list = list.filter((drug) => !isCurrentAiEdited(drug) && !baselineSkipIds.has(String(drug.id || '')));
  }
  if (args.all) return list.slice(0, args.limit);

  const needles = args.drugs.map((value) => String(value || '').trim().toLowerCase()).filter(Boolean);
  if (!needles.length) throw new Error('Provide --drug <name-or-id>, or use --all --limit <n>.');

  return needles.map((needle) => {
    const exact = list.find((drug) => [drug.id, drug.brand, drug.generic, drug.components]
      .some((value) => String(value || '').trim().toLowerCase() === needle));
    if (exact) return exact;
    const partial = list.find((drug) => [drug.id, drug.brand, drug.generic, drug.components]
      .some((value) => String(value || '').trim().toLowerCase().includes(needle)));
    if (!partial) throw new Error(`Drug not found in database: ${needle}`);
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

function articleJsonSchema() {
  const sectionProperties = {};
  for (const def of SECTION_DEFS) {
    const key = def.key;
    sectionProperties[key] = {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: 'string' },
        articleHtml: { type: 'string' },
        sourceUsed: { type: 'boolean' },
        visualPrompt: { type: 'string' },
      },
      required: ['title', 'articleHtml', 'sourceUsed', 'visualPrompt'],
    };
  }

  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      editorVersion: { type: 'string' },
      articleStyle: { type: 'string' },
      heroImagePrompt: { type: 'string' },
      sections: {
        type: 'object',
        additionalProperties: false,
        properties: sectionProperties,
        required: SECTION_DEFS.map((def) => def.key),
      },
      reviewNotes: { type: 'array', items: { type: 'string' } },
    },
    required: ['editorVersion', 'articleStyle', 'heroImagePrompt', 'sections', 'reviewNotes'],
  };
}

function buildPrompt(payload) {
  return [
    'You are the MedLens medical article editor.',
    '',
    'Rewrite FDA/openFDA source label text into polished MedLens educational monograph sections.',
    'Audience: pharmacy students, pharmacists, nurses, and careful patients.',
    '',
    'Required tab structure:',
    standard,
    '',
    'Hard rules:',
    '- Preserve medical meaning and do not invent facts not supported by the source text.',
    '- Remove FDA/legal boilerplate, reporting phone numbers, manufacturer promotional text, source section numbers, and cross references such as "(2.1)" or "[see Warnings and Precautions (5.3)]".',
    '- Remove repeated statements and collapse duplicates.',
    '- Write in clear article prose, not copied label language.',
    '- Use spacious paragraphs, bullet lists, short teaching notes, and dosing tables when helpful.',
    '- Keep non-dosing tabs concise but complete: usually 2-4 short paragraphs, 3-6 bullets, or one compact table plus key notes. Do not produce a long textbook chapter.',
    '- Prefer clear organization over exhaustive repetition. If the label repeats a point, write it once in the most useful place.',
    '- For dosage, convert dense label text into a rich practical table grouped by indication/population, with maximum dose, titration, adjustments, route/timing, and key administration notes when supported.',
    `- Use only these HTML tags/classes: ${ALLOWED_HTML}.`,
    '- Do not include h1/h2/h3 headings inside articleHtml. The app already renders the section title.',
    '- Do not include external links.',
    '- Leave articleHtml empty and sourceUsed false if the source has no useful content for that section.',
    '',
    'Callout guidance:',
    '- Use <div class="medlens-callout warning"><span class="medlens-callout-label">Clinical caution</span><p>...</p></div> for serious warnings.',
    '- Use <div class="medlens-callout dose"><span class="medlens-callout-label">Dose guidance</span><p>...</p></div> for important dosage instructions.',
    '- Use <div class="medlens-callout patient"><span class="medlens-callout-label">Patient counseling</span><p>...</p></div> for patient advice.',
    '- Use <div class="medlens-callout clinical"><span class="medlens-callout-label">Clinical note</span><p>...</p></div> for useful interpretation.',
    '',
    'Return JSON only.',
    '',
    JSON.stringify(payload, null, 2),
  ].join('\n');
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

function buildSectionPrompt(drug, key, label, standard, sourceText) {
  const drugMeta = {
    id: drug.id,
    brand: drug.brand,
    generic: drug.generic,
    class: drug.class,
    route: drug.route,
    components: drug.components,
  };

  return [
    'You are the MedLens medical article editor.',
    '',
    `Rewrite this combined FDA/openFDA source material into the MedLens article tab: ${label}.`,
    'Audience: pharmacy students, pharmacists, nurses, and careful patients.',
    '',
    'Required tab structure:',
    standard,
    '',
    'Hard rules:',
    '- Preserve medical meaning and do not invent facts not supported by the source text.',
    '- Remove FDA/legal boilerplate, reporting phone numbers, manufacturer promotional text, source section numbers, and cross references such as "(2.1)" or "[see Warnings and Precautions (5.3)]".',
    '- Remove repeated statements and collapse duplicates.',
    '- Write in clear article prose, not copied label language.',
    '- Use spacious paragraphs, bullet lists, short teaching notes, and dosing tables when helpful.',
    '- Keep non-dosing tabs concise but complete: usually 2-4 short paragraphs, 3-6 bullets, or one compact table plus key notes. Do not produce a long textbook chapter.',
    '- Prefer clear organization over exhaustive repetition. If the label repeats a point, write it once in the most useful place.',
    '- For dosage, convert dense label text into a rich practical table grouped by indication/population, with maximum dose, titration, adjustments, route/timing, and key administration notes when supported.',
    `- Use only these HTML tags/classes: ${ALLOWED_HTML}.`,
    '- Do not include h1/h2/h3 headings inside articleHtml. The app already renders the section title.',
    '- Do not include external links.',
    '',
    'Callout guidance:',
    '- Use <div class="medlens-callout warning"><span class="medlens-callout-label">Clinical caution</span><p>...</p></div> for serious warnings.',
    '- Use <div class="medlens-callout dose"><span class="medlens-callout-label">Dose guidance</span><p>...</p></div> for important dosage instructions.',
    '- Use <div class="medlens-callout patient"><span class="medlens-callout-label">Patient counseling</span><p>...</p></div> for patient advice.',
    '- Use <div class="medlens-callout clinical"><span class="medlens-callout-label">Clinical note</span><p>...</p></div> for useful interpretation.',
    '',
    'Return JSON only for this one section.',
    '',
    JSON.stringify({ drug: drugMeta, section: { key, label, standard, sourceText } }, null, 2),
  ].join('\n');
}
async function editSectionWithOpenAi(drug, key, label, standard, sourceText, args) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is missing. Add it to your environment or .env file before running the AI editor.');

  let res;
  try {
    res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: args.model,
        input: [
          { role: 'system', content: 'You are a careful medical editor. Rewrite only from provided source text and return valid JSON.' },
          { role: 'user', content: buildSectionPrompt(drug, key, label, standard, sourceText) },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'medlens_edited_section',
            strict: true,
            schema: sectionJsonSchema(),
          },
        },
      }),
    });
  } catch (error) {
    const cause = error.cause ? ` Cause: ${error.cause.code || ''} ${error.cause.message || error.cause}`.trim() : '';
    throw new Error(`OpenAI network request failed while editing ${label}: ${error.message}.${cause}`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI request failed while editing ${label} (${res.status}): ${body}`);
  }

  const json = await res.json();
  const text = responseText(json);
  if (!text) throw new Error(`OpenAI response did not contain output text for ${label}.`);
  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableOpenAiError(error) {
  const message = String(error && error.message ? error.message : error);
  return /ECONNRESET|ETIMEDOUT|ENOTFOUND|fetch failed|\(429\)|\(500\)|\(502\)|\(503\)|\(504\)/i.test(message);
}

async function editSectionWithRetry(drug, key, label, standard, sourceText, args) {
  const maxAttempts = 4;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await editSectionWithOpenAi(drug, key, label, standard, sourceText, args);
    } catch (error) {
      if (attempt === maxAttempts || !isRetryableOpenAiError(error)) throw error;
      const delayMs = 2000 * attempt;
      process.stdout.write(`retry ${attempt}/${maxAttempts} after ${delayMs / 1000}s... `);
      await sleep(delayMs);
    }
  }
  throw new Error(`Unable to edit ${label}.`);
}
async function editDrugWithOpenAi(drug, args) {
  const payload = buildSourcePayload(drug);
  const sections = {};
  const reviewNotes = [];

  for (const def of SECTION_DEFS) {
    const key = def.key;
    const label = def.label;
    const standard = def.standard;
    const sourceText = payload.sections[key] && payload.sections[key].sourceText;
    process.stdout.write(`\\n  - ${label}... `);
    if (!sourceText) {
      sections[key] = { title: label, articleHtml: '', sourceUsed: false, visualPrompt: '', reviewNotes: [] };
      process.stdout.write('done');
      continue;
    }

    const edited = await editSectionWithRetry(drug, key, label, standard, sourceText, args);
    sections[key] = {
      title: edited.title || label,
      articleHtml: edited.articleHtml || '',
      sourceUsed: Boolean(edited.sourceUsed && edited.articleHtml),
      visualPrompt: edited.visualPrompt || '',
    };
    if (Array.isArray(edited.reviewNotes)) reviewNotes.push(...edited.reviewNotes.map((note) => `${label}: ${note}`));
    process.stdout.write('done');
  }

  return {
    editorVersion: 'medlens-ai-editor-v2-nine-tab-standard',
    articleStyle: 'MedLens educational monograph',
    heroImagePrompt: `Professional medical education illustration for ${drug.brand || drug.generic || drug.id}, clean clinical style, no text labels.`,
    sections,
    reviewNotes,
  };
}
function applyEditedArticle(drug, edited, model) {
  const next = JSON.parse(JSON.stringify(drug));
  next.aiEdited = true;
  next.needsReview = true;
  next.editor = {
    provider: 'OpenAI',
    model,
    editedAt: new Date().toISOString(),
    editorVersion: edited.editorVersion || 'medlens-ai-editor-v1',
    articleStyle: edited.articleStyle || 'MedLens educational monograph',
    reviewNotes: edited.reviewNotes || [],
    heroImagePrompt: edited.heroImagePrompt || '',
  };
  next.monograph = next.monograph && typeof next.monograph === 'object' ? next.monograph : {};

  for (const def of SECTION_DEFS) {
    const key = def.key;
    const label = def.label;
    const standard = def.standard;
    const section = edited.sections && edited.sections[key];
    if (!section || !section.sourceUsed || !section.articleHtml) continue;
    next.monograph[key] = {
      summaryHtml: '',
      detailsHtml: section.articleHtml,
      title: section.title || label,
      visualPrompt: section.visualPrompt || '',
      aiEdited: true,
    };
    if (key !== 'dose') next[key] = section.articleHtml;
  }

  if (edited.sections && edited.sections.dose && edited.sections.dose.sourceUsed && edited.sections.dose.articleHtml) {
    next.dose = { adult: edited.sections.dose.articleHtml, pediatric: '' };
  }

  return next;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing. Add it to your environment or .env file before running the AI editor.');
  if (!fs.existsSync(args.source)) throw new Error(`Database file not found: ${args.source}`);

  const entries = args.input
    ? JSON.parse(fs.readFileSync(args.input, 'utf8'))
    : readDatabaseEntries(args.source);
  const selected = findDrugs(entries, args);
  const editedEntries = {};

  if (!selected.length) {
    console.log('No matching drugs found to edit.');
    return;
  }

  console.log(`Selected ${selected.length} drug${selected.length === 1 ? '' : 's'} for AI editing.`);

  for (const [index, drug] of selected.entries()) {
    process.stdout.write(`\n[${index + 1}/${selected.length}] Editing ${drug.brand || drug.id} with ${args.model}... `);
    const edited = await editDrugWithOpenAi(drug, args);
    const next = applyEditedArticle(drug, edited, args.model);
    editedEntries[next.id] = next;
    process.stdout.write('done\n');

    if (args.apply) {
      for (const target of TARGET_DB_FILES) {
        const targetEntries = readDatabaseEntries(target);
        targetEntries[next.id] = next;
        writeDatabaseFile(target, targetEntries);
      }
      console.log(`Saved ${next.brand || next.id} into all MedLens database files.`);
    }
  }

  if (args.output) {
    fs.mkdirSync(path.dirname(args.output), { recursive: true });
    fs.writeFileSync(args.output, JSON.stringify(Object.values(editedEntries), null, 2), 'utf8');
    console.log(`\nWrote ${Object.keys(editedEntries).length} edited record${Object.keys(editedEntries).length === 1 ? '' : 's'} to ${args.output}`);
  }

  if (!args.apply) {
    console.log('\nPreview edited entries:');
    for (const drug of Object.values(editedEntries)) {
      console.log(formatDatabaseEntry(drug));
      console.log('');
    }
    console.log('Run again with --apply to write these edits into the MedLens database files.');
    return;
  }

  const count = Object.keys(editedEntries).length;
  console.log(`\nSaved ${count} AI-edited drug article${count === 1 ? '' : 's'} into all MedLens database files.`);
  console.log('Marked edited records as needsReview=true so you can review before treating them as final.');
}
main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
