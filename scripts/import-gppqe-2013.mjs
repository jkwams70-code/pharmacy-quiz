import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const questionsPath = path.join(repoRoot, "backend", "data", "questions.json");

const commonClassificationOptions = [
  "OTC",
  "Pharmacist (P) medicines",
  "Prescription only medicines",
  "Narcotic or Psychotropic Medicines",
];

const trueFalseOptions = ["TRUE", "FALSE"];

const sideEffectPool = [
  "Bladder cancer",
  "Flatulence",
  "Hypoglycaemia",
  "Severe pancreatitis",
  "Angioedema",
];

const pairRelationshipComboOptions = [
  "first statement is true, second statement is true and the two are related",
  "first statement is true, second statement is true but the two are not related",
  "first statement is false, second statement is true",
  "both statements are false",
];

const classicThreeStatementComboOptions = [
  "1, 2 and 3",
  "1 and 2 only",
  "2 and 3 only",
  "1 only",
  "3 only",
];

const rawItems = [
  {
    sourceNumber: 1,
    category: "Pharmacology",
    question: "Which of the following is not a possible interaction?",
    options: [
      "Salbutamol and Propranolol",
      "Metronidazole and Tilade",
      "Atropine and Pilocarpine",
    ],
    answer: 1,
    explanation:
      "Salbutamol and propranolol interact because propranolol blocks the bronchodilatory effect of salbutamol. Atropine and pilocarpine interact because atropine blocks the effects of pilocarpine. Metronidazole and Tilade do not have a known significant interaction.",
  },
  {
    sourceNumber: 2,
    category: "Pharmacology",
    question: "Which of the following is not a side effect of Rosuvastatin?",
    options: ["Pharyngitis", "Dizziness", "Diarrhoea", "Myalgia"],
    answer: 0,
    explanation:
      "Rosuvastatin commonly causes myalgia, dizziness, and diarrhoea. Pharyngitis is not a typical or commonly reported side effect.",
  },
  {
    sourceNumber: 3,
    category: "Pharmacology",
    question: "Pioglitazone",
    options: sideEffectPool,
    answer: 0,
    explanation:
      "Pioglitazone, a thiazolidinedione anti-diabetic, has been associated with an increased risk of bladder cancer with long-term use.",
  },
  {
    sourceNumber: 4,
    category: "Pharmacology",
    question: "Acarbose",
    options: sideEffectPool,
    answer: 1,
    explanation:
      "Acarbose is an alpha-glucosidase inhibitor that commonly causes flatulence because undigested carbohydrates are fermented in the gut.",
  },
  {
    sourceNumber: 5,
    category: "Pharmacology",
    question: "Lemivir (Lamivudine)",
    options: sideEffectPool,
    answer: 2,
    explanation:
      "Lamivudine can cause hypoglycaemia, particularly in patients with hepatic impairment or when used with other medications that affect glucose metabolism.",
  },
  {
    sourceNumber: 6,
    category: "Pharmacology",
    question: "Exenatide",
    options: sideEffectPool,
    answer: 3,
    explanation:
      "Exenatide is a GLP-1 receptor agonist that has been associated with acute pancreatitis, sometimes severe.",
  },
  {
    sourceNumber: 7,
    category: "Pharmacology",
    question: "Vidagliptin (Vildagliptin)",
    options: sideEffectPool,
    answer: 4,
    explanation:
      "Vildagliptin is a DPP-4 inhibitor and angioedema is a recognized but less common side effect.",
  },
  {
    sourceNumber: 8,
    category: "Pharmacology",
    question: "Amiodarone has onset of action in 48hrs?",
    options: trueFalseOptions,
    answer: 1,
    explanation:
      "Amiodarone has a slow onset of action and 48 hours is not accurate for its full effect.",
  },
  {
    sourceNumber: 9,
    category: "Pharmacology",
    question: "Amiodarone is used in refractory cases or as a last line option in management of arrhythmia?",
    options: trueFalseOptions,
    answer: 0,
    explanation:
      "Amiodarone is often used as a second-line or last-line option for refractory arrhythmias.",
  },
  {
    sourceNumber: 10,
    category: "Pharmacy Law & Ethics",
    question: "Eusol solution",
    options: commonClassificationOptions,
    answer: 1,
    explanation:
      "Eusol solution is classified as a pharmacist-only medicine in Ghana.",
  },
  {
    sourceNumber: 11,
    category: "Pharmacy Law & Ethics",
    question: "Loperamide 2mg",
    options: commonClassificationOptions,
    answer: 0,
    explanation:
      "Loperamide 2mg tablets are classified as OTC medicines in Ghana.",
  },
  {
    sourceNumber: 12,
    category: "Pharmacy Law & Ethics",
    question: "Aluminium Hydroxide",
    options: commonClassificationOptions,
    answer: 1,
    explanation:
      "Aluminium Hydroxide is classified as a pharmacist-only medicine in Ghana.",
  },
  {
    sourceNumber: 13,
    category: "Pharmacy Law & Ethics",
    question: "Chlorhexidine mouthwash",
    options: commonClassificationOptions,
    answer: 1,
    explanation:
      "Chlorhexidine mouthwash is classified as a pharmacist-only medicine in Ghana.",
  },
  {
    sourceNumber: 14,
    category: "Pharmacy Law & Ethics",
    question: "Nitrazepam",
    options: commonClassificationOptions,
    answer: 3,
    explanation:
      "Nitrazepam is a benzodiazepine and is classified as a psychotropic or narcotic medicine.",
  },
  {
    sourceNumber: 15,
    category: "Maternal and Child Health",
    type: "combo",
    question: "Question on pregnant women who cannot receive Sulphadoxine-Pyrimethamine IPT",
    statements: [
      "1. Quickening before 13 weeks",
      "2. G6PD patients",
    ],
    options: ["1 only", "2 only", "1 and 2 only", "Neither 1 nor 2"],
    answer: 1,
    explanation:
      "Quickening below 13 weeks is not a contraindication for IPTp. G6PD deficiency is the relevant contraindication in the keyed answer.",
  },
  {
    sourceNumber: 16,
    category: "Pharmacology",
    question: "Amiodarone contains iodine and can precipitate Hyperthyroidism or Hypothyroidism. T/F",
    options: trueFalseOptions,
    answer: 0,
    explanation:
      "Amiodarone contains iodine and can cause both hyperthyroidism and hypothyroidism.",
  },
  {
    sourceNumber: 17,
    category: "Gastrointestinal Disorders",
    question: "The following are true of H. pylori EXCEPT",
    options: [
      "Can cause colon carcinoma",
      "Found in the gastric antrum",
      "Can be treated with amoxicillin and clarithromycin",
    ],
    answer: 0,
    explanation:
      "H. pylori is associated with gastric carcinoma and peptic ulcer disease, not colon carcinoma.",
  },
  {
    sourceNumber: 18,
    category: "Pharmacology",
    type: "combo",
    question: "Spironolactone can cause the following in females",
    statements: ["1. Gynaecomastia", "2. Impotence"],
    options: ["1 and 2 only", "1 only", "2 only", "Neither 1 nor 2"],
    answer: 1,
    explanation:
      "Gynaecomastia can occur, while impotence is a male side effect and does not apply to females.",
  },
  {
    sourceNumber: 19,
    category: "Maternal and Child Health",
    question: "Rehydration therapy for children under 5 with diarrhoea",
    options: ["Loperamide with zinc", "Zinc with ORS"],
    answer: 1,
    explanation:
      "WHO recommends ORS plus zinc supplementation for diarrhoea in children under 5.",
  },
  {
    sourceNumber: 20,
    category: "Cardiovascular Disorders",
    question: "Atenolol and nifedipine are used as antihypertensive in up to 50% of all patients. T/F",
    options: trueFalseOptions,
    answer: 1,
    explanation:
      "The specific 50% claim is arbitrary and not supported by clinical guidelines.",
  },
  {
    sourceNumber: 21,
    category: "Manufacturing and Calculation",
    type: "note",
    question: "Calculation on lead time (read on it and how to calculate)",
    explanation:
      "Lead time in pharmacy practice is the time between placing an order and receiving the stock. Lead time demand = lead time x average daily usage.",
    answerText:
      "Lead time demand = lead time x average daily usage. Safety stock and reorder level are calculated from average and maximum usage.",
  },
  {
    sourceNumber: 22,
    category: "Pharmacology",
    question: "Example of a potassium sparing diuretic is",
    options: [
      "Hydrochlorothiazide",
      "Mannitol",
      "Furosemide",
      "Triamterene",
      "Acetazolamide",
    ],
    answer: 3,
    explanation:
      "Triamterene is a potassium-sparing diuretic.",
  },
  {
    sourceNumber: 23,
    category: "Public Health",
    type: "combo",
    question: "Which of the following statements is or are true about Iodine?",
    statements: [
      "I. Iodine is an element essential for the synthesis of thyroxine and triiodothyronine",
      "II. It is needed for the physical and mental development and metabolism",
      "III. Iodine deficiency can cause cretinism in children and infants",
    ],
    options: ["I only", "I and III only", "III only", "II and III only", "I, II and III"],
    answer: 4,
    explanation:
      "All three statements are true.",
  },
  {
    sourceNumber: 24,
    category: "Manufacturing and Calculation",
    question:
      "How volume in millilitres of a 1:20 stock solution of ephedrine sulphate would be required to prepare 20ml of the following prescription?\nRx: Ephedrine sulphate 0.5% Normal saline qs 10ml",
    options: ["1.0", "2.0", "3.75", "4.0", "7.5"],
    answer: 1,
    explanation:
      "The keyed answer from the source is 2.0 ml.",
  },
  {
    sourceNumber: 25,
    category: "Renal & Electrolyte Disorders",
    question: "Which one of the following conditions is a patient with acute renal failure likely to present with?",
    options: ["Hypophosphatemia", "Hyperphosphatemia", "Hypercalcemia", "Hypokalaemia"],
    answer: 1,
    explanation:
      "Acute renal failure reduces phosphate excretion and leads to hyperphosphatemia.",
  },
  {
    sourceNumber: 26,
    category: "Cardiovascular Disorders",
    question:
      "A 48 year old hypertensive has been successfully treated with a thiazide diuretic for the past 4 years. Over the last 3 months, his diastolic pressure has steadily increased and he has been started on an additional anti-hypertensive medication. He now complains of sleep disturbances and he is no longer able to complete three sets of tennis. The second anti-hypertensive medication is most likely which of the following?",
    options: ["Metoprolol", "Lisinopril", "Nifedipine", "Losartan", "Clonidine"],
    answer: 0,
    explanation:
      "Metoprolol can cause sleep disturbances and exercise intolerance.",
  },
  {
    sourceNumber: 27,
    category: "Respiratory Disorders",
    question: "Which of the following is likely to cause bronchoconstriction?",
    options: ["cAMP", "cGMP", "Salbutamol", "Phosphodiesterase inhibitor"],
    answer: 3,
    explanation:
      "The source keyed the answer as phosphodiesterase inhibitor, although the item itself is flawed because the explanation notes that these agents are bronchodilators rather than bronchoconstrictors.",
  },
  {
    sourceNumber: 28,
    category: "Cardiovascular Disorders",
    question:
      "Which of the following agents would be appropriate pharmacotherapy for an individual diagnosed with hypertension and benign prostate hypertrophy?",
    options: ["alpha-Methyldopa", "Propranolol", "Prazosin", "Phenoxybenzamine", "Enalapril"],
    answer: 2,
    explanation:
      "Prazosin is an alpha-1 blocker that can treat both hypertension and BPH.",
  },
  {
    sourceNumber: 29,
    category: "Manufacturing and Calculation",
    question:
      "The half-life of a drug A is 8 hours. How long will the serum level of A take to decrease from 30 micrograms/ml to 1.875 micrograms/ml?",
    options: ["8 hours", "12 hours", "16 hours", "24 hours", "32 hours"],
    answer: 4,
    explanation:
      "It takes 4 half-lives, or 32 hours, to fall from 30 to 1.875 micrograms/ml.",
  },
  {
    sourceNumber: 30,
    category: "Pharmacology",
    question:
      "Dyazide and Aldactazide are combination diuretics having one of the following as a common ingredient.",
    options: [
      "Triamterene",
      "Spironolactone",
      "Hydrochlorothiazide",
      "Furosemide",
      "Chlorthalidone",
    ],
    answer: 2,
    explanation:
      "Both products contain hydrochlorothiazide.",
  },
  {
    sourceNumber: 31,
    category: "Neurology & Psychiatry",
    question:
      "It is suggested that patients on antipsychotic therapy remain symptom free for six months before therapy is discontinued. T/F",
    options: trueFalseOptions,
    answer: 1,
    explanation:
      "Six months is too short for routine discontinuation of antipsychotic therapy.",
  },
  {
    sourceNumber: 32,
    category: "Manufacturing and Calculation",
    question:
      "What is the percent w/v concentration of aluminium acetate present in the following preparation?\n5% Aluminium Acetate solution USP 120ml\nSterile water to 1000ml",
    options: ["0.50%", "0.53%", "0.60%", "1.07%", "1.20%"],
    answer: 2,
    explanation:
      "The final concentration is 0.60% w/v.",
  },
  {
    sourceNumber: 33,
    category: "Public Health",
    question:
      "Which of the following is not a directly health related Millennium development goal?",
    options: [
      "Combat HIV/AIDS, malaria, TB and other related diseases",
      "Improve Maternal Health",
      "Eradicate extreme Poverty and hunger",
      "Reduce Child mortality",
      "Ensure environmental sustainability",
    ],
    answer: 4,
    explanation:
      "Ensure environmental sustainability is the least directly health-related option in the list.",
  },
  {
    sourceNumber: 34,
    category: "Public Health",
    question:
      "Which of the following is a directly related health development goal?",
    options: [
      "Ensure environmental sustainability",
      "Eradicate extreme Poverty and hunger",
      "Reduce Child mortality",
      "Promote gender equality and empower women",
      "Achieve universal basic education",
    ],
    answer: 2,
    explanation:
      "Reduce Child mortality is directly related to health development.",
  },
  {
    sourceNumber: 35,
    category: "Infectious Diseases",
    question: "Drug of Choice in the treatment of Severe Malaria",
    options: [
      "Oral Quinine",
      "Sulphadoxine-Pyrimethamine",
      "I.M Artemether",
      "Artesunate-Amodiaquine",
      "Doxycycline",
    ],
    answer: 2,
    explanation:
      "The keyed answer in the source is intramuscular Artemether.",
  },
];

function scrambleDisplayNumber(index, total) {
  return ((index + 1) * 37) % total + 1;
}

function buildComboOptions(item = {}) {
  const comboVariant = String(item.comboVariant || "").trim().toLowerCase();
  const explicitOptions = Array.isArray(item.options)
    ? item.options.map((option) => String(option || "").trim()).filter(Boolean)
    : [];

  if (explicitOptions.length > 0) {
    return explicitOptions;
  }

  if (comboVariant === "pair-relationship") {
    return [...pairRelationshipComboOptions];
  }

  if (comboVariant === "three-statement") {
    return [...classicThreeStatementComboOptions];
  }

  if (Array.isArray(item.statements) && item.statements.length === 2) {
    return [...pairRelationshipComboOptions];
  }

  if (Array.isArray(item.statements) && item.statements.length === 3) {
    return [...classicThreeStatementComboOptions];
  }

  return explicitOptions;
}

function normalizeItem(item, displayNumber) {
  const answerIndex = Number(item.answer);
  const options = buildComboOptions(item);
  const correct = Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < options.length ? options[answerIndex] : "";
  const comboVariant = String(item.comboVariant || "").trim().toLowerCase();
  const base = {
    id: `gppqe-2013-${String(item.sourceNumber).padStart(3, "0")}`,
    bank: "gppqe",
    year: 2013,
    sourceTag: "gppqe-2013",
    sourceNumber: item.sourceNumber,
    displayNumber: item.type === "note" ? undefined : displayNumber,
    type: item.type || "single",
    comboVariant: comboVariant || undefined,
    category: item.category || "General",
    question: item.question,
    options: options.length ? options : undefined,
    correct,
    answer: Number.isInteger(answerIndex) ? answerIndex : undefined,
    explanation: item.explanation || "",
  };
  if (item.statements) {
    base.statements = item.statements;
  }
  if (item.answerText) {
    base.answerText = item.answerText;
  }
  return base;
}

async function main() {
  const raw = await fs.readFile(questionsPath, "utf8");
  const existing = JSON.parse(raw);
  if (!Array.isArray(existing)) {
    throw new Error("backend/data/questions.json is not an array");
  }

  const cleanedExisting = existing.filter(
    (question) =>
      !(
        String(question?.bank || "main").trim().toLowerCase() === "gppqe" &&
        Number(question?.year) === 2013 &&
        String(question?.sourceTag || "") === "gppqe-2013"
      ),
  );

  const quizItems = rawItems.filter((item) => item.type !== "note");
  const displayNumberBySourceNumber = new Map(
    quizItems.map((item, index) => [item.sourceNumber, scrambleDisplayNumber(index, quizItems.length)]),
  );
  const mergedItems = rawItems.map((item) => normalizeItem(item, displayNumberBySourceNumber.get(item.sourceNumber)));

  const maxId = cleanedExisting.reduce((max, question) => {
    const value = Number(question?.id);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);

  const reindexedItems = mergedItems.map((item, index) => ({
    ...item,
    id: maxId + index + 1,
  }));

  const output = [...cleanedExisting, ...reindexedItems].sort((a, b) => Number(a.id) - Number(b.id));
  await fs.writeFile(questionsPath, JSON.stringify(output, null, 2), "utf8");
  console.log(`Imported ${reindexedItems.length} GPPQE 2013 items into backend/data/questions.json.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
