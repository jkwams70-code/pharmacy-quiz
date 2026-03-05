export const baseQuestions = [
  {
    id: 92,
    type: "match",
    category: "Haematology",
    question:
      "Q92. Which ONE of the following laboratory parameters may be decreased in iron deficiency anaemia?",
    options: ["MCHC", "lymphocytes", "HbA1c", "INR", "thrombocytes"],
    correct: "MCHC",
    explanation:
      "Mean corpuscular haemoglobin concentration (MCHC) decreases in iron deficiency anaemia.",
    explainCorrect:
      "MCHC reflects haemoglobin concentration in packed red cells. In iron deficiency, haemoglobin synthesis falls, so MCHC drops.",
    wrongOptionExplanations: {
      lymphocytes:
        "Lymphocyte count is a white-cell parameter and is not the classic marker for iron-deficiency red-cell hypochromia.",
      HbA1c:
        "HbA1c reflects glycaemic exposure over time, not direct iron-deficiency morphology.",
      INR: "INR evaluates extrinsic coagulation pathway, not red-cell indices.",
      thrombocytes:
        "Platelet count may vary, but decreased MCHC is the stronger and more direct laboratory feature.",
    },
    memoryTrick:
      "Iron deficiency makes red cells paler, so think low haemoglobin density inside RBCs: low MCHC.",
  },
  {
    id: 81,
    type: "match",
    category: "Haematology",
    question:
      "Q81. Which ONE of the following laboratory parameters may have an increased value in viral infections?",
    options: ["MCHC", "lymphocytes", "HbA1c", "INR", "thrombocytes"],
    correct: "lymphocytes",
    explanation: "Lymphocyte count increases in viral infections.",
    explainCorrect:
      "Viral infections commonly produce relative or absolute lymphocytosis as part of adaptive immune activation.",
    wrongOptionExplanations: {
      MCHC: "MCHC is an RBC index and is not expected to rise because of a typical viral syndrome.",
      HbA1c:
        "HbA1c tracks chronic glucose control and does not acutely rise from viral infection.",
      INR: "INR measures coagulation pathway effect and is not a routine marker of uncomplicated viral infection.",
      thrombocytes:
        "Platelets may change in specific viral illnesses, but lymphocyte rise is the standard expected finding.",
    },
    memoryTrick:
      "Virus = adaptive immunity spotlight. Adaptive cells are lymphocytes, so think lymphocytosis.",
  },
  {
    id: 83,
    type: "match",
    category: "Haematology",
    question:
      "Q83. Which ONE of the following may have a decreased value in idiopathic thrombocytopenia purpura?",
    options: ["MCHC", "lymphocytes", "HbA1c", "INR", "thrombocytes"],
    correct: "thrombocytes",
    explanation:
      "Idiopathic thrombocytopenia purpura results in reduced platelet count.",
    explainCorrect:
      "ITP is defined by immune-mediated platelet destruction, so thrombocyte count falls.",
    wrongOptionExplanations: {
      MCHC: "MCHC is a red-cell concentration index and is not the defining reduced parameter in ITP.",
      lymphocytes:
        "ITP is primarily a platelet disorder, not a lymphocyte-count disorder.",
      HbA1c: "HbA1c is unrelated to acute platelet immune destruction.",
      INR: "INR assesses clotting factors; ITP affects platelet number rather than coagulation factor pathways.",
    },
    memoryTrick:
      "ITP starts with T for thrombocytes and thrombocytopenia: platelets are the count that drops.",
  },
  {
    id: 200,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q200. Which ONE of the following conditions is manifested by muscle weakness and muscle wasting?",
    options: ["tachypnoea", "hypoxia", "afterload", "myopathy", "dysphasia"],
    correct: "myopathy",
    explanation: "Myopathy is characterised by muscle weakness and wasting.",
    explainCorrect:
      "Myopathy directly refers to disease of muscle tissue, classically presenting with weakness and possible wasting.",
    wrongOptionExplanations: {
      tachypnoea: "Tachypnoea means fast breathing, not muscle disease.",
      hypoxia:
        "Hypoxia is low tissue oxygen status, not a diagnostic term for muscle wasting.",
      afterload: "Afterload is a cardiovascular haemodynamic concept.",
      dysphasia:
        "Dysphasia concerns language function, not primary muscle pathology.",
    },
    memoryTrick:
      "Myo = muscle. Myopathy means muscle problem, so weakness/wasting points to myopathy.",
  },
  {
    id: 138,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q138. Which ONE of the following is characterised by a rapid rate of breathing?",
    options: ["tachypnoea", "hypoxia", "afterload", "myopathy", "dysphasia"],
    correct: "tachypnoea",
    explanation: "Tachypnoea refers to an abnormally rapid respiratory rate.",
    explainCorrect:
      "Tachypnoea is the formal term for increased respiratory rate.",
    wrongOptionExplanations: {
      hypoxia: "Hypoxia describes low oxygen state, not breathing rate itself.",
      afterload:
        "Afterload relates to cardiac ventricular ejection resistance.",
      myopathy: "Myopathy is a muscle disorder term.",
      dysphasia: "Dysphasia is language impairment.",
    },
    memoryTrick:
      "Tachy means fast, pnoea relates to breathing: fast breathing equals tachypnoea.",
  },
  {
    id: 285,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q285. Which ONE of the following refers to an impairment of the language aspect of speech?",
    options: ["tachypnoea", "hypoxia", "afterload", "myopathy", "dysphasia"],
    correct: "dysphasia",
    explanation: "Dysphasia (aphasia) refers to language impairment.",
    explainCorrect:
      "Dysphasia is impairment in language production and/or comprehension.",
    wrongOptionExplanations: {
      tachypnoea: "Respiratory-rate term, not language function.",
      hypoxia:
        "Physiological oxygen deficit, not specific language impairment terminology.",
      afterload: "Cardiovascular haemodynamic term.",
      myopathy: "Muscle pathology term.",
    },
    memoryTrick:
      "Phasia relates to speech/language. Dys-phasia means disordered language.",
  },
  {
    id: 90,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "D",
    question:
      "Q90. Drugs that may cause plasma sodium electrolyte disturbances include:",
    statements: [" Prednisolone", " Salbutamol", " Propranolol"],
    explanation:
      "Only statement 1 is correct. Prednisolone may cause sodium and water retention; salbutamol and propranolol do not cause plasma sodium disturbance in this context.",
    explainCorrect:
      "Option D (1 only) is correct because corticosteroid mineralocorticoid effects can alter sodium and fluid balance, while statements 2 and 3 are not reliable sodium-disturbance causes here.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not accepted causes in this context.",
      B: "Statement 2 is the error; including it makes this option incorrect.",
      C: "Omits statement 1, which is the only correct statement.",
      E: "Statement 3 alone is not correct and misses statement 1.",
    },
    memoryTrick:
      "For sodium disturbance in this set, think steroid salt retention first: only statement 1 survives.",
  },
  {
    id: 119,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "A",
    question:
      "Q119. Conditions that may give rise to muscular or joint pain include:",
    statements: [" Paget’s disease", " Neuropathy", " Haemophilia"],
    explanation: "All three conditions may cause musculoskeletal pain.",
    explainCorrect:
      "Option A is correct because each listed condition can present with pain affecting muscles or joints in clinical practice.",
    wrongOptionExplanations: {
      B: "Excludes statement 3, which can still contribute to painful musculoskeletal episodes.",
      C: "Excludes statement 1, which is a known painful bone disorder.",
      D: "Contains only statement 1 and misses statements 2 and 3.",
      E: "Contains only statement 3 and misses statements 1 and 2.",
    },
    memoryTrick: "If each statement can cause pain, choose all-three (A).",
  },
  {
    id: 146,
    type: "combo",
    category: "Oncology",
    correct: "A",
    question:
      "Q146. Symptoms that may indicate neoplastic disease if unexplained include:",
    statements: [
      " Skin ulceration",
      " Unexplained fractures",
      " General debility",
    ],
    explanation: "All are potential red-flag signs of malignancy.",
    explainCorrect:
      "Option A is correct because persistent ulceration, unexplained fractures, and constitutional decline can all be warning signs of underlying neoplastic disease.",
    wrongOptionExplanations: {
      B: "Drops statement 3, but general debility is a relevant red flag.",
      C: "Drops statement 1, though persistent ulceration can indicate malignancy.",
      D: "Only statement 1 is insufficient because statements 2 and 3 are also valid.",
      E: "Only statement 3 is incomplete since statements 1 and 2 are also concerning.",
    },
    memoryTrick:
      "Cancer red flags are broad. If all listed signs are suspicious, choose all-three.",
  },
  {
    id: 28,
    type: "combo",
    category: "Oncology",
    correct: "C",
    question:
      "Q28. Possible causes of resistance to cytotoxic chemotherapy include:",
    statements: [
      " Increased cellular uptake",
      " Increased repair of DNA damage",
      " Poor penetration into tumour tissue",
    ],
    explanation:
      "Increased DNA repair and poor tumour penetration contribute to resistance.",
    explainCorrect:
      "Option C (2 and 3 only) is correct because enhanced DNA repair and poor tumour drug penetration reduce cytotoxic effect, while increased uptake would usually increase response rather than resistance.",
    wrongOptionExplanations: {
      A: "Includes statement 1, but increased uptake is not a resistance mechanism here.",
      B: "Includes statement 1 and omits statement 3, so mechanism set is wrong.",
      D: "Only statement 1 is incorrect in this context.",
      E: "Only statement 3 misses statement 2, which is also a resistance cause.",
    },
    memoryTrick:
      "Resistance in this item is repair plus reach: DNA repair and poor penetration (2 + 3).",
  },
  {
    id: 154,
    type: "combo",
    category: "Neurology",
    correct: "B",
    question:
      "Q154. In Parkinson’s disease, the patient could be referred for services from the:",
    statements: [
      " Speech therapy department",
      " Physiotherapy department",
      " Pain management team",
    ],
    explanation: "Speech therapy and physiotherapy are appropriate referrals.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because Parkinson's commonly needs speech and movement rehabilitation; statement 3 is not the core referral pair in this question.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the expected primary referral in this item.",
      C: "Misses statement 1, yet speech therapy is appropriate.",
      D: "Only statement 1 is incomplete because statement 2 is also appropriate.",
      E: "Only statement 3 is not the expected answer focus.",
    },
    memoryTrick:
      "Parkinson's rehab pair in this set is speech plus physio: 1 and 2.",
  },
  {
    id: 4,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "B",
    question: "Q4. With respect to ultrasound scanning:",
    statements: [
      " It is associated with no radiation dose",
      " It may be used to define organ size and shape",
      " It can detect arterial blood flow to the organ",
    ],
    explanation:
      "Statements 1 and 2 are correct in this context; ultrasound is non-ionising and is used to assess organ size and shape.",
    explainCorrect:
      "Option B (1 and 2 only) is correct for this question framing: non-ionising imaging and structural assessment are core facts being tested.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not accepted in this question's keyed context.",
      C: "Omits statement 1, which is a core true point.",
      D: "Only statement 1 misses statement 2, which is also correct.",
      E: "Only statement 3 does not match the keyed answer here.",
    },
    memoryTrick:
      "Ultrasound basics here: no ionising radiation plus organ shape assessment (1 and 2).",
  },
  {
    id: 64,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "B",
    question: "Q64. Regarding creatinine clearance:",
    statements: [
      " It is an index used to measure glomerular filtration rate",
      " Measurement involves a 24-hour urine collection",
      " Measurement requires 24-hour monitoring of plasma creatinine",
    ],
    explanation: "Statements 1 and 2 are correct.",
    explainCorrect:
      "Option B (1 and 2 only) is correct: creatinine clearance estimates GFR and classic measurement uses timed urine collection; statement 3 is not required as written.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is the incorrect part.",
      C: "Misses statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also correct.",
      E: "Only statement 3 is the incorrect statement.",
    },
    memoryTrick:
      "Creatinine clearance pattern: GFR estimate plus 24-hour urine (1 and 2).",
  },
  {
    id: 107,
    type: "combo",
    category: "Cardiology",
    correct: "D",
    question:
      "Q107. Patients receiving isosorbide dinitrate should be advised that:",
    statements: [
      " The occurrence of headaches tends to decrease with continued therapy",
      " Tablets should be discarded 8 weeks after opening the container",
      " Tablets should be stored in glass containers",
    ],
    explanation:
      "Only statement 1 is correct. Headache commonly occurs early with nitrates and usually lessens with continued therapy.",
    explainCorrect:
      "Option D (1 only) is correct because nitrate headache tolerance commonly develops; statements 2 and 3 are not the keyed counselling points in this item.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, both not accepted as correct here.",
      B: "Includes statement 2, which is not the keyed truth.",
      C: "Omits statement 1, the only correct statement.",
      E: "Only statement 3 is not correct in this context.",
    },
    memoryTrick:
      "Nitrate counselling here: headache improves over time, so choose 1 only.",
  },
  {
    id: 122,
    type: "combo",
    category: "Cardiology",
    correct: "B",
    question: "Q122. With respect to adrenaline:",
    statements: [
      " It is used in cardiac arrest",
      " Administration requires monitoring of blood pressure",
      " It results in a fall in blood pressure",
    ],
    explanation: "Statements 1 and 2 are correct.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because adrenaline is used in cardiac arrest and requires haemodynamic monitoring; statement 3 is incorrect.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is false in this setting.",
      C: "Omits statement 1 and keeps statement 3, making it incorrect.",
      D: "Only statement 1 is incomplete because statement 2 is also true.",
      E: "Only statement 3 is the false statement.",
    },
    memoryTrick:
      "Adrenaline in this item is arrest use plus monitor BP; ignore the 'falls BP' distractor.",
  },
  {
    id: 282,
    type: "combo",
    category: "Psychiatry",
    correct: "C",
    question: "Q282. With respect to methadone:",
    statements: [
      " It requires multiple dosing in a day",
      " It is addictive",
      " It is an opioid agonist",
    ],
    explanation: "Statements 2 and 3 are correct.",
    explainCorrect:
      "Option C (2 and 3 only) is correct because methadone is an opioid agonist with dependence potential; statement 1 is not generally true for standard maintenance schedules.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is the incorrect component.",
      B: "Includes statement 1 and omits statement 3.",
      D: "Only statement 1 is not correct for this question.",
      E: "Only statement 3 misses statement 2, which is also true.",
    },
    memoryTrick:
      "Methadone key pair here: addictive plus opioid agonist (2 and 3).",
  },
  {
    id: 115,
    type: "combo",
    category: "Oncology",
    correct: "A",
    question: "Q115. Patients receiving tamoxifen should be advised:",
    statements: [
      " That hot flushes may occur",
      " That menstrual irregularities may occur",
      " To report sudden breathlessness and any pain in the calf",
    ],
    explanation: "All three statements are correct.",
    explainCorrect:
      "Option A is correct because tamoxifen counselling includes vasomotor effects, possible menstrual changes, and urgent reporting of thromboembolic warning signs.",
    wrongOptionExplanations: {
      B: "Excludes statement 3, but thromboembolism warning symptoms are essential counselling.",
      C: "Excludes statement 1, yet hot flushes are common with tamoxifen.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also important.",
      E: "Only statement 3 misses other routine counselling points in statements 1 and 2.",
    },
    memoryTrick:
      "Tamoxifen counselling triad here is flushes, cycle changes, and clot-red-flag reporting: all three.",
  },
  {
    id: 143,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "B",
    question: "Q143. Regarding parenteral sodium bicarbonate:",
    statements: [
      " It raises blood pH",
      " It is indicated in metabolic acidosis",
      " It may be used in hypomagnesaemia",
    ],
    explanation: "Statements 1 and 2 are correct.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because sodium bicarbonate raises systemic pH and is used in selected metabolic acidosis; statement 3 is not an indication.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a standard indication here.",
      C: "Misses statement 1 and includes statement 3, making it incorrect.",
      D: "Only statement 1 is incomplete because statement 2 is also correct.",
      E: "Only statement 3 is incorrect in this context.",
    },
    memoryTrick:
      "Bicarbonate question pattern: think buffer and acidosis, not magnesium.",
  },
  {
    id: 267,
    type: "combo",
    category: "Haematology",
    correct: "A",
    question: "Q267. With respect to phytomenadione:",
    statements: [
      " It is a lipid-soluble analogue of vitamin K",
      " It promotes hepatic synthesis of active prothrombin",
      " It is indicated in babies at birth to prevent vitamin K deficiency bleeding",
    ],
    explanation: "All statements are correct.",
    explainCorrect:
      "Option A is correct because phytomenadione is vitamin K1, supports synthesis of vitamin K-dependent clotting factors, and is given at birth to prevent VKDB.",
    wrongOptionExplanations: {
      B: "Excludes statement 3, but neonatal prophylaxis is a key use.",
      C: "Excludes statement 1, which correctly identifies phytomenadione as vitamin K analogue.",
      D: "Only statement 1 is incomplete; statements 2 and 3 are also true.",
      E: "Only statement 3 omits true core pharmacology points in statements 1 and 2.",
    },
    memoryTrick:
      "Phytomenadione = vitamin K1 from mechanism to newborn prophylaxis, so all three are true.",
  },
  {
    id: 169,
    type: "combo",
    category: "Haematology",
    correct: "A",
    question: "Q169. Regarding enoxaparin:",
    statements: [
      " It cannot be used at the same dose as heparin",
      " Thrombocytopenia may occur with its use",
      " Agents that affect haemostasis should be used with care",
    ],
    explanation: "All statements are correct.",
    explainCorrect:
      "Option A is correct because enoxaparin uses different dosing from unfractionated heparin, can cause thrombocytopenia, and requires caution with other haemostasis-affecting drugs.",
    wrongOptionExplanations: {
      B: "Excludes statement 3, yet bleeding-risk interactions are an important caution.",
      C: "Excludes statement 1, but LMWH and UFH dosing are not interchangeable.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also true.",
      E: "Only statement 3 misses true statements 1 and 2.",
    },
    memoryTrick:
      "For enoxaparin here: dosing differs, platelets can drop, bleeding risk rises with interacting drugs.",
  },
  {
    id: 283,
    type: "combo",
    category: "Dermatology",
    correct: "A",
    question: "Q283. Patients receiving oral isotretinoin should be advised:",
    statements: [
      " To avoid pregnancy",
      " To avoid wax epilation during treatment",
      " To use a lip balm regularly",
    ],
    explanation: "All statements are correct.",
    explainCorrect:
      "Option A is correct because isotretinoin is highly teratogenic, increases skin fragility (avoid wax epilation), and commonly causes cheilitis needing lip moisturiser.",
    wrongOptionExplanations: {
      B: "Excludes statement 3, but lip care is standard isotretinoin advice.",
      C: "Excludes statement 1, which is critical due to teratogenicity.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also standard advice.",
      E: "Only statement 3 omits critical counselling in statements 1 and 2.",
    },
    memoryTrick:
      "Isotretinoin counselling in this item is pregnancy prevention, fragile skin care, and lip protection: all three.",
  },
  {
    id: 223,
    type: "combo",
    category: "Gastroenterology",
    correct: "C",
    question:
      "Q223. A patient who will be undergoing a colonoscopy is advised to:",
    statements: [
      " Use a topical haemorrhoid preparation before admission",
      " Take a bowel cleansing preparation",
      " Avoid solid food on the previous day",
    ],
    explanation: "Statements 2 and 3 are correct.",
    explainCorrect:
      "Option C (2 and 3 only) is correct because bowel prep and dietary restriction are standard pre-colonoscopy preparation; statement 1 is not a routine requirement.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not part of standard preparation in this question.",
      B: "Includes statement 1 and omits statement 3.",
      D: "Only statement 1 is not correct in this context.",
      E: "Only statement 3 misses statement 2, which is also necessary.",
    },
    memoryTrick:
      "Colonoscopy prep here is cleanse plus no solids: statements 2 and 3.",
  },
  {
    id: 82,
    type: "combo",
    category: "Respiratory",
    correct: "B",
    question: "Q82. In which of the following cases is referral recommended:",
    statements: [
      " A paediatric patient with a history of asthma presenting with a chest infection",
      " A patient receiving diuretics presenting with symptoms of heat stroke",
      " A tourist presenting with acute diarrhoea",
    ],
    explanation: "Statements 1 and 2 warrant referral.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because paediatric chest infection with asthma history and suspected heat-stroke symptoms on diuretics both need escalation; statement 3 is not the key referral trigger here.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the keyed referral case in this item.",
      C: "Misses statement 1, which does warrant referral.",
      D: "Only statement 1 is incomplete because statement 2 also warrants referral.",
      E: "Only statement 3 is not the selected referral case in this question.",
    },
    memoryTrick:
      "Referral in this set is child chest risk plus heat-stroke red flags: 1 and 2.",
  },
  {
    id: 168,
    type: "combo",
    category: "Infectious Diseases",
    correct: "B",
    question:
      "Q168. Anti-infectives used in triple-therapy regimens to eradicate Helicobacter pylori include:",
    statements: [" Metronidazole", " Clarithromycin", " Telithromycin"],
    explanation: "Statements 1 and 2 are correct.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because metronidazole and clarithromycin are established H. pylori regimen agents; telithromycin is not standard here.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not part of the standard regimen in this question.",
      C: "Misses statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also correct.",
      E: "Only statement 3 is not correct in this treatment context.",
    },
    memoryTrick:
      "For this H. pylori item, think metro plus clarithro; telithro is the distractor.",
  },
  {
    id: 319,
    type: "combo",
    category: "Infectious Diseases",
    correct: "D",
    question: "Q319. In HIV infection:",
    statements: [
      " Accumulation of mutations associated with drug resistance may occur",
      " Drug resistance testing is not possible",
      " Monotherapy is preferred",
    ],
    explanation: "Statement 1 only is correct.",
    explainCorrect:
      "Option D (1 only) is correct because resistance mutations can accumulate; statements 2 and 3 are false since resistance testing is possible and monotherapy is not preferred.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, both incorrect.",
      B: "Includes statement 2, which is false because resistance testing can be done.",
      C: "Omits statement 1 and keeps statement 3, so it is incorrect.",
      E: "Only statement 3 is false and misses true statement 1.",
    },
    memoryTrick:
      "HIV therapy logic here: resistance can evolve, testing exists, and monotherapy is not preferred.",
  },
  {
    id: 89,
    type: "combo",
    category: "Endocrinology",
    correct: "B",
    question: "Q89. Diabetic ketoacidosis:",
    statements: [
      " Is associated with insulin deficiency",
      " May be precipitated by a severe infection",
      " Causes retinopathy",
    ],
    explanation: "Statements 1 and 2 are correct.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because diabetic ketoacidosis is linked to insulin deficiency and can be precipitated by severe infection; retinopathy is a chronic complication, not an acute DKA feature.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not an acute defining feature of DKA.",
      C: "Misses statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also true.",
      E: "Only statement 3 is incorrect in this acute DKA context.",
    },
    memoryTrick:
      "DKA in this item is deficiency plus trigger (infection): statements 1 and 2.",
  },
  {
    id: 131,
    type: "combo",
    category: "Cardiology",
    caseId: "case1",
    caseBlock:
      "PS is hospitalised with pulmonary oedema. The patient is started on metolazone 2.5 mg once daily and bumetanide 2 mg twice daily intravenously.",
    correct: "C",
    question: "Q131. Signs and symptoms of pulmonary oedema include:",
    statements: ["1. Weight loss", "2. Dyspnoea", "3. Cough"],
    explanation: "Pulmonary oedema presents with dyspnoea and cough.",
    explainCorrect:
      "Option C (2 and 3 only) is correct because acute pulmonary oedema classically presents with breathlessness and cough; weight loss is not a typical acute sign.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not an expected acute pulmonary oedema sign in this context.",
      B: "Includes statement 1 and omits statement 3.",
      D: "Only statement 1 is not the correct clinical feature set here.",
      E: "Only statement 3 misses statement 2, which is also a key symptom.",
    },
    memoryTrick:
      "Pulmonary oedema in this case is breath and cough, not weight loss.",
  },
  {
    id: 42,
    type: "combo",
    category: "Cardiology",
    caseId: "case1",
    correct: "C",
    question: "Q42. Precipitants of acute pulmonary oedema include:",
    statements: [
      "1. Hypothyroidism",
      "2. Excessive infusion rate",
      "3. Heart failure",
    ],
    explanation:
      "Excessive IV fluids and heart failure can precipitate pulmonary oedema.",
    explainCorrect:
      "Option C (2 and 3 only) is correct because fluid overload and heart failure are common precipitants of pulmonary oedema; hypothyroidism is not the direct precipitant in this item.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not the keyed precipitant in this case.",
      B: "Includes statement 1 and omits statement 3.",
      D: "Only statement 1 is incorrect for this question.",
      E: "Only statement 3 misses statement 2, another major precipitant.",
    },
    memoryTrick:
      "For acute pulmonary oedema triggers here: fluid excess plus failing pump.",
  },
  {
    id: 252,
    type: "combo",
    category: "Cardiology",
    caseId: "case1",
    correct: "B",
    question:
      "Q252. Parameters that are monitored during metolazone therapy include:",
    statements: [
      "1. Body weight",
      "2. Electrolytes",
      "3. Liver function tests",
    ],
    explanation: "Weight and electrolytes must be monitored with diuretics.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because diuretic therapy monitoring focuses on volume status and electrolytes; routine liver tests are not the core monitoring target here.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the key routine monitoring parameter in this question.",
      C: "Omits statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also essential.",
      E: "Only statement 3 is not the keyed monitoring item.",
    },
    memoryTrick:
      "Diuretics: monitor water and salts first, so body weight plus electrolytes.",
  },
  {
    id: 102,
    type: "single",
    category: "Cardiology",
    caseId: "case1",
    question: "Q102. Metolazone and bumetanide:",
    options: [
      "Reduce the blood volume",
      "Produce a euphoric state",
      "Cause sedation",
      "Control bronchospasm",
      "Prevent embolisation",
    ],
    correct: "Reduce the blood volume",
    explanation: "Both drugs are diuretics and reduce blood volume.",
    explainCorrect:
      "Metolazone and bumetanide are diuretics, so their shared therapeutic effect is promoting fluid loss and lowering circulating blood volume.",
    wrongOptionExplanations: {
      "Produce a euphoric state":
        "Diuretics do not produce euphoria as a therapeutic class effect.",
      "Cause sedation":
        "Sedation is not the key intended action of metolazone or bumetanide.",
      "Control bronchospasm":
        "Bronchospasm control is a bronchodilator role, not a diuretic role.",
      "Prevent embolisation":
        "These medicines do not directly prevent clot embolization; anticoagulants/antiplatelets do that.",
    },
    memoryTrick: "Metolazone plus bumetanide means fluid out, volume down.",
  },
  {
    id: 30,
    type: "combo",
    category: "Cardiology",
    caseId: "case1",
    correct: "B",
    question:
      "Q30. When PS is stabilised, the therapeutic plan should consider:",
    statements: [
      "1. Stopping metolazone treatment",
      "2. Changing bumetanide to an oral formulation",
      "3. Starting co-amoxiclav",
    ],
    explanation:
      "After stabilisation, step-down therapy and conversion to oral diuretics may be considered.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because stabilisation planning includes stepping down acute diuretic strategy and converting IV loop diuretic to oral; starting co-amoxiclav is not automatically indicated.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a default stabilisation step here.",
      C: "Omits statement 1 while including statement 3, so the plan is incorrect.",
      D: "Only statement 1 misses statement 2, which is also part of step-down planning.",
      E: "Only statement 3 is not a routine next step in this context.",
    },
    memoryTrick:
      "After acute pulmonary oedema stabilises, think de-escalate and go oral, not new antibiotics by default.",
  },
  {
    id: 47,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    caseBlock:
      "CA is a 77-year-old patient admitted with infected multiple sores and complaints of polyuria and weakness. She presents with reduced skin turgor, dehydration, tremor and confusion. Past medical history includes diabetes managed by diet alone. On admission she is started on glibenclamide 2.5 mg daily, ciprofloxacin 500 mg bd, sodium chloride 0.9% IV infusion and haloperidol 0.5 mg bd. Random blood glucose: 12 mmol/L. Blood pressure: 125/78 mmHg.",
    correct: "B",
    question: "Q47. Management aims for CA include:",
    statements: [
      "1. Rehydration",
      "2. Control of hyperglycaemia",
      "3. Management of hypertension",
    ],
    explanation:
      "Management should focus on rehydration and control of hyperglycaemia. Blood pressure is normal and does not require intervention.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because this patient needs fluid resuscitation and glycaemic control; hypertension management is not the priority given normal blood pressure.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not indicated from the provided blood pressure.",
      C: "Omits statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also required.",
      E: "Only statement 3 is not a current management target.",
    },
    memoryTrick:
      "In dehydrated hyperglycaemic cases, treat fluids and glucose first.",
  },
  {
    id: 303,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    correct: "B",
    question:
      "Q303. Parameters that need to be monitored to assess outcomes of therapy include:",
    statements: [
      "1. Urine output",
      "2. Blood glucose monitoring",
      "3. Thyroid function tests",
    ],
    explanation:
      "Urine output and blood glucose are essential for monitoring. Thyroid function tests are not indicated in this case.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because response assessment in this case depends on hydration/renal output and glycaemic trend; thyroid tests are unrelated here.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not relevant to the current problem.",
      C: "Omits statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also essential.",
      E: "Only statement 3 is not a required monitoring parameter here.",
    },
    memoryTrick:
      "Track what is changing now: urine output and glucose, not thyroid.",
  },
  {
    id: 275,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    correct: "B",
    question:
      "Q275. Signs which indicate that the diabetes in CA is uncontrolled include:",
    statements: ["1. Infected sores", "2. Reduced skin turgor", "3. Tremor"],
    explanation:
      "Statements 1 and 2 are correct. Uncontrolled diabetes increases infection risk and can present with dehydration signs such as reduced skin turgor.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because infection susceptibility and dehydration signs both support poor glycaemic control in this case; tremor is non-specific.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a specific marker of uncontrolled diabetes here.",
      C: "Misses statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also a key clue.",
      E: "Only statement 3 is not the specific indicator targeted in this question.",
    },
    memoryTrick:
      "Uncontrolled diabetes clues in this case are infection plus dehydration signs.",
  },
  {
    id: 130,
    type: "combo",
    category: "Clinical Pharmacology",
    caseId: "case2",
    correct: "C",
    question:
      "Q130. Pharmacist intervention with regards to therapy started on admission includes:",
    statements: [
      "1. Increase dose of ciprofloxacin",
      "2. Review sodium chloride infusion",
      "3. Rationale for haloperidol treatment",
    ],
    explanation:
      "The IV fluids should be reviewed carefully and the indication for haloperidol assessed. Increasing ciprofloxacin dose is not required.",
    explainCorrect:
      "Option C (2 and 3 only) is correct because pharmacist review should focus on fluid plan and rationale for antipsychotic use; empiric ciprofloxacin dose increase is not indicated.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not justified from the provided information.",
      B: "Includes statement 1 and omits statement 3.",
      D: "Only statement 1 is not the appropriate intervention in this scenario.",
      E: "Only statement 3 misses statement 2, which also needs review.",
    },
    memoryTrick:
      "Pharmacist check here is appropriateness and safety review, not automatic antibiotic escalation.",
  },
  {
    id: 299,
    type: "single",
    category: "Endocrinology",
    caseId: "case2",
    question: "Q299. As regards glibenclamide therapy:",
    options: [
      "Gliclazide is preferred in this patient",
      "The dose could be increased to 10 mg daily",
      "The drug is administered in the afternoon",
      "The drug reduces insulin secretion",
      "It restores beta-cell activity",
    ],
    correct: "Gliclazide is preferred in this patient",
    explanation:
      "In elderly patients, gliclazide is generally preferred due to lower risk of prolonged hypoglycaemia compared to glibenclamide.",
    explainCorrect:
      "In older adults, glibenclamide carries higher risk of prolonged hypoglycaemia, so gliclazide is commonly preferred for safer sulfonylurea use.",
    wrongOptionExplanations: {
      "The dose could be increased to 10 mg daily":
        "Dose escalation may be possible in some contexts, but this stem asks the best overall therapeutic judgment for this patient profile.",
      "The drug is administered in the afternoon":
        "Sulfonylurea timing is typically coordinated with meals, not specifically an afternoon-only rule.",
      "The drug reduces insulin secretion":
        "Glibenclamide increases pancreatic insulin release; it does not reduce it.",
      "It restores beta-cell activity":
        "Sulfonylureas stimulate remaining beta-cell function but do not restore damaged beta-cell capacity.",
    },
    memoryTrick:
      "Elderly plus sulfonylurea: choose lower prolonged hypo risk, usually gliclazide over glibenclamide.",
  },
  {
    id: 65,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    correct: "B",
    question: "Q65. When the patient is discharged, advice includes:",
    statements: [
      "1. Consuming small, frequent regular meals",
      "2. Taking glibenclamide regularly",
      "3. Using fusidic acid cream daily",
    ],
    explanation:
      "Regular meals and adherence to glibenclamide are essential. Topical antibiotics should be reviewed before continued use.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because structured meals and adherence to antidiabetic therapy are core discharge advice; routine daily fusidic acid use is not automatic without review.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not universal discharge advice in this scenario.",
      C: "Omits statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also essential.",
      E: "Only statement 3 is not the key discharge instruction here.",
    },
    memoryTrick:
      "Discharge in this case: regular meals plus regular glucose medicine.",
  },
  {
    id: 224,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    correct: "E",
    question: "Q224. Onset of hypoglycaemia in CA could be precipitated by:",
    statements: [
      "1. Missed doses of glibenclamide",
      "2. Excess dietary intake",
      "3. Skipped meals",
    ],
    explanation:
      "Hypoglycaemia with sulfonylureas is commonly precipitated by skipped meals.",
    explainCorrect:
      "Option E (3 only) is correct because sulfonylurea-related hypoglycaemia is often triggered by missed food intake, not by missed drug doses or excess dietary intake.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, which do not precipitate hypoglycaemia in this question framing.",
      B: "Includes statement 2, but excess dietary intake does not trigger sulfonylurea hypoglycaemia.",
      C: "Omits statement 3 and includes statement 2, so it is incorrect.",
      D: "Only statement 1 is not the precipitating factor here.",
    },
    memoryTrick:
      "Sulfonylurea + no meal = low sugar risk. In this item, skipped meals is the key trigger.",
  },
  {
    id: 287,
    type: "combo",
    category: "Clinical Pharmacology",
    caseId: "case3",
    caseBlock:
      "BD is a 34-year-old patient admitted with an overdose of promethazine and alcohol withdrawal symptoms. The patient has a history of alcohol abuse.",
    correct: "A",
    question:
      "Q287. Symptoms that could occur due to promethazine overdose include:",
    statements: ["1. Drowsiness", "2. Headache", "3. Blurred vision"],
    explanation:
      "Promethazine overdose commonly causes CNS depression (drowsiness), anticholinergic effects such as blurred vision, and headache.",
    explainCorrect:
      "Option A is correct because all three listed symptoms are compatible with promethazine overdose effects.",
    wrongOptionExplanations: {
      B: "Excludes statement 3, yet blurred vision is a recognised anticholinergic effect.",
      C: "Excludes statement 1, but drowsiness is a common overdose sign.",
      D: "Only statement 1 is incomplete because statements 2 and 3 may also occur.",
      E: "Only statement 3 omits other typical overdose symptoms in statements 1 and 2.",
    },
    memoryTrick:
      "Promethazine overdose can make patients sleepy, blurry, and headachy: all three.",
  },
  {
    id: 57,
    type: "single",
    category: "Clinical Pharmacology",
    caseId: "case3",
    question: "Q57. Promethazine is an:",
    options: [
      "Antidepressant",
      "Antipsychotic",
      "Antihistamine",
      "Analgesic",
      "Anxiolytic",
    ],
    correct: "Antihistamine",
    explanation:
      "Promethazine is a first-generation H1 antihistamine with sedative and anticholinergic properties.",
    explainCorrect:
      "Promethazine is pharmacologically classified as a first-generation H1 antihistamine, which explains its antiallergy and sedating profile.",
    wrongOptionExplanations: {
      Antidepressant: "Promethazine is not an antidepressant class medication.",
      Antipsychotic:
        "It may share some phenothiazine structural features but is used clinically as an antihistamine, not as a core antipsychotic.",
      Analgesic:
        "It does not provide primary analgesic action like NSAIDs or opioids.",
      Anxiolytic:
        "Sedation can occur, but that does not make promethazine a principal anxiolytic drug class.",
    },
    memoryTrick:
      "Promethazine is remembered by H1 block first, sedation second.",
  },
  {
    id: 167,
    type: "single",
    category: "Psychiatry",
    caseId: "case3",
    question: "Q167. A drug that can be used in alcohol withdrawal is:",
    options: [
      "Beclometasone",
      "Chlorphenamine",
      "Lithium",
      "Diazepam",
      "Risperidone",
    ],
    correct: "Diazepam",
    explanation:
      "Benzodiazepines such as diazepam are first-line treatment for alcohol withdrawal to prevent seizures and delirium tremens.",
    explainCorrect:
      "Diazepam is a benzodiazepine and is first-line in alcohol withdrawal because it controls autonomic hyperactivity and lowers withdrawal seizure risk.",
    wrongOptionExplanations: {
      Beclometasone:
        "Beclometasone is a corticosteroid used for inflammation control, not alcohol withdrawal management.",
      Chlorphenamine:
        "Chlorphenamine is an antihistamine and does not treat withdrawal neuroexcitation.",
      Lithium:
        "Lithium is a mood stabilizer for bipolar disorder, not acute alcohol withdrawal treatment.",
      Risperidone:
        "Antipsychotics are not first-line for alcohol withdrawal and may not protect against withdrawal seizures.",
    },
    memoryTrick:
      "Alcohol withdrawal emergency cue: benzodiazepine first, and diazepam is a classic choice.",
  },
  {
    id: 171,
    type: "combo",
    category: "Cardiology",
    caseId: "case4",
    caseBlock:
      "MB is a 58-year-old woman who presents with a prescription for simvastatin 10 mg daily. Her current medication is atenolol 50 mg daily. MB suffered a myocardial infarction last year.",
    correct: "B",
    question: "Q171. MB is advised:",
    statements: [
      "1. To report any muscle pain or weakness",
      "2. To take simvastatin at night",
      "3. To stop taking atenolol",
    ],
    explanation:
      "Patients on simvastatin should report unexplained muscle pain due to risk of myopathy. Simvastatin is best taken at night. Atenolol should not be stopped abruptly.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because statin counselling includes myopathy vigilance and night dosing for simvastatin; stopping atenolol is unsafe advice.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is incorrect because atenolol should not be stopped abruptly.",
      C: "Omits statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also correct.",
      E: "Only statement 3 is inappropriate advice here.",
    },
    memoryTrick:
      "Simvastatin counselling here: muscle-warning plus night dose; never stop beta-blocker suddenly.",
  },
  {
    id: 209,
    type: "combo",
    category: "Cardiology",
    caseId: "case4",
    correct: "A",
    question: "Q209. Side-effects to be expected with simvastatin include:",
    statements: ["1. Headache", "2. Nausea", "3. Abdominal pain"],
    explanation:
      "Common adverse effects of simvastatin include headache, gastrointestinal disturbances such as nausea, and abdominal pain.",
    explainCorrect:
      "Option A is correct because headache and gastrointestinal discomfort including nausea and abdominal pain are all recognised simvastatin adverse effects.",
    wrongOptionExplanations: {
      B: "Excludes statement 3, though abdominal pain can occur.",
      C: "Excludes statement 1, yet headache is listed among common effects.",
      D: "Only statement 1 is incomplete because statements 2 and 3 may also occur.",
      E: "Only statement 3 omits other expected side effects in statements 1 and 2.",
    },
    memoryTrick:
      "For this item, statin side effects are head plus stomach (all three listed).",
  },
  {
    id: 27,
    type: "combo",
    category: "Cardiology",
    caseId: "case4",
    correct: "B",
    question: "Q27. Recommendations made to MB include:",
    statements: [
      "1. Follow moderate exercise",
      "2. Adopt a low-fat diet",
      "3. Take atenolol 2 hours before simvastatin",
    ],
    explanation:
      "Lifestyle modification including moderate exercise and a low-fat diet is recommended. There is no need to separate atenolol and simvastatin by 2 hours.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because lifestyle optimisation is recommended post-MI; statement 3 is unnecessary.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not required.",
      C: "Omits statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because statement 2 is also recommended.",
      E: "Only statement 3 is not part of standard advice in this case.",
    },
    memoryTrick:
      "Post-MI counselling here is move and diet; no timing separation rule between these two drugs.",
  },
  {
    id: 84,
    type: "combo",
    category: "Haematology",
    caseId: "case5",
    caseBlock:
      "GD is a 72-year-old female whose current medication is: aspirin 75 mg daily; dipyridamole 100 mg three times daily; timolol 0.5% eye drops, two drops in both eyes twice daily; lactulose 20 mL daily.",
    correct: "C",
    question: "Q84. With regard to dipyridamole:",
    statements: [
      "1. It cannot be used in combination with low-dose aspirin",
      "2. It is used for prophylaxis of thromboembolism",
      "3. It may cause increased bleeding during or after surgery",
    ],
    explanation:
      "Dipyridamole is commonly combined with low-dose aspirin for antiplatelet therapy. It is used for thromboembolic prophylaxis and may increase bleeding risk.",
    explainCorrect:
      "Option C (2 and 3 only) is correct because statements 2 and 3 are true, while statement 1 is false since dipyridamole can be combined with low-dose aspirin.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is false in this context.",
      B: "Includes statement 1 and omits statement 3.",
      D: "Only statement 1 is incorrect in this item.",
      E: "Only statement 3 misses statement 2, which is also true.",
    },
    memoryTrick:
      "For dipyridamole here: combo with aspirin is allowed, so keep 2 and 3 only.",
  },
  {
    id: 32,
    type: "combo",
    category: "Gastroenterology",
    caseId: "case5",
    correct: "E",
    question: "Q32. With regard to lactulose:",
    statements: [
      "1. The dose needs to be reviewed as the maximum adult daily dose is 5 mL",
      "2. It should not be used for more than 5 days",
      "3. It is used to maintain bowel evacuation",
    ],
    explanation:
      "Lactulose doses are often much higher than 5 mL daily. It can be used long term if needed. It is used to treat constipation and maintain bowel evacuation.",
    explainCorrect:
      "Option E (3 only) is correct because statement 3 is true, while statements 1 and 2 are false.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, both of which are incorrect in this context.",
      B: "Includes statement 2, which is false because lactulose may be used longer when needed.",
      C: "Omits statement 3 and includes statement 2.",
      D: "Only statement 1 is false for this item.",
    },
    memoryTrick:
      "Lactulose in this question: not tiny-dose-limited, not five-day-limited; it maintains bowel movement.",
  },
  {
    id: 316,
    type: "combo",
    category: "Ophthalmology",
    caseId: "case5",
    correct: "D",
    question: "Q316. GD is receiving medications for:",
    statements: ["1. Glaucoma", "2. Diarrhoea", "3. Osteoporosis"],
    explanation:
      "Timolol eye drops are used for glaucoma. Lactulose is for constipation, not diarrhoea. No medication listed is for osteoporosis.",
    explainCorrect:
      "Option D (1 only) is correct because only glaucoma treatment is clearly represented in the listed medicines.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not supported by the medication list.",
      B: "Includes statement 2 and omits the correct focus on statement 1 only.",
      C: "Omits statement 1 and includes statement 3.",
      E: "Only statement 3 is not supported by the listed therapy.",
    },
    memoryTrick:
      "Map each medicine to condition: timolol eye drops point to glaucoma only.",
  },
  {
    id: 88,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    caseBlock:
      "SP is a 64-year-old patient admitted with tiredness, shortness of breath and ankle oedema. She has a history of congestive heart failure. SP was intolerant to enalapril due to cough. Current medications: spironolactone 12.5 mg daily and losartan 25 mg daily.",
    correct: "B",
    question: "Q88. The therapeutic aims for SP are:",
    statements: [
      "1. To control symptoms of heart failure",
      "2. To control oedema",
      "3. To control diabetes",
    ],
    explanation:
      "Management aims focus on heart failure symptom control and oedema reduction. There is no indication of diabetes.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because this case target is heart failure symptom relief and fluid control; diabetes control is not the stated therapeutic aim.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a treatment aim from this case data.",
      C: "Omits statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because oedema control is also an aim.",
      E: "Only statement 3 is not a supported aim in this scenario.",
    },
    memoryTrick:
      "CHF case goals here are breath and fluid control, not diabetes management.",
  },
  {
    id: 149,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "A",
    question: "Q149. With regard to spironolactone:",
    statements: [
      "1. It reduces symptoms and mortality",
      "2. The dose may be increased to 25 mg daily",
      "3. It is an aldosterone antagonist",
    ],
    explanation:
      "Spironolactone reduces mortality in heart failure, can be titrated to 25 mg daily, and is an aldosterone antagonist.",
    explainCorrect:
      "Option A is correct because all three statements reflect standard spironolactone use in heart failure management.",
    wrongOptionExplanations: {
      B: "Excludes statement 3, but aldosterone antagonism is a core property.",
      C: "Excludes statement 1, though mortality/symptom benefit is key in selected HF patients.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also true.",
      E: "Only statement 3 omits true points in statements 1 and 2.",
    },
    memoryTrick:
      "Spironolactone in HF: blocker of aldosterone, can titrate, and supports outcome benefit.",
  },
  {
    id: 284,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "B",
    question:
      "Q284. Monitoring required because of spironolactone treatment involves:",
    statements: [
      "1. Serum creatinine",
      "2. Serum potassium",
      "3. Thyroid function",
    ],
    explanation:
      "Renal function and potassium must be monitored due to hyperkalaemia risk. Thyroid monitoring is not required.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because spironolactone monitoring requires renal function and potassium checks; thyroid tests are not routine for this purpose.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a routine spironolactone monitoring requirement.",
      C: "Omits statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because potassium is also critical.",
      E: "Only statement 3 is not the relevant monitoring parameter.",
    },
    memoryTrick:
      "Spironolactone monitoring in this item is kidney plus potassium.",
  },
  {
    id: 292,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "A",
    question: "Q292. With regard to losartan:",
    statements: [
      "1. It is an angiotensin-II receptor antagonist",
      "2. It exhibits a lower incidence of cough compared with enalapril",
      "3. The dose may be increased to 50 mg daily",
    ],
    explanation:
      "Losartan is an ARB, has lower cough incidence than ACE inhibitors, and can be titrated to 50 mg daily.",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because losartan is an ARB, typically causes less cough than ACE inhibitors like enalapril, and can be titrated to 50 mg daily in routine practice.",
    wrongOptionExplanations: {
      B: "Misses statement 3 even though dose escalation to 50 mg can be appropriate.",
      C: "Misses statement 1, but losartan being an angiotensin-II receptor antagonist is fundamental.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also valid.",
      E: "Only statement 3 omits the core class identity and cough profile points.",
    },
    memoryTrick:
      "Losartan checklist: ARB class, less ACE-cough, can step up dose.",
  },
  {
    id: 41,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "C",
    question: "Q41. Digoxin is used in patients with heart failure:",
    statements: [
      "1. Because it decreases myocardial intracellular ionic calcium",
      "2. When there is atrial fibrillation",
      "3. Because it exerts a positive inotropic effect",
    ],
    explanation:
      "Digoxin increases intracellular calcium (not decreases), is useful in atrial fibrillation, and has a positive inotropic effect.",
    explainCorrect:
      "Option C (2 and 3 only) is correct because statement 1 is false while statements 2 and 3 reflect valid clinical use and mechanism.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is incorrect because digoxin increases intracellular calcium.",
      B: "Includes statement 1 and omits statement 3.",
      D: "Only statement 1 is incorrect in this context.",
      E: "Only statement 3 misses statement 2, which is also correct.",
    },
    memoryTrick:
      "Digoxin in this item is AF utility plus positive inotropy; calcium goes up, not down.",
  },
  {
    id: 76,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "B",
    question:
      "Q76. Parameters to be monitored when digoxin therapy is started include:",
    statements: [
      "1. Plasma digoxin concentration",
      "2. Plasma potassium measurement",
      "3. Plasma sodium measurement",
    ],
    explanation:
      "Digoxin levels and potassium must be monitored. Sodium monitoring is not routinely required for digoxin initiation.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because therapeutic drug monitoring and potassium are key for digoxin safety; sodium is not the principal routine parameter here.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a key routine parameter for digoxin initiation.",
      C: "Omits statement 1 and includes statement 3.",
      D: "Only statement 1 is incomplete because potassium also needs close monitoring.",
      E: "Only statement 3 is not the keyed monitoring requirement.",
    },
    memoryTrick:
      "Digoxin start-up safety: check drug level and potassium first.",
  },
  {
    id: 302,
    type: "single",
    category: "Infectious Diseases",
    caseId: "case7",
    caseBlock:
      "LB is a 55-year-old male patient who developed unilateral vesicles around his waist and complained of stabbing irritation in the area. LB is prescribed aciclovir 800 mg five times daily for 5 days.",
    question: "Q302. The likely diagnosis for LB is:",
    options: [
      "prickly heat",
      "herpes zoster infection",
      "herpes labialis infection",
      "cytomegalovirus infection",
      "hepatitis B infection",
    ],
    correct: "herpes zoster infection",
    explanation:
      "Painful unilateral vesicles in a dermatomal distribution are characteristic of herpes zoster.",
    explainCorrect:
      "Unilateral painful vesicles in a dermatomal band are classic for shingles (herpes zoster), especially with neuropathic-type pain.",
    wrongOptionExplanations: {
      "prickly heat":
        "Prickly heat causes superficial sweat-duct rash and does not typically present as painful unilateral dermatomal vesicles.",
      "herpes labialis infection":
        "Herpes labialis usually affects lips/perioral area, not a truncal dermatomal distribution.",
      "cytomegalovirus infection":
        "CMV does not classically present with localized painful dermatomal vesicular rash in immunocompetent adults.",
      "hepatitis B infection":
        "Hepatitis B is a systemic liver infection and does not present as this characteristic unilateral vesicular rash.",
    },
    memoryTrick:
      "Dermatomal painful vesicles equals zoster until proven otherwise.",
  },
  {
    id: 126,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case7",
    correct: "B",
    question: "Q126. Patient should be advised:",
    statements: [
      "1. To take doses at regular intervals",
      "2. To avoid exposure to sunlight",
      "3. To wash hands thoroughly after drug administration",
    ],
    explanation:
      "Regular dosing and sunlight avoidance are key counseling points with aciclovir in this context.",
    explainCorrect:
      "Option B (1 and 2 only) is correct in this item because adherence to regular dosing and sunlight-exposure caution are the key counseling points, while statement 3 is not a primary counseling requirement for this regimen.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the keyed counseling point here.",
      C: "Includes statement 3 and misses statement 1 on regular interval dosing.",
      D: "Only statement 1 is incomplete because statement 2 is also part of the advised counseling set.",
      E: "Only statement 3 is not the intended core advice in this question.",
    },
    memoryTrick:
      "Acyclovir counseling in this stem: timing discipline plus sun caution.",
  },
  {
    id: 31,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case7",
    correct: "A",
    question: "Q31. Side-effects that may be expected include:",
    statements: ["1. Headache", "2. Nausea", "3. Diarrhoea"],
    explanation:
      "All listed effects are recognized adverse effects of aciclovir therapy.",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because headache, nausea, and diarrhea are all recognized adverse effects associated with aciclovir use.",
    wrongOptionExplanations: {
      B: "Misses statement 3 even though diarrhea is also a known adverse effect.",
      C: "Misses statement 1, but headache is part of the known adverse-effect profile.",
      D: "Only statement 1 is incomplete because GI effects in statements 2 and 3 can also occur.",
      E: "Only statement 3 underrepresents the broader expected adverse-effect set.",
    },
    memoryTrick:
      "Acyclovir side effects here follow head and gut: headache, nausea, diarrhea.",
  },
  {
    id: 98,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case7",
    correct: "B",
    question: "Q98. Adjuvant therapy that may be used for LB include(s):",
    statements: ["1. Calamine lotion", "2. Amitriptyline", "3. Ergotamine"],
    explanation:
      "Calamine and amitriptyline can be useful adjuncts; ergotamine is not indicated for shingles-related pain.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because calamine can soothe skin discomfort and amitriptyline can help neuropathic pain, whereas ergotamine is a migraine vasoconstrictor and not a shingles adjuvant.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not indicated for zoster-associated pain support.",
      C: "Includes statement 3 and misses statement 1 supportive skin-care role.",
      D: "Only statement 1 is incomplete because amitriptyline may also be used for neuropathic pain control.",
      E: "Only statement 3 is inappropriate for this indication.",
    },
    memoryTrick:
      "Shingles adjuncts here are soothe skin and calm nerve pain, not migraine ergot drugs.",
  },
  {
    id: 195,
    type: "single",
    category: "Infectious Diseases",
    caseId: "case8",
    caseBlock:
      "AD is a 39-year-old female with bacterial endocarditis. She is started on gentamicin 80 mg IV twice daily and penicillin G IV 1.8 g every 6 hours.",
    question: "Q195. Penicillin G is:",
    options: [
      "phenoxymethylpenicillin",
      "benzylpenicillin",
      "penicillin V",
      "piperacillin",
      "pivmecillinam",
    ],
    correct: "benzylpenicillin",
    explanation: "Penicillin G is benzylpenicillin.",
    explainCorrect:
      "Penicillin G is the parenteral form known as benzylpenicillin, especially relevant in severe infections such as endocarditis.",
    wrongOptionExplanations: {
      phenoxymethylpenicillin:
        "Phenoxymethylpenicillin is penicillin V, not penicillin G.",
      "penicillin V":
        "Penicillin V is oral phenoxymethylpenicillin and is distinct from penicillin G.",
      piperacillin:
        "Piperacillin is an extended-spectrum antipseudomonal penicillin, not penicillin G.",
      pivmecillinam:
        "Pivmecillinam is a prodrug of mecillinam used mainly in urinary infections, not penicillin G.",
    },
    memoryTrick:
      "G in penicillin G maps to IV benzylpenicillin in serious infection settings.",
  },
  {
    id: 278,
    type: "single",
    category: "Infectious Diseases",
    caseId: "case8",
    question:
      "Q278. Penicillin G is available in 600 mg vials. How many vials are required for each dose?",
    options: ["0.5", "1", "2", "3", "30"],
    correct: "3",
    explanation: "A 1.8 g dose equals 1800 mg, so 1800/600 = 3 vials per dose.",
    explainCorrect:
      "Each vial contains 600 mg and the prescribed dose is 1800 mg, so 1800 divided by 600 gives 3 vials.",
    wrongOptionExplanations: {
      0.5: "Half a vial would provide only 300 mg, far below the 1.8 g dose.",
      1: "One vial provides 600 mg, which is only one-third of the required dose.",
      2: "Two vials provide 1200 mg, still below the target 1800 mg.",
      30: "Thirty vials would be a massive overdose for a single 1.8 g dose.",
    },
    memoryTrick:
      "Convert grams to mg first, then divide by vial strength: 1800 over 600 equals 3.",
  },
  {
    id: 97,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case8",
    correct: "C",
    question: "Q97. Penicillin G:",
    statements: [
      "1. Is bacteriostatic",
      "2. Is bactericidal",
      "3. Can be given as an intramuscular injection",
    ],
    explanation:
      "Penicillin G is bactericidal and is administered parenterally, including intramuscular routes.",
    explainCorrect:
      "Option C (2 and 3 only) is correct because penicillin G is bactericidal and can be administered parenterally including IM routes, while statement 1 is false.",
    wrongOptionExplanations: {
      A: "Includes statement 1, but penicillin G is not bacteriostatic.",
      B: "Includes statement 1 and misses statement 3.",
      D: "Only statement 1 is false in this item.",
      E: "Only statement 3 is incomplete because statement 2 is also true.",
    },
    memoryTrick:
      "Penicillin G kills bacteria and goes parenteral; think bactericidal plus IM/IV.",
  },
  {
    id: 104,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case8",
    correct: "D",
    question: "Q104. Gentamicin:",
    statements: [
      "1. Has a broad spectrum of activity",
      "2. Is contraindicated in hepatic impairment",
      "3. Therapy may be changed to oral administration when the patient is stabilised",
    ],
    explanation:
      "Gentamicin has broad antibacterial activity, but it is not switched to oral therapy for systemic treatment.",
    explainCorrect:
      "Option D (1 only) is correct because gentamicin has broad antibacterial activity, but key toxicity concern is renal and ototoxic risk rather than hepatic contraindication, and oral step-down is not used for systemic gentamicin efficacy.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not correct for gentamicin.",
      B: "Includes statement 2, but hepatic impairment is not the core contraindication issue.",
      C: "Includes statements 2 and 3 and misses the single true statement pattern.",
      E: "Statement 3 alone is false because oral gentamicin does not replace systemic therapy.",
    },
    memoryTrick:
      "Gentamicin is broad, but think kidneys and ears, and no oral step-down for systemic use.",
  },
  {
    id: 25,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case8",
    correct: "A",
    question: "Q25. A possible reason for these symptoms is:",
    statements: [
      "1. Allergy to gentamicin",
      "2. Allergy to penicillin G",
      "3. Development of heat rash",
    ],
    explanation:
      "All listed possibilities can explain rash and generalized itch in this setting.",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because drug allergy to either antibiotic and non-drug skin rash differentials can all plausibly explain rash plus generalized itching.",
    wrongOptionExplanations: {
      B: "Misses statement 3, which remains a possible non-drug differential in this stem.",
      C: "Misses statement 1 while including only 2 and 3.",
      D: "Only statement 1 is too narrow for this broad differential question.",
      E: "Only statement 3 underestimates possible antibiotic hypersensitivity causes.",
    },
    memoryTrick:
      "Itchy rash on antibiotics: think broad first, both drugs and non-drug skin causes.",
  },
  {
    id: 266,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case8",
    correct: "A",
    question: "Q266. Manifestations of bacterial endocarditis include:",
    statements: [
      "1. Prolonged fever",
      "2. Embolic phenomena",
      "3. Renal failure",
    ],
    explanation:
      "All three can occur as manifestations or complications of bacterial endocarditis.",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because persistent fever, embolic events, and renal complications are all recognized features or complications of infective endocarditis.",
    wrongOptionExplanations: {
      B: "Misses statement 3 even though renal complications can occur in endocarditis.",
      C: "Misses statement 1, but prolonged fever is a hallmark clue.",
      D: "Only statement 1 is incomplete because embolic and renal complications are also relevant.",
      E: "Only statement 3 is too narrow and misses classic systemic presentation.",
    },
    memoryTrick:
      "Endocarditis is prolonged fever plus embolic spread plus organ complications.",
  },
  {
    id: 207,
    type: "single",
    category: "Rheumatology",
    caseId: "case9",
    caseBlock:
      "JZ is a 78-year-old obese male diagnosed with an acute attack of gout. PMH: hypertension and heart failure. Current medicines include enalapril 5 mg daily, atenolol 100 mg daily, bendroflumethiazide 5 mg daily, and aspirin EC 75 mg daily. He is started on colchicine 500 micrograms twice daily for six days.",
    question: "Q207. Gout:",
    options: [
      "may be due to excessive production of uric acid",
      "may be due to increased renal elimination of uric acid",
      "results in deposition of crystals of xanthine in the joints",
      "is characterised by excessive calcium deposited in the joints",
      "is the result of hypouricaemia",
    ],
    correct: "may be due to excessive production of uric acid",
    explanation:
      "Gout is linked to hyperuricaemia from urate overproduction or underexcretion.",
    explainCorrect:
      "Gout is driven by hyperuricaemia, and one cause is excessive uric acid production, making this option correct.",
    wrongOptionExplanations: {
      "may be due to increased renal elimination of uric acid":
        "Increased uric acid elimination would lower urate burden; gout more often relates to underexcretion.",
      "results in deposition of crystals of xanthine in the joints":
        "Gout involves monosodium urate crystal deposition, not xanthine crystals.",
      "is characterised by excessive calcium deposited in the joints":
        "Calcium crystal arthropathies are different disorders, such as pseudogout, not classic gout.",
      "is the result of hypouricaemia":
        "Gout is associated with high uric acid, not low uric acid.",
    },
    memoryTrick:
      "Gout equals urate up and urate crystals in joints, not low urate or calcium crystals.",
  },
  {
    id: 254,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "A",
    question: "Q254. Gout may be precipitated in JZ by:",
    statements: [
      "1. Heart failure",
      "2. Bendroflumethiazide",
      "3. Excessive consumption of meat in the diet",
    ],
    explanation:
      "All three factors can increase urate burden or trigger gout attacks.",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because heart failure states, thiazide diuretic use, and high purine intake can all raise urate burden or precipitate attacks.",
    wrongOptionExplanations: {
      B: "Misses statement 3, but diet high in meat can precipitate gout flares.",
      C: "Misses statement 1 while including only 2 and 3.",
      D: "Only statement 1 is incomplete because diuretic and diet factors are also triggers.",
      E: "Only statement 3 is too limited for this multi-factor precipitant profile.",
    },
    memoryTrick:
      "Gout triggers often come as a triad: fluid-heart state, diuretics, and purine-rich diet.",
  },
  {
    id: 70,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "D",
    question: "Q70. Gout:",
    statements: [
      "1. Presents as a painful condition in the big toe",
      "2. Onset is insidious",
      "3. Recurrence is rare",
    ],
    explanation:
      "Typical acute gout is painful in the big toe, with sudden onset and potential recurrence.",
    explainCorrect:
      "Option D (1 only) is correct because acute gout classically presents with painful first metatarsophalangeal involvement, while onset is usually abrupt and recurrences are common.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, both contrary to typical gout pattern.",
      B: "Includes statement 2, but acute gout is usually sudden rather than insidious.",
      C: "Includes statements 2 and 3 and misses the single true statement structure.",
      E: "Only statement 3 is false because gout often recurs.",
    },
    memoryTrick: "Think podagra with sudden attacks and repeat flares.",
  },
  {
    id: 320,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "D",
    question: "Q320. Diagnosis of gout:",
    statements: [
      "1. Is based on clinical signs",
      "2. Requires confirmation of urate crystals in synovial fluid of affected joint",
      "3. Requires a positive ESR level",
    ],
    explanation:
      "Clinical features are characteristic, crystal confirmation supports diagnosis, and ESR is non-specific.",
    explainCorrect:
      "Option D (1 only) is correct because diagnosis is often made clinically; crystal identification is confirmatory but not always mandatory in every presentation, and ESR is non-specific.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3 as required criteria, which overstates diagnostic requirements.",
      B: "Includes statement 2 as mandatory and statement 3, but ESR is not diagnostic.",
      C: "Includes statements 2 and 3 and misses the core clinical-basis point.",
      E: "Only statement 3 is false because ESR positivity is not required for gout diagnosis.",
    },
    memoryTrick:
      "Gout diagnosis starts clinically; tests support but ESR does not define it.",
  },
  {
    id: 103,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "B",
    question: "Q103. Non-pharmacological measures for JZ include:",
    statements: [
      "1. Resting the affected joint",
      "2. Maintaining a high fluid intake",
      "3. Maintaining a high calcium intake",
    ],
    explanation:
      "Rest and hydration are advised; high calcium intake is not a core gout measure.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because acute gout support includes joint rest and good hydration, while high calcium intake is not a targeted non-pharmacological gout intervention.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a standard gout self-care target.",
      C: "Includes statement 3 and misses statement 1 on resting the inflamed joint.",
      D: "Only statement 1 is incomplete because hydration is also important.",
      E: "Only statement 3 is not an appropriate core non-drug measure for gout.",
    },
    memoryTrick: "Gout self-care basics: rest the joint and push fluids.",
  },
  {
    id: 261,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because colchicine reduces inflammatory response to urate crystals and is used for acute gout relief, but it is not a standard treatment for rheumatoid arthritis.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a routine indication for colchicine in this context.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because statement 2 is also true.",
      E: "Only statement 3 is not correct for this item.",
    },
    memoryTrick:
      "Colchicine in this set is for gout crystal inflammation, not rheumatoid arthritis.",
    question: "Q261. Colchicine:",
    statements: [
      "1. Reduces the inflammatory reaction to urate crystals",
      "2. Provides dramatic relief from acute attacks of gout",
      "3. Is also used in rheumatoid arthritis",
    ],
    explanation:
      "Colchicine is effective in gout inflammation but is not a standard rheumatoid arthritis treatment.",
  },
  {
    id: 120,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because colchicine is an option when NSAIDs are unsuitable, has notable toxicity risk, and GI effects like diarrhea/vomiting signal need to review dosing.",
    wrongOptionExplanations: {
      B: "Misses statement 3 even though GI toxicity is an important monitoring clue.",
      C: "Misses statement 1 while including only 2 and 3.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also true.",
      E: "Only statement 3 is too narrow for the counseling set.",
    },
    memoryTrick:
      "Colchicine safety cue: if gut symptoms appear, reassess therapy quickly.",
    question: "Q120. Colchicine:",
    statements: [
      "1. Should be used when there is a contraindication to NSAIDs",
      "2. Is more toxic than NSAIDs",
      "3. Occurrence of diarrhoea and vomiting are used as an index to review therapy",
    ],
    explanation:
      "All statements are true; GI toxicity is a key signal for dose review.",
  },
  {
    id: 298,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because indometacin and diclofenac are NSAID options in acute gout, while aspirin is avoided due to urate-handling effects.",
    wrongOptionExplanations: {
      A: "Includes statement 3, but aspirin is not preferred in acute gout treatment.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because diclofenac is also an option.",
      E: "Only statement 3 is not appropriate for this indication.",
    },
    memoryTrick:
      "Acute gout NSAID choices can include indometacin and diclofenac, not aspirin.",
    question:
      "Q298. Alternatives to colchicine in the management of gout include:",
    statements: ["1. Indometacin", "2. Diclofenac", "3. Aspirin"],
    explanation:
      "Indometacin and diclofenac are options in acute gout; aspirin can worsen urate handling.",
  },
  {
    id: 295,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because weight loss and low-purine diet reduce recurrence risk, while indefinite colchicine for everyone is not standard long-term prevention.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a universal long-term requirement.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because dietary purine reduction is also key.",
      E: "Only statement 3 is not the core preventive recommendation here.",
    },
    memoryTrick:
      "Prevent gout flares with weight and purine control; avoid assuming lifelong colchicine.",
    question: "Q295. To prevent further attacks, JZ should be advised to:",
    statements: [
      "1. Lose weight",
      "2. Follow a diet low in purines",
      "3. Keep taking colchicine on a long-term basis",
    ],
    explanation:
      "Weight reduction and low-purine diet reduce recurrence risk; long-term colchicine is not routine for all patients.",
  },
  {
    id: 306,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because allopurinol is started after acute flare settles, lowers urate production via xanthine oxidase inhibition, and is commonly dosed once daily.",
    wrongOptionExplanations: {
      B: "Misses statement 3 even though once-daily dosing is standard.",
      C: "Misses statement 1 while including only 2 and 3.",
      D: "Only statement 1 is incomplete because mechanism and dosing statements are also true.",
      E: "Only statement 3 is too limited for full allopurinol counseling.",
    },
    memoryTrick:
      "Allopurinol is a long-game urate reducer: post-flare start, once-daily control.",
    question: "Q306. Allopurinol:",
    statements: [
      "1. Should be started 2-3 weeks after the acute attack has subsided",
      "2. Reduces urate production",
      "3. Is given once daily",
    ],
    explanation:
      "All statements are correct for long-term urate-lowering prophylaxis with allopurinol.",
  },
  {
    id: 113,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because uricosurics can substitute for allopurinol in selected cases, require reasonable renal function, and work by increasing urate excretion.",
    wrongOptionExplanations: {
      B: "Misses statement 3, which is the core mechanism of uricosuric drugs.",
      C: "Misses statement 1 while including only 2 and 3.",
      D: "Only statement 1 is incomplete because renal limitation and mechanism are also true.",
      E: "Only statement 3 is insufficient without clinical-use context.",
    },
    memoryTrick:
      "Uricosuric means push urate out in urine, so kidney function must be adequate.",
    question: "Q113. Uricosuric agents:",
    statements: [
      "1. Can be used instead of allopurinol",
      "2. Are ineffective in patients with impaired renal function",
      "3. Increase renal urate excretion",
    ],
    explanation:
      "All three are correct for uricosuric therapy use and mechanism.",
  },
  {
    id: 218,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    caseBlock:
      "HG is a 71-year-old female with Sjogren's syndrome presenting with dry eyes and dry mouth. Her medicines include aspirin, dipyridamole, glimepiride, and atenolol. She was recently diagnosed with hypothyroidism and started on thyroxine 50 micrograms daily; metformin 500 mg daily and simvastatin 10 mg nocte were added at follow-up.",
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because thyroxine is taken in the morning, metformin is better tolerated with food, and dipyridamole advice in this set includes before-food administration.",
    wrongOptionExplanations: {
      B: "Misses statement 3 from the counseling set in this question.",
      C: "Misses statement 1 while including only 2 and 3.",
      D: "Only statement 1 is incomplete because metformin and dipyridamole counseling points are also included.",
      E: "Only statement 3 alone does not cover the new therapy counseling bundle.",
    },
    memoryTrick:
      "New regimen counseling here: morning thyroxine, meal-time metformin, and dipyridamole timing advice.",
    question:
      "Q218. In view of the recent amendments to her treatment, HG should be advised to:",
    statements: [
      "1. Take thyroxine tablet in the morning",
      "2. Take metformin tablet with food",
      "3. Take dipyridamole tablets before food",
    ],
    explanation:
      "All counseling points are appropriate for thyroxine, metformin, and dipyridamole use.",
  },
  {
    id: 166,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because hypothyroidism can present insidiously in older adults, while dry eyes in this stem are better explained by Sjogren's syndrome and hypothyroidism is not a usual cause of hypoglycaemia.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not correct in this context.",
      B: "Includes statement 2, but dry eyes are linked to Sjogren's in this case.",
      C: "Includes statements 2 and 3 and misses the single true statement pattern.",
      E: "Only statement 3 is incorrect because hypothyroidism is not classically a hypoglycaemia driver.",
    },
    memoryTrick:
      "In elderly hypothyroidism think slow, subtle onset; separate Sjogren dry-eye features.",
    question: "Q166. Hypothyroidism:",
    statements: [
      "1. May have an insidious onset in the elderly",
      "2. May cause dry eyes",
      "3. May induce hypoglycaemia",
    ],
    explanation:
      "Only statement 1 is correct in this context; dry eyes here are linked to Sjogren's syndrome.",
  },
  {
    id: 311,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because warfarin interaction with thyroid hormone status is clinically significant, while simvastatin and ranitidine are not key major interactions in this stem.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not the major thyroxine interaction concerns here.",
      B: "Includes statement 2; simvastatin is not the main significant interaction in this item.",
      C: "Includes statements 2 and 3 and misses the keyed single interaction statement.",
      E: "Only statement 3 is not a principal interaction focus for thyroxine.",
    },
    memoryTrick:
      "Thyroxine interaction red flag here is anticoagulation monitoring with warfarin.",
    question:
      "Q311. Drugs that could significantly interact with thyroxine include:",
    statements: ["1. Warfarin", "2. Simvastatin", "3. Ranitidine"],
    explanation:
      "Warfarin interaction is clinically significant; simvastatin and ranitidine are not key interactions here.",
  },
  {
    id: 246,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because thyroxine initiation needs caution in elderly patients, diabetics, and those with cardiovascular disease due to sensitivity to metabolic and cardiac effects.",
    wrongOptionExplanations: {
      B: "Misses statement 3, but cardiovascular status is a key caution area.",
      C: "Misses statement 1 while including only 2 and 3.",
      D: "Only statement 1 is incomplete because diabetes and cardiovascular comorbidity also require caution.",
      E: "Only statement 3 is too narrow for safe initiation planning.",
    },
    memoryTrick:
      "Start thyroxine low and slow when age, glucose control, or heart disease are present.",
    question: "Q246. Caution should be undertaken when starting thyroxine in:",
    statements: [
      "1. Elderly patients",
      "2. Diabetics",
      "3. Patients with cardiovascular disorders",
    ],
    explanation:
      "All listed groups require cautious initiation and monitoring with thyroxine.",
  },
  {
    id: 13,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because excess thyroxine effect can cause GI upset and provoke anginal symptoms in susceptible patients, while bradycardia is not a typical thyroxine excess feature.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the expected direction of heart-rate effect.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because statement 2 is also a recognized adverse effect concern.",
      E: "Only statement 3 is incorrect for typical thyroxine adverse-effect profile.",
    },
    memoryTrick:
      "Too much thyroxine tends to speed systems up, not slow pulse down.",
    question: "Q13. Side-effects associated with thyroxine include:",
    statements: ["1. Diarrhoea", "2. Anginal pain", "3. Bradycardia"],
    explanation:
      "Diarrhoea and anginal symptoms can occur with overtreatment; bradycardia is not typical.",
  },
  {
    id: 304,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because total thyroid hormone concentration varies with binding proteins such as TBG, while diagnosis relies more on TSH/free hormones and thyroid hormones are not antibodies.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, both incorrect in this context.",
      B: "Includes statement 2, but total hormones are not the primary diagnostic marker.",
      C: "Includes statements 2 and 3 and misses the single true statement structure.",
      E: "Statement 3 is false because hormones are not antibodies.",
    },
    memoryTrick:
      "Total thyroid levels track binding proteins; diagnosis leans on TSH and free hormones.",
    question: "Q304. Total thyroid hormones:",
    statements: [
      "1. Concentration in plasma changes with alterations in amount of thyroxine-binding globulin in plasma",
      "2. Concentration is used as the main diagnostic marker for hypothyroidism",
      "3. Act as antibodies to thyroglobulin",
    ],
    explanation:
      "Only statement 1 is correct; diagnosis relies mainly on free thyroid hormones and TSH, and thyroid hormones are not antibodies.",
  },
  {
    id: 272,
    type: "match",
    category: "Clinical Documentation",
    question:
      "Q272. Which abbreviation describes conditions that the patient has experienced previously?",
    options: ["PMH", "O/E", "SH", "PC", "FH"],
    correct: "PMH",
    explainCorrect:
      "PMH means past medical history, which records illnesses or conditions experienced previously by the patient.",
    wrongOptionExplanations: {
      "O/E": "O/E means on examination findings, not prior disease history.",
      SH: "SH means social history and covers lifestyle/background factors.",
      PC: "PC means presenting complaint, referring to the current symptom reason for visit.",
      FH: "FH means family history, not the patient's own past conditions.",
    },
    memoryTrick: "P in PMH means Past, so PMH stores previous conditions.",
    explanation:
      "PMH means past medical history, which records conditions experienced previously by the patient.",
  },
  {
    id: 203,
    type: "match",
    category: "Clinical Documentation",
    question:
      "Q203. Which abbreviation refers to symptoms presented by the patient?",
    options: ["PMH", "O/E", "SH", "PC", "FH"],
    correct: "PC",
    explainCorrect:
      "PC means presenting complaint, the symptoms the patient reports as the reason for seeking care.",
    wrongOptionExplanations: {
      PMH: "PMH captures previous medical conditions, not current presenting symptoms.",
      "O/E":
        "O/E documents clinician-observed examination findings rather than reported complaints.",
      SH: "SH records social and lifestyle details, not the chief symptom statement.",
      FH: "FH covers family medical background, not the patient's presenting symptoms.",
    },
    memoryTrick:
      "Presenting Complaint starts with P and C, so PC is the current symptom story.",
    explanation:
      "PC means presenting complaint, which captures the symptoms reported by the patient.",
  },
  {
    id: 260,
    type: "match",
    category: "Clinical Documentation",
    question:
      "Q260. Which abbreviation refers to findings on examination of the patient?",
    options: ["PMH", "O/E", "SH", "PC", "FH"],
    correct: "O/E",
    explainCorrect:
      "O/E means on examination, used for objective findings discovered during physical examination.",
    wrongOptionExplanations: {
      PMH: "PMH records prior illnesses, not current exam findings.",
      SH: "SH captures social context, not physical examination observations.",
      PC: "PC is the patient's presenting symptom, not clinician findings.",
      FH: "FH reflects family disease background, not examination data.",
    },
    memoryTrick: "O/E is clinician-observed data: On Examination.",
    explanation:
      "O/E means on examination, documenting clinical findings observed by the healthcare professional.",
  },
  {
    id: 152,
    type: "match",
    category: "Laboratory Medicine",
    question:
      "Q152. Which laboratory test is carried out as part of kidney function monitoring?",
    options: ["HbA1c", "BUN", "TSH", "LFT", "MCV"],
    correct: "BUN",
    explainCorrect:
      "BUN (blood urea nitrogen) is a standard renal monitoring parameter and is used alongside other kidney-function markers.",
    wrongOptionExplanations: {
      HbA1c:
        "HbA1c monitors long-term glycaemic control, not direct kidney function.",
      TSH: "TSH evaluates thyroid function rather than renal function.",
      LFT: "LFT targets liver assessment, not primary kidney monitoring.",
      MCV: "MCV is a red-cell index and not a renal function test.",
    },
    memoryTrick: "Kidney monitoring clue: think urea and nitrogen, so BUN.",
    explanation: "BUN is used as part of renal function monitoring.",
  },
  {
    id: 234,
    type: "match",
    category: "Laboratory Medicine",
    question:
      "Q234. Which laboratory test is carried out in thyroid function monitoring?",
    options: ["HbA1c", "BUN", "TSH", "LFT", "MCV"],
    correct: "TSH",
    explainCorrect:
      "TSH is central in thyroid function testing and is routinely used to assess hypo- or hyperthyroid states.",
    wrongOptionExplanations: {
      HbA1c: "HbA1c assesses glucose control, not thyroid status.",
      BUN: "BUN relates to renal function rather than thyroid function.",
      LFT: "LFT evaluates liver enzymes and function, not thyroid axis control.",
      MCV: "MCV is a hematology parameter, not a thyroid function marker.",
    },
    memoryTrick: "Thyroid screening starts with pituitary signal: TSH.",
    explanation:
      "TSH is a core laboratory test in thyroid function monitoring.",
  },
  {
    id: 280,
    type: "match",
    category: "Laboratory Medicine",
    question:
      "Q280. Which laboratory test is used to monitor diabetic patients?",
    options: ["HbA1c", "BUN", "TSH", "LFT", "MCV"],
    correct: "HbA1c",
    explanation:
      "HbA1c is used to monitor long-term glycaemic control in diabetes.",
    explainCorrect:
      "HbA1c is correct because it reflects average glycaemia over weeks to months and is the standard long-term diabetes monitoring test.",
    wrongOptionExplanations: {
      BUN: "BUN primarily reflects renal function and protein metabolism, not long-term glucose control.",
      TSH: "TSH assesses thyroid function, not diabetes control.",
      LFT: "LFTs assess hepatic status and are not the primary glycaemic monitoring marker.",
      MCV: "MCV is a red-cell index and does not track glycaemic control.",
    },
    memoryTrick:
      "A1c equals average sugar memory, so diabetes follow-up points to HbA1c.",
  },
  {
    id: 12,
    type: "combo",
    category: "Haematology",
    question: "Q12. INR:",
    statements: [
      "1. is monitored in patients with arthritis",
      "2. is monitored in patients receiving warfarin",
      "3. stands for international normalised ratio",
    ],
    correct: "C",
    explainCorrect:
      "Option C (2 and 3 only) is correct because INR is the international normalised ratio used to monitor warfarin anticoagulation, and it is not specifically monitored for arthritis itself.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not the indication for INR monitoring in this context.",
      B: "Includes statement 1 and misses statement 3.",
      D: "Only statement 1 is incorrect in this item.",
      E: "Only statement 3 is incomplete because warfarin monitoring in statement 2 is also correct.",
    },
    memoryTrick: "INR belongs to warfarin monitoring, not arthritis tracking.",
    explanation:
      "INR stands for international normalised ratio. It is a ratio value comparing a patient’s prothrombin time against the prothrombin time of normal control patients.",
  },
  {
    id: 204,
    type: "combo",
    category: "Respiratory",
    question: "Q204. Lung function tests:",
    statements: [
      "1. always involve administration of bronchodilators before the procedure",
      "2. are used to determine severity of respiratory disease",
      "3. are used to monitor outcomes of therapy",
    ],
    correct: "C",
    explainCorrect:
      "Option C (2 and 3 only) is correct because lung function tests assess severity and monitor treatment response, while bronchodilator administration is not always required before every test.",
    wrongOptionExplanations: {
      A: "Includes statement 1, but bronchodilator pre-administration is not universal.",
      B: "Includes statement 1 and misses statement 3.",
      D: "Only statement 1 is false in this question.",
      E: "Only statement 3 is incomplete because severity assessment in statement 2 is also true.",
    },
    memoryTrick:
      "Spirometry is for severity and follow-up; bronchodilator steps depend on protocol.",
    explanation:
      "Lung function tests involve the use of a spirometer to measure lung volumes and air ﬂow rates. Measurements include forced expiratory volume, vital capacity, forced vital capacity and residual volume.",
  },
  {
    id: 111,
    type: "combo",
    category: "Cardiology",
    question: "Q111. In heart failure:",
    statements: [
      "1. chest radiographs may show cardiac enlargement",
      "2. the pulse rate may indicate arrhythmias",
      "3. body extremities are very hot",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because cardiomegaly can be seen on chest imaging and pulse abnormalities may suggest arrhythmias, whereas heart failure often causes cool rather than very hot extremities in low-output states.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not typical in heart-failure perfusion patterns.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because pulse rhythm assessment in statement 2 is also important.",
      E: "Only statement 3 is not a characteristic heart-failure sign.",
    },
    memoryTrick:
      "Heart failure clues here are enlarged heart and rhythm issues, not hot extremities.",
    explanation:
      "Heart failure results in a reduced cardiac output leading to impaired oxygenation and a compromised blood supply to muscles.",
  },
  {
    id: 199,
    type: "combo",
    category: "Gastroenterology",
    question: "Q199. Colonoscopy:",
    statements: [
      "1. is an artificial opening between the colon and skin",
      "2. should not be performed in periods of less than five years",
      "3. requires the patient to perform bowel cleansing",
    ],
    correct: "E",
    explainCorrect:
      "Option E (3 only) is correct because colonoscopy requires bowel preparation for clear visualization, while statement 1 describes colostomy and statement 2 is not a universal fixed rule.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, both incorrect for defining colonoscopy.",
      B: "Statements 1 and 2 are not correct in this item.",
      C: "Includes statement 2, which is not an absolute interval requirement.",
      D: "Statement 1 is incorrect because it defines a stoma, not an endoscopic procedure.",
    },
    memoryTrick:
      "Colonoscopy is a scope plus bowel prep; colostomy is the skin opening.",
    explanation:
      "Colonoscopy is a diagnostic procedure that is used in the assessment of gastrointestinal disorders of the colon.",
  },
  {
    id: 264,
    type: "combo",
    category: "Neurology",
    question: "Q264. EEG:",
    statements: [
      "1. is carried out to confirm the occurrence of cardiovascular disease",
      "2. procedures require patients to be totally sedated",
      "3. stands for electroencephalography",
    ],
    correct: "E",
    explainCorrect:
      "Option E (3 only) is correct because EEG means electroencephalography; it is a brain electrical activity test, not a cardiovascular confirmation test, and it does not require total sedation routinely.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, both incorrect for EEG.",
      B: "Statements 1 and 2 are not true in standard EEG practice.",
      C: "Includes statement 2, which is not a routine requirement.",
      D: "Statement 1 is false because EEG is neurologic, not cardiologic.",
    },
    memoryTrick:
      "EEG is electric brain tracing, not a heart-disease confirmation test.",
    explanation:
      "EEG stands for electroencephalography and it is a test carried out to measure and record electrical impulses in the brain.",
  },
  {
    id: 44,
    type: "combo",
    category: "Cardiology",
    question: "Q44. Chronically elevated arterial pressure may cause:",
    statements: [
      "1. renovascular disease",
      "2. haemorrhagic stroke",
      "3. nasal congestion",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because sustained hypertension damages vessels and can lead to renovascular disease and stroke risk, while nasal congestion is not a classic chronic hypertensive end-organ effect.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a typical chronic arterial-pressure complication.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because haemorrhagic stroke risk is also relevant.",
      E: "Only statement 3 is not the expected chronic consequence.",
    },
    memoryTrick:
      "Long-term pressure harms vessels and organs, not the nasal airway as a key endpoint.",
    explanation:
      "Arterial pressure reﬂects the stress exerted by the circulating blood on the arterial walls. It is directly related to the cardiac output and the systemic vascular resistance.",
  },
  {
    id: 197,
    type: "combo",
    category: "Cardiology",
    question: "Q197. Atherosclerosis:",
    statements: [
      "1. can occur in different organs",
      "2. may result in myocardial infarction",
      "3. causes chest pain",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because atherosclerosis is systemic and can precipitate myocardial infarction; chest pain is a possible symptom in specific ischemic syndromes but not a universal direct rule for all atherosclerosis.",
    wrongOptionExplanations: {
      A: "Includes statement 3 as universally true, which overstates presentation.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because MI consequence in statement 2 is also true.",
      E: "Only statement 3 is not the best stand-alone truth statement.",
    },
    memoryTrick:
      "Atherosclerosis is systemic plaque disease and a major MI driver.",
    explanation:
      "Atherosclerosis is a common arterial disorder characterised by deposits of plaques consisting of cholesterol, lipids and cellular debris on the inner layers of walls of largeand medium-sized arteries.",
  },
  {
    id: 232,
    type: "combo",
    category: "Cardiology",
    question:
      "Q232. Patients with angina pectoris may be advised that factors which precipitate an attack include:",
    statements: ["1. exercise", "2. anxiety", "3. light meals"],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because exercise and emotional stress increase myocardial oxygen demand and can trigger angina, while heavy meals rather than light meals are typical precipitants.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is opposite to the usual meal-related trigger pattern.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because anxiety is also a trigger.",
      E: "Only statement 3 is not a classic precipitating factor.",
    },
    memoryTrick:
      "Angina triggers rise with effort and stress; think heavy, not light, meals.",
    explanation:
      "Angina pectoris is thoracic pain, most often caused by myocardial anoxia. Symptoms of angina pectoris may occur with activities or circumstances that increase cardiac workload such as: exertion following exercise, like climbing stairs; emotion, such as anxiety, which results in an increased heart rate; heavy meals, because of the requirement of increased gastrointestinal perfusion; and exposure to cold temperatures owing to peripheral vasoconstriction, which leads to increased peripheral resistance.",
  },
  {
    id: 101,
    type: "combo",
    category: "Cardiology",
    question:
      "Q101. After a myocardial infarction, a patient should be advised:",
    statements: [
      "1. that normal activity can never be re-achieved",
      "2. to attain normal body weight",
      "3. to undertake moderate exercise",
    ],
    correct: "C",
    explainCorrect:
      "Option C (2 and 3 only) is correct because post-MI counseling emphasizes risk-factor control including healthy weight and graded exercise, while statement 1 is false and unnecessarily pessimistic.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is incorrect because recovery and functional improvement are possible.",
      B: "Includes statement 1 and misses statement 3.",
      D: "Only statement 1 is false in this rehabilitation counseling set.",
      E: "Only statement 3 is incomplete because weight optimization is also advised.",
    },
    memoryTrick:
      "After MI: rebuild with lifestyle recovery, not a 'never normal again' message.",
    explanation:
      "A myocardial infarction occurs because of a coronary vessel occlusion for a duration of about 6 h.",
  },
  {
    id: 201,
    type: "combo",
    category: "Gastroenterology",
    question: "Q201. Common complications of gallstones include:",
    statements: ["1. biliary colic", "2. jaundice", "3. appendicitis"],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because gallstones commonly cause biliary colic and obstructive jaundice patterns, while appendicitis is a separate pathology.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a gallstone complication.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because jaundice is also a recognized complication.",
      E: "Only statement 3 is unrelated to gallstone disease.",
    },
    memoryTrick:
      "Gallstones belong to biliary pain and jaundice territory, not appendix disease.",
    explanation:
      "Gallstones consist of cholesterol and bile pigments that are calciﬁed. Common complications of gallstones include biliary colic, cholestatic jaundice, acute pancreatitis and acute cholecystitis and cholangitis.",
  },
  {
    id: 170,
    type: "combo",
    category: "Rheumatology",
    question: "Q170. Patients with osteoarthritis should be informed that:",
    statements: [
      "1. disease progression is very gradual",
      "2. weight loss is recommended",
      "3. prolonged bed-rest is advisable",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because osteoarthritis progresses gradually and weight reduction helps joint load, while prolonged bed rest worsens function and is not advised.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which conflicts with mobility-focused OA management.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because weight advice is also important.",
      E: "Only statement 3 is not a recommended long-term strategy.",
    },
    memoryTrick:
      "OA care is gradual management with weight and movement, not prolonged bed rest.",
    explanation:
      "In osteoarthritis degenerative changes including subchondral bony sclerosis, loss of articular cartilage and proliferation of bone spurs occur in one or many joints.",
  },
  {
    id: 71,
    type: "combo",
    category: "Oncology",
    question:
      "Q71. Patients receiving cytotoxic chemotherapy should be advised that:",
    statements: [
      "1. nausea and vomiting may occur before treatment",
      "2. hair loss may occur",
      "3. any signs of infection should be reported to a health professional",
    ],
    correct: "C",
    explainCorrect:
      "Option C (2 and 3 only) is correct because cytotoxic therapy can cause alopecia and infection risk requiring urgent reporting, while nausea/vomiting are typically expected during or after treatment cycles rather than before treatment itself.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not the best framing of chemotherapy-related emesis timing.",
      B: "Includes statement 1 and misses infection-reporting advice.",
      D: "Only statement 1 is not the intended correct counseling point.",
      E: "Only statement 3 is incomplete because hair-loss counseling is also relevant.",
    },
    memoryTrick:
      "Chemo counseling anchors: hair changes and infection alerts must be reported early.",
    explanation:
      "A major disadvantage of cytotoxic chemotherapy is that it interferes with cellular activity in cancerous and normal tissues.",
  },
  {
    id: 141,
    type: "combo",
    category: "Neurology",
    question: "Q141. When a patient presents with a fall and a blackout:",
    statements: [
      "1. the incident has to be investigated",
      "2. the patient has epilepsy",
      "3. the incident should raise the alarm only if it occurs in paediatric patients",
    ],
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because blackout with a fall requires evaluation for multiple causes; it does not automatically diagnose epilepsy and is not limited to concern in children.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, both incorrect assumptions.",
      B: "Includes statement 2, but epilepsy cannot be concluded from one event alone.",
      C: "Includes statements 2 and 3 and misses the key safety approach.",
      E: "Statement 3 is false because adult blackouts also require urgent assessment.",
    },
    memoryTrick:
      "Blackout plus fall means investigate broadly first, never jump to one diagnosis.",
    explanation:
      "When there is temporary loss of consciousness leading to a fall, it may indicate a brief cerebral hypoxia, which could be caused by a number of factors including emotional stress, vascular pooling in the legs, diaphoresis or a sudden change in body position.",
  },
  {
    id: 59,
    type: "combo",
    category: "Clinical Pharmacology",
    question: "Q59. Hypokalaemia may be due to:",
    statements: ["1. vomiting", "2. drugs", "3. renal failure"],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because gastrointestinal losses such as vomiting and certain medications can lower potassium, while renal failure more commonly causes potassium retention and hyperkalaemia.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a typical cause of hypokalaemia in this context.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because medication effects are also a recognized cause.",
      E: "Only statement 3 is opposite to the usual potassium trend in renal failure.",
    },
    memoryTrick:
      "Low potassium here comes from losses or drug effects, not failing kidneys.",
    explanation:
      "Hypokalaemia is a decreased serum potassium level. Normally the potassium loss from the body through renal and faecal excretion and from loss in sweat is miminal.",
  },
  {
    id: 186,
    type: "combo",
    category: "Endocrinology",
    question: "Q186. Clinical features of hypoglycaemia include:",
    statements: ["1. sweating", "2. hunger", "3. blurred vision"],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because autonomic and neuroglycopenic hypoglycaemia features include sweating, hunger, and visual disturbance.",
    wrongOptionExplanations: {
      B: "Misses statement 3 even though blurred vision can occur in hypoglycaemia.",
      C: "Misses statement 1, but sweating is a classic warning symptom.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also valid features.",
      E: "Only statement 3 is too narrow for typical hypoglycaemic presentation.",
    },
    memoryTrick: "Hypoglycaemia warning trio: sweat, hunger, vision changes.",
    explanation:
      "Hypoglycaemia is a blood glucose level below 3 mmol/l. It is a condition that develops rapidly and usually occurs in diabetics either because of an excessive antidiabetic dose or owing to changes in lifestyle.",
  },
  {
    id: 100,
    type: "combo",
    category: "Allergy and Immunology",
    question: "Q100. An anaphylactic shock could present with:",
    statements: ["1. rash", "2. bronchoconstriction", "3. hypertension"],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because anaphylaxis commonly presents with rash and airway bronchoconstriction, while hypotension rather than hypertension is expected.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is opposite to the usual hemodynamic pattern.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because bronchoconstriction is also a key feature.",
      E: "Only statement 3 is not consistent with typical anaphylactic shock.",
    },
    memoryTrick:
      "Anaphylaxis is rash plus airway tightening plus low pressure, not high pressure.",
    explanation:
      "An anaphylactic shock occurs because of a hypersensitivity reaction. Presentation includes development of a rash, acute bronchoconstriction, profound hypotension and collapse.",
  },
  {
    id: 279,
    type: "combo",
    category: "Endocrinology",
    question:
      "Q279. Diabetic patients should be advised to monitor their condition because they are prone to develop:",
    statements: [
      "1. retinopathy",
      "2. chronic renal failure",
      "3. ischaemic heart disease",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because diabetes increases risk of microvascular damage (retinopathy, nephropathy) and macrovascular disease including ischemic heart disease.",
    wrongOptionExplanations: {
      B: "Misses statement 3, but cardiovascular disease risk is elevated in diabetes.",
      C: "Misses statement 1, while retinopathy is a key chronic diabetic complication.",
      D: "Only statement 1 is incomplete because renal and cardiovascular complications are also relevant.",
      E: "Only statement 3 is too narrow for full diabetic complication monitoring.",
    },
    memoryTrick:
      "Diabetes long-term watchlist spans eyes, kidneys, and heart vessels.",
    explanation:
      "Diabetes is associated with microvascular complications, the incidence of which may be reduced with optimal blood glucose control.",
  },
  {
    id: 142,
    type: "combo",
    category: "Clinical Pharmacology",
    question: "Q142. Normal saline:",
    statements: [
      "1. is 0.9% sodium chloride",
      "2. may be used in electrolyte imbalance",
      "3. may be applied as nasal drops",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because normal saline is 0.9% sodium chloride, can support fluid/electrolyte management, and saline preparations are also used for nasal irrigation/drop applications.",
    wrongOptionExplanations: {
      B: "Misses statement 3, which can be true for saline use.",
      C: "Misses statement 1, the core definition of normal saline.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also acceptable uses.",
      E: "Only statement 3 is too narrow without the defining concentration and clinical use.",
    },
    memoryTrick:
      "Normal saline is the 0.9% NaCl baseline with broad supportive use.",
    explanation:
      "Normal saline consists of 0. 9% sodium chloride as an isotonic solution.",
  },
  {
    id: 96,
    type: "combo",
    category: "Ophthalmology",
    question:
      "Q96. Disadvantages of the administration of corticosteroids in the eye include:",
    statements: ["1. corneal thinning", "2. glaucoma", "3. cataracts"],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because ocular corticosteroid exposure can thin corneal tissue and increase risks of steroid-induced glaucoma and cataract formation.",
    wrongOptionExplanations: {
      B: "Misses statement 3, but cataract risk is a known steroid-eye adverse effect.",
      C: "Misses statement 1, though corneal/scleral thinning can occur.",
      D: "Only statement 1 is incomplete because glaucoma and cataract risks are also relevant.",
      E: "Only statement 3 is insufficient for the full adverse-effect profile.",
    },
    memoryTrick:
      "Steroid eye risk bundle: thinning, pressure rise, and lens clouding.",
    explanation:
      "Topical administration of corticosteroids in the eye is associated with thinning of the cornea and sclera, steroid glaucoma and steroid cataract.",
  },
  {
    id: 163,
    type: "combo",
    category: "Clinical Pharmacy",
    question: "Q163. In which of the following cases is referral recommended?",
    statements: [
      "1. an asthmatic patient who presents with fever, chesty cough and wheezing",
      "2. a patient receiving antihypertensive medication who presents with nasal congestion",
      "3. a patient presenting with allergic rhinitis",
    ],
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because asthma with fever, productive/chesty cough, and wheeze suggests potentially serious lower respiratory infection needing medical evaluation, while the other presentations are often manageable in non-urgent pathways.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not the strongest urgent-referral indications in this item.",
      B: "Includes statement 2, usually not an automatic urgent referral scenario alone.",
      C: "Includes statements 2 and 3 and misses the key red-flag case.",
      E: "Statement 3 alone is commonly manageable and not the primary referral trigger here.",
    },
    memoryTrick:
      "Asthma plus fever plus chesty symptoms is a referral red flag.",
    explanation:
      "Asthmatic patients who present with fever, chesty cough and wheezing indicate onset of a chest infection where the use of antibacterials may be necessary to counteract bacterial infections or to cover against the development of secondary bacterial infections.",
  },
  {
    id: 155,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    caseBlock:
      "AB is a 74-year-old male admitted to a medical ward. PMH: diabetes mellitus controlled by diet, hypertension, congestive heart failure. DH: bumetanide 1 mg daily, potassium chloride 600 mg bd, isosorbide dinitrate 10 mg tds, atenolol 100 mg bd, aspirin 75 mg daily, lorazepam 1 mg tds, metoclopramide 10 mg prn. PC: increasing shortness of breath, dyspnoea, cyanosis, tachycardia. O/E: BP 160/100 mmHg, pulse 100 bpm. Diagnosis: congestive heart failure. Labs: sodium 130 mmol/l, potassium 3.2 mmol/l, chloride 95 mmol/l, fasting blood glucose 15.6 mmol/l. Discharge treatment: bumetanide 1 mg daily, isosorbide dinitrate 10 mg tds, enalapril 5 mg nocte, aspirin 75 mg daily, lorazepam 1 mg tds, metoclopramide 10 mg prn.",
    question: "Q155. What condition(s) does AB have?",
    statements: [
      "1. asthma",
      "2. diabetes mellitus",
      "3. congestive heart failure",
    ],
    correct: "C",
    explainCorrect:
      "Option C (2 and 3 only) is correct because the case explicitly states diabetes mellitus and congestive heart failure, while asthma is not listed as a confirmed diagnosis.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not established in the case history.",
      B: "Includes statement 1 and misses statement 3.",
      D: "Only statement 1 is incorrect in this diagnosis list.",
      E: "Only statement 3 is incomplete because diabetes is also present.",
    },
    memoryTrick:
      "Case-confirmed diagnoses beat assumptions: diabetes plus CHF are explicit here.",
    explanation:
      "AB has diabetes mellitus and congestive heart failure. In elderly and diabetic patients it is very common to ﬁnd multiple disease states.",
  },
  {
    id: 3,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q3. Signs and symptoms of congestive heart failure include:",
    statements: ["1. oedema", "2. dyspnoea", "3. insomnia"],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because edema and dyspnea are classic congestive heart failure features, whereas insomnia is not a defining diagnostic symptom.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a core CHF sign.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because dyspnoea is also key.",
      E: "Only statement 3 does not represent a typical hallmark CHF feature.",
    },
    memoryTrick: "CHF usually shows fluid overload and breathlessness first.",
    explanation:
      "In congestive heart failure there is generalised oedema and usually the term implies bilateral failure resulting in reduced cardiac contractility.",
  },
  {
    id: 140,
    type: "single",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q140. Bumetanide is a (an):",
    options: [
      "thiazide diuretic",
      "loop diuretic",
      "potassium-sparing diuretic",
      "aldosterone antagonist",
      "osmotic diuretic",
    ],
    correct: "loop diuretic",
    explainCorrect:
      "Bumetanide is correctly classified as a loop diuretic, acting in the thick ascending limb to produce potent diuresis.",
    wrongOptionExplanations: {
      "thiazide diuretic":
        "Thiazides act mainly at the distal tubule and are a different diuretic class.",
      "potassium-sparing diuretic":
        "Potassium-sparing agents have different mechanisms and weaker natriuretic effect than loop diuretics.",
      "aldosterone antagonist":
        "Aldosterone antagonists are a specific potassium-sparing subgroup, not bumetanide.",
      "osmotic diuretic":
        "Osmotic diuretics (e.g., mannitol) are distinct from loop diuretics in mechanism and indications.",
    },
    memoryTrick:
      "Bumetanide belongs to the strong loop-diuretic class for fluid overload.",
    explanation:
      "Bumetanide is a loop diuretic used for fluid overload states such as heart failure.",
  },
  {
    id: 215,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q215. Isosorbide dinitrate:",
    statements: [
      "1. is used for prophylaxis of angina",
      "2. is metabolised to isosorbide mononitrate",
      "3. can only be administered sublingually",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because isosorbide dinitrate is used in angina prophylaxis and is metabolized to isosorbide mononitrate, while it is not limited to sublingual-only administration.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is false because multiple dosage forms/routes exist.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because statement 2 is also true.",
      E: "Only statement 3 is not correct in this context.",
    },
    memoryTrick:
      "Dinitrate works for prevention and converts to mononitrate; not sublingual-only.",
    explanation:
      "Isosorbide dinitrate is a nitrate that is used in the prophylaxis and treatment of angina and in left ventricular failure.",
  },
  {
    id: 9,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q9. Atenolol:",
    statements: [
      "1. is a beta-adrenoceptor blocking drug",
      "2. is contraindicated in uncontrolled heart failure",
      "3. maximum daily dose is 100 mg",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because atenolol is a beta-blocker, is avoided in uncontrolled heart failure, and this item keys a maximum daily dose of 100 mg.",
    wrongOptionExplanations: {
      B: "Misses statement 3 as keyed in this item.",
      C: "Misses statement 1, which is foundational for atenolol class identity.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also true in this question.",
      E: "Only statement 3 is too narrow and misses class and safety context.",
    },
    memoryTrick:
      "Atenolol in this stem: beta-blocker identity plus HF caution and dose limit.",
    explanation:
      "Atenolol is a cardioselective beta-adrenoceptor blocker that is used in hypertension and in angina.",
  },
  {
    id: 317,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case1",
    question: "Q317. Lorazepam:",
    statements: [
      "1. has a sedative effect",
      "2. is used to alleviate anxiety",
      "3. may cause ataxia in AB",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because lorazepam is an anxiolytic benzodiazepine with sedative effects and can cause coordination problems such as ataxia, especially in older adults.",
    wrongOptionExplanations: {
      B: "Misses statement 3, an important adverse-effect counseling point.",
      C: "Misses statement 1, though sedation is a known benzodiazepine effect.",
      D: "Only statement 1 is incomplete because anxiolytic use and ataxia risk also apply.",
      E: "Only statement 3 is too limited without core use/effect understanding.",
    },
    memoryTrick:
      "Lorazepam helps anxiety but can sedate and unsteady gait in elderly patients.",
    explanation:
      "Lorazepam is a short-acting benzodiazepine that has anti-anxiety and hypnotic properties. Use of benzodiazepines in older people is associated with alterations in the pharmacokinetic parameters of the drug that lead to clinical consequences such as drowsiness, confusion and ataxia (a condition characterised by an inability to coordinate movement).",
  },
  {
    id: 178,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q178. AB was started on enalapril because it:",
    statements: [
      "1. has a valuable role in heart failure",
      "2. lowers blood pressure",
      "3. prevents myocardial infarction",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because enalapril is beneficial in heart failure and lowers blood pressure; prevention of myocardial infarction is not the direct primary reason keyed in this initiation rationale.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the keyed direct indication statement here.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because blood-pressure lowering is also true.",
      E: "Only statement 3 is not the best primary reason in this stem.",
    },
    memoryTrick:
      "Enalapril in CHF case logic: heart-failure value plus BP reduction first.",
    explanation:
      "Enalapril is an angiotensin-converting enzyme (ACE) inhibitor, which causes a decreased arterial and venous vasoconstriction and a decreased blood volume.",
  },
  {
    id: 20,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question:
      "Q20. When starting AB on enalapril, the following parameters should be monitored:",
    statements: [
      "1. blood pressure",
      "2. serum potassium levels",
      "3. kidney function",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because ACE inhibitor initiation requires monitoring of blood pressure, potassium, and renal function for safety.",
    wrongOptionExplanations: {
      B: "Misses statement 3, but renal monitoring is essential with ACE inhibitors.",
      C: "Misses statement 1, while blood-pressure response is central.",
      D: "Only statement 1 is incomplete because potassium and kidney monitoring are also required.",
      E: "Only statement 3 is too narrow for complete initiation safety checks.",
    },
    memoryTrick: "ACE-start monitoring trio: pressure, potassium, kidneys.",
    explanation:
      "ACE inhibitors may cause a rapid fall in blood pressure. This may be quite relevant to AB as the patient is already being administered other drugs that have a hypotensive effect.",
  },
  {
    id: 147,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q147. Upon discharge patient is informed that:",
    statements: [
      "1. his medication has been reviewed",
      "2. instead of atenolol he is prescribed enalapril to be taken daily at night",
      "3. he should take metoclopramide only as required",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because all three are accurate discharge counseling points in the presented medication changes.",
    wrongOptionExplanations: {
      B: "Misses statement 3, which is part of the discharge counseling.",
      C: "Misses statement 1, though medication review communication is essential.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also true.",
      E: "Only statement 3 is too narrow without acknowledging the therapy switch.",
    },
    memoryTrick:
      "Discharge counseling must cover review, substitutions, and PRN instructions together.",
    explanation:
      "Upon discharge, the changes carried out in his medications should be discussed with AB. It should be particularly pointed out that atenolol and potassium chloride have been stopped and instead enalapril has to be taken daily at night.",
  },
  {
    id: 18,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q18. Regarding bumetanide, AB should be advised to take:",
    statements: [
      "1. one tablet daily",
      "2. dose in the morning",
      "3. dose on an empty stomach",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because bumetanide is usually taken once daily in the morning to avoid nocturia; empty-stomach dosing is not required.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a mandatory administration rule.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because morning timing is also key.",
      E: "Only statement 3 is not the appropriate counseling emphasis.",
    },
    memoryTrick:
      "Diuretics go early in the day: one dose, morning timing, avoid night diuresis.",
    explanation:
      "Regarding bumetanide, AB should be advised to take one tablet daily in the morning to avoid waking up at night because of the increased diuresis that it causes.",
  },
  {
    id: 53,
    type: "single",
    category: "Cardiology",
    caseId: "t2_case1",
    question:
      "Q53. The patient should be advised to take isosorbide dinitrate tablets at:",
    options: [
      "8 am, 2 pm, 6 pm",
      "8 am, 4 pm, 1 am",
      "8 am, 3 pm, 10 pm",
      "7 am, 3 pm, 2 am",
      "7 am, 3 pm, midnight",
    ],
    correct: "8 am, 2 pm, 6 pm",
    explainCorrect:
      "This daytime schedule is preferred because it spaces doses through waking hours and avoids late-night dosing that can worsen tolerance and sleep disruption.",
    wrongOptionExplanations: {
      "8 am, 4 pm, 1 am":
        "Includes nocturnal dosing, which is generally avoided in this counseling context.",
      "8 am, 3 pm, 10 pm":
        "Late evening dosing is less desirable for patient convenience and nitrate scheduling.",
      "7 am, 3 pm, 2 am":
        "Contains very late night dosing, which is impractical and not preferred.",
      "7 am, 3 pm, midnight":
        "Midnight dosing is not the intended daytime-based regimen.",
    },
    memoryTrick:
      "Nitrate timing in this item stays in daylight blocks, not overnight hours.",
    explanation:
      "A daytime schedule such as 8 am, 2 pm, and 6 pm supports nitrate dosing while avoiding unnecessary nocturnal dosing.",
  },
  {
    id: 318,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q318. Follow-up of AB includes monitoring of:",
    statements: [
      "1. blood pressure",
      "2. blood glucose levels",
      "3. development of oedema",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because AB follow-up should assess hemodynamics, diabetic control, and fluid-overload signs.",
    wrongOptionExplanations: {
      B: "Misses statement 3 despite edema tracking being key in heart-failure follow-up.",
      C: "Misses statement 1, though blood-pressure monitoring is fundamental.",
      D: "Only statement 1 is incomplete because glucose and edema monitoring are also relevant.",
      E: "Only statement 3 is too limited for this multi-condition patient follow-up.",
    },
    memoryTrick: "AB follow-up spans pressure, sugar, and fluid status.",
    explanation:
      "Monitoring the outcome of therapy in AB is based on the measurement of blood pressure, the assessment of development of oedema and dyspnoea, and the measurement of blood glucose levels and HbA1c.",
  },
  {
    id: 243,
    type: "single",
    category: "Infectious Diseases",
    caseId: "t2_case2",
    caseBlock:
      "XY is a 49-year-old patient allergic to penicillin. She was prescribed erythromycin for cellulitis, developed a rash, and erythromycin was withdrawn.",
    question:
      "Q243. Which of the following antibacterial agents is the most appropriate for XY:",
    options: [
      "flucloxacillin",
      "cefuroxime",
      "nalidixic acid",
      "fluconazole",
      "isoniazid",
    ],
    correct: "cefuroxime",
    explainCorrect:
      "Cefuroxime is the best option listed for this cellulitis scenario because it is an antibacterial with suitable skin/soft-tissue coverage among the given choices.",
    wrongOptionExplanations: {
      flucloxacillin:
        "Penicillin allergy history makes this choice less suitable in this case framing.",
      "nalidixic acid":
        "Nalidixic acid is mainly for urinary pathogens, not typical cellulitis treatment.",
      fluconazole:
        "Fluconazole is an antifungal, not an antibacterial choice for cellulitis.",
      isoniazid:
        "Isoniazid is anti-tubercular therapy and not used for routine cellulitis.",
    },
    memoryTrick:
      "For this penicillin-allergic cellulitis case, pick a suitable antibacterial from the options, not UTI, antifungal, or TB drugs.",
    explanation:
      "Cefuroxime is the most appropriate option among those listed for this cellulitis scenario.",
  },
  {
    id: 1,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t2_case2",
    question: "Q1. When XY is started on the new treatment:",
    statements: [
      "1. development of a rash should be monitored",
      "2. signs of anaphylaxis should be detected",
      "3. an allergic reaction could develop after a month after last drug administration",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because rash and anaphylaxis surveillance are key early hypersensitivity monitoring points when starting a new antibacterial, while delayed reactions one month after last dose are not the key immediate counseling focus here.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the primary expected monitoring emphasis in this stem.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because anaphylaxis signs in statement 2 must also be monitored.",
      E: "Only statement 3 is not the key practical monitoring point here.",
    },
    memoryTrick: "New antibiotic start: watch skin and airway reactions first.",
    explanation:
      "Hypersensitivity reactions may occur with any antibacterial agent. They are more commonly recognised with penicillins.",
  },
  {
    id: 6,
    type: "single",
    category: "Psychiatry",
    caseId: "t2_case3",
    caseBlock:
      "PS is a 69-year-old patient with orofacial unwanted movements. Current medication includes diazepam 5 mg nocte and amitriptyline 25 mg tds.",
    question: "Q6. The presenting complaint could be:",
    options: [
      "akathisia",
      "tardive dyskinesia",
      "agranulocytosis",
      "purpura",
      "hypomania",
    ],
    correct: "tardive dyskinesia",
    explainCorrect:
      "Tardive dyskinesia is correct because persistent involuntary orofacial movements are characteristic of this movement disorder.",
    wrongOptionExplanations: {
      akathisia:
        "Akathisia mainly presents as inner restlessness and inability to stay still, not classic orofacial dyskinetic movements.",
      agranulocytosis:
        "Agranulocytosis is a blood dyscrasia and does not present as involuntary mouth/face movements.",
      purpura:
        "Purpura is a skin bleeding manifestation, not a movement disorder.",
      hypomania:
        "Hypomania is a mood-state syndrome and does not explain involuntary orofacial motor movements.",
    },
    memoryTrick:
      "Orofacial involuntary movements point to tardive dyskinesia pattern.",
    explanation:
      "Orofacial involuntary movements are consistent with tardive dyskinesia.",
  },
  {
    id: 268,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case3",
    question:
      "Q268. A review of medication could propose changing amitriptyline to:",
    statements: ["1. imipramine", "2. venlafaxine", "3. reboxetine"],
    correct: "C",
    explainCorrect:
      "Option C (2 and 3 only) is correct because venlafaxine and reboxetine are alternatives here, while imipramine remains a tricyclic agent with a profile less favorable in this movement-disorder context.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not the preferred switch in this scenario.",
      B: "Includes statement 1 and misses statement 3.",
      D: "Only statement 1 is incorrect in this selection set.",
      E: "Only statement 3 is incomplete because statement 2 is also intended.",
    },
    memoryTrick:
      "Switch away from higher-risk tricyclic profile toward alternatives like venlafaxine/reboxetine in this stem.",
    explanation:
      "Venlafaxine and reboxetine are antidepressant drugs that are less likely to be associated with the development of movement disorders.",
  },
  {
    id: 128,
    type: "combo",
    category: "Clinical Pharmacy",
    caseId: "t2_case4",
    caseBlock:
      "QR is a 75-year-old male whose current medication is co-codamol 2 tablets qid, paracetamol 1 g qid, gliclazide 80 mg bd, ferrous sulphate 800 mg tds, dipyridamole 25 mg tds, and isosorbide dinitrate 20 mg tds.",
    question: "Q128. Pharmacist intervention includes:",
    statements: [
      "1. suggesting cessation of co-codamol",
      "2. reviewing the dose of ferrous sulphate",
      "3. reviewing the isosorbide dinitrate dose as the maximum daily dose is 5 mg daily",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because duplicate paracetamol exposure from co-codamol plus standalone paracetamol requires review, and iron dosing review is reasonable; statement 3 is false due to incorrect nitrate maximum-dose claim.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is based on an incorrect isosorbide dinitrate maximum-dose assertion.",
      C: "Includes statement 3 and misses statement 1.",
      D: "Only statement 1 is incomplete because ferrous sulfate dosing review is also appropriate.",
      E: "Only statement 3 is not a valid intervention point here.",
    },
    memoryTrick:
      "Check for duplicate paracetamol and review iron dosing; ignore false nitrate max claims.",
    explanation:
      "Co-codamol is a compound preparation containing paracetamol, a non-opioid analgesic, and codeine, an opioid analgesic.",
  },
  {
    id: 255,
    type: "single",
    category: "Clinical Pharmacology",
    caseId: "t2_case4",
    question: "Q255. The maximum adult daily dose of paracetamol is:",
    options: ["1 g", "2 g", "3 g", "4 g", "8 g"],
    correct: "4 g",
    explainCorrect:
      "4 g is correct because the standard maximum adult daily paracetamol dose is 4 grams in routine guidance.",
    wrongOptionExplanations: {
      "1 g": "1 g is a common single dose, not the adult daily maximum.",
      "2 g": "2 g is below the usual maximum daily allowance in adults.",
      "3 g":
        "3 g may be used in some caution contexts but is not the standard maximum quoted in this item.",
      "8 g":
        "8 g exceeds safe adult daily dosing and increases hepatotoxicity risk.",
    },
    memoryTrick:
      "Paracetamol ceiling in standard adult dosing is 4 grams per day.",
    explanation: "The maximum adult daily dose of paracetamol is 4 g.",
  },
  {
    id: 245,
    type: "single",
    category: "Endocrinology",
    caseId: "t2_case4",
    question: "Q245. Gliclazide:",
    options: [
      "augments insulin secretion",
      "can only be used as monotherapy",
      "promotes weight loss",
      "causes hyperglycaemia",
      "inhibits intestinal alpha-glucosidases",
    ],
    correct: "augments insulin secretion",
    explainCorrect:
      "Gliclazide is correct because sulfonylureas lower glucose primarily by stimulating pancreatic insulin secretion.",
    wrongOptionExplanations: {
      "can only be used as monotherapy":
        "Gliclazide can be used in combination regimens depending on glycaemic control needs.",
      "promotes weight loss":
        "Sulfonylureas are more associated with weight gain risk than weight loss.",
      "causes hyperglycaemia":
        "Its therapeutic purpose is to reduce glucose, not raise it.",
      "inhibits intestinal alpha-glucosidases":
        "That mechanism belongs to alpha-glucosidase inhibitors, not sulfonylureas.",
    },
    memoryTrick:
      "Gliclazide belongs to the insulin-secretagogue sulfonylurea class.",
    explanation:
      "Gliclazide is a sulfonylurea that lowers glucose by stimulating insulin secretion.",
  },
  {
    id: 56,
    type: "combo",
    category: "Endocrinology",
    caseId: "t2_case4",
    question: "Q56. The patient should be advised:",
    statements: [
      "1. to take small, frequent meals",
      "2. to avoid a high-calorie diet",
      "3. to consume food with a high fat content",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because meal-structure and calorie control support diabetes/cardiometabolic care, while advising high-fat intake is inappropriate.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which conflicts with cardiometabolic dietary goals.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because avoiding excessive calories is also needed.",
      E: "Only statement 3 is contrary to healthy dietary advice in this context.",
    },
    memoryTrick:
      "Diabetes food advice here means structured meals and calorie control, not high fat.",
    explanation:
      "QR should be advised on healthy lifestyle measures to counteract complications associated with diabetes and cardiovascular disease.",
  },
  {
    id: 15,
    type: "combo",
    category: "Clinical Pharmacy",
    caseId: "t2_case4",
    question: "Q15. QR is receiving medication to achieve:",
    statements: [
      "1. analgesia",
      "2. an antiplatelet effect",
      "3. coronary vasodilation",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because the regimen includes analgesics, dipyridamole for antiplatelet effect, and isosorbide dinitrate for coronary vasodilation.",
    wrongOptionExplanations: {
      B: "Misses statement 3, though nitrate therapy targets vasodilation.",
      C: "Misses statement 1 despite explicit analgesic treatment.",
      D: "Only statement 1 is incomplete because antiplatelet and vasodilator goals are also present.",
      E: "Only statement 3 is too narrow for the full treatment-intent profile.",
    },
    memoryTrick:
      "This regimen spans pain control, platelet control, and vessel dilation.",
    explanation:
      "QR is receiving analgesics (paracetamol), an antiplatelet agent (dipyridamole), and a nitrate (isosorbide dinitrate), which promote coronary vasodilation.",
  },
  {
    id: 269,
    type: "combo",
    category: "Gastroenterology",
    caseId: "t2_case5",
    caseBlock:
      "MR is an 82-year-old female hospitalised in the ophthalmic ward. Current medication: framycetin eye drops both eyes tds, dorzolamide eye drops left eye bd, acetazolamide 125 mg bd, timolol 0.5% eye drops left eye bd, ranitidine 150 mg nocte, bisacodyl 5 mg daily.",
    question:
      "Q269. Use of bisacodyl in MR requires assessment because it can:",
    statements: [
      "1. precipitate atonic colon",
      "2. precipitate hypokalaemia",
      "3. cause intestinal obstruction",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because prolonged stimulant-laxative use can cause atonic colon and electrolyte loss including hypokalaemia, while intestinal obstruction is not a typical direct bisacodyl adverse effect in this framing.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the key expected adverse-effect pattern here.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because hypokalaemia risk is also relevant.",
      E: "Only statement 3 is not the intended principal caution in this item.",
    },
    memoryTrick:
      "Chronic stimulant laxatives can weaken bowel tone and lower potassium.",
    explanation:
      "Bisacodyl is a diphenylmethane stimulant laxative and it acts mainly on the large intestine. Prolonged use of bisacodyl should be avoided as it may precipitate diarrhoea, hypokalaemia and atonic non-functioning colon.",
  },
  {
    id: 277,
    type: "single",
    category: "Gastroenterology",
    caseId: "t2_case5",
    question: "Q277. In MR bisacodyl could be replaced with:",
    options: [
      "senna",
      "docusate sodium",
      "liquid paraffin",
      "magnesium hydroxide",
      "lactulose",
    ],
    correct: "lactulose",
    explainCorrect:
      "Lactulose is correct because it is a gentler osmotic laxative option suitable for longer-term constipation management in older patients compared with chronic stimulant use.",
    wrongOptionExplanations: {
      senna:
        "Senna is also a stimulant laxative and may not be ideal for long-term replacement in this context.",
      "docusate sodium":
        "Docusate may help stool softening but is not the strongest intended long-term replacement in this item.",
      "liquid paraffin":
        "Liquid paraffin is less favored long term due to tolerability and aspiration concerns in older adults.",
      "magnesium hydroxide":
        "Magnesium salts may be less suitable for regular long-term use, especially with frailty/comorbidity considerations.",
    },
    memoryTrick:
      "When replacing chronic stimulant laxative in elderly care, think gentler osmotic choice like lactulose.",
    explanation:
      "Lactulose can be used as a gentler long-term alternative to stimulant laxatives in older patients.",
  },
  {
    id: 136,
    type: "combo",
    category: "Ophthalmology",
    caseId: "t2_case5",
    question: "Q136. Framycetin drug therapy:",
    statements: [
      "1. is used to treat eye infection",
      "2. may be used for prophylaxis following eye surgery",
      "3. is used short-term",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because framycetin eye therapy is used for ocular bacterial infection, may be used prophylactically after eye procedures in selected settings, and is generally short-term to limit resistance and toxicity risk.",
    wrongOptionExplanations: {
      B: "Misses statement 3 even though short-course use is an important safety principle.",
      C: "Misses statement 1, the core indication in this context.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also true in this item.",
      E: "Only statement 3 is too narrow without indication and perioperative context.",
    },
    memoryTrick:
      "Topical eye antibiotic logic here is treat infection, short course, and possible post-op cover.",
    explanation:
      "Framycetin is an aminoglycoside antibacterial agent which has a bactericidal action against Gram-negative aerobic bacteria excluding Pseudomonas species and against some strains of staphylococci.",
  },
  {
    id: 173,
    type: "combo",
    category: "Ophthalmology",
    caseId: "t2_case5",
    question: "Q173. Condition(s) being treated in the left eye only:",
    statements: ["1. cataract", "2. infection", "3. glaucoma"],
    correct: "E",
    explainCorrect:
      "Option E (3 only) is correct because the left-eye-only pressure-lowering regimen points to glaucoma treatment localized to that eye.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, which are not the left-eye-only treated conditions in this stem.",
      B: "Statements 1 and 2 do not match the specific eye-targeted treatment profile.",
      C: "Includes statement 2 and omits the keyed glaucoma-only conclusion.",
      D: "Statement 1 alone is not the left-eye-only condition highlighted by the regimen.",
    },
    memoryTrick:
      "If unilateral pressure-control drops are used, think unilateral glaucoma focus.",
    explanation:
      "MR is receiving treatment for glaucoma, which is a raised intraocular pressure caused by obstruction of the outﬂow of aqueous humour.",
  },
  {
    id: 133,
    type: "single",
    category: "Infectious Diseases",
    caseId: "t2_case6",
    caseBlock:
      "CB is a 59-year-old male admitted with severe chest infection. Current medication: lactulose 30 ml daily, warfarin 4 mg daily adjusted by INR, paracetamol 500 mg prn. CB is allergic to penicillin and has tinnitus and hearing loss.",
    question:
      "Q133. Which of the following antibacterial preparations is the most appropriate?",
    options: [
      "co-amoxiclav",
      "cefuroxime",
      "gentamicin",
      "ciprofloxacin",
      "sodium fusidate",
    ],
    correct: "ciprofloxacin",
    explainCorrect:
      "Ciprofloxacin is correct because this case excludes penicillin options and avoids aminoglycoside choice in a patient with tinnitus/hearing loss risk considerations.",
    wrongOptionExplanations: {
      "co-amoxiclav":
        "Contains a penicillin component and is inappropriate in a penicillin-allergic patient.",
      cefuroxime:
        "A cephalosporin may be considered in some cases, but this stem keys ciprofloxacin as the most appropriate listed option.",
      gentamicin:
        "Aminoglycosides can worsen ototoxicity risk and are unfavorable with existing hearing symptoms.",
      "sodium fusidate":
        "Fusidate has narrower utility and is not the best systemic option for this severe chest infection scenario.",
    },
    memoryTrick:
      "Penicillin allergy plus hearing-risk context pushes choice away from penicillins and aminoglycosides.",
    explanation:
      "Ciprofloxacin is the most suitable listed antibacterial option in this penicillin-allergic patient with hearing issues.",
  },
  {
    id: 116,
    type: "combo",
    category: "Gastroenterology",
    caseId: "t2_case6",
    question: "Q116. Lactulose:",
    statements: [
      "1. treatment in CB should be withdrawn",
      "2. is used for chronic constipation",
      "3. may cause flatulence",
    ],
    correct: "C",
    explainCorrect:
      "Option C (2 and 3 only) is correct because lactulose is used for chronic constipation and commonly causes bloating/flatulence; there is no automatic need to withdraw it solely from this stem.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not justified as a routine immediate action here.",
      B: "Includes statement 1 and omits statement 3.",
      D: "Statement 1 alone is not the best conclusion in this context.",
      E: "Only statement 3 is incomplete because statement 2 is also true.",
    },
    memoryTrick:
      "Lactulose often means chronic constipation support plus gas-related side effects.",
    explanation:
      "Lactulose is a semi-synthetic disaccharide that produces osmotic diarrhoea. It can be used for the management of chronic constipation.",
  },
  {
    id: 212,
    type: "single",
    category: "Palliative Care",
    caseId: "t2_case7",
    caseBlock:
      "JM is a 40-year-old female in terminal stages of carcinoma. Current medication: paroxetine 20 mg daily, tamoxifen 20 mg daily, co-codamol 2 tablets tds, diazepam 2 mg nocte. She is still complaining of pain.",
    question:
      "Q212. Which of the following is an alternative treatment to co-codamol?",
    options: ["domperidone", "paracetamol", "morphine", "aspirin", "ibuprofen"],
    correct: "morphine",
    explainCorrect:
      "Morphine is correct because severe persistent cancer pain despite weak-opioid combination therapy warrants escalation to strong opioid analgesia in palliative care.",
    wrongOptionExplanations: {
      domperidone:
        "Domperidone is an antiemetic/prokinetic, not a primary step-up analgesic for severe cancer pain.",
      paracetamol:
        "Paracetamol alone is too weak as escalation when pain persists on co-codamol.",
      aspirin:
        "Aspirin is not the preferred strong step-up option for severe terminal cancer pain and may add bleeding/GI risk.",
      ibuprofen:
        "NSAIDs may be adjuncts but are not equivalent to strong opioid escalation in this scenario.",
    },
    memoryTrick:
      "Persistent severe palliative pain after weak opioids signals move to strong opioid, classically morphine.",
    explanation:
      "Morphine is an appropriate step-up analgesic in severe pain during palliative care.",
  },
  {
    id: 49,
    type: "combo",
    category: "Palliative Care",
    caseId: "t2_case7",
    question:
      "Q49. What side-effects could be expected from analgesics used for palliative care?",
    statements: ["1. nausea", "2. vomiting", "3. constipation"],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because opioid-based palliative analgesia commonly causes nausea, vomiting, and constipation.",
    wrongOptionExplanations: {
      B: "Misses statement 3, but constipation is a major expected opioid adverse effect.",
      C: "Misses statement 1 while including only 2 and 3.",
      D: "Only statement 1 is incomplete because vomiting and constipation are also common.",
      E: "Only statement 3 is too narrow for the broader side-effect profile.",
    },
    memoryTrick:
      "Opioid side-effect bundle to remember: nausea, vomiting, constipation.",
    explanation:
      "Opioid drugs used in palliative care include tramadol and morphine. Opioids may cause nausea and vomiting especially during the initial doses, constipation and drowsiness.",
  },
  {
    id: 184,
    type: "combo",
    category: "Oncology",
    caseId: "t2_case7",
    question: "Q184. Tamoxifen:",
    statements: [
      "1. is used in breast cancer",
      "2. is associated with the occurrence of hot flushes",
      "3. is administered every 2 weeks",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because tamoxifen is used in hormone-responsive breast cancer and can cause hot flushes; it is typically taken daily rather than every two weeks.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the usual tamoxifen schedule.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because hot flushes are also relevant adverse effects.",
      E: "Only statement 3 is incorrect in standard tamoxifen dosing practice.",
    },
    memoryTrick:
      "Tamoxifen in this item means breast-cancer use plus hot flushes and daily dosing.",
    explanation:
      "Tamoxifen is an oestrogen-receptor antagonist available as an oral formulation that is administered daily.",
  },
  {
    id: 185,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case7",
    question: "Q185. Paroxetine:",
    statements: [
      "1. is used in JM to alleviate depression and anxiety",
      "2. dose is given in the morning",
      "3. is administered with or after food",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because paroxetine treats depression/anxiety, is commonly given in the morning in this context, and may be taken with or after food to improve tolerability.",
    wrongOptionExplanations: {
      B: "Misses statement 3, which is part of practical administration advice.",
      C: "Misses statement 1, the main therapeutic reason for prescribing paroxetine.",
      D: "Only statement 1 is incomplete because statements 2 and 3 are also true in this item.",
      E: "Only statement 3 is too limited without indication and timing guidance.",
    },
    memoryTrick:
      "Paroxetine counseling here links indication, morning routine, and food-tolerability advice.",
    explanation:
      "Paroxetine is a selective serotonin re-uptake inhibitor (SSRI) that is used in JM to alleviate depression and anxiety associated with terminal carcinoma.",
  },
  {
    id: 125,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case7",
    question: "Q125. In JM the disadvantages of diazepam are:",
    statements: ["1. withdrawal symptoms", "2. dependence", "3. confusion"],
    correct: "E",
    explainCorrect:
      "Option E (3 only) is correct as keyed in this item because confusion is the prioritized immediate disadvantage in JM's clinical context, whereas statements 1 and 2 are broader long-term class risks not selected here.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, but this question key prioritizes statement 3 only.",
      B: "Includes statements 1 and 2, which are not the keyed answer in this stem.",
      C: "Includes statement 2 and misses the keyed single statement.",
      D: "Statement 1 alone is not the keyed disadvantage for this case-specific item.",
    },
    memoryTrick:
      "For this keyed scenario, think immediate cognitive risk from diazepam: confusion.",
    explanation:
      "Diazepam is a benzodiazepine that is associated with tolerance and dependence. The occurrence of dependence results in withdrawal symptoms, should the drug be discontinued abruptly.",
  },
  {
    id: 297,
    type: "combo",
    category: "Endocrinology",
    caseId: "t2_case8",
    caseBlock:
      "LX is an 82-year-old female admitted with infection in the right toe. On admission: dipyridamole 100 mg tds, aspirin 75 mg daily, glibenclamide 5 mg bd. Fasting blood glucose was 12 mmol/l. She was started on cefuroxime 750 mg IV 8-hourly, metronidazole 500 mg IV 8-hourly, and insulin according to blood glucose levels. Glibenclamide was stopped.",
    question: "Q297. Reasons for the change in antidiabetic therapy:",
    statements: [
      "1. diabetes is not controlled",
      "2. to remove oral drug administration",
      "3. LX has stopped intake of food",
    ],
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because poor glycaemic control during acute infection is the key reason for switching to insulin in this stem.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not established as the primary reasons in this item.",
      B: "Includes statement 2 and misses the core uncontrolled-diabetes reason.",
      C: "Includes statements 2 and 3 and omits the keyed primary driver.",
      E: "Statement 3 is not supported as a stated trigger in this case.",
    },
    memoryTrick:
      "Acute infection plus uncontrolled glucose often drives temporary insulin switch.",
    explanation:
      "Currently, blood glucose level is not controlled in LX. At the moment LX has an infection that is causing metabolic stress and precipitating an acute disturbance in blood glucose control.",
  },
  {
    id: 259,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t2_case8",
    question: "Q259. Metronidazole was included in the therapeutic regimen:",
    statements: [
      "1. to cover against anaerobic bacteria",
      "2. to potentiate cefuroxime",
      "3. for a topical effect",
    ],
    correct: "D",
    explanation:
      "Metronidazole is an anti-infective that is active against anaerobic bacteria and protozoa. It is included in the therapeutic regimen, together with cefuroxime, to expand the spectrum of activity of the anti-infectives used.",
    explainCorrect:
      "Option D (1 only) is correct because metronidazole is used here for anaerobic cover, not for potentiation and not for topical action.",
    wrongOptionExplanations: {
      A: "This option includes statements that are not correct for why metronidazole was added.",
      B: "This option includes statement 2, but metronidazole broadens spectrum; it does not potentiate cefuroxime.",
      C: "This option includes statement 3, but this is not a topical-use scenario.",
      E: "This option misses statement 1, which is the true purpose in this regimen.",
    },
    memoryTrick: "Metronidazole in mixed regimens: think anaerobes first.",
  },
  {
    id: 48,
    type: "combo",
    category: "Palliative Care",
    caseId: "t2_case9",
    caseBlock:
      "FS has been prescribed morphine sulphate 50 mg in the morning and 100 mg at night. Preferred route is oral tablets; available strengths are 10 mg, 30 mg, and 60 mg.",
    question:
      "Q48. How many morphine sulphate tablets need to be dispensed for a morning dose?",
    statements: [
      "1. one 30 mg tablet",
      "2. two 10 mg tablets",
      "3. three 10 mg tablets",
    ],
    correct: "B",
    explanation:
      "For the morning dose, FS should be given 50 mg, which can be administered as one 30 mg tablet and two 10 mg tablets.",
    explainCorrect:
      "Option B is correct because the intended 50 mg morning dose is achieved by combining one 30 mg tablet with two 10 mg tablets.",
    wrongOptionExplanations: {
      A: "This option includes statement 3, which is not part of the intended dose construction.",
      C: "This option contains a statement combination that is not the intended tablet plan in this stem.",
      D: "This option underdoses because statement 1 alone does not reach 50 mg.",
      E: "This option is incorrect because statement 3 alone is not the planned 50 mg regimen.",
    },
    memoryTrick: "Target 50 mg: 30 plus two 10s.",
  },
  {
    id: 216,
    type: "combo",
    category: "Palliative Care",
    caseId: "t2_case9",
    question:
      "Q216. How many morphine sulphate tablets need to be dispensed for the evening dose?",
    statements: [
      "1. one 60 mg tablet",
      "2. one 10 mg tablet",
      "3. one 30 mg tablet",
    ],
    correct: "A",
    explanation:
      "For the evening dose, FS should be given 100 mg, which can be administered as one 60 mg tablet, one 10 mg tablet and one 30 mg tablet.",
    explainCorrect:
      "Option A is correct because the prescribed 100 mg evening dose is formed by 60 mg plus 10 mg plus 30 mg.",
    wrongOptionExplanations: {
      B: "This option leaves out one required strength and does not give the complete prescribed evening plan.",
      C: "This option misses key tablet strength(s) needed to construct the full 100 mg dose.",
      D: "Statement 1 alone does not fulfill the full evening dose.",
      E: "Statement 3 alone does not fulfill the full evening dose.",
    },
    memoryTrick: "For 100 mg with these strengths, stack all three.",
  },
  {
    id: 258,
    type: "single",
    category: "Gastroenterology",
    caseId: "t2_case10",
    caseBlock:
      "CP is a 28-year-old male with weakness, dizziness, and sweating. Gastroscopy revealed a duodenal ulcer. Helicobacter pylori urea breath test was negative. Lab tests confirmed anaemia. Admission medication: gliclazide 40 mg daily, esomeprazole 20 mg daily, aluminium-magnesium antacid 10 ml qid.",
    question: "Q258. A likely cause of anaemia in CP is:",
    options: [
      "gastrointestinal haemorrhage",
      "splenomegaly",
      "inadequate diet",
      "autoimmune disease",
      "congenital disease",
    ],
    correct: "gastrointestinal haemorrhage",
    explanation:
      "In this ulcer context, chronic gastrointestinal blood loss is the most likely cause of anaemia.",
    explainCorrect:
      "Gastrointestinal haemorrhage is correct because a duodenal ulcer can cause chronic blood loss and iron-deficiency anaemia.",
    wrongOptionExplanations: {
      splenomegaly:
        "This can affect blood counts in other disorders, but it is not the strongest explanation in this ulcer context.",
      "inadequate diet":
        "Dietary deficiency is possible, but active ulcer-related bleeding is a more direct cause here.",
      "autoimmune disease":
        "No autoimmune clues are provided in the case stem.",
      "congenital disease":
        "A congenital cause is less likely than acquired GI blood loss in this adult presentation.",
    },
    memoryTrick: "Ulcer plus anaemia: think chronic GI bleed first.",
  },
  {
    id: 77,
    type: "combo",
    category: "Gastroenterology",
    caseId: "t2_case10",
    question: "Q77. Actions to be taken for CP include:",
    statements: [
      "1. start ferrous sulphate tablets",
      "2. administer iron sorbitol injection",
      "3. carry out gastric lavage",
    ],
    correct: "D",
    explanation:
      "A priority in the management of CP is to correct the anaemia by administering iron supplements.",
    explainCorrect:
      "Option D (1 only) is correct because oral ferrous sulphate is first-line for iron-deficiency correction when oral treatment is feasible.",
    wrongOptionExplanations: {
      A: "This option includes interventions that are not required for this stable correction step.",
      B: "This option includes routine immediate iron injection, which is not first-line when oral iron is possible.",
      C: "This option includes gastric lavage, which is not indicated for this case.",
      E: "This option is incorrect because gastric lavage is unrelated to this anaemia treatment question.",
    },
    memoryTrick: "If gut absorption is possible, start oral iron first.",
  },
  {
    id: 198,
    type: "combo",
    category: "Gastroenterology",
    caseId: "t2_case10",
    question: "Q198. On discharge CP should be advised:",
    statements: [
      "1. to avoid NSAIDs",
      "2. to take small frequent meals",
      "3. to reduce intake of fibre",
    ],
    correct: "B",
    explanation:
      "CP should be advised to avoid non-steroidal anti-inﬂammatory drugs such as aspirin and to inform prescribers and pharmacists of his condition before using other medications.",
    explainCorrect:
      "Option B is correct because avoiding NSAIDs reduces ulcer risk, and small frequent meals can support symptom control during healing.",
    wrongOptionExplanations: {
      A: "This option includes statement 3, which is not a core routine discharge advice point here.",
      C: "This option misses the key NSAID-avoidance counselling focus.",
      D: "Statement 1 alone is incomplete because the supportive meal advice in statement 2 also applies.",
      E: "Statement 3 alone is not appropriate as primary discharge counselling in this case.",
    },
    memoryTrick:
      "Ulcer discharge: remove irritants and reduce symptom triggers.",
  },
  {
    id: 314,
    type: "combo",
    category: "Geriatric Medicine",
    caseId: "t2_case11",
    caseBlock:
      "MC is an 84-year-old female referred to A&E with gradual deterioration and poor oral intake for several days. PMH: diabetes mellitus, congestive heart failure, ischaemic heart disease, dementia. DH: perindopril 2 mg daily, digoxin 0.0625 mg daily, bumetanide 1 mg daily, metformin 500 mg bd, amitriptyline 20 mg nocte, ranitidine 150 mg daily. O/E includes poor respiratory effort and bilateral inspiratory crackles. Impression: dehydration and early parkinsonian features. Started on IV 0.9% saline alternating with 5% dextrose every 8 hours.",
    question:
      "Q314. Features that could have caused the onset of dehydration in MC:",
    statements: ["1. amitriptyline", "2. bumetanide", "3. low fluid intake"],
    correct: "C",
    explanation:
      "Onset of dehydration may be precipitated by decreased ﬂuid intake and by loop diuretics. Risk of dehydration increases with environmental factors that support ﬂuid and electrolyte loss, such as heat exposure caused by hot temperatures and inadequate ventilation at home.",
    explainCorrect:
      "Option C is correct because bumetanide increases fluid loss and low oral intake reduces replacement, together causing dehydration.",
    wrongOptionExplanations: {
      A: "This option includes statement 1, but the strongest direct drivers here are statements 2 and 3.",
      B: "This option misses low fluid intake, which is central in this presentation.",
      D: "Statement 1 alone does not explain the dehydration picture as well as the true factors.",
      E: "Low fluid intake alone is incomplete without accounting for diuretic-related losses.",
    },
    memoryTrick: "Frail dehydration often equals less in plus more out.",
  },
  {
    id: 235,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t2_case11",
    question:
      "Q235. The poor health, poor respiratory effort and bilateral inspiratory crackles suggest the need to start:",
    statements: [
      "1. prednisolone iv",
      "2. budesonide by inhalation",
      "3. co-amoxiclav iv",
    ],
    correct: "E",
    explanation:
      "In elderly patients a normal white blood cell count is not sufﬁcient to eliminate the presence of an infection and MC has clinical signs that may indicate an infection.",
    explainCorrect:
      "Option E (3 only) is correct because the respiratory signs and decline suggest likely infection requiring systemic antibacterial treatment.",
    wrongOptionExplanations: {
      A: "This option adds non-antibacterial therapies that do not address the likely infection driver.",
      B: "This option still misses the primary need for antibacterial cover.",
      C: "This option includes an unnecessary inhaled steroid in the acute priority step.",
      D: "Prednisolone alone is not appropriate first treatment for likely bacterial infection.",
    },
    memoryTrick:
      "Crackles with acute decline in the elderly: cover infection early.",
  },
  {
    id: 315,
    type: "combo",
    category: "Clinical Pharmacology",
    caseId: "t2_case11",
    question:
      "Q315. What measures need to be undertaken during parenteral rehydration?",
    statements: [
      "1. monitor blood sodium levels",
      "2. monitor blood glucose 6 hourly",
      "3. stop bumetanide",
    ],
    correct: "A",
    explanation:
      "When MC is started on parenteral rehydration with intravenous 0. 9% sodium chloride 1 litre alternating with 5% dextrose 1 litre every 8 h, blood sodium levels and blood glucose should be monitored.",
    explainCorrect:
      "Option A is correct because safe parenteral rehydration in this diabetic elderly patient requires sodium and glucose monitoring, with diuretic review during fluid replacement.",
    wrongOptionExplanations: {
      B: "This option misses treatment adjustment that can otherwise counteract rehydration.",
      C: "This option omits sodium monitoring, which is essential during IV fluid therapy.",
      D: "Statement 1 alone is incomplete without glucose monitoring and medication review.",
      E: "This option is incomplete without the required biochemical monitoring.",
    },
    memoryTrick: "Rehydrate with checks: sodium, glucose, and drug review.",
  },
  {
    id: 58,
    type: "combo",
    category: "Endocrinology",
    caseId: "t2_case11",
    question:
      "Q58. With regards to the use of metformin, MC should be advised:",
    statements: [
      "1. to take tablets with meals",
      "2. to avoid alcoholic drink",
      "3. that soft stools occur usually as a long-term side-effect",
    ],
    correct: "B",
    explanation:
      "Metformin is an antidiabetic drug that has the advantages that it does not increase appetite and that occurrence of hypoglycaemia is very low.",
    explainCorrect:
      "Option B is correct because metformin should be taken with meals to reduce GI effects, and alcohol should be avoided or minimized.",
    wrongOptionExplanations: {
      A: "This option includes statement 3, but that is not the best long-term counselling focus.",
      C: "This option misses practical meal-based administration guidance.",
      D: "Statement 1 alone is incomplete because alcohol counselling is also important.",
      E: "Statement 3 alone is not an accurate main counselling point.",
    },
    memoryTrick: "Metformin basics: take with food and keep alcohol low.",
  },
  {
    id: 296,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case11",
    question: "Q296. Amitriptyline:",
    statements: [
      "1. is more sedative than imipramine",
      "2. a reduced dose is recommended for older persons",
      "3. its use in MC should be revised because of her medical history",
    ],
    correct: "A",
    explanation:
      "Amitriptyline and imipramine are tricyclic antidepressants that have a tertiary amine structure.",
    explainCorrect:
      "Option A is correct because all three statements apply: amitriptyline is relatively sedating, lower doses are advised in older adults, and this patient profile warrants medication review.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but reviewing amitriptyline is important in this elderly multimorbid patient.",
      C: "This excludes statement 1 even though amitriptyline is recognized as strongly sedating.",
      D: "Statement 1 alone is incomplete; statements 2 and 3 are also relevant.",
      E: "Statement 3 alone is insufficient because counselling and dosing principles in statements 1 and 2 also hold.",
    },
    memoryTrick:
      "Amitriptyline in older adults: sedating, dose down, and review regularly.",
  },
  {
    id: 135,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case11",
    question: "Q135. Early parkinsonian features include:",
    statements: [
      "1. bradykinesia",
      "2. incontinence",
      "3. postural instability",
    ],
    correct: "D",
    explanation:
      "MC has presented with early parkinsonian features. Bradykinesia which is general slowness of movement, is the main symptom for parkinsonism, which, during the initial phases of the disease, may occur as the only symptom or in combination with tremor at rest that disappears with activity and muscular rigidity.",
    explainCorrect:
      "Option D (1 only) is correct because bradykinesia is a core early parkinsonian sign, while incontinence and early postural instability are not the defining earliest feature here.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not accepted as early core features in this item.",
      B: "This includes statement 2, which is not an early defining parkinsonian feature.",
      C: "This includes statement 3 and misses the stem focus on the key early marker.",
      E: "Statement 3 alone is not the best early hallmark in this question.",
    },
    memoryTrick: "Early Parkinson pattern in stems: think slow movement first.",
  },
  {
    id: 22,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case11",
    question: "Q22. In MC:",
    statements: [
      "1. parkinsonian symptoms may be precipitated by amitriptyline",
      "2. physiotherapy may provide patient support to counteract onset of parkinsonian symptoms",
      "3. signs of dementia exclude occurrence of Parkinson’s disease",
    ],
    correct: "B",
    explanation:
      "Amitriptyline, being a tricyclic antidepressant, may cause movement disorders and dyskinesias. Parkinsonian symptoms in MC may be precipitated by the administration of amitriptyline.",
    explainCorrect:
      "Option B is correct because amitriptyline can worsen movement problems and physiotherapy can support function, while dementia does not exclude Parkinson disease.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but dementia does not rule out Parkinson disease.",
      C: "This pairs statements 2 and 3 and includes a false exclusion statement.",
      D: "Statement 1 alone is incomplete because supportive physiotherapy advice is also valid.",
      E: "Statement 3 alone is false in this context.",
    },
    memoryTrick:
      "Drug effects can mimic movement issues, and rehab still helps; dementia does not cancel Parkinson.",
  },
  {
    id: 137,
    type: "combo",
    category: "Dermatology",
    caseId: "t2_case12",
    caseBlock:
      "BC is a 9-year-old female on holiday at a seaside resort. She presents with itchy red scaly areas on both elbows with a golden-yellow crust. She has atopic eczema.",
    question: "Q137. Possibilities of diagnosis include:",
    statements: [
      "1. exacerbation of atopic eczema",
      "2. impetigo",
      "3. ringworm infection",
    ],
    correct: "B",
    explanation:
      "BC may have an exacerbation of atopic eczema or impetigo, which is a common occurrence in patients with atopic eczema, as the area becomes infected because of the scratching that is associated with intense itching.",
    explainCorrect:
      "Option B is correct because an atopic eczema flare with secondary impetiginization is plausible, whereas ringworm is not the best fit for this classic crusted eczema pattern.",
    wrongOptionExplanations: {
      A: "This includes ringworm, which is not supported as strongly by the stem findings.",
      C: "This combination includes ringworm and misses one of the two more likely diagnoses.",
      D: "Statement 1 alone is incomplete because impetigo is also likely with golden crusting.",
      E: "Statement 3 alone is less consistent than eczema plus impetigo in this case.",
    },
    memoryTrick:
      "Atopic skin plus honey-gold crust: think eczema flare with impetigo.",
  },
  {
    id: 45,
    type: "combo",
    category: "Dermatology",
    caseId: "t2_case12",
    question: "Q45. Drugs that could be recommended for use in BC include:",
    statements: [
      "1. hydrocortisone 1% cream",
      "2. mepyramine cream",
      "3. miconazole cream",
    ],
    correct: "D",
    explanation:
      "In the management of an acute attack of atopic eczema, topical corticosteroids should be recommended.",
    explainCorrect:
      "Option D (1 only) is correct because low-potency topical hydrocortisone is appropriate for eczema inflammation, while mepyramine cream and miconazole are not core first-line choices here.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not standard first-line treatment for this presentation.",
      B: "This includes statement 2, which is not preferred eczema anti-inflammatory therapy.",
      C: "This includes statement 3, but antifungal therapy is not indicated by this stem.",
      E: "Statement 3 alone treats fungal disease, not this likely eczema-driven flare.",
    },
    memoryTrick: "Eczema flare first-line on this list: mild topical steroid.",
  },
  {
    id: 24,
    type: "combo",
    category: "Dermatology",
    caseId: "t2_case12",
    question: "Q24. The parents of BC should be reminded to:",
    statements: [
      "1. avoid use of soaps and bubble baths",
      "2. use hypoallergenic sun protection cream",
      "3. ensure good hydration",
    ],
    correct: "A",
    explanation:
      "Parents of BC should be educated on the importance of preventing dehydration of the skin by ensuring good hydration and by using emollients.",
    explainCorrect:
      "Option A is correct because all three are sensible eczema skin-care supports: avoid irritant soaps, use suitable sun protection, and maintain hydration/emollient routine.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but hydration is a core eczema-care principle.",
      C: "This omits statement 1, yet soap/bubble-bath avoidance is key trigger control.",
      D: "Statement 1 alone is incomplete because sun care and hydration advice are also relevant.",
      E: "Statement 3 alone misses important irritant-avoidance and protection counselling.",
    },
    memoryTrick:
      "Eczema home care triad: avoid irritants, protect, and hydrate.",
  },
  {
    id: 50,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    caseBlock:
      "GM is a 28-year-old female with tension headache seeking medication stronger than paracetamol.",
    question: "Q50. Tension headache:",
    statements: [
      "1. tends to have a chronic pattern",
      "2. is due to arterial vasoconstriction",
      "3. occurs only in young adults",
    ],
    correct: "D",
    explanation:
      "Tension headaches tend to occur repeatedly in patients who are prone to develop this syndrome. Females experience this condition to a greater extent than males.",
    explainCorrect:
      "Option D (1 only) is correct because tension headache is commonly recurrent/chronic, but it is not primarily due to arterial vasoconstriction and not limited to young adults.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not correct descriptors of tension headache here.",
      B: "This includes statement 2, which aligns more with migraine pathophysiology than classic tension headache.",
      C: "This includes statement 3, but tension headache occurs across age groups.",
      E: "Statement 3 alone is false because the condition is not age-restricted to young adults.",
    },
    memoryTrick:
      "Tension headache: recurrent pressure pattern, not vessel spasm.",
  },
  {
    id: 291,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    question:
      "Q291. Characteristic complaints of patients with tension headache are:",
    statements: [
      "1. feeling of a bilateral ‘hatband’",
      "2. pain is non-throbbing",
      "3. sound intolerance",
    ],
    correct: "A",
    explanation:
      "Patients with tension headache complain of mild, dull ache that is steady and usually bilateral and non-throbbing.",
    explainCorrect:
      "Option A is correct because this stem accepts all listed complaints as part of tension-headache presentation: bilateral hatband pressure, non-throbbing pain, and possible sound sensitivity.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but the item includes sound intolerance among accepted complaints.",
      C: "This omits statement 1, which is the classic bilateral hatband description.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also accepted in this item.",
      E: "Statement 3 alone misses the core bilateral non-throbbing pain profile.",
    },
    memoryTrick:
      "Hatband plus steady pain is classic; sensory sensitivity can still appear.",
  },
  {
    id: 249,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    question: "Q249. GM could be advised to:",
    statements: [
      "1. adopt a less stressful life",
      "2. avoid consumption of cheese",
      "3. change employment",
    ],
    correct: "D",
    explanation:
      "GM should be advised to identify factors that are precipitating her attacks. These could include prolonged posture posing strain on head and neck muscles and activities that induce stress.",
    explainCorrect:
      "Option D (1 only) is correct because stress reduction and trigger management are relevant for tension headache, while cheese avoidance and changing employment are not routine blanket advice.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not standard broad counselling for this stem.",
      B: "This includes statement 2, but cheese avoidance is classically linked to migraine triggers, not generic tension headache advice.",
      C: "This includes statement 3, and changing job is not a routine first recommendation.",
      E: "Statement 3 alone is disproportionate and not standard initial counselling.",
    },
    memoryTrick:
      "Tension headache counselling starts with stress and posture triggers, not drastic lifestyle rules.",
  },
  {
    id: 145,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    question: "Q145. Analgesics that could be recommended to GM include:",
    statements: ["1. co-codamol", "2. ibuprofen", "3. amitriptyline"],
    correct: "B",
    explanation:
      "Drugs that can be used to manage an acute attack include paracetamol, nonsteroidal analgesics (NSAIDs) such as ibuprofen and combination products such as co-codamol, which contains paracetamol and codeine.",
    explainCorrect:
      "Option B is correct because co-codamol and ibuprofen are suitable acute analgesic options, while amitriptyline is generally for prevention rather than immediate attack relief.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but amitriptyline is not the primary acute analgesic choice.",
      C: "This combination omits co-codamol and includes amitriptyline in the wrong role for an acute attack question.",
      D: "Statement 1 alone is incomplete because ibuprofen is also an accepted option.",
      E: "Statement 3 alone does not match the asked acute analgesic recommendations.",
    },
    memoryTrick:
      "Acute attack: use painkillers now; reserve amitriptyline for prevention.",
  },
  {
    id: 248,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    question: "Q248. The use of aspirin would not be recommended if GM:",
    statements: [
      "1. has hypertension",
      "2. has a history of gastric ulceration",
      "3. is breast-feeding",
    ],
    correct: "C",
    explanation:
      "Aspirin should not be recommended to GM if she has a history of gastric irritation or if she is breast-feeding.",
    explainCorrect:
      "Option C is correct because aspirin is avoided with prior gastric ulceration and during breastfeeding, while uncomplicated hypertension alone is not an absolute reason in this stem.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which is not the key exclusion point in this item.",
      B: "This includes statement 1 and misses statement 3, which is part of the correct pair.",
      D: "Statement 1 alone is insufficient; statements 2 and 3 drive the caution here.",
      E: "Statement 3 alone is incomplete because ulcer history also matters.",
    },
    memoryTrick: "Aspirin red flags here: ulcer history and breastfeeding.",
  },
  {
    id: 190,
    type: "match",
    category: "Endocrinology",
    question: "Q190. is associated with abnormal copper metabolism",
    options: [
      "phaeochromocytoma",
      "Cushing's disease",
      "cirrhosis",
      "Wilson's disease",
      "dysentry",
    ],
    correct: "Wilson's disease",
    explanation:
      "Wilson's disease is associated with abnormal copper metabolism.",
    explainCorrect:
      "Wilson's disease is correct because it is the classic inherited disorder of abnormal copper accumulation and metabolism.",
    wrongOptionExplanations: {
      phaeochromocytoma:
        "This is a catecholamine-secreting tumor, not a copper metabolism disorder.",
      "Cushing's disease":
        "This is hypercortisolism from ACTH-related pathology, not copper dysregulation.",
      cirrhosis:
        "Cirrhosis can occur for many reasons, but the specific copper metabolism disease is Wilson's.",
      dysentry:
        "Dysentery is an infectious gastrointestinal syndrome, unrelated to copper metabolism.",
    },
    memoryTrick: "Copper overload in exam stems points to Wilson.'",
  },
  {
    id: 110,
    type: "match",
    category: "Endocrinology",
    question:
      "Q110. is associated with accumulation of fat on the face, chest and upper back",
    options: [
      "phaeochromocytoma",
      "Cushing's disease",
      "cirrhosis",
      "Wilson's disease",
      "dysentry",
    ],
    correct: "Cushing's disease",
    explanation:
      "Cushing's disease is associated with fat redistribution affecting the face, chest, and upper back.",
    explainCorrect:
      "Cushing's disease is correct because glucocorticoid excess causes central fat redistribution, including moon face, truncal fullness, and upper-back fat pad.",
    wrongOptionExplanations: {
      phaeochromocytoma:
        "Typically causes episodic hypertension, palpitations, and sweating, not classic central fat redistribution.",
      cirrhosis:
        "Liver disease has different body-composition changes and does not classically produce Cushingoid fat pattern.",
      "Wilson's disease":
        "Wilson's is a copper-storage disorder and does not classically present with Cushingoid adiposity.",
      dysentry:
        "Dysentery causes acute bowel symptoms, not endocrine fat redistribution.",
    },
    memoryTrick: "Buffalo hump plus moon face equals Cushing pattern.",
  },
  {
    id: 7,
    type: "match",
    category: "Endocrinology",
    question:
      "Q7. is associated with hypersecretion of adrenaline and noradrenaline",
    options: [
      "phaeochromocytoma",
      "Cushing's disease",
      "cirrhosis",
      "Wilson's disease",
      "dysentry",
    ],
    correct: "phaeochromocytoma",
    explanation:
      "Phaeochromocytoma is associated with hypersecretion of adrenaline and noradrenaline.",
    explainCorrect:
      "Phaeochromocytoma is correct because it causes excess catecholamine secretion, especially adrenaline and noradrenaline.",
    wrongOptionExplanations: {
      "Cushing's disease":
        "This is cortisol excess rather than primary catecholamine excess.",
      cirrhosis:
        "Cirrhosis is chronic liver disease and does not cause adrenal catecholamine hypersecretion.",
      "Wilson's disease":
        "Wilson's is a copper metabolism disorder, not a catecholamine-secreting condition.",
      dysentry:
        "Dysentery is infectious bowel disease and unrelated to adrenal medullary hypersecretion.",
    },
    memoryTrick: "Adrenaline storms in stems suggest phaeochromocytoma.",
  },
  {
    id: 238,
    type: "match",
    category: "Electrolytes",
    question: "Q238. may occur as a result of hyperparathyroidism",
    options: [
      "hypernatraemia",
      "hyponatraemia",
      "hypercalcaemia",
      "hypocalcaemia",
      "hypokalaemia",
    ],
    correct: "hypercalcaemia",
    explanation: "Hyperparathyroidism can lead to hypercalcaemia.",
    explainCorrect:
      "Hypercalcaemia is correct because excess parathyroid hormone increases calcium release and reabsorption, raising serum calcium.",
    wrongOptionExplanations: {
      hypernatraemia:
        "Sodium elevation is not the hallmark electrolyte result of hyperparathyroidism.",
      hyponatraemia:
        "Low sodium is not the characteristic biochemical change in hyperparathyroidism.",
      hypocalcaemia:
        "This is the opposite of what excess parathyroid hormone typically causes.",
      hypokalaemia:
        "Potassium depletion is not the defining direct effect here.",
    },
    memoryTrick: "Hyper-parathyroid means hyper-calcium.",
  },
  {
    id: 175,
    type: "match",
    category: "Electrolytes",
    question: "Q175. may present with arrhythmias",
    options: [
      "hypernatraemia",
      "hyponatraemia",
      "hypercalcaemia",
      "hypocalcaemia",
      "hypokalaemia",
    ],
    correct: "hypokalaemia",
    explanation: "Hypokalaemia may present with cardiac arrhythmias.",
    explainCorrect:
      "Hypokalaemia is correct because low potassium destabilizes cardiac conduction and can present with arrhythmias.",
    wrongOptionExplanations: {
      hypernatraemia:
        "Sodium elevation can cause neurologic signs, but arrhythmia risk is most classically tied to potassium imbalance.",
      hyponatraemia:
        "Low sodium mainly causes cerebral symptoms rather than classic rhythm disturbance.",
      hypercalcaemia:
        "Calcium changes affect ECG, but hypokalaemia is the more typical arrhythmia-focused answer in this set.",
      hypocalcaemia:
        "This more often causes neuromuscular irritability than the classic arrhythmia pattern emphasized here.",
    },
    memoryTrick: "Low K, unstable rhythm.",
  },
  {
    id: 38,
    type: "match",
    category: "Electrolytes",
    question: "Q38. predisposes to digoxin toxicity",
    options: [
      "hypernatraemia",
      "hyponatraemia",
      "hypercalcaemia",
      "hypocalcaemia",
      "hypokalaemia",
    ],
    correct: "hypokalaemia",
    explanation: "Hypokalaemia predisposes patients to digoxin toxicity.",
    explainCorrect:
      "Hypokalaemia is correct because low potassium increases myocardial sensitivity to digoxin, raising toxicity risk.",
    wrongOptionExplanations: {
      hypernatraemia:
        "Sodium elevation is not the classic potentiator of digoxin toxicity.",
      hyponatraemia:
        "Low sodium does not directly drive digoxin sensitivity the way low potassium does.",
      hypercalcaemia:
        "Calcium can worsen digitalis effects, but this item's expected core answer is hypokalaemia.",
      hypocalcaemia:
        "Low calcium is not the typical electrolyte trigger for digoxin toxicity.",
    },
    memoryTrick: "Digoxin and low potassium is a danger pair.",
  },
  {
    id: 68,
    type: "combo",
    category: "Palliative Care",
    question: "Q68. Transdermal fentanyl:",
    statements: [
      "1. is used for pain relief",
      "2. contains a pure agonist for μ-opioid receptors",
      "3. provides long-lasting analgesic effect",
    ],
    correct: "A",
    explanation:
      "Fentanyl is a phenylpiperidine derivative and it is a potent opioid analgesic, which is a pure agonist of μ-opioid receptors.",
    explainCorrect:
      "Option A is correct because transdermal fentanyl is an analgesic, acts as a mu-opioid agonist, and provides sustained pain control.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but prolonged analgesic delivery is a key patch property.",
      C: "This omits statement 1, even though pain relief is the primary indication.",
      D: "Statement 1 alone is incomplete because receptor mechanism and long duration are also true.",
      E: "Statement 3 alone misses core pharmacologic and indication details.",
    },
    memoryTrick:
      "Fentanyl patch equals strong mu agonist plus steady long-acting pain relief.",
  },
  {
    id: 225,
    type: "combo",
    category: "Haematology",
    question:
      "Q225. Unexpected fluctuations in dose response in patients receiving warfarin may be attributed to:",
    statements: [
      "1. changes in vitamin K intake",
      "2. major changes in intake of salads and vegetables",
      "3. major changes in alcohol consumption",
    ],
    correct: "A",
    explanation:
      "Warfarin is an anticoagulant that acts by reducing the vitamin-K-dependent synthesis of coagulation factors in the liver.",
    explainCorrect:
      "Option A is correct because all three can alter warfarin response: vitamin K variation, major dietary greens changes, and alcohol pattern shifts.",
    wrongOptionExplanations: {
      B: "This excludes statement 3, but alcohol changes can significantly alter INR stability.",
      C: "This excludes statement 1, yet vitamin K consistency is central to stable warfarin control.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 also contribute.",
      E: "Statement 3 alone misses major diet-related vitamin K effects.",
    },
    memoryTrick:
      "Warfarin stability needs steady K intake and steady alcohol habits.",
  },
  {
    id: 16,
    type: "combo",
    category: "Psychiatry",
    question: "Q16. Clozapine has an affinity for:",
    statements: [
      "1. dopamine receptors",
      "2. serotonin receptors",
      "3. muscarinic receptors",
    ],
    correct: "A",
    explanation:
      "Clozapine is a dibenzodiazepine which is used as an atypical antipsychotic. It has activity as a dopamine-receptor blocker, an antiserotonergic, an antimuscarinic, an alpha-adrenergic blocker, and an antihistamine.",
    explainCorrect:
      "Option A is correct because clozapine has broad receptor activity including dopamine, serotonin, and muscarinic receptor affinity.",
    wrongOptionExplanations: {
      B: "This excludes statement 3, but clozapine has notable antimuscarinic activity.",
      C: "This excludes statement 1, yet dopamine receptor effects remain part of clozapine's profile.",
      D: "Statement 1 alone is incomplete given its multi-receptor actions.",
      E: "Statement 3 alone ignores clozapine's key dopaminergic and serotonergic actions.",
    },
    memoryTrick:
      "Clozapine is broad-spectrum at receptors, not single-pathway.",
  },
  {
    id: 274,
    type: "combo",
    category: "Immunology",
    question: "Q274. Ciclosporin:",
    statements: [
      "1. has an inhibitory effect on T-lymphocytes",
      "2. may cause a dose-dependent increase in serum creatinine during the first few weeks of treatment",
      "3. causes hyperlipidaemia",
    ],
    correct: "B",
    explanation:
      "Ciclosporin is a calcineurin inhibitor that is used as an immunosuppressant in organ and tissue transplantation.",
    explainCorrect:
      "Option B is correct because ciclosporin suppresses T-lymphocyte activation and can cause early dose-related creatinine rise, while statement 3 is not accepted in this item.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not counted as correct in this question.",
      C: "This omits statement 1, a core mechanism of ciclosporin.",
      D: "Statement 1 alone is incomplete because statement 2 is also true.",
      E: "Statement 3 alone is not the expected correct point here.",
    },
    memoryTrick: "Ciclosporin: T-cell block plus kidney-creatinine watch.",
  },
  {
    id: 308,
    type: "combo",
    category: "Cardiology",
    question:
      "Q308. When candesartan is started in the older person, recommended monitoring includes:",
    statements: ["1. plasma potassium", "2. bilirubin", "3. blood glucose"],
    correct: "D",
    explanation:
      "Candesartan is an angiotensin-II receptor antagonist. When candesartan is started in older persons, monitoring of plasma potassium concentration is recommended as hyperkalaemia may occur occasionally.",
    explainCorrect:
      "Option D (1 only) is correct because candesartan can increase potassium, so plasma potassium is the key listed monitoring parameter here.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not routine primary monitoring targets for starting candesartan.",
      B: "This includes bilirubin, which is not the key monitoring focus in this question.",
      C: "This includes blood glucose, which is not the required monitoring item in this stem.",
      E: "Statement 3 alone is not the relevant monitoring choice here.",
    },
    memoryTrick: "Start ARB, check K.",
  },
  {
    id: 39,
    type: "combo",
    category: "Oncology",
    question: "Q39. Prostate cancer:",
    statements: [
      "1. testosterone replacement therapy is the mainstay of treatment",
      "2. growth is androgen-dependent",
      "3. may be diagnosed by prostate-specific antigen screening",
    ],
    correct: "C",
    explanation:
      "Prostate cancer is a slowly progressive adenocarcinoma of the prostate gland. It is detected by prostate-speciﬁc antigen test and digital rectal examination.",
    explainCorrect:
      "Option C is correct because prostate cancer growth is androgen dependent and PSA-based screening/detection is used, while testosterone replacement is not treatment mainstay.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which is incorrect in prostate-cancer management.",
      B: "This includes statement 1 and misses statement 3, which is true.",
      D: "Statement 1 alone is incorrect because it promotes androgenic stimulation rather than control.",
      E: "Statement 3 alone is true but incomplete without statement 2.",
    },
    memoryTrick: "Prostate cancer: androgen-driven, PSA-detected.",
  },
  {
    id: 108,
    type: "combo",
    category: "Oncology",
    question: "Q108. Ondansetron:",
    statements: [
      "1. may be administered with dexamethasone",
      "2. is the drug of first choice in managing delayed chemotherapy-induced nausea and vomiting",
      "3. is used prophylactically for motion sickness",
    ],
    correct: "D",
    explanation:
      "Ondansetron is a 5-HT 3 antagonist which acts as an anti-emetic by blocking serotonergic receptors in the gastrointestinal tract and in the central nervous system.",
    explainCorrect:
      "Option D (1 only) is correct because ondansetron is often combined with dexamethasone, but it is not first-line for delayed CINV and not used for motion-sickness prophylaxis.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not correct in this context.",
      B: "This includes statement 2, but delayed CINV control is usually centered on other regimens.",
      C: "This includes statement 3, but ondansetron is not the standard prophylactic motion-sickness choice.",
      E: "Statement 3 alone is incorrect in this item.",
    },
    memoryTrick:
      "Ondansetron: chemo antiemetic partner, not motion-sickness drug.",
  },
  {
    id: 210,
    type: "combo",
    category: "Oncology",
    question:
      "Q210. Dose reduction and delays in administration of planned cytotoxic chemotherapy are caused by:",
    statements: ["1. alopecia", "2. extravasation", "3. leucopenia"],
    correct: "E",
    explanation:
      "Cytotoxic drugs cause damage to normal cells, particularly where normal cell division is fairly rapid, including hair follicles, resulting in alopecia and bonemarrow suppression.",
    explainCorrect:
      "Option E (3 only) is correct because leucopenia/neutropenia is a major reason to delay or reduce cytotoxic chemotherapy doses for safety.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, which are not the standard systemic marrow-based trigger for planned cycle delay.",
      B: "This includes statement 1, but alopecia alone usually does not dictate dose delay.",
      C: "This includes statement 2, which is an acute administration complication rather than the classic cycle-delay lab criterion.",
      D: "Statement 1 alone is not the key driver for delaying planned chemotherapy.",
    },
    memoryTrick:
      "Chemo schedule is blood-count driven: low white cells stop the next cycle.",
  },
  {
    id: 165,
    type: "combo",
    category: "Respiratory",
    question: "Q165. Spirometry measures:",
    statements: [
      "1. forced expiratory volume",
      "2. forced vital capacity",
      "3. total lung capacity",
    ],
    correct: "B",
    explanation:
      "In spirometry, the patient is asked to inhale and then to exhale as rapidly as possible into a spirometer, which records the volume of air exiting the lungs.",
    explainCorrect:
      "Option B is correct because spirometry measures FEV and FVC, whereas total lung capacity requires different lung-volume techniques.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but TLC is not directly measured by simple spirometry.",
      C: "This includes statement 3 and misses statement 1.",
      D: "Statement 1 alone is incomplete because FVC is also measured.",
      E: "Statement 3 alone is incorrect for standard spirometry.",
    },
    memoryTrick:
      "Spirometry gives flow-volume outputs, not full lung-capacity totals.",
  },
  {
    id: 221,
    type: "combo",
    category: "Infectious Diseases",
    question: "Q221. Methicillin-resistant Staphylococcus aureus:",
    statements: [
      "1. is a cause of nosocomial infections",
      "2. spreading of infection may be reduced by alcohol hand rubs",
      "3. presents an economic issue to institutions",
    ],
    correct: "A",
    explanation:
      "Methicillin-resistant Staphylococcus aureus (MRSA) strains are resistant to a number of antibacterial drugs.",
    explainCorrect:
      "Option A is correct because MRSA causes healthcare-associated infections, transmission control improves with hand hygiene, and outbreaks increase institutional costs.",
    wrongOptionExplanations: {
      B: "This excludes statement 3, but economic burden is a real consequence of MRSA control needs.",
      C: "This excludes statement 1, yet nosocomial infection is a core MRSA concern.",
      D: "Statement 1 alone is true but incomplete because statements 2 and 3 are also true.",
      E: "Statement 3 alone misses key infection-control and epidemiologic points.",
    },
    memoryTrick: "MRSA affects wards, workflow, and wallet.",
  },
  {
    id: 78,
    type: "combo",
    category: "Laboratory Medicine",
    question: "Q78. Alanine aminotransferase:",
    statements: [
      "1. is found predominantly in the liver",
      "2. levels are significantly decreased in viral hepatitis",
      "3. is never released into the bloodstream",
    ],
    correct: "D",
    explanation:
      "Alanine aminotransferase (ALT) is an enzyme that is found mainly in the liver with lower amounts also present in the kidneys, heart and skeletal muscle.",
    explainCorrect:
      "Option D (1 only) is correct because ALT is mainly hepatic, rises rather than falls in viral hepatitis, and is released into blood with hepatocellular injury.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, both of which are incorrect in this item.",
      B: "This includes statement 2, but viral hepatitis typically elevates ALT.",
      C: "This includes statement 3, which is false because ALT is measurable in serum.",
      E: "Statement 3 alone is clearly incorrect.",
    },
    memoryTrick: "ALT: liver enzyme that leaks up, not down, in hepatitis.",
  },
  {
    id: 310,
    type: "combo",
    category: "Endocrinology",
    question: "Q310. Aldosterone:",
    statements: [
      "1. production is regulated primarily by the liver",
      "2. levels are decreased by low-sodium diets",
      "3. is produced by the adrenal cortex",
    ],
    correct: "E",
    explanation:
      "Aldosterone is a mineralcorticoid hormone which is produced by the adrenal cortex with action in the renal tubule resulting in sodium and water retention and potassium secretion in urine.",
    explainCorrect:
      "Option E (3 only) is correct because aldosterone is produced by the adrenal cortex. Its secretion is not primarily controlled by the liver, and low-sodium intake tends to stimulate rather than suppress aldosterone release.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, both incorrect in this context.",
      B: "Statements 1 and 2 are both false for aldosterone physiology.",
      C: "Includes statement 2, which is false because low sodium usually raises aldosterone.",
      D: "Statement 1 alone is false; the liver is not the primary regulator.",
    },
    memoryTrick:
      "Aldosterone is adrenal and answers low sodium with more salt-retaining drive.",
  },
  {
    id: 194,
    type: "combo",
    category: "Nephrology",
    question: "Q194. Proteinuria:",
    statements: [
      "1. is an indicator of renal disease",
      "2. may be an indicator of pre-eclampsia",
      "3. 24-h urine specimen collection could be recommended if proteinuria is significant",
    ],
    correct: "A",
    explanation:
      "Occurrence of protein in urine (proteinuria) is an indicator of renal disease, as normally protein is not present in urine because it cannot pass through the glomerular membrane in the renal tubules.",
    explainCorrect:
      "Option A is correct because proteinuria indicates possible renal pathology, can signal pre-eclampsia in pregnancy, and significant findings often warrant 24-hour quantification.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but quantification can be necessary when proteinuria is significant.",
      C: "This omits statement 1, the foundational meaning of proteinuria in renal assessment.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also valid.",
      E: "Statement 3 alone misses the core diagnostic implications of proteinuria.",
    },
    memoryTrick:
      "Protein in urine is never casual: think kidney cause, pregnancy risk, and quantify.",
  },
  {
    id: 253,
    type: "combo",
    category: "Endocrinology",
    question: "Q253. Patients with type I diabetes should be advised:",
    statements: [
      "1. to self-monitor blood glucose",
      "2. to have access to a source of fast sugars",
      "3. to avoid participating in sport",
    ],
    correct: "B",
    explanation:
      "Type I diabetes usually occurs in young people and is characterised by an inability of the beta-cells in the pancreas to produce insulin.",
    explainCorrect:
      "Option B is correct because type 1 diabetes self-care includes glucose self-monitoring and carrying rapid sugar for hypoglycaemia; sport is not universally avoided.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but physical activity is generally encouraged with proper glucose planning.",
      C: "This includes statement 3 and misses statement 1, which is essential self-management.",
      D: "Statement 1 alone is incomplete because emergency fast-sugar access is also key advice.",
      E: "Statement 3 alone is incorrect and unsafe as blanket advice.",
    },
    memoryTrick:
      "Type 1 routine: check glucose, carry quick sugar, keep active safely.",
  },
  {
    id: 211,
    type: "combo",
    category: "Haematology",
    question: "Q211. When aspirin is compared with warfarin, it:",
    statements: [
      "1. decreases platelet aggregation",
      "2. has higher rates of major haemorrhage",
      "3. requires the same degree of monitoring",
    ],
    correct: "D",
    explanation:
      "Aspirin is an antiplatelet drug that decreases platelet aggregation, whereas warfarin is an oral anticoagulant that antagonises the effects of vitamin K.",
    explainCorrect:
      "Option D (1 only) is correct because aspirin inhibits platelet aggregation, while warfarin usually carries higher major-bleed concern and requires closer INR monitoring than aspirin.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not correct when comparing aspirin with warfarin.",
      B: "This includes statement 2, but aspirin does not have higher major-haemorrhage rates than warfarin in this context.",
      C: "This includes statement 3, but aspirin does not require warfarin-level routine monitoring.",
      E: "Statement 3 alone is incorrect in this comparison.",
    },
    memoryTrick:
      "Aspirin is platelet-focused and monitoring-light versus warfarin.",
  },
  {
    id: 61,
    type: "combo",
    category: "Gastroenterology",
    question: "Q61. Patients with gallstone disease:",
    statements: [
      "1. present with visceral pain in the abdomen",
      "2. report precipitation of the condition with fatty meals",
      "3. are referred for a gastroscopy",
    ],
    correct: "B",
    explanation:
      "Gallstones consist of cholesterol or bile and are usually asymptomatic. During an acute attack patients usually present with biliary colic that is represented with severe, episodic visceral pain in the abdomen.",
    explainCorrect:
      "Option B is correct because gallstones can cause biliary colic abdominal visceral pain that is often meal-related, especially after fatty food; gastroscopy is not the routine first referral test.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not the typical diagnostic pathway for gallstone disease.",
      C: "This includes statement 3 and omits statement 1, which is true.",
      D: "Statement 1 alone is incomplete because statement 2 is also true.",
      E: "Statement 3 alone is not correct for standard gallstone assessment.",
    },
    memoryTrick:
      "Gallstones classically hurt after fatty meals and are assessed with biliary-focused imaging, not gastroscopy.",
  },
  {
    id: 79,
    type: "combo",
    category: "Respiratory",
    question: "Q79. Sleep apnoea:",
    statements: [
      "1. is associated with cessation of breathing for at least 5 minutes during sleep",
      "2. occurs more commonly in obese patients",
      "3. presents with snoring",
    ],
    correct: "C",
    explanation:
      "Sleep apnoea is characterised during sleep by periods of cessation of breathing ranging from 10 seconds to 3 minutes.",
    explainCorrect:
      "Option C is correct because sleep apnoea is more common with obesity and often presents with snoring, while breathing pauses are typically seconds to a few minutes, not at least 5 minutes.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which overstates the usual duration criterion.",
      B: "This includes statement 1 and misses statement 3, which is a classic symptom.",
      D: "Statement 1 alone is incorrect in this stem.",
      E: "Statement 3 alone is true but incomplete because statement 2 is also true.",
    },
    memoryTrick:
      "Sleep apnoea: snoring plus obesity risk; apnoea is measured in seconds, not five-minute blocks.",
  },
  {
    id: 160,
    type: "combo",
    category: "Clinical Pharmacology",
    question: "Q160. Potential beneficial effects of cannabis include:",
    statements: ["1. anti-emetic", "2. analgesia", "3. appetite suppressant"],
    correct: "B",
    explanation:
      "Cannabis is in many countries an illegal drug and may not have approval for medicinal use. It has analgesic, muscle relaxant and appetite stimulant effects.",
    explainCorrect:
      "Option B is correct because recognised potential therapeutic effects include anti-emesis and analgesia, whereas appetite suppression is opposite to the usual appetite-stimulating effect.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is opposite to the expected appetite effect.",
      C: "This includes statement 3 and omits statement 1, which is accepted.",
      D: "Statement 1 alone is incomplete because statement 2 is also accepted.",
      E: "Statement 3 alone is incorrect in this item.",
    },
    memoryTrick:
      "Medicinal-cannabis stems often pair pain and nausea benefit, not appetite loss.",
  },
  {
    id: 60,
    type: "combo",
    category: "Cardiology",
    question: "Q60. Drugs that may cause hypertension include:",
    statements: [
      "1. corticosteroids",
      "2. phenothiazines",
      "3. alpha-adrenoceptor blockers",
    ],
    correct: "D",
    explanation:
      "Corticosteroids have mineralcorticoid effects that result in sodium and water retention, which leads to hypertension.",
    explainCorrect:
      "Option D (1 only) is correct because corticosteroids can raise blood pressure via fluid and sodium retention; phenothiazines and alpha-blockers are more associated with lowering blood pressure.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not hypertension-causing in this context.",
      B: "This includes statement 2, but phenothiazines more often cause hypotension.",
      C: "This includes statement 3, but alpha-blockers are antihypertensive agents.",
      E: "Statement 3 alone is opposite to the question target.",
    },
    memoryTrick: "Steroids can push pressure up; alpha-blockers pull it down.",
  },
  {
    id: 35,
    type: "combo",
    category: "Haematology",
    question: "Q35. Patients receiving oral iron tablets should be advised:",
    statements: [
      "1. to take the preparation with food",
      "2. that stools may be black-coloured",
      "3. to rinse their mouth after drug administration",
    ],
    correct: "B",
    explanation:
      "Iron tablets may cause gastrointestinal irritation and patient may complain of nausea and epigastric pain.",
    explainCorrect:
      "Option B is correct because oral iron can be taken with food to reduce GI irritation and commonly causes dark stools; mouth rinsing is advice for liquid preparations, not tablets.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not routine counselling for iron tablets.",
      C: "This includes statement 3 and omits statement 1, which is acceptable advice.",
      D: "Statement 1 alone is incomplete because black stools warning is also important.",
      E: "Statement 3 alone is not the correct counselling focus for tablets.",
    },
    memoryTrick:
      "Iron tablets: food can help tolerance, and dark stools are expected.",
  },
  {
    id: 144,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    caseBlock:
      "SN is a 25-year-old female admitted with exacerbation of asthma. PMH: asthma. DH: salbutamol inhaler and beclometasone inhaler. On admission she had chest tightness, exhaustion, pulse >110 bpm, and respiratory rate >25 breaths/min. Initial hospital therapy included oxygen 60%, salbutamol nebuliser, IV hydrocortisone, IV cefuroxime, clarithromycin tablets, and beclometasone inhaler. After 24 hours, hydrocortisone was stopped, prednisolone tablets started, and salbutamol nebuliser frequency reduced.",
    question:
      "Q144. In an asthmatic attack the following condition(s) occur(s)",
    statements: [
      "1. bronchospasm",
      "2. increased airways resistance",
      "3. inflammation",
    ],
    correct: "A",
    explanation:
      "An asthmatic attack may be precipitated by various factors such as allergens (e. g.",
    explainCorrect:
      "Option A is correct because acute asthma involves bronchospasm, increased airway resistance, and airway inflammation together.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but inflammation is central to asthma pathophysiology.",
      C: "This omits statement 1, but bronchospasm is a key acute feature.",
      D: "Statement 1 alone is incomplete because resistance and inflammation also occur.",
      E: "Statement 3 alone misses important mechanical airflow changes.",
    },
    memoryTrick: "Asthma attack triad: spasm, swelling, and narrowed airflow.",
  },
  {
    id: 118,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question:
      "Q118. Inflammatory mediators that are released in an asthmatic attack include:",
    statements: ["1. histamine", "2. leukotrienes", "3. prostaglandins"],
    correct: "A",
    explanation:
      "In an acute attack there is an increase of eosinophils in the bronchial epithelium releasing proteins and neurotoxins which damage the epithelium.",
    explainCorrect:
      "Option A is correct because histamine, leukotrienes, and prostaglandins are all relevant inflammatory mediators in asthma exacerbations.",
    wrongOptionExplanations: {
      B: "This omits statement 3, which is also part of mediator release in attacks.",
      C: "This omits statement 1, but histamine is a recognised mediator in airway inflammation.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also true.",
      E: "Statement 3 alone ignores the broader mediator cascade.",
    },
    memoryTrick:
      "Asthma mediator stack includes histamine, leukotrienes, and prostaglandins.",
  },
  {
    id: 305,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q305. Drugs that may provoke an asthmatic attack in SN include:",
    statements: ["1. diclofenac", "2. atenolol", "3. timolol"],
    correct: "A",
    explanation:
      "Drugs that induce bronchospasm may provoke an asthmatic attack in patients with asthma. SN should be advised to avoid using non-steroidal anti-inﬂammatory drugs (NSAIDs) such as diclofenac as they may provoke an asthma attack.",
    explainCorrect:
      "Option A is correct because NSAIDs and beta-blockers (including some beta1-selective or ophthalmic forms) can provoke bronchospasm in susceptible asthmatic patients.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but timolol can trigger bronchospasm even when used as eye drops.",
      C: "This omits statement 1, yet NSAIDs are classic asthma-provocation drugs in sensitive patients.",
      D: "Statement 1 alone is incomplete because beta-blocker exposure can also precipitate attacks.",
      E: "Statement 3 alone is incomplete since the other listed agents may also trigger symptoms.",
    },
    memoryTrick: "Asthma drug triggers to remember: NSAIDs and beta-blockers.",
  },
  {
    id: 309,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question:
      "Q309. Signs and symptoms in SN of an acute severe asthma attack include:",
    statements: ["1. tachycardia", "2. tachypnoea", "3. exhaustion"],
    correct: "A",
    explanation:
      "On examination SN had rapid heart rate (tachycardia). During an acute attack patients suffer from dyspnoea and with increasing severity of the attack they become anxious, which also increases their heart rate.",
    explainCorrect:
      "Option A is correct because acute severe asthma commonly presents with tachycardia, tachypnoea, and exhaustion as respiratory work increases.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but exhaustion is a key severity sign.",
      C: "This omits statement 1, while tachycardia is common in severe attacks.",
      D: "Statement 1 alone is incomplete because rapid breathing and fatigue are also expected.",
      E: "Statement 3 alone misses major cardiorespiratory signs.",
    },
    memoryTrick:
      "Severe asthma red flags: fast pulse, fast breathing, and tiring out.",
  },
  {
    id: 164,
    type: "single",
    category: "Respiratory",
    caseId: "t3_case1",
    question:
      "Q164. Salbutamol nebuliser is used in combination with oxygen because:",
    options: [
      "it may mask symptom severity",
      "aggressive treatment is required",
      "the dose is lower than administered by inhaler",
      "it may cause hypovolaemia",
      "it may cause arterial hypoxaemia",
    ],
    correct: "it may cause arterial hypoxaemia",
    explanation:
      "Nebulised salbutamol can worsen arterial oxygenation, so oxygen is co-administered in severe attacks.",
    explainCorrect:
      "The correct answer is arterial hypoxaemia because high-dose nebulised beta2-agonists can transiently worsen ventilation-perfusion mismatch, so oxygen is co-administered in severe attacks.",
    wrongOptionExplanations: {
      "it may mask symptom severity":
        "Nebulised salbutamol is used to reverse bronchospasm; this is not the core reason oxygen is paired with it.",
      "aggressive treatment is required":
        "Severity justifies intensive treatment, but this does not explain the specific oxygen-nebuliser pairing mechanism.",
      "the dose is lower than administered by inhaler":
        "Nebuliser dosing in severe attack is not lower by default and this does not explain oxygen co-use.",
      "it may cause hypovolaemia":
        "Salbutamol does not cause clinically relevant hypovolaemia as the rationale for oxygen combination.",
    },
    memoryTrick:
      "Nebulised beta2 in severe asthma: bronchodilate, but protect oxygenation.",
  },
  {
    id: 66,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q66. Parameters that require monitoring in SN include:",
    statements: [
      "1. urinary flow",
      "2. blood gases",
      "3. plasma-potassium concentration",
    ],
    correct: "C",
    explanation:
      "As soon as SN is hospitalised, peak expiratory ﬂow rate, blood gases and serum electrolytes should be measured.",
    explainCorrect:
      "Option C is correct because blood gases and plasma potassium are key acute-monitoring parameters in severe asthma management; urinary flow is not a primary asthma severity marker.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which is not a core acute asthma monitoring parameter in this context.",
      B: "This includes statement 1 and misses statement 3, while potassium monitoring is important with beta2-agonist therapy.",
      D: "Statement 1 alone is not sufficient for acute attack monitoring priorities.",
      E: "Statement 3 alone is incomplete because blood gases are also essential.",
    },
    memoryTrick: "Severe asthma checks: gases and potassium first.",
  },
  {
    id: 300,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question:
      "Q300. If SN’s condition does not improve after 30 minutes, the following may be added to the drug therapy:",
    statements: [
      "1. nebulised ipratropium",
      "2. intravenous aminophylline",
      "3. nebulised amoxicillin",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because escalation in non-improving acute asthma may include nebulized ipratropium and intravenous aminophylline, while nebulized amoxicillin has no role.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not an inhaled rescue strategy.",
      C: "Includes statement 3 and misses ipratropium from statement 1.",
      D: "Only statement 1 is incomplete if escalation requires additional bronchodilator support.",
      E: "Only statement 3 is inappropriate in this acute airway setting.",
    },
    memoryTrick:
      "Asthma rescue add-ons are bronchodilators, not nebulized antibiotics.",
    explanation:
      "SN has been administered hydrocortisone by intravenous injection which, together with the oxygen and the nebulised salbutamol, is aimed to improve respiration and pulse within 30 minutes.",
  },
  {
    id: 34,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q34. Cefuroxime is:",
    statements: [
      "1. also available for oral administration",
      "2. active against Haemophilus influenzae",
      "3. highly effective against Gram-negative bacteria",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because cefuroxime has oral formulations and is active against Haemophilus influenzae, but it is not best described as highly effective broad Gram-negative coverage.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which overstates cefuroxime Gram-negative potency.",
      C: "Includes statement 3 and omits oral availability.",
      D: "Only statement 1 is incomplete because H. influenzae activity is also relevant.",
      E: "Only statement 3 is not the best descriptor here.",
    },
    memoryTrick:
      "Cefuroxime is a middle-spectrum cephalosporin: oral option with H. influenzae cover.",
    explanation:
      "Cefuroxime is a second-generation cephalosporin that is active against Grampositive cocci and against beta-lactamase-producing strains of Haemophilus inﬂuenzae and Neisseria gonorrhoeae.",
  },
  {
    id: 132,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q132. Clarithromycin:",
    statements: [
      "1. is a macrolide",
      "2. achieves lower tissue concentrations than erythromycin",
      "3. has poor activity against Haemophilus influenzae",
    ],
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because clarithromycin is a macrolide; it generally achieves better tissue levels than erythromycin and has useful activity against Haemophilus influenzae.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, both opposite to typical clarithromycin properties.",
      B: "Includes statement 2, which is incorrect because tissue concentrations are not lower.",
      C: "Includes statements 2 and 3 and misses the single true statement format.",
      E: "Statement 3 alone is incorrect in this context.",
    },
    memoryTrick:
      "Clarithromycin is the upgraded erythromycin: better levels and better H. influenzae coverage.",
    explanation:
      "Clarithromycin is a macrolide that is derived from erythromycin. Compared with erythromycin, clarithromycin is better absorbed from the gastrointestinal tract, it achieves higher tissue concentrations and has enhanced activity against Haemophilus inﬂuenzae.",
  },
  {
    id: 273,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q273. Intravenous hydrocortisone is indicated in SN:",
    statements: [
      "1. to avoid anaphylactic shock",
      "2. for its mineralcorticoid effects",
      "3. to inhibit the production and release of pro-inflammatory agents",
    ],
    correct: "E",
    explanation:
      "Hydrocortisone is a glucocorticoid drug. It stimulates the synthesis of lipocortin, which inhibits the production and release of intrinsic agents that are associated with inflammation such as phospholipase A2, prostaglandins and leukotrienes.",
    explainCorrect:
      "Option E (3 only) is correct because intravenous hydrocortisone is used for its anti-inflammatory glucocorticoid action, including suppression of inflammatory mediator production.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, both not the main rationale in this scenario.",
      B: "Statements 1 and 2 do not represent the core indication here.",
      C: "Includes statement 2, but mineralocorticoid effect is not the target benefit.",
      D: "Statement 1 alone is not the keyed reason for use in this setting.",
    },
    memoryTrick:
      "In acute airway inflammation, hydrocortisone is for inflammation control, not salt effects.",
  },
  {
    id: 80,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q80. Prednisolone:",
    statements: [
      "1. should replace beclometasone inhaler",
      "2. suppresses cortisol secretion",
      "3. has predominantly glucocorticoid activity",
    ],
    correct: "C",
    explainCorrect:
      "Option C (2 and 3 only) is correct because systemic prednisolone suppresses endogenous cortisol feedback and has predominantly glucocorticoid activity; it should not replace maintenance inhaled beclometasone long term.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not correct as a routine substitution principle.",
      B: "Includes statement 1 and omits statement 3.",
      D: "Only statement 1 is not the correct therapeutic message.",
      E: "Only statement 3 is incomplete because systemic steroids also suppress cortisol secretion.",
    },
    memoryTrick:
      "Oral prednisolone is systemic and glucocorticoid-dominant, not a routine inhaler replacement.",
    explanation:
      "Prednisolone is an oral glucocortioid that is given instead of intravenous hydrocortisone. It has predominantly glucocorticoid activity.",
  },
  {
    id: 288,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q288. When administering prednisolone:",
    statements: [
      "1. it should be taken after food",
      "2. enteric-coated formulation is preferred",
      "3. dose should be divided into twice daily administration",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because prednisolone is better tolerated after food and enteric-coated forms can reduce upper GI irritation; routine divided twice-daily dosing is usually unnecessary.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not standard for routine prednisolone courses.",
      C: "Includes statement 3 and omits statement 1.",
      D: "Only statement 1 is incomplete because formulation choice can also improve GI tolerability.",
      E: "Only statement 3 is not the key administration advice.",
    },
    memoryTrick:
      "Prednisolone stomach protection: take after food and prefer gentler GI formulation.",
    explanation:
      "Oral prednisolone may cause dyspepsia and oesophageal and peptic ulceration. Occurrence of these side-effects is reduced by administering the drug after food and by using an enteric-coated formulation.",
  },
  {
    id: 172,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q172. Nebulisers:",
    statements: [
      "1. are devices producing an aerosol from an aqueous solution",
      "2. should be washed out to avoid microbial growth",
      "3. salbutamol injection solution is used to administer salbutamol by nebulisation",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because nebulizers convert liquid solution to aerosol and require cleaning to reduce contamination risk; salbutamol injection solution is not the routine preparation for nebulization.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not standard nebulized drug sourcing practice.",
      C: "Includes statement 3 and misses device hygiene considerations.",
      D: "Only statement 1 is incomplete without maintenance cleaning advice.",
      E: "Only statement 3 is not the correct practical guidance.",
    },
    memoryTrick:
      "Nebulizer basics are aerosol plus hygiene; use the right inhalation formulation.",
    explanation:
      "Nebulisers are medical devices that are used to convert a solution to an aerosol. They can deliver higher doses compared with a metered-dose inhaler.",
  },
  {
    id: 206,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q206. Beclometasone inhaler:",
    statements: [
      "1. is more effective than budesonide",
      "2. may be used to control an attack",
      "3. may cause oral candidiasis",
    ],
    correct: "E",
    explainCorrect:
      "Option E (3 only) is correct because inhaled beclometasone may cause oral candidiasis; it is not more effective than budesonide and is not used to terminate an acute attack.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, both incorrect in this inhaled corticosteroid context.",
      B: "Statements 1 and 2 are not accurate for beclometasone use.",
      C: "Includes statement 2, but inhaled corticosteroids are controllers, not rescue therapy.",
      D: "Statement 1 alone is incorrect because efficacy versus budesonide is generally comparable.",
    },
    memoryTrick: "Beclometasone prevents attacks; rinse mouth to avoid thrush.",
    explanation:
      "Beclometasone is a corticosteroid that is being administered to SN as a metered-dose inhaler. Beclometasone and budesonide are equally effective in the management of asthma and they are used as prophylactic therapy to reduce airway inﬂammation.",
  },
  {
    id: 257,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question:
      "Q257. Long-term inhalation of high doses of beclometasone may predispose patients to:",
    statements: ["1. osteoporosis", "2. hoarseness", "3. hypertension"],
    correct: "B",
    explanation:
      "With long-term inhalation of high doses of beclometasone (greater than 800 μg daily), patients are predisposed to the occurrence of adrenal suppression, osteoporosis, hoarseness and glaucoma.",
    explainCorrect:
      "Option B is correct because long-term high-dose inhaled beclometasone can contribute to osteoporosis and local laryngeal effects like hoarseness; hypertension is not a typical listed long-term ICS effect here.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not the expected adverse effect in this item.",
      C: "This includes statement 3 and omits statement 1, which is true.",
      D: "Statement 1 alone is incomplete because hoarseness is also a recognized risk.",
      E: "Statement 3 alone is not correct in this stem.",
    },
    memoryTrick: "High-dose inhaled steroid: think bone and voice.",
  },
  {
    id: 271,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q271. Salmeterol:",
    statements: [
      "1. is longer-acting than salbutamol",
      "2. may be used in combination with beclomethasone",
      "3. could replace salbutamol use",
    ],
    correct: "B",
    explanation:
      "Salmeterol is a long-acting beta 2 agonist with a duration of action of about 12 h. Onset of action occurs within 10 to 20 minutes of administration by inhalation but the maximum effect is not achieved until regular administration of successive doses.",
    explainCorrect:
      "Option B is correct because salmeterol is longer-acting than salbutamol and is commonly used with inhaled corticosteroids, but it does not replace a fast-acting reliever for acute symptoms.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is incorrect because reliever therapy is still needed.",
      C: "This includes statement 3 and omits statement 1, which is true.",
      D: "Statement 1 alone is incomplete because combination with inhaled steroid is also correct.",
      E: "Statement 3 alone is incorrect for asthma rescue planning.",
    },
    memoryTrick: "LABA adds control, SABA stays as rescue.",
  },
  {
    id: 162,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question:
      "Q162. SN could be counselled on signs indicating exacerbation of the condition. She could be advised to report:",
    statements: [
      "1. decrease in exercise tolerance",
      "2. increased requirements for salbutamol inhaler",
      "3. increasing peak expiratory flow",
    ],
    correct: "B",
    explanation:
      "SN should be advised to monitor for signs that indicate an exacerbation of her condition. She should be advised to report any decrease in exercise tolerance, increased requirements for salbutamol inhaler, and any decrease in peak expiratory ﬂow rate immediately so that her medication may be adjusted so as to avoid the development of an acute, severe attack.",
    explainCorrect:
      "Option B is correct because worsening asthma control is signaled by reduced exercise tolerance and increased salbutamol need, whereas increasing peak flow suggests improvement, not exacerbation.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but rising peak flow is not a warning sign of worsening attack.",
      C: "This includes statement 3 and omits statement 1, which is a true warning indicator.",
      D: "Statement 1 alone is incomplete because increased reliever use is also an important deterioration marker.",
      E: "Statement 3 alone is opposite to the deterioration pattern.",
    },
    memoryTrick:
      "Asthma worsening means less tolerance, more reliever, and falling (not rising) peak flow.",
  },
  {
    id: 129,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    caseBlock:
      "GL is a 63-year-old obese male with diabetes, hypertension, ischaemic heart disease, and previous myocardial infarction. He presented with acute chest pain radiating to throat and left arm, sweating, breathlessness, and pulse 140 bpm. He was diagnosed with unstable angina and treated with subcutaneous heparin and isosorbide dinitrate infusion. On discharge, simvastatin 20 mg nocte and a glyceryl trinitrate patch were added.",
    question: "Q129. Which signs and symptoms in GL suggest an angina attack?",
    statements: ["1. tachycardia", "2. sweating", "3. breathlessness"],
    correct: "A",
    explanation:
      "Ischaemic heart disease may present with symptoms of angina or develop a myocardial infarction.",
    explainCorrect:
      "Option A is correct because tachycardia, sweating, and breathlessness are all compatible autonomic and cardiorespiratory features of acute angina/acute coronary syndrome presentation.",
    wrongOptionExplanations: {
      B: "This excludes statement 3, but breathlessness is a common accompanying symptom in ischemic episodes.",
      C: "This excludes statement 1, yet tachycardia can occur in painful acute episodes.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also relevant.",
      E: "Statement 3 alone misses other typical associated features.",
    },
    memoryTrick:
      "Angina attack often combines pain with sweat, shortness of breath, and pulse rise.",
  },
  {
    id: 250,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question:
      "Q250. During an angina attack investigations that are indicated include:",
    statements: ["1. ECG", "2. blood pressure", "3. coronary angiography"],
    correct: "B",
    explanation:
      "Diagnosis is based on past medical history and on the presenting symptoms. An electrocardiogram during an attack will conﬁrm diagnosis by indicating an ST-segment depression.",
    explainCorrect:
      "Option B is correct because ECG and blood pressure are immediate bedside assessments during an attack, while coronary angiography is usually a subsequent specialist investigation, not first-line at initial attack assessment.",
    wrongOptionExplanations: {
      A: "This includes statement 3 as immediate investigation, which is not the first acute step in most settings.",
      C: "This includes statement 3 and omits statement 1, which is essential in acute ischemic assessment.",
      D: "Statement 1 alone is incomplete because blood pressure monitoring is also required.",
      E: "Statement 3 alone is not the primary immediate attack investigation.",
    },
    memoryTrick:
      "Acute chest pain starts with monitor-and-ECG before invasive imaging.",
  },
  {
    id: 86,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q86. In GL the goals of treatment include:",
    statements: [
      "1. to reduce symptoms",
      "2. to improve exercise capacity",
      "3. to reduce the risk of a heart attack",
    ],
    correct: "A",
    explanation:
      "In GL the goals of treatment are to reduce the symptoms of chest pain, breathlessness and tachycardia.",
    explainCorrect:
      "Option A is correct because angina management aims to reduce symptoms, improve functional capacity, and lower future myocardial infarction risk.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but risk reduction is a core treatment goal.",
      C: "This omits statement 1, while symptom control remains central.",
      D: "Statement 1 alone is incomplete because exercise capacity and risk outcomes are also treatment targets.",
      E: "Statement 3 alone misses immediate symptomatic and functional goals.",
    },
    memoryTrick:
      "Angina goals are now, next activity, and next event prevention.",
  },
  {
    id: 21,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q21. On admission, therapeutic management of GL should aim to:",
    statements: [
      "1. reduce cardiac oxygen demand",
      "2. provide antithrombotic therapy",
      "3. provide antiplatelet therapy",
    ],
    correct: "A",
    explanation:
      "During the management of an acute attack of angina, pharmacotherapy is used to reduce oxygen demand and to improve oxygen supply.",
    explainCorrect:
      "Option A is correct because acute unstable-angina care targets oxygen-demand reduction and antithrombotic/antiplatelet strategies to limit ongoing ischemic risk.",
    wrongOptionExplanations: {
      B: "This excludes statement 3, but antiplatelet therapy is a core part of acute coronary management.",
      C: "This excludes statement 1, yet reducing myocardial oxygen demand remains immediate therapy focus.",
      D: "Statement 1 alone is incomplete because thrombosis-focused treatment is also required.",
      E: "Statement 3 alone misses oxygen-demand and broader antithrombotic goals.",
    },
    memoryTrick:
      "Unstable angina strategy: ease demand and block clot pathways.",
  },
  {
    id: 29,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q29. Isosorbide dinitrate:",
    statements: [
      "1. is a coronary vasoconstrictor",
      "2. flushing may occur",
      "3. patient may complain of throbbing headache",
    ],
    correct: "C",
    explanation:
      "Isosorbide dinitrate is a coronary vasodilator and side-effects of peripheral vasodilation may occur.",
    explainCorrect:
      "Option C is correct because isosorbide dinitrate is a vasodilator (so statement 1 is false), and vasodilation commonly causes flushing and throbbing headache.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which is opposite to nitrate pharmacology.",
      B: "This includes statement 1 and misses statement 3, while headache is a classic nitrate effect.",
      D: "Statement 1 alone is incorrect because nitrates dilate rather than constrict coronary vessels.",
      E: "Statement 3 alone is true but incomplete because flushing is also expected.",
    },
    memoryTrick: "Nitrates dilate vessels, so think flush and headache.",
  },
  {
    id: 109,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q109. Heparin:",
    statements: [
      "1. has a rapid onset of action",
      "2. has a short duration of action",
      "3. patient should be monitored for signs of haemorrhage",
    ],
    correct: "A",
    explanation:
      "When heparin is administered by intravenous or subcutaneous injection, it has a rapid onset of action and an average halﬂife of 1.",
    explainCorrect:
      "Option A is correct because heparin has rapid onset, relatively short half-life, and requires close bleeding surveillance.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but bleeding monitoring is essential during heparin therapy.",
      C: "This omits statement 1, yet rapid onset is a key heparin property.",
      D: "Statement 1 alone is incomplete because short action and haemorrhage monitoring also apply.",
      E: "Statement 3 alone is true but incomplete without pharmacokinetic properties.",
    },
    memoryTrick: "Heparin works fast, wears fast, watch for bleeding.",
  },
  {
    id: 214,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q214. If the patient responds to therapy:",
    statements: [
      "1. isosorbide dinitrate could be switched to oral administration",
      "2. heparin is stopped after 10 days",
      "3. aspirin is stopped",
    ],
    correct: "D",
    explanation:
      "Isosorbide dinitrate is initially given intravenously to achieve a fast onset of action and response.",
    explainCorrect:
      "Option D (1 only) is correct because IV nitrate can be stepped down to oral form after response, whereas stopping aspirin is inappropriate and heparin timing here is not represented as statement 2.",
    wrongOptionExplanations: {
      A: "This includes statements not accepted in this item after stabilization.",
      B: "This includes statement 2, which is not the expected correct follow-up point in this question.",
      C: "This includes statement 3, but aspirin is generally continued unless contraindicated.",
      E: "Statement 3 alone is incorrect in this post-response context.",
    },
    memoryTrick:
      "Responding nitrate infusion usually steps down; antiplatelet cover stays.",
  },
  {
    id: 10,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q10. Enalapril:",
    statements: [
      "1. is an ACE inhibitor",
      "2. is indicated for hypertension in diabetic patients",
      "3. is used for long-term management of myocardial infarction",
    ],
    correct: "A",
    explanation:
      "Enalapril is an angiotensin-converting enzyme (ACE) inhibitor that has antihypertensive effects.",
    explainCorrect:
      "Option A is correct because enalapril is an ACE inhibitor, useful in diabetic hypertension, and part of long-term post-MI cardioprotective therapy.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but long-term post-MI ACE inhibition is beneficial.",
      C: "This omits statement 1, yet ACE inhibition is enalapril's core class identity.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also true.",
      E: "Statement 3 alone is true but incomplete without class and hypertension context.",
    },
    memoryTrick:
      "Enalapril: ACE class, diabetic BP benefit, post-MI remodeling protection.",
  },
  {
    id: 242,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q242. Metformin:",
    statements: [
      "1. does not cause insulin release",
      "2. may provoke lactic acidosis",
      "3. requires monitoring of renal function",
    ],
    correct: "A",
    explanation:
      "Metformin is a biguanide which, unlike sulphonylureas, is not associated with weight gain. It is therefore an appropriate antidiabetic for GL who is obese.",
    explainCorrect:
      "Option A is correct because metformin does not trigger insulin release, can rarely cause lactic acidosis, and needs renal-function monitoring.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but renal monitoring is a key metformin safety step.",
      C: "This omits statement 1, and metformin's non-insulin-secretagogue mechanism is fundamental.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also clinically relevant.",
      E: "Statement 3 alone misses mechanism and rare major adverse-effect counselling.",
    },
    memoryTrick:
      "Metformin: no insulin push, kidney check, lactic risk rare but real.",
  },
  {
    id: 217,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q217. Metformin:",
    statements: [
      "1. does not precipitate hypoglycaemia",
      "2. should be taken with meals",
      "3. is indicated because GL is obese",
    ],
    correct: "A",
    explanation:
      "Metformin increases the use of glucose and increases insulin sensitivity. It is not associated with onset of hypoglycaemia and it does not cause weight gain.",
    explainCorrect:
      "Option A is correct because metformin has low hypoglycaemia risk, is best taken with meals for GI tolerance, and is appropriate in obesity.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but obesity benefit is one reason metformin is preferred.",
      C: "This omits statement 1, yet low hypoglycaemia risk is a core advantage.",
      D: "Statement 1 alone is incomplete because meal timing and obesity context also matter.",
      E: "Statement 3 alone is true but incomplete without practical administration and safety points.",
    },
    memoryTrick:
      "Metformin triad: low hypo risk, take with food, weight-neutral/weight-friendly.",
  },
  {
    id: 208,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q208. Drugs that are known to cause hyperkalaemia is (are):",
    statements: ["1. enalapril", "2. heparin", "3. furosemide"],
    correct: "B",
    explanation:
      "ACE inhibitors such as enalapril interfere with the conversion of angiotensin I to angiotensin II.",
    explainCorrect:
      "Option B is correct because enalapril and heparin can contribute to hyperkalaemia, while furosemide usually lowers potassium.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but loop diuretics more often cause hypokalaemia.",
      C: "This includes statement 3 and omits statement 1, which is a known hyperkalaemia contributor.",
      D: "Statement 1 alone is incomplete because statement 2 is also implicated.",
      E: "Statement 3 alone is opposite to typical potassium effect.",
    },
    memoryTrick: "ACE inhibitors raise K; loop diuretics usually drop it.",
  },
  {
    id: 179,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q179. With regards to simvastatin, GL should be advised:",
    statements: [
      "1. to return for monitoring of liver function tests",
      "2. that this medication is only for short-term until LDL levels normalise",
      "3. to avoid use of non-steroidal anti-inflammatory drugs",
    ],
    correct: "D",
    explanation:
      "Simvastatin is a statin that is used as a lipid-lowering agent. Use of statins is recommended in patients with ischaemic heart disease to decrease morbidity and mortality.",
    explainCorrect:
      "Option D (1 only) is correct because routine liver function monitoring and follow-up safety checks are appropriate with statins, while statin therapy is generally long-term and not stopped once LDL temporarily normalizes.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not correct counseling points in this item.",
      B: "Includes statement 2, but simvastatin is not short-term-only treatment.",
      C: "Includes statement 2 and misses statement 1, which is the key advice.",
      E: "Statement 3 alone is not the primary counseling point here.",
    },
    memoryTrick:
      "Statin rule: monitor safety, but treatment is usually long-term risk reduction.",
  },
  {
    id: 293,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question:
      "Q293. With regards to the glyceryl trinitrate patch, GL should be advised:",
    statements: [
      "1. to apply patch on chest wall, upper arm or shoulder",
      "2. to change daily",
      "3. to remove at night",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because nitrate patch counseling includes correct placement, daily replacement, and a nitrate-free interval overnight to limit tolerance.",
    wrongOptionExplanations: {
      B: "Misses statement 3, which is important to reduce nitrate tolerance.",
      C: "Misses statement 1, so application-site advice is incomplete.",
      D: "Only statement 1 is incomplete because daily change and night removal are also needed.",
      E: "Only statement 3 is not enough without placement and replacement guidance.",
    },
    memoryTrick:
      "Patch routine is place, replace daily, and remove overnight for nitrate break.",
    explanation:
      "Glyceryl trinitrate patches should be applied on chest wall, upper arm or shoulder and replaced daily.",
  },
  {
    id: 220,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question:
      "Q220. Additional drug therapy that could be suggested for GL for long-term management include:",
    statements: [
      "1. glyceryl trinitrate spray",
      "2. digoxin",
      "3. vasopressin",
    ],
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because glyceryl trinitrate spray is appropriate for angina symptom relief, while digoxin and vasopressin are not routine add-ons for this long-term angina context.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not standard angina add-ons in this stem.",
      B: "Includes statement 2; digoxin is not the keyed long-term suggestion here.",
      C: "Includes statements 2 and 3 and misses the single correct option pattern.",
      E: "Statement 3 alone is not an angina management add-on.",
    },
    memoryTrick:
      "For angina rescue, think nitrate spray first, not inotrope or vasopressor.",
    explanation:
      "GL may be prescribed glyceryl trinitrate spray which can be used for the prophylaxis of angina when onset of symptoms occur.",
  },
  {
    id: 121,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    caseBlock:
      "MG is a 64-year-old male admitted with stroke. Admission medicines included slow-release nifedipine 20 mg three times daily and aspirin 75 mg. PMH includes hypertension. Dipyridamole 100 mg three times daily was started.",
    question: "Q121. Dipyridamole should:",
    statements: [
      "1. be administered before food",
      "2. be used with caution in hypotension",
      "3. not to be given with aspirin",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because dipyridamole can be given before food and should be used cautiously in hypotension, while combining with aspirin may be clinically appropriate in stroke prevention regimens.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not correct in this clinical context.",
      C: "Includes statement 3 and misses statement 1.",
      D: "Only statement 1 is incomplete because caution in hypotension is also relevant.",
      E: "Only statement 3 is incorrect as a blanket counseling rule.",
    },
    memoryTrick:
      "Dipyridamole clue set: before food, watch pressure, aspirin can still be used when indicated.",
    explanation:
      "Dipyridamole is an adenosine reuptake inhibitor and a phosphodiesterase inhibitor which has antiplatelet and vasodilating properties.",
  },
  {
    id: 106,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    question: "Q106. Side-effects associated with dipyridamole include:",
    statements: ["1. headache", "2. abdominal distress", "3. hot flushes"],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because headache, gastrointestinal discomfort, and flushing are all recognized adverse effects of dipyridamole.",
    wrongOptionExplanations: {
      B: "Misses flushing, which is a known dipyridamole adverse effect.",
      C: "Misses headache while selecting only 2 and 3.",
      D: "Only headache is incomplete because abdominal discomfort and flushing can also occur.",
      E: "Only flushing is insufficient; this drug has a broader side-effect profile.",
    },
    memoryTrick: "Dipyridamole adverse effects often read as head-gut-flush.",
    explanation:
      "The most common side-effects to be expected from dipyridamole are gastrointestinal effects such as nausea, abdominal pain, constipation, dizziness, throbbing headache, hypotension, hot ﬂushes and tachycardia.",
  },
  {
    id: 151,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    question: "Q151. Nifedipine:",
    statements: [
      "1. commonly precipitates heart failure",
      "2. is a highly negative inotropic agent",
      "3. relaxes coronary and peripheral arteries",
    ],
    correct: "E",
    explanation:
      "Nifedipine is a dihydropyridine calcium-channel blocker. It has predominant activity as a peripheral and coronary arteries vasodilator.",
    explainCorrect:
      "Option E (3 only) is correct because nifedipine mainly relaxes peripheral and coronary arteries; it is not strongly negative inotropic and does not commonly precipitate heart failure in the way statements 1 and 2 imply.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, which are not accepted for nifedipine in this item.",
      B: "This includes statement 2, but nifedipine is not characterized by high negative inotropy.",
      C: "This includes statement 1, which is not the expected class effect here.",
      D: "Statement 1 alone is not the correct nifedipine profile in this question.",
    },
    memoryTrick: "Dihydropyridines are vessel relaxers first.",
  },
  {
    id: 150,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    question:
      "Q150. Modified-release formulations of nifedipine are preferred to prevent:",
    statements: [
      "1. large variations in blood pressure",
      "2. reflex tachycardia",
      "3. decreased effect in patients with short bowel syndrome",
    ],
    correct: "B",
    explanation:
      "Nifedipine is rapidly and efﬁciently absorbed from the gastrointestinal tract but undergoes an extensive ﬁrst-pass effect.",
    explainCorrect:
      "Option B is correct because modified-release nifedipine smooths peaks and troughs, reducing large BP swings and reflex tachycardia; statement 3 is not the reason for this preference.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not the core rationale for modified-release nifedipine.",
      C: "This includes statement 3 and misses statement 1, a key benefit of smoother delivery.",
      D: "Statement 1 alone is incomplete because reducing reflex tachycardia is also important.",
      E: "Statement 3 alone does not capture why MR forms are chosen.",
    },
    memoryTrick:
      "MR nifedipine prevents peak-related pulse and pressure swings.",
  },
  {
    id: 124,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    question: "Q124. Parameters that should be monitored in MG include:",
    statements: [
      "1. blood pressure",
      "2. heart rate",
      "3. signs and symptoms of heart failure",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because blood pressure, pulse, and heart-failure symptom surveillance are all relevant safety and outcome parameters in this cardiovascular-neurology overlap case.",
    wrongOptionExplanations: {
      B: "Misses signs of heart failure, which remain clinically relevant.",
      C: "Misses blood pressure monitoring, which is central in stroke-related care.",
      D: "Only blood pressure is incomplete without heart rate and heart-failure review.",
      E: "Only statement 3 is too narrow for routine monitoring.",
    },
    memoryTrick:
      "Post-stroke cardio checks are pressure, pulse, and pump-failure symptoms.",
    explanation:
      "Blood pressure should be monitored in MG. Hypertension should be controlled and development of hypotension avoided.",
  },
  {
    id: 229,
    type: "single",
    category: "Endocrinology",
    caseId: "t3_case4",
    caseBlock:
      "GX is an 80-year-old female living alone. Current medications: glibenclamide 10 mg in the morning and 15 mg midday, isosorbide mononitrate 60 mg daily, aspirin enteric-coated 75 mg daily, perindopril 8 mg daily, calcium 600 mg daily, and cod liver oil once daily.",
    question:
      "Q229. For which of the following drugs is there an alternative drug that is more appropriate for GX?",
    options: [
      "glibenclamide",
      "isosorbide mononitrate",
      "aspirin",
      "perindopril",
      "calcium",
    ],
    correct: "glibenclamide",
    explainCorrect:
      "Glibenclamide is correct because in older adults it has higher risk of prolonged hypoglycaemia than safer shorter-acting alternatives.",
    wrongOptionExplanations: {
      "isosorbide mononitrate":
        "This remains appropriate for ischemic symptom prevention in the presented history.",
      aspirin:
        "Low-dose aspirin is commonly used for secondary cardiovascular prevention when indicated.",
      perindopril:
        "ACE inhibitors are often appropriate for hypertension and cardiovascular risk reduction in diabetes.",
      calcium:
        "Supplementation is not the primary high-risk medication issue highlighted by this case.",
    },
    memoryTrick:
      "In older diabetics, long-acting sulfonylurea means prolonged low sugar risk.",
    explanation:
      "Glibenclamide may be less suitable in this older patient because of prolonged hypoglycaemia risk compared with shorter-acting alternatives.",
  },
  {
    id: 247,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case4",
    question: "Q247. Perindopril:",
    statements: [
      "1. may lead to deterioration of glucose tolerance",
      "2. dose in GX should be reviewed due to under-dosing",
      "3. treatment warrants routine renal function tests to be undertaken",
    ],
    correct: "E",
    explainCorrect:
      "Option E (3 only) is correct because ACE inhibitor therapy should include renal function and electrolyte monitoring, while it does not typically worsen glucose tolerance and this stem does not support under-dosing as the key issue.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, neither of which is the key correct point here.",
      B: "Statements 1 and 2 are not the best interpretation for perindopril in this case.",
      C: "Includes statement 2, which is not established as the correct issue in this stem.",
      D: "Statement 1 is not accurate because ACE inhibitors are generally neutral or favorable for glucose handling.",
    },
    memoryTrick:
      "Perindopril follow-up means kidney and potassium checks, not glucose deterioration.",
    explanation:
      "An advantage of angiotensin-converting enzyme (ACE) inhibitors such as perindopril is that they do not interfere with glucose tolerance and they can be used as antihypertensive agents or for the management of heart failure in diabetic patients.",
  },
  {
    id: 231,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case4",
    question: "Q231. Isosorbide mononitrate:",
    statements: [
      "1. has a longer halflife than the dinitrate salt",
      "2. has poor bioavailability after oral administration",
      "3. is used in hypertension",
    ],
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because isosorbide mononitrate has a longer half-life than the dinitrate and good oral bioavailability; it is used for angina prophylaxis rather than hypertension treatment.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, both incorrect in this context.",
      B: "Includes statement 2, which is false because oral bioavailability is relatively good.",
      C: "Statements 2 and 3 are both not correct for isosorbide mononitrate.",
      E: "Statement 3 alone is false; this nitrate is for angina, not routine BP control.",
    },
    memoryTrick:
      "Mononitrate means cleaner oral profile and angina prevention, not hypertension therapy.",
    explanation:
      "Isosorbide mononitrate is an active metabolite of isosorbide dinitrate. Advantages over isosorbide dinitrate include a higher bioavailability after oral administration as it does not undergo ﬁrst-pass hepatic metabolism and a longer halﬂife.",
  },
  {
    id: 213,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    caseBlock:
      "AV is a 64-year-old female with rheumatoid arthritis. Current medications: methotrexate 15 mg weekly, folic acid 10 mg weekly, prednisolone 5 mg daily, vitamin D and calcium tablets twice daily, and disodium pamidronate 90 mg injection every 3 months.",
    question: "Q213. Rheumatoid arthritis:",
    statements: [
      "1. is a localised condition",
      "2. occurs as a consequence of trauma",
      "3. affects synovial joints",
    ],
    correct: "E",
    explainCorrect:
      "Option E (3 only) is correct because rheumatoid arthritis is a systemic autoimmune disease that characteristically targets synovial joints rather than being localized or trauma-induced.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, both inconsistent with rheumatoid arthritis pathophysiology.",
      B: "Statements 1 and 2 are not correct defining features of rheumatoid arthritis.",
      C: "Includes statement 2, which is not a defining cause of rheumatoid arthritis.",
      D: "Statement 1 alone is false because rheumatoid arthritis is not simply localized.",
    },
    memoryTrick:
      "RA equals autoimmune synovial inflammation, not local trauma disease.",
    explanation:
      "Rheumatoid arthritis is associated with inﬂammation of the synovial membrane of different joints.",
  },
  {
    id: 75,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q75. Onset of rheumatoid arthritis:",
    statements: [
      "1. is insidious",
      "2. occurs symmetrically",
      "3. is polyarticular",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because rheumatoid arthritis commonly has insidious onset and often presents as a symmetric, polyarticular inflammatory joint disease.",
    wrongOptionExplanations: {
      B: "Omits statement 3, but polyarticular involvement is a classic RA feature.",
      C: "Misses statement 1, and insidious onset is typical for RA.",
      D: "Only statement 1 is incomplete because symmetry and polyarticular pattern also matter.",
      E: "Only statement 3 is too narrow; RA onset pattern includes more than joint count.",
    },
    memoryTrick:
      "RA tends to creep in slowly and hit many joints on both sides.",
    explanation:
      "There is great inter-patient variation in the course of the disease. Onset is insidious and the disease usually presents initially with non-speciﬁc symptoms such as fatigue, malaise, diffuse musculoskeletal pain and stiffness.",
  },
  {
    id: 180,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question:
      "Q180. In monitoring effectiveness of treatment for AV, functional factors to be assessed include:",
    statements: [
      "1. duration of morning stiffness",
      "2. ability to dress",
      "3. grip strength",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because morning stiffness duration, ability to perform daily tasks, and grip strength are all practical functional outcomes for rheumatoid arthritis monitoring.",
    wrongOptionExplanations: {
      B: "Excludes grip strength, which is a useful functional marker in hand disease.",
      C: "Misses morning stiffness, a major clinical activity indicator in RA.",
      D: "Only morning stiffness is incomplete without functional and strength assessment.",
      E: "Only grip strength alone does not reflect full functional response.",
    },
    memoryTrick:
      "RA follow-up asks three function questions: stiffness time, self-care ability, and hand power.",
    explanation:
      "As rheumatoid arthritis progresses, morning stiffness becomes prolonged and more disabling, interfering with patient’s daily activities.",
  },
  {
    id: 62,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q62. AV should be monitored for development of:",
    statements: [
      "1. anaemia",
      "2. gastric ulceration",
      "3. elevated creatine kinase",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because chronic inflammatory disease can contribute to anaemia, and gastrointestinal ulceration risk is relevant from associated therapies; elevated creatine kinase is not a typical RA monitoring target.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a routine RA progression marker.",
      C: "Includes statement 3 and omits anaemia surveillance.",
      D: "Only statement 1 is incomplete because treatment-related GI complications should also be monitored.",
      E: "Only statement 3 does not match core RA monitoring concerns.",
    },
    memoryTrick:
      "RA monitoring often tracks blood and gut complications, not muscle enzyme rise.",
    explanation:
      "As rheumatoid arthritis is a chronic inﬂammatory disease, patients may develop anaemia. This occurs because of reduced erythropoiesis during inﬂammatory disease.",
  },
  {
    id: 158,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q158. AV should be advised:",
    statements: [
      "1. to take methotrexate and folic acid once weekly one day apart",
      "2. to take prednisolone after food",
      "3. to report sore throat or fever immediately",
    ],
    correct: "A",
    explanation:
      "In AV methotrexate is prescribed as a weekly dose of 15 mg. It is very important to advise AV about proper administration of the drug and the pharmacist should ensure that the patient has understood the dosage regimen.",
    explainCorrect:
      "Option A is correct because methotrexate and folic acid scheduling must be clear, prednisolone is better after food, and infection red flags (sore throat/fever) need urgent reporting.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but infection-warning counselling is essential with immunosuppressive therapy.",
      C: "This omits statement 1, yet weekly methotrexate timing with folate separation is critical safety advice.",
      D: "Statement 1 alone is incomplete because steroid food advice and infection warning are also required.",
      E: "Statement 3 alone misses key dosing-structure and administration counselling.",
    },
    memoryTrick:
      "Methotrexate counselling: weekly schedule, folate separation, infection red flags.",
  },
  {
    id: 227,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q227. AV should undergo regularly investigations for:",
    statements: [
      "1. full blood count",
      "2. renal function tests",
      "3. liver function tests",
    ],
    correct: "A",
    explanation:
      "As methotrexate may cause bone marrow suppression, the patient should have a full blood count, including differential white cell count, regularly.",
    explainCorrect:
      "Option A is correct because methotrexate monitoring should include blood counts, renal function, and liver function due to marrow, renal-clearance, and hepatotoxicity risks.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but liver surveillance is essential in long-term methotrexate use.",
      C: "This omits statement 1, yet blood-count monitoring is mandatory for marrow safety.",
      D: "Statement 1 alone is incomplete because renal and hepatic monitoring are also standard.",
      E: "Statement 3 alone misses equally important marrow and renal checks.",
    },
    memoryTrick: "Methotrexate labs: blood, kidneys, liver.",
  },
  {
    id: 192,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q192. Disodium pamidronate:",
    statements: [
      "1. is used in corticosteroid-induced osteoporosis",
      "2. is only available for parenteral administration",
      "3. requires monitoring of serum electrolytes",
    ],
    correct: "A",
    explanation:
      "Disodium pamidronate is a biphosphonate that may be used in the prophylaxis and treatment of osteoporosis and corticosteroid-induced osteoporosis.",
    explainCorrect:
      "Option A is correct because pamidronate is used in steroid-induced osteoporosis, is given parenterally, and requires biochemical monitoring including electrolytes.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but electrolyte monitoring is part of safe bisphosphonate use.",
      C: "This omits statement 1, yet steroid-induced osteoporosis is a recognized indication.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also true in this item.",
      E: "Statement 3 alone is true but incomplete without indication and route context.",
    },
    memoryTrick: "Pamidronate: bone protection by IV with lab checks.",
  },
  {
    id: 161,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question:
      "Q161. Disease-modifying antirheumatic drugs that act as cytokine inhibitors include:",
    statements: ["1. methotrexate", "2. etanercept", "3. infliximab"],
    correct: "C",
    explanation:
      "Disease-modifying antirheumatic drugs include cytokine inhibitors such as etanercept and inﬂiximab.",
    explainCorrect:
      "Option C is correct because etanercept and infliximab are cytokine-targeting biologic DMARDs, while methotrexate is a conventional synthetic DMARD rather than a cytokine inhibitor.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which is not categorized as cytokine inhibition in this stem.",
      B: "This includes statement 1 and omits statement 3, while both 2 and 3 are the cytokine inhibitors listed.",
      D: "Statement 1 alone is not the best answer to cytokine-inhibitor class identification.",
      E: "Statement 3 alone is true but incomplete because statement 2 is also correct.",
    },
    memoryTrick:
      "In this set, biologics (etanercept/infliximab) are the cytokine blockers.",
  },
  {
    id: 19,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    caseBlock:
      "MA is a 71-year-old male diagnosed with shingles about 3 months ago. During active disease he received famciclovir 250 mg three times daily for 7 days. The rash has cleared but he continues to complain of pain.",
    question: "Q19. Shingles:",
    statements: [
      "1. occurs when varicella zoster virus is reactivated from its latent state",
      "2. involves primarily the dorsal root ganglia",
      "3. is characterised by vesicular eruptions",
    ],
    correct: "A",
    explanation:
      "Shingles occurs as a result of reactivation of the varicella zoster virus that is dormant in the nuclear DNA of dorsal root ganglia.",
    explainCorrect:
      "Option A is correct because shingles is reactivation of latent varicella-zoster virus in dorsal root ganglia and presents with characteristic vesicular lesions.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but vesicular eruption is a classic defining feature.",
      C: "This omits statement 1, yet viral reactivation from latency is fundamental to shingles.",
      D: "Statement 1 alone is incomplete because ganglion involvement and vesicles are also true.",
      E: "Statement 3 alone is true but incomplete without pathogenesis context.",
    },
    memoryTrick:
      "Shingles equals latent VZV reactivation with dermatomal vesicles.",
  },
  {
    id: 52,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    question: "Q52. Shingles:",
    statements: [
      "1. may present with eye involvement",
      "2. postherpetic neuralgia does not exceed 2 months in duration",
      "3. pain is characterised by spasms",
    ],
    correct: "D",
    explanation:
      "Shingles usually occurs along the thorax, head and neck and lumbosacral area. Eye or ear involvement may occur and this requires referral of the patient to a specialist to limit long-term damage.",
    explainCorrect:
      "Option D (1 only) is correct because shingles can involve the eye, while postherpetic neuralgia can persist beyond 2 months and pain is classically burning/stabbing rather than simply spasmodic.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not accepted as true in this item.",
      B: "This includes statement 2, but postherpetic neuralgia can last much longer than 2 months.",
      C: "This includes statement 3, which is not the best descriptor used in this stem.",
      E: "Statement 3 alone is not the expected correct point here.",
    },
    memoryTrick:
      "Herpes zoster can hit the eye; neuralgia duration can be prolonged.",
  },
  {
    id: 5,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    question: "Q5. Famciclovir:",
    statements: [
      "1. has a better bioavailability than aciclovir",
      "2. is a prodrug of penciclovir",
      "3. lacks intrinsic antiviral activity",
    ],
    correct: "A",
    explanation:
      "Famciclovir is a prodrug of penciclovir. Famciclovir is rapidly absorbed from the gastrointestinal tract following oral administration and it is converted to penciclovir.",
    explainCorrect:
      "Option A is correct because famciclovir has better oral bioavailability than aciclovir, is a prodrug of penciclovir, and has no intrinsic antiviral activity until converted.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but prodrug conversion underlies its activity profile.",
      C: "This omits statement 1, and improved bioavailability is one key advantage.",
      D: "Statement 1 alone is incomplete because prodrug identity and intrinsic activity point are also true.",
      E: "Statement 3 alone is true but incomplete without statements 1 and 2.",
    },
    memoryTrick: "Famciclovir works after conversion to penciclovir.",
  },
  {
    id: 11,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    question: "Q11. Famciclovir:",
    statements: [
      "1. should be started immediately in the active phase",
      "2. is used to minimise risk of postherpetic neuralgia",
      "3. should be continued until pain disappears",
    ],
    correct: "B",
    explanation:
      "Use of antiviral drugs such as famciclovir at the onset of the acute phase reduces the risk of postherpetic neuralgia.",
    explainCorrect:
      "Option B is correct because famciclovir should be started promptly in active shingles to reduce acute viral burden and lower postherpetic neuralgia risk; it is not continued indefinitely until all pain resolves.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but antiviral course is time-limited and not pain-duration based.",
      C: "This includes statement 3 and omits statement 1, which is a key timing principle.",
      D: "Statement 1 alone is incomplete because reducing neuralgia risk is also an intended benefit.",
      E: "Statement 3 alone is incorrect for standard antiviral course duration.",
    },
    memoryTrick:
      "Start antivirals early in zoster; do not chase pain duration with endless dosing.",
  },
  {
    id: 262,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    question: "Q262. Side-effects to be expected with famciclovir include:",
    statements: ["1. hypertension", "2. nausea", "3. headache"],
    correct: "C",
    explanation:
      "Side-effects associated with famciclovir are rare and these include nausea, headache, confusion, vomiting, jaundice, dizziness, drowsiness, hallucinations, rash and pruritus.",
    explainCorrect:
      "Option C is correct because nausea and headache are recognized famciclovir adverse effects, whereas hypertension is not a typical expected effect.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which is not a classic expected famciclovir adverse effect.",
      B: "This includes statement 1 and omits statement 3, though headache is commonly listed.",
      D: "Statement 1 alone is not the correct adverse-effect profile here.",
      E: "Statement 3 alone is true but incomplete because nausea is also expected.",
    },
    memoryTrick:
      "Famciclovir adverse effects are usually mild CNS/GI, like headache and nausea.",
  },
  {
    id: 85,
    type: "single",
    category: "Neurology",
    caseId: "t3_case6",
    question: "Q85. MA now has:",
    options: [
      "migrainous neuralgia",
      "postherpetic neuralgia",
      "trigeminal neuralgia",
      "chickenpox",
      "generalised anxiety disorder",
    ],
    correct: "postherpetic neuralgia",
    explanation:
      "Persistent pain after rash resolution in shingles is consistent with postherpetic neuralgia.",
    explainCorrect:
      "Postherpetic neuralgia is correct because pain persisting after shingles rash resolution, especially in older adults, is the classic definition.",
    wrongOptionExplanations: {
      "migrainous neuralgia":
        "This does not match the timeline of persistent dermatomal pain after zoster.",
      "trigeminal neuralgia":
        "Trigeminal neuralgia has a different distribution and trigger pattern than post-zoster persistent pain.",
      chickenpox:
        "Chickenpox is primary varicella infection, not persistent post-zoster neuropathic pain.",
      "generalised anxiety disorder":
        "Anxiety may coexist but does not explain this specific post-infective neuropathic pain syndrome.",
    },
    memoryTrick:
      "Pain after shingles rash clears points to postherpetic neuralgia.",
  },
  {
    id: 202,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case6",
    question:
      "Q202. Drugs that could be used to manage the condition of MA include:",
    statements: ["1. ampicillin", "2. ibuprofen", "3. amitriptyline"],
    correct: "C",
    explanation:
      "Drugs which could be recommended for MA include analgesics such as nonsteroidal anti-inﬂammatory drugs, for example, ibuprofen.",
    explainCorrect:
      "Option C is correct because postherpetic neuralgia management can include analgesics like ibuprofen and neuropathic-pain agents such as amitriptyline; ampicillin has no role.",
    wrongOptionExplanations: {
      A: "This includes statement 1, but antibacterial therapy is not indicated for postherpetic neuralgia.",
      B: "This includes statement 1 and omits statement 3, while amitriptyline is a key neuropathic-pain option.",
      D: "Statement 1 alone is incorrect because the condition is not a bacterial infection.",
      E: "Statement 3 alone is useful but incomplete because simple analgesic support may also be used.",
    },
    memoryTrick:
      "PHN treatment mixes pain control and neuropathic-modulator drugs, not antibiotics.",
  },
  {
    id: 40,
    type: "match",
    category: "Clinical Assessment",
    question: "Q40. is used to investigate retinopathy",
    options: [
      "ophthalmoscope",
      "otoscope",
      "stethoscope",
      "sphygmomanometer",
      "reflex hammer",
    ],
    correct: "ophthalmoscope",
    explanation:
      "An ophthalmoscope is used to examine the fundus and investigate retinopathy.",
    explainCorrect:
      "Ophthalmoscope is correct because retinopathy assessment requires direct visualization of the retina and optic fundus.",
    wrongOptionExplanations: {
      otoscope:
        "An otoscope examines ear canal and tympanic membrane, not retinal structures.",
      stethoscope:
        "A stethoscope is for auscultation and cannot visualize retinal pathology.",
      sphygmomanometer:
        "This measures blood pressure and does not inspect retinal vessels directly.",
      "reflex hammer":
        "This is a neurologic exam tool and has no retinal imaging function.",
    },
    memoryTrick: "Retina check needs an optical scope: ophthalmoscope.",
  },
  {
    id: 94,
    type: "match",
    category: "Clinical Assessment",
    question: "Q94. is used to assess breath sounds",
    options: [
      "ophthalmoscope",
      "otoscope",
      "stethoscope",
      "sphygmomanometer",
      "reflex hammer",
    ],
    correct: "stethoscope",
    explanation:
      "A stethoscope is used to assess breath sounds during respiratory and cardiovascular examination.",
    explainCorrect:
      "Stethoscope is correct because breath sounds are assessed by auscultation of airflow through the chest wall.",
    wrongOptionExplanations: {
      ophthalmoscope:
        "This instrument examines the retina and optic fundus, not lung sounds.",
      otoscope:
        "An otoscope is for ear canal and tympanic membrane examination.",
      sphygmomanometer:
        "This measures blood pressure and does not detect breath sounds.",
      "reflex hammer":
        "This tests tendon reflexes rather than cardiorespiratory auscultation.",
    },
    memoryTrick:
      "Breath sounds are heard, so use the listening tool: stethoscope.",
  },
  {
    id: 251,
    type: "match",
    category: "Clinical Assessment",
    question: "Q251. is used to test deep tendon reflexes",
    options: [
      "ophthalmoscope",
      "otoscope",
      "stethoscope",
      "sphygmomanometer",
      "reflex hammer",
    ],
    correct: "reflex hammer",
    explanation: "A reflex hammer is used to test deep tendon reflexes.",
    explainCorrect:
      "Reflex hammer is correct because deep tendon reflexes are elicited by tapping tendons to trigger stretch reflex arcs.",
    wrongOptionExplanations: {
      ophthalmoscope:
        "This examines ocular fundus and is unrelated to tendon reflex testing.",
      otoscope:
        "This is an ear examination instrument, not a neurologic reflex tool.",
      stethoscope: "A stethoscope is for auscultation, not reflex elicitation.",
      sphygmomanometer:
        "This measures blood pressure rather than neuromuscular reflexes.",
    },
    memoryTrick: "Reflexes need a tap, so think hammer.",
  },
  {
    id: 139,
    type: "match",
    category: "Endocrinology",
    question: "Q139. is produced by the placenta",
    options: [
      "gonadotrophin-releasing hormone",
      "C peptide",
      "troponin I",
      "prolactin",
      "human chorionic gonadotrophin",
    ],
    correct: "human chorionic gonadotrophin",
    explanation:
      "Human chorionic gonadotrophin is produced by placental trophoblastic cells.",
    explainCorrect:
      "Human chorionic gonadotrophin is correct because hCG is produced by trophoblastic placental tissue in pregnancy.",
    wrongOptionExplanations: {
      "gonadotrophin-releasing hormone":
        "GnRH is produced in the hypothalamus, not by placenta.",
      "C peptide":
        "C peptide is released from pancreatic beta cells during insulin production.",
      "troponin I":
        "Troponin I is a cardiac muscle injury biomarker, not a placental hormone.",
      prolactin:
        "Prolactin is secreted mainly by anterior pituitary lactotrophs.",
    },
    memoryTrick: "Pregnancy test hormone equals placental hCG.",
  },
  {
    id: 54,
    type: "match",
    category: "Endocrinology",
    question: "Q54. is released from the beta cells of the pancreas",
    options: [
      "gonadotrophin-releasing hormone",
      "C peptide",
      "troponin I",
      "prolactin",
      "human chorionic gonadotrophin",
    ],
    correct: "C peptide",
    explanation:
      "C peptide is released from pancreatic beta cells during insulin synthesis.",
    explainCorrect:
      "C peptide is correct because insulin is cleaved from proinsulin and C peptide is co-released from pancreatic beta cells.",
    wrongOptionExplanations: {
      "gonadotrophin-releasing hormone":
        "GnRH comes from hypothalamic neurons, not pancreatic beta cells.",
      "troponin I":
        "Troponin I originates from cardiac myocytes, especially in myocardial injury.",
      prolactin: "Prolactin is a pituitary hormone and not beta-cell derived.",
      "human chorionic gonadotrophin":
        "hCG is produced by placental trophoblasts.",
    },
    memoryTrick: "Beta-cell insulin release comes with C peptide as a partner.",
  },
  {
    id: 73,
    type: "match",
    category: "Endocrinology",
    question: "Q73. is released from the anterior pituitary gland",
    options: [
      "gonadotrophin-releasing hormone",
      "C peptide",
      "troponin I",
      "prolactin",
      "human chorionic gonadotrophin",
    ],
    correct: "prolactin",
    explanation: "Prolactin is released from the anterior pituitary gland.",
    explainCorrect:
      "Prolactin is correct because it is a hormone secreted by the anterior pituitary gland.",
    wrongOptionExplanations: {
      "gonadotrophin-releasing hormone":
        "GnRH is released from the hypothalamus, not anterior pituitary.",
      "C peptide": "C peptide is pancreatic, not pituitary.",
      "troponin I": "Troponin I is a myocardial structural protein biomarker.",
      "human chorionic gonadotrophin": "hCG is placental, not pituitary.",
    },
    memoryTrick: "Pituitary lactation hormone is prolactin.",
  },
  {
    id: 123,
    type: "combo",
    category: "Laboratory Medicine",
    question: "Q123. Creatine kinase (CK):",
    statements: [
      "1. is found in skeletal muscle",
      "2. isoenzyme fractions are used to identify the type of tissue damaged",
      "3. CK-MB are detected in blood within 3–5 h of a myocardial infarction",
    ],
    correct: "A",
    explanation:
      "Creatine kinase (CK) is an enzyme that is found in heart muscle, skeletal muscle and the brain. There are three isoenzymes: CK-BB (CPK1) which is predominantly found in the brain and lungs, CK-MB (CPK2) mainly found in myocardial cells and CK-MM (CPK3) which consists of circulatory CK.",
    explainCorrect:
      "Option A is correct because CK is present in skeletal muscle, CK isoenzymes help localize tissue injury source, and CK-MB rises within hours after myocardial infarction.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but CK-MB early rise is a classic post-MI laboratory feature.",
      C: "This omits statement 1, yet skeletal-muscle presence is fundamental CK physiology.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also true.",
      E: "Statement 3 alone is true but incomplete without enzyme-distribution and isoenzyme context.",
    },
    memoryTrick: "CK question stems: location, isoenzymes, and CK-MB timing.",
  },
  {
    id: 156,
    type: "combo",
    category: "Gastroenterology",
    question: "Q156. Auscultation of bowel sounds:",
    statements: [
      "1. is usually carried out postoperatively",
      "2. always requires a stethoscope",
      "3. when positive, indicates absence of peristalsis",
    ],
    correct: "D",
    explanation:
      "Auscultation of bowel sounds is undertaken to identify bowel obstruction or ileus. Ileus is a condition where there is an obstruction of the intestines resulting from immobility or mechanical obstruction.",
    explainCorrect:
      "Option D (1 only) is correct because bowel-sound auscultation is commonly used in postoperative and obstruction/ileus assessment; statements 2 and 3 are not accepted in this item.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not counted as correct here.",
      B: "This includes statement 2, which is not accepted in this item wording.",
      C: "This includes statement 3, but positive bowel sounds do not indicate absent peristalsis.",
      E: "Statement 3 alone is opposite to normal interpretation of audible bowel activity.",
    },
    memoryTrick:
      "Hearing bowel sounds supports movement, not absence of peristalsis.",
  },
  {
    id: 37,
    type: "combo",
    category: "Haematology",
    question: "Q37. A complete blood count consists of:",
    statements: [
      "1. haemoglobin quantification",
      "2. white blood cells count",
      "3. blood crossmatching",
    ],
    correct: "B",
    explanation:
      "A complete blood count (CBC) is a series of tests on a blood sample to present red blood cell count, haemoglobin level, haematocrit, red blood cell indices (mean corpuscular volume, mean corpuscular haemoglobin, mean corpuscular concentration), white blood cell count and differential count for different components, blood smear and platelet count.",
    explainCorrect:
      "Option B is correct because CBC includes haemoglobin and white-cell count, while blood crossmatching is a transfusion compatibility test, not part of standard CBC panel.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but crossmatching is separate from CBC.",
      C: "This includes statement 3 and omits statement 1, which is a core CBC component.",
      D: "Statement 1 alone is incomplete because WBC count is also part of CBC.",
      E: "Statement 3 alone is not a CBC component.",
    },
    memoryTrick: "CBC is cell-count panel, not transfusion matching.",
  },
  {
    id: 69,
    type: "combo",
    category: "Laboratory Medicine",
    question: "Q69. The erythrocyte sedimentation rate:",
    statements: [
      "1. is a non-specific indicator of inflammation",
      "2. measures the rate at which red blood cells settle out of mixed venous blood",
      "3. determination is based on protein electrophoresis",
    ],
    correct: "B",
    explanation:
      "The erythrocyte sedimentation rate (ESR) is a non-speciﬁc test that indicates conditions of inﬂammation, infection, malignancy and tissue necrosis or infarction.",
    explainCorrect:
      "Option B is correct because ESR is a nonspecific inflammation marker measuring RBC settling rate; it is not based on protein electrophoresis.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which describes a different laboratory technique.",
      C: "This includes statement 3 and omits statement 1, which is true.",
      D: "Statement 1 alone is incomplete because the settling-rate definition in statement 2 is also true.",
      E: "Statement 3 alone is incorrect for ESR methodology.",
    },
    memoryTrick: "ESR is the fall-speed of red cells in a column.",
  },
  {
    id: 177,
    type: "combo",
    category: "Gastroenterology",
    question: "Q177. Gastro-oesophageal reflux disease may be associated with:",
    statements: [
      "1. acid regurgitation",
      "2. dysphagia",
      "3. stricture formation",
    ],
    correct: "A",
    explanation:
      "Gastro-oesophageal reﬂux disease (GORD) is usually due to reﬂux oesophagitis, which results in acid regurgitation.",
    explainCorrect:
      "Option A is correct because GORD can present with acid regurgitation, dysphagia, and chronic complications including stricture formation.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but strictures can occur in long-standing reflux disease.",
      C: "This omits statement 1, while acid regurgitation is a hallmark symptom.",
      D: "Statement 1 alone is incomplete because dysphagia and stricture risk are also relevant.",
      E: "Statement 3 alone misses typical symptomatic presentation features.",
    },
    memoryTrick:
      "GORD can progress from reflux symptoms to narrowing complications.",
  },
  {
    id: 240,
    type: "combo",
    category: "Gastroenterology",
    question:
      "Q240. Patients using co-magaldrox preparations should be advised:",
    statements: [
      "1. not to take product at the same time as other drugs, except for enteric-coated tablets",
      "2. to take the preparation after meals",
      "3. that the product may be taken as required",
    ],
    correct: "C",
    explanation:
      "A mixture of magnesium hydroxide and aluminium salts in antacid preparations is referred to as co-magaldrox.",
    explainCorrect:
      "Option C is correct because co-magaldrox is generally taken after meals and can be used as required, while statement 1 is incorrect due to broad interaction spacing advice with many oral medicines.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which is not accepted as correct in this item.",
      B: "This includes statement 1 and misses statement 3, though PRN use is also valid.",
      D: "Statement 1 alone is not the recommended counselling point here.",
      E: "Statement 3 alone is true but incomplete without timing advice in statement 2.",
    },
    memoryTrick:
      "Antacid counselling here: after meals and as needed, while spacing from other drugs.",
  },
  {
    id: 105,
    type: "combo",
    category: "Clinical Pharmacology",
    question:
      "Q105. Patients should be advised to avoid direct sunlight when taking:",
    statements: ["1. gliclazide", "2. clarithromycin", "3. amiodarone"],
    correct: "E",
    explanation:
      "Some drugs may cause phototoxic or photoallergic reactions if the patient is exposed to ultraviolet light.",
    explainCorrect:
      "Option E (3 only) is correct because amiodarone is strongly associated with photosensitivity, unlike the other listed drugs in this question context.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, which are not accepted photosensitivity flags in this item.",
      B: "This includes statement 2, which is not the expected answer here.",
      C: "This includes statement 1, which is not the expected answer here.",
      D: "Statement 1 alone is not the key sunlight-avoidance counselling point in this set.",
    },
    memoryTrick: "Amiodarone is the classic sun-sensitive drug in this list.",
  },
  {
    id: 176,
    type: "combo",
    category: "Immunology",
    question: "Q176. Human immunoglobulins:",
    statements: [
      "1. are prepared from pooled human plasma or serum",
      "2. are tested for hepatitis B surface antigen",
      "3. are less likely to be associated with hypersensitivity reactions compared with antisera",
    ],
    correct: "A",
    explanation:
      "Immunoglobulins are used in clinical practice to induce passive immunity and therefore to present immediate protection against an infectious disease.",
    explainCorrect:
      "Option A is correct because immunoglobulins are plasma-derived preparations, screened for key blood-borne infections, and generally less hypersensitivity-prone than heterologous antisera.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but lower hypersensitivity risk versus antisera is also true.",
      C: "This omits statement 1, though pooled human plasma sourcing is fundamental.",
      D: "Statement 1 alone is incomplete because safety screening and comparative reaction profile are also true.",
      E: "Statement 3 alone is true but incomplete without sourcing and screening context.",
    },
    memoryTrick:
      "Human immunoglobulin means pooled, screened, and usually better tolerated than antisera.",
  },
  {
    id: 43,
    type: "combo",
    category: "ENT",
    question: "Q43. Glue ear:",
    statements: [
      "1. may occur in association with inflammation of the sinuses",
      "2. may result in long-term hearing impairment",
      "3. requires systemic antibacterial treatment as the usual line of action",
    ],
    correct: "B",
    explanation:
      "Glue ear, also referred to as sero-mucinous otitis media, is a condition where there is an accumulation of viscous mucous ﬂuid in the middle ear, usually occurring after repeated attacks of acute otitis media.",
    explainCorrect:
      "Option B is correct because glue ear can follow upper-airway inflammation and may cause persistent hearing effects, but routine systemic antibiotics are not the usual first-line approach.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not the standard usual line of management.",
      C: "This includes statement 3 and omits statement 1, which is true.",
      D: "Statement 1 alone is incomplete because long-term hearing impact risk is also true.",
      E: "Statement 3 alone is incorrect as routine default management.",
    },
    memoryTrick:
      "Glue ear is often watchful/ENT-managed, not automatic systemic antibiotic treatment.",
  },
  {
    id: 312,
    type: "combo",
    category: "Infectious Diseases",
    question: "Q312. In chronic hepatitis C:",
    statements: [
      "1. peginterferon is preferred to interferon as pegylation increases the persistence of interferon in blood",
      "2. liver damage may occur, requiring a liver transplant to prevent death from cirrhosis",
      "3. the aim of treatment is to achieve clearance of the virus which is sustained for at least 1 month after treatment has stopped",
    ],
    correct: "B",
    explanation:
      "Hepatitis C is a viral infection that is transmitted through contact with contaminated blood such as when sharing needles and through intravenous drug misuse or the transfusion of infected blood.",
    explainCorrect:
      "Option B is correct because pegylation prolongs interferon action and advanced chronic hepatitis C can progress to cirrhosis with transplant consideration; statement 3 is incorrect because sustained viral response is assessed over longer follow-up than 1 month.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not accepted in this item.",
      C: "This includes statement 3 and omits statement 1, which is true.",
      D: "Statement 1 alone is incomplete because severe disease progression risk in statement 2 is also true.",
      E: "Statement 3 alone is incorrect due to insufficient sustained-response timeframe.",
    },
    memoryTrick:
      "Chronic HCV: peg-interferon lasts longer; cure assessment needs longer durability.",
  },
  {
    id: 23,
    type: "combo",
    category: "Neurology",
    question:
      "Q23. It is recommended that long-term therapy for patients presenting with stroke should consider use of:",
    statements: ["1. ACE inhibitor", "2. aspirin", "3. statin"],
    correct: "A",
    explanation:
      "A stroke, also referred to as a cerebrovascular accident, is due to acute neurological dysfunction of vascular origin in focal areas of the brain.",
    explainCorrect:
      "Option A is correct because long-term secondary stroke prevention commonly includes blood-pressure control (often with ACE inhibitor), antiplatelet therapy, and statin treatment.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but statins are core vascular-risk reduction therapy.",
      C: "This omits statement 1, while antihypertensive risk control is fundamental post-stroke.",
      D: "Statement 1 alone is incomplete because antiplatelet and lipid-lowering strategies are also needed.",
      E: "Statement 3 alone is true but incomplete without antiplatelet and BP strategy.",
    },
    memoryTrick:
      "Post-stroke prevention bundles pressure, platelets, and lipids.",
  },
  {
    id: 236,
    type: "combo",
    category: "Oncology",
    question:
      "Q236. In patients with stage III (Duke’s C) colon cancer, the choice of adjuvant chemotherapy should take into account:",
    statements: [
      "1. the side-effect profile of the drugs",
      "2. the method of administration",
      "3. the patient’s lifestyle",
    ],
    correct: "B",
    explanation:
      "Colorectal cancers may be classiﬁed according to the Duke’s classiﬁcation, which was originally described in 1932, or according to the TNM classiﬁ- cation.",
    explainCorrect:
      "Option B is correct because adjuvant regimen choice must weigh toxicity profile and practical route/method of administration; statement 3 is not accepted as a determinant in this item.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not the accepted factor in this question.",
      C: "This includes statement 3 and omits statement 1, while toxicity profile remains essential.",
      D: "Statement 1 alone is incomplete because administration method is also considered.",
      E: "Statement 3 alone does not capture core adjuvant chemotherapy selection principles.",
    },
    memoryTrick:
      "Adjuvant choice here prioritizes safety profile and delivery practicality.",
  },
  {
    id: 182,
    type: "combo",
    category: "Rheumatology",
    question:
      "Q182. The use of calcium supplementation to reduce risk of fractures:",
    statements: [
      "1. is associated with poor compliance because of the need for sustained treatment",
      "2. may be combined with vitamin D supplementation",
      "3. consists of calcium lactate as it is the only salt that can be used for oral administration",
    ],
    correct: "B",
    explanation:
      "Calcium supplementation increases net calcium absorption and decreases bone turnover. Many adults are in negative calcium balance throughout their lives, an imbalance that worsens with age and increases the risk of osteoporosis and bone fracture.",
    explainCorrect:
      "Option B is correct because long-term calcium supplementation can face adherence challenges, and combination with vitamin D is common; statement 3 is false because multiple oral calcium salts exist.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is incorrect because calcium lactate is not the only oral salt.",
      C: "This includes statement 3 and omits statement 1, which is true.",
      D: "Statement 1 alone is incomplete because vitamin D co-supplementation is also valid.",
      E: "Statement 3 alone is incorrect pharmacologically.",
    },
    memoryTrick:
      "Bone support often needs calcium plus vitamin D and long-term adherence.",
  },
  {
    id: 36,
    type: "combo",
    category: "Ophthalmology",
    question: "Q36. Myopia:",
    statements: [
      "1. results in light rays being focused behind the retina",
      "2. can be corrected by using concave lenses for spectacles or contact lenses",
      "3. occurs when the person cannot clearly see an object that is more than 1 metre from the eye",
    ],
    correct: "C",
    explanation:
      "Myopia is corrected with concave lenses and causes poor distance vision.",
    explainCorrect:
      "Option C is correct because myopia causes poor distance vision and is corrected by concave lenses; statement 1 is false because myopic focus is in front of the retina, not behind.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which describes hypermetropic focus direction instead.",
      B: "This includes statement 1 and misses statement 3, while distance-vision impairment is a key myopia feature.",
      D: "Statement 1 alone is incorrect for myopia optics.",
      E: "Statement 3 alone is true but incomplete because corrective lens principle in statement 2 is also true.",
    },
    memoryTrick:
      "Myopia means near clear, far blur, corrected with concave lenses.",
  },
  {
    id: 63,
    type: "combo",
    category: "Clinical Nutrition",
    question:
      "Q63. Patients who are following a low-fat diet should be advised to:",
    statements: [
      "1. increase their fibre intake",
      "2. reduce their intake of saturated fats",
      "3. eliminate their intake of polyunsaturates",
    ],
    correct: "B",
    explanation:
      "Patients following a low-fat diet should be advised to increase ﬁbre intake which is found in fruits, green leafy vegetables, root vegetables, cereals and breads.",
    explainCorrect:
      "Option B is correct because low-fat diet counselling includes increasing fibre and reducing saturated fat, while complete elimination of polyunsaturates is inappropriate.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but polyunsaturated fats are not meant to be eliminated entirely.",
      C: "This includes statement 3 and omits statement 1, which is valid advice.",
      D: "Statement 1 alone is incomplete because saturated-fat reduction is also essential.",
      E: "Statement 3 alone is incorrect dietary guidance.",
    },
    memoryTrick:
      "Low-fat advice reduces bad fats and keeps healthier unsaturated fats.",
  },
  {
    id: 313,
    type: "combo",
    category: "Dermatology",
    question: "Q313. Patients with atopic eczema should be advised:",
    statements: [
      "1. to avoid frequent bathing",
      "2. to avoid scratching the area involved",
      "3. that the skin is more susceptible to microbial colonisation",
    ],
    correct: "C",
    explanation:
      "Atopic eczema is a skin condition characterised by pruritus and inﬂammation. A prominent feature is dry skin.",
    explainCorrect:
      "Option C is correct because atopic eczema counselling includes avoiding scratching and recognising increased susceptibility to skin colonisation or infection, while strict avoidance of frequent bathing is not the keyed statement here.",
    wrongOptionExplanations: {
      A: "This includes statement 1, which is not accepted as correct in this item.",
      B: "This includes statement 1 and omits statement 3, but microbial susceptibility is an important counselling point.",
      D: "Statement 1 alone is incomplete or incorrect for the keyed answer pattern.",
      E: "Statement 3 alone is true but incomplete without the anti-scratching advice in statement 2.",
    },
    memoryTrick:
      "Eczema advice core here: do not scratch and protect against infection risk.",
  },
  {
    id: 114,
    type: "combo",
    category: "Clinical Pharmacology",
    question:
      "Q114. Measurement of drug plasma concentrations is recommended when patients are started on:",
    statements: ["1. phenytoin", "2. cancer chemotherapy", "3. alteplase"],
    correct: "D",
    explanation:
      "Phenytoin is an antiepileptic drug that has a narrow therapeutic drug index. Monitoring of plasma concentrations is used to reduce phenytoin toxicity by assessing that the plasma concentration is within the therapeutic range.",
    explainCorrect:
      "Option D (1 only) is correct because therapeutic drug monitoring is classically required for phenytoin due to its narrow therapeutic index; the other listed therapies are not monitored in this same plasma-level manner.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not the standard plasma concentration monitoring examples in this question.",
      B: "This includes statement 2, but generic chemotherapy is not monitored like phenytoin TDM in this item.",
      C: "This includes statement 3, which is not a drug-level monitoring example here.",
      E: "Statement 3 alone is not the keyed answer in this TDM context.",
    },
    memoryTrick:
      "When asked classic plasma-level monitoring, think narrow-index drugs like phenytoin.",
  },
  {
    id: 153,
    type: "combo",
    category: "Gastroenterology",
    question: "Q153. People with irritable bowel syndrome may complain of:",
    statements: [
      "1. a negative effect on their social life",
      "2. abdominal pain",
      "3. gastro-oesophageal reflux",
    ],
    correct: "B",
    explanation:
      "Irritable bowel syndrome is a condition where patients complain of diarrhoea or constipation, abdominal pain and bloating.",
    explainCorrect:
      "Option B is correct because IBS commonly causes abdominal pain and significantly affects quality of life or social functioning; gastro-oesophageal reflux is not a defining IBS feature in this item.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not the keyed IBS complaint in this question.",
      C: "This includes statement 3 and omits statement 1, though social impact is common in IBS.",
      D: "Statement 1 alone is incomplete because abdominal pain is also core.",
      E: "Statement 3 alone does not represent the typical IBS pattern tested here.",
    },
    memoryTrick:
      "IBS in stems: pain plus life-impact, not reflux as the central marker.",
  },
  {
    id: 294,
    type: "combo",
    category: "Nephrology",
    question:
      "Q294. Immunosuppressive agents that may be used after kidney transplantation include:",
    statements: ["1. azathioprine", "2. ciclosporin", "3. prednisolone"],
    correct: "A",
    explanation:
      "Kidney transplantation is necessary when there is irreversible failure of the kidney. There are a number of complications associated with this intervention, including donor identification, organ preservation and organ rejection.",
    explainCorrect:
      "Option A is correct because post-kidney transplant immunosuppression commonly uses combinations including azathioprine, ciclosporin, and corticosteroids such as prednisolone.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but corticosteroids are part of many transplant regimens.",
      C: "This omits statement 1, while azathioprine is a recognized transplant immunosuppressant.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also valid.",
      E: "Statement 3 alone is true but incomplete without the other standard agents.",
    },
    memoryTrick:
      "Transplant immunosuppression is usually multi-drug, not single-agent.",
  },
  {
    id: 265,
    type: "combo",
    category: "Oncology",
    question: "Q265. Anaemia in cancer patients:",
    statements: [
      "1. often develops insiduously",
      "2. may be corrected with the use of erythropoietin",
      "3. is always due to cancer chemotherapy",
    ],
    correct: "B",
    explanation:
      "Anaemia in cancer patients may be chemotherapy-induced or may be due to the tumour. The tumour may result in bone marrow inﬁltration or lead to gastrointestinal blood loss.",
    explainCorrect:
      "Option B is correct because cancer-related anaemia often develops gradually and may be treated with erythropoietin in selected patients; it is not always due to chemotherapy alone.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is false because anaemia has multiple cancer-related causes.",
      C: "This includes statement 3 and omits statement 1, though insidious onset is common.",
      D: "Statement 1 alone is incomplete because erythropoietin use can also be relevant.",
      E: "Statement 3 alone is incorrect in this context.",
    },
    memoryTrick:
      "Cancer anaemia is multifactorial and may need supportive erythropoiesis strategies.",
  },
  {
    id: 219,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    caseBlock:
      "LJ is a 66-year-old female admitted for management of atrial fibrillation. PMH: hypertension and asthma. DH: potassium chloride one tablet daily, bendroflumethiazide 5 mg daily, warfarin 3 mg daily. O/E blood pressure 210/95 mmHg. On hospitalisation, digoxin loading at 0.25 mg daily and perindopril 2 mg nocte were started.",
    question: "Q219. Atrial fibrillation:",
    statements: [
      "1. may be caused by hypertension",
      "2. denote a fast, chaotic rhythm originating from multiple foci in the atria",
      "3. is associated with ventricular premature beats",
    ],
    correct: "B",
    explanation:
      "Atrial ﬁbrillation is a supraventricular arrhythmia that may be precipitated by cardiovascular disease that causes atrial distension, such as hypertension, ischaemia and infarction.",
    explainCorrect:
      "Option B is correct because atrial fibrillation can be precipitated by hypertension and is defined by rapid chaotic atrial activity; ventricular premature beats are a different arrhythmia phenomenon.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not a defining AF feature in this question.",
      C: "This includes statement 3 and omits statement 1, though hypertension can be a precipitating factor.",
      D: "Statement 1 alone is incomplete because the rhythm-description statement 2 is also true.",
      E: "Statement 3 alone does not define atrial fibrillation.",
    },
    memoryTrick:
      "AF means chaotic atrial rhythm and stroke-risk physiology, not isolated ventricular ectopy.",
  },
  {
    id: 187,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q187. Drugs that could alter QT interval in an ECG include:",
    statements: ["1. amitriptyline", "2. lithium", "3. fluoxetine"],
    correct: "B",
    explanation:
      "An electrocardiogram may be undertaken for LJ to conﬁrm the nature of the arrhythmias, and 24-h recordings may be preferred to allow monitoring.",
    explainCorrect:
      "Option B is correct because amitriptyline and lithium are recognized QT-affecting agents in this item, while fluoxetine is not keyed here.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not counted as correct in this question set.",
      C: "This includes statement 3 and omits statement 1, but amitriptyline is a known QT-risk drug.",
      D: "Statement 1 alone is incomplete because statement 2 is also accepted here.",
      E: "Statement 3 alone is not the keyed QT-risk answer in this item.",
    },
    memoryTrick: "In this list, TCA plus lithium are the QT watch pair.",
  },
  {
    id: 189,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q189. Atrial fibrillation increases the risk of:",
    statements: ["1. stroke", "2. heart failure", "3. hypertension"],
    correct: "B",
    explanation:
      "Occurrence of atrial ﬁbrillation increases the risk of stroke and heart failure.",
    explainCorrect:
      "Option B is correct because atrial fibrillation increases thromboembolic stroke risk and can contribute to heart failure from persistent tachyarrhythmia; it does not itself represent hypertension.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not a direct AF complication in this stem.",
      C: "This includes statement 3 and omits statement 1, while stroke risk is central.",
      D: "Statement 1 alone is incomplete because heart-failure risk is also true.",
      E: "Statement 3 alone is not the main risk relationship tested here.",
    },
    memoryTrick:
      "AF major outcomes to remember: clot-related stroke and pump failure.",
  },
  {
    id: 87,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question:
      "Q87. The reasons why digoxin was preferred to other options are:",
    statements: [
      "1. beta-adrenoceptors should be avoided because of the history of asthma",
      "2. digoxin slows ventricular response in atrial fibrillation",
      "3. it also has a hypotensive effect",
    ],
    correct: "B",
    explanation:
      "In atrial ﬁbrillation, the ventricular response results in a rapid ventricular rate. Digoxin is a cardiac glycoside that may be used in the management of atrial ﬁbrillation to control ventricular response.",
    explainCorrect:
      "Option B is correct because beta-blockers may be problematic in asthma and digoxin helps rate control in atrial fibrillation; digoxin is not primarily used for blood-pressure reduction.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but hypotension is not the reason digoxin was chosen here.",
      C: "This includes statement 3 and omits statement 1, though asthma history is a key consideration.",
      D: "Statement 1 alone is incomplete because ventricular-rate control purpose in statement 2 is also true.",
      E: "Statement 3 alone is not a valid selection reason in this case.",
    },
    memoryTrick:
      "Digoxin in AF case stems is for rate control, not antihypertensive effect.",
  },
  {
    id: 181,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q181. Digoxin should be used with caution in:",
    statements: [
      "1. elderly patients",
      "2. renal impairment",
      "3. recent infarction",
    ],
    correct: "A",
    explanation:
      "Digoxin has a narrow therapeutic range but plasma concentration is not the only factor indicating risk of toxicity.",
    explainCorrect:
      "Option A is correct because digoxin caution is warranted in elderly patients, renal impairment, and recent infarction due to toxicity risk and myocardial vulnerability.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but recent infarction is also a caution context.",
      C: "This omits statement 1, though age-related toxicity susceptibility is important.",
      D: "Statement 1 alone is incomplete because renal function and cardiac context also matter.",
      E: "Statement 3 alone is true but incomplete without age and renal cautions.",
    },
    memoryTrick:
      "Digoxin caution triad: older age, kidneys, and recent heart injury.",
  },
  {
    id: 157,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q157. Parameters that should be monitored include:",
    statements: [
      "1. serum potassium levels",
      "2. plasma digoxin concentration",
      "3. ventricular rate at rest",
    ],
    correct: "A",
    explanation:
      "When LJ is hospitalised, serum potassium levels should be checked and monitored to avoid occurrence of hypokalaemia.",

    explainCorrect:
      "Option A is correct because safe digoxin management here requires monitoring potassium status, digoxin concentration, and ventricular rate control in atrial fibrillation.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but resting ventricular rate is a key clinical control target in AF.",
      C: "This omits statement 1, and potassium monitoring is essential to reduce arrhythmia and toxicity risk.",
      D: "Statement 1 alone is incomplete because drug level and rate response are also monitored.",
      E: "Statement 3 alone misses key biochemical monitoring requirements.",
    },
    memoryTrick: "Digoxin monitoring triangle: potassium, level, and rate.",
  },
  {
    id: 14,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q14. A low dose of perindopril is used because:",
    statements: [
      "1. the patient is elderly",
      "2. the risk of dehydration is very high",
      "3. perindopril is being used as a prophylactic of cardiovascular events",
    ],
    correct: "D",
    explanation:
      "LJ is started on perindopril because she has uncontrolled blood pressure. Angiotensin-converting enzyme (ACE) inhibitors are preferred to beta-blockers in patients with asthma.",

    explainCorrect:
      "Option D (1 only) is correct because perindopril is started cautiously at low dose in older patients; statements 2 and 3 are not the reason tested in this item.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not keyed as correct here.",
      B: "This includes statement 2, which is not the primary reason for low starting dose in this stem.",
      C: "This includes statement 3, which is not the keyed rationale in this question.",
      E: "Statement 3 alone does not explain the low initial dose choice tested here.",
    },
    memoryTrick: "In elderly patients, ACE inhibitors start low and go slow.",
  },
  {
    id: 289,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question:
      "Q289. The medication review once the patient is stabilised should assess the need for continuation of treatment with:",
    statements: [
      "1. potassium supplementation",
      "2. perindopril",
      "3. warfarin",
    ],
    correct: "D",
    explanation:
      "ACE inhibitors such as perindopril cause potassium retention because they inhibit secretion of aldosterone.",

    explainCorrect:
      "Option D (1 only) is correct because after stabilization, potassium supplementation need should be reassessed given ACE-inhibitor potassium retention; perindopril and warfarin remain core therapies.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not the discontinuation focus in this item.",
      B: "This includes statement 2, but perindopril continuation is generally part of long-term management.",
      C: "This includes statement 3, but warfarin continuation is usually needed in AF stroke prevention.",
      E: "Statement 3 alone is not the medication most likely needing reassessment here.",
    },
    memoryTrick: "If ACE inhibitor is added, review extra potassium first.",
  },
  {
    id: 183,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    caseBlock:
      "AX is a 72-year-old male with rheumatoid arthritis flare-up (3-week history of fever and painful joints, swelling/warmth in hands, wrists and ankles). PMH: rheumatoid arthritis, peptic ulceration, colonic polyps. DH includes fluvastatin 20 mg nocte, methotrexate 15 mg weekly, folic acid 10 mg weekly, paracetamol 1 g every 8 hours prn. Drug allergies: leflunomide; prior gold injections caused reversible renal impairment. On admission, methylprednisolone 500 mg was given by slow IV infusion for one day.",
    question: "Q183. The aim(s) of treatment in rheumatoid arthritis is (are):",
    statements: [
      "1. to preserve functional ability",
      "2. to prevent osteoporosis",
      "3. to prevent hyperuricaemia",
    ],
    correct: "D",
    explanation:
      "Rheumatoid arthritis is a progressive disease that is associated with deterioration in patient mobility and a reduction in life expectancy of 7 years in males and 3 years in women.",

    explainCorrect:
      "Option D (1 only) is correct because rheumatoid arthritis treatment aims to preserve function and reduce disability; preventing osteoporosis or hyperuricaemia are not core primary RA goals in this stem.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not principal disease-treatment aims here.",
      B: "This includes statement 2, but osteoporosis prevention is supportive care rather than the core RA aim tested.",
      C: "This includes statement 3, which is unrelated to standard RA disease-goal framing.",
      E: "Statement 3 alone is not a rheumatoid arthritis treatment objective.",
    },
    memoryTrick:
      "RA goals focus on function and joint outcomes, not uric acid.",
  },
  {
    id: 193,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q193. Biochemical investigations to monitor AX include:",
    statements: [
      "1. C-reactive protein",
      "2. erythrocyte sedimentation rate",
      "3. rheumatoid factor",
    ],
    correct: "A",
    explanation:
      "Monitoring of outcomes of therapy and of disease progression includes biochemical tests where changes in inﬂammatory markers are followed.",

    explainCorrect:
      "Option A is correct because CRP, ESR, and rheumatoid-factor-associated tracking are all accepted biochemical markers in this question's monitoring framework.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but the item includes rheumatoid factor among monitoring tests.",
      C: "This omits statement 1, while CRP is a key inflammatory marker.",
      D: "Statement 1 alone is incomplete because ESR and RF are also included in this keyed set.",
      E: "Statement 3 alone misses the major inflammatory activity markers.",
    },
    memoryTrick: "RA lab follow-up here uses CRP, ESR, and RF together.",
  },
  {
    id: 281,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q281. The use of methylprednisolone in AX:",
    statements: [
      "1. results in suppression of cytokines",
      "2. presents a rapid improvement in symptoms",
      "3. should be continued orally for a few months",
    ],
    correct: "B",
    explanation:
      "In AX, methylprednisolone is administered by slow intravenous infusion as a single dose to control symptoms associated with the ﬂare-up and to induce remission.",

    explainCorrect:
      "Option B is correct because methylprednisolone suppresses inflammatory cytokine pathways and gives rapid symptom relief in flare management, but prolonged oral continuation is not the intended approach here.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not correct for this pulse-therapy context.",
      C: "This includes statement 3 and omits statement 1, though cytokine suppression is true.",
      D: "Statement 1 alone is incomplete because rapid clinical response in statement 2 is also true.",
      E: "Statement 3 alone is incorrect as ongoing strategy in this scenario.",
    },
    memoryTrick:
      "Pulse steroid in flare: fast anti-inflammatory effect, not long oral continuation by default.",
  },
  {
    id: 148,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q148. Disadvantages of using methylprednisolone in AX include:",
    statements: [
      "1. his past history of peptic ulceration",
      "2. concomitant administration with fluvastatin",
      "3. his allergy to leflunomide",
    ],
    correct: "D",
    explanation:
      "Corticosteroids are associated with the development of peptic ulceration. Use of corticosteroids in AX should be undertaken with caution and considered only to treat aggressive ﬂare-ups or until the condition is managed with different disease-modifying antirheumatic agents.",

    explainCorrect:
      "Option D (1 only) is correct because prior peptic ulceration increases corticosteroid GI-risk concern, while fluvastatin co-use and leflunomide allergy are not the key disadvantages for methylprednisolone here.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are not the key disadvantage drivers in this item.",
      B: "This includes statement 2, but that interaction is not the main concern tested here.",
      C: "This includes statement 3, which is unrelated to methylprednisolone tolerance.",
      E: "Statement 3 alone is not a methylprednisolone-specific disadvantage.",
    },
    memoryTrick: "Steroid caution in this case hinges on ulcer history.",
  },
  {
    id: 256,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q256. Compared with prednisolone, methylprednisolone:",
    statements: [
      "1. has greater glucocorticoid activity",
      "2. has less mineralcorticoid activity",
      "3. is gastro-labile",
    ],
    correct: "B",
    explanation:
      "Methylprednisolone is a steroid with a greater glucocorticoid activity compared with prednisolone and lower mineralcorticoid effects.",

    explainCorrect:
      "Option B is correct because methylprednisolone has relatively higher glucocorticoid and lower mineralocorticoid activity than prednisolone; statement 3 is not a defining property here.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not accepted in this comparison.",
      C: "This includes statement 3 and omits statement 1, while greater glucocorticoid potency is true.",
      D: "Statement 1 alone is incomplete because statement 2 is also true.",
      E: "Statement 3 alone is not the expected differentiator in this item.",
    },
    memoryTrick:
      "Methylpred vs pred: more glucocorticoid, less mineralocorticoid.",
  },
  {
    id: 230,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question:
      "Q230. The interpretation of the results of the blood glucose tests for AX:",
    statements: [
      "1. requires information on food intake for the past 16 h",
      "2. indicates hyperglycaemia",
      "3. may be affected by methylprednisolone therapy",
    ],
    correct: "E",
    explanation:
      "In addition to anti-inﬂammatory and immunosuppressive effects, glucocorticoid activity results in metabolic effects including a decrease in peripheral glucose utilisation and an increase in gluconeogenesis.",

    explainCorrect:
      "Option E (3 only) is correct because corticosteroid therapy can raise glucose readings; statements 1 and 2 are not valid interpretations by themselves from the provided context.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, which are not accepted conclusions in this item.",
      B: "This includes statement 2, but hyperglycaemia interpretation here is not the keyed choice.",
      C: "This includes statement 1, which is not a required condition for interpreting these results.",
      D: "Statement 1 alone is not the correct interpretation in this question.",
    },
    memoryTrick:
      "Steroids can shift glucose upward, so interpret readings with treatment context.",
  },
  {
    id: 244,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question:
      "Q244. In the long-term, drugs that could be considered as additional treatment to methotrexate for the management of rheumatoid arthritis in AX include:",
    statements: ["1. infliximab", "2. etanercept", "3. doxorubicin"],
    correct: "B",
    explanation:
      "Cytokine inhibitors such as inﬂiximab, etanercept, adalimumab are used as disease-modifying antirheumatic drugs in the management of rheumatoid arthritis.",

    explainCorrect:
      "Option B is correct because infliximab and etanercept are biologic DMARD options for methotrexate-add-on therapy in rheumatoid arthritis; doxorubicin is an anticancer agent, not RA biologic therapy.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not a rheumatoid arthritis DMARD option.",
      C: "This includes statement 3 and omits statement 1, while infliximab is an established biologic option.",
      D: "Statement 1 alone is incomplete because etanercept is also an appropriate add-on in this set.",
      E: "Statement 3 alone is outside standard RA disease-modifying therapy.",
    },
    memoryTrick:
      "RA biologic add-ons here are anti-TNF agents, not cytotoxic oncology drugs.",
  },
  {
    id: 33,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question:
      "Q33. Common problems associated with methotrexate therapy in rheumatoid arthritis include:",
    statements: [
      "1. inadvertent daily drug administration",
      "2. nausea and vomiting",
      "3. bone marrow suppression",
    ],
    correct: "A",
    explanation:
      "Methotrexate is commonly prescribed as a weekly dose. Dispensing errors and errors in drug administration, where the patient takes the drug on a daily basis may occur.",

    explainCorrect:
      "Option A is correct because methotrexate safety issues include dosing errors (accidental daily use), GI intolerance, and bone-marrow suppression.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but marrow suppression is a major methotrexate risk.",
      C: "This omits statement 1, and accidental daily dosing is a classic high-harm error.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also true.",
      E: "Statement 3 alone misses the common adherence and GI problems.",
    },
    memoryTrick:
      "Methotrexate red flags: wrong frequency, stomach effects, and marrow toxicity.",
  },
  {
    id: 276,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q276. AX is receiving folic acid:",
    statements: [
      "1. to prevent megaloblastic anaemia",
      "2. to augment the effectiveness of methotrexate",
      "3. to reduce the occurrence of stomatitis from methotrexate",
    ],
    correct: "E",
    explanation:
      "AX is prescribed folic acid to be taken weekly to prevent the stomatitis that may occur as a result of methotrexate therapy.",

    explainCorrect:
      "Option E (3 only) is correct because folic acid is given with methotrexate mainly to reduce folate-related adverse effects such as stomatitis; it does not augment methotrexate efficacy in this context.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, which are not the keyed reasons in this item.",
      B: "This includes statement 2, but folic acid is not intended to boost methotrexate effect.",
      C: "This includes statement 1, which is not the primary rationale tested here.",
      D: "Statement 1 alone is not the keyed indication in this question.",
    },
    memoryTrick:
      "Folic acid with methotrexate is for toxicity mitigation, especially mouth and GI effects.",
  },
  {
    id: 67,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case3",
    caseBlock:
      "MB is a 55-year-old male presenting with palpitations and blood pressure 150/110 mmHg. He had previous hypertension and had been taking moxonidine 200 micrograms twice daily but stopped after running out of tablets.",
    question: "Q67. Moxonidine:",
    statements: [
      "1. is a centrally acting antihypertensive drug",
      "2. acts on the imidazoline receptors",
      "3. should not be used in patients hypersensitive to ACE inhibitors",
    ],
    correct: "B",
    explanation:
      "Moxonidine is a centrally acting drug that blocks imidazoline and alpha 2- adrenoceptors. It is used for the treatment of mild-to-moderate hypertension, especially where the condition is unresponsive to ﬁrst-line therapy.",

    explainCorrect:
      "Option B is correct because moxonidine is a centrally acting antihypertensive that targets imidazoline pathways; ACE-inhibitor hypersensitivity is unrelated.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not a contraindication linked to moxonidine mechanism.",
      C: "This includes statement 3 and omits statement 1, while central action is true.",
      D: "Statement 1 alone is incomplete because receptor mechanism in statement 2 is also true.",
      E: "Statement 3 alone is not the correct exclusion criterion here.",
    },
    memoryTrick:
      "Moxonidine in stems: central imidazoline action, not ACE-allergy issue.",
  },
  {
    id: 99,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case3",
    question:
      "Q99. Other drugs that have a similar mode of action to moxonidine include:",
    statements: ["1. methyldopa", "2. doxazosin", "3. hydralazine"],
    correct: "D",
    explanation:
      "Methyldopa and clonidine are two other antihypertensive drugs that are centrally acting. Moxonidine is a newer drug that is associated with fewer side-effects owing to its central action.",

    explainCorrect:
      "Option D (1 only) is correct because methyldopa shares centrally acting antihypertensive physiology, while doxazosin and hydralazine act by different mechanisms.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, both of which are different antihypertensive classes.",
      B: "This includes statement 2, but doxazosin is an alpha1 blocker rather than centrally acting like moxonidine.",
      C: "This includes statement 3, but hydralazine is a direct vasodilator with different mechanism.",
      E: "Statement 3 alone is not a mechanism match for moxonidine.",
    },
    memoryTrick: "Central antihypertensive match here is methyldopa.",
  },
  {
    id: 46,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case3",
    question: "Q46. Clinical presentation of MB is probably caused by:",
    statements: [
      "1. heart failure",
      "2. stroke",
      "3. abrupt withdrawal of moxonidine",
    ],
    correct: "E",
    explanation:
      "Moxonidine is structurally similar to clonidine. As for clonidine, abrupt withdrawal should be avoided as it may be associated with an increased cathecolamine release that may be manifested with agitation, sweating, tachycardia, headache, nausea and rebound hypertension.",

    explainCorrect:
      "Option E (3 only) is correct because abrupt withdrawal of centrally acting antihypertensives can cause rebound sympathetic overactivity with palpitations and severe hypertension.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, which are not the best explanation of this rebound presentation.",
      B: "This includes statement 2, but stroke is not the direct cause implied by the history here.",
      C: "This includes statement 1, but heart failure is not the primary trigger suggested in the stem.",
      D: "Statement 1 alone does not explain classic rebound after stopping moxonidine.",
    },
    memoryTrick:
      "Stopping central BP drugs suddenly can rebound blood pressure dramatically.",
  },
  {
    id: 51,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case3",
    question:
      "Q51. The assessment of end-organ damage from hypertension includes:",
    statements: [
      "1. evaluating prostatic hypertrophy",
      "2. examination of the optic fundi",
      "3. carrying out an ECG",
    ],
    correct: "C",
    explainCorrect:
      "Option C (2 and 3 only) is correct because retinal examination and ECG help detect hypertensive end-organ effects, while prostatic hypertrophy is not a classic hypertension-mediated target-organ marker.",
    wrongOptionExplanations: {
      A: "Includes statement 1, which is not a standard end-organ damage assessment item for hypertension.",
      B: "Includes statement 1 and misses statement 3, so the cardiac assessment component is incomplete.",
      D: "Only statement 1 is not the correct end-organ assessment focus here.",
      E: "Only statement 3 is incomplete because optic fundus assessment is also relevant.",
    },
    memoryTrick:
      "HTN target organs are eye, heart, kidney, brain, not prostate.",
    explanation:
      "Long-standing hypertension may cause complications associated with cardiovascular dysfunction, such as myocardial infarction, stroke and peripheral vascular disease in the retina, kidneys and extremities.",
  },
  {
    id: 307,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    caseBlock:
      "RB is a 30-year-old female with systemic sclerosis and acute Raynaud's phenomenon. PMH includes 9-year Raynaud's disease history with finger discoloration/cyanosis on cold exposure. DH: pentoxifylline 400 mg daily, nifedipine 20 mg daily. O/E includes swollen/tender fingers and mild nail-fold erythema with clear discharge.",
    question: "Q307. The management plan for RB should include:",
    statements: [
      "1. diclofenac suppositories",
      "2. vancomycin po",
      "3. co-amoxiclav intravenous therapy",
    ],
    correct: "E",
    explainCorrect:
      "Option E (3 only) is correct because intravenous co-amoxiclav targets likely soft-tissue bacterial infection in this case context, whereas oral vancomycin is not for this indication and diclofenac is not the key priority intervention.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, both not appropriate as core management choices here.",
      B: "Statements 1 and 2 are not the indicated management pair in this case.",
      C: "Includes statement 2, which is not appropriate for this infection focus.",
      D: "Statement 1 alone does not address the likely infectious component.",
    },
    memoryTrick:
      "In infected ischemic digits, prioritize appropriate systemic antibiotic coverage first.",
    explanation:
      "During an attack of Raynaud’s disease, ﬁnger discoloration is common. Pain is not usually a prominent symptom.",
  },
  {
    id: 188,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    question: "Q188. Pentoxifylline:",
    statements: [
      "1. acts as a vasodilator",
      "2. may cause hypotension",
      "3. should not be used for longer than 6 weeks",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because pentoxifylline improves microcirculatory flow and can contribute to hypotensive effects, while a strict 6-week maximum duration is not a universal rule.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a standard absolute duration restriction.",
      C: "Includes statement 3 and misses statement 1, which is a key property.",
      D: "Only statement 1 is incomplete because hypotension risk may also occur.",
      E: "Only statement 3 is not the correct pharmacotherapy statement here.",
    },
    memoryTrick:
      "Pentoxifylline improves flow and can lower pressure; no fixed 6-week stop rule.",
    explanation:
      "Pentoxifylline is a xanthine derivative that has vasodilating properties. It increases blood ﬂow to ischaemic tissues and results in an improvement of tissue oxygenation in the affected areas.",
  },
  {
    id: 95,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    question: "Q95. RB should be advised:",
    statements: [
      "1. to avoid exposure to cold",
      "2. to stop smoking",
      "3. that the condition is precipitated by exercise",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because avoiding cold exposure and stopping smoking both reduce vasospastic attacks in Raynaud's phenomenon, while exercise is not the precipitating factor stated here.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a standard trigger in this question stem.",
      C: "Includes statement 3 and misses statement 1; cold avoidance remains core advice.",
      D: "Only statement 1 is incomplete because smoking cessation should also be advised.",
      E: "Only statement 3 is incorrect as the key patient counseling point.",
    },
    memoryTrick:
      "Raynaud counseling is cold and cigarettes: keep warm and quit smoking.",
    explanation:
      "Factors that reduce blood ﬂow in the ﬁngers increase the risk of an acute attack. RB should be advised to avoid exposure to cold temperatures and to use lined gloves when handling food in freezers.",
  },
  {
    id: 127,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    question:
      "Q127. Drugs that should be used with caution or avoided in RB include:",
    statements: ["1. atenolol", "2. codeine", "3. promethazine"],
    correct: "D",
    explainCorrect:
      "Option D (1 only) is correct because beta-blockade with atenolol can worsen peripheral vasoconstriction and aggravate Raynaud attacks, while the other listed drugs are not the key caution point in this item.",
    wrongOptionExplanations: {
      A: "Includes statements 2 and 3, which are not the primary avoid-with-Raynaud choices here.",
      B: "Includes statement 2; the core caution signal in this question is atenolol.",
      C: "Includes statements 2 and 3 and misses the single keyed statement format.",
      E: "Statement 3 alone is not the principal cautioned drug in this stem.",
    },
    memoryTrick:
      "Raynaud and beta-blocker pairing is risky: cold extremities can get worse.",
    explanation:
      "Atenolol is a beta-adrenoceptor blocking drug. These drugs result in a reduced peripheral circulation leading to coldness of extremities and may exacerbate an acute attack of Raynaud’s disease.",
  },
  {
    id: 112,
    explainCorrect:
      "Option E (3 only) is correct because nifedipine mainly relaxes peripheral vascular smooth muscle and is used to reduce vasospastic episodes in Raynaud phenomenon.",
    wrongOptionExplanations: {
      A: "Includes statements 1 and 2, both inconsistent with nifedipine pharmacology and use.",
      B: "Statements 1 and 2 are not correct in this context.",
      C: "Includes statement 2, which is not the keyed counseling point.",
      D: "Statement 1 alone is incorrect because nifedipine is more vessel-selective than verapamil.",
    },
    memoryTrick:
      "Nifedipine favors vessels over myocardium, so it helps vasospasm in Raynaud.",
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    question: "Q112. Nifedipine:",
    statements: [
      "1. has more influence on the myocardium than on peripheral vessels compared with verapamil",
      "2. should not be administered as a modified-release formulation in the management of Raynaud’s phenomenon",
      "3. reduces frequency and severity of vasospastic effects in Raynaud’s phenomenon",
    ],
    correct: "E",
    explanation:
      "Nifedipine is a calcium-channel blocker which, unlike verapamil, has more inﬂuence on the peripheral and coronary vessels than on the myocardium.",
  },
  {
    id: 2,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    caseBlock:
      "FG is an 83-year-old female with sudden shortness of breath and retrosternal chest pain, with occasional cough and whitish sputum. PMH: diet-controlled diabetes mellitus, hypertension, congestive heart failure, depression. DH includes paroxetine, potassium chloride, verapamil, dipyridamole, bumetanide, and multivitamins. Investigations suggest pulmonary oedema secondary to myocardial infarction with chest infection.",
    question: "Q2. On admission treatment that should be started includes:",
    statements: [
      "1. insulin",
      "2. isosorbide dinitrate injections",
      "3. aspirin 75 mg po",
    ],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because this admission plan addresses glycaemic control, ischemic symptom management, and antiplatelet protection in a high-risk acute cardiopulmonary presentation.",
    wrongOptionExplanations: {
      B: "Misses statement 3, so antiplatelet protection is omitted.",
      C: "Omits insulin and includes only 2 and 3, which does not fully address metabolic control.",
      D: "Only statement 1 is incomplete in this acute multi-problem presentation.",
      E: "Only statement 3 is insufficient as sole initial therapy.",
    },
    memoryTrick:
      "Acute cardio case triad: control sugar, relieve ischemia, and protect platelets.",
    explanation:
      "On admission aims of treatment for FG are to control blood glucose levels, to treat infection, to reduce pulmonary oedema and to provide prophylaxis against ischaemic events.",
  },
  {
    id: 226,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q226. Possible adjustments to FG’s current treatment include:",
    statements: [
      "1. review dose of potassium chloride supplement",
      "2. switch bumetanide to intravenous therapy",
      "3. stop verapamil",
    ],
    correct: "A",
    explanation:
      "FG has presented with hypokalaemia, which is corrected by increasing the dose of potassium chloride supplements.",

    explainCorrect:
      "Option A is correct because hypokalaemia is directly addressed by reviewing and increasing potassium supplementation; the other options are not the primary correction in this item.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but stopping verapamil is not the key action for potassium correction.",
      C: "This omits statement 1, while potassium adjustment is the direct response to hypokalaemia.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are not the intended adjustments here.",
      E: "Statement 3 alone is not the principal treatment change for this laboratory issue.",
    },
    memoryTrick: "Low potassium first means fix potassium replacement.",
  },
  {
    id: 93,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q93. Oxygen therapy is started in the A&E department:",
    statements: [
      "1. to provide initial support",
      "2. at a concentration of 35%",
      "3. should be administered using a nasal cannula",
    ],
    correct: "B",
    explanation:
      "Oxygen therapy is started in the emergency department so as to provide support to FG, who presents with shortness of breath.",

    explainCorrect:
      "Option B is correct because emergency oxygen is started as initial support and this item pairs that with a 35% concentration approach; nasal cannula is not the keyed delivery method here.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not the selected administration method in this question.",
      C: "This includes statement 3 and omits statement 1, though supportive indication is true.",
      D: "Statement 1 alone is incomplete because statement 2 is also accepted in this item.",
      E: "Statement 3 alone is not the keyed oxygen-delivery choice.",
    },
    memoryTrick:
      "In this A&E stem, oxygen is initial support with controlled concentration.",
  },
  {
    id: 91,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q91. Paroxetine:",
    statements: [
      "1. is more effective than tricyclic antidepressants",
      "2. has a similar chemical structure to fluoxetine",
      "3. may cause movement disorders as side-effects",
    ],
    correct: "E",
    explanation:
      "Paroxetine is a selective serotonin reuptake inhibitor (SSRI). SSRIs together with tricyclic antidepressants (TCAs) are used in the management of depression.",

    explainCorrect:
      "Option E (3 only) is correct because paroxetine can be associated with movement-related adverse effects, while statements 1 and 2 are not accepted as true in this item.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, which are not correct here.",
      B: "This includes statement 2, but paroxetine and fluoxetine are not presented as similar-structure equivalents in this item.",
      C: "This includes statement 1, but superior efficacy over TCAs is not the keyed statement.",
      D: "Statement 1 alone is not correct in this question's framing.",
    },
    memoryTrick:
      "For this SSRI item, watch adverse effects rather than assuming class superiority.",
  },
  {
    id: 241,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q241. Dipyridamole:",
    statements: [
      "1. is a phosphodiesterase inhibitor",
      "2. should be used with caution in rapidly worsening angina",
      "3. is commonly associated with bleeding disorders",
    ],
    correct: "B",
    explanation:
      "Dipyridamole is a phosphodiesterase inhibitor and an adenosine reuptake inhibitor. It has antiplatelet and vasodilating properties.",

    explainCorrect:
      "Option B is correct because dipyridamole is a phosphodiesterase inhibitor and should be used cautiously in unstable or worsening angina; statement 3 is not the keyed adverse-profile claim.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not accepted in this item.",
      C: "This includes statement 3 and omits statement 1, while PDE inhibition is correct.",
      D: "Statement 1 alone is incomplete because caution in worsening angina is also true.",
      E: "Statement 3 alone is not the defining safety message in this question.",
    },
    memoryTrick:
      "Dipyridamole: PDE inhibitor with vasodilator caution in unstable angina.",
  },
  {
    id: 26,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q26. Cardiomegaly:",
    statements: [
      "1. occurs to accommodate increased ventricular load",
      "2. leads to pulmonary congestion",
      "3. may present with tachycardia",
    ],
    correct: "A",
    explanation:
      "A chest radiograph reveals cardiomegaly in FG. Cardiomegaly or enlargement of the heart, usually caused by left ventricular hypertrophy, occurs to accommodate the increased ventricular load.",

    explainCorrect:
      "Option A is correct because cardiomegaly represents adaptive enlargement to chronic load and may lead to pulmonary congestion and compensatory tachycardia.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but tachycardia may be part of decompensation response.",
      C: "This omits statement 1, while increased ventricular load adaptation is core pathophysiology.",
      D: "Statement 1 alone is incomplete because pulmonary congestion and tachycardia can coexist.",
      E: "Statement 3 alone misses structural and haemodynamic consequences.",
    },
    memoryTrick:
      "Heart enlargement follows load, then congestion and rate compensation may follow.",
  },
  {
    id: 270,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question:
      "Q270. Drugs that could cause hypotension in the patient include:",
    statements: ["1. bumetanide", "2. dipyridamole", "3. paroxetine"],
    correct: "B",
    explanation:
      "Bumetanide may result in water and electrolyte imbalance, which may be manifested by hypotension, muscle cramps, headache, dry mouth, thirst and weakness.",
    explainCorrect:
      "Option B is correct because bumetanide and dipyridamole can both contribute to hypotension, whereas paroxetine is not the keyed hypotension agent in this item.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not accepted in this question's keyed set.",
      C: "This includes statement 3 and omits statement 1, but diuretic-related volume depletion can lower blood pressure.",
      D: "Statement 1 alone is incomplete because statement 2 is also true here.",
      E: "Statement 3 alone is not the expected answer in this stem.",
    },
    memoryTrick:
      "Volume depletion plus vasodilation are classic hypotension contributors."
  },
  {
    id: 72,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    caseBlock:
      "AP is a 71-year-old female with hypertension, diabetes mellitus, ischaemic heart disease, congestive heart failure, and previous myocardial infarction. She presented with central compressive chest pain radiating to the epigastrium, sweating and belching, worsened by exertion. ECG showed T-wave inversion and CK 265. Impression: unstable angina. DH includes candesartan, clopidrogel, isosorbide mononitrate, fluvastatin, amlodipine, carvedilol, bumetanide, and isophane insulin.",
    question: "Q72. Carvedilol:",
    statements: [
      "1. has an arteriolar vasodilating action",
      "2. reduces mortality in heart failure",
      "3. is more water soluble than atenolol",
    ],
    correct: "B",
    explanation:
      "Carvedilol is a non-cardioselective beta-adrenoceptor blocker. It blocks the beta-receptors of the sympathetic nervous system in the heart, peripheral vasculature, bronchi, pancreas and liver.",
    explainCorrect:
      "Option B is correct because carvedilol has vasodilatory alpha-blocking activity and improves outcomes in heart failure; statement 3 is not true since atenolol is the more water-soluble beta-blocker.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is incorrect in this comparison.",
      C: "This includes statement 3 and omits statement 1, while vasodilatory action is true.",
      D: "Statement 1 alone is incomplete because mortality reduction in heart failure is also true.",
      E: "Statement 3 alone is incorrect for carvedilol pharmacokinetics.",
    },
    memoryTrick:
      "Carvedilol equals beta block plus alpha vasodilation and heart-failure survival benefit."
  },
  {
    id: 239,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q239. Potential side-effects that AP may present include:",
    statements: [
      "1. postural hypotension",
      "2. flushing",
      "3. shortness of breath",
    ],
    correct: "B",
    explanation:
      "Hypotension may occur as a common side-effect of a number of drugs that are included in AP’s treatment.",
    explainCorrect:
      "Option B is correct because postural hypotension and flushing are plausible medication-related effects in this regimen, whereas shortness of breath is not selected as the side-effect pair here.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not accepted in this item.",
      C: "This includes statement 3 and omits statement 1, though orthostatic hypotension risk is relevant.",
      D: "Statement 1 alone is incomplete because flushing is also included in the keyed pair.",
      E: "Statement 3 alone is not the selected adverse-effect pattern in this question.",
    },
    memoryTrick:
      "In multi-cardiac drug regimens, think pressure drop and vasodilator flushing."
  },
  {
    id: 55,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q55. Candesartan:",
    statements: [
      "1. inhibits breakdown of bradykinin",
      "2. dose should be administered in divided doses",
      "3. should be used with caution in renal artery stenosis",
    ],
    correct: "E",
    explanation:
      "Candesartan is an ester prodrug and it is hydrolysed to the active form during absorption from the gastrointestinal tract.",
    explainCorrect:
      "Option E (3 only) is correct because candesartan does not inhibit bradykinin breakdown and is usually given once daily, but it should be used cautiously in renal artery stenosis.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, both incorrect for candesartan.",
      B: "This includes statement 2, but divided dosing is not the typical requirement here.",
      C: "This includes statement 1, which describes ACE inhibitor effects rather than ARB effects.",
      D: "Statement 1 alone is incorrect for ARB mechanism.",
    },
    memoryTrick:
      "ARB clues: no bradykinin effect, caution in renal artery stenosis."
  },
  {
    id: 228,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q228. As regards diabetes management:",
    statements: [
      "1. insulin used is an intermediate-acting preparation",
      "2. AP should be advised to avoid episodes of hypoglycaemia",
      "3. insulin requirements decrease during anginal attacks",
    ],
    correct: "B",
    explanation:
      "Isophane insulin is an intermediate-acting insulin preparation that allows twicedaily injection. AP should be advised to avoid episodes of hypoglycaemia by correctly following the dose administration of insulin and keeping a standard food intake pattern.",
    explainCorrect:
      "Option B is correct because isophane insulin is intermediate-acting and hypoglycaemia avoidance is essential; insulin needs usually rise, not fall, during acute stress such as anginal episodes.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is opposite to stress-hyperglycaemia physiology.",
      C: "This includes statement 3 and omits statement 1, while insulin type is correctly identified in statement 1.",
      D: "Statement 1 alone is incomplete because hypoglycaemia prevention advice is also essential.",
      E: "Statement 3 alone is not correct in acute-cardiac stress context.",
    },
    memoryTrick:
      "Acute illness often increases insulin demand; still protect against hypoglycaemia episodes."
  },
  {
    id: 17,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q17. Isosorbide mononitrate:",
    statements: [
      "1. modified-release formulations are preferred",
      "2. is metabolised to isosorbide dinitrate",
      "3. increases venous return",
    ],
    correct: "D",
    explanation:
      "Isosorbide mononitrate is a nitrate that is used in angina. Nitrates are potent coronary vasodilators and bring about a reduced venous return.",
    explainCorrect:
      "Option D (1 only) is correct because modified-release isosorbide mononitrate is preferred for stable prophylaxis; it is not metabolised to isosorbide dinitrate and nitrates reduce rather than increase venous return.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, which are both incorrect in this item.",
      B: "This includes statement 2, but metabolic direction is the reverse.",
      C: "This includes statement 3, though nitrates lower preload by venodilation.",
      E: "Statement 3 alone is incorrect because nitrates reduce venous return.",
    },
    memoryTrick:
      "Nitrates lower preload; mononitrate MR is for steady antianginal prevention."
  },
  {
    id: 159,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q159. Fluvastatin:",
    statements: [
      "1. patient should be advised to report muscle pain promptly",
      "2. a therapeutic alternative is simvastatin 80 mg daily",
      "3. a complete blood count should be carried out before starting treatment",
    ],
    correct: "B",
    explanation:
      "Fluvastatin is a statin that acts as a 3-hydroxyl-3-methylglutaryl coenzyme A (HMG CoA) reductase inhibitor.",
    explainCorrect:
      "Option B (1 and 2 only) is correct because patients should report muscle symptoms promptly on statins, and switching to another statin can be a therapeutic alternative; routine baseline complete blood count is not the key required test.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not a standard statin pre-treatment requirement.",
      C: "Includes statement 3 and omits statement 1, missing core myopathy counseling.",
      D: "Only statement 1 is incomplete because a therapeutic statin alternative can also be considered.",
      E: "Only statement 3 is incorrect in this counseling set.",
    },
    memoryTrick:
      "Statin safety cue: muscle pain report early; CBC is not the routine statin baseline focus.",
  },
  {
    id: 290,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q290. The management of unstable angina includes:",
    statements: ["1. clopidrogel", "2. heparin", "3. complete bed rest"],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because antiplatelet therapy, anticoagulation, and strict early rest are all part of initial unstable angina management in hospital.",
    wrongOptionExplanations: {
      B: "Misses statement 3, which is part of early in-hospital stabilization in this item.",
      C: "Omits clopidogrel while including 2 and 3 only.",
      D: "Only statement 1 is incomplete because anticoagulation and rest are also needed initially.",
      E: "Only statement 3 alone is insufficient for unstable angina treatment.",
    },
    memoryTrick:
      "Unstable angina start set: antiplatelet plus anticoagulant plus rest.",
    explanation:
      "Unstable angina may present with negative outcomes and requires immediate hospitalisation. Complete bed rest is recommended for a few days.",
  },
  {
    id: 205,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t4_case7",
    caseBlock:
      "KB is a 36-year-old female presenting with dysuria, urinary urgency, and increased urinary frequency.",
    question: "Q205. Possible diagnoses include:",
    statements: ["1. cystitis", "2. acute pyelonephritis", "3. vulvovaginitis"],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because dysuria, urgency, and frequency strongly suggest lower UTI or ascending upper UTI, making cystitis and pyelonephritis primary differentials.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not the keyed primary differential pair in this stem.",
      C: "Includes statement 3 and omits statement 1, reducing focus on core urinary infection differentials.",
      D: "Only statement 1 is incomplete because pyelonephritis must also be considered.",
      E: "Only statement 3 is not the principal differential in this presentation.",
    },
    memoryTrick:
      "Dysuria with urgency and frequency: think cystitis first, then rule out pyelonephritis.",
    explanation:
      "Cystitis and acute pyelonephritis are key differentials in this urinary symptom presentation.",
  },
  {
    id: 196,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t4_case7",
    question: "Q196. The patient should be asked:",
    statements: [
      "1. about presence of fever",
      "2. to undertake a urinalysis",
      "3. to present mid-stream sampling for culturing",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because fever history and urinalysis are immediate key steps to differentiate uncomplicated cystitis from possible upper tract involvement.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not always the immediate first request in this stem.",
      C: "Includes statement 3 and omits urinalysis from statement 2.",
      D: "Only statement 1 is incomplete because urinalysis is also needed.",
      E: "Only statement 3 is insufficient as the initial assessment step.",
    },
    memoryTrick:
      "UTI triage starts with fever check and urine dip/analysis first.",
    explanation:
      "Patient should be asked about occurrence of fever. This helps to differentiate between cystitis and acute pyelonephritis.",
  },
  {
    id: 134,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t4_case7",
    question: "Q134. The patient should be advised to:",
    statements: [
      "1. drink lots of fluid",
      "2. use potassium citrate salts",
      "3. use a high dose of ibuprofen",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because hydration and urinary alkalinization can relieve lower UTI symptoms, while high-dose ibuprofen is not routine first-line advice due to adverse-effect risk.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not preferred counseling for uncomplicated symptom care.",
      C: "Includes statement 3 and misses hydration advice from statement 1.",
      D: "Only statement 1 is incomplete because potassium citrate can also be considered for symptom relief.",
      E: "Only statement 3 is not the recommended advice set here.",
    },
    memoryTrick:
      "UTI comfort pair: flush with fluids and alkalinize urine, avoid unnecessary high-dose NSAIDs.",
    explanation:
      "KB is advised to drink lots of water to ﬂush out the urinary system and dilute the microorganisms. Alkalinisation of urine may be used to relieve the discomfort caused by the urinary tract infection.",
  },
  {
    id: 174,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t4_case7",
    question: "Q174. Anti-infectives that could be recommended include:",
    statements: ["1. co-amoxiclav", "2. cefuroxime", "3. flucloxacillin"],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because co-amoxiclav and cefuroxime provide urinary pathogen coverage consistent with E. coli-focused treatment, while flucloxacillin is mainly anti-staphylococcal.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which has poor relevance for typical E. coli UTI coverage.",
      C: "Includes statement 3 and omits co-amoxiclav from statement 1.",
      D: "Only statement 1 is incomplete because cefuroxime is also a valid option.",
      E: "Only statement 3 is not the suitable choice for this organism focus.",
    },
    memoryTrick:
      "E. coli UTI therapy points to broad urinary Gram-negative cover, not flucloxacillin.",
    explanation:
      "Antibacterial agents that are active against E. coli are recommended for the management of cystitis and acute pyelonephritis.",
  },
  {
    id: 286,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    caseBlock:
      "SC is a 34-year-old female in her first month of pregnancy with blood pressure 140/100 mmHg and otherwise normal investigations. She was started on labetalol 100 mg daily.",
    question: "Q286. The diagnosis indicates:",
    statements: [
      "1. the probability that hypertension was pre-existing",
      "2. a higher risk of pre-eclampsia",
      "3. that hypertension is due to secondary causes",
    ],
    correct: "B",
    explainCorrect:
      "Option B (1 and 2 only) is correct because hypertension identified before 20 weeks suggests chronic pre-existing hypertension and carries increased risk of superimposed pre-eclampsia.",
    wrongOptionExplanations: {
      A: "Includes statement 3, which is not implied as the diagnosis in this stem.",
      C: "Includes statement 3 and omits statement 1, which is an important inference.",
      D: "Only statement 1 is incomplete because risk of pre-eclampsia is also increased.",
      E: "Only statement 3 is not supported by the case details.",
    },
    memoryTrick:
      "Before 20 weeks, think chronic HTN first and pre-eclampsia risk next.",
    explanation:
      "As there is hypertension before the ﬁrst 20–24 weeks of pregnancy, there is a probability that hypertension was pre-existing before conception.",
  },
  {
    id: 191,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    question: "Q191. The patient requires frequent monitoring of:",
    statements: ["1. blood pressure", "2. urinalysis", "3. fetal growth"],
    correct: "A",
    explainCorrect:
      "Option A (1, 2 and 3) is correct because blood pressure, urine protein surveillance, and fetal growth checks are all central in monitoring hypertensive pregnancy.",
    wrongOptionExplanations: {
      B: "Misses fetal growth surveillance, which is required in this context.",
      C: "Misses blood pressure monitoring, a core parameter.",
      D: "Only blood pressure is incomplete without urine and fetal assessment.",
      E: "Only fetal growth is insufficient as a stand-alone monitor.",
    },
    memoryTrick:
      "Pregnancy HTN follow-up is a triad: pressure, protein, and baby growth.",
    explanation:
      "During pregnancy, SC should be monitored to assess the development of the symptoms of pre-eclampsia, namely hypertension, proteinuria and changes in fetal growth.",
  },
  {
    id: 301,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    question:
      "Q301. During pregnancy, antihypertensives that should be avoided or used with caution include:",
    statements: [
      "1. thiazide diuretics, as they may cause neonatal thrombocytopenia",
      "2. ACE inhibitors, as they may affect renal function",
      "3. beta-blockers, as they may cause intrauterine growth restriction",
    ],
    correct: "A",
    explanation:
      "During pregnancy, the use of thiazide diuretics, beta-adrenoceptor blockers, angiotensin-converting enzyme (ACE) inhibitors and angiotensin-II receptor inhibitors should be avoided.",
    explainCorrect:
      "Option A is correct because all three listed classes are avoided or used with caution in pregnancy due to fetal or neonatal risks.",
    wrongOptionExplanations: {
      B: "This omits statement 3, but beta-blocker-related fetal growth concerns are relevant in this item.",
      C: "This omits statement 1, while thiazides are included among cautionary options here.",
      D: "Statement 1 alone is incomplete because statements 2 and 3 are also true in this question.",
      E: "Statement 3 alone misses other high-impact pregnancy cautions listed.",
    },
    memoryTrick:
      "Pregnancy antihypertensive safety asks you to screen for fetal-risk classes."
  },
  {
    id: 237,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    question: "Q237. Drugs that could be used instead of labetalol include:",
    statements: ["1. furosemide", "2. candesartan", "3. methyldopa"],
    correct: "E",
    explanation:
      "Methyldopa, a centrally acting antihypertensive agent, may be used in pregnancy. It has a very good safety record when used for the management of hypertension in pregnancy.",
    explainCorrect:
      "Option E (3 only) is correct because methyldopa is a long-used safer antihypertensive in pregnancy, while furosemide and candesartan are not preferred substitutes for this context.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, which are not preferred pregnancy substitutions here.",
      B: "This includes statement 2, but ARBs are contraindicated in pregnancy.",
      C: "This includes statement 1, which is not the first-choice substitute in this stem.",
      D: "Statement 1 alone is not the keyed safer substitute in this case.",
    },
    memoryTrick:
      "Pregnancy hypertension replacement in classic stems: think methyldopa."
  },
  {
    id: 233,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    question: "Q233. Labetalol:",
    statements: [
      "1. acts as a competitive antagonist to alpha and beta receptors in the sympathetic nervous system",
      "2. structure consists of two optical centres",
      "3. activity at the alpha receptors results in vasoconstriction",
    ],
    correct: "B",
    explanation:
      "Labetalol is a non-cardioselective drug that acts as a competitive antagonist to alpha and beta-receptors in the sympathetic nervous system.",
    explainCorrect:
      "Option B is correct because labetalol is an alpha and beta antagonist with stereochemical complexity; alpha blockade causes vasodilation, so statement 3 is false.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is opposite to alpha-blockade physiology.",
      C: "This includes statement 3 and omits statement 1, while receptor antagonism is correct.",
      D: "Statement 1 alone is incomplete because statement 2 is also true.",
      E: "Statement 3 alone is incorrect because alpha antagonism does not cause vasoconstriction.",
    },
    memoryTrick:
      "Labetalol blocks alpha and beta; alpha block opens vessels."
  },
  {
    id: 8,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    caseBlock:
      "HG is a 46-year-old female with troublesome nocturnal cough, nasal congestion, and nasal itchiness for weeks, with longstanding nasal allergy that has deteriorated. She has used oxymetazoline spray (two puffs three times daily) for two weeks.",
    question: "Q8. The patient:",
    statements: [
      "1. probably has perennial allergic rhinitis",
      "2. may be allergic to house dust",
      "3. has a viral infection",
    ],
    correct: "B",
    explanation:
      "HG may have the perennial type of allergic rhinitis as she states that she has recurrent attacks of nasal allergy indicating that the attacks may not be seasonal.",
    explainCorrect:
      "Option B is correct because perennial allergic rhinitis with likely indoor allergen triggers such as house dust fits the history, while viral infection is not the best explanation for chronic recurrent pattern.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not supported by the chronic allergy profile.",
      C: "This includes statement 3 and omits statement 1, though perennial pattern is likely.",
      D: "Statement 1 alone is incomplete because allergen context in statement 2 is also appropriate.",
      E: "Statement 3 alone does not fit longstanding recurrent allergic symptom history.",
    },
    memoryTrick:
      "Chronic non-seasonal nasal itch and congestion usually point to perennial allergy triggers."
  },
  {
    id: 222,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    question: "Q222. Oxymetazoline:",
    statements: [
      "1. is effective against nasal congestion",
      "2. the patient should be advised to stop using it",
      "3. is also available as an oral formulation",
    ],
    correct: "B",
    explanation:
      "In HG, oxymetazoline provides relief against nasal congestion. Oxymetazoline is an alpha-adrenoceptor agonist and its topical administration causes nasal vasoconstriction, thus reducing swelling and congestion in the nasal mucous membranes.",
    explainCorrect:
      "Option B is correct because oxymetazoline relieves congestion short-term but prolonged continuous use risks rebound congestion, so stopping is appropriate.",
    wrongOptionExplanations: {
      A: "This includes statement 3, but an oral formulation is not the relevant counselling point in this item.",
      C: "This includes statement 3 and omits statement 1, while decongestant effect is true.",
      D: "Statement 1 alone is incomplete because discontinuation advice is central here.",
      E: "Statement 3 alone is not the key counselling outcome in this case.",
    },
    memoryTrick:
      "Topical alpha-agonists help fast but should not be overused."
  },
  {
    id: 263,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    question: "Q263. Desloratidine:",
    statements: [
      "1. is indicated in this patient on a long-term basis",
      "2. is available as a nasal spray",
      "3. oral dosage form requires administration three times daily",
    ],
    correct: "D",
    explanation:
      "Desloratidine is an antihistamine that may be used for symptomatic relief in HG. The product may be used on a long-term basis and the non-sedating property of desloratidine is an advantage with regards to the lower incidence of sedation compared with older sedating agents.",
    explainCorrect:
      "Option D (1 only) is correct because desloratadine may be used long term for persistent allergic symptoms, while it is not a nasal spray and not dosed three times daily.",
    wrongOptionExplanations: {
      A: "This includes statements 2 and 3, both incorrect for desloratadine product form and dosing frequency.",
      B: "This includes statement 2, but desloratadine is not used as a nasal spray in this stem.",
      C: "This includes statement 3, but three-times-daily oral dosing is not correct here.",
      E: "Statement 3 alone is incorrect for standard desloratadine dosing.",
    },
    memoryTrick:
      "Desloratadine is a once-daily oral non-sedating antihistamine."
  },
  {
    id: 117,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    question: "Q117. Budesonide:",
    statements: [
      "1. should be used in the form of tablets",
      "2. is only available as a nasal spray",
      "3. is used in the prophylaxis of asthma",
    ],
    correct: "E",
    explanation:
      "Budesonide is a corticosteroid that was developed for inhalation for the management of asthma. It is also available as a nasal spray for use in allergic rhinitis and as an oral formulation that is used in the management of Crohn’s disease.",
    explainCorrect:
      "Option E (3 only) is correct because budesonide is used in asthma prophylaxis; statements 1 and 2 are false in this item.",
    wrongOptionExplanations: {
      A: "This includes statements 1 and 2, which are not correct as written in this question.",
      B: "This includes statement 2, but budesonide is not only available as a nasal spray.",
      C: "This includes statement 1, which is not the intended route for asthma prevention here.",
      D: "Statement 1 alone is not correct in this stem.",
    },
    memoryTrick:
      "Budesonide in asthma is controller therapy, not rescue."
  },
  {
    id: 74,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    question: "Q74. Patient should be advised:",
    statements: [
      "1. to avoid walking in gardens",
      "2. to regularly use products to eradicate house dust mites",
      "3. that the condition could easily develop into cough with blood in sputum",
    ],
    correct: "B",
    explanation:
      "HG should be advised to avoid exposure to allergens. She should be advised to avoid walking in gardens and to use products to eradicate house dust mites regularly in the house.",
    explainCorrect:
      "Option B is correct because allergen avoidance advice includes reducing outdoor pollen exposure and controlling house dust mites; haemoptysis warning is not the expected progression point.",
    wrongOptionExplanations: {
      A: "This includes statement 3, which is not a typical counselling point for allergic rhinitis progression.",
      C: "This includes statement 3 and omits statement 1, while outdoor trigger avoidance is relevant.",
      D: "Statement 1 alone is incomplete because indoor mite control is also important.",
      E: "Statement 3 alone is not appropriate routine advice in this context.",
    },
    memoryTrick:
      "Rhinitis counselling targets trigger avoidance at home and outdoors."
  },
  {
    id: 321,
    type: "match",
    category: "Cardiology",
    question:
      "Q321. Which ONE of the following best describes the primary mechanism of Amlodipine?",
    options: [
      "Blocks L-type calcium channels in vascular smooth muscle to reduce peripheral resistance.",
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.",
      "Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.",
      "Stimulates pancreatic beta-cell insulin release via KATP channel closure.",
      "Selectively inhibits serotonin reuptake in the CNS.",
    ],
    correct:
      "Blocks L-type calcium channels in vascular smooth muscle to reduce peripheral resistance.",
    explanation:
      "Amlodipine: Blocks L-type calcium channels in vascular smooth muscle to reduce peripheral resistance.",
    explainCorrect:
      "Amlodipine works by blocking L-type calcium channels in vascular smooth muscle, lowering peripheral resistance and blood pressure.",
    wrongOptionExplanations: {
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.": "This describes an antimuscarinic bronchodilator class, not a dihydropyridine calcium-channel blocker.",
      "Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.": "This is a glycopeptide antibacterial mechanism, unrelated to antihypertensive therapy.",
      "Stimulates pancreatic beta-cell insulin release via KATP channel closure.": "This is a sulfonylurea-type glucose-lowering mechanism, not amlodipine action.",
      "Selectively inhibits serotonin reuptake in the CNS.": "This describes SSRI antidepressants, not cardiovascular calcium-channel blockade.",
    },
    memoryTrick:
      "Amlodipine opens vessels by calcium-channel blockade in vascular smooth muscle."
  },
  {
    id: 322,
    type: "match",
    category: "Cardiology",
    question:
      "Q322. Which ONE of the following is the MOST appropriate therapeutic use of Amlodipine?",
    options: [
      "Bacterial sinusitis or otitis when beta-lactamase producers are suspected.",
      "Tuberculosis treatment and latent TB therapy protocols.",
      "Long-term management of hypothyroidism.",
      "Schizophrenia and related psychotic disorders.",
      "Long-term control of hypertension and chronic stable angina.",
    ],
    correct: "Long-term control of hypertension and chronic stable angina.",
    explanation:
      "Amlodipine: Long-term control of hypertension and chronic stable angina.",
    explainCorrect:
      "Long-term control of hypertension and chronic stable angina is correct because these are core indications for amlodipine.",
    wrongOptionExplanations: {
      "Bacterial sinusitis or otitis when beta-lactamase producers are suspected.": "This is an antibacterial treatment scenario, not a calcium-channel blocker indication.",
      "Tuberculosis treatment and latent TB therapy protocols.": "TB therapy uses antimycobacterial regimens, not amlodipine.",
      "Long-term management of hypothyroidism.": "Hypothyroidism is treated with thyroid hormone replacement, not amlodipine.",
      "Schizophrenia and related psychotic disorders.": "Psychotic disorders are managed with antipsychotic therapy, not antihypertensives.",
    },
    memoryTrick:
      "Amlodipine = BP control plus stable-angina prevention."
  },
  {
    id: 323,
    type: "match",
    category: "Cardiology",
    question:
      "Q323. Which ONE of the following is the MOST important safety point to counsel or monitor when using Amlodipine?",
    options: [
      "Hypoglycemia prevention requires consistent dosing time and glucose monitoring.",
      "Take with plain water and remain upright to reduce esophageal irritation.",
      "Can cause hyponatremia and requires periodic blood monitoring.",
      "Dose-related ankle edema is common; monitor for peripheral swelling.",
      "Avoid alcohol during treatment because of disulfiram-like reaction risk.",
    ],
    correct:
      "Dose-related ankle edema is common; monitor for peripheral swelling.",
    explanation:
      "Amlodipine: Dose-related ankle edema is common; monitor for peripheral swelling.",
    explainCorrect:
      "Dose-related ankle edema is correct because peripheral edema is a common amlodipine adverse effect requiring monitoring.",
    wrongOptionExplanations: {
      "Hypoglycemia prevention requires consistent dosing time and glucose monitoring.": "This applies to glucose-lowering medicines, not amlodipine.",
      "Take with plain water and remain upright to reduce esophageal irritation.": "This counselling is typical for certain oral irritant drugs, not amlodipine.",
      "Can cause hyponatremia and requires periodic blood monitoring.": "Hyponatremia is not the hallmark safety issue for amlodipine.",
      "Avoid alcohol during treatment because of disulfiram-like reaction risk.": "Disulfiram-like reactions are linked to specific antimicrobials, not amlodipine.",
    },
    memoryTrick:
      "Amlodipine safety cue: check ankles for swelling."
  },
  {
    id: 324,
    type: "match",
    category: "Cardiology",
    question:
      "Q324. Which ONE of the following best describes the primary mechanism of Metoprolol?",
    options: [
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.",
      "Reduces hepatic glucose output and improves insulin sensitivity.",
      "Systemic glucocorticoid that suppresses inflammatory gene transcription.",
      "Enhances GABAergic transmission and modulates neuronal firing.",
      "Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.",
    ],
    correct:
      "Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.",
    explanation:
      "Metoprolol: Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.",
    explainCorrect:
      "Metoprolol selectively blocks beta-1 receptors, reducing heart rate and myocardial oxygen demand.",
    wrongOptionExplanations: {
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.": "This is an antibacterial mechanism, not a beta-blocker action.",
      "Reduces hepatic glucose output and improves insulin sensitivity.": "This describes metformin-like glucose-lowering action, not metoprolol.",
      "Systemic glucocorticoid that suppresses inflammatory gene transcription.": "This is a corticosteroid mechanism.",
      "Enhances GABAergic transmission and modulates neuronal firing.": "This describes CNS-active agents, not cardiovascular beta-1 blockade.",
    },
    memoryTrick:
      "Metoprolol is cardioselective beta-1 blockade for rate and oxygen-demand control."
  },
  {
    id: 325,
    type: "match",
    category: "Cardiology",
    question:
      "Q325. Which ONE of the following is the MOST appropriate therapeutic use of Metoprolol?",
    options: [
      "Add-on glycemic control in type 2 diabetes.",
      "Short-term control of acute psychosis or severe agitation.",
      "GERD and peptic ulcer disease acid suppression.",
      "Rate control and secondary prevention after myocardial infarction.",
      "Core component of multidrug tuberculosis treatment.",
    ],
    correct:
      "Rate control and secondary prevention after myocardial infarction.",
    explanation:
      "Metoprolol: Rate control and secondary prevention after myocardial infarction.",
    explainCorrect:
      "Rate control and secondary prevention after myocardial infarction are correct because metoprolol is commonly used in these cardiovascular indications.",
    wrongOptionExplanations: {
      "Add-on glycemic control in type 2 diabetes.": "This is not a primary therapeutic role of metoprolol.",
      "Short-term control of acute psychosis or severe agitation.": "Psychosis management requires antipsychotic strategies, not beta-1 blockers.",
      "GERD and peptic ulcer disease acid suppression.": "Acid suppression is managed with PPIs or H2 blockers, not metoprolol.",
      "Core component of multidrug tuberculosis treatment.": "TB regimens use antimycobacterial drugs, not beta blockers.",
    },
    memoryTrick:
      "Metoprolol is for heart rhythm/rate control and post-MI protection."
  },
  {
    id: 326,
    type: "match",
    category: "Cardiology",
    question:
      "Q326. Which ONE of the following is the MOST important safety point to counsel or monitor when using Metoprolol?",
    options: [
      "Can cause hyponatremia and requires periodic blood monitoring.",
      "Assess renal function periodically during long-term therapy.",
      "Can cause bradycardia; monitor pulse and symptoms of dizziness.",
      "Hypoglycemia prevention requires consistent dosing time and glucose monitoring.",
      "Take with plain water and remain upright to reduce esophageal irritation.",
    ],
    correct: "Can cause bradycardia; monitor pulse and symptoms of dizziness.",
    explanation:
      "Metoprolol: Can cause bradycardia; monitor pulse and symptoms of dizziness.",
    explainCorrect:
      "Bradycardia monitoring is correct because metoprolol can slow heart rate and cause dizziness or fatigue if excessive.",
    wrongOptionExplanations: {
      "Can cause hyponatremia and requires periodic blood monitoring.": "Hyponatremia is not the principal metoprolol counselling risk.",
      "Assess renal function periodically during long-term therapy.": "Renal monitoring may be relevant in broader care but is not the key beta-blocker safety point here.",
      "Hypoglycemia prevention requires consistent dosing time and glucose monitoring.": "This is diabetes-drug counselling rather than core metoprolol monitoring.",
      "Take with plain water and remain upright to reduce esophageal irritation.": "This is not the defining counselling issue for metoprolol.",
    },
    memoryTrick:
      "Beta blocker safety starts with pulse check and dizziness review."
  },
  {
    id: 327,
    type: "match",
    category: "Cardiology",
    question:
      "Q327. Which ONE of the following best describes the primary mechanism of Losartan?",
    options: [
      "Replaces deficient thyroxine (T4) hormone.",
      "Antagonizes dopamine D2 and serotonin 5-HT2A receptors.",
      "Blocks serotonin 5-HT3 receptors in the gut and chemoreceptor trigger zone.",
      "Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.",
      "Inhibits mycolic acid synthesis in mycobacterial cell walls.",
    ],
    correct:
      "Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.",
    explanation:
      "Losartan: Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.",
    explainCorrect:
      "Losartan blocks angiotensin II AT1 receptors, reducing vasoconstriction and aldosterone-mediated sodium retention.",
    wrongOptionExplanations: {
      "Replaces deficient thyroxine (T4) hormone.": "This describes thyroid hormone replacement, not ARB action.",
      "Antagonizes dopamine D2 and serotonin 5-HT2A receptors.": "This is an antipsychotic receptor profile.",
      "Blocks serotonin 5-HT3 receptors in the gut and chemoreceptor trigger zone.": "This is an antiemetic mechanism.",
      "Inhibits mycolic acid synthesis in mycobacterial cell walls.": "This is an antimycobacterial mechanism.",
    },
    memoryTrick:
      "Losartan = angiotensin receptor blocker (AT1 off, pressure down)."
  },
  {
    id: 328,
    type: "match",
    category: "Cardiology",
    question:
      "Q328. Which ONE of the following is the MOST appropriate therapeutic use of Losartan?",
    options: [
      "Seizure control and bipolar depression maintenance.",
      "Prevention and treatment of documented hypokalemia.",
      "Hypertension, especially in patients with diabetic kidney disease.",
      "Type 2 diabetes with cardiovascular and renal protective benefits.",
      "Neuropathic pain and selected depressive disorders.",
    ],
    correct:
      "Hypertension, especially in patients with diabetic kidney disease.",
    explanation:
      "Losartan: Hypertension, especially in patients with diabetic kidney disease.",
    explainCorrect:
      "Losartan is appropriately used for hypertension and is especially useful where diabetic kidney protection is desired.",
    wrongOptionExplanations: {
      "Seizure control and bipolar depression maintenance.": "These are neurologic or psychiatric indications, not ARB use.",
      "Prevention and treatment of documented hypokalemia.": "Losartan may increase potassium; it is not a hypokalemia treatment.",
      "Type 2 diabetes with cardiovascular and renal protective benefits.": "This describes SGLT2-focused therapy rather than primary ARB indication wording in this item.",
      "Neuropathic pain and selected depressive disorders.": "This points to analgesic or antidepressant classes, not losartan.",
    },
    memoryTrick:
      "Think losartan for BP control with kidney-protective strategy in diabetes."
  },
  {
    id: 329,
    type: "match",
    category: "Cardiology",
    question:
      "Q329. Which ONE of the following is the MOST important safety point to counsel or monitor when using Losartan?",
    options: [
      "Start low and titrate to reduce hypersensitivity risk.",
      "May increase serum potassium; monitor renal function and potassium.",
      "Take with plain water and remain upright to reduce esophageal irritation.",
      "Can cause hyponatremia and requires periodic blood monitoring.",
      "Assess renal function periodically during long-term therapy.",
    ],
    correct:
      "May increase serum potassium; monitor renal function and potassium.",
    explanation:
      "Losartan: May increase serum potassium; monitor renal function and potassium.",
    explainCorrect:
      "Losartan can raise potassium and affect renal function, so potassium and kidney monitoring are key safety checks.",
    wrongOptionExplanations: {
      "Start low and titrate to reduce hypersensitivity risk.": "General titration advice is less specific than potassium and renal monitoring here.",
      "Take with plain water and remain upright to reduce esophageal irritation.": "This is counselling typical of drugs with esophageal irritation risk.",
      "Can cause hyponatremia and requires periodic blood monitoring.": "Hyponatremia is not the hallmark ARB safety issue in this context.",
      "Assess renal function periodically during long-term therapy.": "Renal monitoring is important but incomplete without potassium monitoring.",
    },
    memoryTrick:
      "ARB safety pair: kidneys and potassium."
  },
  {
    id: 330,
    type: "match",
    category: "Cardiology",
    question:
      "Q330. Which ONE of the following best describes the primary mechanism of Hydrochlorothiazide?",
    options: [
      "Inhibits voltage-sensitive sodium channels and glutamate release.",
      "Replaces potassium to restore intracellular and extracellular potassium balance.",
      "Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.",
      "Inhibits renal SGLT2 to increase urinary glucose excretion.",
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
    ],
    correct:
      "Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.",
    explanation:
      "Hydrochlorothiazide: Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.",
    explainCorrect:
      "Hydrochlorothiazide inhibits the Na-Cl cotransporter in the distal convoluted tubule to promote natriuresis.",
    wrongOptionExplanations: {
      "Inhibits voltage-sensitive sodium channels and glutamate release.": "This describes antiepileptic mechanisms.",
      "Replaces potassium to restore intracellular and extracellular potassium balance.": "This is potassium supplementation, not thiazide action.",
      "Inhibits renal SGLT2 to increase urinary glucose excretion.": "This is an SGLT2 inhibitor mechanism.",
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.": "This describes TCA-like antidepressant pharmacology.",
    },
    memoryTrick:
      "Thiazide = distal tubule Na-Cl blockade."
  },
  {
    id: 331,
    type: "match",
    category: "Cardiology",
    question:
      "Q331. Which ONE of the following is the MOST appropriate therapeutic use of Hydrochlorothiazide?",
    options: [
      "Acute gout flare treatment and flare prophylaxis when starting ULT.",
      "First-line blood pressure control in uncomplicated hypertension.",
      "Major depressive disorder and anxiety-spectrum disorders.",
      "Adjunct or monotherapy for focal and generalized seizures.",
      "Symptomatic treatment of mild-to-moderate Alzheimer disease.",
    ],
    correct: "First-line blood pressure control in uncomplicated hypertension.",
    explanation:
      "Hydrochlorothiazide: First-line blood pressure control in uncomplicated hypertension.",
    explainCorrect:
      "Hydrochlorothiazide is commonly used as a first-line agent for uncomplicated hypertension.",
    wrongOptionExplanations: {
      "Acute gout flare treatment and flare prophylaxis when starting ULT.": "Thiazides may worsen uric acid handling rather than treat gout.",
      "Major depressive disorder and anxiety-spectrum disorders.": "These are psychiatric indications, not thiazide use.",
      "Adjunct or monotherapy for focal and generalized seizures.": "This is an antiepileptic indication.",
      "Symptomatic treatment of mild-to-moderate Alzheimer disease.": "This is unrelated cognitive-disorder therapy.",
    },
    memoryTrick:
      "HCTZ is a classic BP starter in uncomplicated hypertension."
  },
  {
    id: 332,
    type: "match",
    category: "Cardiology",
    question:
      "Q332. Which ONE of the following is the MOST important safety point to counsel or monitor when using Hydrochlorothiazide?",
    options: [
      "Can cause hypokalemia and hyponatremia; monitor electrolytes.",
      "Can cause hyponatremia and requires periodic blood monitoring.",
      "Assess renal function periodically during long-term therapy.",
      "Start low and titrate to reduce hypersensitivity risk.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
    ],
    correct: "Can cause hypokalemia and hyponatremia; monitor electrolytes.",
    explanation:
      "Hydrochlorothiazide: Can cause hypokalemia and hyponatremia; monitor electrolytes.",
    explainCorrect:
      "Thiazides can cause both hypokalemia and hyponatremia, so electrolyte monitoring is essential.",
    wrongOptionExplanations: {
      "Can cause hyponatremia and requires periodic blood monitoring.": "Partly true but incomplete because hypokalemia is also key.",
      "Assess renal function periodically during long-term therapy.": "Renal checks matter but do not replace targeted electrolyte surveillance.",
      "Start low and titrate to reduce hypersensitivity risk.": "Not the principal safety monitoring point tested here.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.": "Close option, but the keyed answer emphasizes hypokalemia with hyponatremia specifically.",
    },
    memoryTrick:
      "Thiazide labs: sodium down, potassium down."
  },
  {
    id: 333,
    type: "match",
    category: "Cardiology",
    question:
      "Q333. Which ONE of the following best describes the primary mechanism of Spironolactone?",
    options: [
      "Inhibits xanthine oxidase, lowering uric acid production.",
      "Antagonizes aldosterone receptors in the distal nephron.",
      "Inhibits osteoclast-mediated bone resorption as a bisphosphonate.",
      "Blocks voltage-gated sodium channels in overactive neurons.",
      "Topical anti-inflammatory action in colonic mucosa via 5-ASA.",
    ],
    correct: "Antagonizes aldosterone receptors in the distal nephron.",
    explanation:
      "Spironolactone: Antagonizes aldosterone receptors in the distal nephron.",
    explainCorrect:
      "Spironolactone antagonizes aldosterone receptors in the distal nephron, reducing sodium retention and potassium loss.",
    wrongOptionExplanations: {
      "Inhibits xanthine oxidase, lowering uric acid production.": "This is allopurinol-type urate-lowering action.",
      "Inhibits osteoclast-mediated bone resorption as a bisphosphonate.": "This is osteoporosis bisphosphonate pharmacology.",
      "Blocks voltage-gated sodium channels in overactive neurons.": "This describes neurologic membrane-stabilizing agents.",
      "Topical anti-inflammatory action in colonic mucosa via 5-ASA.": "This is mesalamine-type bowel anti-inflammatory mechanism.",
    },
    memoryTrick:
      "Spironolactone = aldosterone blocker, potassium-sparing."
  },
  {
    id: 334,
    type: "match",
    category: "Cardiology",
    question:
      "Q334. Which ONE of the following is the MOST appropriate therapeutic use of Spironolactone?",
    options: [
      "Resistant hypertension and mortality reduction in HFrEF.",
      "Focal seizures and trigeminal neuralgia.",
      "Induction and maintenance therapy in ulcerative colitis.",
      "Long-term urate-lowering therapy in recurrent gout.",
      "Rapid symptomatic relief in fluid overload and pulmonary edema.",
    ],
    correct: "Resistant hypertension and mortality reduction in HFrEF.",
    explanation:
      "Spironolactone: Resistant hypertension and mortality reduction in HFrEF.",
    explainCorrect:
      "Spironolactone is used in resistant hypertension and improves outcomes in HFrEF as an MRA.",
    wrongOptionExplanations: {
      "Focal seizures and trigeminal neuralgia.": "These are neurologic indications for other drug classes.",
      "Induction and maintenance therapy in ulcerative colitis.": "This is gastroenterology anti-inflammatory therapy, not MRA use.",
      "Long-term urate-lowering therapy in recurrent gout.": "This is urate-lowering therapy territory, not spironolactone indication.",
      "Rapid symptomatic relief in fluid overload and pulmonary edema.": "Loop diuretics are preferred for rapid decongestion.",
    },
    memoryTrick:
      "MRA role: resistant BP and HFrEF survival support."
  },
  {
    id: 335,
    type: "match",
    category: "Cardiology",
    question:
      "Q335. Which ONE of the following is the MOST important safety point to counsel or monitor when using Spironolactone?",
    options: [
      "Assess renal function periodically during long-term therapy.",
      "Start low and titrate to reduce hypersensitivity risk.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
      "Counsel on dark stools and constipation to improve adherence.",
      "Risk of hyperkalemia is significant; check potassium regularly.",
    ],
    correct: "Risk of hyperkalemia is significant; check potassium regularly.",
    explanation:
      "Spironolactone: Risk of hyperkalemia is significant; check potassium regularly.",
    explainCorrect:
      "Hyperkalemia is the most important safety risk with spironolactone, so regular potassium monitoring is critical.",
    wrongOptionExplanations: {
      "Assess renal function periodically during long-term therapy.": "Important but not as specific as hyperkalemia risk focus.",
      "Start low and titrate to reduce hypersensitivity risk.": "Not the principal safety concern for this medicine.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.": "This is opposite to potassium-sparing MRA profile.",
      "Counsel on dark stools and constipation to improve adherence.": "This does not target spironolactone's key risk profile.",
    },
    memoryTrick:
      "Spironolactone safety headline: potassium can go high."
  },
  {
    id: 336,
    type: "match",
    category: "Cardiology",
    question:
      "Q336. Which ONE of the following best describes the primary mechanism of Furosemide?",
    options: [
      "Inhibits the NKCC2 cotransporter in the thick ascending limb of Henle.",
      "Modulates intracellular signaling pathways involved in mood stabilization.",
      "Dopamine D2 antagonism with prokinetic effects on upper GI tract.",
      "Binds dietary phosphate in the gut to reduce phosphate absorption.",
      "Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.",
    ],
    correct:
      "Inhibits the NKCC2 cotransporter in the thick ascending limb of Henle.",
    explanation:
      "Furosemide: Inhibits the NKCC2 cotransporter in the thick ascending limb of Henle.",
    explainCorrect:
      "Furosemide inhibits NKCC2 in the thick ascending limb, producing potent loop diuresis.",
    wrongOptionExplanations: {
      "Modulates intracellular signaling pathways involved in mood stabilization.": "This describes psychotropic mechanisms.",
      "Dopamine D2 antagonism with prokinetic effects on upper GI tract.": "This is prokinetic dopamine-antagonist action.",
      "Binds dietary phosphate in the gut to reduce phosphate absorption.": "This is phosphate-binder action.",
      "Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.": "This is ARB mechanism, not loop diuretic action.",
    },
    memoryTrick:
      "Loop diuretic = NKCC2 block in the thick ascending limb."
  },
  {
    id: 337,
    type: "match",
    category: "Cardiology",
    question:
      "Q337. Which ONE of the following is the MOST appropriate therapeutic use of Furosemide?",
    options: [
      "Constipation relief and adjunct treatment in hepatic encephalopathy.",
      "Management of secondary hyperparathyroidism in chronic kidney disease.",
      "First-line blood pressure control in uncomplicated hypertension.",
      "Treatment and prophylaxis of venous thromboembolism.",
      "Rapid symptomatic relief in fluid overload and pulmonary edema.",
    ],
    correct: "Rapid symptomatic relief in fluid overload and pulmonary edema.",
    explanation:
      "Furosemide: Rapid symptomatic relief in fluid overload and pulmonary edema.",
    explainCorrect:
      "Option E is correct because furosemide is a loop diuretic used for rapid decongestion in acute fluid overload states, especially pulmonary edema where quick preload reduction relieves dyspnea.",
    wrongOptionExplanations: {
      "Constipation relief and adjunct treatment in hepatic encephalopathy.": "This describes lactulose use, not furosemide.",
      "Management of secondary hyperparathyroidism in chronic kidney disease.": "This is managed with vitamin D analogs/calcimimetics and phosphate control, not loop diuretics.",
      "First-line blood pressure control in uncomplicated hypertension.": "Loop diuretics are not routine first-line agents for uncomplicated hypertension.",
      "Treatment and prophylaxis of venous thromboembolism.": "VTE prevention/treatment requires anticoagulants, not diuretics.",
    },
    memoryTrick:
      "Furosemide for fluid: think 'Furo-SEMIde dries the lungs fast.'",
  },
  {
    id: 338,
    type: "match",
    category: "Cardiology",
    question:
      "Q338. Which ONE of the following is the MOST important safety point to counsel or monitor when using Furosemide?",
    options: [
      "Risk of hyperkalemia is significant; check potassium regularly.",
      "Counsel on dark stools and constipation to improve adherence.",
      "Take with food to reduce gastrointestinal intolerance.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
      "Start low and titrate to reduce hypersensitivity risk.",
    ],
    correct:
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
    explanation:
      "Furosemide: Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
    explainCorrect:
      "Option D is correct because loop diuresis can cause significant potassium loss and intravascular volume depletion, so electrolyte and hydration monitoring is essential for safe use.",
    wrongOptionExplanations: {
      "Risk of hyperkalemia is significant; check potassium regularly.": "Furosemide more commonly causes hypokalemia, not hyperkalemia.",
      "Counsel on dark stools and constipation to improve adherence.": "That counseling fits iron therapy or constipating drugs, not loop diuretics.",
      "Take with food to reduce gastrointestinal intolerance.": "GI intolerance is not the main safety concern; fluid and electrolyte effects are.",
      "Start low and titrate to reduce hypersensitivity risk.": "Dose titration can be used clinically, but key routine safety monitoring is potassium and volume status.",
    },
    memoryTrick:
      "Loop pulls K+ and water out: check 'K and tank' (potassium and volume).",
  },
  {
    id: 339,
    type: "match",
    category: "Cardiology",
    question:
      "Q339. Which ONE of the following best describes the primary mechanism of Atorvastatin?",
    options: [
      "Irreversibly inhibits the gastric H+/K+-ATPase proton pump.",
      "Exchanges sodium for potassium in the gut to reduce serum potassium.",
      "Blocks L-type calcium channels in vascular smooth muscle to reduce peripheral resistance.",
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.",
      "Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.",
    ],
    correct:
      "Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.",
    explanation:
      "Atorvastatin: Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.",
    explainCorrect:
      "Option E is correct because atorvastatin is a statin that inhibits hepatic HMG-CoA reductase, reducing cholesterol synthesis and upregulating LDL receptors to lower LDL-C.",
    wrongOptionExplanations: {
      "Irreversibly inhibits the gastric H+/K+-ATPase proton pump.": "This is the mechanism of proton pump inhibitors such as omeprazole.",
      "Exchanges sodium for potassium in the gut to reduce serum potassium.": "This is the mechanism of potassium binders, not statins.",
      "Blocks L-type calcium channels in vascular smooth muscle to reduce peripheral resistance.": "This describes dihydropyridine calcium channel blockers.",
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.": "This is digoxin's mechanism.",
    },
    memoryTrick:
      "STATin stops cholesterol 'STAT' production at HMG-CoA reductase.",
  },
  {
    id: 340,
    type: "match",
    category: "Cardiology",
    question:
      "Q340. Which ONE of the following is the MOST appropriate therapeutic use of Atorvastatin?",
    options: [
      "Hypertension, especially in patients with diabetic kidney disease.",
      "Long-term anticoagulation for atrial fibrillation or venous thromboembolism.",
      "Add-on control of allergic asthma and exercise-induced symptoms.",
      "Primary and secondary prevention of atherosclerotic cardiovascular disease.",
      "Hyperphosphatemia control in chronic kidney disease.",
    ],
    correct:
      "Primary and secondary prevention of atherosclerotic cardiovascular disease.",
    explanation:
      "Atorvastatin: Primary and secondary prevention of atherosclerotic cardiovascular disease.",
    explainCorrect:
      "Option D is correct because atorvastatin reduces LDL and cardiovascular event risk, so it is used both for primary prevention in high-risk patients and secondary prevention after ASCVD events.",
    wrongOptionExplanations: {
      "Hypertension, especially in patients with diabetic kidney disease.": "BP control is mainly with antihypertensives such as ACE inhibitors/ARBs, not statins.",
      "Long-term anticoagulation for atrial fibrillation or venous thromboembolism.": "AF/VTE anticoagulation requires anticoagulants, not lipid-lowering therapy.",
      "Add-on control of allergic asthma and exercise-induced symptoms.": "Asthma control uses inhaled therapies, not atorvastatin.",
      "Hyperphosphatemia control in chronic kidney disease.": "Phosphate binders and diet are used for CKD hyperphosphatemia.",
    },
    memoryTrick:
      "Atorvastatin protects arteries long-term: LDL down, ASCVD risk down.",
  },
  {
    id: 341,
    type: "match",
    category: "Cardiology",
    question:
      "Q341. Which ONE of the following is the MOST important safety point to counsel or monitor when using Atorvastatin?",
    options: [
      "Take with food to reduce gastrointestinal intolerance.",
      "Pyridoxine supplementation helps prevent peripheral neuropathy.",
      "Report unexplained muscle pain due to risk of statin-associated myopathy.",
      "Risk of hyperkalemia is significant; check potassium regularly.",
      "Counsel on dark stools and constipation to improve adherence.",
    ],
    correct:
      "Report unexplained muscle pain due to risk of statin-associated myopathy.",
    explanation:
      "Atorvastatin: Report unexplained muscle pain due to risk of statin-associated myopathy.",
    explainCorrect:
      "Option C is correct because statin-associated muscle symptoms can indicate myopathy and, rarely, rhabdomyolysis, so new unexplained muscle pain should be reported promptly.",
    wrongOptionExplanations: {
      "Take with food to reduce gastrointestinal intolerance.": "Food timing is not the key safety issue with atorvastatin.",
      "Pyridoxine supplementation helps prevent peripheral neuropathy.": "This counseling is linked to isoniazid use, not statins.",
      "Risk of hyperkalemia is significant; check potassium regularly.": "Hyperkalemia monitoring is not a standard statin safety focus.",
      "Counsel on dark stools and constipation to improve adherence.": "This is unrelated to typical atorvastatin adverse effects.",
    },
    memoryTrick:
      "STATin + sore muscles = stop and speak up early.",
  },
  {
    id: 342,
    type: "match",
    category: "Cardiology",
    question:
      "Q342. Which ONE of the following best describes the primary mechanism of Nitroglycerin?",
    options: [
      "Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.",
      "Inhibits the NKCC2 cotransporter in the thick ascending limb of Henle.",
      "Stimulates erythroid progenitor cells via erythropoietin receptor activation.",
      "Releases nitric oxide causing venodilation and reduced preload.",
      "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.",
    ],
    correct: "Releases nitric oxide causing venodilation and reduced preload.",
    explanation:
      "Nitroglycerin: Releases nitric oxide causing venodilation and reduced preload.",
    explainCorrect:
      "Option D is correct because nitroglycerin is converted to nitric oxide, which increases cGMP and causes predominant venodilation, reducing preload and myocardial oxygen demand.",
    wrongOptionExplanations: {
      "Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.": "This is the mechanism of colchicine.",
      "Inhibits the NKCC2 cotransporter in the thick ascending limb of Henle.": "This is furosemide's mechanism.",
      "Stimulates erythroid progenitor cells via erythropoietin receptor activation.": "This describes erythropoiesis-stimulating agents.",
      "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.": "This is the mechanism of cholinesterase inhibitors.",
    },
    memoryTrick:
      "NITRO gives NO: veins relax first, preload falls fast.",
  },
  {
    id: 343,
    type: "match",
    category: "Cardiology",
    question:
      "Q343. Which ONE of the following is the MOST appropriate therapeutic use of Nitroglycerin?",
    options: [
      "Maintenance bronchodilation in COPD.",
      "Serious gram-positive infections including MRSA.",
      "Immediate relief of acute angina episodes.",
      "Rate control and secondary prevention after myocardial infarction.",
      "Prevention of stent thrombosis and recurrent ischemic events after ACS.",
    ],
    correct: "Immediate relief of acute angina episodes.",
    explanation: "Nitroglycerin: Immediate relief of acute angina episodes.",
    explainCorrect:
      "Option C is correct because short-acting nitroglycerin is used for rapid symptomatic relief during acute angina by lowering preload and myocardial oxygen demand.",
    wrongOptionExplanations: {
      "Maintenance bronchodilation in COPD.": "COPD bronchodilation uses inhaled bronchodilators, not nitrates.",
      "Serious gram-positive infections including MRSA.": "This is an antibiotic indication, not nitrate therapy.",
      "Rate control and secondary prevention after myocardial infarction.": "Rate control and post-MI secondary prevention are mainly with beta-blockers and other cardioprotective drugs, not acute nitrate-only therapy.",
      "Prevention of stent thrombosis and recurrent ischemic events after ACS.": "Stent thrombosis prevention requires antiplatelets/anticoagulation strategies, not nitroglycerin.",
    },
    memoryTrick:
      "Acute chest pain now? Think sublingual nitro now.",
  },
  {
    id: 344,
    type: "match",
    category: "Cardiology",
    question:
      "Q344. Which ONE of the following is the MOST important safety point to counsel or monitor when using Nitroglycerin?",
    options: [
      "Take on an empty stomach consistently to optimize absorption.",
      "Avoid with phosphodiesterase-5 inhibitors because of profound hypotension risk.",
      "Counsel on dark stools and constipation to improve adherence.",
      "Take with food to reduce gastrointestinal intolerance.",
      "Pyridoxine supplementation helps prevent peripheral neuropathy.",
    ],
    correct:
      "Avoid with phosphodiesterase-5 inhibitors because of profound hypotension risk.",
    explanation:
      "Nitroglycerin: Avoid with phosphodiesterase-5 inhibitors because of profound hypotension risk.",
    explainCorrect:
      "Option B is correct because combining nitrates with PDE-5 inhibitors markedly amplifies cGMP-mediated vasodilation and can precipitate dangerous hypotension/syncope.",
    wrongOptionExplanations: {
      "Take on an empty stomach consistently to optimize absorption.": "Food timing is not the critical safety warning for nitrates.",
      "Counsel on dark stools and constipation to improve adherence.": "This counseling is unrelated to nitrate therapy.",
      "Take with food to reduce gastrointestinal intolerance.": "GI intolerance advice is not the key nitrate safety point.",
      "Pyridoxine supplementation helps prevent peripheral neuropathy.": "This is associated with isoniazid, not nitroglycerin.",
    },
    memoryTrick:
      "Nitrate + PDE5 = pressure crash. Never combine.",
  },
  {
    id: 345,
    type: "match",
    category: "Cardiology",
    question:
      "Q345. Which ONE of the following best describes the primary mechanism of Digoxin?",
    options: [
      "Enhances antithrombin activity with predominant inhibition of factor Xa.",
      "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.",
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.",
      "Active vitamin D analog that increases intestinal calcium absorption.",
      "Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.",
    ],
    correct:
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.",
    explanation:
      "Digoxin: Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.",
    explainCorrect:
      "Option C is correct because digoxin inhibits myocardial Na+/K+-ATPase, increasing intracellular calcium (positive inotropy) and enhancing vagal tone at the AV node (slower conduction).",
    wrongOptionExplanations: {
      "Enhances antithrombin activity with predominant inhibition of factor Xa.": "This describes low-molecular-weight heparins, not digoxin.",
      "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.": "This is a beta-lactam antibiotic mechanism.",
      "Active vitamin D analog that increases intestinal calcium absorption.": "This is calcitriol/alfacalcidol pharmacology.",
      "Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.": "This is thiazide diuretic mechanism.",
    },
    memoryTrick:
      "DIGOXIN: 'Dig' into Na/K pump, Ca rises, AV node slows.",
  },
  {
    id: 346,
    type: "match",
    category: "Cardiology",
    question:
      "Q346. Which ONE of the following is the MOST appropriate therapeutic use of Digoxin?",
    options: [
      "Basal glucose control in type 1 and type 2 diabetes.",
      "Symptomatic HFrEF and ventricular rate control in atrial fibrillation.",
      "Immediate relief of acute angina episodes.",
      "Maintenance controller therapy in persistent asthma.",
      "Anaerobic intra-abdominal infections and protozoal disease.",
    ],
    correct:
      "Symptomatic HFrEF and ventricular rate control in atrial fibrillation.",
    explanation:
      "Digoxin: Symptomatic HFrEF and ventricular rate control in atrial fibrillation.",
    explainCorrect:
      "Option B is correct because digoxin may improve symptoms in HFrEF and is useful for ventricular rate control in atrial fibrillation, particularly when additional rate slowing is needed.",
    wrongOptionExplanations: {
      "Basal glucose control in type 1 and type 2 diabetes.": "This is insulin/antidiabetic therapy, not digoxin use.",
      "Immediate relief of acute angina episodes.": "Acute angina is relieved by nitrates, not digoxin.",
      "Maintenance controller therapy in persistent asthma.": "Asthma control uses inhaled corticosteroids and bronchodilators.",
      "Anaerobic intra-abdominal infections and protozoal disease.": "This reflects antimicrobial indications, not cardiac glycoside therapy.",
    },
    memoryTrick:
      "Digoxin does two jobs: boosts failing pump and slows fast AF rate.",
  },
  {
    id: 347,
    type: "match",
    category: "Cardiology",
    question:
      "Q347. Which ONE of the following is the MOST important safety point to counsel or monitor when using Digoxin?",
    options: [
      "Narrow therapeutic index; monitor for toxicity and renal function.",
      "Take with food to reduce gastrointestinal intolerance.",
      "Pyridoxine supplementation helps prevent peripheral neuropathy.",
      "Take on an empty stomach consistently to optimize absorption.",
      "Monitor weight, lipids, and glucose for metabolic adverse effects.",
    ],
    correct:
      "Narrow therapeutic index; monitor for toxicity and renal function.",
    explanation:
      "Digoxin: Narrow therapeutic index; monitor for toxicity and renal function.",
    explainCorrect:
      "Option A is correct because digoxin has a narrow therapeutic window, and toxicity risk rises with impaired renal clearance, electrolyte disturbances, or drug interactions, so close monitoring is essential.",
    wrongOptionExplanations: {
      "Take with food to reduce gastrointestinal intolerance.": "Food timing is not the key safety issue for digoxin.",
      "Pyridoxine supplementation helps prevent peripheral neuropathy.": "This counseling is linked to isoniazid, not digoxin.",
      "Take on an empty stomach consistently to optimize absorption.": "Absorption consistency can matter, but toxicity and renal monitoring are the major safety priorities.",
      "Monitor weight, lipids, and glucose for metabolic adverse effects.": "That monitoring profile fits metabolic drugs, not digoxin's main risk pattern.",
    },
    memoryTrick:
      "Digoxin is 'small-margin': kidneys and toxicity signs must be watched.",
  },
  {
    id: 348,
    type: "match",
    category: "Cardiology",
    question:
      "Q348. Which ONE of the following best describes the primary mechanism of Clopidogrel?",
    options: [
      "Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.",
      "Irreversibly inhibits platelet P2Y12 receptors to reduce platelet aggregation.",
      "Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.",
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.",
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.",
    ],
    correct:
      "Irreversibly inhibits platelet P2Y12 receptors to reduce platelet aggregation.",
    explanation:
      "Clopidogrel: Irreversibly inhibits platelet P2Y12 receptors to reduce platelet aggregation.",
    explainCorrect:
      "Option B is correct because clopidogrel irreversibly blocks platelet ADP (P2Y12) receptors, reducing ADP-mediated platelet activation and aggregation for the life of exposed platelets.",
    wrongOptionExplanations: {
      "Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.": "This is vancomycin's antibacterial mechanism.",
      "Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.": "This is a beta-blocker mechanism.",
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.": "This is digoxin's mechanism.",
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.": "This is an inhaled antimuscarinic bronchodilator mechanism.",
    },
    memoryTrick:
      "CLOP-idogrel 'clops' platelet P2Y12 signaling off for that platelet's life.",
  },
  {
    id: 349,
    type: "match",
    category: "Cardiology",
    question:
      "Q349. Which ONE of the following is the MOST appropriate therapeutic use of Clopidogrel?",
    options: [
      "Prevention of stent thrombosis and recurrent ischemic events after ACS.",
      "Relief of acute bronchospasm in asthma.",
      "Inflammatory acne and selected atypical infections.",
      "First-line pharmacotherapy in type 2 diabetes.",
      "Short-course treatment of moderate to severe inflammatory flares.",
    ],
    correct:
      "Prevention of stent thrombosis and recurrent ischemic events after ACS.",
    explanation:
      "Clopidogrel: Prevention of stent thrombosis and recurrent ischemic events after ACS.",
    explainCorrect:
      "Option A is correct because clopidogrel is a core antiplatelet agent after ACS and PCI to reduce stent thrombosis and recurrent atherothrombotic events.",
    wrongOptionExplanations: {
      "Relief of acute bronchospasm in asthma.": "Acute bronchospasm is treated with bronchodilators, not antiplatelets.",
      "Inflammatory acne and selected atypical infections.": "This reflects antimicrobial/dermatologic indications, not clopidogrel.",
      "First-line pharmacotherapy in type 2 diabetes.": "Type 2 diabetes therapy uses glucose-lowering drugs, not clopidogrel.",
      "Short-course treatment of moderate to severe inflammatory flares.": "Inflammatory flares are managed with anti-inflammatory/immunosuppressive agents, not antiplatelets.",
    },
    memoryTrick:
      "After ACS or stent, keep platelets quiet: clopidogrel helps keep stents open.",
  },
  {
    id: 350,
    type: "match",
    category: "Cardiology",
    question:
      "Q350. Which ONE of the following is the MOST important safety point to counsel or monitor when using Clopidogrel?",
    options: [
      "Pyridoxine supplementation helps prevent peripheral neuropathy.",
      "Take on an empty stomach consistently to optimize absorption.",
      "Monitor weight, lipids, and glucose for metabolic adverse effects.",
      "QT prolongation risk increases in susceptible patients.",
      "Bleeding risk is the main concern; assess for bruising and GI bleeding.",
    ],
    correct:
      "Bleeding risk is the main concern; assess for bruising and GI bleeding.",
    explanation:
      "Clopidogrel: Bleeding risk is the main concern; assess for bruising and GI bleeding.",
    explainCorrect:
      "Option E is correct because clopidogrel inhibits platelet function, so the major safety concern is bleeding, including easy bruising and occult or overt gastrointestinal blood loss.",
    wrongOptionExplanations: {
      "Pyridoxine supplementation helps prevent peripheral neuropathy.": "This advice applies to isoniazid-associated neuropathy prevention, not clopidogrel.",
      "Take on an empty stomach consistently to optimize absorption.": "Absorption timing is not the primary safety counseling priority.",
      "Monitor weight, lipids, and glucose for metabolic adverse effects.": "This monitoring profile does not address clopidogrel's main risk.",
      "QT prolongation risk increases in susceptible patients.": "QT monitoring is not the central routine safety issue with clopidogrel.",
    },
    memoryTrick:
      "Platelet blocker means bleed checker: watch bruises, stools, and gums.",
  },
  {
    id: 351,
    type: "match",
    category: "Clinical Documentation",
    question:
      "Q351. Which ONE of the following best describes the primary mechanism of Warfarin?",
    options: [
      "Inhibits vitamin K epoxide reductase, lowering synthesis of factors II, VII, IX, and X.",
      "Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.",
      "Stimulates beta-2 receptors causing rapid bronchodilation.",
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.",
      "Reduces hepatic glucose output and improves insulin sensitivity.",
    ],
    correct:
      "Inhibits vitamin K epoxide reductase, lowering synthesis of factors II, VII, IX, and X.",
    explanation:
      "Warfarin: Inhibits vitamin K epoxide reductase, lowering synthesis of factors II, VII, IX, and X.",
    explainCorrect:
      "Option A is correct because warfarin blocks vitamin K recycling (VKORC1), reducing hepatic activation of vitamin K-dependent clotting factors II, VII, IX, and X.",
    wrongOptionExplanations: {
      "Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.": "This is the mechanism of statins.",
      "Stimulates beta-2 receptors causing rapid bronchodilation.": "This is a beta-2 agonist bronchodilator mechanism.",
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.": "This is an antibiotic mechanism, not anticoagulation.",
      "Reduces hepatic glucose output and improves insulin sensitivity.": "This is metformin pharmacology.",
    },
    memoryTrick:
      "WARfarin wages war on Vitamin K recycling, so clotting factors fall.",
  },
  {
    id: 352,
    type: "match",
    category: "Clinical Documentation",
    question:
      "Q352. Which ONE of the following is the MOST appropriate therapeutic use of Warfarin?",
    options: [
      "Complicated urinary tract infections due to susceptible organisms.",
      "Mucosal candidiasis and selected systemic fungal infections.",
      "Hyperthyroidism, especially thyroid storm management.",
      "Maintenance treatment of bipolar disorder.",
      "Long-term anticoagulation for atrial fibrillation or venous thromboembolism.",
    ],
    correct:
      "Long-term anticoagulation for atrial fibrillation or venous thromboembolism.",
    explanation:
      "Warfarin: Long-term anticoagulation for atrial fibrillation or venous thromboembolism.",
    explainCorrect:
      "Option E is correct because warfarin is used for chronic anticoagulation in conditions such as atrial fibrillation and venous thromboembolism when sustained thromboembolic risk reduction is required.",
    wrongOptionExplanations: {
      "Complicated urinary tract infections due to susceptible organisms.": "This is an antimicrobial indication, not warfarin use.",
      "Mucosal candidiasis and selected systemic fungal infections.": "This describes antifungal therapy, not anticoagulation.",
      "Hyperthyroidism, especially thyroid storm management.": "Thyroid storm management uses antithyroid agents and supportive therapy, not warfarin.",
      "Maintenance treatment of bipolar disorder.": "Bipolar maintenance uses mood stabilizers/psychiatric therapy, not anticoagulants.",
    },
    memoryTrick:
      "Warfarin is for long-game clot prevention in AF and VTE.",
  },
  {
    id: 353,
    type: "match",
    category: "Clinical Documentation",
    question:
      "Q353. Which ONE of the following is the MOST important safety point to counsel or monitor when using Warfarin?",
    options: [
      "Monitor weight, lipids, and glucose for metabolic adverse effects.",
      "QT prolongation risk increases in susceptible patients.",
      "Water intoxication and hyponatremia are key monitoring concerns.",
      "INR monitoring and clear documentation of target range are essential.",
      "Take on an empty stomach consistently to optimize absorption.",
    ],
    correct:
      "INR monitoring and clear documentation of target range are essential.",
    explanation:
      "Warfarin: INR monitoring and clear documentation of target range are essential.",
    explainCorrect:
      "Option D is correct because warfarin response varies with diet, interactions, and genetics, so INR monitoring with documented target range is required to balance clot prevention against bleeding risk.",
    wrongOptionExplanations: {
      "Monitor weight, lipids, and glucose for metabolic adverse effects.": "These are not the key safety endpoints for warfarin dosing.",
      "QT prolongation risk increases in susceptible patients.": "QT risk is not the primary routine issue with warfarin.",
      "Water intoxication and hyponatremia are key monitoring concerns.": "These concerns fit other drugs, not vitamin K antagonists.",
      "Take on an empty stomach consistently to optimize absorption.": "Administration timing is secondary; INR-guided monitoring is central.",
    },
    memoryTrick:
      "Warfarin without INR is unsafe: dose follows INR, not guesswork.",
  },
  {
    id: 354,
    type: "match",
    category: "Haematology",
    question:
      "Q354. Which ONE of the following best describes the primary mechanism of Enoxaparin?",
    options: [
      "Supplies elemental iron required for hemoglobin synthesis.",
      "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.",
      "Inhibits mycolic acid synthesis in mycobacterial cell walls.",
      "Replaces deficient thyroxine (T4) hormone.",
      "Enhances antithrombin activity with predominant inhibition of factor Xa.",
    ],
    correct:
      "Enhances antithrombin activity with predominant inhibition of factor Xa.",
    explanation:
      "Enoxaparin: Enhances antithrombin activity with predominant inhibition of factor Xa.",
    explainCorrect:
      "Option E is correct because enoxaparin (an LMWH) potentiates antithrombin and preferentially inhibits factor Xa, reducing thrombin generation and clot propagation.",
    wrongOptionExplanations: {
      "Supplies elemental iron required for hemoglobin synthesis.": "This describes iron therapy, not anticoagulation.",
      "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.": "This is an antibiotic combination mechanism.",
      "Inhibits mycolic acid synthesis in mycobacterial cell walls.": "This is isoniazid-related antimycobacterial action.",
      "Replaces deficient thyroxine (T4) hormone.": "This is levothyroxine replacement therapy.",
    },
    memoryTrick:
      "ENOXaparin = anti-Xa focus via antithrombin enhancement.",
  },
  {
    id: 355,
    type: "match",
    category: "Haematology",
    question:
      "Q355. Which ONE of the following is the MOST appropriate therapeutic use of Enoxaparin?",
    options: [
      "Long-term management of hypothyroidism.",
      "Schizophrenia and related psychotic disorders.",
      "Prevention of chemotherapy-induced nausea and vomiting.",
      "Treatment and prophylaxis of venous thromboembolism.",
      "Tuberculosis treatment and latent TB therapy protocols.",
    ],
    correct: "Treatment and prophylaxis of venous thromboembolism.",
    explanation:
      "Enoxaparin: Treatment and prophylaxis of venous thromboembolism.",
    explainCorrect:
      "Option D is correct because enoxaparin is widely used for both prevention and treatment of VTE in medical, surgical, and high-risk immobilized patients.",
    wrongOptionExplanations: {
      "Long-term management of hypothyroidism.": "Hypothyroidism is treated with thyroid hormone replacement, not LMWH.",
      "Schizophrenia and related psychotic disorders.": "Psychotic disorders require antipsychotic therapy, not anticoagulation.",
      "Prevention of chemotherapy-induced nausea and vomiting.": "CINV prevention uses antiemetics, not enoxaparin.",
      "Tuberculosis treatment and latent TB therapy protocols.": "TB treatment is antimicrobial, not antithrombotic.",
    },
    memoryTrick:
      "Enoxaparin = clot prevention and clot treatment in veins.",
  },
  {
    id: 356,
    type: "match",
    category: "Haematology",
    question:
      "Q356. Which ONE of the following is the MOST important safety point to counsel or monitor when using Enoxaparin?",
    options: [
      "Water intoxication and hyponatremia are key monitoring concerns.",
      "Can cause bradycardia; monitor pulse and symptoms of dizziness.",
      "Dose must be adjusted in severe renal impairment to avoid accumulation.",
      "Monitor weight, lipids, and glucose for metabolic adverse effects.",
      "QT prolongation risk increases in susceptible patients.",
    ],
    correct:
      "Dose must be adjusted in severe renal impairment to avoid accumulation.",
    explanation:
      "Enoxaparin: Dose must be adjusted in severe renal impairment to avoid accumulation.",
    explainCorrect:
      "Option C is correct because enoxaparin is renally cleared; severe renal dysfunction increases drug exposure and bleeding risk unless dosing is adjusted.",
    wrongOptionExplanations: {
      "Water intoxication and hyponatremia are key monitoring concerns.": "These are not principal safety issues for enoxaparin.",
      "Can cause bradycardia; monitor pulse and symptoms of dizziness.": "Bradycardia monitoring is not a standard enoxaparin concern.",
      "Monitor weight, lipids, and glucose for metabolic adverse effects.": "This does not address LMWH's primary safety profile.",
      "QT prolongation risk increases in susceptible patients.": "QT prolongation is not a key routine issue with enoxaparin.",
    },
    memoryTrick:
      "Kidneys clear enoxaparin: poor renal function means dose down.",
  },
  {
    id: 357,
    type: "match",
    category: "Obstetrics",
    question:
      "Q357. Which ONE of the following best describes the primary mechanism of Ferrous sulfate?",
    options: [
      "Induces adaptive immune response against influenza surface antigens.",
      "Inhibits renal SGLT2 to increase urinary glucose excretion.",
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
      "Supplies elemental iron required for hemoglobin synthesis.",
      "Blocks cysteinyl leukotriene-1 receptors in the airway.",
    ],
    correct: "Supplies elemental iron required for hemoglobin synthesis.",
    explanation:
      "Ferrous sulfate: Supplies elemental iron required for hemoglobin synthesis.",
    explainCorrect:
      "Option D is correct because ferrous sulfate provides absorbable elemental iron needed for heme formation and red blood cell hemoglobin synthesis in iron deficiency states.",
    wrongOptionExplanations: {
      "Induces adaptive immune response against influenza surface antigens.": "This describes influenza vaccination, not iron supplementation.",
      "Inhibits renal SGLT2 to increase urinary glucose excretion.": "This is the mechanism of SGLT2 inhibitors.",
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.": "This describes tricyclic antidepressant pharmacology.",
      "Blocks cysteinyl leukotriene-1 receptors in the airway.": "This is montelukast-type leukotriene receptor blockade.",
    },
    memoryTrick:
      "Ferrous sulfate feeds hemoglobin: no iron, no red oxygen-carrying power.",
  },
  {
    id: 358,
    type: "match",
    category: "Obstetrics",
    question:
      "Q358. Which ONE of the following is the MOST appropriate therapeutic use of Ferrous sulfate?",
    options: [
      "GERD and peptic ulcer disease acid suppression.",
      "Adjunctive management of non-emergent hyperkalemia.",
      "Treatment of iron deficiency anemia during pregnancy.",
      "Add-on glycemic control in type 2 diabetes.",
      "Short-term control of acute psychosis or severe agitation.",
    ],
    correct: "Treatment of iron deficiency anemia during pregnancy.",
    explanation:
      "Ferrous sulfate: Treatment of iron deficiency anemia during pregnancy.",
    explainCorrect:
      "Option C is correct because iron demand rises in pregnancy, and oral ferrous sulfate is first-line for prevention and treatment of maternal iron deficiency anemia.",
    wrongOptionExplanations: {
      "GERD and peptic ulcer disease acid suppression.": "Acid suppression is done with PPIs or H2 blockers, not iron salts.",
      "Adjunctive management of non-emergent hyperkalemia.": "Hyperkalemia is managed with potassium-lowering strategies, not ferrous sulfate.",
      "Add-on glycemic control in type 2 diabetes.": "Glucose control uses antidiabetic medicines, not iron replacement.",
      "Short-term control of acute psychosis or severe agitation.": "Psychosis/agitation treatment requires psychiatric medications, not iron therapy.",
    },
    memoryTrick:
      "Pregnancy plus low Hb often means iron first: build maternal and fetal oxygen capacity.",
  },
  {
    id: 359,
    type: "match",
    category: "Obstetrics",
    question:
      "Q359. Which ONE of the following is the MOST important safety point to counsel or monitor when using Ferrous sulfate?",
    options: [
      "Narrow therapeutic index; monitor for toxicity and renal function.",
      "Counsel on dark stools and constipation to improve adherence.",
      "QT prolongation risk increases in susceptible patients.",
      "Water intoxication and hyponatremia are key monitoring concerns.",
      "Can cause bradycardia; monitor pulse and symptoms of dizziness.",
    ],
    correct: "Counsel on dark stools and constipation to improve adherence.",
    explanation:
      "Ferrous sulfate: Counsel on dark stools and constipation to improve adherence.",
    explainCorrect:
      "Option B is correct because common iron adverse effects include dark stools and constipation; proactive counseling improves adherence and prevents unnecessary alarm.",
    wrongOptionExplanations: {
      "Narrow therapeutic index; monitor for toxicity and renal function.": "This is classic digoxin-style counseling, not routine oral iron counseling.",
      "QT prolongation risk increases in susceptible patients.": "QT prolongation is not a primary ferrous sulfate safety issue.",
      "Water intoxication and hyponatremia are key monitoring concerns.": "These concerns are unrelated to standard oral iron use.",
      "Can cause bradycardia; monitor pulse and symptoms of dizziness.": "Bradycardia monitoring is not a key concern with ferrous sulfate.",
    },
    memoryTrick:
      "Iron often darkens stool and slows bowel: warn early to keep adherence high.",
  },
  {
    id: 360,
    type: "match",
    category: "Laboratory Medicine",
    question:
      "Q360. Which ONE of the following best describes the primary mechanism of Epoetin alfa?",
    options: [
      "Inhibits osteoclast-mediated bone resorption as a bisphosphonate.",
      "Blocks voltage-gated sodium channels in overactive neurons.",
      "Stimulates erythroid progenitor cells via erythropoietin receptor activation.",
      "Generates free-radical metabolites that damage DNA in anaerobes and protozoa.",
      "Provides prolonged basal insulin activity with minimal peak.",
    ],
    correct:
      "Stimulates erythroid progenitor cells via erythropoietin receptor activation.",
    explanation:
      "Epoetin alfa: Stimulates erythroid progenitor cells via erythropoietin receptor activation.",
    explainCorrect:
      "Option C is correct because epoetin alfa is a recombinant erythropoiesis-stimulating agent that activates EPO receptors in bone marrow to increase red cell production.",
    wrongOptionExplanations: {
      "Inhibits osteoclast-mediated bone resorption as a bisphosphonate.": "This is a bisphosphonate mechanism.",
      "Blocks voltage-gated sodium channels in overactive neurons.": "This describes several antiepileptic/local anesthetic mechanisms.",
      "Generates free-radical metabolites that damage DNA in anaerobes and protozoa.": "This is metronidazole's antimicrobial mechanism.",
      "Provides prolonged basal insulin activity with minimal peak.": "This is long-acting insulin pharmacology.",
    },
    memoryTrick:
      "EPOetin acts like EPO: push marrow to make more erythrocytes.",
  },
  {
    id: 361,
    type: "match",
    category: "Laboratory Medicine",
    question:
      "Q361. Which ONE of the following is the MOST appropriate therapeutic use of Epoetin alfa?",
    options: [
      "Reduction of intraocular pressure in open-angle glaucoma.",
      "Anemia of chronic kidney disease to reduce transfusion need.",
      "Neuropathic pain and selected depressive disorders.",
      "Seizure control and bipolar depression maintenance.",
      "Prevention and treatment of documented hypokalemia.",
    ],
    correct: "Anemia of chronic kidney disease to reduce transfusion need.",
    explanation:
      "Epoetin alfa: Anemia of chronic kidney disease to reduce transfusion need.",
    explainCorrect:
      "Option B is correct because reduced endogenous erythropoietin in CKD causes anemia, and epoetin alfa is used to raise hemoglobin and reduce transfusion requirements.",
    wrongOptionExplanations: {
      "Reduction of intraocular pressure in open-angle glaucoma.": "Glaucoma treatment uses ocular pressure-lowering drugs, not ESAs.",
      "Neuropathic pain and selected depressive disorders.": "These are indications for specific neuromodulatory/antidepressant agents, not epoetin.",
      "Seizure control and bipolar depression maintenance.": "This reflects anticonvulsant/mood-stabilizer roles, not epoetin use.",
      "Prevention and treatment of documented hypokalemia.": "Hypokalemia is corrected with potassium replacement, not erythropoiesis stimulation.",
    },
    memoryTrick:
      "CKD anemia often lacks EPO, so epoetin replaces the missing signal.",
  },
  {
    id: 362,
    type: "match",
    category: "Laboratory Medicine",
    question:
      "Q362. Which ONE of the following is the MOST important safety point to counsel or monitor when using Epoetin alfa?",
    options: [
      "Hemoglobin should not rise too quickly; monitor Hb to reduce thrombotic risk.",
      "Water intoxication and hyponatremia are key monitoring concerns.",
      "Can cause bradycardia; monitor pulse and symptoms of dizziness.",
      "Narrow therapeutic index; monitor for toxicity and renal function.",
      "Not for acute symptom relief; provide a rescue inhaler separately.",
    ],
    correct:
      "Hemoglobin should not rise too quickly; monitor Hb to reduce thrombotic risk.",
    explanation:
      "Epoetin alfa: Hemoglobin should not rise too quickly; monitor Hb to reduce thrombotic risk.",
    explainCorrect:
      "Option A is correct because overcorrection or rapid hemoglobin rise with ESA therapy increases thromboembolic and cardiovascular risk, so hemoglobin targets and rate of rise must be monitored.",
    wrongOptionExplanations: {
      "Water intoxication and hyponatremia are key monitoring concerns.": "These are not core ESA safety targets.",
      "Can cause bradycardia; monitor pulse and symptoms of dizziness.": "Bradycardia is not the main monitoring issue with epoetin alfa.",
      "Narrow therapeutic index; monitor for toxicity and renal function.": "This is not the principal counseling frame for epoetin dosing.",
      "Not for acute symptom relief; provide a rescue inhaler separately.": "This advice relates to inhaled controller therapy, not ESAs.",
    },
    memoryTrick:
      "With ESA, slow and steady Hb rise is safer than fast correction.",
  },
  {
    id: 363,
    type: "match",
    category: "Respiratory",
    question:
      "Q363. Which ONE of the following best describes the primary mechanism of Salbutamol?",
    options: [
      "Dopamine D2 antagonism with prokinetic effects on upper GI tract.",
      "Stimulates beta-2 receptors causing rapid bronchodilation.",
      "Inhibits fungal lanosterol 14-alpha-demethylase, reducing ergosterol synthesis.",
      "Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.",
      "Modulates intracellular signaling pathways involved in mood stabilization.",
    ],
    correct: "Stimulates beta-2 receptors causing rapid bronchodilation.",
    explanation:
      "Salbutamol: Stimulates beta-2 receptors causing rapid bronchodilation.",
    explainCorrect:
      "Option B is correct because salbutamol is a short-acting beta-2 agonist that relaxes bronchial smooth muscle quickly, providing fast bronchodilation.",
    wrongOptionExplanations: {
      "Dopamine D2 antagonism with prokinetic effects on upper GI tract.": "This describes metoclopramide-like action.",
      "Inhibits fungal lanosterol 14-alpha-demethylase, reducing ergosterol synthesis.": "This is an azole antifungal mechanism.",
      "Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.": "This matches antithyroid drug effects, not bronchodilator action.",
      "Modulates intracellular signaling pathways involved in mood stabilization.": "This is related to mood stabilizer effects, not salbutamol.",
    },
    memoryTrick:
      "SALbutamol 'saves airways' fast through beta-2 bronchodilation.",
  },
  {
    id: 364,
    type: "match",
    category: "Respiratory",
    question:
      "Q364. Which ONE of the following is the MOST appropriate therapeutic use of Salbutamol?",
    options: [
      "Relief of acute bronchospasm in asthma.",
      "Adjunct or monotherapy for focal and generalized seizures.",
      "Symptomatic treatment of mild-to-moderate Alzheimer disease.",
      "Acute gout flare treatment and flare prophylaxis when starting ULT.",
      "Rapid symptomatic relief in fluid overload and pulmonary edema.",
    ],
    correct: "Relief of acute bronchospasm in asthma.",
    explanation: "Salbutamol: Relief of acute bronchospasm in asthma.",
    explainCorrect:
      "Option A is correct because inhaled salbutamol is the rescue medication for rapid relief of acute bronchospasm and wheeze in asthma.",
    wrongOptionExplanations: {
      "Adjunct or monotherapy for focal and generalized seizures.": "Seizure management uses antiepileptic drugs, not salbutamol.",
      "Symptomatic treatment of mild-to-moderate Alzheimer disease.": "Alzheimer symptomatic therapy uses cognitive enhancers, not beta-2 agonists.",
      "Acute gout flare treatment and flare prophylaxis when starting ULT.": "Gout treatment involves anti-inflammatory and urate-lowering strategies, not salbutamol.",
      "Rapid symptomatic relief in fluid overload and pulmonary edema.": "Pulmonary edema relief is primarily with diuretics/vasodilators, not salbutamol.",
    },
    memoryTrick:
      "Asthma attack now: reach for salbutamol rescue first.",
  },
  {
    id: 365,
    type: "match",
    category: "Respiratory",
    question:
      "Q365. Which ONE of the following is the MOST important safety point to counsel or monitor when using Salbutamol?",
    options: [
      "Can cause bradycardia; monitor pulse and symptoms of dizziness.",
      "Narrow therapeutic index; monitor for toxicity and renal function.",
      "Not for acute symptom relief; provide a rescue inhaler separately.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
      "Excess use may indicate poor control; reassess controller therapy.",
    ],
    correct:
      "Excess use may indicate poor control; reassess controller therapy.",
    explanation:
      "Salbutamol: Excess use may indicate poor control; reassess controller therapy.",
    explainCorrect:
      "Option E is correct because frequent SABA use is a marker of uncontrolled airway inflammation and should trigger review and optimization of controller treatment (for example inhaled corticosteroids).",
    wrongOptionExplanations: {
      "Can cause bradycardia; monitor pulse and symptoms of dizziness.": "Salbutamol more often causes tachycardia/tremor, not bradycardia.",
      "Narrow therapeutic index; monitor for toxicity and renal function.": "This is not standard routine counseling for inhaled salbutamol.",
      "Not for acute symptom relief; provide a rescue inhaler separately.": "This statement fits controller inhalers, whereas salbutamol itself is the rescue inhaler.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.": "TDM for nephrotoxicity applies to other drug classes, not salbutamol.",
    },
    memoryTrick:
      "Too many puffs means poor control: rescue overuse signals controller review.",
  },
  {
    id: 366,
    type: "match",
    category: "Respiratory",
    question:
      "Q366. Which ONE of the following best describes the primary mechanism of Budesonide (inhaled)?",
    options: [
      "Reduces airway inflammation by glucocorticoid receptor-mediated gene regulation.",
      "Inhibits DPP-4, prolonging endogenous incretin action.",
      "Potent dopamine D2 receptor antagonism in mesolimbic pathways.",
      "Irreversibly inhibits the gastric H+/K+-ATPase proton pump.",
      "Exchanges sodium for potassium in the gut to reduce serum potassium.",
    ],
    correct:
      "Reduces airway inflammation by glucocorticoid receptor-mediated gene regulation.",
    explanation:
      "Budesonide (inhaled): Reduces airway inflammation by glucocorticoid receptor-mediated gene regulation.",
    explainCorrect:
      "Option A is correct because inhaled budesonide is a corticosteroid that modifies inflammatory gene transcription via glucocorticoid receptors, reducing chronic airway inflammation and exacerbation risk.",
    wrongOptionExplanations: {
      "Inhibits DPP-4, prolonging endogenous incretin action.": "This is the mechanism of DPP-4 inhibitors used in diabetes.",
      "Potent dopamine D2 receptor antagonism in mesolimbic pathways.": "This is antipsychotic pharmacology.",
      "Irreversibly inhibits the gastric H+/K+-ATPase proton pump.": "This is proton pump inhibitor action.",
      "Exchanges sodium for potassium in the gut to reduce serum potassium.": "This describes potassium binders, not inhaled corticosteroids.",
    },
    memoryTrick:
      "Budesonide builds control, not instant relief: it calms airway inflammation over time.",
  },
  {
    id: 367,
    type: "match",
    category: "Respiratory",
    question:
      "Q367. Which ONE of the following is the MOST appropriate therapeutic use of Budesonide (inhaled)?",
    options: [
      "Induction and maintenance therapy in ulcerative colitis.",
      "Long-term urate-lowering therapy in recurrent gout.",
      "Resistant hypertension and mortality reduction in HFrEF.",
      "Treatment and prophylaxis of venous thromboembolism.",
      "Maintenance controller therapy in persistent asthma.",
    ],
    correct: "Maintenance controller therapy in persistent asthma.",
    explanation:
      "Budesonide (inhaled): Maintenance controller therapy in persistent asthma.",
    explainCorrect:
      "Option E is correct because inhaled budesonide is a controller corticosteroid used daily to reduce airway inflammation, prevent exacerbations, and improve long-term asthma stability.",
    wrongOptionExplanations: {
      "Induction and maintenance therapy in ulcerative colitis.": "That indication is for gastrointestinal formulations/other anti-inflammatory regimens, not standard inhaled asthma control use.",
      "Long-term urate-lowering therapy in recurrent gout.": "Urate-lowering therapy uses agents such as allopurinol/febuxostat, not inhaled corticosteroids.",
      "Resistant hypertension and mortality reduction in HFrEF.": "These are cardiovascular indications managed with antihypertensive/HF drugs, not budesonide inhalers.",
      "Treatment and prophylaxis of venous thromboembolism.": "VTE prevention/treatment requires anticoagulants, not inhaled steroids.",
    },
    memoryTrick:
      "Budesonide is a builder, not a rescuer: daily control, not instant relief.",
  },
  {
    id: 368,
    type: "match",
    category: "Respiratory",
    question:
      "Q368. Which ONE of the following is the MOST important safety point to counsel or monitor when using Budesonide (inhaled)?",
    options: [
      "Not for acute symptom relief; provide a rescue inhaler separately.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
      "Risk of hypoglycemia is increased with missed meals.",
      "Rinse mouth after inhalation to reduce oral candidiasis risk.",
      "Narrow therapeutic index; monitor for toxicity and renal function.",
    ],
    correct: "Rinse mouth after inhalation to reduce oral candidiasis risk.",
    explanation:
      "Budesonide (inhaled): Rinse mouth after inhalation to reduce oral candidiasis risk.",
    explainCorrect:
      "Option D is correct because inhaled corticosteroid residue in the oropharynx can promote local candidiasis and dysphonia; rinsing/spitting after use lowers this risk.",
    wrongOptionExplanations: {
      "Not for acute symptom relief; provide a rescue inhaler separately.": "This is also important counseling, but the specific key safety step for ICS adverse-effect reduction is mouth rinsing.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.": "Routine TDM for nephrotoxicity does not apply to inhaled budesonide.",
      "Risk of hypoglycemia is increased with missed meals.": "This concern relates to glucose-lowering agents, not inhaled corticosteroids.",
      "Narrow therapeutic index; monitor for toxicity and renal function.": "This is not the central counseling framework for inhaled budesonide.",
    },
    memoryTrick:
      "After ICS, rinse to win: clean mouth, less thrush.",
  },
  {
    id: 369,
    type: "match",
    category: "Respiratory",
    question:
      "Q369. Which ONE of the following best describes the primary mechanism of Tiotropium?",
    options: [
      "Selectively inhibits serotonin reuptake in the CNS.",
      "Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.",
      "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.",
      "Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.",
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.",
    ],
    correct:
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.",
    explanation:
      "Tiotropium: Long-acting muscarinic receptor blockade in bronchial smooth muscle.",
    explainCorrect:
      "Option E is correct because tiotropium is a long-acting muscarinic antagonist (LAMA) that blocks airway M3-mediated bronchoconstriction, producing sustained bronchodilation.",
    wrongOptionExplanations: {
      "Selectively inhibits serotonin reuptake in the CNS.": "This is SSRI antidepressant pharmacology.",
      "Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.": "This is levetiracetam's antiepileptic mechanism.",
      "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.": "This mechanism belongs to cholinesterase inhibitors, not tiotropium.",
      "Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.": "This is colchicine's mechanism.",
    },
    memoryTrick:
      "TIOtropium turns OFF muscarinic bronchospasm for long-lasting opening.",
  },
  {
    id: 370,
    type: "match",
    category: "Respiratory",
    question:
      "Q370. Which ONE of the following is the MOST appropriate therapeutic use of Tiotropium?",
    options: [
      "First-line blood pressure control in uncomplicated hypertension.",
      "Long-term anticoagulation for atrial fibrillation or venous thromboembolism.",
      "Susceptible upper respiratory and skin infections.",
      "Maintenance bronchodilation in COPD.",
      "Management of secondary hyperparathyroidism in chronic kidney disease.",
    ],
    correct: "Maintenance bronchodilation in COPD.",
    explanation: "Tiotropium: Maintenance bronchodilation in COPD.",
    explainCorrect:
      "Option D is correct because tiotropium is a maintenance inhaler for COPD that improves airflow and symptoms over time; it is not intended as a rescue medication.",
    wrongOptionExplanations: {
      "First-line blood pressure control in uncomplicated hypertension.": "Hypertension first-line therapy uses antihypertensives, not LAMA inhalers.",
      "Long-term anticoagulation for atrial fibrillation or venous thromboembolism.": "Anticoagulation requires antithrombotic drugs, not tiotropium.",
      "Susceptible upper respiratory and skin infections.": "These are antibiotic indications, not bronchodilator indications.",
      "Management of secondary hyperparathyroidism in chronic kidney disease.": "This is managed with CKD-mineral bone therapies, not tiotropium.",
    },
    memoryTrick:
      "COPD maintenance? Think tiotropium daily, not emergency use.",
  },
  {
    id: 371,
    type: "match",
    category: "Respiratory",
    question:
      "Q371. Which ONE of the following is the MOST important safety point to counsel or monitor when using Tiotropium?",
    options: [
      "Risk of hypoglycemia is increased with missed meals.",
      "Clinical benefit is delayed; adherence in first weeks is important.",
      "Not for acute symptom relief; provide a rescue inhaler separately.",
      "Rinse mouth after inhalation to reduce oral candidiasis risk.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
    ],
    correct:
      "Not for acute symptom relief; provide a rescue inhaler separately.",
    explanation:
      "Tiotropium: Not for acute symptom relief; provide a rescue inhaler separately.",
    explainCorrect:
      "Option C is correct because tiotropium has a maintenance role and slower onset than rescue bronchodilators, so patients must keep a short-acting reliever for acute dyspnea.",
    wrongOptionExplanations: {
      "Risk of hypoglycemia is increased with missed meals.": "This does not reflect tiotropium's safety profile.",
      "Clinical benefit is delayed; adherence in first weeks is important.": "This is generally true for maintenance therapy, but the critical safety counseling distinction is that it is not a rescue inhaler.",
      "Rinse mouth after inhalation to reduce oral candidiasis risk.": "This is key for inhaled corticosteroids, not LAMA inhalers.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.": "Routine TDM nephrotoxicity counseling is not standard for tiotropium.",
    },
    memoryTrick:
      "TIO is for tomorrow breathing, not today's attack.",
  },
  {
    id: 372,
    type: "match",
    category: "Allergy and Immunology",
    question:
      "Q372. Which ONE of the following best describes the primary mechanism of Montelukast?",
    options: [
      "Osmotically retains water in the bowel and reduces ammonia absorption.",
      "Active vitamin D analog that increases intestinal calcium absorption.",
      "Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.",
      "Blocks cysteinyl leukotriene-1 receptors in the airway.",
      "Enhances GABAergic transmission and modulates neuronal firing.",
    ],
    correct: "Blocks cysteinyl leukotriene-1 receptors in the airway.",
    explanation:
      "Montelukast: Blocks cysteinyl leukotriene-1 receptors in the airway.",
    explainCorrect:
      "Option D is correct because montelukast antagonizes CysLT1 receptors, reducing leukotriene-driven bronchoconstriction and airway inflammatory signaling.",
    wrongOptionExplanations: {
      "Osmotically retains water in the bowel and reduces ammonia absorption.": "This is lactulose-type action.",
      "Active vitamin D analog that increases intestinal calcium absorption.": "This describes calcitriol/alfacalcidol effects.",
      "Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.": "This is thiazide diuretic mechanism.",
      "Enhances GABAergic transmission and modulates neuronal firing.": "This represents CNS anticonvulsant/anxiolytic mechanisms, not montelukast.",
    },
    memoryTrick:
      "MONTE-lukast mounts a block on leukotriene airway signals.",
  },
  {
    id: 373,
    type: "match",
    category: "Allergy and Immunology",
    question:
      "Q373. Which ONE of the following is the MOST appropriate therapeutic use of Montelukast?",
    options: [
      "Maintenance bronchodilation in COPD.",
      "Annual prevention of influenza and severe complications.",
      "Add-on control of allergic asthma and exercise-induced symptoms.",
      "Hypertension, especially in patients with diabetic kidney disease.",
      "Prevention of stent thrombosis and recurrent ischemic events after ACS.",
    ],
    correct: "Add-on control of allergic asthma and exercise-induced symptoms.",
    explanation:
      "Montelukast: Add-on control of allergic asthma and exercise-induced symptoms.",
    explainCorrect:
      "Option C is correct because montelukast is commonly used as add-on therapy in allergic/exercise-related asthma symptoms, especially when extra controller support is needed.",
    wrongOptionExplanations: {
      "Maintenance bronchodilation in COPD.": "COPD maintenance bronchodilation is mainly with LABA/LAMA regimens, not montelukast as primary therapy.",
      "Annual prevention of influenza and severe complications.": "Influenza prevention is via vaccination and public health measures, not montelukast.",
      "Hypertension, especially in patients with diabetic kidney disease.": "This indication belongs to antihypertensive classes, not leukotriene antagonists.",
      "Prevention of stent thrombosis and recurrent ischemic events after ACS.": "This requires antiplatelet/antithrombotic strategies, not montelukast.",
    },
    memoryTrick:
      "Montelukast adds control in allergy-driven wheeze and exercise triggers.",
  },
  {
    id: 374,
    type: "match",
    category: "Allergy and Immunology",
    question:
      "Q374. Which ONE of the following is the MOST important safety point to counsel or monitor when using Montelukast?",
    options: [
      "Behavioral changes such as irritability should be monitored.",
      "Monitor for mood or behavior changes and counsel patients to report them promptly.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
      "Risk of hypoglycemia is increased with missed meals.",
      "Clinical benefit is delayed; adherence in first weeks is important.",
    ],
    correct:
      "Monitor for mood or behavior changes and counsel patients to report them promptly.",
    explanation:
      "Montelukast: Monitor for mood or behavior changes and counsel patients to report them promptly.",
    explainCorrect:
      "Option B is correct because montelukast has recognized neuropsychiatric warnings; patients and caregivers should watch for mood, sleep, or behavior changes and report early.",
    wrongOptionExplanations: {
      "Behavioral changes such as irritability should be monitored.": "This is directionally true but less complete; best practice includes broader mood/behavior counseling and explicit prompt reporting.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.": "Routine nephrotoxicity TDM is not the key montelukast safety issue.",
      "Risk of hypoglycemia is increased with missed meals.": "This is not a typical montelukast safety concern.",
      "Clinical benefit is delayed; adherence in first weeks is important.": "Adherence matters, but neuropsychiatric monitoring is the higher-yield specific safety counseling point.",
    },
    memoryTrick:
      "With montelukast, monitor the mind as well as the lungs.",
  },
  {
    id: 375,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q375. Which ONE of the following best describes the primary mechanism of Amoxicillin?",
    options: [
      "Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.",
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.",
      "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.",
      "Blocks serotonin 5-HT3 receptors in the gut and chemoreceptor trigger zone.",
      "Synthetic vasopressin analog that increases water reabsorption via V2 receptors.",
    ],
    correct:
      "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.",
    explanation:
      "Amoxicillin: Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.",
    explainCorrect:
      "Option C is correct because amoxicillin is a beta-lactam that binds PBPs and disrupts peptidoglycan cross-linking, leading to bacterial cell wall failure.",
    wrongOptionExplanations: {
      "Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.": "This is beta-blocker mechanism, not antibiotic action.",
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.": "This is digoxin mechanism.",
      "Blocks serotonin 5-HT3 receptors in the gut and chemoreceptor trigger zone.": "This describes ondansetron-like antiemetic action.",
      "Synthetic vasopressin analog that increases water reabsorption via V2 receptors.": "This is desmopressin pharmacology.",
    },
    memoryTrick:
      "Amoxi attacks walls: beta-lactam blocks bacterial wall building.",
  },
  {
    id: 376,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q376. Which ONE of the following is the MOST appropriate therapeutic use of Amoxicillin?",
    options: [
      "Type 2 diabetes when metformin alone is insufficient.",
      "Susceptible upper respiratory and skin infections.",
      "Symptomatic HFrEF and ventricular rate control in atrial fibrillation.",
      "Maintenance controller therapy in persistent asthma.",
      "Serious gram-positive infections including MRSA.",
    ],
    correct: "Susceptible upper respiratory and skin infections.",
    explanation:
      "Amoxicillin: Susceptible upper respiratory and skin infections.",
    explainCorrect:
      "Option B is correct because amoxicillin is commonly used for susceptible community upper respiratory and certain skin/soft-tissue infections caused by sensitive organisms.",
    wrongOptionExplanations: {
      "Type 2 diabetes when metformin alone is insufficient.": "This is an antidiabetic escalation decision, not an antibiotic indication.",
      "Symptomatic HFrEF and ventricular rate control in atrial fibrillation.": "This is a cardiac therapy role, not amoxicillin use.",
      "Maintenance controller therapy in persistent asthma.": "Asthma control uses inhaled anti-inflammatory/bronchodilator strategies, not antibiotics.",
      "Serious gram-positive infections including MRSA.": "MRSA is typically resistant to amoxicillin; other agents are required.",
    },
    memoryTrick:
      "Use amoxicillin where bugs are susceptible; not for MRSA-heavy infections.",
  },
  {
    id: 377,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q377. Which ONE of the following is the MOST important safety point to counsel or monitor when using Amoxicillin?",
    options: [
      "Verify penicillin allergy history before dispensing.",
      "Risk of hypoglycemia is increased with missed meals.",
      "Clinical benefit is delayed; adherence in first weeks is important.",
      "Behavioral changes such as irritability should be monitored.",
      "Can cause bradycardia and syncope in vulnerable older adults.",
    ],
    correct: "Verify penicillin allergy history before dispensing.",
    explanation:
      "Amoxicillin: Verify penicillin allergy history before dispensing.",
    explainCorrect:
      "Option A is correct because amoxicillin is a penicillin-class antibiotic, and prior immediate or severe beta-lactam allergy can lead to serious hypersensitivity reactions if not screened first.",
    wrongOptionExplanations: {
      "Risk of hypoglycemia is increased with missed meals.": "This counseling applies to certain glucose-lowering therapies, not amoxicillin.",
      "Clinical benefit is delayed; adherence in first weeks is important.": "Antibiotic response is usually expected within days, not a delayed-weeks pattern.",
      "Behavioral changes such as irritability should be monitored.": "This is not a primary routine counseling point for amoxicillin.",
      "Can cause bradycardia and syncope in vulnerable older adults.": "Bradycardia/syncope is not a typical central amoxicillin safety issue.",
    },
    memoryTrick:
      "Before penicillin antibiotics, ask allergy first, dose second.",
  },
  {
    id: 378,
    type: "match",
    category: "ENT",
    question:
      "Q378. Which ONE of the following best describes the primary mechanism of Amoxicillin-clavulanate?",
    options: [
      "Stimulates erythroid progenitor cells via erythropoietin receptor activation.",
      "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.",
      "Replaces potassium to restore intracellular and extracellular potassium balance.",
      "Topical beta-blockade reduces aqueous humor production.",
      "Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.",
    ],
    correct:
      "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.",
    explanation:
      "Amoxicillin-clavulanate: Combines beta-lactam antibacterial activity with beta-lactamase inhibition.",
    explainCorrect:
      "Option B is correct because amoxicillin provides beta-lactam antibacterial effect, while clavulanate inhibits many beta-lactamases and protects amoxicillin from enzymatic degradation.",
    wrongOptionExplanations: {
      "Stimulates erythroid progenitor cells via erythropoietin receptor activation.": "This is epoetin alfa mechanism.",
      "Replaces potassium to restore intracellular and extracellular potassium balance.": "This describes potassium supplementation, not antibiotic action.",
      "Topical beta-blockade reduces aqueous humor production.": "This is an ophthalmic glaucoma mechanism.",
      "Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.": "This is statin pharmacology.",
    },
    memoryTrick:
      "Clavulanate is the bodyguard: shields amoxicillin from beta-lactamase attack.",
  },
  {
    id: 379,
    type: "match",
    category: "ENT",
    question:
      "Q379. Which ONE of the following is the MOST appropriate therapeutic use of Amoxicillin-clavulanate?",
    options: [
      "Bacterial sinusitis or otitis when beta-lactamase producers are suspected.",
      "Relief of acute bronchospasm in asthma.",
      "Anaerobic intra-abdominal infections and protozoal disease.",
      "Basal glucose control in type 1 and type 2 diabetes.",
      "Fracture risk reduction in osteoporosis.",
    ],
    correct:
      "Bacterial sinusitis or otitis when beta-lactamase producers are suspected.",
    explanation:
      "Amoxicillin-clavulanate: Bacterial sinusitis or otitis when beta-lactamase producers are suspected.",
    explainCorrect:
      "Option A is correct because adding clavulanate broadens coverage against common beta-lactamase-producing respiratory pathogens in sinus and ear infections.",
    wrongOptionExplanations: {
      "Relief of acute bronchospasm in asthma.": "Bronchospasm relief requires bronchodilators, not antibiotics.",
      "Anaerobic intra-abdominal infections and protozoal disease.": "These are better aligned with specific anaerobic/protozoal regimens, not this first-choice ENT context.",
      "Basal glucose control in type 1 and type 2 diabetes.": "Glucose control uses insulin/antidiabetics, not antibiotics.",
      "Fracture risk reduction in osteoporosis.": "Osteoporosis management uses bone-active therapies, not antimicrobial agents.",
    },
    memoryTrick:
      "When ENT bugs may make beta-lactamase, choose amox + clav.",
  },
  {
    id: 380,
    type: "match",
    category: "ENT",
    question:
      "Q380. Which ONE of the following is the MOST important safety point to counsel or monitor when using Amoxicillin-clavulanate?",
    options: [
      "Clinical benefit is delayed; adherence in first weeks is important.",
      "Behavioral changes such as irritability should be monitored.",
      "Can cause bradycardia and syncope in vulnerable older adults.",
      "Dose-related diarrhea is common and signals need for dose review.",
      "Take with food to reduce gastrointestinal intolerance.",
    ],
    correct: "Take with food to reduce gastrointestinal intolerance.",
    explanation:
      "Amoxicillin-clavulanate: Take with food to reduce gastrointestinal intolerance.",
    explainCorrect:
      "Option E is correct because taking amoxicillin-clavulanate with food improves GI tolerability and can reduce nausea and abdominal discomfort.",
    wrongOptionExplanations: {
      "Clinical benefit is delayed; adherence in first weeks is important.": "This delayed-benefit framing fits chronic controllers, not acute antibiotic courses.",
      "Behavioral changes such as irritability should be monitored.": "Not a core counseling point for this antibiotic.",
      "Can cause bradycardia and syncope in vulnerable older adults.": "This is not a typical key risk of amoxicillin-clavulanate.",
      "Dose-related diarrhea is common and signals need for dose review.": "Diarrhea can occur, but core practical counseling for routine use is to take with food for better tolerance.",
    },
    memoryTrick:
      "Co-amoxiclav with meals means less GI trouble.",
  },
  {
    id: 381,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q381. Which ONE of the following best describes the primary mechanism of Ciprofloxacin?",
    options: [
      "Inhibits bacterial DNA gyrase and topoisomerase IV.",
      "Inhibits xanthine oxidase, lowering uric acid production.",
      "Antagonizes aldosterone receptors in the distal nephron.",
      "Enhances antithrombin activity with predominant inhibition of factor Xa.",
      "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.",
    ],
    correct: "Inhibits bacterial DNA gyrase and topoisomerase IV.",
    explanation:
      "Ciprofloxacin: Inhibits bacterial DNA gyrase and topoisomerase IV.",
    explainCorrect:
      "Option A is correct because ciprofloxacin is a fluoroquinolone that blocks bacterial DNA gyrase/topoisomerase IV, disrupting DNA replication and bacterial survival.",
    wrongOptionExplanations: {
      "Inhibits xanthine oxidase, lowering uric acid production.": "This is allopurinol/febuxostat mechanism.",
      "Antagonizes aldosterone receptors in the distal nephron.": "This is mineralocorticoid receptor antagonist action.",
      "Enhances antithrombin activity with predominant inhibition of factor Xa.": "This is LMWH mechanism.",
      "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.": "This is beta-lactam mechanism, not fluoroquinolone mechanism.",
    },
    memoryTrick:
      "Cipro cripples bacterial DNA machinery: gyrase and topo IV.",
  },
  {
    id: 382,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q382. Which ONE of the following is the MOST appropriate therapeutic use of Ciprofloxacin?",
    options: [
      "Inflammatory acne and selected atypical infections.",
      "First-line pharmacotherapy in type 2 diabetes.",
      "Short-course treatment of moderate to severe inflammatory flares.",
      "Generalized and focal seizure disorders.",
      "Complicated urinary tract infections due to susceptible organisms.",
    ],
    correct:
      "Complicated urinary tract infections due to susceptible organisms.",
    explanation:
      "Ciprofloxacin: Complicated urinary tract infections due to susceptible organisms.",
    explainCorrect:
      "Option E is correct because ciprofloxacin is commonly reserved for susceptible complicated UTIs where organism profile and severity justify fluoroquinolone use.",
    wrongOptionExplanations: {
      "Inflammatory acne and selected atypical infections.": "This is more aligned with tetracycline-class uses such as doxycycline.",
      "First-line pharmacotherapy in type 2 diabetes.": "Diabetes first-line therapy is not ciprofloxacin.",
      "Short-course treatment of moderate to severe inflammatory flares.": "Inflammatory flares are treated with anti-inflammatory agents, not fluoroquinolones.",
      "Generalized and focal seizure disorders.": "Seizure disorders require antiepileptics, not ciprofloxacin.",
    },
    memoryTrick:
      "Cipro is a targeted UTI tool when bugs are susceptible and case is complicated.",
  },
  {
    id: 383,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q383. Which ONE of the following is the MOST important safety point to counsel or monitor when using Ciprofloxacin?",
    options: [
      "Can cause bradycardia and syncope in vulnerable older adults.",
      "Dose-related diarrhea is common and signals need for dose review.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
      "Risk of tendon injury increases with age and corticosteroid use.",
      "Behavioral changes such as irritability should be monitored.",
    ],
    correct: "Risk of tendon injury increases with age and corticosteroid use.",
    explanation:
      "Ciprofloxacin: Risk of tendon injury increases with age and corticosteroid use.",
    explainCorrect:
      "Option D is correct because fluoroquinolones carry a known tendinitis/tendon rupture risk, heightened in older adults and in patients using corticosteroids.",
    wrongOptionExplanations: {
      "Can cause bradycardia and syncope in vulnerable older adults.": "This is not the hallmark safety counseling point for ciprofloxacin.",
      "Dose-related diarrhea is common and signals need for dose review.": "GI upset can occur, but tendon toxicity is the key high-impact warning.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.": "This profile fits loop diuretics, not ciprofloxacin.",
      "Behavioral changes such as irritability should be monitored.": "Not the main signature warning compared with tendon injury risk.",
    },
    memoryTrick:
      "Cipro and tendons: older age + steroids = higher rupture risk.",
  },
  {
    id: 384,
    type: "match",
    category: "Dermatology",
    question:
      "Q384. Which ONE of the following best describes the primary mechanism of Doxycycline?",
    options: [
      "Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.",
      "Irreversibly inhibits platelet P2Y12 receptors to reduce platelet aggregation.",
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.",
      "Induces adaptive immune response against influenza surface antigens.",
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.",
    ],
    correct:
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.",
    explanation:
      "Doxycycline: Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.",
    explainCorrect:
      "Option E is correct because doxycycline is a tetracycline that binds the bacterial 30S ribosomal subunit and inhibits protein synthesis.",
    wrongOptionExplanations: {
      "Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.": "This is ARB antihypertensive mechanism.",
      "Irreversibly inhibits platelet P2Y12 receptors to reduce platelet aggregation.": "This is clopidogrel-like antiplatelet mechanism.",
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.": "This is tiotropium/LAMA mechanism.",
      "Induces adaptive immune response against influenza surface antigens.": "This is vaccine immunologic action.",
    },
    memoryTrick:
      "Doxycycline docks on 30S and stops bacterial protein production.",
  },
  {
    id: 385,
    type: "match",
    category: "Dermatology",
    question:
      "Q385. Which ONE of the following is the MOST appropriate therapeutic use of Doxycycline?",
    options: [
      "Hyperthyroidism, especially thyroid storm management.",
      "Maintenance treatment of bipolar disorder.",
      "Short-term management of gastroparesis-related nausea.",
      "Inflammatory acne and selected atypical infections.",
      "Mucosal candidiasis and selected systemic fungal infections.",
    ],
    correct: "Inflammatory acne and selected atypical infections.",
    explanation:
      "Doxycycline: Inflammatory acne and selected atypical infections.",
    explainCorrect:
      "Option D is correct because doxycycline is widely used for inflammatory acne and for several atypical/intracellular bacterial infections where tetracycline activity is useful.",
    wrongOptionExplanations: {
      "Hyperthyroidism, especially thyroid storm management.": "Thyroid storm is treated with antithyroid and supportive therapies, not doxycycline.",
      "Maintenance treatment of bipolar disorder.": "Bipolar maintenance uses mood stabilizers/psychiatric regimens, not antibiotics.",
      "Short-term management of gastroparesis-related nausea.": "Gastroparesis nausea uses prokinetic/antiemetic strategies, not doxycycline.",
      "Mucosal candidiasis and selected systemic fungal infections.": "Fungal infections require antifungals, not tetracyclines.",
    },
    memoryTrick:
      "Doxy is a go-to for acne inflammation and some atypical bacterial infections.",
  },
  {
    id: 386,
    type: "match",
    category: "Dermatology",
    question:
      "Q386. Which ONE of the following is the MOST important safety point to counsel or monitor when using Doxycycline?",
    options: [
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
      "Counsel on dark stools and constipation to improve adherence.",
      "Photosensitivity is common; advise sun protection.",
      "Can cause bradycardia and syncope in vulnerable older adults.",
      "Dose-related diarrhea is common and signals need for dose review.",
    ],
    correct: "Photosensitivity is common; advise sun protection.",
    explanation:
      "Doxycycline: Photosensitivity is common; advise sun protection.",
    explainCorrect:
      "Option C is correct because doxycycline commonly increases photosensitivity, so sun avoidance/protection counseling helps prevent phototoxic skin reactions.",
    wrongOptionExplanations: {
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.": "This is typical loop-diuretic counseling, not doxycycline counseling.",
      "Counsel on dark stools and constipation to improve adherence.": "This is more specific to iron supplementation.",
      "Can cause bradycardia and syncope in vulnerable older adults.": "Not a signature routine safety point for doxycycline.",
      "Dose-related diarrhea is common and signals need for dose review.": "GI effects may occur, but photosensitivity counseling is the key characteristic warning.",
    },
    memoryTrick:
      "On doxy, sunlight bites harder: protect skin every day.",
  },
  {
    id: 387,
    type: "match",
    category: "Gastroenterology",
    question:
      "Q387. Which ONE of the following best describes the primary mechanism of Metronidazole?",
    options: [
      "Stimulates beta-2 receptors causing rapid bronchodilation.",
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.",
      "Provides prolonged basal insulin activity with minimal peak.",
      "Generates free-radical metabolites that damage DNA in anaerobes and protozoa.",
      "Releases nitric oxide causing venodilation and reduced preload.",
    ],
    correct:
      "Generates free-radical metabolites that damage DNA in anaerobes and protozoa.",
    explanation:
      "Metronidazole: Generates free-radical metabolites that damage DNA in anaerobes and protozoa.",
    explainCorrect:
      "Option D is correct because metronidazole is reduced in susceptible anaerobes/protozoa to reactive intermediates that damage DNA and cause cell death.",
    wrongOptionExplanations: {
      "Stimulates beta-2 receptors causing rapid bronchodilation.": "This is salbutamol mechanism.",
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.": "This is tetracycline-class mechanism.",
      "Provides prolonged basal insulin activity with minimal peak.": "This is long-acting insulin pharmacology.",
      "Releases nitric oxide causing venodilation and reduced preload.": "This is nitroglycerin mechanism.",
    },
    memoryTrick:
      "Metronidazole makes toxic radicals in anaerobes: DNA gets hit.",
  },
  {
    id: 388,
    type: "match",
    category: "Gastroenterology",
    question:
      "Q388. Which ONE of the following is the MOST appropriate therapeutic use of Metronidazole?",
    options: [
      "Prevention of chemotherapy-induced nausea and vomiting.",
      "Central diabetes insipidus and selected nocturnal enuresis cases.",
      "Anaerobic intra-abdominal infections and protozoal disease.",
      "Long-term management of hypothyroidism.",
      "Schizophrenia and related psychotic disorders.",
    ],
    correct: "Anaerobic intra-abdominal infections and protozoal disease.",
    explanation:
      "Metronidazole: Anaerobic intra-abdominal infections and protozoal disease.",
    explainCorrect:
      "Option C is correct because metronidazole has strong activity against anaerobic bacteria and several protozoa, making it useful in intra-abdominal anaerobic infections and protozoal disease.",
    wrongOptionExplanations: {
      "Prevention of chemotherapy-induced nausea and vomiting.": "CINV prevention uses antiemetics, not metronidazole.",
      "Central diabetes insipidus and selected nocturnal enuresis cases.": "This is desmopressin indication.",
      "Long-term management of hypothyroidism.": "Hypothyroidism is treated with levothyroxine.",
      "Schizophrenia and related psychotic disorders.": "Psychotic disorders are treated with antipsychotics, not metronidazole.",
    },
    memoryTrick:
      "Think 'anaerobes and amoebas' for metronidazole coverage.",
  },
  {
    id: 389,
    type: "match",
    category: "Gastroenterology",
    question:
      "Q389. Which ONE of the following is the MOST important safety point to counsel or monitor when using Metronidazole?",
    options: [
      "Take with food to reduce gastrointestinal intolerance.",
      "Avoid alcohol during treatment because of disulfiram-like reaction risk.",
      "Dose-related diarrhea is common and signals need for dose review.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
      "Counsel on dark stools and constipation to improve adherence.",
    ],
    correct:
      "Avoid alcohol during treatment because of disulfiram-like reaction risk.",
    explanation:
      "Metronidazole: Avoid alcohol during treatment because of disulfiram-like reaction risk.",
    explainCorrect:
      "Option B is correct because combining metronidazole with alcohol can trigger a disulfiram-like reaction with nausea, vomiting, flushing, and palpitations.",
    wrongOptionExplanations: {
      "Take with food to reduce gastrointestinal intolerance.": "This may help GI comfort but is not the hallmark high-yield safety warning.",
      "Dose-related diarrhea is common and signals need for dose review.": "Diarrhea can occur with many antibiotics, but the distinctive counseling point here is alcohol avoidance.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.": "This profile fits loop diuretics, not metronidazole.",
      "Counsel on dark stools and constipation to improve adherence.": "This is typical iron counseling, not metronidazole-specific.",
    },
    memoryTrick:
      "Metro + alcohol = trouble. Keep alcohol out during course.",
  },
  {
    id: 390,
    type: "match",
    category: "Clinical Pharmacy",
    question:
      "Q390. Which ONE of the following best describes the primary mechanism of Vancomycin?",
    options: [
      "Inhibits fungal lanosterol 14-alpha-demethylase, reducing ergosterol synthesis.",
      "Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.",
      "Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.",
      "Supplies elemental iron required for hemoglobin synthesis.",
      "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.",
    ],
    correct: "Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.",
    explanation:
      "Vancomycin: Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.",
    explainCorrect:
      "Option C is correct because vancomycin binds D-Ala-D-Ala cell wall precursors, blocking peptidoglycan assembly in susceptible gram-positive bacteria.",
    wrongOptionExplanations: {
      "Inhibits fungal lanosterol 14-alpha-demethylase, reducing ergosterol synthesis.": "This is azole antifungal mechanism.",
      "Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.": "This is propylthiouracil-type action.",
      "Supplies elemental iron required for hemoglobin synthesis.": "This is iron supplement mechanism.",
      "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.": "This is amoxicillin-clavulanate mechanism.",
    },
    memoryTrick:
      "Vanco grabs D-Ala-D-Ala and blocks gram-positive wall building.",
  },
  {
    id: 391,
    type: "match",
    category: "Clinical Pharmacy",
    question:
      "Q391. Which ONE of the following is the MOST appropriate therapeutic use of Vancomycin?",
    options: [
      "Long-term control of hypertension and chronic stable angina.",
      "Serious gram-positive infections including MRSA.",
      "Short-term control of acute psychosis or severe agitation.",
      "GERD and peptic ulcer disease acid suppression.",
      "Adjunctive management of non-emergent hyperkalemia.",
    ],
    correct: "Serious gram-positive infections including MRSA.",
    explanation: "Vancomycin: Serious gram-positive infections including MRSA.",
    explainCorrect:
      "Option B is correct because vancomycin is a key agent for severe gram-positive infections, especially when MRSA is suspected or confirmed.",
    wrongOptionExplanations: {
      "Long-term control of hypertension and chronic stable angina.": "These are cardiovascular indications, not vancomycin use.",
      "Short-term control of acute psychosis or severe agitation.": "Psychosis treatment uses psychiatric drugs, not glycopeptide antibiotics.",
      "GERD and peptic ulcer disease acid suppression.": "Acid suppression uses PPIs/H2 blockers, not vancomycin.",
      "Adjunctive management of non-emergent hyperkalemia.": "Hyperkalemia management uses potassium-lowering therapies, not vancomycin.",
    },
    memoryTrick:
      "Serious MRSA? Vancomycin is a core gram-positive option.",
  },
  {
    id: 392,
    type: "match",
    category: "Clinical Pharmacy",
    question:
      "Q392. Which ONE of the following is the MOST important safety point to counsel or monitor when using Vancomycin?",
    options: [
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.",
      "Counsel on dark stools and constipation to improve adherence.",
      "Take with food to reduce gastrointestinal intolerance.",
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
    ],
    correct:
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
    explanation:
      "Vancomycin: Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
    explainCorrect:
      "Option A is correct because vancomycin exposure must be optimized with therapeutic monitoring to maintain efficacy while minimizing nephrotoxicity risk.",
    wrongOptionExplanations: {
      "Can cause hypokalemia and volume depletion; monitor electrolytes and hydration.": "This is a loop-diuretic pattern, not the central vancomycin monitoring issue.",
      "Counsel on dark stools and constipation to improve adherence.": "This applies to oral iron counseling, not vancomycin.",
      "Take with food to reduce gastrointestinal intolerance.": "Food timing is not the major safety lever for IV vancomycin therapy.",
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.": "Vancomycin's key toxicity concern is renal/ototoxic exposure, not major CYP interaction burden.",
    },
    memoryTrick:
      "With vanco, levels guide safety and success.",
  },
  {
    id: 393,
    type: "match",
    category: "Immunology",
    question:
      "Q393. Which ONE of the following best describes the primary mechanism of Influenza vaccine (inactivated)?",
    options: [
      "Potent dopamine D2 receptor antagonism in mesolimbic pathways.",
      "Induces adaptive immune response against influenza surface antigens.",
      "Blocks cysteinyl leukotriene-1 receptors in the airway.",
      "Inhibits DNA-dependent RNA polymerase in mycobacteria.",
      "Inhibits DPP-4, prolonging endogenous incretin action.",
    ],
    correct:
      "Induces adaptive immune response against influenza surface antigens.",
    explanation:
      "Influenza vaccine (inactivated): Induces adaptive immune response against influenza surface antigens.",
    explainCorrect:
      "Option B is correct because inactivated influenza vaccines present viral antigens that stimulate adaptive immunity and future protection against circulating strains.",
    wrongOptionExplanations: {
      "Potent dopamine D2 receptor antagonism in mesolimbic pathways.": "This is antipsychotic mechanism.",
      "Blocks cysteinyl leukotriene-1 receptors in the airway.": "This is montelukast mechanism.",
      "Inhibits DNA-dependent RNA polymerase in mycobacteria.": "This is rifampicin mechanism.",
      "Inhibits DPP-4, prolonging endogenous incretin action.": "This is DPP-4 inhibitor mechanism for diabetes.",
    },
    memoryTrick:
      "Flu shot trains immunity; it does not directly kill current symptoms.",
  },
  {
    id: 394,
    type: "match",
    category: "Immunology",
    question:
      "Q394. Which ONE of the following is the MOST appropriate therapeutic use of Influenza vaccine (inactivated)?",
    options: [
      "Annual prevention of influenza and severe complications.",
      "Seizure control and bipolar depression maintenance.",
      "Prevention and treatment of documented hypokalemia.",
      "Reduction of intraocular pressure in open-angle glaucoma.",
      "Primary and secondary prevention of atherosclerotic cardiovascular disease.",
    ],
    correct: "Annual prevention of influenza and severe complications.",
    explanation:
      "Influenza vaccine (inactivated): Annual prevention of influenza and severe complications.",
    explainCorrect:
      "Option A is correct because annual inactivated influenza vaccination reduces risk of flu infection and lowers severe outcomes, especially in high-risk groups.",
    wrongOptionExplanations: {
      "Seizure control and bipolar depression maintenance.": "These are neurologic/psychiatric indications, not vaccine indications.",
      "Prevention and treatment of documented hypokalemia.": "Hypokalemia is managed with potassium replacement, not vaccination.",
      "Reduction of intraocular pressure in open-angle glaucoma.": "This is ophthalmic therapy, not influenza prevention.",
      "Primary and secondary prevention of atherosclerotic cardiovascular disease.": "ASCVD prevention uses lipid and risk-factor management, not flu vaccine as primary treatment.",
    },
    memoryTrick:
      "Flu vaccine is yearly prevention, not treatment of unrelated chronic diseases.",
  },
  {
    id: 395,
    type: "match",
    category: "Immunology",
    question:
      "Q395. Which ONE of the following is the MOST important safety point to counsel or monitor when using Influenza vaccine (inactivated)?",
    options: [
      "Counsel on dark stools and constipation to improve adherence.",
      "Take with food to reduce gastrointestinal intolerance.",
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
      "Mild local soreness is common and not a reason to avoid future doses.",
    ],
    correct:
      "Mild local soreness is common and not a reason to avoid future doses.",
    explanation:
      "Influenza vaccine (inactivated): Mild local soreness is common and not a reason to avoid future doses.",
    explainCorrect:
      "Option E is correct because mild injection-site pain or soreness is common, self-limited, and should be normalized to support continued annual vaccination.",
    wrongOptionExplanations: {
      "Counsel on dark stools and constipation to improve adherence.": "This is iron-therapy counseling, not vaccine counseling.",
      "Take with food to reduce gastrointestinal intolerance.": "Not relevant to an inactivated intramuscular vaccine.",
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.": "This is medication-metabolism counseling, not routine flu vaccine safety guidance.",
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.": "Severe hepatotoxicity is not a standard key concern with inactivated influenza vaccines.",
    },
    memoryTrick:
      "Sore arm is common after flu shot; it is usually a normal immune sign.",
  },
  {
    id: 396,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q396. Which ONE of the following best describes the primary mechanism of Rifampicin?",
    options: [
      "Inhibits DNA-dependent RNA polymerase in mycobacteria.",
      "Generates free-radical metabolites that damage DNA in anaerobes and protozoa.",
      "Stimulates pancreatic beta-cell insulin release via KATP channel closure.",
      "Selectively inhibits serotonin reuptake in the CNS.",
      "Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.",
    ],
    correct: "Inhibits DNA-dependent RNA polymerase in mycobacteria.",
    explanation:
      "Rifampicin: Inhibits DNA-dependent RNA polymerase in mycobacteria.",
    explainCorrect:
      "Option A is correct because rifampicin inhibits bacterial DNA-dependent RNA polymerase, blocking transcription in mycobacteria and other susceptible organisms.",
    wrongOptionExplanations: {
      "Generates free-radical metabolites that damage DNA in anaerobes and protozoa.": "This is metronidazole mechanism.",
      "Stimulates pancreatic beta-cell insulin release via KATP channel closure.": "This is sulfonylurea mechanism.",
      "Selectively inhibits serotonin reuptake in the CNS.": "This is SSRI mechanism.",
      "Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.": "This is levetiracetam mechanism.",
    },
    memoryTrick:
      "Rifampicin shuts RNA writing down by blocking polymerase.",
  },
  {
    id: 397,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q397. Which ONE of the following is the MOST appropriate therapeutic use of Rifampicin?",
    options: [
      "Symptomatic treatment of mild-to-moderate Alzheimer disease.",
      "Acute gout flare treatment and flare prophylaxis when starting ULT.",
      "Rapid symptomatic relief in fluid overload and pulmonary edema.",
      "Treatment of iron deficiency anemia during pregnancy.",
      "Core component of multidrug tuberculosis treatment.",
    ],
    correct: "Core component of multidrug tuberculosis treatment.",
    explanation:
      "Rifampicin: Core component of multidrug tuberculosis treatment.",
  },
  {
    id: 398,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q398. Which ONE of the following is the MOST important safety point to counsel or monitor when using Rifampicin?",
    options: [
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
      "Potent enzyme induction causes many interactions; medication review is essential.",
      "Take with food to reduce gastrointestinal intolerance.",
    ],
    correct:
      "Potent enzyme induction causes many interactions; medication review is essential.",
    explanation:
      "Rifampicin: Potent enzyme induction causes many interactions; medication review is essential.",
  },
  {
    id: 399,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q399. Which ONE of the following best describes the primary mechanism of Isoniazid?",
    options: [
      "Reduces hepatic glucose output and improves insulin sensitivity.",
      "Systemic glucocorticoid that suppresses inflammatory gene transcription.",
      "Enhances GABAergic transmission and modulates neuronal firing.",
      "Osmotically retains water in the bowel and reduces ammonia absorption.",
      "Inhibits mycolic acid synthesis in mycobacterial cell walls.",
    ],
    correct: "Inhibits mycolic acid synthesis in mycobacterial cell walls.",
    explanation:
      "Isoniazid: Inhibits mycolic acid synthesis in mycobacterial cell walls.",
  },
  {
    id: 400,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q400. Which ONE of the following is the MOST appropriate therapeutic use of Isoniazid?",
    options: [
      "Resistant hypertension and mortality reduction in HFrEF.",
      "Treatment and prophylaxis of venous thromboembolism.",
      "Susceptible upper respiratory and skin infections.",
      "Tuberculosis treatment and latent TB therapy protocols.",
      "Long-term urate-lowering therapy in recurrent gout.",
    ],
    correct: "Tuberculosis treatment and latent TB therapy protocols.",
    explanation:
      "Isoniazid: Tuberculosis treatment and latent TB therapy protocols.",
  },
  {
    id: 401,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q401. Which ONE of the following is the MOST important safety point to counsel or monitor when using Isoniazid?",
    options: [
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
      "Extrapyramidal effects limit long-term use.",
      "Pyridoxine supplementation helps prevent peripheral neuropathy.",
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
    ],
    correct: "Pyridoxine supplementation helps prevent peripheral neuropathy.",
    explanation:
      "Isoniazid: Pyridoxine supplementation helps prevent peripheral neuropathy.",
  },
  {
    id: 402,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q402. Which ONE of the following best describes the primary mechanism of Fluconazole?",
    options: [
      "Antagonizes dopamine D2 and serotonin 5-HT2A receptors.",
      "Blocks serotonin 5-HT3 receptors in the gut and chemoreceptor trigger zone.",
      "Synthetic vasopressin analog that increases water reabsorption via V2 receptors.",
      "Inhibits fungal lanosterol 14-alpha-demethylase, reducing ergosterol synthesis.",
      "Replaces deficient thyroxine (T4) hormone.",
    ],
    correct:
      "Inhibits fungal lanosterol 14-alpha-demethylase, reducing ergosterol synthesis.",
    explanation:
      "Fluconazole: Inhibits fungal lanosterol 14-alpha-demethylase, reducing ergosterol synthesis.",
  },
  {
    id: 403,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q403. Which ONE of the following is the MOST appropriate therapeutic use of Fluconazole?",
    options: [
      "Add-on control of allergic asthma and exercise-induced symptoms.",
      "Annual prevention of influenza and severe complications.",
      "Mucosal candidiasis and selected systemic fungal infections.",
      "First-line blood pressure control in uncomplicated hypertension.",
      "Long-term anticoagulation for atrial fibrillation or venous thromboembolism.",
    ],
    correct: "Mucosal candidiasis and selected systemic fungal infections.",
    explanation:
      "Fluconazole: Mucosal candidiasis and selected systemic fungal infections.",
  },
  {
    id: 404,
    type: "match",
    category: "Infectious Diseases",
    question:
      "Q404. Which ONE of the following is the MOST important safety point to counsel or monitor when using Fluconazole?",
    options: [
      "Should be taken with meals for maximal phosphate binding.",
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
      "Extrapyramidal effects limit long-term use.",
    ],
    correct:
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
    explanation:
      "Fluconazole: Monitor for hepatotoxicity and significant CYP-mediated interactions.",
  },
  {
    id: 405,
    type: "match",
    category: "Endocrinology",
    question:
      "Q405. Which ONE of the following best describes the primary mechanism of Metformin?",
    options: [
      "Replaces potassium to restore intracellular and extracellular potassium balance.",
      "Topical beta-blockade reduces aqueous humor production.",
      "Reduces hepatic glucose output and improves insulin sensitivity.",
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
      "Inhibits voltage-sensitive sodium channels and glutamate release.",
    ],
    correct: "Reduces hepatic glucose output and improves insulin sensitivity.",
    explanation:
      "Metformin: Reduces hepatic glucose output and improves insulin sensitivity.",
  },
  {
    id: 406,
    type: "match",
    category: "Endocrinology",
    question:
      "Q406. Which ONE of the following is the MOST appropriate therapeutic use of Metformin?",
    options: [
      "Type 2 diabetes with cardiovascular and renal protective benefits.",
      "First-line pharmacotherapy in type 2 diabetes.",
      "Prevention of stent thrombosis and recurrent ischemic events after ACS.",
      "Maintenance bronchodilation in COPD.",
      "Serious gram-positive infections including MRSA.",
    ],
    correct: "First-line pharmacotherapy in type 2 diabetes.",
    explanation: "Metformin: First-line pharmacotherapy in type 2 diabetes.",
  },
  {
    id: 407,
    type: "match",
    category: "Endocrinology",
    question:
      "Q407. Which ONE of the following is the MOST important safety point to counsel or monitor when using Metformin?",
    options: [
      "Temporarily withhold around iodinated contrast in patients at renal risk.",
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
      "Extrapyramidal effects limit long-term use.",
      "Should be taken with meals for maximal phosphate binding.",
      "May increase serum potassium; monitor renal function and potassium.",
    ],
    correct:
      "Temporarily withhold around iodinated contrast in patients at renal risk.",
    explanation:
      "Metformin: Temporarily withhold around iodinated contrast in patients at renal risk.",
  },
  {
    id: 408,
    type: "match",
    category: "Endocrinology",
    question:
      "Q408. Which ONE of the following best describes the primary mechanism of Insulin glargine?",
    options: [
      "Antagonizes aldosterone receptors in the distal nephron.",
      "Provides prolonged basal insulin activity with minimal peak.",
      "Blocks voltage-gated sodium channels in overactive neurons.",
      "Topical anti-inflammatory action in colonic mucosa via 5-ASA.",
      "Inhibits xanthine oxidase, lowering uric acid production.",
    ],
    correct: "Provides prolonged basal insulin activity with minimal peak.",
    explanation:
      "Insulin glargine: Provides prolonged basal insulin activity with minimal peak.",
  },
  {
    id: 409,
    type: "match",
    category: "Endocrinology",
    question:
      "Q409. Which ONE of the following is the MOST appropriate therapeutic use of Insulin glargine?",
    options: [
      "Basal glucose control in type 1 and type 2 diabetes.",
      "Maintenance controller therapy in persistent asthma.",
      "Anaerobic intra-abdominal infections and protozoal disease.",
      "Type 2 diabetes when metformin alone is insufficient.",
      "Major depressive disorder and anxiety-spectrum disorders.",
    ],
    correct: "Basal glucose control in type 1 and type 2 diabetes.",
    explanation:
      "Insulin glargine: Basal glucose control in type 1 and type 2 diabetes.",
  },
  {
    id: 410,
    type: "match",
    category: "Endocrinology",
    question:
      "Q410. Which ONE of the following is the MOST important safety point to counsel or monitor when using Insulin glargine?",
    options: [
      "Extrapyramidal effects limit long-term use.",
      "Should be taken with meals for maximal phosphate binding.",
      "May increase serum potassium; monitor renal function and potassium.",
      "Bleeding risk is the main concern; assess for bruising and GI bleeding.",
      "Hypoglycemia prevention requires consistent dosing time and glucose monitoring.",
    ],
    correct:
      "Hypoglycemia prevention requires consistent dosing time and glucose monitoring.",
    explanation:
      "Insulin glargine: Hypoglycemia prevention requires consistent dosing time and glucose monitoring.",
  },
  {
    id: 411,
    type: "match",
    category: "Endocrinology",
    question:
      "Q411. Which ONE of the following best describes the primary mechanism of Gliclazide?",
    options: [
      "Stimulates pancreatic beta-cell insulin release via KATP channel closure.",
      "Dopamine D2 antagonism with prokinetic effects on upper GI tract.",
      "Binds dietary phosphate in the gut to reduce phosphate absorption.",
      "Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.",
      "Irreversibly inhibits platelet P2Y12 receptors to reduce platelet aggregation.",
    ],
    correct:
      "Stimulates pancreatic beta-cell insulin release via KATP channel closure.",
    explanation:
      "Gliclazide: Stimulates pancreatic beta-cell insulin release via KATP channel closure.",
  },
  {
    id: 412,
    type: "match",
    category: "Endocrinology",
    question:
      "Q412. Which ONE of the following is the MOST appropriate therapeutic use of Gliclazide?",
    options: [
      "Inflammatory acne and selected atypical infections.",
      "First-line pharmacotherapy in type 2 diabetes.",
      "Fracture risk reduction in osteoporosis.",
      "Focal seizures and trigeminal neuralgia.",
      "Type 2 diabetes when metformin alone is insufficient.",
    ],
    correct: "Type 2 diabetes when metformin alone is insufficient.",
    explanation:
      "Gliclazide: Type 2 diabetes when metformin alone is insufficient.",
  },
  {
    id: 413,
    type: "match",
    category: "Endocrinology",
    question:
      "Q413. Which ONE of the following is the MOST important safety point to counsel or monitor when using Gliclazide?",
    options: [
      "May increase serum potassium; monitor renal function and potassium.",
      "Bleeding risk is the main concern; assess for bruising and GI bleeding.",
      "Not for acute symptom relief; provide a rescue inhaler separately.",
      "Risk of hypoglycemia is increased with missed meals.",
      "Should be taken with meals for maximal phosphate binding.",
    ],
    correct: "Risk of hypoglycemia is increased with missed meals.",
    explanation:
      "Gliclazide: Risk of hypoglycemia is increased with missed meals.",
  },
  {
    id: 414,
    type: "match",
    category: "Endocrinology",
    question:
      "Q414. Which ONE of the following best describes the primary mechanism of Empagliflozin?",
    options: [
      "Exchanges sodium for potassium in the gut to reduce serum potassium.",
      "Blocks L-type calcium channels in vascular smooth muscle to reduce peripheral resistance.",
      "Releases nitric oxide causing venodilation and reduced preload.",
      "Stimulates beta-2 receptors causing rapid bronchodilation.",
      "Inhibits renal SGLT2 to increase urinary glucose excretion.",
    ],
    correct: "Inhibits renal SGLT2 to increase urinary glucose excretion.",
    explanation:
      "Empagliflozin: Inhibits renal SGLT2 to increase urinary glucose excretion.",
  },
  {
    id: 415,
    type: "match",
    category: "Endocrinology",
    question:
      "Q415. Which ONE of the following is the MOST appropriate therapeutic use of Empagliflozin?",
    options: [
      "Short-course treatment of moderate to severe inflammatory flares.",
      "Generalized and focal seizure disorders.",
      "Constipation relief and adjunct treatment in hepatic encephalopathy.",
      "Type 2 diabetes with cardiovascular and renal protective benefits.",
      "Mucosal candidiasis and selected systemic fungal infections.",
    ],
    correct:
      "Type 2 diabetes with cardiovascular and renal protective benefits.",
    explanation:
      "Empagliflozin: Type 2 diabetes with cardiovascular and renal protective benefits.",
  },
  {
    id: 416,
    type: "match",
    category: "Endocrinology",
    question:
      "Q416. Which ONE of the following is the MOST important safety point to counsel or monitor when using Empagliflozin?",
    options: [
      "Not for acute symptom relief; provide a rescue inhaler separately.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
      "Counsel on genital mycotic infection risk and hydration.",
      "May increase serum potassium; monitor renal function and potassium.",
      "Bleeding risk is the main concern; assess for bruising and GI bleeding.",
    ],
    correct: "Counsel on genital mycotic infection risk and hydration.",
    explanation:
      "Empagliflozin: Counsel on genital mycotic infection risk and hydration.",
  },
  {
    id: 417,
    type: "match",
    category: "Endocrinology",
    question:
      "Q417. Which ONE of the following best describes the primary mechanism of Sitagliptin?",
    options: [
      "Inhibits the NKCC2 cotransporter in the thick ascending limb of Henle.",
      "Supplies elemental iron required for hemoglobin synthesis.",
      "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.",
      "Inhibits DPP-4, prolonging endogenous incretin action.",
      "Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.",
    ],
    correct: "Inhibits DPP-4, prolonging endogenous incretin action.",
    explanation:
      "Sitagliptin: Inhibits DPP-4, prolonging endogenous incretin action.",
  },
  {
    id: 418,
    type: "match",
    category: "Endocrinology",
    question:
      "Q418. Which ONE of the following is the MOST appropriate therapeutic use of Sitagliptin?",
    options: [
      "Short-term management of gastroparesis-related nausea.",
      "Hyperphosphatemia control in chronic kidney disease.",
      "Add-on glycemic control in type 2 diabetes.",
      "Hyperthyroidism, especially thyroid storm management.",
      "Maintenance treatment of bipolar disorder.",
    ],
    correct: "Add-on glycemic control in type 2 diabetes.",
    explanation: "Sitagliptin: Add-on glycemic control in type 2 diabetes.",
  },
  {
    id: 419,
    type: "match",
    category: "Endocrinology",
    question:
      "Q419. Which ONE of the following is the MOST important safety point to counsel or monitor when using Sitagliptin?",
    options: [
      "Risk of hypoglycemia is increased with missed meals.",
      "Dose adjustment is needed in renal impairment.",
      "Bleeding risk is the main concern; assess for bruising and GI bleeding.",
      "Not for acute symptom relief; provide a rescue inhaler separately.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
    ],
    correct: "Dose adjustment is needed in renal impairment.",
    explanation: "Sitagliptin: Dose adjustment is needed in renal impairment.",
  },
  {
    id: 420,
    type: "match",
    category: "Endocrinology",
    question:
      "Q420. Which ONE of the following best describes the primary mechanism of Levothyroxine?",
    options: [
      "Blocks cysteinyl leukotriene-1 receptors in the airway.",
      "Induces adaptive immune response against influenza surface antigens.",
      "Replaces deficient thyroxine (T4) hormone.",
      "Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.",
      "Inhibits vitamin K epoxide reductase, lowering synthesis of factors II, VII, IX, and X.",
    ],
    correct: "Replaces deficient thyroxine (T4) hormone.",
    explanation: "Levothyroxine: Replaces deficient thyroxine (T4) hormone.",
  },
  {
    id: 421,
    type: "match",
    category: "Endocrinology",
    question:
      "Q421. Which ONE of the following is the MOST appropriate therapeutic use of Levothyroxine?",
    options: [
      "Rate control and secondary prevention after myocardial infarction.",
      "Long-term management of hypothyroidism.",
      "Schizophrenia and related psychotic disorders.",
      "Prevention of chemotherapy-induced nausea and vomiting.",
      "Central diabetes insipidus and selected nocturnal enuresis cases.",
    ],
    correct: "Long-term management of hypothyroidism.",
    explanation: "Levothyroxine: Long-term management of hypothyroidism.",
  },
  {
    id: 422,
    type: "match",
    category: "Endocrinology",
    question:
      "Q422. Which ONE of the following is the MOST important safety point to counsel or monitor when using Levothyroxine?",
    options: [
      "Take on an empty stomach consistently to optimize absorption.",
      "Not for acute symptom relief; provide a rescue inhaler separately.",
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
      "Risk of hypoglycemia is increased with missed meals.",
      "Sedation and anticholinergic effects can limit tolerability.",
    ],
    correct: "Take on an empty stomach consistently to optimize absorption.",
    explanation:
      "Levothyroxine: Take on an empty stomach consistently to optimize absorption.",
  },
  {
    id: 423,
    type: "match",
    category: "Endocrinology",
    question:
      "Q423. Which ONE of the following best describes the primary mechanism of Propylthiouracil?",
    options: [
      "Provides prolonged basal insulin activity with minimal peak.",
      "Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.",
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.",
      "Reduces airway inflammation by glucocorticoid receptor-mediated gene regulation.",
      "Generates free-radical metabolites that damage DNA in anaerobes and protozoa.",
    ],
    correct:
      "Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.",
    explanation:
      "Propylthiouracil: Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.",
  },
  {
    id: 424,
    type: "match",
    category: "Endocrinology",
    question:
      "Q424. Which ONE of the following is the MOST appropriate therapeutic use of Propylthiouracil?",
    options: [
      "Hyperthyroidism, especially thyroid storm management.",
      "GERD and peptic ulcer disease acid suppression.",
      "Adjunctive management of non-emergent hyperkalemia.",
      "Long-term control of hypertension and chronic stable angina.",
      "Immediate relief of acute angina episodes.",
    ],
    correct: "Hyperthyroidism, especially thyroid storm management.",
    explanation:
      "Propylthiouracil: Hyperthyroidism, especially thyroid storm management.",
  },
  {
    id: 425,
    type: "match",
    category: "Endocrinology",
    question:
      "Q425. Which ONE of the following is the MOST important safety point to counsel or monitor when using Propylthiouracil?",
    options: [
      "Therapeutic drug monitoring helps reduce nephrotoxicity while maintaining efficacy.",
      "Risk of hypoglycemia is increased with missed meals.",
      "Sedation and anticholinergic effects can limit tolerability.",
      "Slow titration reduces risk of serious rash including SJS.",
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
    ],
    correct:
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
    explanation:
      "Propylthiouracil: Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
  },
  {
    id: 426,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q426. Which ONE of the following best describes the primary mechanism of Prednisone?",
    options: [
      "Systemic glucocorticoid that suppresses inflammatory gene transcription.",
      "Stimulates erythroid progenitor cells via erythropoietin receptor activation.",
      "Inhibits bacterial DNA gyrase and topoisomerase IV.",
      "Inhibits fungal lanosterol 14-alpha-demethylase, reducing ergosterol synthesis.",
      "Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.",
    ],
    correct:
      "Systemic glucocorticoid that suppresses inflammatory gene transcription.",
    explanation:
      "Prednisone: Systemic glucocorticoid that suppresses inflammatory gene transcription.",
  },
  {
    id: 427,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q427. Which ONE of the following is the MOST appropriate therapeutic use of Prednisone?",
    options: [
      "Prevention and treatment of documented hypokalemia.",
      "Reduction of intraocular pressure in open-angle glaucoma.",
      "Primary and secondary prevention of atherosclerotic cardiovascular disease.",
      "Anemia of chronic kidney disease to reduce transfusion need.",
      "Short-course treatment of moderate to severe inflammatory flares.",
    ],
    correct:
      "Short-course treatment of moderate to severe inflammatory flares.",
    explanation:
      "Prednisone: Short-course treatment of moderate to severe inflammatory flares.",
  },
  {
    id: 428,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q428. Which ONE of the following is the MOST important safety point to counsel or monitor when using Prednisone?",
    options: [
      "Sedation and anticholinergic effects can limit tolerability.",
      "Slow titration reduces risk of serious rash including SJS.",
      "Rapid correction can be dangerous; monitor ECG and serum potassium.",
      "Tapering may be required after prolonged courses to prevent adrenal suppression.",
      "Risk of hypoglycemia is increased with missed meals.",
    ],
    correct:
      "Tapering may be required after prolonged courses to prevent adrenal suppression.",
    explanation:
      "Prednisone: Tapering may be required after prolonged courses to prevent adrenal suppression.",
  },
  {
    id: 429,
    type: "match",
    category: "Rheumatology",
    question:
      "Q429. Which ONE of the following best describes the primary mechanism of Alendronate?",
    options: [
      "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.",
      "Inhibits DNA-dependent RNA polymerase in mycobacteria.",
      "Inhibits DPP-4, prolonging endogenous incretin action.",
      "Antagonizes dopamine D2 and serotonin 5-HT2A receptors.",
      "Inhibits osteoclast-mediated bone resorption as a bisphosphonate.",
    ],
    correct:
      "Inhibits osteoclast-mediated bone resorption as a bisphosphonate.",
    explanation:
      "Alendronate: Inhibits osteoclast-mediated bone resorption as a bisphosphonate.",
  },
  {
    id: 430,
    type: "match",
    category: "Rheumatology",
    question:
      "Q430. Which ONE of the following is the MOST appropriate therapeutic use of Alendronate?",
    options: [
      "Rapid symptomatic relief in fluid overload and pulmonary edema.",
      "Treatment of iron deficiency anemia during pregnancy.",
      "Bacterial sinusitis or otitis when beta-lactamase producers are suspected.",
      "Fracture risk reduction in osteoporosis.",
      "Acute gout flare treatment and flare prophylaxis when starting ULT.",
    ],
    correct: "Fracture risk reduction in osteoporosis.",
    explanation: "Alendronate: Fracture risk reduction in osteoporosis.",
  },
  {
    id: 431,
    type: "match",
    category: "Rheumatology",
    question:
      "Q431. Which ONE of the following is the MOST important safety point to counsel or monitor when using Alendronate?",
    options: [
      "Rapid correction can be dangerous; monitor ECG and serum potassium.",
      "Systemic absorption may cause bradycardia; punctal occlusion reduces exposure.",
      "Take with plain water and remain upright to reduce esophageal irritation.",
      "Sedation and anticholinergic effects can limit tolerability.",
      "Slow titration reduces risk of serious rash including SJS.",
    ],
    correct:
      "Take with plain water and remain upright to reduce esophageal irritation.",
    explanation:
      "Alendronate: Take with plain water and remain upright to reduce esophageal irritation.",
  },
  {
    id: 432,
    type: "match",
    category: "Psychiatry",
    question:
      "Q432. Which ONE of the following best describes the primary mechanism of Sertraline?",
    options: [
      "Stimulates pancreatic beta-cell insulin release via KATP channel closure.",
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
      "Inhibits voltage-sensitive sodium channels and glutamate release.",
      "Selectively inhibits serotonin reuptake in the CNS.",
      "Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.",
    ],
    correct: "Selectively inhibits serotonin reuptake in the CNS.",
    explanation:
      "Sertraline: Selectively inhibits serotonin reuptake in the CNS.",
  },
  {
    id: 433,
    type: "match",
    category: "Psychiatry",
    question:
      "Q433. Which ONE of the following is the MOST appropriate therapeutic use of Sertraline?",
    options: [
      "Susceptible upper respiratory and skin infections.",
      "Core component of multidrug tuberculosis treatment.",
      "Major depressive disorder and anxiety-spectrum disorders.",
      "Resistant hypertension and mortality reduction in HFrEF.",
      "Treatment and prophylaxis of venous thromboembolism.",
    ],
    correct: "Major depressive disorder and anxiety-spectrum disorders.",
    explanation:
      "Sertraline: Major depressive disorder and anxiety-spectrum disorders.",
  },
  {
    id: 434,
    type: "match",
    category: "Psychiatry",
    question:
      "Q434. Which ONE of the following is the MOST important safety point to counsel or monitor when using Sertraline?",
    options: [
      "Report unexplained muscle pain due to risk of statin-associated myopathy.",
      "Clinical benefit is delayed; adherence in first weeks is important.",
      "Slow titration reduces risk of serious rash including SJS.",
      "Rapid correction can be dangerous; monitor ECG and serum potassium.",
      "Systemic absorption may cause bradycardia; punctal occlusion reduces exposure.",
    ],
    correct:
      "Clinical benefit is delayed; adherence in first weeks is important.",
    explanation:
      "Sertraline: Clinical benefit is delayed; adherence in first weeks is important.",
  },
  {
    id: 435,
    type: "match",
    category: "Psychiatry",
    question:
      "Q435. Which ONE of the following best describes the primary mechanism of Amitriptyline?",
    options: [
      "Blocks voltage-gated sodium channels in overactive neurons.",
      "Topical anti-inflammatory action in colonic mucosa via 5-ASA.",
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
      "Reduces hepatic glucose output and improves insulin sensitivity.",
      "Systemic glucocorticoid that suppresses inflammatory gene transcription.",
    ],
    correct:
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
    explanation:
      "Amitriptyline: Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
  },
  {
    id: 436,
    type: "match",
    category: "Psychiatry",
    question:
      "Q436. Which ONE of the following is the MOST appropriate therapeutic use of Amitriptyline?",
    options: [
      "Type 2 diabetes with cardiovascular and renal protective benefits.",
      "Neuropathic pain and selected depressive disorders.",
      "Long-term anticoagulation for atrial fibrillation or venous thromboembolism.",
      "Add-on control of allergic asthma and exercise-induced symptoms.",
      "Annual prevention of influenza and severe complications.",
    ],
    correct: "Neuropathic pain and selected depressive disorders.",
    explanation:
      "Amitriptyline: Neuropathic pain and selected depressive disorders.",
  },
  {
    id: 437,
    type: "match",
    category: "Psychiatry",
    question:
      "Q437. Which ONE of the following is the MOST important safety point to counsel or monitor when using Amitriptyline?",
    options: [
      "Sedation and anticholinergic effects can limit tolerability.",
      "Rapid correction can be dangerous; monitor ECG and serum potassium.",
      "Systemic absorption may cause bradycardia; punctal occlusion reduces exposure.",
      "Report unexplained muscle pain due to risk of statin-associated myopathy.",
      "Hemoglobin should not rise too quickly; monitor Hb to reduce thrombotic risk.",
    ],
    correct: "Sedation and anticholinergic effects can limit tolerability.",
    explanation:
      "Amitriptyline: Sedation and anticholinergic effects can limit tolerability.",
  },
  {
    id: 438,
    type: "match",
    category: "Psychiatry",
    question:
      "Q438. Which ONE of the following best describes the primary mechanism of Haloperidol?",
    options: [
      "Binds dietary phosphate in the gut to reduce phosphate absorption.",
      "Potent dopamine D2 receptor antagonism in mesolimbic pathways.",
      "Replaces deficient thyroxine (T4) hormone.",
      "Modulates intracellular signaling pathways involved in mood stabilization.",
      "Dopamine D2 antagonism with prokinetic effects on upper GI tract.",
    ],
    correct: "Potent dopamine D2 receptor antagonism in mesolimbic pathways.",
    explanation:
      "Haloperidol: Potent dopamine D2 receptor antagonism in mesolimbic pathways.",
  },
  {
    id: 439,
    type: "match",
    category: "Psychiatry",
    question:
      "Q439. Which ONE of the following is the MOST appropriate therapeutic use of Haloperidol?",
    options: [
      "Short-term control of acute psychosis or severe agitation.",
      "Maintenance bronchodilation in COPD.",
      "Serious gram-positive infections including MRSA.",
      "Type 2 diabetes when metformin alone is insufficient.",
      "Major depressive disorder and anxiety-spectrum disorders.",
    ],
    correct: "Short-term control of acute psychosis or severe agitation.",
    explanation:
      "Haloperidol: Short-term control of acute psychosis or severe agitation.",
  },
  {
    id: 440,
    type: "match",
    category: "Psychiatry",
    question:
      "Q440. Which ONE of the following is the MOST important safety point to counsel or monitor when using Haloperidol?",
    options: [
      "Systemic absorption may cause bradycardia; punctal occlusion reduces exposure.",
      "Report unexplained muscle pain due to risk of statin-associated myopathy.",
      "Hemoglobin should not rise too quickly; monitor Hb to reduce thrombotic risk.",
      "Risk of tendon injury increases with age and corticosteroid use.",
      "Monitor for extrapyramidal symptoms and acute dystonic reactions.",
    ],
    correct:
      "Monitor for extrapyramidal symptoms and acute dystonic reactions.",
    explanation:
      "Haloperidol: Monitor for extrapyramidal symptoms and acute dystonic reactions.",
  },
  {
    id: 441,
    type: "match",
    category: "Psychiatry",
    question:
      "Q441. Which ONE of the following best describes the primary mechanism of Risperidone?",
    options: [
      "Antagonizes dopamine D2 and serotonin 5-HT2A receptors.",
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
      "Irreversibly inhibits the gastric H+/K+-ATPase proton pump.",
      "Exchanges sodium for potassium in the gut to reduce serum potassium.",
      "Blocks L-type calcium channels in vascular smooth muscle to reduce peripheral resistance.",
    ],
    correct: "Antagonizes dopamine D2 and serotonin 5-HT2A receptors.",
    explanation:
      "Risperidone: Antagonizes dopamine D2 and serotonin 5-HT2A receptors.",
  },
  {
    id: 442,
    type: "match",
    category: "Psychiatry",
    question:
      "Q442. Which ONE of the following is the MOST appropriate therapeutic use of Risperidone?",
    options: [
      "Anaerobic intra-abdominal infections and protozoal disease.",
      "Basal glucose control in type 1 and type 2 diabetes.",
      "Fracture risk reduction in osteoporosis.",
      "Adjunct or monotherapy for focal and generalized seizures.",
      "Schizophrenia and related psychotic disorders.",
    ],
    correct: "Schizophrenia and related psychotic disorders.",
    explanation: "Risperidone: Schizophrenia and related psychotic disorders.",
  },
  {
    id: 443,
    type: "match",
    category: "Psychiatry",
    question:
      "Q443. Which ONE of the following is the MOST important safety point to counsel or monitor when using Risperidone?",
    options: [
      "Hemoglobin should not rise too quickly; monitor Hb to reduce thrombotic risk.",
      "Risk of tendon injury increases with age and corticosteroid use.",
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
      "Monitor weight, lipids, and glucose for metabolic adverse effects.",
      "Report unexplained muscle pain due to risk of statin-associated myopathy.",
    ],
    correct:
      "Monitor weight, lipids, and glucose for metabolic adverse effects.",
    explanation:
      "Risperidone: Monitor weight, lipids, and glucose for metabolic adverse effects.",
  },
  {
    id: 444,
    type: "match",
    category: "Psychiatry",
    question:
      "Q444. Which ONE of the following best describes the primary mechanism of Lithium?",
    options: [
      "Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.",
      "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.",
      "Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.",
      "Inhibits the NKCC2 cotransporter in the thick ascending limb of Henle.",
      "Modulates intracellular signaling pathways involved in mood stabilization.",
    ],
    correct:
      "Modulates intracellular signaling pathways involved in mood stabilization.",
    explanation:
      "Lithium: Modulates intracellular signaling pathways involved in mood stabilization.",
  },
  {
    id: 445,
    type: "match",
    category: "Psychiatry",
    question:
      "Q445. Which ONE of the following is the MOST appropriate therapeutic use of Lithium?",
    options: [
      "Short-course treatment of moderate to severe inflammatory flares.",
      "Focal seizures and trigeminal neuralgia.",
      "Induction and maintenance therapy in ulcerative colitis.",
      "Maintenance treatment of bipolar disorder.",
      "First-line pharmacotherapy in type 2 diabetes.",
    ],
    correct: "Maintenance treatment of bipolar disorder.",
    explanation: "Lithium: Maintenance treatment of bipolar disorder.",
  },
  {
    id: 446,
    type: "match",
    category: "Psychiatry",
    question:
      "Q446. Which ONE of the following is the MOST important safety point to counsel or monitor when using Lithium?",
    options: [
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
      "Hemoglobin should not rise too quickly; monitor Hb to reduce thrombotic risk.",
      "Risk of tendon injury increases with age and corticosteroid use.",
    ],
    correct:
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
    explanation:
      "Lithium: Regular serum lithium, renal, and thyroid monitoring is mandatory.",
  },
  {
    id: 447,
    type: "match",
    category: "Neurology",
    question:
      "Q447. Which ONE of the following best describes the primary mechanism of Sodium valproate?",
    options: [
      "Active vitamin D analog that increases intestinal calcium absorption.",
      "Inhibits the sodium-chloride cotransporter in the distal convoluted tubule.",
      "Inhibits vitamin K epoxide reductase, lowering synthesis of factors II, VII, IX, and X.",
      "Enhances GABAergic transmission and modulates neuronal firing.",
      "Osmotically retains water in the bowel and reduces ammonia absorption.",
    ],
    correct: "Enhances GABAergic transmission and modulates neuronal firing.",
    explanation:
      "Sodium valproate: Enhances GABAergic transmission and modulates neuronal firing.",
  },
  {
    id: 448,
    type: "match",
    category: "Neurology",
    question:
      "Q448. Which ONE of the following is the MOST appropriate therapeutic use of Sodium valproate?",
    options: [
      "Constipation relief and adjunct treatment in hepatic encephalopathy.",
      "Management of secondary hyperparathyroidism in chronic kidney disease.",
      "Generalized and focal seizure disorders.",
      "Hyperthyroidism, especially thyroid storm management.",
      "Maintenance treatment of bipolar disorder.",
    ],
    correct: "Generalized and focal seizure disorders.",
    explanation: "Sodium valproate: Generalized and focal seizure disorders.",
  },
  {
    id: 449,
    type: "match",
    category: "Neurology",
    question:
      "Q449. Which ONE of the following is the MOST important safety point to counsel or monitor when using Sodium valproate?",
    options: [
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
      "Contraindicated in pregnancy unless no safer alternatives exist.",
      "Risk of tendon injury increases with age and corticosteroid use.",
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
    ],
    correct: "Contraindicated in pregnancy unless no safer alternatives exist.",
    explanation:
      "Sodium valproate: Contraindicated in pregnancy unless no safer alternatives exist.",
  },
  {
    id: 450,
    type: "match",
    category: "Neurology",
    question:
      "Q450. Which ONE of the following best describes the primary mechanism of Carbamazepine?",
    options: [
      "Inhibits Na+/K+-ATPase to increase intracellular calcium and vagal tone.",
      "Reduces airway inflammation by glucocorticoid receptor-mediated gene regulation.",
      "Blocks voltage-gated sodium channels in overactive neurons.",
      "Synthetic vasopressin analog that increases water reabsorption via V2 receptors.",
      "Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.",
    ],
    correct: "Blocks voltage-gated sodium channels in overactive neurons.",
    explanation:
      "Carbamazepine: Blocks voltage-gated sodium channels in overactive neurons.",
  },
  {
    id: 451,
    type: "match",
    category: "Neurology",
    question:
      "Q451. Which ONE of the following is the MOST appropriate therapeutic use of Carbamazepine?",
    options: [
      "Hypertension, especially in patients with diabetic kidney disease.",
      "Focal seizures and trigeminal neuralgia.",
      "Schizophrenia and related psychotic disorders.",
      "Short-term management of gastroparesis-related nausea.",
      "Hyperphosphatemia control in chronic kidney disease.",
    ],
    correct: "Focal seizures and trigeminal neuralgia.",
    explanation: "Carbamazepine: Focal seizures and trigeminal neuralgia.",
  },
  {
    id: 452,
    type: "match",
    category: "Neurology",
    question:
      "Q452. Which ONE of the following is the MOST important safety point to counsel or monitor when using Carbamazepine?",
    options: [
      "Can cause hyponatremia and requires periodic blood monitoring.",
      "Monitor for hepatotoxicity and significant CYP-mediated interactions.",
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
      "Dose should be titrated to avoid severe diarrhea and dehydration.",
    ],
    correct: "Can cause hyponatremia and requires periodic blood monitoring.",
    explanation:
      "Carbamazepine: Can cause hyponatremia and requires periodic blood monitoring.",
  },
  {
    id: 453,
    type: "match",
    category: "Neurology",
    question:
      "Q453. Which ONE of the following best describes the primary mechanism of Levetiracetam?",
    options: [
      "Inhibits bacterial DNA gyrase and topoisomerase IV.",
      "Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.",
      "Topical beta-blockade reduces aqueous humor production.",
      "Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.",
      "Stimulates erythroid progenitor cells via erythropoietin receptor activation.",
    ],
    correct:
      "Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.",
    explanation:
      "Levetiracetam: Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.",
  },
  {
    id: 454,
    type: "match",
    category: "Neurology",
    question:
      "Q454. Which ONE of the following is the MOST appropriate therapeutic use of Levetiracetam?",
    options: [
      "Adjunct or monotherapy for focal and generalized seizures.",
      "Prevention of chemotherapy-induced nausea and vomiting.",
      "Central diabetes insipidus and selected nocturnal enuresis cases.",
      "Rate control and secondary prevention after myocardial infarction.",
      "Symptomatic HFrEF and ventricular rate control in atrial fibrillation.",
    ],
    correct: "Adjunct or monotherapy for focal and generalized seizures.",
    explanation:
      "Levetiracetam: Adjunct or monotherapy for focal and generalized seizures.",
  },
  {
    id: 455,
    type: "match",
    category: "Neurology",
    question:
      "Q455. Which ONE of the following is the MOST important safety point to counsel or monitor when using Levetiracetam?",
    options: [
      "Severe hepatotoxicity is a rare but serious risk requiring prompt evaluation.",
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
      "Dose should be titrated to avoid severe diarrhea and dehydration.",
      "Hypercalcemia risk requires regular calcium and phosphate monitoring.",
      "Behavioral changes such as irritability should be monitored.",
    ],
    correct: "Behavioral changes such as irritability should be monitored.",
    explanation:
      "Levetiracetam: Behavioral changes such as irritability should be monitored.",
  },
  {
    id: 456,
    type: "match",
    category: "Neurology",
    question:
      "Q456. Which ONE of the following best describes the primary mechanism of Lamotrigine?",
    options: [
      "Inhibits voltage-sensitive sodium channels and glutamate release.",
      "Antagonizes aldosterone receptors in the distal nephron.",
      "Enhances antithrombin activity with predominant inhibition of factor Xa.",
      "Inhibits bacterial cell wall synthesis by binding penicillin-binding proteins.",
      "Inhibits DNA-dependent RNA polymerase in mycobacteria.",
    ],
    correct:
      "Inhibits voltage-sensitive sodium channels and glutamate release.",
    explanation:
      "Lamotrigine: Inhibits voltage-sensitive sodium channels and glutamate release.",
  },
  {
    id: 457,
    type: "match",
    category: "Neurology",
    question:
      "Q457. Which ONE of the following is the MOST appropriate therapeutic use of Lamotrigine?",
    options: [
      "Adjunctive management of non-emergent hyperkalemia.",
      "Long-term control of hypertension and chronic stable angina.",
      "Immediate relief of acute angina episodes.",
      "Relief of acute bronchospasm in asthma.",
      "Seizure control and bipolar depression maintenance.",
    ],
    correct: "Seizure control and bipolar depression maintenance.",
    explanation:
      "Lamotrigine: Seizure control and bipolar depression maintenance.",
  },
  {
    id: 458,
    type: "match",
    category: "Neurology",
    question:
      "Q458. Which ONE of the following is the MOST important safety point to counsel or monitor when using Lamotrigine?",
    options: [
      "Dose should be titrated to avoid severe diarrhea and dehydration.",
      "Hypercalcemia risk requires regular calcium and phosphate monitoring.",
      "Can cause hypokalemia and hyponatremia; monitor electrolytes.",
      "Slow titration reduces risk of serious rash including SJS.",
      "Regular serum lithium, renal, and thyroid monitoring is mandatory.",
    ],
    correct: "Slow titration reduces risk of serious rash including SJS.",
    explanation:
      "Lamotrigine: Slow titration reduces risk of serious rash including SJS.",
  },
  {
    id: 459,
    type: "match",
    category: "Gastroenterology",
    question:
      "Q459. Which ONE of the following best describes the primary mechanism of Omeprazole?",
    options: [
      "Irreversibly inhibits platelet P2Y12 receptors to reduce platelet aggregation.",
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.",
      "Binds D-Ala-D-Ala termini to inhibit peptidoglycan synthesis.",
      "Stimulates pancreatic beta-cell insulin release via KATP channel closure.",
      "Irreversibly inhibits the gastric H+/K+-ATPase proton pump.",
    ],
    correct: "Irreversibly inhibits the gastric H+/K+-ATPase proton pump.",
    explanation:
      "Omeprazole: Irreversibly inhibits the gastric H+/K+-ATPase proton pump.",
  },
  {
    id: 460,
    type: "match",
    category: "Gastroenterology",
    question:
      "Q460. Which ONE of the following is the MOST appropriate therapeutic use of Omeprazole?",
    options: [
      "Primary and secondary prevention of atherosclerotic cardiovascular disease.",
      "Anemia of chronic kidney disease to reduce transfusion need.",
      "Complicated urinary tract infections due to susceptible organisms.",
      "GERD and peptic ulcer disease acid suppression.",
      "Reduction of intraocular pressure in open-angle glaucoma.",
    ],
    correct: "GERD and peptic ulcer disease acid suppression.",
    explanation: "Omeprazole: GERD and peptic ulcer disease acid suppression.",
  },
  {
    id: 461,
    type: "match",
    category: "Gastroenterology",
    question:
      "Q461. Which ONE of the following is the MOST important safety point to counsel or monitor when using Omeprazole?",
    options: [
      "Can cause hypokalemia and hyponatremia; monitor electrolytes.",
      "INR monitoring and clear documentation of target range are essential.",
      "Use the lowest effective duration to limit long-term adverse effects.",
      "Dose should be titrated to avoid severe diarrhea and dehydration.",
      "Hypercalcemia risk requires regular calcium and phosphate monitoring.",
    ],
    correct:
      "Use the lowest effective duration to limit long-term adverse effects.",
    explanation:
      "Omeprazole: Use the lowest effective duration to limit long-term adverse effects.",
  },
  {
    id: 462,
    type: "match",
    category: "Oncology",
    question:
      "Q462. Which ONE of the following best describes the primary mechanism of Ondansetron?",
    options: [
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.",
      "Reduces hepatic glucose output and improves insulin sensitivity.",
      "Systemic glucocorticoid that suppresses inflammatory gene transcription.",
      "Blocks serotonin 5-HT3 receptors in the gut and chemoreceptor trigger zone.",
      "Stimulates beta-2 receptors causing rapid bronchodilation.",
    ],
    correct:
      "Blocks serotonin 5-HT3 receptors in the gut and chemoreceptor trigger zone.",
    explanation:
      "Ondansetron: Blocks serotonin 5-HT3 receptors in the gut and chemoreceptor trigger zone.",
  },
  {
    id: 463,
    type: "match",
    category: "Oncology",
    question:
      "Q463. Which ONE of the following is the MOST appropriate therapeutic use of Ondansetron?",
    options: [
      "Bacterial sinusitis or otitis when beta-lactamase producers are suspected.",
      "Tuberculosis treatment and latent TB therapy protocols.",
      "Prevention of chemotherapy-induced nausea and vomiting.",
      "Rapid symptomatic relief in fluid overload and pulmonary edema.",
      "Treatment of iron deficiency anemia during pregnancy.",
    ],
    correct: "Prevention of chemotherapy-induced nausea and vomiting.",
    explanation:
      "Ondansetron: Prevention of chemotherapy-induced nausea and vomiting.",
  },
  {
    id: 464,
    type: "match",
    category: "Oncology",
    question:
      "Q464. Which ONE of the following is the MOST important safety point to counsel or monitor when using Ondansetron?",
    options: [
      "Monitor for mood or behavior changes and counsel patients to report them promptly.",
      "QT prolongation risk increases in susceptible patients.",
      "Hypercalcemia risk requires regular calcium and phosphate monitoring.",
      "Can cause hypokalemia and hyponatremia; monitor electrolytes.",
      "INR monitoring and clear documentation of target range are essential.",
    ],
    correct: "QT prolongation risk increases in susceptible patients.",
    explanation:
      "Ondansetron: QT prolongation risk increases in susceptible patients.",
  },
  {
    id: 465,
    type: "match",
    category: "Gastroenterology",
    question:
      "Q465. Which ONE of the following best describes the primary mechanism of Metoclopramide?",
    options: [
      "Replaces deficient thyroxine (T4) hormone.",
      "Antagonizes dopamine D2 and serotonin 5-HT2A receptors.",
      "Dopamine D2 antagonism with prokinetic effects on upper GI tract.",
      "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.",
      "Inhibits mycolic acid synthesis in mycobacterial cell walls.",
    ],
    correct:
      "Dopamine D2 antagonism with prokinetic effects on upper GI tract.",
    explanation:
      "Metoclopramide: Dopamine D2 antagonism with prokinetic effects on upper GI tract.",
  },
  {
    id: 466,
    type: "match",
    category: "Gastroenterology",
    question:
      "Q466. Which ONE of the following is the MOST appropriate therapeutic use of Metoclopramide?",
    options: [
      "Add-on glycemic control in type 2 diabetes.",
      "Short-term management of gastroparesis-related nausea.",
      "Treatment and prophylaxis of venous thromboembolism.",
      "Susceptible upper respiratory and skin infections.",
      "Core component of multidrug tuberculosis treatment.",
    ],
    correct: "Short-term management of gastroparesis-related nausea.",
    explanation:
      "Metoclopramide: Short-term management of gastroparesis-related nausea.",
  },
  {
    id: 467,
    type: "match",
    category: "Gastroenterology",
    question:
      "Q467. Which ONE of the following is the MOST important safety point to counsel or monitor when using Metoclopramide?",
    options: [
      "Extrapyramidal effects limit long-term use.",
      "Can cause hypokalemia and hyponatremia; monitor electrolytes.",
      "INR monitoring and clear documentation of target range are essential.",
      "Monitor for mood or behavior changes and counsel patients to report them promptly.",
      "Mild local soreness is common and not a reason to avoid future doses.",
    ],
    correct: "Extrapyramidal effects limit long-term use.",
    explanation: "Metoclopramide: Extrapyramidal effects limit long-term use.",
  },
  {
    id: 468,
    type: "match",
    category: "Palliative Care",
    question:
      "Q468. Which ONE of the following best describes the primary mechanism of Lactulose?",
    options: [
      "Inhibits voltage-sensitive sodium channels and glutamate release.",
      "Osmotically retains water in the bowel and reduces ammonia absorption.",
      "Induces adaptive immune response against influenza surface antigens.",
      "Inhibits renal SGLT2 to increase urinary glucose excretion.",
      "Inhibits norepinephrine and serotonin reuptake with anticholinergic activity.",
    ],
    correct:
      "Osmotically retains water in the bowel and reduces ammonia absorption.",
    explanation:
      "Lactulose: Osmotically retains water in the bowel and reduces ammonia absorption.",
  },
  {
    id: 469,
    type: "match",
    category: "Palliative Care",
    question:
      "Q469. Which ONE of the following is the MOST appropriate therapeutic use of Lactulose?",
    options: [
      "Constipation relief and adjunct treatment in hepatic encephalopathy.",
      "Add-on control of allergic asthma and exercise-induced symptoms.",
      "Annual prevention of influenza and severe complications.",
      "Type 2 diabetes with cardiovascular and renal protective benefits.",
      "Neuropathic pain and selected depressive disorders.",
    ],
    correct:
      "Constipation relief and adjunct treatment in hepatic encephalopathy.",
    explanation:
      "Lactulose: Constipation relief and adjunct treatment in hepatic encephalopathy.",
  },
  {
    id: 470,
    type: "match",
    category: "Palliative Care",
    question:
      "Q470. Which ONE of the following is the MOST important safety point to counsel or monitor when using Lactulose?",
    options: [
      "INR monitoring and clear documentation of target range are essential.",
      "Monitor for mood or behavior changes and counsel patients to report them promptly.",
      "Mild local soreness is common and not a reason to avoid future doses.",
      "Counsel on genital mycotic infection risk and hydration.",
      "Dose should be titrated to avoid severe diarrhea and dehydration.",
    ],
    correct:
      "Dose should be titrated to avoid severe diarrhea and dehydration.",
    explanation:
      "Lactulose: Dose should be titrated to avoid severe diarrhea and dehydration.",
  },
  {
    id: 471,
    type: "match",
    category: "Clinical Assessment",
    question:
      "Q471. Which ONE of the following best describes the primary mechanism of Mesalazine?",
    options: [
      "Topical anti-inflammatory action in colonic mucosa via 5-ASA.",
      "Provides prolonged basal insulin activity with minimal peak.",
      "Inhibits osteoclast-mediated bone resorption as a bisphosphonate.",
      "Blocks voltage-gated sodium channels in overactive neurons.",
      "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.",
    ],
    correct: "Topical anti-inflammatory action in colonic mucosa via 5-ASA.",
    explanation:
      "Mesalazine: Topical anti-inflammatory action in colonic mucosa via 5-ASA.",
  },
  {
    id: 472,
    type: "match",
    category: "Clinical Assessment",
    question:
      "Q472. Which ONE of the following is the MOST appropriate therapeutic use of Mesalazine?",
    options: [
      "Serious gram-positive infections including MRSA.",
      "Type 2 diabetes when metformin alone is insufficient.",
      "Major depressive disorder and anxiety-spectrum disorders.",
      "Adjunct or monotherapy for focal and generalized seizures.",
      "Induction and maintenance therapy in ulcerative colitis.",
    ],
    correct: "Induction and maintenance therapy in ulcerative colitis.",
    explanation:
      "Mesalazine: Induction and maintenance therapy in ulcerative colitis.",
  },
  {
    id: 473,
    type: "match",
    category: "Clinical Assessment",
    question:
      "Q473. Which ONE of the following is the MOST important safety point to counsel or monitor when using Mesalazine?",
    options: [
      "Mild local soreness is common and not a reason to avoid future doses.",
      "Counsel on genital mycotic infection risk and hydration.",
      "Sedation and anticholinergic effects can limit tolerability.",
      "Assess renal function periodically during long-term therapy.",
      "Monitor for mood or behavior changes and counsel patients to report them promptly.",
    ],
    correct: "Assess renal function periodically during long-term therapy.",
    explanation:
      "Mesalazine: Assess renal function periodically during long-term therapy.",
  },
  {
    id: 474,
    type: "match",
    category: "Geriatric Medicine",
    question:
      "Q474. Which ONE of the following best describes the primary mechanism of Donepezil?",
    options: [
      "Inhibits thyroid hormone synthesis and peripheral T4 to T3 conversion.",
      "Modulates intracellular signaling pathways involved in mood stabilization.",
      "Dopamine D2 antagonism with prokinetic effects on upper GI tract.",
      "Active vitamin D analog that increases intestinal calcium absorption.",
      "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.",
    ],
    correct:
      "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.",
    explanation:
      "Donepezil: Reversibly inhibits acetylcholinesterase to increase central acetylcholine.",
  },
  {
    id: 475,
    type: "match",
    category: "Geriatric Medicine",
    question:
      "Q475. Which ONE of the following is the MOST appropriate therapeutic use of Donepezil?",
    options: [
      "Fracture risk reduction in osteoporosis.",
      "Focal seizures and trigeminal neuralgia.",
      "Induction and maintenance therapy in ulcerative colitis.",
      "Symptomatic treatment of mild-to-moderate Alzheimer disease.",
      "Basal glucose control in type 1 and type 2 diabetes.",
    ],
    correct: "Symptomatic treatment of mild-to-moderate Alzheimer disease.",
    explanation:
      "Donepezil: Symptomatic treatment of mild-to-moderate Alzheimer disease.",
  },
  {
    id: 476,
    type: "match",
    category: "Geriatric Medicine",
    question:
      "Q476. Which ONE of the following is the MOST important safety point to counsel or monitor when using Donepezil?",
    options: [
      "Sedation and anticholinergic effects can limit tolerability.",
      "Slow titration reduces risk of serious rash including SJS.",
      "Can cause bradycardia and syncope in vulnerable older adults.",
      "Mild local soreness is common and not a reason to avoid future doses.",
      "Counsel on genital mycotic infection risk and hydration.",
    ],
    correct: "Can cause bradycardia and syncope in vulnerable older adults.",
    explanation:
      "Donepezil: Can cause bradycardia and syncope in vulnerable older adults.",
  },
  {
    id: 477,
    type: "match",
    category: "Electrolytes",
    question:
      "Q477. Which ONE of the following best describes the primary mechanism of Potassium chloride?",
    options: [
      "Irreversibly inhibits the gastric H+/K+-ATPase proton pump.",
      "Synthetic vasopressin analog that increases water reabsorption via V2 receptors.",
      "Selectively blocks beta-1 receptors to reduce heart rate and myocardial oxygen demand.",
      "Replaces potassium to restore intracellular and extracellular potassium balance.",
      "Potent dopamine D2 receptor antagonism in mesolimbic pathways.",
    ],
    correct:
      "Replaces potassium to restore intracellular and extracellular potassium balance.",
    explanation:
      "Potassium chloride: Replaces potassium to restore intracellular and extracellular potassium balance.",
  },
  {
    id: 478,
    type: "match",
    category: "Electrolytes",
    question:
      "Q478. Which ONE of the following is the MOST appropriate therapeutic use of Potassium chloride?",
    options: [
      "Constipation relief and adjunct treatment in hepatic encephalopathy.",
      "Long-term urate-lowering therapy in recurrent gout.",
      "Prevention and treatment of documented hypokalemia.",
      "Short-course treatment of moderate to severe inflammatory flares.",
      "Generalized and focal seizure disorders.",
    ],
    correct: "Prevention and treatment of documented hypokalemia.",
    explanation:
      "Potassium chloride: Prevention and treatment of documented hypokalemia.",
  },
  {
    id: 479,
    type: "match",
    category: "Electrolytes",
    question:
      "Q479. Which ONE of the following is the MOST important safety point to counsel or monitor when using Potassium chloride?",
    options: [
      "Monitor bowel function; rare serious GI complications can occur.",
      "Rapid correction can be dangerous; monitor ECG and serum potassium.",
      "Counsel on genital mycotic infection risk and hydration.",
      "Sedation and anticholinergic effects can limit tolerability.",
      "Slow titration reduces risk of serious rash including SJS.",
    ],
    correct:
      "Rapid correction can be dangerous; monitor ECG and serum potassium.",
    explanation:
      "Potassium chloride: Rapid correction can be dangerous; monitor ECG and serum potassium.",
  },
  {
    id: 480,
    type: "match",
    category: "Nephrology",
    question:
      "Q480. Which ONE of the following best describes the primary mechanism of Sodium polystyrene sulfonate?",
    options: [
      "Topical beta-blockade reduces aqueous humor production.",
      "Inhibits HMG-CoA reductase to reduce hepatic cholesterol synthesis.",
      "Exchanges sodium for potassium in the gut to reduce serum potassium.",
      "Binds synaptic vesicle protein SV2A to modulate neurotransmitter release.",
      "Reversibly inhibits acetylcholinesterase to increase central acetylcholine.",
    ],
    correct:
      "Exchanges sodium for potassium in the gut to reduce serum potassium.",
    explanation:
      "Sodium polystyrene sulfonate: Exchanges sodium for potassium in the gut to reduce serum potassium.",
  },
  {
    id: 481,
    type: "match",
    category: "Nephrology",
    question:
      "Q481. Which ONE of the following is the MOST appropriate therapeutic use of Sodium polystyrene sulfonate?",
    options: [
      "First-line blood pressure control in uncomplicated hypertension.",
      "Adjunctive management of non-emergent hyperkalemia.",
      "Maintenance treatment of bipolar disorder.",
      "Short-term management of gastroparesis-related nausea.",
      "Management of secondary hyperparathyroidism in chronic kidney disease.",
    ],
    correct: "Adjunctive management of non-emergent hyperkalemia.",
    explanation:
      "Sodium polystyrene sulfonate: Adjunctive management of non-emergent hyperkalemia.",
  },
  {
    id: 482,
    type: "match",
    category: "Nephrology",
    question:
      "Q482. Which ONE of the following is the MOST important safety point to counsel or monitor when using Sodium polystyrene sulfonate?",
    options: [
      "Monitor bowel function; rare serious GI complications can occur.",
      "Sedation and anticholinergic effects can limit tolerability.",
      "Slow titration reduces risk of serious rash including SJS.",
      "Rapid correction can be dangerous; monitor ECG and serum potassium.",
      "Dose-related ankle edema is common; monitor for peripheral swelling.",
    ],
    correct: "Monitor bowel function; rare serious GI complications can occur.",
    explanation:
      "Sodium polystyrene sulfonate: Monitor bowel function; rare serious GI complications can occur.",
  },
  {
    id: 483,
    type: "match",
    category: "Nephrology",
    question:
      "Q483. Which ONE of the following best describes the primary mechanism of Desmopressin?",
    options: [
      "Enhances antithrombin activity with predominant inhibition of factor Xa.",
      "Synthetic vasopressin analog that increases water reabsorption via V2 receptors.",
      "Osmotically retains water in the bowel and reduces ammonia absorption.",
      "Inhibits xanthine oxidase, lowering uric acid production.",
      "Antagonizes aldosterone receptors in the distal nephron.",
    ],
    correct:
      "Synthetic vasopressin analog that increases water reabsorption via V2 receptors.",
    explanation:
      "Desmopressin: Synthetic vasopressin analog that increases water reabsorption via V2 receptors.",
  },
  {
    id: 484,
    type: "match",
    category: "Nephrology",
    question:
      "Q484. Which ONE of the following is the MOST appropriate therapeutic use of Desmopressin?",
    options: [
      "Central diabetes insipidus and selected nocturnal enuresis cases.",
      "Prevention of chemotherapy-induced nausea and vomiting.",
      "Hyperphosphatemia control in chronic kidney disease.",
      "Hypertension, especially in patients with diabetic kidney disease.",
      "Prevention of stent thrombosis and recurrent ischemic events after ACS.",
    ],
    correct:
      "Central diabetes insipidus and selected nocturnal enuresis cases.",
    explanation:
      "Desmopressin: Central diabetes insipidus and selected nocturnal enuresis cases.",
  },
  {
    id: 485,
    type: "match",
    category: "Nephrology",
    question:
      "Q485. Which ONE of the following is the MOST important safety point to counsel or monitor when using Desmopressin?",
    options: [
      "Slow titration reduces risk of serious rash including SJS.",
      "Rapid correction can be dangerous; monitor ECG and serum potassium.",
      "Dose-related ankle edema is common; monitor for peripheral swelling.",
      "Avoid with phosphodiesterase-5 inhibitors because of profound hypotension risk.",
      "Water intoxication and hyponatremia are key monitoring concerns.",
    ],
    correct: "Water intoxication and hyponatremia are key monitoring concerns.",
    explanation:
      "Desmopressin: Water intoxication and hyponatremia are key monitoring concerns.",
  },
  {
    id: 486,
    type: "match",
    category: "Nephrology",
    question:
      "Q486. Which ONE of the following best describes the primary mechanism of Sevelamer?",
    options: [
      "Binds dietary phosphate in the gut to reduce phosphate absorption.",
      "Synthetic vasopressin analog that increases water reabsorption via V2 receptors.",
      "Blocks angiotensin II type-1 receptors to reduce vasoconstriction and aldosterone effects.",
      "Irreversibly inhibits platelet P2Y12 receptors to reduce platelet aggregation.",
      "Long-acting muscarinic receptor blockade in bronchial smooth muscle.",
    ],
    correct:
      "Binds dietary phosphate in the gut to reduce phosphate absorption.",
    explanation:
      "Sevelamer: Binds dietary phosphate in the gut to reduce phosphate absorption.",
  },
  {
    id: 487,
    type: "match",
    category: "Nephrology",
    question:
      "Q487. Which ONE of the following is the MOST appropriate therapeutic use of Sevelamer?",
    options: [
      "Adjunctive management of non-emergent hyperkalemia.",
      "Rate control and secondary prevention after myocardial infarction.",
      "Symptomatic HFrEF and ventricular rate control in atrial fibrillation.",
      "Maintenance controller therapy in persistent asthma.",
      "Hyperphosphatemia control in chronic kidney disease.",
    ],
    correct: "Hyperphosphatemia control in chronic kidney disease.",
    explanation:
      "Sevelamer: Hyperphosphatemia control in chronic kidney disease.",
  },
  {
    id: 488,
    type: "match",
    category: "Nephrology",
    question:
      "Q488. Which ONE of the following is the MOST important safety point to counsel or monitor when using Sevelamer?",
    options: [
      "Dose-related ankle edema is common; monitor for peripheral swelling.",
      "Avoid with phosphodiesterase-5 inhibitors because of profound hypotension risk.",
      "Excess use may indicate poor control; reassess controller therapy.",
      "Should be taken with meals for maximal phosphate binding.",
      "Rapid correction can be dangerous; monitor ECG and serum potassium.",
    ],
    correct: "Should be taken with meals for maximal phosphate binding.",
    explanation:
      "Sevelamer: Should be taken with meals for maximal phosphate binding.",
  },
  {
    id: 489,
    type: "match",
    category: "Clinical Nutrition",
    question:
      "Q489. Which ONE of the following best describes the primary mechanism of Calcitriol?",
    options: [
      "Blocks L-type calcium channels in vascular smooth muscle to reduce peripheral resistance.",
      "Releases nitric oxide causing venodilation and reduced preload.",
      "Stimulates beta-2 receptors causing rapid bronchodilation.",
      "Binds the 30S ribosomal subunit to inhibit bacterial protein synthesis.",
      "Active vitamin D analog that increases intestinal calcium absorption.",
    ],
    correct:
      "Active vitamin D analog that increases intestinal calcium absorption.",
    explanation:
      "Calcitriol: Active vitamin D analog that increases intestinal calcium absorption.",
  },
  {
    id: 490,
    type: "match",
    category: "Clinical Nutrition",
    question:
      "Q490. Which ONE of the following is the MOST appropriate therapeutic use of Calcitriol?",
    options: [
      "Immediate relief of acute angina episodes.",
      "Relief of acute bronchospasm in asthma.",
      "Inflammatory acne and selected atypical infections.",
      "Management of secondary hyperparathyroidism in chronic kidney disease.",
      "Long-term control of hypertension and chronic stable angina.",
    ],
    correct:
      "Management of secondary hyperparathyroidism in chronic kidney disease.",
    explanation:
      "Calcitriol: Management of secondary hyperparathyroidism in chronic kidney disease.",
  },
  {
    id: 491,
    type: "match",
    category: "Clinical Nutrition",
    question:
      "Q491. Which ONE of the following is the MOST important safety point to counsel or monitor when using Calcitriol?",
    options: [
      "Excess use may indicate poor control; reassess controller therapy.",
      "Photosensitivity is common; advise sun protection.",
      "Hypercalcemia risk requires regular calcium and phosphate monitoring.",
      "Dose-related ankle edema is common; monitor for peripheral swelling.",
      "Avoid with phosphodiesterase-5 inhibitors because of profound hypotension risk.",
    ],
    correct:
      "Hypercalcemia risk requires regular calcium and phosphate monitoring.",
    explanation:
      "Calcitriol: Hypercalcemia risk requires regular calcium and phosphate monitoring.",
  },
  {
    id: 492,
    type: "match",
    category: "Rheumatology",
    question:
      "Q492. Which ONE of the following best describes the primary mechanism of Allopurinol?",
    options: [
      "Supplies elemental iron required for hemoglobin synthesis.",
      "Combines beta-lactam antibacterial activity with beta-lactamase inhibition.",
      "Inhibits mycolic acid synthesis in mycobacterial cell walls.",
      "Inhibits xanthine oxidase, lowering uric acid production.",
      "Inhibits the NKCC2 cotransporter in the thick ascending limb of Henle.",
    ],
    correct: "Inhibits xanthine oxidase, lowering uric acid production.",
    explanation:
      "Allopurinol: Inhibits xanthine oxidase, lowering uric acid production.",
  },
  {
    id: 493,
    type: "match",
    category: "Rheumatology",
    question:
      "Q493. Which ONE of the following is the MOST appropriate therapeutic use of Allopurinol?",
    options: [
      "Complicated urinary tract infections due to susceptible organisms.",
      "Mucosal candidiasis and selected systemic fungal infections.",
      "Long-term urate-lowering therapy in recurrent gout.",
      "Primary and secondary prevention of atherosclerotic cardiovascular disease.",
      "Anemia of chronic kidney disease to reduce transfusion need.",
    ],
    correct: "Long-term urate-lowering therapy in recurrent gout.",
    explanation:
      "Allopurinol: Long-term urate-lowering therapy in recurrent gout.",
  },
  {
    id: 494,
    type: "match",
    category: "Rheumatology",
    question:
      "Q494. Which ONE of the following is the MOST important safety point to counsel or monitor when using Allopurinol?",
    options: [
      "Temporarily withhold around iodinated contrast in patients at renal risk.",
      "Start low and titrate to reduce hypersensitivity risk.",
      "Avoid with phosphodiesterase-5 inhibitors because of profound hypotension risk.",
      "Excess use may indicate poor control; reassess controller therapy.",
      "Photosensitivity is common; advise sun protection.",
    ],
    correct: "Start low and titrate to reduce hypersensitivity risk.",
    explanation:
      "Allopurinol: Start low and titrate to reduce hypersensitivity risk.",
  },
  {
    id: 495,
    type: "match",
    category: "Rheumatology",
    question:
      "Q495. Which ONE of the following best describes the primary mechanism of Colchicine?",
    options: [
      "Induces adaptive immune response against influenza surface antigens.",
      "Inhibits renal SGLT2 to increase urinary glucose excretion.",
      "Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.",
      "Inhibits vitamin K epoxide reductase, lowering synthesis of factors II, VII, IX, and X.",
      "Blocks cysteinyl leukotriene-1 receptors in the airway.",
    ],
    correct:
      "Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.",
    explanation:
      "Colchicine: Disrupts microtubule polymerization, reducing neutrophil-mediated inflammation.",
  },
  {
    id: 496,
    type: "match",
    category: "Rheumatology",
    question:
      "Q496. Which ONE of the following is the MOST appropriate therapeutic use of Colchicine?",
    options: [
      "Long-term management of hypothyroidism.",
      "Acute gout flare treatment and flare prophylaxis when starting ULT.",
      "Treatment of iron deficiency anemia during pregnancy.",
      "Bacterial sinusitis or otitis when beta-lactamase producers are suspected.",
      "Tuberculosis treatment and latent TB therapy protocols.",
    ],
    correct:
      "Acute gout flare treatment and flare prophylaxis when starting ULT.",
    explanation:
      "Colchicine: Acute gout flare treatment and flare prophylaxis when starting ULT.",
  },
  {
    id: 497,
    type: "match",
    category: "Rheumatology",
    question:
      "Q497. Which ONE of the following is the MOST important safety point to counsel or monitor when using Colchicine?",
    options: [
      "Dose-related diarrhea is common and signals need for dose review.",
      "Excess use may indicate poor control; reassess controller therapy.",
      "Photosensitivity is common; advise sun protection.",
      "Temporarily withhold around iodinated contrast in patients at renal risk.",
      "Tapering may be required after prolonged courses to prevent adrenal suppression.",
    ],
    correct:
      "Dose-related diarrhea is common and signals need for dose review.",
    explanation:
      "Colchicine: Dose-related diarrhea is common and signals need for dose review.",
  },
  {
    id: 498,
    type: "match",
    category: "Ophthalmology",
    question:
      "Q498. Which ONE of the following best describes the primary mechanism of Timolol ophthalmic?",
    options: [
      "Inhibits osteoclast-mediated bone resorption as a bisphosphonate.",
      "Topical beta-blockade reduces aqueous humor production.",
      "Reduces airway inflammation by glucocorticoid receptor-mediated gene regulation.",
      "Generates free-radical metabolites that damage DNA in anaerobes and protozoa.",
      "Provides prolonged basal insulin activity with minimal peak.",
    ],
    correct: "Topical beta-blockade reduces aqueous humor production.",
    explanation:
      "Timolol ophthalmic: Topical beta-blockade reduces aqueous humor production.",
  },
  {
    id: 499,
    type: "match",
    category: "Ophthalmology",
    question:
      "Q499. Which ONE of the following is the MOST appropriate therapeutic use of Timolol ophthalmic?",
    options: [
      "Reduction of intraocular pressure in open-angle glaucoma.",
      "Susceptible upper respiratory and skin infections.",
      "Core component of multidrug tuberculosis treatment.",
      "Add-on glycemic control in type 2 diabetes.",
      "Short-term control of acute psychosis or severe agitation.",
    ],
    correct: "Reduction of intraocular pressure in open-angle glaucoma.",
    explanation:
      "Timolol ophthalmic: Reduction of intraocular pressure in open-angle glaucoma.",
  },
  {
    id: 500,
    type: "match",
    category: "Ophthalmology",
    question:
      "Q500. Which ONE of the following is the MOST important safety point to counsel or monitor when using Timolol ophthalmic?",
    options: [
      "Photosensitivity is common; advise sun protection.",
      "Temporarily withhold around iodinated contrast in patients at renal risk.",
      "Tapering may be required after prolonged courses to prevent adrenal suppression.",
      "Contraindicated in pregnancy unless no safer alternatives exist.",
      "Systemic absorption may cause bradycardia; punctal occlusion reduces exposure.",
    ],
    correct:
      "Systemic absorption may cause bradycardia; punctal occlusion reduces exposure.",
    explanation:
      "Timolol ophthalmic: Systemic absorption may cause bradycardia; punctal occlusion reduces exposure.",
  },
];
