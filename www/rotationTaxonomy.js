const ROTATION_OPTIONS = [
  "Internal Medicine",
  "Paediatrics",
  "Maternal and Child Health",
  "Accident & Emergency",
  "Surgery",
  "Mental Health",
  "Oncology",
  "ENT/Dental",
];

const ROTATION_ALIASES = {
  emergency: "Accident & Emergency",
  "accident and emergency": "Accident & Emergency",
  "accident & emergency": "Accident & Emergency",
  pediatrics: "Paediatrics",
  paediatrics: "Paediatrics",
  "child health": "Paediatrics",
  "maternal health": "Maternal and Child Health",
  "maternal and child": "Maternal and Child Health",
  "maternal and child health": "Maternal and Child Health",
  "ent and dental": "ENT/Dental",
  "ent/dental": "ENT/Dental",
};

function normalizeSearchText(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

export function normalizeRotationValue(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const key = normalizeSearchText(raw);
  return ROTATION_ALIASES[key] || ROTATION_OPTIONS.find((option) => option.toLowerCase() === key) || raw;
}

function getRotationContext(question = {}) {
  const drillTags = Array.isArray(question?.drillTags)
    ? question.drillTags.map((tag) => String(tag || "").trim().toLowerCase()).filter(Boolean)
    : [];
  return normalizeSearchText(
    [
      question?.category,
      question?.question,
      question?.text,
      question?.explanation,
      question?.caseId,
      question?.sectionId,
      question?.topicSlug,
      drillTags.join(" "),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

export function inferQuestionRotation(question = {}) {
  const category = String(question?.category || "").trim();
  const combined = getRotationContext(question);

  if (
    hasAny(combined, [
      "law",
      "ethic",
      "manufactur",
      "quality assurance",
      "quality control",
      "pharmaceutical technology",
      "compounding",
    ])
  ) {
    return "";
  }

  if (
    hasAny(combined, [
      "onco",
      "cancer",
      "chemotherapy",
      "radiotherapy",
      "tumour",
      "tumor",
      "metastasis",
      "malign",
      "carcinoma",
    ]) ||
    category === "Oncology"
  ) {
    return "Oncology";
  }

  if (
    hasAny(combined, [
      "psych",
      "psychi",
      "depression",
      "anxiety",
      "bipolar",
      "schizophrenia",
      "antidepress",
      "antipsych",
      "suicid",
      "mood disorder",
      "panic",
      "mental health",
    ])
  ) {
    return "Mental Health";
  }

  if (
    hasAny(combined, [
      "surgery",
      "surgical",
      "operative",
      "perioperative",
      "post-op",
      "postoperative",
      "wound",
      "fracture",
      "hernia",
      "appendic",
      "incision",
      "suture",
      "abscess",
      "sterile",
      "aseptic",
      "anaesthesia",
      "anesthesia",
    ])
  ) {
    return "Surgery";
  }

  if (
    hasAny(combined, [
      "otitis",
      "sinus",
      "tonsill",
      "pharyng",
      "laryng",
      "ear infection",
      "ear drum",
      "middle ear",
      "otology",
      "audiolog",
      "auditory",
      "oral",
      "dental",
      "tooth",
      "teeth",
      "gingiv",
      "periodont",
      "mouth",
      "voice",
      "denture",
      "caries",
    ])
  ) {
    return "ENT/Dental";
  }

  if (
    hasAny(combined, [
      "paediatric",
      "pediatric",
      "child",
      "children",
      "neonat",
      "infant",
      "newborn",
      "baby",
      "baby care",
      "paeds",
      "peds",
    ]) ||
    category === "Immunizations"
  ) {
    return "Paediatrics";
  }

  if (
    hasAny(combined, [
      "obstetric",
      "pregnan",
      "antenatal",
      "postpartum",
      "post-partum",
      "maternal",
      "breastfeeding",
      "lactat",
      "labour",
      "labor",
      "delivery",
      "contracep",
      "gyne",
      "menopause",
      "prostate",
      "urology",
      "breast",
      "women's",
      "womens",
      "men's",
      "mens",
      "child health",
    ])
  ) {
    return "Maternal and Child Health";
  }

  if (
    hasAny(combined, [
      "emergency",
      "trauma",
      "poison",
      "overdose",
      "antidote",
      "resuscitat",
      "shock",
      "anaphyl",
      "burn",
      "acute",
      "cpr",
      "first aid",
      "accident",
      "snakebite",
      "bites",
      "toxicol",
      "pralidoxime",
      "atropine",
    ]) ||
    (category === "Pharmacy Practice" && hasAny(combined, ["poison", "overdose", "antidote", "acute"]))
  ) {
    return "Accident & Emergency";
  }

  const adultMedicineCategories = new Set([
    "Cardiovascular Disorders",
    "Endocrinology",
    "Respiratory Disorders",
    "Renal & Electrolyte Disorders",
    "Gastrointestinal Disorders",
    "Infectious Diseases",
    "Hematology",
    "Rheumatology & Pain",
  ]);
  if (adultMedicineCategories.has(category)) {
    return "Internal Medicine";
  }

  if (category === "Neurology & Psychiatry") {
    return hasAny(combined, [
      "psych",
      "psychi",
      "depression",
      "anxiety",
      "schizophrenia",
      "bipolar",
      "suicid",
      "antidepress",
      "antipsych",
      "panic",
    ])
      ? "Mental Health"
      : "Internal Medicine";
  }

  if (category === "Women's & Men's Health") {
    return hasAny(combined, [
      "obstetric",
      "pregnan",
      "antenatal",
      "postpartum",
      "maternal",
      "contracep",
      "gyne",
      "breast",
      "menopause",
      "prostate",
      "urology",
      "womens",
      "mens",
      "child",
    ])
      ? "Maternal and Child Health"
      : "Internal Medicine";
  }

  if (category === "Pharmacy Practice") {
    if (hasAny(combined, ["psych", "depression", "anxiety", "suicid"])) {
      return "Mental Health";
    }
    return "Internal Medicine";
  }

  return "";
}

export function inferQuestionRotations(question = {}) {
  const rotation = normalizeRotationValue(question?.rotation || question?.rotations?.[0] || inferQuestionRotation(question));
  return rotation ? [rotation] : [];
}
