const { compactSectionHtml } = require('./medlens-content-utils.cjs');

function toText(value) {
  return isPlainString(value) ? String(value).trim() : '';
}

function isPlainString(value) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function collectSectionText(value) {
  if (!value) return '';
  if (isPlainString(value)) return toText(value);
  if (Array.isArray(value)) {
    return value.map(collectSectionText).filter(Boolean).join(' ').trim();
  }
  if (typeof value !== 'object') {
    return toText(value);
  }

  if (value.adult || value.pediatric) {
    return [collectSectionText(value.adult), collectSectionText(value.pediatric)].filter(Boolean).join(' ').trim();
  }

  const directKeys = [
    'summaryHtml',
    'summary',
    'shortSummary',
    'excerpt',
    'detailsHtml',
    'details',
    'html',
    'body',
    'content',
    'text',
  ];

  const direct = directKeys
    .map((key) => value[key])
    .map(collectSectionText)
    .filter(Boolean)
    .join(' ')
    .trim();

  if (direct) return direct;

  return Object.values(value).map(collectSectionText).filter(Boolean).join(' ').trim();
}

function readSectionString(value, keys = []) {
  if (!value) return '';
  if (isPlainString(value)) return toText(value);
  if (Array.isArray(value)) {
    return value.map((item) => readSectionString(item, keys)).filter(Boolean).join(' ').trim();
  }
  if (typeof value !== 'object') {
    return toText(value);
  }

  for (const key of keys) {
    const candidate = value[key];
    if (isPlainString(candidate)) {
      const text = toText(candidate);
      if (text) return text;
    }
  }

  return collectSectionText(value);
}

function normalizeSectionText(value) {
  if (!value) return '';
  if (isPlainString(value)) return toText(value);
  if (Array.isArray(value)) {
    return value.map(normalizeSectionText).filter(Boolean).join(' ').trim();
  }
  if (typeof value !== 'object') {
    return toText(value);
  }
  return collectSectionText(value);
}

function buildSectionContent(detailsHtml, sectionKey) {
  const details = normalizeSectionText(detailsHtml);
  return {
    summaryHtml: details ? compactSectionHtml(details, sectionKey) : '',
    detailsHtml: details,
  };
}

function hasAgeSpecificContent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Boolean(collectSectionText(value.adult) || collectSectionText(value.pediatric));
}

function buildAgeSectionContent(adultHtml, pediatricHtml, sectionKey) {
  const adult = buildSectionContent(adultHtml, sectionKey);
  const pediatric = buildSectionContent(pediatricHtml, sectionKey);

  return {
    summaryHtml: adult.summaryHtml || pediatric.summaryHtml || '',
    detailsHtml: [adult.detailsHtml, pediatric.detailsHtml].filter(Boolean).join(''),
    adult,
    pediatric,
  };
}

function normalizeSectionValue(value, sectionKey) {
  if (!value) {
    return buildSectionContent('', sectionKey);
  }

  if (typeof value === 'string') {
    return buildSectionContent(value, sectionKey);
  }

  if (Array.isArray(value)) {
    return buildSectionContent(normalizeSectionText(value), sectionKey);
  }

  if (typeof value !== 'object') {
    return buildSectionContent(String(value), sectionKey);
  }

  if (hasAgeSpecificContent(value)) {
    return buildAgeSectionValue(value, sectionKey);
  }

  const summaryHtml = readSectionString(value, ['summaryHtml', 'summary', 'shortSummary', 'excerpt']);
  const detailsHtml = readSectionString(value, ['detailsHtml', 'details', 'html', 'body', 'content', 'text']);
  const fallback = collectSectionText(value);

  if (summaryHtml || detailsHtml || fallback) {
    return {
      summaryHtml: summaryHtml || detailsHtml || fallback,
      detailsHtml: detailsHtml || summaryHtml || fallback,
    };
  }

  return buildSectionContent('', sectionKey);
}

function buildAgeSectionValue(value, sectionKey) {
  const adultText = normalizeSectionText(value.adult);
  const pediatricText = normalizeSectionText(value.pediatric);
  const adult = buildSectionContent(adultText, sectionKey);
  const pediatric = buildSectionContent(pediatricText, sectionKey);

  return {
    summaryHtml: readSectionString(value, ['summaryHtml', 'summary']) || adult.summaryHtml || pediatric.summaryHtml || '',
    detailsHtml: readSectionString(value, ['detailsHtml', 'details']) || [adult.detailsHtml, pediatric.detailsHtml].filter(Boolean).join(''),
    adult,
    pediatric,
  };
}

function normalizeMonographSection(value, sectionKey) {
  if (!value) {
    return buildSectionContent('', sectionKey);
  }

  if (typeof value === 'string') {
    return buildSectionContent(value, sectionKey);
  }

  if (Array.isArray(value)) {
    return buildSectionContent(normalizeSectionText(value), sectionKey);
  }

  if (typeof value !== 'object') {
    return buildSectionContent(String(value), sectionKey);
  }

  if (hasAgeSpecificContent(value)) {
    return buildAgeSectionValue(value, sectionKey);
  }

  const summaryHtml = readSectionString(value, ['summaryHtml', 'summary', 'shortSummary', 'excerpt']);
  const detailsHtml = readSectionString(value, ['detailsHtml', 'details', 'html', 'body', 'content', 'text']);
  const fallback = collectSectionText(value);

  if (summaryHtml || detailsHtml || fallback) {
    return {
      summaryHtml: summaryHtml || detailsHtml || fallback,
      detailsHtml: detailsHtml || summaryHtml || fallback,
    };
  }

  return buildSectionContent('', sectionKey);
}

function normalizeLegacyDrugRecord(record = {}) {
  const monographSource = record.monograph && typeof record.monograph === 'object' ? record.monograph : null;
  const sourceMeta = record.source && typeof record.source === 'object' ? record.source : {};
  const overview = normalizeMonographSection(record.overview || monographSource?.overview || '', 'overview');
  const indications = normalizeMonographSection(record.indications || monographSource?.indications || '', 'indications');
  const dose = normalizeMonographSection(record.dose || monographSource?.dose || '', 'dose');
  const mechanism = normalizeMonographSection(record.mechanism || monographSource?.mechanism || '', 'mechanism');
  const contraindications = normalizeMonographSection(record.contraindications || monographSource?.contraindications || '', 'contraindications');
  const warnings = normalizeMonographSection(record.warnings || monographSource?.warnings || '', 'warnings');
  const sideEffects = normalizeMonographSection(record.sideEffects || monographSource?.sideEffects || '', 'sideEffects');
  const interactions = normalizeMonographSection(record.interactions || monographSource?.interactions || '', 'interactions');
  const pregnancy = normalizeMonographSection(record.pregnancy || monographSource?.pregnancy || '', 'pregnancy');
  const pediatricUse = normalizeMonographSection(record.pediatricUse || monographSource?.pediatricUse || '', 'pediatricUse');
  const geriatricUse = normalizeMonographSection(record.geriatricUse || monographSource?.geriatricUse || '', 'geriatricUse');
  const pharmacokinetics = normalizeMonographSection(record.pharmacokinetics || monographSource?.pharmacokinetics || '', 'pharmacokinetics');
  const clinicalStudies = normalizeMonographSection(record.clinicalStudies || monographSource?.clinicalStudies || '', 'clinicalStudies');
  const overdosage = normalizeMonographSection(record.overdosage || monographSource?.overdosage || '', 'overdosage');
  const patientInfo = normalizeMonographSection(record.patientInfo || monographSource?.patientInfo || '', 'patientInfo');
  const formulation = normalizeMonographSection(record.formulation || monographSource?.formulation || '', 'formulation');
  const storage = normalizeMonographSection(record.storage || monographSource?.storage || '', 'storage');

  const source = {
    name: sourceMeta.name || record.sourceName || 'DailyMed',
    url: sourceMeta.url || record.sourceLink || '',
    identifier: sourceMeta.identifier || record.sourceFile || record.id || '',
    labelVersion: sourceMeta.labelVersion || sourceMeta.version || record.labelVersion || '',
    effectiveTime: sourceMeta.effectiveTime || record.effectiveTime || '',
  };

  const monograph = {
    overview,
    indications,
    dose,
    mechanism,
    contraindications,
    warnings,
    sideEffects,
    interactions,
    pregnancy,
    pediatricUse,
    geriatricUse,
    pharmacokinetics,
    clinicalStudies,
    overdosage,
    patientInfo,
    formulation,
    storage,
    source,
  };

  return {
    id: toText(record.id || '') || toText(record.brand || record.generic || record.name || ''),
    brand: toText(record.brand || record.name || ''),
    generic: toText(record.generic || record.brand || record.name || ''),
    class: toText(record.class || record.classLabel || ''),
    icon: record.icon || '&#x1F48A;',
    hasPediatric: Boolean(
      record.hasPediatric ||
      (record.dose && record.dose.pediatric) ||
      (monographSource && monographSource.dose && monographSource.dose.pediatric) ||
      (record.pediatricUse) ||
      (monographSource && monographSource.pediatricUse)
    ),
    components: toText(record.components || ''),
    route: toText(record.route || ''),
    mainUses: toText(record.mainUses || ''),
    sourceFile: toText(record.sourceFile || source.identifier || ''),
    sourceLink: toText(record.sourceLink || source.url || ''),
    source,
    monograph,
  };
}

module.exports = {
  buildSectionContent,
  buildAgeSectionContent,
  normalizeMonographSection,
  normalizeLegacyDrugRecord,
};