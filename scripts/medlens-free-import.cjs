#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { buildSectionContent, buildAgeSectionContent, normalizeLegacyDrugRecord } = require('./medlens-monograph-schema.cjs');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DB_FILES = [
  path.join(ROOT, 'medlens-database.js'),
  path.join(ROOT, 'www', 'medlens-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-database.js'),
];

const PRESETS = {
  common: [
    'albuterol',
    'acetaminophen',
    'amoxicillin',
    'amlodipine',
    'atorvastatin',
    'azithromycin',
    'budesonide',
    'budesonide formoterol',
    'carvedilol',
    'cetirizine',
    'ciprofloxacin',
    'clindamycin',
    'diclofenac',
    'doxycycline',
    'empagliflozin',
    'fluconazole',
    'fluticasone propionate',
    'fluticasone salmeterol',
    'furosemide',
    'ibuprofen',
    'insulin glargine',
    'insulin lispro',
    'ipratropium',
    'lisinopril',
    'losartan',
    'metformin',
    'metoprolol',
    'montelukast',
    'omeprazole',
    'ondansetron',
    'prednisone',
    'propranolol',
    'rosuvastatin',
    'salmeterol',
    'semaglutide',
    'sertraline',
    'spironolactone',
    'sulfamethoxazole trimethoprim',
    'tiotropium',
    'tramadol',
    'valacyclovir',
    'warfarin',
    'formoterol',
  ],
  respiratory: [
    'albuterol',
    'budesonide',
    'budesonide formoterol',
    'fluticasone propionate',
    'fluticasone salmeterol',
    'formoterol',
    'ipratropium',
    'montelukast',
    'salmeterol',
    'tiotropium',
  ],
  cardiometabolic: [
    'amlodipine',
    'atorvastatin',
    'carvedilol',
    'empagliflozin',
    'furosemide',
    'lisinopril',
    'losartan',
    'metformin',
    'metoprolol',
    'rosuvastatin',
    'semaglutide',
    'spironolactone',
    'warfarin',
  ],
  infection: [
    'amoxicillin',
    'azithromycin',
    'ciprofloxacin',
    'clindamycin',
    'doxycycline',
    'fluconazole',
    'metronidazole',
    'sulfamethoxazole trimethoprim',
    'valacyclovir',
  ],
};

const ALIASES = {
  salbutamol: 'albuterol',
  paracetamol: 'acetaminophen',
  coamoxiclav: 'amoxicillin clavulanate',
  'co-amoxiclav': 'amoxicillin clavulanate',
  'co-trimoxazole': 'sulfamethoxazole trimethoprim',
  'trimethoprim-sulfamethoxazole': 'sulfamethoxazole trimethoprim',
  beclometasone: 'beclomethasone',
  'budesonide-formoterol': 'budesonide formoterol',
  'fluticasone-salmeterol': 'fluticasone salmeterol',
};

function parseArgs(argv) {
  const args = {
    apply: false,
    help: false,
    preset: [],
    listFiles: [],
    terms: [],
  };

  for (let i = 2; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--apply') {
      args.apply = true;
      continue;
    }
    if (value === '--help' || value === '-h') {
      args.help = true;
      continue;
    }
    if (value === '--preset') {
      if (!argv[i + 1]) throw new Error('Missing value for --preset');
      args.preset.push(argv[++i]);
      continue;
    }
    if (value === '--list') {
      if (!argv[i + 1]) throw new Error('Missing value for --list');
      args.listFiles.push(path.resolve(process.cwd(), argv[++i]));
      continue;
    }
    if (value === '--source') {
      if (!argv[i + 1]) throw new Error('Missing value for --source');
      const source = argv[++i].toLowerCase();
      if (source !== 'openfda') {
        throw new Error(`Unsupported source: ${source}. Only openfda is wired right now.`);
      }
      continue;
    }
    if (value.startsWith('@')) {
      args.listFiles.push(path.resolve(process.cwd(), value.slice(1)));
      continue;
    }
    if (value.startsWith('-')) {
      throw new Error(`Unknown flag: ${value}`);
    }
    args.terms.push(value);
  }

  return args;
}

function normalizeText(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/ÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â½ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â²ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡/g, '&beta;<sub>2</sub>')
    .replace(/ÃƒÆ’Ã…Â½Ãƒâ€šÃ‚Â²ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡/g, '&beta;<sub>2</sub>')
    .replace(/ÃƒÆ’Ã†â€™Ãƒâ€¦Ã‚Â½ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â²/g, '&beta;')
    .replace(/ÃƒÆ’Ã…Â½Ãƒâ€šÃ‚Â²/g, '&beta;')
    .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“/g, '&ndash;')
    .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â/g, '&mdash;')
    .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢/g, '&#x2192;')
    .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥/g, '&ge;')
    .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤/g, '&le;');
}

function flattenValue(value) {
  if (Array.isArray(value)) {
    return value.map(flattenValue).filter(Boolean).join('\n');
  }
  if (value && typeof value === 'object') {
    return Object.values(value).map(flattenValue).filter(Boolean).join('\n');
  }
  return String(value || '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function titleCaseIfNeeded(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  if (text === text.toUpperCase() && /[A-Z]/.test(text)) {
    return text.toLowerCase().replace(/\b\w/g, function (match) {
      return match.toUpperCase();
    });
  }
  return text;
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'medlens-drug';
}

function stripBulletPrefix(line) {
  return line.replace(/^(?:[*\-ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢]|\d+[.)])\s+/, '').trim();
}

function isBulletLine(line) {
  return /^(?:[*\-ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢]|\d+[.)])\s+/.test(line.trim());
}

function renderRichText(value) {
  const text = normalizeText(flattenValue(value)).trim();
  if (!text) return '';

  const blocks = text.split(/\n{2,}/).map(function (block) {
    return block.trim();
  }).filter(Boolean);

  return blocks.map(function (block) {
    const lines = block.split('\n').map(function (line) {
      return line.trim();
    }).filter(Boolean);

    if (!lines.length) return '';

    if (lines.every(isBulletLine)) {
      return '<ul>' + lines.map(function (line) {
        return `<li>${escapeHtml(stripBulletPrefix(line))}</li>`;
      }).join('') + '</ul>';
    }

    return `<p>${escapeHtml(lines.join(' '))}</p>`;
  }).join('');
}

function sectionHtml(title, value, sectionKey) {
  const body = renderRichText(value);
  if (!body) return '';
  return '<h4>' + escapeHtml(title) + '</h4>' + body;
}
function summarizeText(value) {
  const text = normalizeText(flattenValue(value)).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  if (firstSentence.length <= 120) return firstSentence;
  return firstSentence.slice(0, 117).replace(/\s+\S*$/, '').trimEnd() + '...';
}

function joinDefinedSections(parts) {
  return parts.filter(Boolean).join('');
}

function pickFirst(value) {
  if (Array.isArray(value)) return value.find(Boolean) || '';
  return value || '';
}

function lowerSet(values) {
  return new Set(values.map(function (value) {
    return String(value || '').toLowerCase();
  }));
}

function normalizeQueryTerm(term) {
  const key = String(term || '').trim().toLowerCase();
  return ALIASES[key] || term;
}

function collectTerms(args) {
  const terms = [];
  for (const preset of args.preset) {
    const list = PRESETS[preset];
    if (!list) {
      throw new Error(`Unknown preset: ${preset}`);
    }
    terms.push(...list);
  }

  for (const filePath of args.listFiles) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`List file not found: ${filePath}`);
    }
    const listText = fs.readFileSync(filePath, 'utf8');
    terms.push(...listText.split(/\r?\n/).map(function (line) {
      return line.trim();
    }).filter(function (line) {
      return line && !line.startsWith('#');
    }));
  }

  terms.push(...args.terms);

  const seen = new Set();
  const cleaned = [];
  for (const term of terms) {
    const normalized = String(term || '').trim();
    if (!normalized) continue;
    const canonical = normalizeQueryTerm(normalized).trim();
    const key = canonical.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    cleaned.push(canonical);
  }
  return cleaned;
}

function buildQueries(term) {
  const variants = [term];
  const alias = normalizeQueryTerm(term);
  if (alias.toLowerCase() !== term.toLowerCase()) {
    variants.push(alias);
  }
  const queryTerms = Array.from(new Set(variants.map(function (value) {
    return String(value || '').trim();
  }).filter(Boolean)));

  const fields = [
    'openfda.brand_name',
    'openfda.generic_name',
    'openfda.substance_name',
    'active_ingredient',
  ];

  const queries = [];
  for (const queryTerm of queryTerms) {
    const escaped = queryTerm.replace(/"/g, '\\"');
    for (const field of fields) {
      queries.push(`${field}:"${escaped}"`);
    }
  }
  return queries;
}

function scoreLabelRecord(record, term) {
  const needle = String(term || '').toLowerCase();
  const openfda = record.openfda || {};
  const candidates = [
    ...(openfda.brand_name || []),
    ...(openfda.generic_name || []),
    ...(openfda.substance_name || []),
    ...(record.active_ingredient || []),
  ].map(function (value) {
    return String(value || '').toLowerCase();
  });

  let score = 0;
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate === needle) score = Math.max(score, 1000);
    else if (candidate.includes(needle)) score = Math.max(score, 500 + needle.length - candidate.length);
    else if (needle.includes(candidate)) score = Math.max(score, 250 + candidate.length);
  }

  if (record.indications_and_usage) score += 1;
  if (record.dosage_and_administration) score += 1;
  if (record.contraindications) score += 1;
  return score;
}

async function fetchOpenFdaLabels(term) {
  for (const query of buildQueries(term)) {
    const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=25&sort=effective_time:desc`;
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        continue;
      }
      const json = await res.json();
      const results = Array.isArray(json.results) ? json.results : [];
      if (!results.length) {
        continue;
      }
      const best = results
        .map(function (record) {
          return { record, score: scoreLabelRecord(record, term) };
        })
        .sort(function (a, b) {
          return b.score - a.score;
        })[0];
      if (best && best.record) {
        return best.record;
      }
    } catch (error) {
      // Try the next query.
    }
  }
  return null;
}

function buildDrugPayload(term, record) {
  const openfda = record.openfda || {};
  const brand = titleCaseIfNeeded(pickFirst(openfda.brand_name) || pickFirst(openfda.generic_name) || term);
  const generic = titleCaseIfNeeded(
    pickFirst(openfda.generic_name) ||
    pickFirst(openfda.substance_name) ||
    pickFirst(record.active_ingredient) ||
    brand ||
    term
  );
  const classLabel = titleCaseIfNeeded(pickFirst(openfda.pharm_class_epc) || pickFirst(openfda.pharm_class_moa) || '');
  const route = titleCaseIfNeeded(pickFirst(openfda.route) || '');
  const indications = sectionHtml('Indications & Usage', record.indications_and_usage, 'indications');
  const description = sectionHtml('Description', record.description, 'overview');
  const mechanism = sectionHtml('Mechanism of Action', record.mechanism_of_action, 'mechanism') + sectionHtml('Pharmacodynamics', record.pharmacodynamics, 'mechanism');
  const dose = sectionHtml('Dosage & Administration', record.dosage_and_administration, 'dose') + sectionHtml('Instructions for Use', record.instructions_for_use, 'dose');
  const interactions = sectionHtml('Drug Interactions', record.drug_interactions, 'interactions') + sectionHtml('Laboratory Test Interactions', record.drug_and_or_laboratory_test_interactions, 'interactions');
  const sideEffects = sectionHtml('Adverse Reactions', record.adverse_reactions, 'sideEffects');
  const warnings = sectionHtml('Boxed Warning', record.boxed_warning, 'warnings') + sectionHtml('Warnings & Precautions', record.warnings_and_precautions, 'warnings') + sectionHtml('General Precautions', record.general_precautions, 'warnings') + sectionHtml('Precautions', record.precautions, 'warnings');
  const contraindications = sectionHtml('Contraindications', record.contraindications, 'contraindications');
  const pregnancy = sectionHtml('Pregnancy', record.pregnancy, 'pregnancy') + sectionHtml('Labor and Delivery', record.labor_and_delivery, 'pregnancy') + sectionHtml('Nursing Mothers', record.nursing_mothers, 'pregnancy') + sectionHtml('Nonteratogenic Effects', record.nonteratogenic_effects, 'pregnancy');
  const pediatricUse = sectionHtml('Pediatric Use', record.pediatric_use, 'pediatricUse');
  const geriatricUse = sectionHtml('Geriatric Use', record.geriatric_use, 'geriatricUse');
  const pharmacokinetics = sectionHtml('Pharmacokinetics', record.pharmacokinetics, 'pharmacokinetics');
  const clinicalStudies = sectionHtml('Clinical Studies', record.clinical_studies, 'clinicalStudies');
  const overdosage = sectionHtml('Overdosage', record.overdosage, 'overdosage');
  const patientInfo = sectionHtml('Information for Patients', record.information_for_patients, 'patientInfo') + sectionHtml('Patient Medication Information', record.patient_medication_information, 'patientInfo');
  const formulation = sectionHtml('Dosage Forms & Strengths', record.dosage_forms_and_strengths, 'formulation') + sectionHtml('How Supplied', record.how_supplied, 'formulation');
  const storage = sectionHtml('Storage & Handling', record.storage_and_handling, 'storage') + sectionHtml('Disposal & Waste Handling', record.disposal_and_waste_handling, 'storage');

  const overview = joinDefinedSections([
    indications,
    description,
    mechanism,
  ]);
  const overviewSection = buildSectionContent(overview || indications || description, 'overview');
  const indicationsSection = buildSectionContent(indications, 'indications');
  const doseSection = buildAgeSectionContent(
    dose || sectionHtml('Dosage & Administration', record.dosage_forms_and_strengths),
    pediatricUse || dose,
    'dose',
  );
  const mechanismSection = buildSectionContent(mechanism, 'mechanism');
  const warningsSection = buildSectionContent(warnings, 'warnings');
  const contraindicationsSection = buildSectionContent(contraindications, 'contraindications');
  const sideEffectsSection = buildSectionContent(sideEffects, 'sideEffects');
  const interactionsSection = buildSectionContent(interactions, 'interactions');
  const pregnancySection = buildSectionContent(pregnancy, 'pregnancy');
  const pediatricSection = buildSectionContent(pediatricUse, 'pediatricUse');
  const geriatricSection = buildSectionContent(geriatricUse, 'geriatricUse');
  const pharmacokineticsSection = buildSectionContent(pharmacokinetics, 'pharmacokinetics');
  const clinicalStudiesSection = buildSectionContent(clinicalStudies, 'clinicalStudies');
  const overdosageSection = buildSectionContent(overdosage, 'overdosage');
  const patientInfoSection = buildSectionContent(patientInfo, 'patientInfo');
  const formulationSection = buildSectionContent(formulation, 'formulation');
  const storageSection = buildSectionContent(storage, 'storage');

  const hasPediatric = Boolean(renderRichText(record.pediatric_use) || renderRichText(record.information_for_patients));
  const sourceLink = `https://open.fda.gov/apis/drug/label/`;

  return {
    id: slugify(brand || generic || term),
    brand,
    generic,
    class: classLabel,
    icon: '&#x1F48A;',
    hasPediatric,
    components: titleCaseIfNeeded(pickFirst(openfda.substance_name) || generic),
    route,
    mainUses: summarizeText(record.indications_and_usage) || titleCaseIfNeeded(pickFirst(record.indications_and_usage) || ''),
    overview: overview || indications || description,
    indications,
    dose: {
      adult: dose || sectionHtml('Dosage & Administration', record.dosage_forms_and_strengths),
      pediatric: pediatricUse || dose,
    },
    sideEffects,
    warnings,
    contraindications,
    formulation: formulation || storage,
    interactions,
    mechanism,
    pregnancy,
    pediatricUse,
    geriatricUse,
    pharmacokinetics,
    clinicalStudies,
    overdosage,
    patientInfo,
    storage,
    monograph: {
      overview: overviewSection,
      indications: indicationsSection,
      dose: doseSection,
      mechanism: mechanismSection,
      warnings: warningsSection,
      contraindications: contraindicationsSection,
      sideEffects: sideEffectsSection,
      interactions: interactionsSection,
      pregnancy: pregnancySection,
      pediatricUse: pediatricSection,
      geriatricUse: geriatricSection,
      pharmacokinetics: pharmacokineticsSection,
      clinicalStudies: clinicalStudiesSection,
      overdosage: overdosageSection,
      patientInfo: patientInfoSection,
      formulation: formulationSection,
      storage: storageSection,
      source: {
        name: 'openFDA',
        url: sourceLink,
        identifier: term,
        labelVersion: String(record.effective_time || record.version || '').trim(),
      },
    },
    sourceFile: term,
    sourceLink,
  };
}

function formatDatabaseEntry(drug) {
  return `window.MEDLENS_DATABASE[${JSON.stringify(drug.id)}] = ${JSON.stringify(drug, null, 2)};`;
}

function readDatabaseEntries(filePath) {
  const entries = {};
  if (!fs.existsSync(filePath)) return entries;
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /window\.MEDLENS_DATABASE\[(?:"([^"]+)"|'([^']+)')\]\s*=\s*({[\s\S]*?})\s*;/g;
  let match;
  while ((match = regex.exec(content))) {
    const id = match[1] || match[2];
    try {
      entries[id] = normalizeLegacyDrugRecord(JSON.parse(match[3]));
    } catch (error) {
      // Ignore malformed entries and keep going.
    }
  }
  return entries;
}

function writeDatabaseFile(filePath, entries) {
  const sorted = Object.keys(entries).sort(function (a, b) {
    return a.localeCompare(b);
  });
  const lines = ['window.MEDLENS_DATABASE = window.MEDLENS_DATABASE || {};', ''];
  for (const id of sorted) {
    lines.push(formatDatabaseEntry(entries[id]));
    lines.push('');
  }
  fs.writeFileSync(filePath, lines.join('\n').trimEnd() + '\n', 'utf8');
}

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/medlens-free-import.cjs --preset common --apply',
    '  node scripts/medlens-free-import.cjs albuterol metformin --apply',
    '  node scripts/medlens-free-import.cjs --list drugs.txt --apply',
    '',
    'Flags:',
    '  --preset <name>   Load a built-in drug list. Available: common, respiratory, cardiometabolic, infection',
    '  --list <file>     Read one drug name per line from a text file',
    '  --apply           Write the fetched drugs into all MedLens database files',
    '',
    'Notes:',
    '  - Uses openFDA drug labeling data.',
    '  - Fills rich sections automatically when the source contains them.',
    '  - Keeps the pill icon by default.',
  ].join('\n'));
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help || (args.preset.length === 0 && args.listFiles.length === 0 && args.terms.length === 0)) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  const terms = collectTerms(args);
  if (!terms.length) {
    throw new Error('No drug names were provided.');
  }

  const results = [];
  const failures = [];

  for (const term of terms) {
    process.stdout.write(`Fetching ${term}... `);
    const record = await fetchOpenFdaLabels(term);
    if (!record) {
      process.stdout.write('not found\n');
      failures.push(term);
      continue;
    }
    const drug = buildDrugPayload(term, record);
    results.push(drug);
    process.stdout.write(`${drug.brand} (${drug.generic})\n`);
  }

  if (!results.length) {
    throw new Error('No drugs were fetched from openFDA.');
  }

  if (args.apply) {
    for (const target of TARGET_DB_FILES) {
      const existing = readDatabaseEntries(target);
      for (const drug of results) {
        existing[drug.id] = drug;
      }
      writeDatabaseFile(target, existing);
    }
    console.log(`\nImported ${results.length} drug entr${results.length === 1 ? 'y' : 'ies'} into the MedLens database files.`);
  } else {
    console.log('\nPreview:');
    console.log(results.map(function (drug) {
      return formatDatabaseEntry(drug);
    }).join('\n\n'));
  }

  if (failures.length) {
    console.log(`\nNot found: ${failures.join(', ')}`);
  }
}

main().catch(function (error) {
  console.error(error.message || error);
  process.exit(1);
});


