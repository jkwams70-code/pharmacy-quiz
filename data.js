export const baseQuestions = [
  /* ================= Q1–Q3 ================= */

  {
    id: 1,
    type: "match",
    category: "Haematology",
    question:
      "Q1. Which ONE of the following laboratory parameters may be decreased in iron deficiency anaemia?",
    options: ["MCHC", "lymphocytes", "HbA1c", "INR", "thrombocytes"],
    correct: "MCHC",
    explanation:
      "Mean corpuscular haemoglobin concentration (MCHC) decreases in iron deficiency anaemia.",
  },

  {
    id: 2,
    type: "match",
    category: "Haematology",
    question:
      "Q2. Which ONE of the following laboratory parameters may have an increased value in viral infections?",
    options: ["MCHC", "lymphocytes", "HbA1c", "INR", "thrombocytes"],
    correct: "lymphocytes",
    explanation: "Lymphocyte count increases in viral infections.",
  },

  {
    id: 3,
    type: "match",
    category: "Haematology",
    question:
      "Q3. Which ONE of the following may have a decreased value in idiopathic thrombocytopenia purpura?",
    options: ["MCHC", "lymphocytes", "HbA1c", "INR", "thrombocytes"],
    correct: "thrombocytes",
    explanation:
      "Idiopathic thrombocytopenia purpura results in reduced platelet count.",
  },

  /* ================= Q4–Q6 ================= */

  {
    id: 4,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q4. Which ONE of the following conditions is manifested by muscle weakness and muscle wasting?",
    options: ["tachypnoea", "hypoxia", "afterload", "myopathy", "dysphasia"],
    correct: "myopathy",
    explanation: "Myopathy is characterised by muscle weakness and wasting.",
  },

  {
    id: 5,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q5. Which ONE of the following is characterised by a rapid rate of breathing?",
    options: ["tachypnoea", "hypoxia", "afterload", "myopathy", "dysphasia"],
    correct: "tachypnoea",
    explanation: "Tachypnoea refers to an abnormally rapid respiratory rate.",
  },

  {
    id: 6,
    type: "match",
    category: "Clinical Pharmacology",
    question:
      "Q6. Which ONE of the following refers to an impairment of the language aspect of speech?",
    options: ["tachypnoea", "hypoxia", "afterload", "myopathy", "dysphasia"],
    correct: "dysphasia",
    explanation: "Dysphasia (aphasia) refers to language impairment.",
  },

  /* ================= Q7–Q26 COMBO ================= */

  {
    id: 7,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "D",
    question:
      "Q7. Drugs that may cause plasma sodium electrolyte disturbances include:",
    statements: [" Prednisolone", " Salbutamol", " Propranolol"],
    explanation:
      "Only statement 1 is correct. Prednisolone may cause sodium and water retention; salbutamol and propranolol do not cause plasma sodium disturbance in this context.",
  },

  {
    id: 8,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "A",
    question:
      "Q8. Conditions that may give rise to muscular or joint pain include:",
    statements: [" Paget’s disease", " Neuropathy", " Haemophilia"],
    explanation: "All three conditions may cause musculoskeletal pain.",
  },

  {
    id: 9,
    type: "combo",
    category: "Oncology",
    correct: "A",
    question:
      "Q9. Symptoms that may indicate neoplastic disease if unexplained include:",
    statements: [
      " Skin ulceration",
      " Unexplained fractures",
      " General debility",
    ],
    explanation: "All are potential red-flag signs of malignancy.",
  },

  {
    id: 10,
    type: "combo",
    category: "Oncology",
    correct: "C",
    question:
      "Q10. Possible causes of resistance to cytotoxic chemotherapy include:",
    statements: [
      " Increased cellular uptake",
      " Increased repair of DNA damage",
      " Poor penetration into tumour tissue",
    ],
    explanation:
      "Increased DNA repair and poor tumour penetration contribute to resistance.",
  },

  {
    id: 11,
    type: "combo",
    category: "Neurology",
    correct: "B",
    question:
      "Q11. In Parkinson’s disease, the patient could be referred for services from the:",
    statements: [
      " Speech therapy department",
      " Physiotherapy department",
      " Pain management team",
    ],
    explanation: "Speech therapy and physiotherapy are appropriate referrals.",
  },

  {
    id: 12,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "B",
    question: "Q12. With respect to ultrasound scanning:",
    statements: [
      " It is associated with no radiation dose",
      " It may be used to define organ size and shape",
      " It can detect arterial blood flow to the organ",
    ],
    explanation:
      "Statements 1 and 2 are correct in this context; ultrasound is non-ionising and is used to assess organ size and shape.",
  },

  {
    id: 13,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "B",
    question: "Q13. Regarding creatinine clearance:",
    statements: [
      " It is an index used to measure glomerular filtration rate",
      " Measurement involves a 24-hour urine collection",
      " Measurement requires 24-hour monitoring of plasma creatinine",
    ],
    explanation: "Statements 1 and 2 are correct.",
  },

  {
    id: 14,
    type: "combo",
    category: "Cardiology",
    correct: "D",
    question:
      "Q14. Patients receiving isosorbide dinitrate should be advised that:",
    statements: [
      " The occurrence of headaches tends to decrease with continued therapy",
      " Tablets should be discarded 8 weeks after opening the container",
      " Tablets should be stored in glass containers",
    ],
    explanation:
      "Only statement 1 is correct. Headache commonly occurs early with nitrates and usually lessens with continued therapy.",
  },

  {
    id: 15,
    type: "combo",
    category: "Cardiology",
    correct: "B",
    question: "Q15. With respect to adrenaline:",
    statements: [
      " It is used in cardiac arrest",
      " Administration requires monitoring of blood pressure",
      " It results in a fall in blood pressure",
    ],
    explanation: "Statements 1 and 2 are correct.",
  },

  {
    id: 16,
    type: "combo",
    category: "Psychiatry",
    correct: "C",
    question: "Q16. With respect to methadone:",
    statements: [
      " It requires multiple dosing in a day",
      " It is addictive",
      " It is an opioid agonist",
    ],
    explanation: "Statements 2 and 3 are correct.",
  },

  {
    id: 17,
    type: "combo",
    category: "Oncology",
    correct: "A",
    question: "Q17. Patients receiving tamoxifen should be advised:",
    statements: [
      " That hot flushes may occur",
      " That menstrual irregularities may occur",
      " To report sudden breathlessness and any pain in the calf",
    ],
    explanation: "All three statements are correct.",
  },

  {
    id: 18,
    type: "combo",
    category: "Clinical Pharmacology",
    correct: "B",
    question: "Q18. Regarding parenteral sodium bicarbonate:",
    statements: [
      " It raises blood pH",
      " It is indicated in metabolic acidosis",
      " It may be used in hypomagnesaemia",
    ],
    explanation: "Statements 1 and 2 are correct.",
  },

  {
    id: 19,
    type: "combo",
    category: "Haematology",
    correct: "A",
    question: "Q19. With respect to phytomenadione:",
    statements: [
      " It is a lipid-soluble analogue of vitamin K",
      " It promotes hepatic synthesis of active prothrombin",
      " It is indicated in babies at birth to prevent vitamin K deficiency bleeding",
    ],
    explanation: "All statements are correct.",
  },

  {
    id: 20,
    type: "combo",
    category: "Haematology",
    correct: "A",
    question: "Q20. Regarding enoxaparin:",
    statements: [
      " It cannot be used at the same dose as heparin",
      " Thrombocytopenia may occur with its use",
      " Agents that affect haemostasis should be used with care",
    ],
    explanation: "All statements are correct.",
  },

  {
    id: 21,
    type: "combo",
    category: "Dermatology",
    correct: "A",
    question: "Q21. Patients receiving oral isotretinoin should be advised:",
    statements: [
      " To avoid pregnancy",
      " To avoid wax epilation during treatment",
      " To use a lip balm regularly",
    ],
    explanation: "All statements are correct.",
  },

  {
    id: 22,
    type: "combo",
    category: "Gastroenterology",
    correct: "C",
    question:
      "Q22. A patient who will be undergoing a colonoscopy is advised to:",
    statements: [
      " Use a topical haemorrhoid preparation before admission",
      " Take a bowel cleansing preparation",
      " Avoid solid food on the previous day",
    ],
    explanation: "Statements 2 and 3 are correct.",
  },

  {
    id: 23,
    type: "combo",
    category: "Respiratory",
    correct: "B",
    question: "Q23. In which of the following cases is referral recommended:",
    statements: [
      " A paediatric patient with a history of asthma presenting with a chest infection",
      " A patient receiving diuretics presenting with symptoms of heat stroke",
      " A tourist presenting with acute diarrhoea",
    ],
    explanation: "Statements 1 and 2 warrant referral.",
  },

  {
    id: 24,
    type: "combo",
    category: "Infectious Diseases",
    correct: "B",
    question:
      "Q24. Anti-infectives used in triple-therapy regimens to eradicate Helicobacter pylori include:",
    statements: [" Metronidazole", " Clarithromycin", " Telithromycin"],
    explanation: "Statements 1 and 2 are correct.",
  },

  {
    id: 25,
    type: "combo",
    category: "Infectious Diseases",
    correct: "D",
    question: "Q25. In HIV infection:",
    statements: [
      " Accumulation of mutations associated with drug resistance may occur",
      " Drug resistance testing is not possible",
      " Monotherapy is preferred",
    ],
    explanation: "Statement 1 only is correct.",
  },

  {
    id: 26,
    type: "combo",
    category: "Endocrinology",
    correct: "B",
    question: "Q26. Diabetic ketoacidosis:",
    statements: [
      " Is associated with insulin deficiency",
      " May be precipitated by a severe infection",
      " Causes retinopathy",
    ],
    explanation: "Statements 1 and 2 are correct.",
  },

  /* ===============================
                     CASE 1 – Questions 27–31
                  ================================= */

  {
    id: 27,
    type: "combo",
    category: "Cardiology",
    caseId: "case1",
    caseBlock:
      "PS is hospitalised with pulmonary oedema. The patient is started on metolazone 2.5 mg once daily and bumetanide 2 mg twice daily intravenously.",
    correct: "C",
    question: "Q27. Signs and symptoms of pulmonary oedema include:",
    statements: ["1. Weight loss", "2. Dyspnoea", "3. Cough"],
    explanation: "Pulmonary oedema presents with dyspnoea and cough.",
  },

  {
    id: 28,
    type: "combo",
    category: "Cardiology",
    caseId: "case1",
    correct: "C",
    question: "Q28. Precipitants of acute pulmonary oedema include:",
    statements: [
      "1. Hypothyroidism",
      "2. Excessive infusion rate",
      "3. Heart failure",
    ],
    explanation:
      "Excessive IV fluids and heart failure can precipitate pulmonary oedema.",
  },

  {
    id: 29,
    type: "combo",
    category: "Cardiology",
    caseId: "case1",
    correct: "B",
    question:
      "Q29. Parameters that are monitored during metolazone therapy include:",
    statements: [
      "1. Body weight",
      "2. Electrolytes",
      "3. Liver function tests",
    ],
    explanation: "Weight and electrolytes must be monitored with diuretics.",
  },

  {
    id: 30,
    type: "single",
    category: "Cardiology",
    caseId: "case1",
    question: "Q30. Metolazone and bumetanide:",
    options: [
      "Reduce the blood volume",
      "Produce a euphoric state",
      "Cause sedation",
      "Control bronchospasm",
      "Prevent embolisation",
    ],
    correct: "Reduce the blood volume",
    explanation: "Both drugs are diuretics and reduce blood volume.",
  },

  {
    id: 31,
    type: "combo",
    category: "Cardiology",
    caseId: "case1",
    correct: "B",
    question:
      "Q31. When PS is stabilised, the therapeutic plan should consider:",
    statements: [
      "1. Stopping metolazone treatment",
      "2. Changing bumetanide to an oral formulation",
      "3. Starting co-amoxiclav",
    ],
    explanation:
      "After stabilisation, step-down therapy and conversion to oral diuretics may be considered.",
  },

  /* ===============================
                     CASE 2 – Questions 32–38
                  ================================= */

  {
    id: 32,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    caseBlock:
      "CA is a 77-year-old patient admitted with infected multiple sores and complaints of polyuria and weakness. She presents with reduced skin turgor, dehydration, tremor and confusion. Past medical history includes diabetes managed by diet alone. On admission she is started on glibenclamide 2.5 mg daily, ciprofloxacin 500 mg bd, sodium chloride 0.9% IV infusion and haloperidol 0.5 mg bd. Random blood glucose: 12 mmol/L. Blood pressure: 125/78 mmHg.",
    correct: "B",
    question: "Q32. Management aims for CA include:",
    statements: [
      "1. Rehydration",
      "2. Control of hyperglycaemia",
      "3. Management of hypertension",
    ],
    explanation:
      "Management should focus on rehydration and control of hyperglycaemia. Blood pressure is normal and does not require intervention.",
  },

  {
    id: 33,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    correct: "B",
    question:
      "Q33. Parameters that need to be monitored to assess outcomes of therapy include:",
    statements: [
      "1. Urine output",
      "2. Blood glucose monitoring",
      "3. Thyroid function tests",
    ],
    explanation:
      "Urine output and blood glucose are essential for monitoring. Thyroid function tests are not indicated in this case.",
  },

  {
    id: 34,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    correct: "B",
    question:
      "Q34. Signs which indicate that the diabetes in CA is uncontrolled include:",
    statements: ["1. Infected sores", "2. Reduced skin turgor", "3. Tremor"],
    explanation:
      "Statements 1 and 2 are correct. Uncontrolled diabetes increases infection risk and can present with dehydration signs such as reduced skin turgor.",
  },

  {
    id: 35,
    type: "combo",
    category: "Clinical Pharmacology",
    caseId: "case2",
    correct: "C",
    question:
      "Q35. Pharmacist intervention with regards to therapy started on admission includes:",
    statements: [
      "1. Increase dose of ciprofloxacin",
      "2. Review sodium chloride infusion",
      "3. Rationale for haloperidol treatment",
    ],
    explanation:
      "The IV fluids should be reviewed carefully and the indication for haloperidol assessed. Increasing ciprofloxacin dose is not required.",
  },

  {
    id: 36,
    type: "single",
    category: "Endocrinology",
    caseId: "case2",
    question: "Q36. As regards glibenclamide therapy:",
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
  },

  {
    id: 37,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    correct: "B",
    question: "Q37. When the patient is discharged, advice includes:",
    statements: [
      "1. Consuming small, frequent regular meals",
      "2. Taking glibenclamide regularly",
      "3. Using fusidic acid cream daily",
    ],
    explanation:
      "Regular meals and adherence to glibenclamide are essential. Topical antibiotics should be reviewed before continued use.",
  },

  {
    id: 38,
    type: "combo",
    category: "Endocrinology",
    caseId: "case2",
    correct: "E",
    question: "Q38. Onset of hypoglycaemia in CA could be precipitated by:",
    statements: [
      "1. Missed doses of glibenclamide",
      "2. Excess dietary intake",
      "3. Skipped meals",
    ],
    explanation:
      "Hypoglycaemia with sulfonylureas is commonly precipitated by skipped meals.",
  },

  /* ===============================
                     CASE 3 – Questions 39–41
                  ================================= */

  {
    id: 39,
    type: "combo",
    category: "Clinical Pharmacology",
    caseId: "case3",
    caseBlock:
      "BD is a 34-year-old patient admitted with an overdose of promethazine and alcohol withdrawal symptoms. The patient has a history of alcohol abuse.",
    correct: "A",
    question:
      "Q39. Symptoms that could occur due to promethazine overdose include:",
    statements: ["1. Drowsiness", "2. Headache", "3. Blurred vision"],
    explanation:
      "Promethazine overdose commonly causes CNS depression (drowsiness), anticholinergic effects such as blurred vision, and headache.",
  },

  {
    id: 40,
    type: "single",
    category: "Clinical Pharmacology",
    caseId: "case3",
    question: "Q40. Promethazine is an:",
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
  },

  {
    id: 41,
    type: "single",
    category: "Psychiatry",
    caseId: "case3",
    question: "Q41. A drug that can be used in alcohol withdrawal is:",
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
  },

  /* ===============================
                     CASE 4 – Questions 42–44
                  ================================= */

  {
    id: 42,
    type: "combo",
    category: "Cardiology",
    caseId: "case4",
    caseBlock:
      "MB is a 58-year-old woman who presents with a prescription for simvastatin 10 mg daily. Her current medication is atenolol 50 mg daily. MB suffered a myocardial infarction last year.",
    correct: "B",
    question: "Q42. MB is advised:",
    statements: [
      "1. To report any muscle pain or weakness",
      "2. To take simvastatin at night",
      "3. To stop taking atenolol",
    ],
    explanation:
      "Patients on simvastatin should report unexplained muscle pain due to risk of myopathy. Simvastatin is best taken at night. Atenolol should not be stopped abruptly.",
  },

  {
    id: 43,
    type: "combo",
    category: "Cardiology",
    caseId: "case4",
    correct: "A",
    question: "Q43. Side-effects to be expected with simvastatin include:",
    statements: ["1. Headache", "2. Nausea", "3. Abdominal pain"],
    explanation:
      "Common adverse effects of simvastatin include headache, gastrointestinal disturbances such as nausea, and abdominal pain.",
  },

  {
    id: 44,
    type: "combo",
    category: "Cardiology",
    caseId: "case4",
    correct: "B",
    question: "Q44. Recommendations made to MB include:",
    statements: [
      "1. Follow moderate exercise",
      "2. Adopt a low-fat diet",
      "3. Take atenolol 2 hours before simvastatin",
    ],
    explanation:
      "Lifestyle modification including moderate exercise and a low-fat diet is recommended. There is no need to separate atenolol and simvastatin by 2 hours.",
  },

  /* ===============================
                     CASE 5 – Questions 45–47
                  ================================= */

  {
    id: 45,
    type: "combo",
    category: "Haematology",
    caseId: "case5",
    caseBlock:
      "GD is a 72-year-old female whose current medication is: aspirin 75 mg daily; dipyridamole 100 mg three times daily; timolol 0.5% eye drops, two drops in both eyes twice daily; lactulose 20 mL daily.",
    correct: "C",
    question: "Q45. With regard to dipyridamole:",
    statements: [
      "1. It cannot be used in combination with low-dose aspirin",
      "2. It is used for prophylaxis of thromboembolism",
      "3. It may cause increased bleeding during or after surgery",
    ],
    explanation:
      "Dipyridamole is commonly combined with low-dose aspirin for antiplatelet therapy. It is used for thromboembolic prophylaxis and may increase bleeding risk.",
  },

  {
    id: 46,
    type: "combo",
    category: "Gastroenterology",
    caseId: "case5",
    correct: "E",
    question: "Q46. With regard to lactulose:",
    statements: [
      "1. The dose needs to be reviewed as the maximum adult daily dose is 5 mL",
      "2. It should not be used for more than 5 days",
      "3. It is used to maintain bowel evacuation",
    ],
    explanation:
      "Lactulose doses are often much higher than 5 mL daily. It can be used long term if needed. It is used to treat constipation and maintain bowel evacuation.",
  },

  {
    id: 47,
    type: "combo",
    category: "Ophthalmology",
    caseId: "case5",
    correct: "D",
    question: "Q47. GD is receiving medications for:",
    statements: ["1. Glaucoma", "2. Diarrhoea", "3. Osteoporosis"],
    explanation:
      "Timolol eye drops are used for glaucoma. Lactulose is for constipation, not diarrhoea. No medication listed is for osteoporosis.",
  },

  /* ===============================
                     CASE 6 – Questions 48–53
                  ================================= */

  {
    id: 48,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    caseBlock:
      "SP is a 64-year-old patient admitted with tiredness, shortness of breath and ankle oedema. She has a history of congestive heart failure. SP was intolerant to enalapril due to cough. Current medications: spironolactone 12.5 mg daily and losartan 25 mg daily.",
    correct: "B",
    question: "Q48. The therapeutic aims for SP are:",
    statements: [
      "1. To control symptoms of heart failure",
      "2. To control oedema",
      "3. To control diabetes",
    ],
    explanation:
      "Management aims focus on heart failure symptom control and oedema reduction. There is no indication of diabetes.",
  },

  {
    id: 49,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "A",
    question: "Q49. With regard to spironolactone:",
    statements: [
      "1. It reduces symptoms and mortality",
      "2. The dose may be increased to 25 mg daily",
      "3. It is an aldosterone antagonist",
    ],
    explanation:
      "Spironolactone reduces mortality in heart failure, can be titrated to 25 mg daily, and is an aldosterone antagonist.",
  },

  {
    id: 50,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "B",
    question:
      "Q50. Monitoring required because of spironolactone treatment involves:",
    statements: [
      "1. Serum creatinine",
      "2. Serum potassium",
      "3. Thyroid function",
    ],
    explanation:
      "Renal function and potassium must be monitored due to hyperkalaemia risk. Thyroid monitoring is not required.",
  },

  {
    id: 51,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "A",
    question: "Q51. With regard to losartan:",
    statements: [
      "1. It is an angiotensin-II receptor antagonist",
      "2. It exhibits a lower incidence of cough compared with enalapril",
      "3. The dose may be increased to 50 mg daily",
    ],
    explanation:
      "Losartan is an ARB, has lower cough incidence than ACE inhibitors, and can be titrated to 50 mg daily.",
  },

  {
    id: 52,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "C",
    question: "Q52. Digoxin is used in patients with heart failure:",
    statements: [
      "1. Because it decreases myocardial intracellular ionic calcium",
      "2. When there is atrial fibrillation",
      "3. Because it exerts a positive inotropic effect",
    ],
    explanation:
      "Digoxin increases intracellular calcium (not decreases), is useful in atrial fibrillation, and has a positive inotropic effect.",
  },

  {
    id: 53,
    type: "combo",
    category: "Cardiology",
    caseId: "case6",
    correct: "B",
    question:
      "Q53. Parameters to be monitored when digoxin therapy is started include:",
    statements: [
      "1. Plasma digoxin concentration",
      "2. Plasma potassium measurement",
      "3. Plasma sodium measurement",
    ],
    explanation:
      "Digoxin levels and potassium must be monitored. Sodium monitoring is not routinely required for digoxin initiation.",
  },

  /* ===============================
                     CASE 7 - Questions 54-57
                  ================================= */

  {
    id: 54,
    type: "single",
    category: "Infectious Diseases",
    caseId: "case7",
    caseBlock:
      "LB is a 55-year-old male patient who developed unilateral vesicles around his waist and complained of stabbing irritation in the area. LB is prescribed aciclovir 800 mg five times daily for 5 days.",
    question: "Q54. The likely diagnosis for LB is:",
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
  },

  {
    id: 55,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case7",
    correct: "B",
    question: "Q55. Patient should be advised:",
    statements: [
      "1. To take doses at regular intervals",
      "2. To avoid exposure to sunlight",
      "3. To wash hands thoroughly after drug administration",
    ],
    explanation:
      "Regular dosing and sunlight avoidance are key counseling points with aciclovir in this context.",
  },

  {
    id: 56,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case7",
    correct: "A",
    question: "Q56. Side-effects that may be expected include:",
    statements: ["1. Headache", "2. Nausea", "3. Diarrhoea"],
    explanation:
      "All listed effects are recognized adverse effects of aciclovir therapy.",
  },

  {
    id: 57,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case7",
    correct: "B",
    question: "Q57. Adjuvant therapy that may be used for LB include(s):",
    statements: ["1. Calamine lotion", "2. Amitriptyline", "3. Ergotamine"],
    explanation:
      "Calamine and amitriptyline can be useful adjuncts; ergotamine is not indicated for shingles-related pain.",
  },

  /* ===============================
                     CASE 8 - Questions 58-63
                  ================================= */

  {
    id: 58,
    type: "single",
    category: "Infectious Diseases",
    caseId: "case8",
    caseBlock:
      "AD is a 39-year-old female with bacterial endocarditis. She is started on gentamicin 80 mg IV twice daily and penicillin G IV 1.8 g every 6 hours.",
    question: "Q58. Penicillin G is:",
    options: [
      "phenoxymethylpenicillin",
      "benzylpenicillin",
      "penicillin V",
      "piperacillin",
      "pivmecillinam",
    ],
    correct: "benzylpenicillin",
    explanation: "Penicillin G is benzylpenicillin.",
  },

  {
    id: 59,
    type: "single",
    category: "Infectious Diseases",
    caseId: "case8",
    question:
      "Q59. Penicillin G is available in 600 mg vials. How many vials are required for each dose?",
    options: ["0.5", "1", "2", "3", "30"],
    correct: "3",
    explanation:
      "A 1.8 g dose equals 1800 mg, so 1800/600 = 3 vials per dose.",
  },

  {
    id: 60,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case8",
    correct: "C",
    question: "Q60. Penicillin G:",
    statements: [
      "1. Is bacteriostatic",
      "2. Is bactericidal",
      "3. Can be given as an intramuscular injection",
    ],
    explanation:
      "Penicillin G is bactericidal and is administered parenterally, including intramuscular routes.",
  },

  {
    id: 61,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case8",
    correct: "D",
    question: "Q61. Gentamicin:",
    statements: [
      "1. Has a broad spectrum of activity",
      "2. Is contraindicated in hepatic impairment",
      "3. Therapy may be changed to oral administration when the patient is stabilised",
    ],
    explanation:
      "Gentamicin has broad antibacterial activity, but it is not switched to oral therapy for systemic treatment.",
  },

  {
    id: 62,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case8",
    correct: "A",
    question: "Q62. A possible reason for these symptoms is:",
    statements: [
      "1. Allergy to gentamicin",
      "2. Allergy to penicillin G",
      "3. Development of heat rash",
    ],
    explanation:
      "All listed possibilities can explain rash and generalized itch in this setting.",
  },

  {
    id: 63,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "case8",
    correct: "A",
    question: "Q63. Manifestations of bacterial endocarditis include:",
    statements: [
      "1. Prolonged fever",
      "2. Embolic phenomena",
      "3. Renal failure",
    ],
    explanation:
      "All three can occur as manifestations or complications of bacterial endocarditis.",
  },

  /* ===============================
                     CASE 9 - Questions 64-74
                  ================================= */

  {
    id: 64,
    type: "single",
    category: "Rheumatology",
    caseId: "case9",
    caseBlock:
      "JZ is a 78-year-old obese male diagnosed with an acute attack of gout. PMH: hypertension and heart failure. Current medicines include enalapril 5 mg daily, atenolol 100 mg daily, bendroflumethiazide 5 mg daily, and aspirin EC 75 mg daily. He is started on colchicine 500 micrograms twice daily for six days.",
    question: "Q64. Gout:",
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
  },

  {
    id: 65,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "A",
    question: "Q65. Gout may be precipitated in JZ by:",
    statements: [
      "1. Heart failure",
      "2. Bendroflumethiazide",
      "3. Excessive consumption of meat in the diet",
    ],
    explanation:
      "All three factors can increase urate burden or trigger gout attacks.",
  },

  {
    id: 66,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "D",
    question: "Q66. Gout:",
    statements: [
      "1. Presents as a painful condition in the big toe",
      "2. Onset is insidious",
      "3. Recurrence is rare",
    ],
    explanation:
      "Typical acute gout is painful in the big toe, with sudden onset and potential recurrence.",
  },

  {
    id: 67,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "D",
    question: "Q67. Diagnosis of gout:",
    statements: [
      "1. Is based on clinical signs",
      "2. Requires confirmation of urate crystals in synovial fluid of affected joint",
      "3. Requires a positive ESR level",
    ],
    explanation:
      "Clinical features are characteristic, crystal confirmation supports diagnosis, and ESR is non-specific.",
  },

  {
    id: 68,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "B",
    question: "Q68. Non-pharmacological measures for JZ include:",
    statements: [
      "1. Resting the affected joint",
      "2. Maintaining a high fluid intake",
      "3. Maintaining a high calcium intake",
    ],
    explanation:
      "Rest and hydration are advised; high calcium intake is not a core gout measure.",
  },

  {
    id: 69,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "B",
    question: "Q69. Colchicine:",
    statements: [
      "1. Reduces the inflammatory reaction to urate crystals",
      "2. Provides dramatic relief from acute attacks of gout",
      "3. Is also used in rheumatoid arthritis",
    ],
    explanation:
      "Colchicine is effective in gout inflammation but is not a standard rheumatoid arthritis treatment.",
  },

  {
    id: 70,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "A",
    question: "Q70. Colchicine:",
    statements: [
      "1. Should be used when there is a contraindication to NSAIDs",
      "2. Is more toxic than NSAIDs",
      "3. Occurrence of diarrhoea and vomiting are used as an index to review therapy",
    ],
    explanation:
      "All statements are true; GI toxicity is a key signal for dose review.",
  },

  {
    id: 71,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "B",
    question:
      "Q71. Alternatives to colchicine in the management of gout include:",
    statements: ["1. Indometacin", "2. Diclofenac", "3. Aspirin"],
    explanation:
      "Indometacin and diclofenac are options in acute gout; aspirin can worsen urate handling.",
  },

  {
    id: 72,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "B",
    question: "Q72. To prevent further attacks, JZ should be advised to:",
    statements: [
      "1. Lose weight",
      "2. Follow a diet low in purines",
      "3. Keep taking colchicine on a long-term basis",
    ],
    explanation:
      "Weight reduction and low-purine diet reduce recurrence risk; long-term colchicine is not routine for all patients.",
  },

  {
    id: 73,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "A",
    question: "Q73. Allopurinol:",
    statements: [
      "1. Should be started 2-3 weeks after the acute attack has subsided",
      "2. Reduces urate production",
      "3. Is given once daily",
    ],
    explanation:
      "All statements are correct for long-term urate-lowering prophylaxis with allopurinol.",
  },

  {
    id: 74,
    type: "combo",
    category: "Rheumatology",
    caseId: "case9",
    correct: "A",
    question: "Q74. Uricosuric agents:",
    statements: [
      "1. Can be used instead of allopurinol",
      "2. Are ineffective in patients with impaired renal function",
      "3. Increase renal urate excretion",
    ],
    explanation:
      "All three are correct for uricosuric therapy use and mechanism.",
  },

  /* ===============================
                     CASE 10 - Questions 75-80
                  ================================= */

  {
    id: 75,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    caseBlock:
      "HG is a 71-year-old female with Sjogren's syndrome presenting with dry eyes and dry mouth. Her medicines include aspirin, dipyridamole, glimepiride, and atenolol. She was recently diagnosed with hypothyroidism and started on thyroxine 50 micrograms daily; metformin 500 mg daily and simvastatin 10 mg nocte were added at follow-up.",
    correct: "A",
    question:
      "Q75. In view of the recent amendments to her treatment, HG should be advised to:",
    statements: [
      "1. Take thyroxine tablet in the morning",
      "2. Take metformin tablet with food",
      "3. Take dipyridamole tablets before food",
    ],
    explanation:
      "All counseling points are appropriate for thyroxine, metformin, and dipyridamole use.",
  },

  {
    id: 76,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "D",
    question: "Q76. Hypothyroidism:",
    statements: [
      "1. May have an insidious onset in the elderly",
      "2. May cause dry eyes",
      "3. May induce hypoglycaemia",
    ],
    explanation:
      "Only statement 1 is correct in this context; dry eyes here are linked to Sjogren's syndrome.",
  },

  {
    id: 77,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "D",
    question:
      "Q77. Drugs that could significantly interact with thyroxine include:",
    statements: ["1. Warfarin", "2. Simvastatin", "3. Ranitidine"],
    explanation:
      "Warfarin interaction is clinically significant; simvastatin and ranitidine are not key interactions here.",
  },

  {
    id: 78,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "A",
    question: "Q78. Caution should be undertaken when starting thyroxine in:",
    statements: [
      "1. Elderly patients",
      "2. Diabetics",
      "3. Patients with cardiovascular disorders",
    ],
    explanation:
      "All listed groups require cautious initiation and monitoring with thyroxine.",
  },

  {
    id: 79,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "B",
    question: "Q79. Side-effects associated with thyroxine include:",
    statements: ["1. Diarrhoea", "2. Anginal pain", "3. Bradycardia"],
    explanation:
      "Diarrhoea and anginal symptoms can occur with overtreatment; bradycardia is not typical.",
  },

  {
    id: 80,
    type: "combo",
    category: "Endocrinology",
    caseId: "case10",
    correct: "D",
    question: "Q80. Total thyroid hormones:",
    statements: [
      "1. Concentration in plasma changes with alterations in amount of thyroxine-binding globulin in plasma",
      "2. Concentration is used as the main diagnostic marker for hypothyroidism",
      "3. Act as antibodies to thyroglobulin",
    ],
    explanation:
      "Only statement 1 is correct; diagnosis relies mainly on free thyroid hormones and TSH, and thyroid hormones are not antibodies.",
  },
  /* ===============================
                     TEST 2 - Questions 81-160
                  ================================= */
  {
    id: 81,
    type: "match",
    category: "Clinical Documentation",
    question: "Q81. Which abbreviation describes conditions that the patient has experienced previously?",
    options: [
      "PMH",
      "O/E",
      "SH",
      "PC",
      "FH",
    ],
    correct: "PMH",
    explanation: "PMH means past medical history, which records conditions experienced previously by the patient.",
  },

  {
    id: 82,
    type: "match",
    category: "Clinical Documentation",
    question: "Q82. Which abbreviation refers to symptoms presented by the patient?",
    options: [
      "PMH",
      "O/E",
      "SH",
      "PC",
      "FH",
    ],
    correct: "PC",
    explanation: "PC means presenting complaint, which captures the symptoms reported by the patient.",
  },

  {
    id: 83,
    type: "match",
    category: "Clinical Documentation",
    question: "Q83. Which abbreviation refers to findings on examination of the patient?",
    options: [
      "PMH",
      "O/E",
      "SH",
      "PC",
      "FH",
    ],
    correct: "O/E",
    explanation: "O/E means on examination, documenting clinical findings observed by the healthcare professional.",
  },

  {
    id: 84,
    type: "match",
    category: "Laboratory Medicine",
    question: "Q84. Which laboratory test is carried out as part of kidney function monitoring?",
    options: [
      "HbA1c",
      "BUN",
      "TSH",
      "LFT",
      "MCV",
    ],
    correct: "BUN",
    explanation: "BUN is used as part of renal function monitoring.",
  },

  {
    id: 85,
    type: "match",
    category: "Laboratory Medicine",
    question: "Q85. Which laboratory test is carried out in thyroid function monitoring?",
    options: [
      "HbA1c",
      "BUN",
      "TSH",
      "LFT",
      "MCV",
    ],
    correct: "TSH",
    explanation: "TSH is a core laboratory test in thyroid function monitoring.",
  },

  {
    id: 86,
    type: "match",
    category: "Laboratory Medicine",
    question: "Q86. Which laboratory test is used to monitor diabetic patients?",
    options: [
      "HbA1c",
      "BUN",
      "TSH",
      "LFT",
      "MCV",
    ],
    correct: "HbA1c",
    explanation: "HbA1c is used to monitor long-term glycaemic control in diabetes.",
  },

  {
    id: 87,
    type: "combo",
    category: "Haematology",
    question: "Q87. INR:",
    statements: [
      "1. is monitored in patients with arthritis",
      "2. is monitored in patients receiving warfarin",
      "3. stands for international normalised ratio",
    ],
    correct: "C",
    explanation: "INR stands for international normalised ratio. It is a ratio value comparing a patient’s prothrombin time against the prothrombin time of normal control patients.",
  },

  {
    id: 88,
    type: "combo",
    category: "Respiratory",
    question: "Q88. Lung function tests:",
    statements: [
      "1. always involve administration of bronchodilators before the procedure",
      "2. are used to determine severity of respiratory disease",
      "3. are used to monitor outcomes of therapy",
    ],
    correct: "C",
    explanation: "Lung function tests involve the use of a spirometer to measure lung volumes and air ﬂow rates. Measurements include forced expiratory volume, vital capacity, forced vital capacity and residual volume.",
  },

  {
    id: 89,
    type: "combo",
    category: "Cardiology",
    question: "Q89. In heart failure:",
    statements: [
      "1. chest radiographs may show cardiac enlargement",
      "2. the pulse rate may indicate arrhythmias",
      "3. body extremities are very hot",
    ],
    correct: "B",
    explanation: "Heart failure results in a reduced cardiac output leading to impaired oxygenation and a compromised blood supply to muscles.",
  },

  {
    id: 90,
    type: "combo",
    category: "Gastroenterology",
    question: "Q90. Colonoscopy:",
    statements: [
      "1. is an artificial opening between the colon and skin",
      "2. should not be performed in periods of less than five years",
      "3. requires the patient to perform bowel cleansing",
    ],
    correct: "E",
    explanation: "Colonoscopy is a diagnostic procedure that is used in the assessment of gastrointestinal disorders of the colon.",
  },

  {
    id: 91,
    type: "combo",
    category: "Neurology",
    question: "Q91. EEG:",
    statements: [
      "1. is carried out to confirm the occurrence of cardiovascular disease",
      "2. procedures require patients to be totally sedated",
      "3. stands for electroencephalography",
    ],
    correct: "E",
    explanation: "EEG stands for electroencephalography and it is a test carried out to measure and record electrical impulses in the brain.",
  },

  {
    id: 92,
    type: "combo",
    category: "Cardiology",
    question: "Q92. Chronically elevated arterial pressure may cause:",
    statements: [
      "1. renovascular disease",
      "2. haemorrhagic stroke",
      "3. nasal congestion",
    ],
    correct: "B",
    explanation: "Arterial pressure reﬂects the stress exerted by the circulating blood on the arterial walls. It is directly related to the cardiac output and the systemic vascular resistance.",
  },

  {
    id: 93,
    type: "combo",
    category: "Cardiology",
    question: "Q93. Atherosclerosis:",
    statements: [
      "1. can occur in different organs",
      "2. may result in myocardial infarction",
      "3. causes chest pain",
    ],
    correct: "B",
    explanation: "Atherosclerosis is a common arterial disorder characterised by deposits of plaques consisting of cholesterol, lipids and cellular debris on the inner layers of walls of largeand medium-sized arteries.",
  },

  {
    id: 94,
    type: "combo",
    category: "Cardiology",
    question: "Q94. Patients with angina pectoris may be advised that factors which precipitate an attack include:",
    statements: [
      "1. exercise",
      "2. anxiety",
      "3. light meals",
    ],
    correct: "B",
    explanation: "Angina pectoris is thoracic pain, most often caused by myocardial anoxia. Symptoms of angina pectoris may occur with activities or circumstances that increase cardiac workload such as: exertion following exercise, like climbing stairs; emotion, such as anxiety, which results in an increased heart rate; heavy meals, because of the requirement of increased gastrointestinal perfusion; and exposure to cold temperatures owing to peripheral vasoconstriction, which leads to increased peripheral resistance.",
  },

  {
    id: 95,
    type: "combo",
    category: "Cardiology",
    question: "Q95. After a myocardial infarction, a patient should be advised:",
    statements: [
      "1. that normal activity can never be re-achieved",
      "2. to attain normal body weight",
      "3. to undertake moderate exercise",
    ],
    correct: "C",
    explanation: "A myocardial infarction occurs because of a coronary vessel occlusion for a duration of about 6 h.",
  },

  {
    id: 96,
    type: "combo",
    category: "Gastroenterology",
    question: "Q96. Common complications of gallstones include:",
    statements: [
      "1. biliary colic",
      "2. jaundice",
      "3. appendicitis",
    ],
    correct: "B",
    explanation: "Gallstones consist of cholesterol and bile pigments that are calciﬁed. Common complications of gallstones include biliary colic, cholestatic jaundice, acute pancreatitis and acute cholecystitis and cholangitis.",
  },

  {
    id: 97,
    type: "combo",
    category: "Rheumatology",
    question: "Q97. Patients with osteoarthritis should be informed that:",
    statements: [
      "1. disease progression is very gradual",
      "2. weight loss is recommended",
      "3. prolonged bed-rest is advisable",
    ],
    correct: "B",
    explanation: "In osteoarthritis degenerative changes including subchondral bony sclerosis, loss of articular cartilage and proliferation of bone spurs occur in one or many joints.",
  },

  {
    id: 98,
    type: "combo",
    category: "Oncology",
    question: "Q98. Patients receiving cytotoxic chemotherapy should be advised that:",
    statements: [
      "1. nausea and vomiting may occur before treatment",
      "2. hair loss may occur",
      "3. any signs of infection should be reported to a health professional",
    ],
    correct: "C",
    explanation: "A major disadvantage of cytotoxic chemotherapy is that it interferes with cellular activity in cancerous and normal tissues.",
  },

  {
    id: 99,
    type: "combo",
    category: "Neurology",
    question: "Q99. When a patient presents with a fall and a blackout:",
    statements: [
      "1. the incident has to be investigated",
      "2. the patient has epilepsy",
      "3. the incident should raise the alarm only if it occurs in paediatric patients",
    ],
    correct: "D",
    explanation: "When there is temporary loss of consciousness leading to a fall, it may indicate a brief cerebral hypoxia, which could be caused by a number of factors including emotional stress, vascular pooling in the legs, diaphoresis or a sudden change in body position.",
  },

  {
    id: 100,
    type: "combo",
    category: "Clinical Pharmacology",
    question: "Q100. Hypokalaemia may be due to:",
    statements: [
      "1. vomiting",
      "2. drugs",
      "3. renal failure",
    ],
    correct: "B",
    explanation: "Hypokalaemia is a decreased serum potassium level. Normally the potassium loss from the body through renal and faecal excretion and from loss in sweat is miminal.",
  },

  {
    id: 101,
    type: "combo",
    category: "Endocrinology",
    question: "Q101. Clinical features of hypoglycaemia include:",
    statements: [
      "1. sweating",
      "2. hunger",
      "3. blurred vision",
    ],
    correct: "A",
    explanation: "Hypoglycaemia is a blood glucose level below 3 mmol/l. It is a condition that develops rapidly and usually occurs in diabetics either because of an excessive antidiabetic dose or owing to changes in lifestyle.",
  },

  {
    id: 102,
    type: "combo",
    category: "Allergy and Immunology",
    question: "Q102. An anaphylactic shock could present with:",
    statements: [
      "1. rash",
      "2. bronchoconstriction",
      "3. hypertension",
    ],
    correct: "B",
    explanation: "An anaphylactic shock occurs because of a hypersensitivity reaction. Presentation includes development of a rash, acute bronchoconstriction, profound hypotension and collapse.",
  },

  {
    id: 103,
    type: "combo",
    category: "Endocrinology",
    question: "Q103. Diabetic patients should be advised to monitor their condition because they are prone to develop:",
    statements: [
      "1. retinopathy",
      "2. chronic renal failure",
      "3. ischaemic heart disease",
    ],
    correct: "A",
    explanation: "Diabetes is associated with microvascular complications, the incidence of which may be reduced with optimal blood glucose control.",
  },

  {
    id: 104,
    type: "combo",
    category: "Clinical Pharmacology",
    question: "Q104. Normal saline:",
    statements: [
      "1. is 0.9% sodium chloride",
      "2. may be used in electrolyte imbalance",
      "3. may be applied as nasal drops",
    ],
    correct: "A",
    explanation: "Normal saline consists of 0. 9% sodium chloride as an isotonic solution.",
  },

  {
    id: 105,
    type: "combo",
    category: "Ophthalmology",
    question: "Q105. Disadvantages of the administration of corticosteroids in the eye include:",
    statements: [
      "1. corneal thinning",
      "2. glaucoma",
      "3. cataracts",
    ],
    correct: "A",
    explanation: "Topical administration of corticosteroids in the eye is associated with thinning of the cornea and sclera, steroid glaucoma and steroid cataract.",
  },

  {
    id: 106,
    type: "combo",
    category: "Clinical Pharmacy",
    question: "Q106. In which of the following cases is referral recommended?",
    statements: [
      "1. an asthmatic patient who presents with fever, chesty cough and wheezing",
      "2. a patient receiving antihypertensive medication who presents with nasal congestion",
      "3. a patient presenting with allergic rhinitis",
    ],
    correct: "D",
    explanation: "Asthmatic patients who present with fever, chesty cough and wheezing indicate onset of a chest infection where the use of antibacterials may be necessary to counteract bacterial infections or to cover against the development of secondary bacterial infections.",
  },

  {
    id: 107,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    caseBlock: "AB is a 74-year-old male admitted to a medical ward. PMH: diabetes mellitus controlled by diet, hypertension, congestive heart failure. DH: bumetanide 1 mg daily, potassium chloride 600 mg bd, isosorbide dinitrate 10 mg tds, atenolol 100 mg bd, aspirin 75 mg daily, lorazepam 1 mg tds, metoclopramide 10 mg prn. PC: increasing shortness of breath, dyspnoea, cyanosis, tachycardia. O/E: BP 160/100 mmHg, pulse 100 bpm. Diagnosis: congestive heart failure. Labs: sodium 130 mmol/l, potassium 3.2 mmol/l, chloride 95 mmol/l, fasting blood glucose 15.6 mmol/l. Discharge treatment: bumetanide 1 mg daily, isosorbide dinitrate 10 mg tds, enalapril 5 mg nocte, aspirin 75 mg daily, lorazepam 1 mg tds, metoclopramide 10 mg prn.",
    question: "Q107. What condition(s) does AB have?",
    statements: [
      "1. asthma",
      "2. diabetes mellitus",
      "3. congestive heart failure",
    ],
    correct: "C",
    explanation: "AB has diabetes mellitus and congestive heart failure. In elderly and diabetic patients it is very common to ﬁnd multiple disease states.",
  },

  {
    id: 108,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q108. Signs and symptoms of congestive heart failure include:",
    statements: [
      "1. oedema",
      "2. dyspnoea",
      "3. insomnia",
    ],
    correct: "B",
    explanation: "In congestive heart failure there is generalised oedema and usually the term implies bilateral failure resulting in reduced cardiac contractility.",
  },

  {
    id: 109,
    type: "single",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q109. Bumetanide is a (an):",
    options: [
      "thiazide diuretic",
      "loop diuretic",
      "potassium-sparing diuretic",
      "aldosterone antagonist",
      "osmotic diuretic",
    ],
    correct: "loop diuretic",
    explanation: "Bumetanide is a loop diuretic used for fluid overload states such as heart failure.",
  },

  {
    id: 110,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q110. Isosorbide dinitrate:",
    statements: [
      "1. is used for prophylaxis of angina",
      "2. is metabolised to isosorbide mononitrate",
      "3. can only be administered sublingually",
    ],
    correct: "B",
    explanation: "Isosorbide dinitrate is a nitrate that is used in the prophylaxis and treatment of angina and in left ventricular failure.",
  },

  {
    id: 111,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q111. Atenolol:",
    statements: [
      "1. is a beta-adrenoceptor blocking drug",
      "2. is contraindicated in uncontrolled heart failure",
      "3. maximum daily dose is 100 mg",
    ],
    correct: "A",
    explanation: "Atenolol is a cardioselective beta-adrenoceptor blocker that is used in hypertension and in angina.",
  },

  {
    id: 112,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case1",
    question: "Q112. Lorazepam:",
    statements: [
      "1. has a sedative effect",
      "2. is used to alleviate anxiety",
      "3. may cause ataxia in AB",
    ],
    correct: "A",
    explanation: "Lorazepam is a short-acting benzodiazepine that has anti-anxiety and hypnotic properties. Use of benzodiazepines in older people is associated with alterations in the pharmacokinetic parameters of the drug that lead to clinical consequences such as drowsiness, confusion and ataxia (a condition characterised by an inability to coordinate movement).",
  },

  {
    id: 113,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q113. AB was started on enalapril because it:",
    statements: [
      "1. has a valuable role in heart failure",
      "2. lowers blood pressure",
      "3. prevents myocardial infarction",
    ],
    correct: "B",
    explanation: "Enalapril is an angiotensin-converting enzyme (ACE) inhibitor, which causes a decreased arterial and venous vasoconstriction and a decreased blood volume.",
  },

  {
    id: 114,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q114. When starting AB on enalapril, the following parameters should be monitored:",
    statements: [
      "1. blood pressure",
      "2. serum potassium levels",
      "3. kidney function",
    ],
    correct: "A",
    explanation: "ACE inhibitors may cause a rapid fall in blood pressure. This may be quite relevant to AB as the patient is already being administered other drugs that have a hypotensive effect.",
  },

  {
    id: 115,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q115. Upon discharge patient is informed that:",
    statements: [
      "1. his medication has been reviewed",
      "2. instead of atenolol he is prescribed enalapril to be taken daily at night",
      "3. he should take metoclopramide only as required",
    ],
    correct: "A",
    explanation: "Upon discharge, the changes carried out in his medications should be discussed with AB. It should be particularly pointed out that atenolol and potassium chloride have been stopped and instead enalapril has to be taken daily at night.",
  },

  {
    id: 116,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q116. Regarding bumetanide, AB should be advised to take:",
    statements: [
      "1. one tablet daily",
      "2. dose in the morning",
      "3. dose on an empty stomach",
    ],
    correct: "B",
    explanation: "Regarding bumetanide, AB should be advised to take one tablet daily in the morning to avoid waking up at night because of the increased diuresis that it causes.",
  },

  {
    id: 117,
    type: "single",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q117. The patient should be advised to take isosorbide dinitrate tablets at:",
    options: [
      "8 am, 2 pm, 6 pm",
      "8 am, 4 pm, 1 am",
      "8 am, 3 pm, 10 pm",
      "7 am, 3 pm, 2 am",
      "7 am, 3 pm, midnight",
    ],
    correct: "8 am, 2 pm, 6 pm",
    explanation: "A daytime schedule such as 8 am, 2 pm, and 6 pm supports nitrate dosing while avoiding unnecessary nocturnal dosing.",
  },

  {
    id: 118,
    type: "combo",
    category: "Cardiology",
    caseId: "t2_case1",
    question: "Q118. Follow-up of AB includes monitoring of:",
    statements: [
      "1. blood pressure",
      "2. blood glucose levels",
      "3. development of oedema",
    ],
    correct: "A",
    explanation: "Monitoring the outcome of therapy in AB is based on the measurement of blood pressure, the assessment of development of oedema and dyspnoea, and the measurement of blood glucose levels and HbA1c.",
  },

  {
    id: 119,
    type: "single",
    category: "Infectious Diseases",
    caseId: "t2_case2",
    caseBlock: "XY is a 49-year-old patient allergic to penicillin. She was prescribed erythromycin for cellulitis, developed a rash, and erythromycin was withdrawn.",
    question: "Q119. Which of the following antibacterial agents is the most appropriate for XY:",
    options: [
      "flucloxacillin",
      "cefuroxime",
      "nalidixic acid",
      "fluconazole",
      "isoniazid",
    ],
    correct: "cefuroxime",
    explanation: "Cefuroxime is the most appropriate option among those listed for this cellulitis scenario.",
  },

  {
    id: 120,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t2_case2",
    question: "Q120. When XY is started on the new treatment:",
    statements: [
      "1. development of a rash should be monitored",
      "2. signs of anaphylaxis should be detected",
      "3. an allergic reaction could develop after a month after last drug administration",
    ],
    correct: "B",
    explanation: "Hypersensitivity reactions may occur with any antibacterial agent. They are more commonly recognised with penicillins.",
  },

  {
    id: 121,
    type: "single",
    category: "Psychiatry",
    caseId: "t2_case3",
    caseBlock: "PS is a 69-year-old patient with orofacial unwanted movements. Current medication includes diazepam 5 mg nocte and amitriptyline 25 mg tds.",
    question: "Q121. The presenting complaint could be:",
    options: [
      "akathisia",
      "tardive dyskinesia",
      "agranulocytosis",
      "purpura",
      "hypomania",
    ],
    correct: "tardive dyskinesia",
    explanation: "Orofacial involuntary movements are consistent with tardive dyskinesia.",
  },

  {
    id: 122,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case3",
    question: "Q122. A review of medication could propose changing amitriptyline to:",
    statements: [
      "1. imipramine",
      "2. venlafaxine",
      "3. reboxetine",
    ],
    correct: "C",
    explanation: "Venlafaxine and reboxetine are antidepressant drugs that are less likely to be associated with the development of movement disorders.",
  },

  {
    id: 123,
    type: "combo",
    category: "Clinical Pharmacy",
    caseId: "t2_case4",
    caseBlock: "QR is a 75-year-old male whose current medication is co-codamol 2 tablets qid, paracetamol 1 g qid, gliclazide 80 mg bd, ferrous sulphate 800 mg tds, dipyridamole 25 mg tds, and isosorbide dinitrate 20 mg tds.",
    question: "Q123. Pharmacist intervention includes:",
    statements: [
      "1. suggesting cessation of co-codamol",
      "2. reviewing the dose of ferrous sulphate",
      "3. reviewing the isosorbide dinitrate dose as the maximum daily dose is 5 mg daily",
    ],
    correct: "B",
    explanation: "Co-codamol is a compound preparation containing paracetamol, a non-opioid analgesic, and codeine, an opioid analgesic.",
  },

  {
    id: 124,
    type: "single",
    category: "Clinical Pharmacology",
    caseId: "t2_case4",
    question: "Q124. The maximum adult daily dose of paracetamol is:",
    options: [
      "1 g",
      "2 g",
      "3 g",
      "4 g",
      "8 g",
    ],
    correct: "4 g",
    explanation: "The maximum adult daily dose of paracetamol is 4 g.",
  },

  {
    id: 125,
    type: "single",
    category: "Endocrinology",
    caseId: "t2_case4",
    question: "Q125. Gliclazide:",
    options: [
      "augments insulin secretion",
      "can only be used as monotherapy",
      "promotes weight loss",
      "causes hyperglycaemia",
      "inhibits intestinal alpha-glucosidases",
    ],
    correct: "augments insulin secretion",
    explanation: "Gliclazide is a sulfonylurea that lowers glucose by stimulating insulin secretion.",
  },

  {
    id: 126,
    type: "combo",
    category: "Endocrinology",
    caseId: "t2_case4",
    question: "Q126. The patient should be advised:",
    statements: [
      "1. to take small, frequent meals",
      "2. to avoid a high-calorie diet",
      "3. to consume food with a high fat content",
    ],
    correct: "B",
    explanation: "QR should be advised on healthy lifestyle measures to counteract complications associated with diabetes and cardiovascular disease.",
  },

  {
    id: 127,
    type: "combo",
    category: "Clinical Pharmacy",
    caseId: "t2_case4",
    question: "Q127. QR is receiving medication to achieve:",
    statements: [
      "1. analgesia",
      "2. an antiplatelet effect",
      "3. coronary vasodilation",
    ],
    correct: "A",
    explanation: "QR is receiving analgesics (paracetamol), an antiplatelet agent (dipyridamole), and a nitrate (isosorbide dinitrate), which promote coronary vasodilation.",
  },

  {
    id: 128,
    type: "combo",
    category: "Gastroenterology",
    caseId: "t2_case5",
    caseBlock: "MR is an 82-year-old female hospitalised in the ophthalmic ward. Current medication: framycetin eye drops both eyes tds, dorzolamide eye drops left eye bd, acetazolamide 125 mg bd, timolol 0.5% eye drops left eye bd, ranitidine 150 mg nocte, bisacodyl 5 mg daily.",
    question: "Q128. Use of bisacodyl in MR requires assessment because it can:",
    statements: [
      "1. precipitate atonic colon",
      "2. precipitate hypokalaemia",
      "3. cause intestinal obstruction",
    ],
    correct: "B",
    explanation: "Bisacodyl is a diphenylmethane stimulant laxative and it acts mainly on the large intestine. Prolonged use of bisacodyl should be avoided as it may precipitate diarrhoea, hypokalaemia and atonic non-functioning colon.",
  },

  {
    id: 129,
    type: "single",
    category: "Gastroenterology",
    caseId: "t2_case5",
    question: "Q129. In MR bisacodyl could be replaced with:",
    options: [
      "senna",
      "docusate sodium",
      "liquid paraffin",
      "magnesium hydroxide",
      "lactulose",
    ],
    correct: "lactulose",
    explanation: "Lactulose can be used as a gentler long-term alternative to stimulant laxatives in older patients.",
  },

  {
    id: 130,
    type: "combo",
    category: "Ophthalmology",
    caseId: "t2_case5",
    question: "Q130. Framycetin drug therapy:",
    statements: [
      "1. is used to treat eye infection",
      "2. may be used for prophylaxis following eye surgery",
      "3. is used short-term",
    ],
    correct: "A",
    explanation: "Framycetin is an aminoglycoside antibacterial agent which has a bactericidal action against Gram-negative aerobic bacteria excluding Pseudomonas species and against some strains of staphylococci.",
  },

  {
    id: 131,
    type: "combo",
    category: "Ophthalmology",
    caseId: "t2_case5",
    question: "Q131. Condition(s) being treated in the left eye only:",
    statements: [
      "1. cataract",
      "2. infection",
      "3. glaucoma",
    ],
    correct: "E",
    explanation: "MR is receiving treatment for glaucoma, which is a raised intraocular pressure caused by obstruction of the outﬂow of aqueous humour.",
  },

  {
    id: 132,
    type: "single",
    category: "Infectious Diseases",
    caseId: "t2_case6",
    caseBlock: "CB is a 59-year-old male admitted with severe chest infection. Current medication: lactulose 30 ml daily, warfarin 4 mg daily adjusted by INR, paracetamol 500 mg prn. CB is allergic to penicillin and has tinnitus and hearing loss.",
    question: "Q132. Which of the following antibacterial preparations is the most appropriate?",
    options: [
      "co-amoxiclav",
      "cefuroxime",
      "gentamicin",
      "ciprofloxacin",
      "sodium fusidate",
    ],
    correct: "ciprofloxacin",
    explanation: "Ciprofloxacin is the most suitable listed antibacterial option in this penicillin-allergic patient with hearing issues.",
  },

  {
    id: 133,
    type: "combo",
    category: "Gastroenterology",
    caseId: "t2_case6",
    question: "Q133. Lactulose:",
    statements: [
      "1. treatment in CB should be withdrawn",
      "2. is used for chronic constipation",
      "3. may cause flatulence",
    ],
    correct: "C",
    explanation: "Lactulose is a semi-synthetic disaccharide that produces osmotic diarrhoea. It can be used for the management of chronic constipation.",
  },

  {
    id: 134,
    type: "single",
    category: "Palliative Care",
    caseId: "t2_case7",
    caseBlock: "JM is a 40-year-old female in terminal stages of carcinoma. Current medication: paroxetine 20 mg daily, tamoxifen 20 mg daily, co-codamol 2 tablets tds, diazepam 2 mg nocte. She is still complaining of pain.",
    question: "Q134. Which of the following is an alternative treatment to co-codamol?",
    options: [
      "domperidone",
      "paracetamol",
      "morphine",
      "aspirin",
      "ibuprofen",
    ],
    correct: "morphine",
    explanation: "Morphine is an appropriate step-up analgesic in severe pain during palliative care.",
  },

  {
    id: 135,
    type: "combo",
    category: "Palliative Care",
    caseId: "t2_case7",
    question: "Q135. What side-effects could be expected from analgesics used for palliative care?",
    statements: [
      "1. nausea",
      "2. vomiting",
      "3. constipation",
    ],
    correct: "A",
    explanation: "Opioid drugs used in palliative care include tramadol and morphine. Opioids may cause nausea and vomiting especially during the initial doses, constipation and drowsiness.",
  },

  {
    id: 136,
    type: "combo",
    category: "Oncology",
    caseId: "t2_case7",
    question: "Q136. Tamoxifen:",
    statements: [
      "1. is used in breast cancer",
      "2. is associated with the occurrence of hot flushes",
      "3. is administered every 2 weeks",
    ],
    correct: "B",
    explanation: "Tamoxifen is an oestrogen-receptor antagonist available as an oral formulation that is administered daily.",
  },

  {
    id: 137,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case7",
    question: "Q137. Paroxetine:",
    statements: [
      "1. is used in JM to alleviate depression and anxiety",
      "2. dose is given in the morning",
      "3. is administered with or after food",
    ],
    correct: "A",
    explanation: "Paroxetine is a selective serotonin re-uptake inhibitor (SSRI) that is used in JM to alleviate depression and anxiety associated with terminal carcinoma.",
  },

  {
    id: 138,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case7",
    question: "Q138. In JM the disadvantages of diazepam are:",
    statements: [
      "1. withdrawal symptoms",
      "2. dependence",
      "3. confusion",
    ],
    correct: "E",
    explanation: "Diazepam is a benzodiazepine that is associated with tolerance and dependence. The occurrence of dependence results in withdrawal symptoms, should the drug be discontinued abruptly.",
  },

  {
    id: 139,
    type: "combo",
    category: "Endocrinology",
    caseId: "t2_case8",
    caseBlock: "LX is an 82-year-old female admitted with infection in the right toe. On admission: dipyridamole 100 mg tds, aspirin 75 mg daily, glibenclamide 5 mg bd. Fasting blood glucose was 12 mmol/l. She was started on cefuroxime 750 mg IV 8-hourly, metronidazole 500 mg IV 8-hourly, and insulin according to blood glucose levels. Glibenclamide was stopped.",
    question: "Q139. Reasons for the change in antidiabetic therapy:",
    statements: [
      "1. diabetes is not controlled",
      "2. to remove oral drug administration",
      "3. LX has stopped intake of food",
    ],
    correct: "D",
    explanation: "Currently, blood glucose level is not controlled in LX. At the moment LX has an infection that is causing metabolic stress and precipitating an acute disturbance in blood glucose control.",
  },

  {
    id: 140,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t2_case8",
    question: "Q140. Metronidazole was included in the therapeutic regimen:",
    statements: [
      "1. to cover against anaerobic bacteria",
      "2. to potentiate cefuroxime",
      "3. for a topical effect",
    ],
    correct: "D",
    explanation: "Metronidazole is an anti-infective that is active against anaerobic bacteria and protozoa. It is included in the therapeutic regimen, together with cefuroxime, to expand the spectrum of activity of the anti-infectives used.",
  },

  {
    id: 141,
    type: "combo",
    category: "Palliative Care",
    caseId: "t2_case9",
    caseBlock: "FS has been prescribed morphine sulphate 50 mg in the morning and 100 mg at night. Preferred route is oral tablets; available strengths are 10 mg, 30 mg, and 60 mg.",
    question: "Q141. How many morphine sulphate tablets need to be dispensed for a morning dose?",
    statements: [
      "1. one 30 mg tablet",
      "2. two 10 mg tablets",
      "3. three 10 mg tablets",
    ],
    correct: "B",
    explanation: "For the morning dose, FS should be given 50 mg, which can be administered as one 30 mg tablet and two 10 mg tablets.",
  },

  {
    id: 142,
    type: "combo",
    category: "Palliative Care",
    caseId: "t2_case9",
    question: "Q142. How many morphine sulphate tablets need to be dispensed for the evening dose?",
    statements: [
      "1. one 60 mg tablet",
      "2. one 10 mg tablet",
      "3. one 30 mg tablet",
    ],
    correct: "A",
    explanation: "For the evening dose, FS should be given 100 mg, which can be administered as one 60 mg tablet, one 10 mg tablet and one 30 mg tablet.",
  },

  {
    id: 143,
    type: "single",
    category: "Gastroenterology",
    caseId: "t2_case10",
    caseBlock: "CP is a 28-year-old male with weakness, dizziness, and sweating. Gastroscopy revealed a duodenal ulcer. Helicobacter pylori urea breath test was negative. Lab tests confirmed anaemia. Admission medication: gliclazide 40 mg daily, esomeprazole 20 mg daily, aluminium-magnesium antacid 10 ml qid.",
    question: "Q143. A likely cause of anaemia in CP is:",
    options: [
      "gastrointestinal haemorrhage",
      "splenomegaly",
      "inadequate diet",
      "autoimmune disease",
      "congenital disease",
    ],
    correct: "gastrointestinal haemorrhage",
    explanation: "In this ulcer context, chronic gastrointestinal blood loss is the most likely cause of anaemia.",
  },

  {
    id: 144,
    type: "combo",
    category: "Gastroenterology",
    caseId: "t2_case10",
    question: "Q144. Actions to be taken for CP include:",
    statements: [
      "1. start ferrous sulphate tablets",
      "2. administer iron sorbitol injection",
      "3. carry out gastric lavage",
    ],
    correct: "D",
    explanation: "A priority in the management of CP is to correct the anaemia by administering iron supplements.",
  },

  {
    id: 145,
    type: "combo",
    category: "Gastroenterology",
    caseId: "t2_case10",
    question: "Q145. On discharge CP should be advised:",
    statements: [
      "1. to avoid NSAIDs",
      "2. to take small frequent meals",
      "3. to reduce intake of fibre",
    ],
    correct: "B",
    explanation: "CP should be advised to avoid non-steroidal anti-inﬂammatory drugs such as aspirin and to inform prescribers and pharmacists of his condition before using other medications.",
  },

  {
    id: 146,
    type: "combo",
    category: "Geriatric Medicine",
    caseId: "t2_case11",
    caseBlock: "MC is an 84-year-old female referred to A&E with gradual deterioration and poor oral intake for several days. PMH: diabetes mellitus, congestive heart failure, ischaemic heart disease, dementia. DH: perindopril 2 mg daily, digoxin 0.0625 mg daily, bumetanide 1 mg daily, metformin 500 mg bd, amitriptyline 20 mg nocte, ranitidine 150 mg daily. O/E includes poor respiratory effort and bilateral inspiratory crackles. Impression: dehydration and early parkinsonian features. Started on IV 0.9% saline alternating with 5% dextrose every 8 hours.",
    question: "Q146. Features that could have caused the onset of dehydration in MC:",
    statements: [
      "1. amitriptyline",
      "2. bumetanide",
      "3. low fluid intake",
    ],
    correct: "C",
    explanation: "Onset of dehydration may be precipitated by decreased ﬂuid intake and by loop diuretics. Risk of dehydration increases with environmental factors that support ﬂuid and electrolyte loss, such as heat exposure caused by hot temperatures and inadequate ventilation at home.",
  },

  {
    id: 147,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t2_case11",
    question: "Q147. The poor health, poor respiratory effort and bilateral inspiratory crackles suggest the need to start:",
    statements: [
      "1. prednisolone iv",
      "2. budesonide by inhalation",
      "3. co-amoxiclav iv",
    ],
    correct: "E",
    explanation: "In elderly patients a normal white blood cell count is not sufﬁcient to eliminate the presence of an infection and MC has clinical signs that may indicate an infection.",
  },

  {
    id: 148,
    type: "combo",
    category: "Clinical Pharmacology",
    caseId: "t2_case11",
    question: "Q148. What measures need to be undertaken during parenteral rehydration?",
    statements: [
      "1. monitor blood sodium levels",
      "2. monitor blood glucose 6 hourly",
      "3. stop bumetanide",
    ],
    correct: "A",
    explanation: "When MC is started on parenteral rehydration with intravenous 0. 9% sodium chloride 1 litre alternating with 5% dextrose 1 litre every 8 h, blood sodium levels and blood glucose should be monitored.",
  },

  {
    id: 149,
    type: "combo",
    category: "Endocrinology",
    caseId: "t2_case11",
    question: "Q149. With regards to the use of metformin, MC should be advised:",
    statements: [
      "1. to take tablets with meals",
      "2. to avoid alcoholic drink",
      "3. that soft stools occur usually as a long-term side-effect",
    ],
    correct: "B",
    explanation: "Metformin is an antidiabetic drug that has the advantages that it does not increase appetite and that occurrence of hypoglycaemia is very low.",
  },

  {
    id: 150,
    type: "combo",
    category: "Psychiatry",
    caseId: "t2_case11",
    question: "Q150. Amitriptyline:",
    statements: [
      "1. is more sedative than imipramine",
      "2. a reduced dose is recommended for older persons",
      "3. its use in MC should be revised because of her medical history",
    ],
    correct: "A",
    explanation: "Amitriptyline and imipramine are tricyclic antidepressants that have a tertiary amine structure.",
  },

  {
    id: 151,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case11",
    question: "Q151. Early parkinsonian features include:",
    statements: [
      "1. bradykinesia",
      "2. incontinence",
      "3. postural instability",
    ],
    correct: "D",
    explanation: "MC has presented with early parkinsonian features. Bradykinesia which is general slowness of movement, is the main symptom for parkinsonism, which, during the initial phases of the disease, may occur as the only symptom or in combination with tremor at rest that disappears with activity and muscular rigidity.",
  },

  {
    id: 152,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case11",
    question: "Q152. In MC:",
    statements: [
      "1. parkinsonian symptoms may be precipitated by amitriptyline",
      "2. physiotherapy may provide patient support to counteract onset of parkinsonian symptoms",
      "3. signs of dementia exclude occurrence of Parkinson’s disease",
    ],
    correct: "B",
    explanation: "Amitriptyline, being a tricyclic antidepressant, may cause movement disorders and dyskinesias. Parkinsonian symptoms in MC may be precipitated by the administration of amitriptyline.",
  },

  {
    id: 153,
    type: "combo",
    category: "Dermatology",
    caseId: "t2_case12",
    caseBlock: "BC is a 9-year-old female on holiday at a seaside resort. She presents with itchy red scaly areas on both elbows with a golden-yellow crust. She has atopic eczema.",
    question: "Q153. Possibilities of diagnosis include:",
    statements: [
      "1. exacerbation of atopic eczema",
      "2. impetigo",
      "3. ringworm infection",
    ],
    correct: "B",
    explanation: "BC may have an exacerbation of atopic eczema or impetigo, which is a common occurrence in patients with atopic eczema, as the area becomes infected because of the scratching that is associated with intense itching.",
  },

  {
    id: 154,
    type: "combo",
    category: "Dermatology",
    caseId: "t2_case12",
    question: "Q154. Drugs that could be recommended for use in BC include:",
    statements: [
      "1. hydrocortisone 1% cream",
      "2. mepyramine cream",
      "3. miconazole cream",
    ],
    correct: "D",
    explanation: "In the management of an acute attack of atopic eczema, topical corticosteroids should be recommended.",
  },

  {
    id: 155,
    type: "combo",
    category: "Dermatology",
    caseId: "t2_case12",
    question: "Q155. The parents of BC should be reminded to:",
    statements: [
      "1. avoid use of soaps and bubble baths",
      "2. use hypoallergenic sun protection cream",
      "3. ensure good hydration",
    ],
    correct: "A",
    explanation: "Parents of BC should be educated on the importance of preventing dehydration of the skin by ensuring good hydration and by using emollients.",
  },

  {
    id: 156,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    caseBlock: "GM is a 28-year-old female with tension headache seeking medication stronger than paracetamol.",
    question: "Q156. Tension headache:",
    statements: [
      "1. tends to have a chronic pattern",
      "2. is due to arterial vasoconstriction",
      "3. occurs only in young adults",
    ],
    correct: "D",
    explanation: "Tension headaches tend to occur repeatedly in patients who are prone to develop this syndrome. Females experience this condition to a greater extent than males.",
  },

  {
    id: 157,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    question: "Q157. Characteristic complaints of patients with tension headache are:",
    statements: [
      "1. feeling of a bilateral ‘hatband’",
      "2. pain is non-throbbing",
      "3. sound intolerance",
    ],
    correct: "A",
    explanation: "Patients with tension headache complain of mild, dull ache that is steady and usually bilateral and non-throbbing.",
  },

  {
    id: 158,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    question: "Q158. GM could be advised to:",
    statements: [
      "1. adopt a less stressful life",
      "2. avoid consumption of cheese",
      "3. change employment",
    ],
    correct: "D",
    explanation: "GM should be advised to identify factors that are precipitating her attacks. These could include prolonged posture posing strain on head and neck muscles and activities that induce stress.",
  },

  {
    id: 159,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    question: "Q159. Analgesics that could be recommended to GM include:",
    statements: [
      "1. co-codamol",
      "2. ibuprofen",
      "3. amitriptyline",
    ],
    correct: "B",
    explanation: "Drugs that can be used to manage an acute attack include paracetamol, nonsteroidal analgesics (NSAIDs) such as ibuprofen and combination products such as co-codamol, which contains paracetamol and codeine.",
  },

  {
    id: 160,
    type: "combo",
    category: "Neurology",
    caseId: "t2_case13",
    question: "Q160. The use of aspirin would not be recommended if GM:",
    statements: [
      "1. has hypertension",
      "2. has a history of gastric ulceration",
      "3. is breast-feeding",
    ],
    correct: "C",
    explanation: "Aspirin should not be recommended to GM if she has a history of gastric irritation or if she is breast-feeding.",
  },
  {
    id: 161,
    type: "match",
    category: "Endocrinology",
    question: "Q161. is associated with abnormal copper metabolism",
    options: [
      "phaeochromocytoma",
      "Cushing's disease",
      "cirrhosis",
      "Wilson's disease",
      "dysentry",
    ],
    correct: "Wilson's disease",
    explanation: "Wilson's disease is associated with abnormal copper metabolism.",
  },

  {
    id: 162,
    type: "match",
    category: "Endocrinology",
    question: "Q162. is associated with accumulation of fat on the face, chest and upper back",
    options: [
      "phaeochromocytoma",
      "Cushing's disease",
      "cirrhosis",
      "Wilson's disease",
      "dysentry",
    ],
    correct: "Cushing's disease",
    explanation: "Cushing's disease is associated with fat redistribution affecting the face, chest, and upper back.",
  },

  {
    id: 163,
    type: "match",
    category: "Endocrinology",
    question: "Q163. is associated with hypersecretion of adrenaline and noradrenaline",
    options: [
      "phaeochromocytoma",
      "Cushing's disease",
      "cirrhosis",
      "Wilson's disease",
      "dysentry",
    ],
    correct: "phaeochromocytoma",
    explanation: "Phaeochromocytoma is associated with hypersecretion of adrenaline and noradrenaline.",
  },

  {
    id: 164,
    type: "match",
    category: "Electrolytes",
    question: "Q164. may occur as a result of hyperparathyroidism",
    options: [
      "hypernatraemia",
      "hyponatraemia",
      "hypercalcaemia",
      "hypocalcaemia",
      "hypokalaemia",
    ],
    correct: "hypercalcaemia",
    explanation: "Hyperparathyroidism can lead to hypercalcaemia.",
  },

  {
    id: 165,
    type: "match",
    category: "Electrolytes",
    question: "Q165. may present with arrhythmias",
    options: [
      "hypernatraemia",
      "hyponatraemia",
      "hypercalcaemia",
      "hypocalcaemia",
      "hypokalaemia",
    ],
    correct: "hypokalaemia",
    explanation: "Hypokalaemia may present with cardiac arrhythmias.",
  },

  {
    id: 166,
    type: "match",
    category: "Electrolytes",
    question: "Q166. predisposes to digoxin toxicity",
    options: [
      "hypernatraemia",
      "hyponatraemia",
      "hypercalcaemia",
      "hypocalcaemia",
      "hypokalaemia",
    ],
    correct: "hypokalaemia",
    explanation: "Hypokalaemia predisposes patients to digoxin toxicity.",
  },

  {
    id: 167,
    type: "combo",
    category: "Palliative Care",
    question: "Q167. Transdermal fentanyl:",
    statements: [
      "1. is used for pain relief",
      "2. contains a pure agonist for μ-opioid receptors",
      "3. provides long-lasting analgesic effect",
    ],
    correct: "A",
    explanation: "Fentanyl is a phenylpiperidine derivative and it is a potent opioid analgesic, which is a pure agonist of μ-opioid receptors.",
  },

  {
    id: 168,
    type: "combo",
    category: "Haematology",
    question: "Q168. Unexpected fluctuations in dose response in patients receiving warfarin may be attributed to:",
    statements: [
      "1. changes in vitamin K intake",
      "2. major changes in intake of salads and vegetables",
      "3. major changes in alcohol consumption",
    ],
    correct: "A",
    explanation: "Warfarin is an anticoagulant that acts by reducing the vitamin-K-dependent synthesis of coagulation factors in the liver.",
  },

  {
    id: 169,
    type: "combo",
    category: "Psychiatry",
    question: "Q169. Clozapine has an affinity for:",
    statements: [
      "1. dopamine receptors",
      "2. serotonin receptors",
      "3. muscarinic receptors",
    ],
    correct: "A",
    explanation: "Clozapine is a dibenzodiazepine which is used as an atypical antipsychotic. It has activity as a dopamine-receptor blocker, an antiserotonergic, an antimuscarinic, an alpha-adrenergic blocker, and an antihistamine.",
  },

  {
    id: 170,
    type: "combo",
    category: "Immunology",
    question: "Q170. Ciclosporin:",
    statements: [
      "1. has an inhibitory effect on T-lymphocytes",
      "2. may cause a dose-dependent increase in serum creatinine during the first few weeks of treatment",
      "3. causes hyperlipidaemia",
    ],
    correct: "B",
    explanation: "Ciclosporin is a calcineurin inhibitor that is used as an immunosuppressant in organ and tissue transplantation.",
  },

  {
    id: 171,
    type: "combo",
    category: "Cardiology",
    question: "Q171. When candesartan is started in the older person, recommended monitoring includes:",
    statements: [
      "1. plasma potassium",
      "2. bilirubin",
      "3. blood glucose",
    ],
    correct: "D",
    explanation: "Candesartan is an angiotensin-II receptor antagonist. When candesartan is started in older persons, monitoring of plasma potassium concentration is recommended as hyperkalaemia may occur occasionally.",
  },

  {
    id: 172,
    type: "combo",
    category: "Oncology",
    question: "Q172. Prostate cancer:",
    statements: [
      "1. testosterone replacement therapy is the mainstay of treatment",
      "2. growth is androgen-dependent",
      "3. may be diagnosed by prostate-specific antigen screening",
    ],
    correct: "C",
    explanation: "Prostate cancer is a slowly progressive adenocarcinoma of the prostate gland. It is detected by prostate-speciﬁc antigen test and digital rectal examination.",
  },

  {
    id: 173,
    type: "combo",
    category: "Oncology",
    question: "Q173. Ondansetron:",
    statements: [
      "1. may be administered with dexamethasone",
      "2. is the drug of first choice in managing delayed chemotherapy-induced nausea and vomiting",
      "3. is used prophylactically for motion sickness",
    ],
    correct: "D",
    explanation: "Ondansetron is a 5-HT 3 antagonist which acts as an anti-emetic by blocking serotonergic receptors in the gastrointestinal tract and in the central nervous system.",
  },

  {
    id: 174,
    type: "combo",
    category: "Oncology",
    question: "Q174. Dose reduction and delays in administration of planned cytotoxic chemotherapy are caused by:",
    statements: [
      "1. alopecia",
      "2. extravasation",
      "3. leucopenia",
    ],
    correct: "E",
    explanation: "Cytotoxic drugs cause damage to normal cells, particularly where normal cell division is fairly rapid, including hair follicles, resulting in alopecia and bonemarrow suppression.",
  },

  {
    id: 175,
    type: "combo",
    category: "Respiratory",
    question: "Q175. Spirometry measures:",
    statements: [
      "1. forced expiratory volume",
      "2. forced vital capacity",
      "3. total lung capacity",
    ],
    correct: "B",
    explanation: "In spirometry, the patient is asked to inhale and then to exhale as rapidly as possible into a spirometer, which records the volume of air exiting the lungs.",
  },

  {
    id: 176,
    type: "combo",
    category: "Infectious Diseases",
    question: "Q176. Methicillin-resistant Staphylococcus aureus:",
    statements: [
      "1. is a cause of nosocomial infections",
      "2. spreading of infection may be reduced by alcohol hand rubs",
      "3. presents an economic issue to institutions",
    ],
    correct: "A",
    explanation: "Methicillin-resistant Staphylococcus aureus (MRSA) strains are resistant to a number of antibacterial drugs.",
  },

  {
    id: 177,
    type: "combo",
    category: "Laboratory Medicine",
    question: "Q177. Alanine aminotransferase:",
    statements: [
      "1. is found predominantly in the liver",
      "2. levels are significantly decreased in viral hepatitis",
      "3. is never released into the bloodstream",
    ],
    correct: "D",
    explanation: "Alanine aminotransferase (ALT) is an enzyme that is found mainly in the liver with lower amounts also present in the kidneys, heart and skeletal muscle.",
  },

  {
    id: 178,
    type: "combo",
    category: "Endocrinology",
    question: "Q178. Aldosterone:",
    statements: [
      "1. production is regulated primarily by the liver",
      "2. levels are decreased by low-sodium diets",
      "3. is produced by the adrenal cortex",
    ],
    correct: "E",
    explanation: "Aldosterone is a mineralcorticoid hormone which is produced by the adrenal cortex with action in the renal tubule resulting in sodium and water retention and potassium secretion in urine.",
  },

  {
    id: 179,
    type: "combo",
    category: "Nephrology",
    question: "Q179. Proteinuria:",
    statements: [
      "1. is an indicator of renal disease",
      "2. may be an indicator of pre-eclampsia",
      "3. 24-h urine specimen collection could be recommended if proteinuria is significant",
    ],
    correct: "A",
    explanation: "Occurrence of protein in urine (proteinuria) is an indicator of renal disease, as normally protein is not present in urine because it cannot pass through the glomerular membrane in the renal tubules.",
  },

  {
    id: 180,
    type: "combo",
    category: "Endocrinology",
    question: "Q180. Patients with type I diabetes should be advised:",
    statements: [
      "1. to self-monitor blood glucose",
      "2. to have access to a source of fast sugars",
      "3. to avoid participating in sport",
    ],
    correct: "B",
    explanation: "Type I diabetes usually occurs in young people and is characterised by an inability of the beta-cells in the pancreas to produce insulin.",
  },

  {
    id: 181,
    type: "combo",
    category: "Haematology",
    question: "Q181. When aspirin is compared with warfarin, it:",
    statements: [
      "1. decreases platelet aggregation",
      "2. has higher rates of major haemorrhage",
      "3. requires the same degree of monitoring",
    ],
    correct: "D",
    explanation: "Aspirin is an antiplatelet drug that decreases platelet aggregation, whereas warfarin is an oral anticoagulant that antagonises the effects of vitamin K.",
  },

  {
    id: 182,
    type: "combo",
    category: "Gastroenterology",
    question: "Q182. Patients with gallstone disease:",
    statements: [
      "1. present with visceral pain in the abdomen",
      "2. report precipitation of the condition with fatty meals",
      "3. are referred for a gastroscopy",
    ],
    correct: "B",
    explanation: "Gallstones consist of cholesterol or bile and are usually asymptomatic. During an acute attack patients usually present with biliary colic that is represented with severe, episodic visceral pain in the abdomen.",
  },

  {
    id: 183,
    type: "combo",
    category: "Respiratory",
    question: "Q183. Sleep apnoea:",
    statements: [
      "1. is associated with cessation of breathing for at least 5 minutes during sleep",
      "2. occurs more commonly in obese patients",
      "3. presents with snoring",
    ],
    correct: "C",
    explanation: "Sleep apnoea is characterised during sleep by periods of cessation of breathing ranging from 10 seconds to 3 minutes.",
  },

  {
    id: 184,
    type: "combo",
    category: "Clinical Pharmacology",
    question: "Q184. Potential beneficial effects of cannabis include:",
    statements: [
      "1. anti-emetic",
      "2. analgesia",
      "3. appetite suppressant",
    ],
    correct: "B",
    explanation: "Cannabis is in many countries an illegal drug and may not have approval for medicinal use. It has analgesic, muscle relaxant and appetite stimulant effects.",
  },

  {
    id: 185,
    type: "combo",
    category: "Cardiology",
    question: "Q185. Drugs that may cause hypertension include:",
    statements: [
      "1. corticosteroids",
      "2. phenothiazines",
      "3. alpha-adrenoceptor blockers",
    ],
    correct: "D",
    explanation: "Corticosteroids have mineralcorticoid effects that result in sodium and water retention, which leads to hypertension.",
  },

  {
    id: 186,
    type: "combo",
    category: "Haematology",
    question: "Q186. Patients receiving oral iron tablets should be advised:",
    statements: [
      "1. to take the preparation with food",
      "2. that stools may be black-coloured",
      "3. to rinse their mouth after drug administration",
    ],
    correct: "B",
    explanation: "Iron tablets may cause gastrointestinal irritation and patient may complain of nausea and epigastric pain.",
  },

  {
    id: 187,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    caseBlock: "SN is a 25-year-old female admitted with exacerbation of asthma. PMH: asthma. DH: salbutamol inhaler and beclometasone inhaler. On admission she had chest tightness, exhaustion, pulse >110 bpm, and respiratory rate >25 breaths/min. Initial hospital therapy included oxygen 60%, salbutamol nebuliser, IV hydrocortisone, IV cefuroxime, clarithromycin tablets, and beclometasone inhaler. After 24 hours, hydrocortisone was stopped, prednisolone tablets started, and salbutamol nebuliser frequency reduced.",
    question: "Q187. In an asthmatic attack the following condition(s) occur(s)",
    statements: [
      "1. bronchospasm",
      "2. increased airways resistance",
      "3. inflammation",
    ],
    correct: "A",
    explanation: "An asthmatic attack may be precipitated by various factors such as allergens (e. g.",
  },

  {
    id: 188,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q188. Inflammatory mediators that are released in an asthmatic attack include:",
    statements: [
      "1. histamine",
      "2. leukotrienes",
      "3. prostaglandins",
    ],
    correct: "A",
    explanation: "In an acute attack there is an increase of eosinophils in the bronchial epithelium releasing proteins and neurotoxins which damage the epithelium.",
  },

  {
    id: 189,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q189. Drugs that may provoke an asthmatic attack in SN include:",
    statements: [
      "1. diclofenac",
      "2. atenolol",
      "3. timolol",
    ],
    correct: "A",
    explanation: "Drugs that induce bronchospasm may provoke an asthmatic attack in patients with asthma. SN should be advised to avoid using non-steroidal anti-inﬂammatory drugs (NSAIDs) such as diclofenac as they may provoke an asthma attack.",
  },

  {
    id: 190,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q190. Signs and symptoms in SN of an acute severe asthma attack include:",
    statements: [
      "1. tachycardia",
      "2. tachypnoea",
      "3. exhaustion",
    ],
    correct: "A",
    explanation: "On examination SN had rapid heart rate (tachycardia). During an acute attack patients suffer from dyspnoea and with increasing severity of the attack they become anxious, which also increases their heart rate.",
  },

  {
    id: 191,
    type: "single",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q191. Salbutamol nebuliser is used in combination with oxygen because:",
    options: [
      "it may mask symptom severity",
      "aggressive treatment is required",
      "the dose is lower than administered by inhaler",
      "it may cause hypovolaemia",
      "it may cause arterial hypoxaemia",
    ],
    correct: "it may cause arterial hypoxaemia",
    explanation: "Nebulised salbutamol can worsen arterial oxygenation, so oxygen is co-administered in severe attacks.",
  },

  {
    id: 192,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q192. Parameters that require monitoring in SN include:",
    statements: [
      "1. urinary flow",
      "2. blood gases",
      "3. plasma-potassium concentration",
    ],
    correct: "C",
    explanation: "As soon as SN is hospitalised, peak expiratory ﬂow rate, blood gases and serum electrolytes should be measured.",
  },

  {
    id: 193,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q193. If SN’s condition does not improve after 30 minutes, the following may be added to the drug therapy:",
    statements: [
      "1. nebulised ipratropium",
      "2. intravenous aminophylline",
      "3. nebulised amoxicillin",
    ],
    correct: "B",
    explanation: "SN has been administered hydrocortisone by intravenous injection which, together with the oxygen and the nebulised salbutamol, is aimed to improve respiration and pulse within 30 minutes.",
  },

  {
    id: 194,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q194. Cefuroxime is:",
    statements: [
      "1. also available for oral administration",
      "2. active against Haemophilus influenzae",
      "3. highly effective against Gram-negative bacteria",
    ],
    correct: "B",
    explanation: "Cefuroxime is a second-generation cephalosporin that is active against Grampositive cocci and against beta-lactamase-producing strains of Haemophilus inﬂuenzae and Neisseria gonorrhoeae.",
  },

  {
    id: 195,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q195. Clarithromycin:",
    statements: [
      "1. is a macrolide",
      "2. achieves lower tissue concentrations than erythromycin",
      "3. has poor activity against Haemophilus influenzae",
    ],
    correct: "D",
    explanation: "Clarithromycin is a macrolide that is derived from erythromycin. Compared with erythromycin, clarithromycin is better absorbed from the gastrointestinal tract, it achieves higher tissue concentrations and has enhanced activity against Haemophilus inﬂuenzae.",
  },

  {
    id: 196,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q196. Intravenous hydrocortisone is indicated in SN:",
    statements: [
      "1. to avoid anaphylactic shock",
      "2. for its mineralcorticoid effects",
      "3. to inhibit the production and release of pro-inflammatory agents",
    ],
    correct: "E",
    explanation: "Hydrocortisone is a glucocorticoid drug. It stimulates the synthesis of lipocortin, which inhibits the production and release of intrinsic agents that are associated with inflammation such as phospholipase A2, prostaglandins and leukotrienes.",
  },

  {
    id: 197,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q197. Prednisolone:",
    statements: [
      "1. should replace beclometasone inhaler",
      "2. suppresses cortisol secretion",
      "3. has predominantly glucocorticoid activity",
    ],
    correct: "C",
    explanation: "Prednisolone is an oral glucocortioid that is given instead of intravenous hydrocortisone. It has predominantly glucocorticoid activity.",
  },

  {
    id: 198,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q198. When administering prednisolone:",
    statements: [
      "1. it should be taken after food",
      "2. enteric-coated formulation is preferred",
      "3. dose should be divided into twice daily administration",
    ],
    correct: "B",
    explanation: "Oral prednisolone may cause dyspepsia and oesophageal and peptic ulceration. Occurrence of these side-effects is reduced by administering the drug after food and by using an enteric-coated formulation.",
  },

  {
    id: 199,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q199. Nebulisers:",
    statements: [
      "1. are devices producing an aerosol from an aqueous solution",
      "2. should be washed out to avoid microbial growth",
      "3. salbutamol injection solution is used to administer salbutamol by nebulisation",
    ],
    correct: "B",
    explanation: "Nebulisers are medical devices that are used to convert a solution to an aerosol. They can deliver higher doses compared with a metered-dose inhaler.",
  },

  {
    id: 200,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q200. Beclometasone inhaler:",
    statements: [
      "1. is more effective than budesonide",
      "2. may be used to control an attack",
      "3. may cause oral candidiasis",
    ],
    correct: "E",
    explanation: "Beclometasone is a corticosteroid that is being administered to SN as a metered-dose inhaler. Beclometasone and budesonide are equally effective in the management of asthma and they are used as prophylactic therapy to reduce airway inﬂammation.",
  },

  {
    id: 201,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q201. Long-term inhalation of high doses of beclometasone may predispose patients to:",
    statements: [
      "1. osteoporosis",
      "2. hoarseness",
      "3. hypertension",
    ],
    correct: "B",
    explanation: "With long-term inhalation of high doses of beclometasone (greater than 800 μg daily), patients are predisposed to the occurrence of adrenal suppression, osteoporosis, hoarseness and glaucoma.",
  },

  {
    id: 202,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q202. Salmeterol:",
    statements: [
      "1. is longer-acting than salbutamol",
      "2. may be used in combination with beclomethasone",
      "3. could replace salbutamol use",
    ],
    correct: "B",
    explanation: "Salmeterol is a long-acting beta 2 agonist with a duration of action of about 12 h. Onset of action occurs within 10 to 20 minutes of administration by inhalation but the maximum effect is not achieved until regular administration of successive doses.",
  },

  {
    id: 203,
    type: "combo",
    category: "Respiratory",
    caseId: "t3_case1",
    question: "Q203. SN could be counselled on signs indicating exacerbation of the condition. She could be advised to report:",
    statements: [
      "1. decrease in exercise tolerance",
      "2. increased requirements for salbutamol inhaler",
      "3. increasing peak expiratory flow",
    ],
    correct: "B",
    explanation: "SN should be advised to monitor for signs that indicate an exacerbation of her condition. She should be advised to report any decrease in exercise tolerance, increased requirements for salbutamol inhaler, and any decrease in peak expiratory ﬂow rate immediately so that her medication may be adjusted so as to avoid the development of an acute, severe attack.",
  },

  {
    id: 204,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    caseBlock: "GL is a 63-year-old obese male with diabetes, hypertension, ischaemic heart disease, and previous myocardial infarction. He presented with acute chest pain radiating to throat and left arm, sweating, breathlessness, and pulse 140 bpm. He was diagnosed with unstable angina and treated with subcutaneous heparin and isosorbide dinitrate infusion. On discharge, simvastatin 20 mg nocte and a glyceryl trinitrate patch were added.",
    question: "Q204. Which signs and symptoms in GL suggest an angina attack?",
    statements: [
      "1. tachycardia",
      "2. sweating",
      "3. breathlessness",
    ],
    correct: "A",
    explanation: "Ischaemic heart disease may present with symptoms of angina or develop a myocardial infarction.",
  },

  {
    id: 205,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q205. During an angina attack investigations that are indicated include:",
    statements: [
      "1. ECG",
      "2. blood pressure",
      "3. coronary angiography",
    ],
    correct: "B",
    explanation: "Diagnosis is based on past medical history and on the presenting symptoms. An electrocardiogram during an attack will conﬁrm diagnosis by indicating an ST-segment depression.",
  },

  {
    id: 206,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q206. In GL the goals of treatment include:",
    statements: [
      "1. to reduce symptoms",
      "2. to improve exercise capacity",
      "3. to reduce the risk of a heart attack",
    ],
    correct: "A",
    explanation: "In GL the goals of treatment are to reduce the symptoms of chest pain, breathlessness and tachycardia.",
  },

  {
    id: 207,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q207. On admission, therapeutic management of GL should aim to:",
    statements: [
      "1. reduce cardiac oxygen demand",
      "2. provide antithrombotic therapy",
      "3. provide antiplatelet therapy",
    ],
    correct: "A",
    explanation: "During the management of an acute attack of angina, pharmacotherapy is used to reduce oxygen demand and to improve oxygen supply.",
  },

  {
    id: 208,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q208. Isosorbide dinitrate:",
    statements: [
      "1. is a coronary vasoconstrictor",
      "2. flushing may occur",
      "3. patient may complain of throbbing headache",
    ],
    correct: "C",
    explanation: "Isosorbide dinitrate is a coronary vasodilator and side-effects of peripheral vasodilation may occur.",
  },

  {
    id: 209,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q209. Heparin:",
    statements: [
      "1. has a rapid onset of action",
      "2. has a short duration of action",
      "3. patient should be monitored for signs of haemorrhage",
    ],
    correct: "A",
    explanation: "When heparin is administered by intravenous or subcutaneous injection, it has a rapid onset of action and an average halﬂife of 1.",
  },

  {
    id: 210,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q210. If the patient responds to therapy:",
    statements: [
      "1. isosorbide dinitrate could be switched to oral administration",
      "2. heparin is stopped after 10 days",
      "3. aspirin is stopped",
    ],
    correct: "D",
    explanation: "Isosorbide dinitrate is initially given intravenously to achieve a fast onset of action and response.",
  },

  {
    id: 211,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q211. Enalapril:",
    statements: [
      "1. is an ACE inhibitor",
      "2. is indicated for hypertension in diabetic patients",
      "3. is used for long-term management of myocardial infarction",
    ],
    correct: "A",
    explanation: "Enalapril is an angiotensin-converting enzyme (ACE) inhibitor that has antihypertensive effects.",
  },

  {
    id: 212,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q212. Metformin:",
    statements: [
      "1. does not cause insulin release",
      "2. may provoke lactic acidosis",
      "3. requires monitoring of renal function",
    ],
    correct: "A",
    explanation: "Metformin is a biguanide which, unlike sulphonylureas, is not associated with weight gain. It is therefore an appropriate antidiabetic for GL who is obese.",
  },

  {
    id: 213,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q213. Metformin:",
    statements: [
      "1. does not precipitate hypoglycaemia",
      "2. should be taken with meals",
      "3. is indicated because GL is obese",
    ],
    correct: "A",
    explanation: "Metformin increases the use of glucose and increases insulin sensitivity. It is not associated with onset of hypoglycaemia and it does not cause weight gain.",
  },

  {
    id: 214,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q214. Drugs that are known to cause hyperkalaemia is (are):",
    statements: [
      "1. enalapril",
      "2. heparin",
      "3. furosemide",
    ],
    correct: "B",
    explanation: "ACE inhibitors such as enalapril interfere with the conversion of angiotensin I to angiotensin II.",
  },

  {
    id: 215,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q215. With regards to simvastatin, GL should be advised:",
    statements: [
      "1. to return for monitoring of liver function tests",
      "2. that this medication is only for short-term until LDL levels normalise",
      "3. to avoid use of non-steroidal anti-inflammatory drugs",
    ],
    correct: "D",
    explanation: "Simvastatin is a statin that is used as a lipid-lowering agent. Use of statins is recommended in patients with ischaemic heart disease to decrease morbidity and mortality.",
  },

  {
    id: 216,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q216. With regards to the glyceryl trinitrate patch, GL should be advised:",
    statements: [
      "1. to apply patch on chest wall, upper arm or shoulder",
      "2. to change daily",
      "3. to remove at night",
    ],
    correct: "A",
    explanation: "Glyceryl trinitrate patches should be applied on chest wall, upper arm or shoulder and replaced daily.",
  },

  {
    id: 217,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case2",
    question: "Q217. Additional drug therapy that could be suggested for GL for long-term management include:",
    statements: [
      "1. glyceryl trinitrate spray",
      "2. digoxin",
      "3. vasopressin",
    ],
    correct: "D",
    explanation: "GL may be prescribed glyceryl trinitrate spray which can be used for the prophylaxis of angina when onset of symptoms occur.",
  },

  {
    id: 218,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    caseBlock: "MG is a 64-year-old male admitted with stroke. Admission medicines included slow-release nifedipine 20 mg three times daily and aspirin 75 mg. PMH includes hypertension. Dipyridamole 100 mg three times daily was started.",
    question: "Q218. Dipyridamole should:",
    statements: [
      "1. be administered before food",
      "2. be used with caution in hypotension",
      "3. not to be given with aspirin",
    ],
    correct: "B",
    explanation: "Dipyridamole is an adenosine reuptake inhibitor and a phosphodiesterase inhibitor which has antiplatelet and vasodilating properties.",
  },

  {
    id: 219,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    question: "Q219. Side-effects associated with dipyridamole include:",
    statements: [
      "1. headache",
      "2. abdominal distress",
      "3. hot flushes",
    ],
    correct: "A",
    explanation: "The most common side-effects to be expected from dipyridamole are gastrointestinal effects such as nausea, abdominal pain, constipation, dizziness, throbbing headache, hypotension, hot ﬂushes and tachycardia.",
  },

  {
    id: 220,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    question: "Q220. Nifedipine:",
    statements: [
      "1. commonly precipitates heart failure",
      "2. is a highly negative inotropic agent",
      "3. relaxes coronary and peripheral arteries",
    ],
    correct: "E",
    explanation: "Nifedipine is a dihydropyridine calcium-channel blocker. It has predominant activity as a peripheral and coronary arteries vasodilator.",
  },

  {
    id: 221,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    question: "Q221. Modified-release formulations of nifedipine are preferred to prevent:",
    statements: [
      "1. large variations in blood pressure",
      "2. reflex tachycardia",
      "3. decreased effect in patients with short bowel syndrome",
    ],
    correct: "B",
    explanation: "Nifedipine is rapidly and efﬁciently absorbed from the gastrointestinal tract but undergoes an extensive ﬁrst-pass effect.",
  },

  {
    id: 222,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case3",
    question: "Q222. Parameters that should be monitored in MG include:",
    statements: [
      "1. blood pressure",
      "2. heart rate",
      "3. signs and symptoms of heart failure",
    ],
    correct: "A",
    explanation: "Blood pressure should be monitored in MG. Hypertension should be controlled and development of hypotension avoided.",
  },

  {
    id: 223,
    type: "single",
    category: "Endocrinology",
    caseId: "t3_case4",
    caseBlock: "GX is an 80-year-old female living alone. Current medications: glibenclamide 10 mg in the morning and 15 mg midday, isosorbide mononitrate 60 mg daily, aspirin enteric-coated 75 mg daily, perindopril 8 mg daily, calcium 600 mg daily, and cod liver oil once daily.",
    question: "Q223. For which of the following drugs is there an alternative drug that is more appropriate for GX?",
    options: [
      "glibenclamide",
      "isosorbide mononitrate",
      "aspirin",
      "perindopril",
      "calcium",
    ],
    correct: "glibenclamide",
    explanation: "Glibenclamide may be less suitable in this older patient because of prolonged hypoglycaemia risk compared with shorter-acting alternatives.",
  },

  {
    id: 224,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case4",
    question: "Q224. Perindopril:",
    statements: [
      "1. may lead to deterioration of glucose tolerance",
      "2. dose in GX should be reviewed due to under-dosing",
      "3. treatment warrants routine renal function tests to be undertaken",
    ],
    correct: "E",
    explanation: "An advantage of angiotensin-converting enzyme (ACE) inhibitors such as perindopril is that they do not interfere with glucose tolerance and they can be used as antihypertensive agents or for the management of heart failure in diabetic patients.",
  },

  {
    id: 225,
    type: "combo",
    category: "Cardiology",
    caseId: "t3_case4",
    question: "Q225. Isosorbide mononitrate:",
    statements: [
      "1. has a longer halflife than the dinitrate salt",
      "2. has poor bioavailability after oral administration",
      "3. is used in hypertension",
    ],
    correct: "D",
    explanation: "Isosorbide mononitrate is an active metabolite of isosorbide dinitrate. Advantages over isosorbide dinitrate include a higher bioavailability after oral administration as it does not undergo ﬁrst-pass hepatic metabolism and a longer halﬂife.",
  },

  {
    id: 226,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    caseBlock: "AV is a 64-year-old female with rheumatoid arthritis. Current medications: methotrexate 15 mg weekly, folic acid 10 mg weekly, prednisolone 5 mg daily, vitamin D and calcium tablets twice daily, and disodium pamidronate 90 mg injection every 3 months.",
    question: "Q226. Rheumatoid arthritis:",
    statements: [
      "1. is a localised condition",
      "2. occurs as a consequence of trauma",
      "3. affects synovial joints",
    ],
    correct: "E",
    explanation: "Rheumatoid arthritis is associated with inﬂammation of the synovial membrane of different joints.",
  },

  {
    id: 227,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q227. Onset of rheumatoid arthritis:",
    statements: [
      "1. is insidious",
      "2. occurs symmetrically",
      "3. is polyarticular",
    ],
    correct: "A",
    explanation: "There is great inter-patient variation in the course of the disease. Onset is insidious and the disease usually presents initially with non-speciﬁc symptoms such as fatigue, malaise, diffuse musculoskeletal pain and stiffness.",
  },

  {
    id: 228,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q228. In monitoring effectiveness of treatment for AV, functional factors to be assessed include:",
    statements: [
      "1. duration of morning stiffness",
      "2. ability to dress",
      "3. grip strength",
    ],
    correct: "A",
    explanation: "As rheumatoid arthritis progresses, morning stiffness becomes prolonged and more disabling, interfering with patient’s daily activities.",
  },

  {
    id: 229,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q229. AV should be monitored for development of:",
    statements: [
      "1. anaemia",
      "2. gastric ulceration",
      "3. elevated creatine kinase",
    ],
    correct: "B",
    explanation: "As rheumatoid arthritis is a chronic inﬂammatory disease, patients may develop anaemia. This occurs because of reduced erythropoiesis during inﬂammatory disease.",
  },

  {
    id: 230,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q230. AV should be advised:",
    statements: [
      "1. to take methotrexate and folic acid once weekly one day apart",
      "2. to take prednisolone after food",
      "3. to report sore throat or fever immediately",
    ],
    correct: "A",
    explanation: "In AV methotrexate is prescribed as a weekly dose of 15 mg. It is very important to advise AV about proper administration of the drug and the pharmacist should ensure that the patient has understood the dosage regimen.",
  },

  {
    id: 231,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q231. AV should undergo regularly investigations for:",
    statements: [
      "1. full blood count",
      "2. renal function tests",
      "3. liver function tests",
    ],
    correct: "A",
    explanation: "As methotrexate may cause bone marrow suppression, the patient should have a full blood count, including differential white cell count, regularly.",
  },

  {
    id: 232,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q232. Disodium pamidronate:",
    statements: [
      "1. is used in corticosteroid-induced osteoporosis",
      "2. is only available for parenteral administration",
      "3. requires monitoring of serum electrolytes",
    ],
    correct: "A",
    explanation: "Disodium pamidronate is a biphosphonate that may be used in the prophylaxis and treatment of osteoporosis and corticosteroid-induced osteoporosis.",
  },

  {
    id: 233,
    type: "combo",
    category: "Rheumatology",
    caseId: "t3_case5",
    question: "Q233. Disease-modifying antirheumatic drugs that act as cytokine inhibitors include:",
    statements: [
      "1. methotrexate",
      "2. etanercept",
      "3. infliximab",
    ],
    correct: "C",
    explanation: "Disease-modifying antirheumatic drugs include cytokine inhibitors such as etanercept and inﬂiximab.",
  },

  {
    id: 234,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    caseBlock: "MA is a 71-year-old male diagnosed with shingles about 3 months ago. During active disease he received famciclovir 250 mg three times daily for 7 days. The rash has cleared but he continues to complain of pain.",
    question: "Q234. Shingles:",
    statements: [
      "1. occurs when varicella zoster virus is reactivated from its latent state",
      "2. involves primarily the dorsal root ganglia",
      "3. is characterised by vesicular eruptions",
    ],
    correct: "A",
    explanation: "Shingles occurs as a result of reactivation of the varicella zoster virus that is dormant in the nuclear DNA of dorsal root ganglia.",
  },

  {
    id: 235,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    question: "Q235. Shingles:",
    statements: [
      "1. may present with eye involvement",
      "2. postherpetic neuralgia does not exceed 2 months in duration",
      "3. pain is characterised by spasms",
    ],
    correct: "D",
    explanation: "Shingles usually occurs along the thorax, head and neck and lumbosacral area. Eye or ear involvement may occur and this requires referral of the patient to a specialist to limit long-term damage.",
  },

  {
    id: 236,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    question: "Q236. Famciclovir:",
    statements: [
      "1. has a better bioavailability than aciclovir",
      "2. is a prodrug of penciclovir",
      "3. lacks intrinsic antiviral activity",
    ],
    correct: "A",
    explanation: "Famciclovir is a prodrug of penciclovir. Famciclovir is rapidly absorbed from the gastrointestinal tract following oral administration and it is converted to penciclovir.",
  },

  {
    id: 237,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    question: "Q237. Famciclovir:",
    statements: [
      "1. should be started immediately in the active phase",
      "2. is used to minimise risk of postherpetic neuralgia",
      "3. should be continued until pain disappears",
    ],
    correct: "B",
    explanation: "Use of antiviral drugs such as famciclovir at the onset of the acute phase reduces the risk of postherpetic neuralgia.",
  },

  {
    id: 238,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t3_case6",
    question: "Q238. Side-effects to be expected with famciclovir include:",
    statements: [
      "1. hypertension",
      "2. nausea",
      "3. headache",
    ],
    correct: "C",
    explanation: "Side-effects associated with famciclovir are rare and these include nausea, headache, confusion, vomiting, jaundice, dizziness, drowsiness, hallucinations, rash and pruritus.",
  },

  {
    id: 239,
    type: "single",
    category: "Neurology",
    caseId: "t3_case6",
    question: "Q239. MA now has:",
    options: [
      "migrainous neuralgia",
      "postherpetic neuralgia",
      "trigeminal neuralgia",
      "chickenpox",
      "generalised anxiety disorder",
    ],
    correct: "postherpetic neuralgia",
    explanation: "Persistent pain after rash resolution in shingles is consistent with postherpetic neuralgia.",
  },

  {
    id: 240,
    type: "combo",
    category: "Neurology",
    caseId: "t3_case6",
    question: "Q240. Drugs that could be used to manage the condition of MA include:",
    statements: [
      "1. ampicillin",
      "2. ibuprofen",
      "3. amitriptyline",
    ],
    correct: "C",
    explanation: "Drugs which could be recommended for MA include analgesics such as nonsteroidal anti-inﬂammatory drugs, for example, ibuprofen.",
  },
  {
    id: 241,
    type: "match",
    category: "Clinical Assessment",
    question: "Q241. is used to investigate retinopathy",
    options: [
      "ophthalmoscope",
      "otoscope",
      "stethoscope",
      "sphygmomanometer",
      "reflex hammer",
    ],
    correct: "ophthalmoscope",
    explanation: "An ophthalmoscope is used to examine the fundus and investigate retinopathy.",
  },

  {
    id: 242,
    type: "match",
    category: "Clinical Assessment",
    question: "Q242. is used to assess breath sounds",
    options: [
      "ophthalmoscope",
      "otoscope",
      "stethoscope",
      "sphygmomanometer",
      "reflex hammer",
    ],
    correct: "stethoscope",
    explanation: "A stethoscope is used to assess breath sounds during respiratory and cardiovascular examination.",
  },

  {
    id: 243,
    type: "match",
    category: "Clinical Assessment",
    question: "Q243. is used to test deep tendon reflexes",
    options: [
      "ophthalmoscope",
      "otoscope",
      "stethoscope",
      "sphygmomanometer",
      "reflex hammer",
    ],
    correct: "reflex hammer",
    explanation: "A reflex hammer is used to test deep tendon reflexes.",
  },

  {
    id: 244,
    type: "match",
    category: "Endocrinology",
    question: "Q244. is produced by the placenta",
    options: [
      "gonadotrophin-releasing hormone",
      "C peptide",
      "troponin I",
      "prolactin",
      "human chorionic gonadotrophin",
    ],
    correct: "human chorionic gonadotrophin",
    explanation: "Human chorionic gonadotrophin is produced by placental trophoblastic cells.",
  },

  {
    id: 245,
    type: "match",
    category: "Endocrinology",
    question: "Q245. is released from the beta cells of the pancreas",
    options: [
      "gonadotrophin-releasing hormone",
      "C peptide",
      "troponin I",
      "prolactin",
      "human chorionic gonadotrophin",
    ],
    correct: "C peptide",
    explanation: "C peptide is released from pancreatic beta cells during insulin synthesis.",
  },

  {
    id: 246,
    type: "match",
    category: "Endocrinology",
    question: "Q246. is released from the anterior pituitary gland",
    options: [
      "gonadotrophin-releasing hormone",
      "C peptide",
      "troponin I",
      "prolactin",
      "human chorionic gonadotrophin",
    ],
    correct: "prolactin",
    explanation: "Prolactin is released from the anterior pituitary gland.",
  },

  {
    id: 247,
    type: "combo",
    category: "Laboratory Medicine",
    question: "Q247. Creatine kinase (CK):",
    statements: [
      "1. is found in skeletal muscle",
      "2. isoenzyme fractions are used to identify the type of tissue damaged",
      "3. CK-MB are detected in blood within 3–5 h of a myocardial infarction",
    ],
    correct: "A",
    explanation: "Creatine kinase (CK) is an enzyme that is found in heart muscle, skeletal muscle and the brain. There are three isoenzymes: CK-BB (CPK1) which is predominantly found in the brain and lungs, CK-MB (CPK2) mainly found in myocardial cells and CK-MM (CPK3) which consists of circulatory CK.",
  },

  {
    id: 248,
    type: "combo",
    category: "Gastroenterology",
    question: "Q248. Auscultation of bowel sounds:",
    statements: [
      "1. is usually carried out postoperatively",
      "2. always requires a stethoscope",
      "3. when positive, indicates absence of peristalsis",
    ],
    correct: "D",
    explanation: "Auscultation of bowel sounds is undertaken to identify bowel obstruction or ileus. Ileus is a condition where there is an obstruction of the intestines resulting from immobility or mechanical obstruction.",
  },

  {
    id: 249,
    type: "combo",
    category: "Haematology",
    question: "Q249. A complete blood count consists of:",
    statements: [
      "1. haemoglobin quantification",
      "2. white blood cells count",
      "3. blood crossmatching",
    ],
    correct: "B",
    explanation: "A complete blood count (CBC) is a series of tests on a blood sample to present red blood cell count, haemoglobin level, haematocrit, red blood cell indices (mean corpuscular volume, mean corpuscular haemoglobin, mean corpuscular concentration), white blood cell count and differential count for different components, blood smear and platelet count.",
  },

  {
    id: 250,
    type: "combo",
    category: "Laboratory Medicine",
    question: "Q250. The erythrocyte sedimentation rate:",
    statements: [
      "1. is a non-specific indicator of inflammation",
      "2. measures the rate at which red blood cells settle out of mixed venous blood",
      "3. determination is based on protein electrophoresis",
    ],
    correct: "B",
    explanation: "The erythrocyte sedimentation rate (ESR) is a non-speciﬁc test that indicates conditions of inﬂammation, infection, malignancy and tissue necrosis or infarction.",
  },

  {
    id: 251,
    type: "combo",
    category: "Gastroenterology",
    question: "Q251. Gastro-oesophageal reflux disease may be associated with:",
    statements: [
      "1. acid regurgitation",
      "2. dysphagia",
      "3. stricture formation",
    ],
    correct: "A",
    explanation: "Gastro-oesophageal reﬂux disease (GORD) is usually due to reﬂux oesophagitis, which results in acid regurgitation.",
  },

  {
    id: 252,
    type: "combo",
    category: "Gastroenterology",
    question: "Q252. Patients using co-magaldrox preparations should be advised:",
    statements: [
      "1. not to take product at the same time as other drugs, except for enteric-coated tablets",
      "2. to take the preparation after meals",
      "3. that the product may be taken as required",
    ],
    correct: "C",
    explanation: "A mixture of magnesium hydroxide and aluminium salts in antacid preparations is referred to as co-magaldrox.",
  },

  {
    id: 253,
    type: "combo",
    category: "Clinical Pharmacology",
    question: "Q253. Patients should be advised to avoid direct sunlight when taking:",
    statements: [
      "1. gliclazide",
      "2. clarithromycin",
      "3. amiodarone",
    ],
    correct: "E",
    explanation: "Some drugs may cause phototoxic or photoallergic reactions if the patient is exposed to ultraviolet light.",
  },

  {
    id: 254,
    type: "combo",
    category: "Immunology",
    question: "Q254. Human immunoglobulins:",
    statements: [
      "1. are prepared from pooled human plasma or serum",
      "2. are tested for hepatitis B surface antigen",
      "3. are less likely to be associated with hypersensitivity reactions compared with antisera",
    ],
    correct: "A",
    explanation: "Immunoglobulins are used in clinical practice to induce passive immunity and therefore to present immediate protection against an infectious disease.",
  },

  {
    id: 255,
    type: "combo",
    category: "ENT",
    question: "Q255. Glue ear:",
    statements: [
      "1. may occur in association with inflammation of the sinuses",
      "2. may result in long-term hearing impairment",
      "3. requires systemic antibacterial treatment as the usual line of action",
    ],
    correct: "B",
    explanation: "Glue ear, also referred to as sero-mucinous otitis media, is a condition where there is an accumulation of viscous mucous ﬂuid in the middle ear, usually occurring after repeated attacks of acute otitis media.",
  },

  {
    id: 256,
    type: "combo",
    category: "Infectious Diseases",
    question: "Q256. In chronic hepatitis C:",
    statements: [
      "1. peginterferon is preferred to interferon as pegylation increases the persistence of interferon in blood",
      "2. liver damage may occur, requiring a liver transplant to prevent death from cirrhosis",
      "3. the aim of treatment is to achieve clearance of the virus which is sustained for at least 1 month after treatment has stopped",
    ],
    correct: "B",
    explanation: "Hepatitis C is a viral infection that is transmitted through contact with contaminated blood such as when sharing needles and through intravenous drug misuse or the transfusion of infected blood.",
  },

  {
    id: 257,
    type: "combo",
    category: "Neurology",
    question: "Q257. It is recommended that long-term therapy for patients presenting with stroke should consider use of:",
    statements: [
      "1. ACE inhibitor",
      "2. aspirin",
      "3. statin",
    ],
    correct: "A",
    explanation: "A stroke, also referred to as a cerebrovascular accident, is due to acute neurological dysfunction of vascular origin in focal areas of the brain.",
  },

  {
    id: 258,
    type: "combo",
    category: "Oncology",
    question: "Q258. In patients with stage III (Duke’s C) colon cancer, the choice of adjuvant chemotherapy should take into account:",
    statements: [
      "1. the side-effect profile of the drugs",
      "2. the method of administration",
      "3. the patient’s lifestyle",
    ],
    correct: "B",
    explanation: "Colorectal cancers may be classiﬁed according to the Duke’s classiﬁcation, which was originally described in 1932, or according to the TNM classiﬁ- cation.",
  },

  {
    id: 259,
    type: "combo",
    category: "Rheumatology",
    question: "Q259. The use of calcium supplementation to reduce risk of fractures:",
    statements: [
      "1. is associated with poor compliance because of the need for sustained treatment",
      "2. may be combined with vitamin D supplementation",
      "3. consists of calcium lactate as it is the only salt that can be used for oral administration",
    ],
    correct: "B",
    explanation: "Calcium supplementation increases net calcium absorption and decreases bone turnover. Many adults are in negative calcium balance throughout their lives, an imbalance that worsens with age and increases the risk of osteoporosis and bone fracture.",
  },

  {
    id: 260,
    type: "combo",
    category: "Ophthalmology",
    question: "Q260. Myopia:",
    statements: [
      "1. results in light rays being focused behind the retina",
      "2. can be corrected by using concave lenses for spectacles or contact lenses",
      "3. occurs when the person cannot clearly see an object that is more than 1 metre from the eye",
    ],
    correct: "C",
    explanation: "Myopia is corrected with concave lenses and causes poor distance vision.",
  },

  {
    id: 261,
    type: "combo",
    category: "Clinical Nutrition",
    question: "Q261. Patients who are following a low-fat diet should be advised to:",
    statements: [
      "1. increase their fibre intake",
      "2. reduce their intake of saturated fats",
      "3. eliminate their intake of polyunsaturates",
    ],
    correct: "B",
    explanation: "Patients following a low-fat diet should be advised to increase ﬁbre intake which is found in fruits, green leafy vegetables, root vegetables, cereals and breads.",
  },

  {
    id: 262,
    type: "combo",
    category: "Dermatology",
    question: "Q262. Patients with atopic eczema should be advised:",
    statements: [
      "1. to avoid frequent bathing",
      "2. to avoid scratching the area involved",
      "3. that the skin is more susceptible to microbial colonisation",
    ],
    correct: "C",
    explanation: "Atopic eczema is a skin condition characterised by pruritus and inﬂammation. A prominent feature is dry skin.",
  },

  {
    id: 263,
    type: "combo",
    category: "Clinical Pharmacology",
    question: "Q263. Measurement of drug plasma concentrations is recommended when patients are started on:",
    statements: [
      "1. phenytoin",
      "2. cancer chemotherapy",
      "3. alteplase",
    ],
    correct: "D",
    explanation: "Phenytoin is an antiepileptic drug that has a narrow therapeutic drug index. Monitoring of plasma concentrations is used to reduce phenytoin toxicity by assessing that the plasma concentration is within the therapeutic range.",
  },

  {
    id: 264,
    type: "combo",
    category: "Gastroenterology",
    question: "Q264. People with irritable bowel syndrome may complain of:",
    statements: [
      "1. a negative effect on their social life",
      "2. abdominal pain",
      "3. gastro-oesophageal reflux",
    ],
    correct: "B",
    explanation: "Irritable bowel syndrome is a condition where patients complain of diarrhoea or constipation, abdominal pain and bloating.",
  },

  {
    id: 265,
    type: "combo",
    category: "Nephrology",
    question: "Q265. Immunosuppressive agents that may be used after kidney transplantation include:",
    statements: [
      "1. azathioprine",
      "2. ciclosporin",
      "3. prednisolone",
    ],
    correct: "A",
    explanation: "Kidney transplantation is necessary when there is irreversible failure of the kidney. There are a number of complications associated with this intervention, including donor identification, organ preservation and organ rejection.",
  },

  {
    id: 266,
    type: "combo",
    category: "Oncology",
    question: "Q266. Anaemia in cancer patients:",
    statements: [
      "1. often develops insiduously",
      "2. may be corrected with the use of erythropoietin",
      "3. is always due to cancer chemotherapy",
    ],
    correct: "B",
    explanation: "Anaemia in cancer patients may be chemotherapy-induced or may be due to the tumour. The tumour may result in bone marrow inﬁltration or lead to gastrointestinal blood loss.",
  },

  {
    id: 267,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    caseBlock: "LJ is a 66-year-old female admitted for management of atrial fibrillation. PMH: hypertension and asthma. DH: potassium chloride one tablet daily, bendroflumethiazide 5 mg daily, warfarin 3 mg daily. O/E blood pressure 210/95 mmHg. On hospitalisation, digoxin loading at 0.25 mg daily and perindopril 2 mg nocte were started.",
    question: "Q267. Atrial fibrillation:",
    statements: [
      "1. may be caused by hypertension",
      "2. denote a fast, chaotic rhythm originating from multiple foci in the atria",
      "3. is associated with ventricular premature beats",
    ],
    correct: "B",
    explanation: "Atrial ﬁbrillation is a supraventricular arrhythmia that may be precipitated by cardiovascular disease that causes atrial distension, such as hypertension, ischaemia and infarction.",
  },

  {
    id: 268,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q268. Drugs that could alter QT interval in an ECG include:",
    statements: [
      "1. amitriptyline",
      "2. lithium",
      "3. fluoxetine",
    ],
    correct: "B",
    explanation: "An electrocardiogram may be undertaken for LJ to conﬁrm the nature of the arrhythmias, and 24-h recordings may be preferred to allow monitoring.",
  },

  {
    id: 269,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q269. Atrial fibrillation increases the risk of:",
    statements: [
      "1. stroke",
      "2. heart failure",
      "3. hypertension",
    ],
    correct: "B",
    explanation: "Occurrence of atrial ﬁbrillation increases the risk of stroke and heart failure.",
  },

  {
    id: 270,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q270. The reasons why digoxin was preferred to other options are:",
    statements: [
      "1. beta-adrenoceptors should be avoided because of the history of asthma",
      "2. digoxin slows ventricular response in atrial fibrillation",
      "3. it also has a hypotensive effect",
    ],
    correct: "B",
    explanation: "In atrial ﬁbrillation, the ventricular response results in a rapid ventricular rate. Digoxin is a cardiac glycoside that may be used in the management of atrial ﬁbrillation to control ventricular response.",
  },

  {
    id: 271,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q271. Digoxin should be used with caution in:",
    statements: [
      "1. elderly patients",
      "2. renal impairment",
      "3. recent infarction",
    ],
    correct: "A",
    explanation: "Digoxin has a narrow therapeutic range but plasma concentration is not the only factor indicating risk of toxicity.",
  },

  {
    id: 272,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q272. Parameters that should be monitored include:",
    statements: [
      "1. serum potassium levels",
      "2. plasma digoxin concentration",
      "3. ventricular rate at rest",
    ],
    correct: "A",
    explanation: "When LJ is hospitalised, serum potassium levels should be checked and monitored to avoid occurrence of hypokalaemia.",
  },

  {
    id: 273,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q273. A low dose of perindopril is used because:",
    statements: [
      "1. the patient is elderly",
      "2. the risk of dehydration is very high",
      "3. perindopril is being used as a prophylactic of cardiovascular events",
    ],
    correct: "D",
    explanation: "LJ is started on perindopril because she has uncontrolled blood pressure. Angiotensin-converting enzyme (ACE) inhibitors are preferred to beta-blockers in patients with asthma.",
  },

  {
    id: 274,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case1",
    question: "Q274. The medication review once the patient is stabilised should assess the need for continuation of treatment with:",
    statements: [
      "1. potassium supplementation",
      "2. perindopril",
      "3. warfarin",
    ],
    correct: "D",
    explanation: "ACE inhibitors such as perindopril cause potassium retention because they inhibit secretion of aldosterone.",
  },

  {
    id: 275,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    caseBlock: "AX is a 72-year-old male with rheumatoid arthritis flare-up (3-week history of fever and painful joints, swelling/warmth in hands, wrists and ankles). PMH: rheumatoid arthritis, peptic ulceration, colonic polyps. DH includes fluvastatin 20 mg nocte, methotrexate 15 mg weekly, folic acid 10 mg weekly, paracetamol 1 g every 8 hours prn. Drug allergies: leflunomide; prior gold injections caused reversible renal impairment. On admission, methylprednisolone 500 mg was given by slow IV infusion for one day.",
    question: "Q275. The aim(s) of treatment in rheumatoid arthritis is (are):",
    statements: [
      "1. to preserve functional ability",
      "2. to prevent osteoporosis",
      "3. to prevent hyperuricaemia",
    ],
    correct: "D",
    explanation: "Rheumatoid arthritis is a progressive disease that is associated with deterioration in patient mobility and a reduction in life expectancy of 7 years in males and 3 years in women.",
  },

  {
    id: 276,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q276. Biochemical investigations to monitor AX include:",
    statements: [
      "1. C-reactive protein",
      "2. erythrocyte sedimentation rate",
      "3. rheumatoid factor",
    ],
    correct: "A",
    explanation: "Monitoring of outcomes of therapy and of disease progression includes biochemical tests where changes in inﬂammatory markers are followed.",
  },

  {
    id: 277,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q277. The use of methylprednisolone in AX:",
    statements: [
      "1. results in suppression of cytokines",
      "2. presents a rapid improvement in symptoms",
      "3. should be continued orally for a few months",
    ],
    correct: "B",
    explanation: "In AX, methylprednisolone is administered by slow intravenous infusion as a single dose to control symptoms associated with the ﬂare-up and to induce remission.",
  },

  {
    id: 278,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q278. Disadvantages of using methylprednisolone in AX include:",
    statements: [
      "1. his past history of peptic ulceration",
      "2. concomitant administration with fluvastatin",
      "3. his allergy to leflunomide",
    ],
    correct: "D",
    explanation: "Corticosteroids are associated with the development of peptic ulceration. Use of corticosteroids in AX should be undertaken with caution and considered only to treat aggressive ﬂare-ups or until the condition is managed with different disease-modifying antirheumatic agents.",
  },

  {
    id: 279,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q279. Compared with prednisolone, methylprednisolone:",
    statements: [
      "1. has greater glucocorticoid activity",
      "2. has less mineralcorticoid activity",
      "3. is gastro-labile",
    ],
    correct: "B",
    explanation: "Methylprednisolone is a steroid with a greater glucocorticoid activity compared with prednisolone and lower mineralcorticoid effects.",
  },

  {
    id: 280,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q280. The interpretation of the results of the blood glucose tests for AX:",
    statements: [
      "1. requires information on food intake for the past 16 h",
      "2. indicates hyperglycaemia",
      "3. may be affected by methylprednisolone therapy",
    ],
    correct: "E",
    explanation: "In addition to anti-inﬂammatory and immunosuppressive effects, glucocorticoid activity results in metabolic effects including a decrease in peripheral glucose utilisation and an increase in gluconeogenesis.",
  },

  {
    id: 281,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q281. In the long-term, drugs that could be considered as additional treatment to methotrexate for the management of rheumatoid arthritis in AX include:",
    statements: [
      "1. infliximab",
      "2. etanercept",
      "3. doxorubicin",
    ],
    correct: "B",
    explanation: "Cytokine inhibitors such as inﬂiximab, etanercept, adalimumab are used as disease-modifying antirheumatic drugs in the management of rheumatoid arthritis.",
  },

  {
    id: 282,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q282. Common problems associated with methotrexate therapy in rheumatoid arthritis include:",
    statements: [
      "1. inadvertent daily drug administration",
      "2. nausea and vomiting",
      "3. bone marrow suppression",
    ],
    correct: "A",
    explanation: "Methotrexate is commonly prescribed as a weekly dose. Dispensing errors and errors in drug administration, where the patient takes the drug on a daily basis may occur.",
  },

  {
    id: 283,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case2",
    question: "Q283. AX is receiving folic acid:",
    statements: [
      "1. to prevent megaloblastic anaemia",
      "2. to augment the effectiveness of methotrexate",
      "3. to reduce the occurrence of stomatitis from methotrexate",
    ],
    correct: "E",
    explanation: "AX is prescribed folic acid to be taken weekly to prevent the stomatitis that may occur as a result of methotrexate therapy.",
  },

  {
    id: 284,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case3",
    caseBlock: "MB is a 55-year-old male presenting with palpitations and blood pressure 150/110 mmHg. He had previous hypertension and had been taking moxonidine 200 micrograms twice daily but stopped after running out of tablets.",
    question: "Q284. Moxonidine:",
    statements: [
      "1. is a centrally acting antihypertensive drug",
      "2. acts on the imidazoline receptors",
      "3. should not be used in patients hypersensitive to ACE inhibitors",
    ],
    correct: "B",
    explanation: "Moxonidine is a centrally acting drug that blocks imidazoline and alpha 2- adrenoceptors. It is used for the treatment of mild-to-moderate hypertension, especially where the condition is unresponsive to ﬁrst-line therapy.",
  },

  {
    id: 285,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case3",
    question: "Q285. Other drugs that have a similar mode of action to moxonidine include:",
    statements: [
      "1. methyldopa",
      "2. doxazosin",
      "3. hydralazine",
    ],
    correct: "D",
    explanation: "Methyldopa and clonidine are two other antihypertensive drugs that are centrally acting. Moxonidine is a newer drug that is associated with fewer side-effects owing to its central action.",
  },

  {
    id: 286,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case3",
    question: "Q286. Clinical presentation of MB is probably caused by:",
    statements: [
      "1. heart failure",
      "2. stroke",
      "3. abrupt withdrawal of moxonidine",
    ],
    correct: "E",
    explanation: "Moxonidine is structurally similar to clonidine. As for clonidine, abrupt withdrawal should be avoided as it may be associated with an increased cathecolamine release that may be manifested with agitation, sweating, tachycardia, headache, nausea and rebound hypertension.",
  },

  {
    id: 287,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case3",
    question: "Q287. The assessment of end-organ damage from hypertension includes:",
    statements: [
      "1. evaluating prostatic hypertrophy",
      "2. examination of the optic fundi",
      "3. carrying out an ECG",
    ],
    correct: "C",
    explanation: "Long-standing hypertension may cause complications associated with cardiovascular dysfunction, such as myocardial infarction, stroke and peripheral vascular disease in the retina, kidneys and extremities.",
  },

  {
    id: 288,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    caseBlock: "RB is a 30-year-old female with systemic sclerosis and acute Raynaud's phenomenon. PMH includes 9-year Raynaud's disease history with finger discoloration/cyanosis on cold exposure. DH: pentoxifylline 400 mg daily, nifedipine 20 mg daily. O/E includes swollen/tender fingers and mild nail-fold erythema with clear discharge.",
    question: "Q288. The management plan for RB should include:",
    statements: [
      "1. diclofenac suppositories",
      "2. vancomycin po",
      "3. co-amoxiclav intravenous therapy",
    ],
    correct: "E",
    explanation: "During an attack of Raynaud’s disease, ﬁnger discoloration is common. Pain is not usually a prominent symptom.",
  },

  {
    id: 289,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    question: "Q289. Pentoxifylline:",
    statements: [
      "1. acts as a vasodilator",
      "2. may cause hypotension",
      "3. should not be used for longer than 6 weeks",
    ],
    correct: "B",
    explanation: "Pentoxifylline is a xanthine derivative that has vasodilating properties. It increases blood ﬂow to ischaemic tissues and results in an improvement of tissue oxygenation in the affected areas.",
  },

  {
    id: 290,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    question: "Q290. RB should be advised:",
    statements: [
      "1. to avoid exposure to cold",
      "2. to stop smoking",
      "3. that the condition is precipitated by exercise",
    ],
    correct: "B",
    explanation: "Factors that reduce blood ﬂow in the ﬁngers increase the risk of an acute attack. RB should be advised to avoid exposure to cold temperatures and to use lined gloves when handling food in freezers.",
  },

  {
    id: 291,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    question: "Q291. Drugs that should be used with caution or avoided in RB include:",
    statements: [
      "1. atenolol",
      "2. codeine",
      "3. promethazine",
    ],
    correct: "D",
    explanation: "Atenolol is a beta-adrenoceptor blocking drug. These drugs result in a reduced peripheral circulation leading to coldness of extremities and may exacerbate an acute attack of Raynaud’s disease.",
  },

  {
    id: 292,
    type: "combo",
    category: "Rheumatology",
    caseId: "t4_case4",
    question: "Q292. Nifedipine:",
    statements: [
      "1. has more influence on the myocardium than on peripheral vessels compared with verapamil",
      "2. should not be administered as a modified-release formulation in the management of Raynaud’s phenomenon",
      "3. reduces frequency and severity of vasospastic effects in Raynaud’s phenomenon",
    ],
    correct: "E",
    explanation: "Nifedipine is a calcium-channel blocker which, unlike verapamil, has more inﬂuence on the peripheral and coronary vessels than on the myocardium.",
  },

  {
    id: 293,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    caseBlock: "FG is an 83-year-old female with sudden shortness of breath and retrosternal chest pain, with occasional cough and whitish sputum. PMH: diet-controlled diabetes mellitus, hypertension, congestive heart failure, depression. DH includes paroxetine, potassium chloride, verapamil, dipyridamole, bumetanide, and multivitamins. Investigations suggest pulmonary oedema secondary to myocardial infarction with chest infection.",
    question: "Q293. On admission treatment that should be started includes:",
    statements: [
      "1. insulin",
      "2. isosorbide dinitrate injections",
      "3. aspirin 75 mg po",
    ],
    correct: "A",
    explanation: "On admission aims of treatment for FG are to control blood glucose levels, to treat infection, to reduce pulmonary oedema and to provide prophylaxis against ischaemic events.",
  },

  {
    id: 294,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q294. Possible adjustments to FG’s current treatment include:",
    statements: [
      "1. review dose of potassium chloride supplement",
      "2. switch bumetanide to intravenous therapy",
      "3. stop verapamil",
    ],
    correct: "A",
    explanation: "FG has presented with hypokalaemia, which is corrected by increasing the dose of potassium chloride supplements.",
  },

  {
    id: 295,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q295. Oxygen therapy is started in the A&E department:",
    statements: [
      "1. to provide initial support",
      "2. at a concentration of 35%",
      "3. should be administered using a nasal cannula",
    ],
    correct: "B",
    explanation: "Oxygen therapy is started in the emergency department so as to provide support to FG, who presents with shortness of breath.",
  },

  {
    id: 296,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q296. Paroxetine:",
    statements: [
      "1. is more effective than tricyclic antidepressants",
      "2. has a similar chemical structure to fluoxetine",
      "3. may cause movement disorders as side-effects",
    ],
    correct: "E",
    explanation: "Paroxetine is a selective serotonin reuptake inhibitor (SSRI). SSRIs together with tricyclic antidepressants (TCAs) are used in the management of depression.",
  },

  {
    id: 297,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q297. Dipyridamole:",
    statements: [
      "1. is a phosphodiesterase inhibitor",
      "2. should be used with caution in rapidly worsening angina",
      "3. is commonly associated with bleeding disorders",
    ],
    correct: "B",
    explanation: "Dipyridamole is a phosphodiesterase inhibitor and an adenosine reuptake inhibitor. It has antiplatelet and vasodilating properties.",
  },

  {
    id: 298,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q298. Cardiomegaly:",
    statements: [
      "1. occurs to accommodate increased ventricular load",
      "2. leads to pulmonary congestion",
      "3. may present with tachycardia",
    ],
    correct: "A",
    explanation: "A chest radiograph reveals cardiomegaly in FG. Cardiomegaly or enlargement of the heart, usually caused by left ventricular hypertrophy, occurs to accommodate the increased ventricular load.",
  },

  {
    id: 299,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case5",
    question: "Q299. Drugs that could cause hypotension in the patient include:",
    statements: [
      "1. bumetanide",
      "2. dipyridamole",
      "3. paroxetine",
    ],
    correct: "B",
    explanation: "Bumetanide may result in water and electrolyte imbalance, which may be manifested by hypotension, muscle cramps, headache, dry mouth, thirst and weakness.",
  },

  {
    id: 300,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    caseBlock: "AP is a 71-year-old female with hypertension, diabetes mellitus, ischaemic heart disease, congestive heart failure, and previous myocardial infarction. She presented with central compressive chest pain radiating to the epigastrium, sweating and belching, worsened by exertion. ECG showed T-wave inversion and CK 265. Impression: unstable angina. DH includes candesartan, clopidrogel, isosorbide mononitrate, fluvastatin, amlodipine, carvedilol, bumetanide, and isophane insulin.",
    question: "Q300. Carvedilol:",
    statements: [
      "1. has an arteriolar vasodilating action",
      "2. reduces mortality in heart failure",
      "3. is more water soluble than atenolol",
    ],
    correct: "B",
    explanation: "Carvedilol is a non-cardioselective beta-adrenoceptor blocker. It blocks the beta-receptors of the sympathetic nervous system in the heart, peripheral vasculature, bronchi, pancreas and liver.",
  },

  {
    id: 301,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q301. Potential side-effects that AP may present include:",
    statements: [
      "1. postural hypotension",
      "2. flushing",
      "3. shortness of breath",
    ],
    correct: "B",
    explanation: "Hypotension may occur as a common side-effect of a number of drugs that are included in AP’s treatment.",
  },

  {
    id: 302,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q302. Candesartan:",
    statements: [
      "1. inhibits breakdown of bradykinin",
      "2. dose should be administered in divided doses",
      "3. should be used with caution in renal artery stenosis",
    ],
    correct: "E",
    explanation: "Candesartan is an ester prodrug and it is hydrolysed to the active form during absorption from the gastrointestinal tract.",
  },

  {
    id: 303,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q303. As regards diabetes management:",
    statements: [
      "1. insulin used is an intermediate-acting preparation",
      "2. AP should be advised to avoid episodes of hypoglycaemia",
      "3. insulin requirements decrease during anginal attacks",
    ],
    correct: "B",
    explanation: "Isophane insulin is an intermediate-acting insulin preparation that allows twicedaily injection. AP should be advised to avoid episodes of hypoglycaemia by correctly following the dose administration of insulin and keeping a standard food intake pattern.",
  },

  {
    id: 304,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q304. Isosorbide mononitrate:",
    statements: [
      "1. modified-release formulations are preferred",
      "2. is metabolised to isosorbide dinitrate",
      "3. increases venous return",
    ],
    correct: "D",
    explanation: "Isosorbide mononitrate is a nitrate that is used in angina. Nitrates are potent coronary vasodilators and bring about a reduced venous return.",
  },

  {
    id: 305,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q305. Fluvastatin:",
    statements: [
      "1. patient should be advised to report muscle pain promptly",
      "2. a therapeutic alternative is simvastatin 80 mg daily",
      "3. a complete blood count should be carried out before starting treatment",
    ],
    correct: "B",
    explanation: "Fluvastatin is a statin that acts as a 3-hydroxyl-3-methylglutaryl coenzyme A (HMG CoA) reductase inhibitor.",
  },

  {
    id: 306,
    type: "combo",
    category: "Cardiology",
    caseId: "t4_case6",
    question: "Q306. The management of unstable angina includes:",
    statements: [
      "1. clopidrogel",
      "2. heparin",
      "3. complete bed rest",
    ],
    correct: "A",
    explanation: "Unstable angina may present with negative outcomes and requires immediate hospitalisation. Complete bed rest is recommended for a few days.",
  },

  {
    id: 307,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t4_case7",
    caseBlock: "KB is a 36-year-old female presenting with dysuria, urinary urgency, and increased urinary frequency.",
    question: "Q307. Possible diagnoses include:",
    statements: [
      "1. cystitis",
      "2. acute pyelonephritis",
      "3. vulvovaginitis",
    ],
    correct: "B",
    explanation: "Cystitis and acute pyelonephritis are key differentials in this urinary symptom presentation.",
  },

  {
    id: 308,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t4_case7",
    question: "Q308. The patient should be asked:",
    statements: [
      "1. about presence of fever",
      "2. to undertake a urinalysis",
      "3. to present mid-stream sampling for culturing",
    ],
    correct: "B",
    explanation: "Patient should be asked about occurrence of fever. This helps to differentiate between cystitis and acute pyelonephritis.",
  },

  {
    id: 309,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t4_case7",
    question: "Q309. The patient should be advised to:",
    statements: [
      "1. drink lots of fluid",
      "2. use potassium citrate salts",
      "3. use a high dose of ibuprofen",
    ],
    correct: "B",
    explanation: "KB is advised to drink lots of water to ﬂush out the urinary system and dilute the microorganisms. Alkalinisation of urine may be used to relieve the discomfort caused by the urinary tract infection.",
  },

  {
    id: 310,
    type: "combo",
    category: "Infectious Diseases",
    caseId: "t4_case7",
    question: "Q310. Anti-infectives that could be recommended include:",
    statements: [
      "1. co-amoxiclav",
      "2. cefuroxime",
      "3. flucloxacillin",
    ],
    correct: "B",
    explanation: "Antibacterial agents that are active against E. coli are recommended for the management of cystitis and acute pyelonephritis.",
  },

  {
    id: 311,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    caseBlock: "SC is a 34-year-old female in her first month of pregnancy with blood pressure 140/100 mmHg and otherwise normal investigations. She was started on labetalol 100 mg daily.",
    question: "Q311. The diagnosis indicates:",
    statements: [
      "1. the probability that hypertension was pre-existing",
      "2. a higher risk of pre-eclampsia",
      "3. that hypertension is due to secondary causes",
    ],
    correct: "B",
    explanation: "As there is hypertension before the ﬁrst 20–24 weeks of pregnancy, there is a probability that hypertension was pre-existing before conception.",
  },

  {
    id: 312,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    question: "Q312. The patient requires frequent monitoring of:",
    statements: [
      "1. blood pressure",
      "2. urinalysis",
      "3. fetal growth",
    ],
    correct: "A",
    explanation: "During pregnancy, SC should be monitored to assess the development of the symptoms of pre-eclampsia, namely hypertension, proteinuria and changes in fetal growth.",
  },

  {
    id: 313,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    question: "Q313. During pregnancy, antihypertensives that should be avoided or used with caution include:",
    statements: [
      "1. thiazide diuretics, as they may cause neonatal thrombocytopenia",
      "2. ACE inhibitors, as they may affect renal function",
      "3. beta-blockers, as they may cause intrauterine growth restriction",
    ],
    correct: "A",
    explanation: "During pregnancy, the use of thiazide diuretics, beta-adrenoceptor blockers, angiotensin-converting enzyme (ACE) inhibitors and angiotensin-II receptor inhibitors should be avoided.",
  },

  {
    id: 314,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    question: "Q314. Drugs that could be used instead of labetalol include:",
    statements: [
      "1. furosemide",
      "2. candesartan",
      "3. methyldopa",
    ],
    correct: "E",
    explanation: "Methyldopa, a centrally acting antihypertensive agent, may be used in pregnancy. It has a very good safety record when used for the management of hypertension in pregnancy.",
  },

  {
    id: 315,
    type: "combo",
    category: "Obstetrics",
    caseId: "t4_case8",
    question: "Q315. Labetalol:",
    statements: [
      "1. acts as a competitive antagonist to alpha and beta receptors in the sympathetic nervous system",
      "2. structure consists of two optical centres",
      "3. activity at the alpha receptors results in vasoconstriction",
    ],
    correct: "B",
    explanation: "Labetalol is a non-cardioselective drug that acts as a competitive antagonist to alpha and beta-receptors in the sympathetic nervous system.",
  },

  {
    id: 316,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    caseBlock: "HG is a 46-year-old female with troublesome nocturnal cough, nasal congestion, and nasal itchiness for weeks, with longstanding nasal allergy that has deteriorated. She has used oxymetazoline spray (two puffs three times daily) for two weeks.",
    question: "Q316. The patient:",
    statements: [
      "1. probably has perennial allergic rhinitis",
      "2. may be allergic to house dust",
      "3. has a viral infection",
    ],
    correct: "B",
    explanation: "HG may have the perennial type of allergic rhinitis as she states that she has recurrent attacks of nasal allergy indicating that the attacks may not be seasonal.",
  },

  {
    id: 317,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    question: "Q317. Oxymetazoline:",
    statements: [
      "1. is effective against nasal congestion",
      "2. the patient should be advised to stop using it",
      "3. is also available as an oral formulation",
    ],
    correct: "B",
    explanation: "In HG, oxymetazoline provides relief against nasal congestion. Oxymetazoline is an alpha-adrenoceptor agonist and its topical administration causes nasal vasoconstriction, thus reducing swelling and congestion in the nasal mucous membranes.",
  },

  {
    id: 318,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    question: "Q318. Desloratidine:",
    statements: [
      "1. is indicated in this patient on a long-term basis",
      "2. is available as a nasal spray",
      "3. oral dosage form requires administration three times daily",
    ],
    correct: "D",
    explanation: "Desloratidine is an antihistamine that may be used for symptomatic relief in HG. The product may be used on a long-term basis and the non-sedating property of desloratidine is an advantage with regards to the lower incidence of sedation compared with older sedating agents.",
  },

  {
    id: 319,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    question: "Q319. Budesonide:",
    statements: [
      "1. should be used in the form of tablets",
      "2. is only available as a nasal spray",
      "3. is used in the prophylaxis of asthma",
    ],
    correct: "E",
    explanation: "Budesonide is a corticosteroid that was developed for inhalation for the management of asthma. It is also available as a nasal spray for use in allergic rhinitis and as an oral formulation that is used in the management of Crohn’s disease.",
  },

  {
    id: 320,
    type: "combo",
    category: "Allergy and Immunology",
    caseId: "t4_case9",
    question: "Q320. Patient should be advised:",
    statements: [
      "1. to avoid walking in gardens",
      "2. to regularly use products to eradicate house dust mites",
      "3. that the condition could easily develop into cough with blood in sputum",
    ],
    correct: "B",
    explanation: "HG should be advised to avoid exposure to allergens. She should be advised to avoid walking in gardens and to use products to eradicate house dust mites regularly in the house.",
  },
];
