function decodeMedLensEntities(value) {
  return String(value || '')
    .replace(/&beta;/gi, 'β')
    .replace(/&ge;/gi, '≥')
    .replace(/&le;/gi, '≤')
    .replace(/&sup2;/gi, '²')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&#x2192;/gi, '→')
    .replace(/&nbsp;/gi, ' ');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&(?!(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cleanMedLensLeadIn(value) {
  return String(value || '')
    .replace(/^(?:\d+(?:\.\d+)?\s+)?(?:BOXED WARNING|INDICATIONS?(?:\s+AND\s+|\s*&\s*)USE|DOSAGE AND ADMINISTRATION|MECHANISM OF ACTION|WARNINGS?(?:\s+AND\s+|\s*&\s*)PRECAUTIONS|ADVERSE REACTIONS|DRUG INTERACTIONS|PREGNANCY(?: AND LACTATION)?|PEDIATRIC USE|GERIATRIC USE|PHARMACOKINETICS|CLINICAL STUDIES|OVERDOSAGE|STORAGE(?:\s+AND\s+|\s*&\s*)HANDLING|PATIENT COUNSELING(?: INFORMATION)?|DOSAGE FORMS(?:\s+AND\s+|\s*&\s*)STRENGTHS|HOW SUPPLIED|DESCRIPTION|SIDE EFFECTS|GENERAL PRECAUTIONS|PRECAUTIONS|INFORMATION FOR PATIENTS)\b[:\s-]*/i, '')
    .replace(/^(?:\d+(?:\.\d+)?\s+)?(?:[A-Z][A-Z/&\-\s]{4,})\s+/, '')
}

function stripMedLensHtml(value) {
  return cleanMedLensLeadIn(decodeMedLensEntities(String(value || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr|table)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<t[hd][^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()));
}

function shortenMedLensText(value, maxChars) {
  const text = stripMedLensHtml(value);
  if (!text) return '';
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  if (firstSentence.length <= maxChars) return firstSentence;
  const clipped = firstSentence.slice(0, maxChars).replace(/\s+\S*$/, '').trimEnd();
  return (clipped || firstSentence.slice(0, maxChars).trimEnd()) + '...';
}

function collectMedLensBlocks(value) {
  const raw = String(value || '');
  const blocks = [];
  const seen = new Set();
  const add = function (type, content, maxChars) {
    const text = shortenMedLensText(content, maxChars || 260);
    const key = type + '|' + text;
    if (text && !seen.has(key)) {
      seen.add(key);
      blocks.push({ type: type, text: text });
    }
  };

  raw.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function (_, chunk) {
    add('li', chunk, 220);
    return '';
  });
  raw.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, function (_, chunk) {
    add('p', chunk, 260);
    return '';
  });
  raw.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, function (_, row) {
    const cells = [];
    row.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi, function (_, cell) {
      const text = shortenMedLensText(cell, 90);
      if (text) cells.push(text);
      return '';
    });
    if (cells.length) add('row', cells.join(' — '), 260);
    return '';
  });

  if (!blocks.length) {
    add('p', raw, 320);
  }
  return blocks;
}

function isMedLensNoise(text) {
  return /^(package label panel|principal display panel|repackaged by|distributed by|how supplied|ndc|lot|exp|store at|keep out of reach|see warnings|see precautions|drug facts|this product|for oral use|for external use)/i.test(String(text || '').trim());
}

function getMedLensSectionRules(sectionKey) {
  switch (sectionKey) {
    case 'overview': return { paragraphs: 2, bullets: 1, rows: 0, maxChars: 420 };
    case 'indications': return { paragraphs: 1, bullets: 1, rows: 0, maxChars: 300 };
    case 'dose': return { paragraphs: 2, bullets: 1, rows: 1, maxChars: 520 };
    case 'mechanism': return { paragraphs: 2, bullets: 0, rows: 0, maxChars: 340 };
    case 'interactions': return { paragraphs: 1, bullets: 3, rows: 0, maxChars: 380 };
    case 'sideEffects': return { paragraphs: 1, bullets: 3, rows: 0, maxChars: 360 };
    case 'warnings': return { paragraphs: 1, bullets: 3, rows: 0, maxChars: 420 };
    case 'contraindications': return { paragraphs: 1, bullets: 4, rows: 0, maxChars: 320 };
    case 'pregnancy': return { paragraphs: 2, bullets: 1, rows: 0, maxChars: 420 };
    case 'pediatricUse': return { paragraphs: 2, bullets: 1, rows: 0, maxChars: 380 };
    case 'pharmacokinetics': return { paragraphs: 2, bullets: 0, rows: 1, maxChars: 420 };
    case 'clinicalStudies': return { paragraphs: 2, bullets: 0, rows: 1, maxChars: 440 };
    case 'overdosage': return { paragraphs: 1, bullets: 2, rows: 0, maxChars: 380 };
    case 'patientInfo': return { paragraphs: 2, bullets: 2, rows: 0, maxChars: 420 };
    case 'formulation': return { paragraphs: 1, bullets: 0, rows: 2, maxChars: 300 };
    case 'storage': return { paragraphs: 1, bullets: 0, rows: 0, maxChars: 240 };
    default: return { paragraphs: 2, bullets: 2, rows: 0, maxChars: 420 };
  }
}

function compactSectionHtml(value, sectionKey) {
  let text = String(value || '');
  if (!text.trim()) return '';

  text = text
    .replace(/<h4[^>]*>\s*Package Label Panel[\s\S]*$/i, '')
    .replace(/<h4[^>]*>\s*Principal Display Panel[\s\S]*$/i, '')
    .replace(/<h4[^>]*>\s*Repackaged By[\s\S]*$/i, '')
    .replace(/<h4[^>]*>\s*Distributed By[\s\S]*$/i, '')
    .replace(/<h4[^>]*>\s*How Supplied[\s\S]*$/i, '');

  const blocks = collectMedLensBlocks(text).filter(function (block) {
    return !isMedLensNoise(block.text);
  });
  const rules = getMedLensSectionRules(sectionKey);
  const paragraphs = blocks.filter(function (block) { return block.type !== 'li'; }).map(function (block) { return block.text; }).filter(Boolean);
  const bullets = blocks.filter(function (block) { return block.type === 'li'; }).map(function (block) { return block.text; }).filter(Boolean);
  const rows = blocks.filter(function (block) { return block.type === 'row'; }).map(function (block) { return block.text; }).filter(Boolean);

  if (['warnings', 'contraindications', 'sideEffects', 'interactions', 'overdosage'].indexOf(sectionKey) !== -1) {
    const items = bullets.concat(rows, paragraphs).slice(0, rules.bullets + rules.paragraphs);
    if (items.length) {
      return '<ul>' + items.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>';
    }
    return '<p>' + escapeHtml(shortenMedLensText(text, rules.maxChars)) + '</p>';
  }

  const lead = paragraphs.concat(rows).slice(0, rules.paragraphs);
  const extra = bullets.slice(0, rules.bullets);

  if (!lead.length && !extra.length) {
    return '<p>' + escapeHtml(shortenMedLensText(text, rules.maxChars)) + '</p>';
  }

  let html = lead.map(function (item) { return '<p>' + escapeHtml(item) + '</p>'; }).join('');
  if (extra.length) {
    html += '<ul>' + extra.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join('') + '</ul>';
  }
  return html;
}

module.exports = {
  compactSectionHtml,
};
