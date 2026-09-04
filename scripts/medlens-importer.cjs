#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { buildSectionContent, buildAgeSectionContent } = require('./medlens-monograph-schema.cjs');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DB_FILES = [
  path.join(ROOT, 'medlens-database.js'),
  path.join(ROOT, 'www', 'medlens-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-database.js'),
];

function parseArgs(argv) {
  const args = {
    apply: false,
    files: [],
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
    if (value.startsWith('-')) {
      throw new Error(`Unknown flag: ${value}`);
    }
    args.files.push(path.resolve(process.cwd(), value));
  }

  return args;
}

function normalizeText(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/Î²â‚‚/g, '&beta;<sub>2</sub>')
    .replace(/β₂/g, '&beta;<sub>2</sub>')
    .replace(/Î²/g, '&beta;')
    .replace(/β/g, '&beta;')
    .replace(/â€“/g, '&ndash;')
    .replace(/â€”/g, '&mdash;')
    .replace(/â†’/g, '&#x2192;')
    .replace(/â‰¥/g, '&ge;')
    .replace(/â‰¤/g, '&le;');
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'medlens-drug';
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

function escapeHtml(value) {
  return String(value || '')
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeTemplate(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseMetadata(text) {
  const meta = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const match = line.match(/^\*\*(.+?):\*\*\s*(.+)$/);
    if (!match) continue;
    const key = match[1].replace(/\*\*/g, '').trim();
    const value = match[2].replace(/\*\*/g, '').trim();
    meta[key] = value;
  }
  return meta;
}

function extractTitle(text) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? titleCaseIfNeeded(match[1]) : '';
}

function extractFootnotes(text) {
  const footnotes = {};
  const cleaned = text.replace(/^\[(\d+)\]:\s*(\S+)(?:\s+"([^"]+)")?\s*$/gm, function (_match, index, url) {
    footnotes[index] = url;
    return '';
  });
  return { cleaned, footnotes };
}

function splitAgeBlocks(text) {
  const lines = text.split('\n');
  const blocks = {
    adult: {},
    pediatric: {},
  };

  let age = null;
  let section = null;
  let buffer = [];

  function flush() {
    if (!age || !section) {
      buffer = [];
      return;
    }
    const value = buffer.join('\n').trim();
    if (value) {
      blocks[age][section] = value;
    }
    buffer = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const ageMatch = line.match(/^#\s+(ADULT|PEDIATRIC)\s*$/i);
    if (ageMatch) {
      flush();
      age = ageMatch[1].toLowerCase();
      section = null;
      continue;
    }

    const sectionMatch = line.match(/^##\s+(.+?)\s*$/);
    if (age && sectionMatch) {
      flush();
      section = sectionMatch[1].toLowerCase();
      continue;
    }

    if (age && section) {
      buffer.push(line);
    }
  }

  flush();
  return blocks;
}

function isListLine(line) {
  return /^(?:[*\-ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢]|\d+[.)])\s+/.test(line.trim());
}

function isTableSeparator(line) {
  return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(line.trim());
}

function splitTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(function (cell) {
      return cell.trim();
    });
}

function renderInline(text, footnotes) {
  let output = escapeHtml(text);

  output = output.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  output = output.replace(/\[([^\]]+)\]\[(\d+)\]/g, function (_match, label, index) {
    const url = footnotes[index];
    if (!url) return label;
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  output = output.replace(/&lt;sub&gt;/g, '<sub>');
  output = output.replace(/&lt;\/sub&gt;/g, '</sub>');

  return output;
}

function renderTable(lines, footnotes) {
  const header = splitTableRow(lines[0]);
  const bodyRows = [];
  let offset = 1;

  if (lines.length > 1 && isTableSeparator(lines[1])) {
    offset = 2;
  }

  for (let i = offset; i < lines.length; i += 1) {
    bodyRows.push(splitTableRow(lines[i]));
  }

  const thead = `<thead><tr>${header.map(function (cell) {
    return `<th>${renderInline(cell, footnotes)}</th>`;
  }).join('')}</tr></thead>`;

  const tbody = `<tbody>${bodyRows.map(function (row) {
    return `<tr>${row.map(function (cell) {
      return `<td>${renderInline(cell, footnotes)}</td>`;
    }).join('')}</tr>`;
  }).join('')}</tbody>`;

  return `<table class="dose-table">${thead}${tbody}</table>`;
}

function renderSectionHtml(raw, footnotes) {
  const text = normalizeText(raw).trim();
  if (!text) return '';

  const lines = text.split('\n');
  const parts = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith('|')) {
      const tableLines = [lines[i]];
      i += 1;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i]);
        i += 1;
      }
      parts.push(renderTable(tableLines, footnotes));
      continue;
    }

    if (/^#{1,6}\s+/.test(line)) {
      const level = Math.min(line.match(/^#+/)[0].length + 1, 6);
      const title = line.replace(/^#{1,6}\s+/, '');
      parts.push(`<h${level}>${renderInline(title, footnotes)}</h${level}>`);
      i += 1;
      continue;
    }

    if (isListLine(line)) {
      const items = [];
      while (i < lines.length && isListLine(lines[i])) {
        const item = lines[i].trim().replace(/^(?:[*\-ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢]|\d+[.)])\s+/, '');
        items.push(`<li>${renderInline(item, footnotes)}</li>`);
        i += 1;
      }
      parts.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    const paragraphLines = [line];
    i += 1;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (!next || next.startsWith('|') || /^#{1,6}\s+/.test(next) || isListLine(next)) {
        break;
      }
      paragraphLines.push(next);
      i += 1;
    }
    parts.push(`<p>${renderInline(paragraphLines.join(' '), footnotes)}</p>`);
  }

  return parts.join('');
}

function parseDrugMonograph(inputText, sourceName) {
  const normalized = normalizeText(inputText);
  const { cleaned, footnotes } = extractFootnotes(normalized);
  const title = extractTitle(cleaned);
  const meta = parseMetadata(cleaned);
  const sections = splitAgeBlocks(cleaned);

  const brand = titleCaseIfNeeded(meta['Common Brand'] || meta.Brand || title);
  const generic = titleCaseIfNeeded(meta.Components || meta['Generic'] || meta['Drug Name'] || title);
  const classLabel = titleCaseIfNeeded(meta['Drug Class'] || meta.Class || '');
  const route = titleCaseIfNeeded(meta.Route || '');
  const uses = titleCaseIfNeeded(meta['Main Uses'] || meta.Uses || '');
  const slugSource = brand || generic || title || sourceName || 'medlens-drug';
  const adultSections = sections.adult || {};
  const pediatricSections = sections.pediatric || {};

  function pickSection(sectionName) {
    return (
      adultSections[sectionName] ||
      adultSections.overview ||
      pediatricSections[sectionName] ||
      pediatricSections.overview ||
      ''
    );
  }

  const overviewSource = adultSections.overview || pediatricSections.overview || '';
  const overviewSection = buildSectionContent(renderSectionHtml(overviewSource, footnotes), 'overview');
  const indicationsSection = buildSectionContent(renderSectionHtml(adultSections.indications || adultSections['indications & usage'] || overviewSource || '', footnotes), 'indications');
  const doseSection = buildAgeSectionContent(
    renderSectionHtml(adultSections.dose || '', footnotes),
    renderSectionHtml(pediatricSections.dose || '', footnotes),
    'dose',
  );
  const mechanismSection = buildSectionContent(renderSectionHtml(adultSections.mechanism || '', footnotes) + renderSectionHtml(adultSections.pharmacodynamics || '', footnotes), 'mechanism');
  const warningsSection = buildSectionContent(renderSectionHtml(adultSections.warnings || '', footnotes), 'warnings');
  const contraindicationsSection = buildSectionContent(renderSectionHtml(adultSections.contraindications || '', footnotes), 'contraindications');
  const sideEffectsSection = buildSectionContent(renderSectionHtml(adultSections['side effects'] || adultSections.sideEffects || '', footnotes), 'sideEffects');
  const interactionsSection = buildSectionContent(renderSectionHtml(adultSections.interactions || '', footnotes), 'interactions');
  const pregnancySection = buildSectionContent(renderSectionHtml(adultSections.pregnancy || '', footnotes), 'pregnancy');
  const pediatricSection = buildSectionContent(renderSectionHtml(pediatricSections.pediatric || adultSections.pediatric || '', footnotes), 'pediatricUse');
  const geriatricSection = buildSectionContent(renderSectionHtml(adultSections.geriatric || '', footnotes), 'geriatricUse');
  const pharmacokineticsSection = buildSectionContent(renderSectionHtml(adultSections.pharmacokinetics || '', footnotes), 'pharmacokinetics');
  const clinicalStudiesSection = buildSectionContent(renderSectionHtml(adultSections.clinical_studies || '', footnotes), 'clinicalStudies');
  const overdosageSection = buildSectionContent(renderSectionHtml(adultSections.overdosage || '', footnotes), 'overdosage');
  const patientInfoSection = buildSectionContent(renderSectionHtml(adultSections.information_for_patients || '', footnotes), 'patientInfo');
  const formulationSection = buildSectionContent(renderSectionHtml(adultSections.formulation || '', footnotes), 'formulation');

  return {
    id: slugify(slugSource),
    brand: brand || titleCaseIfNeeded(title) || 'Unknown',
    generic: generic || titleCaseIfNeeded(title) || 'Unknown',
    class: classLabel,
    icon: '&#x1F48A;',
    hasPediatric: Object.keys(pediatricSections).length > 0,
    components: meta.Components ? titleCaseIfNeeded(meta.Components.replace(/\*\*/g, '')) : '',
    route: route,
    mainUses: uses,
    overview: renderSectionHtml(overviewSource, footnotes),
    dose: {
      adult: renderSectionHtml(adultSections.dose || '', footnotes),
      pediatric: renderSectionHtml(pediatricSections.dose || '', footnotes),
    },
    sideEffects: renderSectionHtml(adultSections['side effects'] || adultSections.sideEffects || '', footnotes),
    warnings: renderSectionHtml(adultSections.warnings || '', footnotes),
    contraindications: renderSectionHtml(adultSections.contraindications || '', footnotes),
    formulation: renderSectionHtml(adultSections.formulation || '', footnotes),
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
      source: {
        name: sourceName || 'DailyMed',
        url: 'https://open.fda.gov/apis/drug/label/',
        identifier: sourceName,
      },
    },
    sourceFile: sourceName,
  };
}

function formatDrugEntry(drug) {
  const lines = [
    '        {',
    `            id: '${escapeTemplate(drug.id)}',`,
    `            brand: '${escapeTemplate(drug.brand)}',`,
    `            generic: '${escapeTemplate(drug.generic)}',`,
    `            class: '${escapeTemplate(drug.class)}',`,
    `            icon: '${drug.icon}',`,
    drug.hasPediatric ? '            hasPediatric: true,' : null,
    drug.components ? `            components: '${escapeTemplate(drug.components)}',` : null,
    drug.route ? `            route: '${escapeTemplate(drug.route)}',` : null,
    drug.mainUses ? `            mainUses: '${escapeTemplate(drug.mainUses)}',` : null,
    `            overview: \`${escapeTemplate(drug.overview)}\`,`,
    '            dose: {',
    `                adult: \`${escapeTemplate(drug.dose.adult)}\`,`,
    `                pediatric: \`${escapeTemplate(drug.dose.pediatric)}\``,
    '            },',
    `            sideEffects: \`${escapeTemplate(drug.sideEffects)}\`,`,
    `            warnings: \`${escapeTemplate(drug.warnings)}\`,`,
    `            contraindications: \`${escapeTemplate(drug.contraindications)}\`,`,
    `            formulation: \`${escapeTemplate(drug.formulation)}\``,
    '        },',
  ].filter(Boolean);

  return lines.join('\n');
}

function formatDatabaseEntry(drug) {
  const payload = {
    id: drug.id,
    brand: drug.brand,
    generic: drug.generic,
    class: drug.class,
    icon: drug.icon,
    hasPediatric: !!drug.hasPediatric,
    components: drug.components || '',
    route: drug.route || '',
    mainUses: drug.mainUses || '',
    overview: drug.overview,
    dose: {
      adult: drug.dose.adult,
      pediatric: drug.dose.pediatric,
    },
    sideEffects: drug.sideEffects,
    warnings: drug.warnings,
    contraindications: drug.contraindications,
    formulation: drug.formulation,
  };

  return "window.MEDLENS_DATABASE[" + JSON.stringify(drug.id) + "] = " + JSON.stringify(payload, null, 2) + ";";
}

function upsertMedLensDatabaseFile(filePath, entries) {
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  }

  if (!content.trim()) {
    content = 'window.MEDLENS_DATABASE = window.MEDLENS_DATABASE || {};\n';
  }

  if (!content.includes('window.MEDLENS_DATABASE = window.MEDLENS_DATABASE || {};')) {
    content = 'window.MEDLENS_DATABASE = window.MEDLENS_DATABASE || {};\n' + content.trimStart() + '\n';
  }

  const block = entries.map(formatDatabaseEntry).join("\n\n");
  content = content.trimEnd();
  if (block) {
    content += "\n" + block + "\n";
  } else {
    content += "\n";
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/medlens-importer.cjs path/to/drug.txt',
    '  node scripts/medlens-importer.cjs path/to/drug1.txt path/to/drug2.txt --apply',
    '',
    'What it does:',
    '  - Parses pasted drug monographs into the MedLens object structure',
    '  - Keeps the full text rich instead of summarizing it',
    '  - Uses the pill icon by default',
    '  - With --apply, writes the generated drugs into the MedLens database files',
  ].join('\n'));
}

function main() {
  const args = parseArgs(process.argv);

  if (args.help || args.files.length === 0) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  const drugs = args.files.map(function (filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Input file not found: ${filePath}`);
    }
    const text = fs.readFileSync(filePath, 'utf8');
    return parseDrugMonograph(text, path.basename(filePath));
  });

  if (args.apply) {
    for (const target of TARGET_DB_FILES) {
      upsertMedLensDatabaseFile(target, drugs);
    }
    console.log(`Added ${drugs.length} drug entr${drugs.length === 1 ? 'y' : 'ies'} to the MedLens database.`);
    return;
  }

  drugs.forEach(function (drug, index) {
    if (index > 0) console.log('\n');
    console.log(formatDrugEntry(drug));
  });
}

main();


