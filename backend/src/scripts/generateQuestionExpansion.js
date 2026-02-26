import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..", "..");
const quizRoot = path.join(backendRoot, "..");

const dataPath = path.join(quizRoot, "data.js");
const backendQuestionsPath = path.join(backendRoot, "data", "questions.json");

const cards = [
  {
    drug: "Amlodipine",
    category: "Cardiology",
    mechanism: "Blocks L-type calcium channels in vascular smooth muscle to reduce peripheral resistance.",
    use: "Long-term control of hypertension and chronic stable angina.",
    safety: "Dose-related ankle edema is common; monitor for peripheral swelling.",
  },
  {
    drug: "Metoprolol",
    category: "Cardiology",
    mechanism: "Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.",
    use: "Rate control and secondary prevention after myocardial infarction.",
    safety: "Can cause bradycardia; monitor pulse and symptoms of dizziness.",
  },
  {
    drug: "Losartan",
    category: "Cardiology",
    mechanism: "Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.",
    use: "Hypertension, especially in patients with diabetic kidney disease.",
    safety: "May increase serum potassium; monitor renal function and potassium.",
  },
  {
    drug: "Hydrochlorothiazide",
    category: "Cardiology",
    mechanism: "Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.",
    use: "First-line blood pressure control in uncomplicated hypertension.",
    safety: "Can cause hypokalemia and hyponatremia; monitor electrolytes.",
  },
  {
    drug: "Spironolactone",
    category: "Cardiology",
    mechanism: "Antagonizes aldosterone receptors in the distal nephron.",
    use: "Resistant hypertension and mortality reduction in HFrEF.",
    safety: "Risk of hyperkalemia is significant; check potassium regularly.",
  },
  {
    drug: "Furosemide",
    category: "Cardiology",
    mechanism: "Inhibits the NKCC2 cotransporter in the thick ascending limb of Henle.",
    use: "Rapid symptomatic relief in fluid overload and pulmonary edema.",
    safety: "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
  },
  {
    drug: "Atorvastatin",
    category: "Cardiology",
    mechanism: "Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.",
    use: "Primary and secondary prevention of atherosclerotic cardiovascular disease.",
    safety: "Report unexplained muscle pain due to risk of statin-associated myopathy.",
  },
  {
    drug: "Nitroglycerin",
    category: "Cardiology",
    mechanism: "Releases nitric oxide causing venodilation and reduced preload.",
    use: "Immediate relief of acute angina episodes.",
    safety: "Avoid with phosphodiesterase-5 inhibitors because of profound hypotension risk.",
  },
  {
    drug: "Digoxin",
    category: "Cardiology",
    mechanism: "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.",
    use: "Symptomatic HFrEF and ventricular rate control in atrial fibrillation.",
    safety: "Narrow therapeutic index; monitor for toxicity and renal function.",
  },
  {
    drug: "Clopidogrel",
    category: "Cardiology",
    mechanism: "Irreversibly inhibits platelet P2Y12 receptors to reduce platelet aggregation.",
    use: "Prevention of stent thrombosis and recurrent ischemic events after ACS.",
    safety: "Bleeding risk is the main concern; assess for bruising and GI bleeding.",
  },
  {
    drug: "Warfarin",
    category: "Clinical Documentation",
    mechanism: "Inhibits vitamin K epoxide reductase, lowering synthesis of factors II, VII, IX, and X.",
    use: "Long-term anticoagulation for atrial fibrillation or venous thromboembolism.",
    safety: "INR monitoring and clear documentation of target range are essential.",
  },
  {
    drug: "Enoxaparin",
    category: "Haematology",
    mechanism: "Enhances antithrombin activity with predominant inhibition of factor Xa.",
    use: "Treatment and prophylaxis of venous thromboembolism.",
    safety: "Dose must be adjusted in severe renal impairment to avoid accumulation.",
  },
  {
    drug: "Ferrous sulfate",
    category: "Obstetrics",
    mechanism: "Supplies elemental iron required for hemoglobin synthesis.",
    use: "Treatment of iron deficiency anemia during pregnancy.",
    safety: "Counsel on dark stools and constipation to improve adherence.",
  },
  {
    drug: "Epoetin alfa",
    category: "Laboratory Medicine",
    mechanism: "Stimulates erythroid progenitor cells via erythropoietin receptor activation.",
    use: "Anemia of chronic kidney disease to reduce transfusion need.",
    safety: "Hemoglobin should not rise too quickly; monitor Hb to reduce thrombotic risk.",
  },
  {
    drug: "Salbutamol",
    category: "Respiratory",
    mechanism: "Stimulates beta-2 receptors causing rapid bronchodilation.",
    use: "Relief of acute bronchospasm in asthma.",
    safety: "Excess use may indicate poor control; reassess controller therapy.",
  },
  {
    drug: "Budesonide (inhaled)",
    category: "Respiratory",
    mechanism: "Reduces airway inflammation by glucocorticoid receptor-mediated gene regulation.",
    use: "Maintenance controller therapy in persistent asthma.",
    safety: "Rinse mouth after inhalation to reduce oral candidiasis risk.",
  },
  {
    drug: "Tiotropium",
    category: "Respiratory",
    mechanism: "Long-acting muscarinic receptor blockade in bronchial smooth muscle.",
    use: "Maintenance bronchodilation in COPD.",
    safety: "Not for acute symptom relief; provide a rescue inhaler separately.",
  },
  {
    drug: "Montelukast",
    category: "Allergy and Immunology",
    mechanism: "Blocks cysteinyl leukotriene-1 receptors in the airway.",
    use: "Add-on control of allergic asthma and exercise-induced symptoms.",
    safety: "Monitor for mood or behavior changes and counsel patients to report them promptly.",
  },
  {
    drug: "Amoxicillin",
    category: "Infectious Diseases",
    mechanism: "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.",
    use: "Susceptible upper respiratory and skin infections.",
    safety: "Verify penicillin allergy history before dispensing.",
  },
  {
    drug: "Amoxicillin-clavulanate",
    category: "ENT",
    mechanism: "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.",
    use: "Bacterial sinusitis or otitis when beta-lactamase producers are suspected.",
    safety: "Take with food to reduce gastrointestinal intolerance.",
  },
  {
    drug: "Ciprofloxacin",
    category: "Infectious Diseases",
    mechanism: "Inhibits bacterial DNA gyrase and topoisomerase IV.",
    use: "Complicated urinary tract infections due to susceptible organisms.",
    safety: "Risk of tendon injury increases with age and corticosteroid use.",
  },
  {
    drug: "Doxycycline",
    category: "Dermatology",
    mechanism: "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.",
    use: "Inflammatory acne and selected atypical infections.",
    safety: "Photosensitivity is common; advise sun protection.",
  },
  {
    drug: "Metronidazole",
    category: "Gastroenterology",
    mechanism: "Generates free-radical metabolites that damage DNA in anaerobes and protozoa.",
    use: "Anaerobic intra-abdominal infections and protozoal disease.",
    safety: "Avoid alcohol during treatment because of disulfiram-like reaction risk.",
  },
  {
    drug: "Vancomycin",
    category: "Clinical Pharmacy",
    mechanism: "Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.",
    use: "Serious gram-positive infections including MRSA.",
    safety: "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
  },
  {
    drug: "Influenza vaccine (inactivated)",
    category: "Immunology",
    mechanism: "Induces adaptive immune response against influenza surface antigens.",
    use: "Annual prevention of influenza and severe complications.",
    safety: "Mild local soreness is common and not a reason to avoid future doses.",
  },
  {
    drug: "Rifampicin",
    category: "Infectious Diseases",
    mechanism: "Inhibits DNA-dependent RNA polymerase in mycobacteria.",
    use: "Core component of multidrug tuberculosis treatment.",
    safety: "Potent enzyme induction causes many interactions; medication review is essential.",
  },
  {
    drug: "Isoniazid",
    category: "Clinical Pharmacology",
    mechanism: "Inhibits mycolic acid synthesis in mycobacterial cell walls.",
    use: "Tuberculosis treatment and latent TB therapy protocols.",
    safety: "Pyridoxine supplementation helps prevent peripheral neuropathy.",
  },
  {
    drug: "Fluconazole",
    category: "Infectious Diseases",
    mechanism: "Inhibits fungal lanosterol 14-alpha-demethylase, reducing ergosterol synthesis.",
    use: "Mucosal candidiasis and selected systemic fungal infections.",
    safety: "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
  },
  {
    drug: "Metformin",
    category: "Endocrinology",
    mechanism: "Reduces hepatic glucose output and improves insulin sensitivity.",
    use: "First-line pharmacotherapy in type 2 diabetes.",
    safety: "Temporarily withhold around iodinated contrast in patients at renal risk.",
  },
  {
    drug: "Insulin glargine",
    category: "Endocrinology",
    mechanism: "Provides prolonged basal insulin activity with minimal peak.",
    use: "Basal glucose control in type 1 and type 2 diabetes.",
    safety: "Hypoglycemia prevention requires consistent dosing time and glucose monitoring.",
  },
  {
    drug: "Gliclazide",
    category: "Endocrinology",
    mechanism: "Stimulates pancreatic beta-cell insulin release via KATP channel closure.",
    use: "Type 2 diabetes when metformin alone is insufficient.",
    safety: "Risk of hypoglycemia is increased with missed meals.",
  },
  {
    drug: "Empagliflozin",
    category: "Endocrinology",
    mechanism: "Inhibits renal SGLT2 to increase urinary glucose excretion.",
    use: "Type 2 diabetes with cardiovascular and renal protective benefits.",
    safety: "Counsel on genital mycotic infection risk and hydration.",
  },
  {
    drug: "Sitagliptin",
    category: "Endocrinology",
    mechanism: "Inhibits DPP-4, prolonging endogenous incretin action.",
    use: "Add-on glycemic control in type 2 diabetes.",
    safety: "Dose adjustment is needed in renal impairment.",
  },
  {
    drug: "Levothyroxine",
    category: "Endocrinology",
    mechanism: "Replaces deficient thyroxine (T4) hormone.",
    use: "Long-term management of hypothyroidism.",
    safety: "Take on an empty stomach consistently to optimize absorption.",
  },
  {
    drug: "Propylthiouracil",
    category: "Endocrinology",
    mechanism: "Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.",
    use: "Hyperthyroidism, especially thyroid storm management.",
    safety: "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
  },
  {
    drug: "Prednisone",
    category: "Clinical Pharmacology",
    mechanism: "Systemic glucocorticoid that suppresses inflammatory gene transcription.",
    use: "Short-course treatment of moderate to severe inflammatory flares.",
    safety: "Tapering may be required after prolonged courses to prevent adrenal suppression.",
  },
  {
    drug: "Alendronate",
    category: "Rheumatology",
    mechanism: "Inhibits osteoclast-mediated bone resorption as a bisphosphonate.",
    use: "Fracture risk reduction in osteoporosis.",
    safety: "Take with plain water and remain upright to reduce esophageal irritation.",
  },
  {
    drug: "Sertraline",
    category: "Psychiatry",
    mechanism: "Selectively inhibits serotonin reuptake in the CNS.",
    use: "Major depressive disorder and anxiety-spectrum disorders.",
    safety: "Clinical benefit is delayed; adherence in first weeks is important.",
  },
  {
    drug: "Amitriptyline",
    category: "Psychiatry",
    mechanism: "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
    use: "Neuropathic pain and selected depressive disorders.",
    safety: "Sedation and anticholinergic effects can limit tolerability.",
  },
  {
    drug: "Haloperidol",
    category: "Psychiatry",
    mechanism: "Potent dopamine D2 receptor antagonism in mesolimbic pathways.",
    use: "Short-term control of acute psychosis or severe agitation.",
    safety: "Monitor for extrapyramidal symptoms and acute dystonic reactions.",
  },
  {
    drug: "Risperidone",
    category: "Psychiatry",
    mechanism: "Antagonizes dopamine D2 and serotonin 5-HT2A receptors.",
    use: "Schizophrenia and related psychotic disorders.",
    safety: "Monitor weight, lipids, and glucose for metabolic adverse effects.",
  },
  {
    drug: "Lithium",
    category: "Psychiatry",
    mechanism: "Modulates intracellular signaling pathways involved in mood stabilization.",
    use: "Maintenance treatment of bipolar disorder.",
    safety: "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
  },
  {
    drug: "Sodium valproate",
    category: "Neurology",
    mechanism: "Enhances GABAergic transmission and modulates neuronal firing.",
    use: "Generalized and focal seizure disorders.",
    safety: "Contraindicated in pregnancy unless no safer alternatives exist.",
  },
  {
    drug: "Carbamazepine",
    category: "Neurology",
    mechanism: "Blocks voltage-gated sodium channels in overactive neurons.",
    use: "Focal seizures and trigeminal neuralgia.",
    safety: "Can cause hyponatremia and requires periodic blood monitoring.",
  },
  {
    drug: "Levetiracetam",
    category: "Neurology",
    mechanism: "Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.",
    use: "Adjunct or monotherapy for focal and generalized seizures.",
    safety: "Behavioral changes such as irritability should be monitored.",
  },
  {
    drug: "Lamotrigine",
    category: "Neurology",
    mechanism: "Inhibits voltage-sensitive sodium channels and glutamate release.",
    use: "Seizure control and bipolar depression maintenance.",
    safety: "Slow titration reduces risk of serious rash including SJS.",
  },
  {
    drug: "Omeprazole",
    category: "Gastroenterology",
    mechanism: "Irreversibly inhibits the gastric H+/K+-ATPase proton pump.",
    use: "GERD and peptic ulcer disease acid suppression.",
    safety: "Use the lowest effective duration to limit long-term adverse effects.",
  },
  {
    drug: "Ondansetron",
    category: "Oncology",
    mechanism: "Blocks serotonin 5-HT3 receptors in the gut and chemoreceptor trigger zone.",
    use: "Prevention of chemotherapy-induced nausea and vomiting.",
    safety: "QT prolongation risk increases in susceptible patients.",
  },
  {
    drug: "Metoclopramide",
    category: "Gastroenterology",
    mechanism: "Dopamine D2 antagonism with prokinetic effects on upper GI tract.",
    use: "Short-term management of gastroparesis-related nausea.",
    safety: "Extrapyramidal effects limit long-term use.",
  },
  {
    drug: "Lactulose",
    category: "Palliative Care",
    mechanism: "Osmotically retains water in the bowel and reduces ammonia absorption.",
    use: "Constipation relief and adjunct treatment in hepatic encephalopathy.",
    safety: "Dose should be titrated to avoid severe diarrhea and dehydration.",
  },
  {
    drug: "Mesalazine",
    category: "Clinical Assessment",
    mechanism: "Topical anti-inflammatory action in colonic mucosa via 5-ASA.",
    use: "Induction and maintenance therapy in ulcerative colitis.",
    safety: "Assess renal function periodically during long-term therapy.",
  },
  {
    drug: "Donepezil",
    category: "Geriatric Medicine",
    mechanism: "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.",
    use: "Symptomatic treatment of mild-to-moderate Alzheimer disease.",
    safety: "Can cause bradycardia and syncope in vulnerable older adults.",
  },
  {
    drug: "Potassium chloride",
    category: "Electrolytes",
    mechanism: "Replaces potassium to restore intracellular and extracellular potassium balance.",
    use: "Prevention and treatment of documented hypokalemia.",
    safety: "Rapid correction can be dangerous; monitor ECG and serum potassium.",
  },
  {
    drug: "Sodium polystyrene sulfonate",
    category: "Nephrology",
    mechanism: "Exchanges sodium for potassium in the gut to reduce serum potassium.",
    use: "Adjunctive management of non-emergent hyperkalemia.",
    safety: "Monitor bowel function; rare serious GI complications can occur.",
  },
  {
    drug: "Desmopressin",
    category: "Nephrology",
    mechanism: "Synthetic vasopressin analog that increases water reabsorption via V2 receptors.",
    use: "Central diabetes insipidus and selected nocturnal enuresis cases.",
    safety: "Water intoxication and hyponatremia are key monitoring concerns.",
  },
  {
    drug: "Sevelamer",
    category: "Nephrology",
    mechanism: "Binds dietary phosphate in the gut to reduce phosphate absorption.",
    use: "Hyperphosphatemia control in chronic kidney disease.",
    safety: "Should be taken with meals for maximal phosphate binding.",
  },
  {
    drug: "Calcitriol",
    category: "Clinical Nutrition",
    mechanism: "Active vitamin D analog that increases intestinal calcium absorption.",
    use: "Management of secondary hyperparathyroidism in chronic kidney disease.",
    safety: "Hypercalcemia risk requires regular calcium and phosphate monitoring.",
  },
  {
    drug: "Allopurinol",
    category: "Rheumatology",
    mechanism: "Inhibits xanthine oxidase, lowering uric acid production.",
    use: "Long-term urate-lowering therapy in recurrent gout.",
    safety: "Start low and titrate to reduce hypersensitivity risk.",
  },
  {
    drug: "Colchicine",
    category: "Rheumatology",
    mechanism: "Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.",
    use: "Acute gout flare treatment and flare prophylaxis when starting ULT.",
    safety: "Dose-related diarrhea is common and signals need for dose review.",
  },
  {
    drug: "Timolol ophthalmic",
    category: "Ophthalmology",
    mechanism: "Topical beta-blockade reduces aqueous humor production.",
    use: "Reduction of intraocular pressure in open-angle glaucoma.",
    safety: "Systemic absorption may cause bradycardia; punctal occlusion reduces exposure.",
  },
];

function parseFlags(argv) {
  const args = new Set(argv.slice(2));
  return {
    apply: args.has("--apply"),
  };
}

function normalizeQuestionText(text = "") {
  return String(text || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function pickDistinct(pool, excluded, count, seed) {
  const options = pool.filter((value) => !excluded.has(value));
  const picked = [];
  let idx = seed % Math.max(1, options.length);
  while (picked.length < count && options.length > 0) {
    const value = options[idx % options.length];
    if (!picked.includes(value)) {
      picked.push(value);
    }
    idx += 7;
    if (picked.length === options.length) break;
  }
  return picked.slice(0, count);
}

function buildQuestions(existing, startId) {
  const existingTexts = new Set(existing.map((q) => normalizeQuestionText(q.question)));
  const mechanismPool = cards.map((c) => c.mechanism);
  const usePool = cards.map((c) => c.use);
  const safetyPool = cards.map((c) => c.safety);

  let nextId = startId;
  const generated = [];

  cards.forEach((card, cardIndex) => {
    const templates = [
      {
        stem: `Which ONE of the following best describes the primary mechanism of ${card.drug}?`,
        correct: card.mechanism,
        pool: mechanismPool,
      },
      {
        stem: `Which ONE of the following is the MOST appropriate therapeutic use of ${card.drug}?`,
        correct: card.use,
        pool: usePool,
      },
      {
        stem: `Which ONE of the following is the MOST important safety point to counsel or monitor when using ${card.drug}?`,
        correct: card.safety,
        pool: safetyPool,
      },
    ];

    templates.forEach((template, templateIndex) => {
      const excluded = new Set([template.correct]);
      const distractors = pickDistinct(
        template.pool,
        excluded,
        4,
        (cardIndex + 3) * (templateIndex + 5),
      );
      const options = [template.correct, ...distractors];
      const rotated = options.map((_, i) => options[(i + cardIndex + templateIndex) % options.length]);
      const questionText = `Q${nextId}. ${template.stem}`;
      const normalized = normalizeQuestionText(questionText);
      if (existingTexts.has(normalized)) {
        throw new Error(`Duplicate question stem detected: ${questionText}`);
      }
      existingTexts.add(normalized);
      generated.push({
        id: nextId,
        type: "match",
        category: card.category,
        question: questionText,
        options: rotated,
        correct: template.correct,
        explanation: `${card.drug}: ${template.correct}`,
      });
      nextId += 1;
    });
  });

  return generated;
}

async function run() {
  const { apply } = parseFlags(process.argv);
  const mode = apply ? "APPLY" : "DRY-RUN";

  const moduleUrl = `${pathToFileURL(dataPath).href}?v=${Date.now()}`;
  const imported = await import(moduleUrl);
  const existingFrontend = Array.isArray(imported.baseQuestions) ? imported.baseQuestions : [];
  const existingBackendRaw = JSON.parse(await fs.readFile(backendQuestionsPath, "utf8"));
  const existingBackend = Array.isArray(existingBackendRaw) ? existingBackendRaw : [];

  const maxId = Math.max(
    ...existingFrontend.map((q) => Number(q.id) || 0),
    ...existingBackend.map((q) => Number(q.id) || 0),
    0,
  );
  const startId = maxId + 1;
  const generated = buildQuestions(existingFrontend, startId);

  const frontendNext = [...existingFrontend, ...generated];
  const backendNext = [...existingBackend, ...generated];

  const ids = frontendNext.map((q) => Number(q.id));
  const uniqueCount = new Set(ids).size;

  console.log(`[${mode}] Existing frontend: ${existingFrontend.length}`);
  console.log(`[${mode}] Existing backend: ${existingBackend.length}`);
  console.log(`[${mode}] Generated: ${generated.length}`);
  console.log(`[${mode}] Next total: ${frontendNext.length}`);
  console.log(`[${mode}] Unique IDs: ${uniqueCount}`);

  if (!apply) {
    console.log("[DRY-RUN] No files were modified.");
    return;
  }

  const frontendModule = `export const baseQuestions = ${JSON.stringify(frontendNext, null, 2)};\n`;
  await fs.writeFile(dataPath, frontendModule, "utf8");
  await fs.writeFile(backendQuestionsPath, `${JSON.stringify(backendNext, null, 2)}\n`, "utf8");

  console.log("[APPLY] Updated files:");
  console.log(` - ${dataPath}`);
  console.log(` - ${backendQuestionsPath}`);
}

run().catch((error) => {
  console.error("Question expansion failed:", error?.stack || error?.message || error);
  process.exitCode = 1;
});
