export const MAJOR_CATEGORIES = [
  "Cardiovascular Disorders",
  "Infectious Diseases",
  "Endocrinology",
  "Respiratory Disorders",
  "Renal & Electrolyte Disorders",
  "Gastrointestinal Disorders",
  "Neurology & Psychiatry",
  "Hematology",
  "Oncology",
  "Rheumatology & Pain",
  "Women's & Men's Health",
  "Immunizations",
  "Pharmacy Law & Ethics",
];

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

export function normalizeMajorCategory(category, context = "") {
  const rawCategory = String(category || "").trim();
  const lowerCategory = rawCategory.toLowerCase();
  const lowerContext = String(context || "").toLowerCase();
  const combined = `${lowerCategory} ${lowerContext}`;

  if (
    hasAny(combined, [
      "cardio",
      "hypertens",
      "heart failure",
      "angina",
      "arrhythm",
      "atrial",
      "acs",
      "stemi",
      "nstemi",
      "ischemic",
      "dyslipid",
      "statin",
    ])
  ) {
    return "Cardiovascular Disorders";
  }

  if (
    hasAny(combined, [
      "infect",
      "antibiotic",
      "cephalo",
      "macrolide",
      "fluoroquinolone",
      "aminoglycoside",
      "tetracycline",
      "sulfonamide",
      "glycopeptide",
      "pneumonia",
      "uti",
      "pyeloneph",
      "tb",
      "tuberculosis",
      "hiv",
      "art ",
      "fungal",
      "azole",
      "echinocandin",
      "amphotericin",
    ])
  ) {
    return "Infectious Diseases";
  }

  if (
    hasAny(combined, [
      "endo",
      "diabet",
      "insulin",
      "glp-1",
      "sglt2",
      "hypoglyc",
      "dka",
      "hhs",
      "thyroid",
      "adrenal",
      "cushing",
      "addison",
      "osteoporosis",
      "bisphosph",
      "denosumab",
    ])
  ) {
    return "Endocrinology";
  }

  if (
    hasAny(combined, [
      "respir",
      "asthma",
      "copd",
      "gold classification",
      "lama",
      "laba",
      "inhaler",
      "allergic rhinitis",
      "allergy",
      "immunology",
    ])
  ) {
    return "Respiratory Disorders";
  }

  if (
    hasAny(combined, [
      "renal",
      "nephro",
      "kidney",
      "aki",
      "ckd",
      "dialysis",
      "hyperkal",
      "hyponatr",
      "metabolic acidosis",
      "electrolyte",
    ])
  ) {
    return "Renal & Electrolyte Disorders";
  }

  if (
    hasAny(combined, [
      "gastro",
      "gerd",
      "peptic",
      "h. pylori",
      "h pylori",
      "ibd",
      "crohn",
      "ulcerative colitis",
      "ibs",
      "nausea",
      "vomit",
      "liver",
      "cirrhosis",
      "hepatitis",
    ])
  ) {
    return "Gastrointestinal Disorders";
  }

  if (
    hasAny(combined, [
      "neuro",
      "psych",
      "psychi",
      "seizure",
      "status epilepticus",
      "depression",
      "ssri",
      "snri",
      "tca",
      "maoi",
      "bipolar",
      "schizophrenia",
      "anxiety",
      "parkinson",
      "alzheimer",
      "migraine",
    ])
  ) {
    return "Neurology & Psychiatry";
  }

  if (
    hasAny(combined, [
      "hemat",
      "haemat",
      "anemia",
      "anaemia",
      "warfarin",
      "doac",
      "heparin",
      "vte",
      "pe",
      "coag",
      "hemolytic",
      "b12 deficiency",
      "iron deficiency",
    ])
  ) {
    return "Hematology";
  }

  if (
    hasAny(combined, [
      "onco",
      "cancer",
      "chemotherapy",
      "alkylating",
      "antimetabolite",
      "monoclonal",
      "immunotherapy",
      "targeted therap",
    ])
  ) {
    return "Oncology";
  }

  if (
    hasAny(combined, [
      "rheuma",
      "arthritis",
      "osteoarthritis",
      "gout",
      "nsaid",
      "opioid",
      "chronic pain",
      "pain",
      "dermatology",
      "raynaud",
    ])
  ) {
    return "Rheumatology & Pain";
  }

  if (
    hasAny(combined, [
      "obstetric",
      "pregnan",
      "contraception",
      "ocp",
      "menopause",
      "bph",
      "erectile dysfunction",
      "gyne",
      "women",
      "men's",
      "mens health",
      "womens health",
      "urology",
    ])
  ) {
    return "Women's & Men's Health";
  }

  if (
    hasAny(combined, [
      "immunization",
      "immunisation",
      "vaccine",
      "vaccination",
      "cdc adult schedule",
      "pediatric schedule",
    ])
  ) {
    return "Immunizations";
  }

  if (hasAny(combined, ["law", "ethic", "regulation", "legal"])) {
    return "Pharmacy Law & Ethics";
  }

  if (
    hasAny(combined, [
      "clinical pharmacology",
      "pharmacology",
      "dose",
      "drug interaction",
      "adverse drug",
    ])
  ) {
    return "Pharmacy Law & Ethics";
  }

  return "Pharmacy Law & Ethics";
}

export function isMajorCategory(value) {
  return MAJOR_CATEGORIES.includes(String(value || "").trim());
}
