window.MEDLENS_INTERACTIONS_DATABASE = window.MEDLENS_INTERACTIONS_DATABASE || {};

window.MEDLENS_INTERACTIONS_DATABASE["aliskiren__lisinopril-and-hydrochlorothiazide-tablets"] = {
  "id": "aliskiren__lisinopril-and-hydrochlorothiazide-tablets",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "Aliskiren"
  ],
  "normalizedDrugs": [
    "aliskiren",
    "lisinopril-and-hydrochlorothiazide-tablets"
  ],
  "type": "exact-pair",
  "severity": "contraindicated",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "exact-label",
  "clinicalConcern": "Coadministration of aliskiren with lisinopril is contraindicated in patients with diabetes, and aliskiren should be avoided in patients with significant renal impairment (GFR <60 mL/min).",
  "mechanism": "Aliskiren is a direct renin inhibitor; the label advises against combining it with lisinopril in patients with diabetes, and the provided excerpt does not specify the detailed interaction mechanism.",
  "management": "Do not coadminister aliskiren and lisinopril in patients with diabetes; avoid initiating aliskiren if eGFR is below 60 mL/min.",
  "monitoring": "The label excerpt gives no specific monitoring steps; verify renal function (eGFR) before considering aliskiren and avoid use if GFR <60 mL/min.",
  "counseling": "Advise patients with diabetes not to take aliskiren with lisinopril and tell patients to report known reduced kidney function or an eGFR <60 mL/min to their prescriber.",
  "evidence": "FDA product label (open.fda.gov): \"Do not coadminister aliskiren (a direct renin inhibitor) with lisinopril in patients with diabetes; avoid aliskiren in patients with significant renal impairment (GFR <60 mL/min).\"",
  "sourceText": "Do not coadminister aliskiren (a direct renin inhibitor) with lisinopril in patients with diabetes; avoid aliskiren in patients with significant renal impairment (GFR <60 mL/min).",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T13:16:10.304Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:16:40.685Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Label states contraindication in diabetes and avoidance in GFR <60 mL/min; the excerpt reviewed contains no additional detail on clinical outcomes or monitoring recommendations."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["angiotensin-receptor-blockers-arbs__lisinopril-and-hydrochlorothiazide-tablets"] = {
  "id": "angiotensin-receptor-blockers-arbs__lisinopril-and-hydrochlorothiazide-tablets",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "Angiotensin receptor blockers (ARBs)"
  ],
  "normalizedDrugs": [
    "angiotensin-receptor-blockers-arbs",
    "lisinopril-and-hydrochlorothiazide-tablets"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "class-label",
  "clinicalConcern": "Combining lisinopril with an ARB (dual RAS blockade) increases the risk of hypotension, syncope, hyperkalemia, and worsening renal function.",
  "mechanism": "Dual blockade of the renin–angiotensin system produces additive pharmacologic effects that increase the likelihood of low blood pressure, elevated potassium, and impaired renal function.",
  "management": "Avoid coadministration; if both agents are already prescribed, discontinue one and reassess therapy promptly.",
  "monitoring": "Check blood pressure, serum potassium, and renal function (serum creatinine) before and periodically after any change in therapy.",
  "counseling": "Advise patients not to take lisinopril and an ARB together and to report dizziness, fainting, or signs of worsening kidney function or high potassium promptly.",
  "evidence": "FDA drug label excerpt: \"Avoid combination... Dual blockade of the renin–angiotensin system (RAS) — combining an ACE inhibitor (like lisinopril) with an angiotensin receptor blocker ... increases risks of hypotension, syncope, hyperkalemia, and worsening renal function.\"",
  "sourceText": "Avoid combination... Dual blockade of the renin–angiotensin system (RAS) — combining an ACE inhibitor (like lisinopril) with an angiotensin receptor blocker ... increases risks of hypotension, syncope, hyperkalemia, and worsening renal function",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T13:16:10.301Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:16:54.823Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Summary based solely on the provided FDA label excerpt; no additional sources were consulted."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["antibiotics-and-antifungals__warfarin"] = {
  "id": "antibiotics-and-antifungals__warfarin",
  "drugs": [
    "Warfarin",
    "Antibiotics and antifungals"
  ],
  "normalizedDrugs": [
    "antibiotics-and-antifungals",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "class-label",
  "clinicalConcern": "Antibiotics and antifungals can alter warfarin anticoagulation, producing clinically significant INR changes.",
  "mechanism": "Mechanisms vary by agent and are not specified in the source; effects on INR can occur.",
  "management": "Closely monitor INR when starting or stopping any antibiotic or antifungal and adjust warfarin dose based on INR.",
  "monitoring": "Obtain and recheck INR promptly after initiation or discontinuation of the antibiotic/antifungal, and tailor testing frequency to the agent and patient.",
  "counseling": "Advise patients to get INR testing promptly when they start or stop any antibiotic or antifungal and to report bleeding, excessive bruising, or signs of thrombosis.",
  "evidence": "FDA product labeling (open.fda): \"Closely monitor INR when starting or stopping any antibiotic or antifungal in patients taking warfarin.\"",
  "sourceText": "Closely monitor INR when starting or stopping any antibiotic or antifungal in patients taking warfarin",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:42:32.088Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:43:55.474Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Severity: major; recommendation is broad—consult specific product labeling for agent-specific interaction details and dosing guidance."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["anticoagulants__warfarin"] = {
  "id": "anticoagulants__warfarin",
  "drugs": [
    "Warfarin",
    "Anticoagulants"
  ],
  "normalizedDrugs": [
    "anticoagulants",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "class-label",
  "clinicalConcern": "Concurrent use of warfarin with other anticoagulants is classified as a major interaction because it can produce additive anticoagulant effects and increase the risk of serious bleeding.",
  "mechanism": "Primarily a pharmacodynamic interaction—combined anticoagulants enhance anticoagulant effect leading to greater bleeding tendency.",
  "management": "Avoid concomitant use when possible; if coadministration is necessary, document the indication, consult a specialist, and plan dose adjustments or alternative therapy.",
  "monitoring": "Monitor INR frequently and assess for clinical signs of bleeding or thrombosis, adjusting therapy based on INR and patient status.",
  "counseling": "Instruct patients to report any bleeding or bruising immediately, to carry anticoagulation information, and to inform all providers and pharmacists about combined anticoagulant use.",
  "evidence": "Listed as an interaction in FDA drug labeling (open.fda.gov); the provided source text is limited to the term 'Anticoagulants.'",
  "sourceText": "Anticoagulants",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [
    "warfarin",
    "apixaban",
    "rivaroxaban",
    "dabigatran",
    "edoxaban",
    "heparin",
    "enoxaparin"
  ],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:42:32.087Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:44:15.079Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "This card is based on sparse source text; review current product labels and specialist guidance for drug-specific details before clinical decisions."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["antidiabetic-agents-insulin-and-oral-agents__lisinopril-and-hydrochlorothiazide-tablets"] = {
  "id": "antidiabetic-agents-insulin-and-oral-agents__lisinopril-and-hydrochlorothiazide-tablets",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "Antidiabetic agents (insulin and oral agents)"
  ],
  "normalizedDrugs": [
    "antidiabetic-agents-insulin-and-oral-agents",
    "lisinopril-and-hydrochlorothiazide-tablets"
  ],
  "type": "class-level",
  "severity": "moderate",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "class-label",
  "clinicalConcern": "Thiazide component may enhance the hypoglycemic effect of insulin or oral antidiabetic agents, increasing risk of hypoglycaemia.",
  "mechanism": "Label does not specify a detailed mechanism; thiazides can alter glycaemic response and may potentiate hypoglycaemic effects.",
  "management": "Monitor blood glucose closely when starting or changing lisinopril/HCTZ and be prepared to reduce antidiabetic doses if hypoglycaemia develops.",
  "monitoring": "Frequent self-monitoring of blood glucose and clinical assessment for hypoglycaemic symptoms, especially after initiation or dose changes.",
  "counseling": "Advise patients to check glucose more often, recognize and promptly treat hypoglycaemia, and contact their clinician for recurrent low readings or symptoms.",
  "evidence": "FDA-approved drug label: 'Enhanced hypoglycemic effect may occur with thiazides or require dose adjustments' (lisinopril and hydrochlorothiazide product label).",
  "sourceText": "Antidiabetic agents (insulin and oral agents) : Enhanced hypoglycemic effect may occur with thiazides or require dose adjustments",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T13:16:10.305Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:17:05.297Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Moderate interaction severity per source; label lacks mechanistic detail—individualize therapy and base antidiabetic dose adjustments on monitoring."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["antiplatelet-agents__warfarin"] = {
  "id": "antiplatelet-agents__warfarin",
  "drugs": [
    "Warfarin",
    "Antiplatelet Agents"
  ],
  "normalizedDrugs": [
    "antiplatelet-agents",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "class-label",
  "clinicalConcern": "The FDA label lists 'Antiplatelet Agents' as interacting with warfarin; the supplied source provides no specific clinical consequences.",
  "mechanism": "No mechanism is described in the supplied source.",
  "management": "Refer to the complete prescribing information or clinical guidelines for management decisions and do not assume coadministration is safe without further data.",
  "monitoring": "The supplied excerpt gives no monitoring recommendations; follow the full label and local protocols for laboratory and clinical monitoring if coadministration is considered.",
  "counseling": "Advise patients to report any signs of bleeding or unexplained bruising and to consult their prescriber or pharmacist before starting or stopping antiplatelet therapy.",
  "evidence": "Source: FDA drug labeling (open.fda.gov) entry that lists only 'Antiplatelet Agents' with no additional detail in the provided excerpt.",
  "sourceText": "Antiplatelet Agents",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:42:32.087Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:44:24.491Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Only the single term 'Antiplatelet Agents' was provided from the FDA label; obtain and review the complete label or other interaction resources for specific, actionable guidance."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["antiplatelet-agents-and-anticoagulants__sertraline"] = {
  "id": "antiplatelet-agents-and-anticoagulants__sertraline",
  "drugs": [
    "Sertraline",
    "antiplatelet agents and anticoagulants"
  ],
  "normalizedDrugs": [
    "antiplatelet-agents-and-anticoagulants",
    "sertraline"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "class-label",
  "clinicalConcern": "Concurrent use of sertraline with antiplatelet agents or anticoagulants is associated with an increased risk of bleeding.",
  "mechanism": "The provided label statement reports increased bleeding risk but does not describe a specific mechanism in this record.",
  "management": "Use caution and reassess the need for combination therapy; consider alternative agents if bleeding risk outweighs benefit and minimize exposure when possible.",
  "monitoring": "Monitor patients for clinical signs of bleeding and perform laboratory tests (e.g., as clinically indicated) to evaluate hemostasis.",
  "counseling": "Advise patients to report any unusual bruising, prolonged bleeding, black tarry stools, or blood in urine immediately.",
  "evidence": "FDA drug labeling (open.fda.gov): statement—\"Antiplatelet agents and anticoagulants Increased bleeding risk.\"",
  "sourceText": "Antiplatelet agents and anticoagulants Increased bleeding risk",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:48:25.606Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:56:21.354Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Summary based solely on the single label statement provided; the record lacks details on mechanism, magnitude of risk, and specific management recommendations."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["atorvastatin__clarithromycin"] = {
  "id": "atorvastatin__clarithromycin",
  "drugs": [
    "Atorvastatin",
    "Clarithromycin"
  ],
  "normalizedDrugs": [
    "atorvastatin",
    "clarithromycin"
  ],
  "severity": "major",
  "clinicalConcern": "Clarithromycin can substantially increase atorvastatin exposure, raising the risk of myopathy and rhabdomyolysis.",
  "mechanism": "Clarithromycin inhibits CYP3A4 and transport pathways involved in atorvastatin disposition, leading to higher statin levels.",
  "management": "Prefer a non‑interacting antibiotic when possible. If clarithromycin is required, temporarily hold or reduce atorvastatin per prescriber direction.",
  "monitoring": "Monitor for muscle pain, weakness, or dark urine and obtain creatine kinase if symptoms develop.",
  "counseling": "Tell patients to report unexplained muscle pain or weakness promptly, especially if accompanied by fever or dark urine.",
  "evidence": "MedLens seed interaction: increased statin exposure with risk of myopathy/rhabdomyolysis; clarithromycin inhibits CYP3A4 and transport pathways.",
  "source": "MedLens seed interaction",
  "sourceText": "Increased statin exposure with risk of myopathy or rhabdomyolysis.\nClarithromycin inhibits CYP3A4 and transport pathways involved in atorvastatin disposition.\nPrefer a non-interacting antibiotic when possible, or temporarily hold/reduce atorvastatin based on prescriber direction.\nMonitor for muscle pain, weakness, dark urine, and creatine kinase if symptoms occur.\nReport unexplained muscle symptoms promptly, especially if accompanied by fever or dark urine.",
  "updatedAt": "2026-09-01T09:31:15.048Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:44:31.200Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Severity classified as major by the MedLens source; consult the prescriber or pharmacist before coadministration."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["cationic-drugs-eliminated-by-renal-tubular-secretion__metformin-hcl"] = {
  "id": "cationic-drugs-eliminated-by-renal-tubular-secretion__metformin-hcl",
  "drugs": [
    "Metformin Hcl",
    "Cationic drugs eliminated by renal tubular secretion"
  ],
  "normalizedDrugs": [
    "cationic-drugs-eliminated-by-renal-tubular-secretion",
    "metformin-hcl"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Metformin Hcl",
  "sourceDrugId": "metformin-hcl",
  "confidence": "class-label",
  "clinicalConcern": "Coadministration with certain cationic drugs increases metformin exposure (Cmax ≈60% higher; AUC ≈40% higher).",
  "mechanism": "Likely competition for renal tubular secretion reduces metformin clearance and raises plasma levels.",
  "management": "Avoid concomitant use when possible; if unavoidable, reduce metformin dose and reassess therapy.",
  "monitoring": "Monitor renal function and for signs of increased metformin adverse effects, and reassess dose as needed.",
  "counseling": "Tell patients to report new or worsening side effects and to inform clinicians about all current medications before adding new drugs.",
  "evidence": "FDA label report: cimetidine increased metformin peak concentration by ~60% and AUC by ~40%.",
  "sourceText": "Cimetidine increased metformin peak concentrations (~60%) and AUC (~40%)",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:49:28.568Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:56:36.670Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Data come from a cimetidine–metformin interaction; magnitude may differ with other cationic drugs and in patients with impaired renal function."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["cholestyramine-colestipol__lisinopril-and-hydrochlorothiazide-tablets"] = {
  "id": "cholestyramine-colestipol__lisinopril-and-hydrochlorothiazide-tablets",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "Cholestyramine, colestipol"
  ],
  "normalizedDrugs": [
    "cholestyramine-colestipol",
    "lisinopril-and-hydrochlorothiazide-tablets"
  ],
  "type": "exact-pair",
  "severity": "moderate",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "exact-label",
  "clinicalConcern": "Cholestyramine and colestipol markedly reduce gastrointestinal absorption of hydrochlorothiazide (up to ~85% with cholestyramine and ~43% with colestipol), which may lower its diuretic and antihypertensive effect.",
  "mechanism": "Reduced gastrointestinal absorption of hydrochlorothiazide when coadministered with bile‑acid sequestrants (cholestyramine or colestipol).",
  "management": "Avoid coadministration when possible; if combined use is necessary, monitor clinical response and consider adjusting hydrochlorothiazide therapy.",
  "monitoring": "Monitor blood pressure and for clinical signs of reduced diuretic effect, and reassess therapy if control worsens.",
  "counseling": "Advise patients that cholestyramine/colestipol can reduce hydrochlorothiazide absorption and to report any loss of blood pressure control or other concerns to their clinician.",
  "evidence": "FDA drug label: \"Reduced absorption of hydrochlorothiazide (cholestyramine up to ~85%; colestipol up to ~43%).\" Source: https://open.fda.gov/apis/drug/label/",
  "sourceText": "Reduced absorption of hydrochlorothiazide (cholestyramine up to ~85%; colestipol up to ~43%)",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T13:16:10.305Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:17:19.639Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Moderate severity per the product label; summary is based solely on the FDA label percentages and should be updated if new pharmacokinetic or clinical data become available."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["co-enzyme-q10__warfarin"] = {
  "id": "co-enzyme-q10__warfarin",
  "drugs": [
    "Warfarin",
    "Co-enzyme Q10"
  ],
  "normalizedDrugs": [
    "co-enzyme-q10",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "exact-label",
  "clinicalConcern": "The provided label entry only lists co-enzyme Q10 with warfarin and does not specify clinical effects; significance of an interaction is therefore uncertain from this source.",
  "mechanism": "No mechanism is described in the supplied label; the interaction mechanism is unknown based on this source.",
  "management": "Adopt a safety-first approach: avoid unmonitored initiation or discontinuation of CoQ10 while on warfarin and reassess therapy if changes are required.",
  "monitoring": "Obtain a baseline INR and monitor INR more frequently after starting, stopping, or changing dose of CoQ10, adjusting warfarin as needed.",
  "counseling": "Instruct patients to tell clinicians and pharmacists about CoQ10 use and to notify them before starting or stopping supplements and for any signs of bleeding or clotting.",
  "evidence": "Source: FDA drug label entry listing only the ingredient name 'co-enzyme Q 10' without further interaction details (https://open.fda.gov/apis/drug/label/).",
  "sourceText": "co-enzyme Q 10",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:42:32.088Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:44:37.452Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Label information is limited to the ingredient name; consult primary literature or interaction databases for detailed evidence and update this card when additional data are available."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["cyp2c9-1a2-and-3a4-inducers__warfarin"] = {
  "id": "cyp2c9-1a2-and-3a4-inducers__warfarin",
  "drugs": [
    "Warfarin",
    "CYP2C9, 1A2, and 3A4 inducers"
  ],
  "normalizedDrugs": [
    "cyp2c9-1a2-and-3a4-inducers",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "class-label",
  "clinicalConcern": "Inducers of CYP2C9, CYP1A2, and/or CYP3A4 can decrease warfarin’s anticoagulant effect by lowering INR.",
  "mechanism": "Enzyme induction of CYP2C9/1A2/3A4 increases warfarin metabolism, reducing plasma warfarin and INR.",
  "management": "Increase INR monitoring when starting or stopping a CYP2C9/1A2/3A4 inducer and adjust warfarin dose to maintain target INR.",
  "monitoring": "Obtain baseline INR and monitor closely after initiation, dose change, or discontinuation of an inducer until INR is stable.",
  "counseling": "Advise patients to report any new or stopped prescription, OTC, or herbal medicines and to have INR testing promptly after such changes.",
  "evidence": "FDA drug labeling (OpenFDA): \"Inducers of CYP2C9, 1A2, and/or 3A4 have the potential to decrease the effect (decrease INR) of warfarin.\"",
  "sourceText": "Inducers of CYP2C9, 1A2, and/or 3A4 have the potential to decrease the effect (decrease INR) of warfarin",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:42:32.087Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:56:49.672Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Summary based solely on the supplied FDA label statement; the source does not list specific inducers, quantify effect size, or provide timing, so a conservative monitoring approach is recommended."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["cyp2c9-1a2-and-3a4-inhibitors__warfarin"] = {
  "id": "cyp2c9-1a2-and-3a4-inhibitors__warfarin",
  "drugs": [
    "Warfarin",
    "CYP2C9, 1A2, and 3A4 inhibitors"
  ],
  "normalizedDrugs": [
    "cyp2c9-1a2-and-3a4-inhibitors",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "class-label",
  "clinicalConcern": "CYP2C9, CYP1A2, or CYP3A4 inhibitors can increase warfarin anticoagulant effect, raising INR and bleeding risk.",
  "mechanism": "Inhibition of warfarin metabolism via CYP2C9, 1A2, and/or 3A4 reduces clearance and increases warfarin exposure and INR.",
  "management": "Increase INR monitoring after starting, stopping, or changing the inhibitor and adjust warfarin dose as needed; use a non‑inhibiting alternative when feasible.",
  "monitoring": "Obtain a baseline INR and monitor INR frequently after any change to interacting drugs until INR is stable.",
  "counseling": "Tell patients to report any bleeding or unusual bruising, avoid starting/stopping OTCs or supplements without approval, and attend prompt INR testing when medications change.",
  "evidence": "Source: FDA drug labeling (OpenFDA) — inhibitors of CYP2C9, 1A2, and/or 3A4 have the potential to increase warfarin effect (increase INR).",
  "sourceText": "Inhibitors of CYP2C9, 1A2, and/or 3A4 have the potential to increase the effect (increase INR) of warfarin",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:42:32.085Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:57:02.299Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Label-based statement only; the magnitude of effect depends on the specific inhibitor and patient factors, so manage conservatively with monitoring and dose adjustment."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["cyp2d6-substrates__sertraline"] = {
  "id": "cyp2d6-substrates__sertraline",
  "drugs": [
    "Sertraline",
    "CYP2D6 substrates"
  ],
  "normalizedDrugs": [
    "cyp2d6-substrates",
    "sertraline"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "class-label",
  "clinicalConcern": "Sertraline inhibits CYP2D6, which can increase exposure to drugs metabolized by CYP2D6 and raise the risk of toxicity.",
  "mechanism": "Sertraline is a CYP2D6 inhibitor, causing decreased metabolism and higher plasma concentrations of CYP2D6 substrates.",
  "management": "Prefer alternatives not metabolized by CYP2D6; if coadministration is necessary, use the lowest effective dose of the CYP2D6 substrate and consult its prescribing information.",
  "monitoring": "Monitor for signs and symptoms of toxicity from the CYP2D6 substrate and adjust therapy as needed.",
  "counseling": "Advise patients to report new or worsening side effects and to check with a clinician or pharmacist before starting or stopping any other prescription, OTC, or herbal medicines.",
  "evidence": "OpenFDA drug label: \"CYP2D6 substrates (sertraline is a CYP2D6 inhibitor) Increased exposure to drugs metabolized by CYP2D6 can raise toxicity risk.\" (https://open.fda.gov/apis/drug/label/)",
  "sourceText": "CYP2D6 substrates (sertraline is a CYP2D6 inhibitor) Increased exposure to drugs metabolized by CYP2D6 can raise toxicity risk.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:48:25.606Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:57:15.835Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Classified as a major interaction per the source; reassess when adding CYP2D6 substrates and update if product labeling changes."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["diuretics-thiazides-loop-diuretics__lisinopril-and-hydrochlorothiazide-tablets"] = {
  "id": "diuretics-thiazides-loop-diuretics__lisinopril-and-hydrochlorothiazide-tablets",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "Diuretics (thiazides, loop diuretics)"
  ],
  "normalizedDrugs": [
    "diuretics-thiazides-loop-diuretics",
    "lisinopril-and-hydrochlorothiazide-tablets"
  ],
  "type": "class-level",
  "severity": "moderate",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "class-label",
  "clinicalConcern": "Excessive blood-pressure reduction can occur when lisinopril is initiated in patients already taking thiazide or loop diuretics, particularly if recently started or volume-depleted.",
  "mechanism": "Additive antihypertensive effect combined with diuretic-induced volume depletion can produce exaggerated blood-pressure lowering.",
  "management": "Initiate lisinopril cautiously in patients on diuretics and reassess diuretic therapy and volume status around the time of initiation.",
  "monitoring": "Closely monitor blood pressure and observe for signs of hypotension after starting or adjusting lisinopril.",
  "counseling": "Advise patients to report dizziness, lightheadedness, or fainting and to check their blood pressure as instructed.",
  "evidence": "FDA drug label: 'Patients already on diuretics (especially recently started or volume‑depleted patients) can have excessive blood‑pressure lowering when lisinopril is initiated.' (open.fda.gov).",
  "sourceText": "Patients already on diuretics (especially recently started or volume-depleted patients) can have excessive blood‑pressure lowering when lisinopril is initiated.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T13:16:10.304Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:17:30.247Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Moderate interaction per source; guidance is cautious initiation and monitoring in diuretic-treated or volume-depleted patients."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["drugs-that-can-raise-blood-glucose__metformin-hcl"] = {
  "id": "drugs-that-can-raise-blood-glucose__metformin-hcl",
  "drugs": [
    "Metformin Hcl",
    "Drugs that can raise blood glucose"
  ],
  "normalizedDrugs": [
    "drugs-that-can-raise-blood-glucose",
    "metformin-hcl"
  ],
  "type": "class-level",
  "severity": "moderate",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Metformin Hcl",
  "sourceDrugId": "metformin-hcl",
  "confidence": "class-label",
  "clinicalConcern": "Concomitant use can cause hyperglycemia and reduced glycemic control in patients treated with metformin.",
  "mechanism": "Mechanisms are not specified in the source and vary by agent; drugs may increase blood glucose or counteract antidiabetic effects.",
  "management": "When possible choose an alternative with less glycemic impact; if coadministration is necessary, intensify glucose monitoring and adjust diabetes therapy as clinically indicated.",
  "monitoring": "Increase frequency of self-monitoring of blood glucose and reassess HbA1c or fasting glucose after starting or changing the offending drug.",
  "counseling": "Advise patients to check blood glucose more often, watch for signs of hyperglycemia, and report sustained elevated readings to their clinician.",
  "evidence": "Source: FDA product labeling statement — 'These agents can cause hyperglycemia and reduce glycemic control.'",
  "sourceText": "These agents can cause hyperglycemia and reduce glycemic control",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:49:28.568Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:57:27.536Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "General statement from labeling covering multiple agents; risk and mechanism depend on the specific coadministered drug, so consult individual drug labels for details."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["furosemide__metformin-hcl"] = {
  "id": "furosemide__metformin-hcl",
  "drugs": [
    "Metformin Hcl",
    "Furosemide"
  ],
  "normalizedDrugs": [
    "furosemide",
    "metformin-hcl"
  ],
  "type": "exact-pair",
  "severity": "moderate",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Metformin Hcl",
  "sourceDrugId": "metformin-hcl",
  "confidence": "exact-label",
  "clinicalConcern": "Coadministration with furosemide increases metformin exposure (Cmax ~22%, AUC ~15%), which may raise the likelihood of metformin-related adverse effects.",
  "mechanism": "Pharmacokinetic interaction documented in the FDA label: metformin Cmax increased by ~22% and blood AUC by ~15% when given with furosemide.",
  "management": "Monitor clinically for increased metformin effects and adjust the metformin dose only if clinically warranted.",
  "monitoring": "Assess glycemic control and observe for signs or symptoms of metformin intolerance or toxicity.",
  "counseling": "Tell patients to continue prescribed dosing and promptly report any new or worsening symptoms; do not stop or change metformin without clinician advice.",
  "evidence": "FDA product label pharmacokinetic data reporting metformin Cmax ↑ ~22% and AUC ↑ ~15% with furosemide coadministration (open.fda.gov).",
  "sourceText": "increased metformin Cmax (~22%) and blood AUC (~15%)",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:49:28.567Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:57:38.557Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Finding is a modest pharmacokinetic increase from the label; clinical significance is not defined in the source."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["garlic__warfarin"] = {
  "id": "garlic__warfarin",
  "drugs": [
    "Warfarin",
    "Garlic"
  ],
  "normalizedDrugs": [
    "garlic",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "exact-label",
  "clinicalConcern": "Source flags a major interaction between warfarin and garlic but provides only the single term \"garlic\" without specifying clinical consequences, so the exact risk is unknown.",
  "mechanism": "No mechanism is described in the supplied source text.",
  "management": "Assume potential for a significant interaction and avoid concurrent use of garlic supplements with warfarin or consult a clinical pharmacist before continuing.",
  "monitoring": "If co‑use occurs, perform close INR monitoring and observe for signs of bleeding or thrombosis.",
  "counseling": "Tell patients to disclose all garlic products and supplements and to consult their clinician or pharmacist before starting or stopping garlic while on warfarin.",
  "evidence": "Source: FDA drug labeling search entry containing only the term \"garlic\" with no supporting details provided.",
  "sourceText": "garlic",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:42:32.088Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:57:54.295Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Data are limited and non‑specific; confirm with up‑to‑date product labels and primary literature before making definitive clinical decisions."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["ginkgo-biloba__warfarin"] = {
  "id": "ginkgo-biloba__warfarin",
  "drugs": [
    "Warfarin",
    "Ginkgo biloba"
  ],
  "normalizedDrugs": [
    "ginkgo-biloba",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "exact-label",
  "clinicalConcern": "A major interaction is flagged between warfarin and Ginkgo biloba; the provided source lists Ginkgo biloba but gives no details about the effect, so a potential for altered anticoagulation or bleeding should be assumed.",
  "mechanism": "Not specified in the provided source text.",
  "management": "Prioritize safety: avoid concurrent use when possible; if unavoidable, coordinate with the prescriber and use conservative management decisions.",
  "monitoring": "Obtain baseline and more frequent INR checks and monitor closely for signs of bleeding or bruising.",
  "counseling": "Ask patients to disclose Ginkgo or other herbal use, advise them to report any bleeding or unusual bruising immediately, and to inform clinicians before procedures.",
  "evidence": "Source: open.fda drug label entry lists 'Ginkgo biloba' under interactions, but the supplied extract contains no additional details.",
  "sourceText": "Ginkgo biloba",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:42:32.088Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:58:06.113Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Card prepared from a minimal source extract; verify the full FDA label and primary literature for mechanism, magnitude, and management details before making clinical decisions."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["ginseng__warfarin"] = {
  "id": "ginseng__warfarin",
  "drugs": [
    "Warfarin",
    "Ginseng"
  ],
  "normalizedDrugs": [
    "ginseng",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "exact-label",
  "clinicalConcern": "The source lists 'ginseng' with warfarin but gives no details; a clinically important effect on anticoagulation cannot be ruled out, so this pair is considered potentially significant.",
  "mechanism": "Mechanism is not specified in the provided source text.",
  "management": "Avoid coadministration when possible; if combination cannot be avoided, manage conservatively with enhanced monitoring and clinical coordination.",
  "monitoring": "If combined, obtain a baseline INR and monitor INR frequently, and watch for any signs of bleeding or thrombosis.",
  "counseling": "Ask patients specifically about ginseng or other herbal supplements, advise stopping ginseng before or while taking warfarin unless directed otherwise, and to report bleeding or clotting symptoms promptly.",
  "evidence": "Source: openFDA drug label API entry containing the single term 'ginseng'; no clinical data, mechanism, or outcome details provided in the supplied text.",
  "sourceText": "ginseng",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:42:32.088Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T10:58:19.872Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Severity listed as 'major' in the record but the supplied text is minimal and nonspecific; recommend review of full labeling and primary literature for definitive guidance."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["glyburide__metformin-hcl"] = {
  "id": "glyburide__metformin-hcl",
  "drugs": [
    "Metformin Hcl",
    "Glyburide"
  ],
  "normalizedDrugs": [
    "glyburide",
    "metformin-hcl"
  ],
  "type": "exact-pair",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Metformin Hcl",
  "sourceDrugId": "metformin-hcl",
  "confidence": "exact-label",
  "clinicalConcern": "Coadministration may alter glycemic control, presenting as hypoglycemia or loss of glycemic control.",
  "mechanism": "FDA label notes a potential for altered glycemic response but does not specify an underlying mechanism.",
  "management": "Use caution when combining these agents; closely monitor glucose and adjust therapy or discontinue one agent if unsafe glycemic effects occur.",
  "monitoring": "Initiate frequent blood glucose monitoring for hypoglycemia or inadequate glycemic control while both drugs are used together.",
  "counseling": "Instruct patients to self-monitor glucose, recognize symptoms of hypoglycemia and loss of control, and report any concerning changes promptly.",
  "evidence": "FDA drug labeling: 'potential for altered glycemic response (hypoglycemia or loss of control)'.",
  "sourceText": "potential for altered glycemic response (hypoglycemia or loss of control)",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:49:28.564Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T11:00:07.622Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Severity classified as major by the source; the label provides limited detail so manage conservatively."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["highly-protein-bound-drugs__sertraline"] = {
  "id": "highly-protein-bound-drugs__sertraline",
  "drugs": [
    "Sertraline",
    "highly protein‑bound drugs"
  ],
  "normalizedDrugs": [
    "highly-protein-bound-drugs",
    "sertraline"
  ],
  "type": "class-level",
  "severity": "moderate",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "class-label",
  "clinicalConcern": "Competition for protein binding may increase free concentrations of sertraline or the co‑administered highly protein‑bound drug, potentially altering drug effect or adverse‑event risk.",
  "mechanism": "Competition for plasma protein binding increases the unbound (free) fraction of one or both drugs.",
  "management": "Monitor for increased pharmacologic effects or adverse reactions and adjust the dose of the affected drug if clinically warranted.",
  "monitoring": "Assess clinical response and watch for new or worsening side effects; use therapeutic drug levels only if available and appropriate.",
  "counseling": "Advise patients to report new or worsening symptoms promptly and to inform clinicians about all other medications before starting or stopping therapies.",
  "evidence": "Source: FDA drug label (open.fda.gov): 'Competition for protein binding may increase free drug concentrations of sertraline or the other agent.'",
  "sourceText": "Highly protein‑bound drugs Competition for protein binding may increase free drug concentrations of sertraline or the other agent",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:48:25.607Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T11:00:22.549Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Statement is general; the clinical impact depends on the specific co‑administered drug and patient factors, and the source provides no quantitative data."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["ibuprofen__lisinopril"] = {
  "id": "ibuprofen__lisinopril",
  "drugs": [
    "Lisinopril",
    "Ibuprofen"
  ],
  "normalizedDrugs": [
    "ibuprofen",
    "lisinopril"
  ],
  "severity": "moderate",
  "clinicalConcern": "Reduced antihypertensive effect and increased risk of acute kidney injury, especially with dehydration, older age, heart failure, or chronic kidney disease.",
  "mechanism": "NSAIDs reduce renal prostaglandin‑mediated blood flow and can blunt the antihypertensive effect of ACE inhibitors.",
  "management": "Avoid NSAIDs when possible; if needed, use the lowest effective dose for the shortest duration and consider acetaminophen instead.",
  "monitoring": "Monitor blood pressure, serum creatinine, potassium, urine output, and hydration status during co‑use.",
  "counseling": "Advise patients to stay well hydrated and to report reduced urination, dizziness, swelling, or worsening blood pressure. Recommend safer analgesics when appropriate.",
  "evidence": "Source: MedLens seed interaction reporting reduced BP control and increased kidney injury risk with this drug pair.",
  "source": "MedLens seed interaction",
  "sourceText": "Reduced blood pressure control and increased risk of kidney injury, especially in dehydration, older age, heart failure, or chronic kidney disease.\nNSAIDs can reduce renal prostaglandin-mediated blood flow and blunt the antihypertensive effect of ACE inhibitors.\nUse the lowest effective NSAID dose for the shortest duration. Consider acetaminophen/paracetamol for pain when appropriate.\nMonitor blood pressure, serum creatinine, potassium, urine output, and hydration status.\nAvoid dehydration and seek care for reduced urination, dizziness, swelling, or worsening blood pressure.",
  "updatedAt": "2026-09-01T09:31:15.047Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T11:00:34.727Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Moderate interaction per MedLens; risk is greatest in dehydration, older adults, heart failure, or CKD—reassess therapy and monitoring when either agent is started or stopped."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["ibuprofen__paracetamol"] = {
  "id": "ibuprofen__paracetamol",
  "drugs": [
    "Paracetamol",
    "Ibuprofen"
  ],
  "normalizedDrugs": [
    "ibuprofen",
    "paracetamol"
  ],
  "severity": "minor",
  "clinicalConcern": "Generally no clinically important interaction when each medicine is dosed correctly, but combined use can increase harm if maximum daily doses are exceeded—paracetamol risks liver injury and ibuprofen risks stomach and kidney adverse effects.",
  "mechanism": "They act by different analgesic and anti-inflammatory pathways, providing additive symptomatic relief rather than a direct pharmacokinetic interaction.",
  "management": "Ensure total daily doses do not exceed the recommended maxima for each drug; use together or alternate only with careful tracking of cumulative doses.",
  "monitoring": "Monitor total daily paracetamol and NSAID intake and watch for signs of liver injury with paracetamol and gastrointestinal bleeding or renal dysfunction with ibuprofen.",
  "counseling": "Advise patients to check combination products to avoid accidental paracetamol duplication, follow dosing instructions, and seek medical advice for jaundice, persistent abdominal pain or vomiting, or decreased urine output.",
  "evidence": "MedLens seed interaction: no clinically important adverse interaction is expected for most patients when each medicine is dosed correctly.",
  "source": "MedLens seed interaction",
  "sourceText": "No clinically important adverse interaction is expected for most patients when each medicine is dosed correctly.\nThey work through different analgesic and anti-inflammatory pathways.\nThey may be used together or alternated when appropriate, but avoid exceeding the maximum daily dose of either medicine.\nMonitor total daily dose, liver risk with paracetamol/acetaminophen, and stomach/kidney risk with ibuprofen.\nCheck combination products so you do not accidentally double-dose paracetamol/acetaminophen.",
  "updatedAt": "2026-09-01T09:31:15.048Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T11:00:51.356Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Minor interaction per MedLens; reassess if the patient has known liver, renal, or gastric disease, is on long-term NSAIDs, or if total dosing is uncertain."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["ibuprofen__sertraline"] = {
  "id": "ibuprofen__sertraline",
  "drugs": [
    "Sertraline",
    "Ibuprofen"
  ],
  "normalizedDrugs": [
    "ibuprofen",
    "sertraline"
  ],
  "severity": "moderate",
  "clinicalConcern": "Increased bleeding risk, particularly gastrointestinal bleeding, when sertraline is combined with ibuprofen.",
  "mechanism": "Sertraline can impair platelet serotonin uptake while NSAIDs add platelet inhibition and damage gastrointestinal mucosa, producing an additive bleeding risk.",
  "management": "Avoid or minimize NSAID use; prefer acetaminophen for pain when appropriate and, if an NSAID is necessary in higher‑risk patients, consider gastroprotection and reassess the need.",
  "monitoring": "Monitor for bruising, black or bloody stools, vomiting blood, signs of anemia, and persistent stomach pain.",
  "counseling": "Advise patients to check with a clinician before taking OTC ibuprofen, naproxen, aspirin, or combination pain/ cold products, to use acetaminophen when appropriate, and to report any bleeding or new stomach pain promptly.",
  "evidence": "MedLens seed interaction record noting increased bleeding risk and a mechanism of SSRI platelet effect plus NSAID platelet/GI effects.",
  "source": "MedLens seed interaction",
  "sourceText": "Increased bleeding risk, especially gastrointestinal bleeding.\nSSRIs may impair platelet serotonin uptake; NSAIDs add platelet and gastrointestinal mucosal effects.\nAvoid unnecessary NSAID use. Consider acetaminophen/paracetamol or gastroprotection in higher-risk patients when an NSAID is necessary.\nMonitor for bruising, black stools, vomiting blood, anemia symptoms, and persistent stomach pain.\nAsk before adding over-the-counter ibuprofen, naproxen, aspirin, or combination cold/pain products.",
  "updatedAt": "2026-09-01T09:31:15.048Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T11:01:03.190Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "MedLens seed interaction; no additional primary-study details or review date provided in the source record."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["ibuprofen__warfarin"] = {
  "id": "ibuprofen__warfarin",
  "drugs": [
    "Warfarin",
    "Ibuprofen"
  ],
  "normalizedDrugs": [
    "ibuprofen",
    "warfarin"
  ],
  "severity": "major",
  "clinicalConcern": "Major increased bleeding risk, especially gastrointestinal bleeding, when warfarin and ibuprofen are combined.",
  "mechanism": "Warfarin reduces clotting‑factor activity while ibuprofen inhibits platelet function and can injure the gastric mucosa, which together increase bleeding risk.",
  "management": "Do not start ibuprofen or other NSAIDs without clinician review; prefer acetaminophen for short‑term pain or fever, and if an NSAID is necessary use the lowest effective dose for the shortest duration.",
  "monitoring": "Monitor for signs of bleeding (bruising, black or bloody stools, vomiting blood, unexplained weakness), falling hemoglobin, and changes in INR.",
  "counseling": "Advise patients not to take ibuprofen without clinician approval, to use acetaminophen when appropriate, and to report any new bleeding, bruising, or black/tarry stools immediately.",
  "evidence": "MedLens seed interaction record stating a major interaction with higher bleeding risk, including gastrointestinal bleeding.",
  "source": "MedLens seed interaction",
  "sourceText": "Higher bleeding risk, including gastrointestinal bleeding.\nWarfarin reduces clotting factor activity while ibuprofen inhibits platelet function and can injure the gastric mucosa.\nAvoid routine combined use when possible. Prefer acetaminophen/paracetamol for short-term pain or fever unless contraindicated. If an NSAID is necessary, use the lowest dose for the shortest time and involve the prescriber.\nMonitor for bruising, black stools, vomiting blood, unexplained weakness, falling hemoglobin, and INR changes.\nDo not start ibuprofen or other NSAIDs while taking warfarin unless a clinician has reviewed the risk.",
  "updatedAt": "2026-09-01T09:31:15.046Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T11:01:14.874Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Conservative summary only; source gives no dose‑adjustment details, so prescriber review and INR monitoring are recommended before adding NSAIDs."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["insulin__metformin-hcl"] = {
  "id": "insulin__metformin-hcl",
  "drugs": [
    "Metformin Hcl",
    "Insulin"
  ],
  "normalizedDrugs": [
    "insulin",
    "metformin-hcl"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Metformin Hcl",
  "sourceDrugId": "metformin-hcl",
  "confidence": "class-label",
  "clinicalConcern": "Concomitant use of metformin with insulin increases overall glucose‑lowering effect and may alter glycemic control.",
  "mechanism": "Additive pharmacodynamic effect from combining two glucose‑lowering agents.",
  "management": "Anticipate and adjust insulin dosing when starting, stopping, or changing metformin, using conservative dose changes.",
  "monitoring": "Increase frequency of blood glucose monitoring during initiation, discontinuation, or dose changes of either agent.",
  "counseling": "Tell patients to monitor glucose closely and report unexpected changes in readings after any therapy change.",
  "evidence": "FDA prescribing information notes concomitant use of metformin with other glucose‑lowering agents (such as insulin).",
  "sourceText": "concomitant use with other glucose-lowering agents (such as sulfonylureas and insulin)",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:49:28.568Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T11:01:26.659Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Source statement is brief and provides no dosing or monitoring specifics; follow clinical judgment and local protocols for dose adjustment."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["intravascular-iodinated-contrast-materials__metformin-hcl"] = {
  "id": "intravascular-iodinated-contrast-materials__metformin-hcl",
  "drugs": [
    "Metformin Hcl",
    "Intravascular iodinated contrast materials"
  ],
  "normalizedDrugs": [
    "intravascular-iodinated-contrast-materials",
    "metformin-hcl"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Metformin Hcl",
  "sourceDrugId": "metformin-hcl",
  "confidence": "class-label",
  "clinicalConcern": "Intravascular iodinated contrast has been associated with lactic acidosis in patients taking metformin.",
  "mechanism": "The source does not specify a mechanism; an association is reported without mechanistic detail.",
  "management": "Assess renal function and consider holding metformin in patients receiving intravascular iodinated contrast, particularly if renal impairment is present.",
  "monitoring": "Obtain and review renal function (e.g., serum creatinine/eGFR) after contrast exposure and before restarting metformin.",
  "counseling": "Inform patients that iodinated contrast has been linked to lactic acidosis with metformin and to follow clinician instructions about temporarily stopping metformin and obtaining kidney testing if advised.",
  "evidence": "OpenFDA drug label statement: \"intravascular contrast studies with iodinated materials ... have been associated with lactic acidosis.\"",
  "sourceText": "intravascular contrast studies with iodinated materials ... have been associated with lactic acidosis",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:49:28.568Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:10:56.244Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Source text is limited—timing, incidence, and mechanism are not provided; follow institutional protocols and specialist guidance for specific timing and thresholds."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["intravenous-methylene-blue__sertraline"] = {
  "id": "intravenous-methylene-blue__sertraline",
  "drugs": [
    "Sertraline",
    "intravenous methylene blue"
  ],
  "normalizedDrugs": [
    "intravenous-methylene-blue",
    "sertraline"
  ],
  "type": "exact-pair",
  "severity": "contraindicated",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "exact-label",
  "clinicalConcern": "Concomitant use of sertraline and intravenous methylene blue can precipitate serotonin syndrome.",
  "mechanism": "IV methylene blue can interact with serotonergic drugs to produce excessive serotonergic activity leading to serotonin syndrome.",
  "management": "Contraindicated: do not administer intravenous methylene blue to patients receiving sertraline; select an alternative therapy or consult a specialist.",
  "monitoring": "If exposure occurs, monitor closely for serotonin syndrome (mental-status changes, autonomic instability, neuromuscular hyperactivity) and manage emergently.",
  "counseling": "Advise patients to tell all clinicians they take sertraline and to seek immediate care for agitation, rapid heartbeat, fever, tremor, or stiffness after methylene blue exposure.",
  "evidence": "FDA product labeling (methylene blue) via open.fda.gov cautions against the intravenous formulation of methylene blue with serotonergic drugs because of the risk of serotonin syndrome.",
  "sourceText": "This includes ... the intravenous formulation of methylene blue because of the risk of serotonin syndrome.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:48:25.606Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:11:06.468Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Derived from FDA labeling which specifically mentions the intravenous formulation and serotonin syndrome risk; no additional details were provided in the supplied text."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["linezolid__sertraline"] = {
  "id": "linezolid__sertraline",
  "drugs": [
    "Sertraline",
    "linezolid"
  ],
  "normalizedDrugs": [
    "linezolid",
    "sertraline"
  ],
  "type": "exact-pair",
  "severity": "contraindicated",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "exact-label",
  "clinicalConcern": "Concurrent use of sertraline and linezolid is contraindicated because of the risk of serotonin syndrome.",
  "mechanism": "Linezolid is a reversible MAOI that can potentiate sertraline's serotonergic effects, increasing the risk of serotonin syndrome.",
  "management": "Do not coadminister these drugs; choose an alternative antibiotic or antidepressant rather than combining them.",
  "monitoring": "If exposure occurs, monitor closely for signs of serotonin syndrome.",
  "counseling": "Advise patients not to take linezolid while receiving sertraline and to seek immediate care if symptoms suggestive of serotonin syndrome develop.",
  "evidence": "FDA prescribing information (drug label) warns that reversible MAOIs such as linezolid are contraindicated with sertraline because of the risk of serotonin syndrome (source: open.fda.gov drug label).",
  "sourceText": "This includes reversible MAOIs such as linezolid ... because of the risk of serotonin syndrome.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:48:25.606Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:11:20.555Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Contraindication is based on product labeling; follow labeling and consult specialist for complex cases or unavoidable coadministration."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["lisinopril__spironolactone"] = {
  "id": "lisinopril__spironolactone",
  "drugs": [
    "Lisinopril",
    "Spironolactone"
  ],
  "normalizedDrugs": [
    "lisinopril",
    "spironolactone"
  ],
  "severity": "major",
  "clinicalConcern": "Risk of potentially dangerous hyperkalemia and worsening renal function when these drugs are combined.",
  "mechanism": "Both drugs can raise serum potassium, increasing the risk of hyperkalemia; risk is higher with renal impairment or concurrent potassium supplements.",
  "management": "Use the combination only when clearly indicated and plan laboratory monitoring; avoid potassium supplements and potassium-containing salt substitutes unless specifically directed.",
  "monitoring": "Check serum potassium and renal function after initiation, after dose changes, and during any acute illness.",
  "counseling": "Do not take potassium supplements or use salt substitutes unless told to; seek care for muscle weakness, palpitations, severe fatigue, or fainting.",
  "evidence": "MedLens seed interaction: documents potentially dangerous hyperkalemia and kidney function decline with this drug pair.",
  "source": "MedLens seed interaction",
  "sourceText": "Potentially dangerous hyperkalemia and kidney function decline.\nBoth medicines can increase serum potassium; the risk rises further with renal impairment or potassium supplements.\nUse only when clinically justified with planned laboratory monitoring. Avoid potassium supplements and potassium-containing salt substitutes unless specifically directed.\nCheck serum potassium and renal function after initiation, after dose changes, and during acute illness.\nSeek care for muscle weakness, palpitations, severe fatigue, or fainting.",
  "updatedAt": "2026-09-01T09:31:15.047Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:11:28.171Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Major interaction per MedLens; reassess therapy and monitor closely in patients with renal impairment or rising potassium levels."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["lisinopril-and-hydrochlorothiazide-tablets__lithium"] = {
  "id": "lisinopril-and-hydrochlorothiazide-tablets__lithium",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "Lithium"
  ],
  "normalizedDrugs": [
    "lisinopril-and-hydrochlorothiazide-tablets",
    "lithium"
  ],
  "type": "exact-pair",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "exact-label",
  "clinicalConcern": "Concomitant use can increase lithium levels and risk lithium toxicity.",
  "mechanism": "Mechanism not specified in the FDA label.",
  "management": "Avoid concomitant use when possible; if combination is necessary, closely monitor lithium levels and adjust the lithium dose as clinically indicated.",
  "monitoring": "Obtain baseline and periodic lithium serum concentrations and monitor for clinical signs of lithium toxicity.",
  "counseling": "Tell patients to report symptoms suggestive of lithium toxicity promptly and to inform clinicians before starting or stopping lisinopril/hydrochlorothiazide.",
  "evidence": "FDA drug label: \"Concomitant use can increase lithium levels and risk lithium toxicity.\" Source: https://open.fda.gov/apis/drug/label/",
  "sourceText": "Concomitant use can increase lithium levels and risk lithium toxicity.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T13:16:10.305Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:17:40.174Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Label provides only a brief warning without mechanistic or detailed management guidance; follow established lithium-monitoring protocols and consult full product labeling."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["lisinopril-and-hydrochlorothiazide-tablets__mtor-inhibitors"] = {
  "id": "lisinopril-and-hydrochlorothiazide-tablets__mtor-inhibitors",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "mTOR inhibitors"
  ],
  "normalizedDrugs": [
    "lisinopril-and-hydrochlorothiazide-tablets",
    "mtor-inhibitors"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "class-label",
  "clinicalConcern": "Concomitant use of lisinopril (an ACE inhibitor) with mTOR inhibitors may increase the risk of angioedema.",
  "mechanism": "The label does not specify a mechanism or pathophysiology for the increased angioedema risk.",
  "management": "Avoid the combination when possible; if coadministration is required, stop the ACE inhibitor immediately if angioedema occurs.",
  "monitoring": "Monitor patients for signs and symptoms of angioedema during concomitant therapy.",
  "counseling": "Instruct patients to seek immediate medical care for any facial, tongue, lip, throat swelling, difficulty breathing, or new hoarseness.",
  "evidence": "FDA drug labeling: \"Concomitant therapy with ... mTOR inhibitors may increase the risk of angioedema when given with an ACE inhibitor.\"",
  "sourceText": "Concomitant therapy with ... mTOR inhibitors may increase the risk of angioedema when given with an ACE inhibitor.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T13:16:10.304Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:17:50.981Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Source provides a single cautionary statement without incidence, severity details, or management guidance; consult full prescribing information or pharmacovigilance resources for more information."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["lisinopril-and-hydrochlorothiazide-tablets__neprilysin-inhibitors"] = {
  "id": "lisinopril-and-hydrochlorothiazide-tablets__neprilysin-inhibitors",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "Neprilysin inhibitors"
  ],
  "normalizedDrugs": [
    "lisinopril-and-hydrochlorothiazide-tablets",
    "neprilysin-inhibitors"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "class-label",
  "clinicalConcern": "Concomitant use of a neprilysin inhibitor with an ACE inhibitor (lisinopril-containing product) may increase the risk of angioedema.",
  "mechanism": "The source states an increased risk of angioedema but does not provide a mechanistic explanation.",
  "management": "Avoid coadministration of lisinopril-containing products and neprilysin inhibitors; if combined, discontinue the ACE inhibitor immediately at any sign of angioedema.",
  "monitoring": "Monitor patients closely for signs or symptoms of angioedema; the source does not specify timing or frequency.",
  "counseling": "Advise patients to seek emergency care immediately for facial/tongue/throat swelling or breathing difficulty and to stop the ACE inhibitor until evaluated.",
  "evidence": "FDA drug label (open.fda.gov): 'Concomitant therapy with neprilysin inhibitors ... may increase the risk of angioedema when given with an ACE inhibitor.'",
  "sourceText": "Concomitant therapy with neprilysin inhibitors ... may increase the risk of angioedema when given with an ACE inhibitor.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T13:16:10.304Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:18:05.212Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Based on the provided FDA label excerpt; no further details on magnitude, timing, or mechanism were included in the source."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["lisinopril-and-hydrochlorothiazide-tablets__nsaids-cox-2-inhibitors"] = {
  "id": "lisinopril-and-hydrochlorothiazide-tablets__nsaids-cox-2-inhibitors",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "NSAIDs / COX‑2 inhibitors"
  ],
  "normalizedDrugs": [
    "lisinopril-and-hydrochlorothiazide-tablets",
    "nsaids-cox-2-inhibitors"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "class-label",
  "clinicalConcern": "Concomitant use of NSAIDs with lisinopril plus hydrochlorothiazide can cause deterioration of renal function, including acute renal failure, and may blunt the antihypertensive effect.",
  "mechanism": "The label states the combination leads to renal deterioration and reduced antihypertensive effect; specific pathophysiologic details are not provided in the source.",
  "management": "Avoid routine co‑use when possible; if concomitant therapy is necessary, reassess risk versus benefit and manage only with close oversight.",
  "monitoring": "Check renal function (e.g., serum creatinine) and blood pressure after initiating or changing therapy and reassess frequently while combined.",
  "counseling": "Advise patients to avoid over‑the‑counter NSAIDs while taking lisinopril/HCTZ and to inform their prescriber promptly if they start NSAIDs or notice reduced urine output or worsening blood pressure control.",
  "evidence": "Statement from the FDA‑approved drug label (OpenFDA): combining NSAIDs with an ACE inhibitor and a diuretic can cause renal deterioration and may blunt antihypertensive effect.",
  "sourceText": "combining NSAIDs with an ACE inhibitor and a diuretic can cause deterioration of renal function, including acute renal failure, and may blunt the antihypertensive effect.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T13:16:10.304Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:18:15.770Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Derived directly from the cited FDA label; the label offers no additional details on mechanism or specific management steps."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["lisinopril-and-hydrochlorothiazide-tablets__potassium-sparing-diuretics-potassium-supplements-potassium-containing-salt-substitutes"] = {
  "id": "lisinopril-and-hydrochlorothiazide-tablets__potassium-sparing-diuretics-potassium-supplements-potassium-containing-salt-substitutes",
  "drugs": [
    "Lisinopril And Hydrochlorothiazide Tablets",
    "Potassium‑sparing diuretics; potassium supplements; potassium‑containing salt substitutes"
  ],
  "normalizedDrugs": [
    "lisinopril-and-hydrochlorothiazide-tablets",
    "potassium-sparing-diuretics-potassium-supplements-potassium-containing-salt-substitutes"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Lisinopril And Hydrochlorothiazide Tablets",
  "sourceDrugId": "lisinopril-and-hydrochlorothiazide",
  "confidence": "class-label",
  "clinicalConcern": "Concomitant use with potassium‑sparing diuretics, potassium supplements, or potassium‑containing salt substitutes can cause clinically significant hyperkalemia.",
  "mechanism": "Additive potassium‑retaining effects raise serum potassium concentration, increasing risk of hyperkalemia.",
  "management": "Avoid concomitant use; if coadministration is unavoidable, minimize other potassium sources and use extreme caution with dose selection.",
  "monitoring": "Measure serum potassium frequently while the drugs are combined.",
  "counseling": "Advise patients not to use potassium supplements or potassium‑containing salt substitutes and to report any use of such products; ensure they will have frequent potassium testing.",
  "evidence": "FDA‑approved product label for lisinopril/hydrochlorothiazide (OpenFDA) advises avoiding these agents and monitoring serum potassium.",
  "sourceText": "Avoid or use caution with potassium‑sparing diuretics (spironolactone, eplerenone, triamterene, amiloride), potassium supplements, or salt substitutes containing potassium; monitor serum potassium frequently.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T13:16:10.305Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:18:27.076Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Source text: 'Avoid or use caution with potassium‑sparing diuretics (spironolactone, eplerenone, triamterene, amiloride), potassium supplements, or salt substitutes containing potassium; monitor serum potassium frequently.' Severity: major."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["metformin__metoprolol"] = {
  "id": "metformin__metoprolol",
  "drugs": [
    "Metformin",
    "Metoprolol"
  ],
  "normalizedDrugs": [
    "metformin",
    "metoprolol"
  ],
  "severity": "moderate",
  "clinicalConcern": "Metoprolol can blunt adrenergic warning symptoms (eg, tremor and palpitations), making hypoglycemia harder to recognize.",
  "mechanism": "Metoprolol attenuates adrenergic responses, reducing tremor and palpitations that normally signal low blood glucose.",
  "management": "Continue both drugs when clinically indicated but reinforce glucose self-monitoring and hypoglycemia education.",
  "monitoring": "Monitor blood glucose patterns, especially when meals are missed, exercise changes, or diabetes therapy is intensified.",
  "counseling": "Advise patients that beta‑blockers may mask tremor and palpitations; recommend more frequent glucose checks and watching for sweating, confusion, hunger, or unusual tiredness as hypoglycemia signs.",
  "evidence": "MedLens seed interaction: beta‑blockers may mask adrenergic hypoglycemia symptoms and recommend strengthened monitoring and education.",
  "source": "MedLens seed interaction",
  "sourceText": "Beta-blockers may make hypoglycemia harder to recognize.\nMetoprolol can blunt adrenergic warning symptoms such as tremor and palpitations.\nContinue when clinically indicated, but strengthen glucose self-monitoring and hypoglycemia education.\nMonitor blood glucose patterns, especially when meals are missed, exercise changes, or diabetes therapy is intensified.\nSweating, confusion, hunger, and unusual tiredness can still signal low blood sugar even if palpitations are absent.",
  "updatedAt": "2026-09-01T09:31:15.047Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:11:37.669Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Reassess interaction importance when diabetes therapy, exercise habits, or meal patterns change."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["metformin__metronidazole"] = {
  "id": "metformin__metronidazole",
  "drugs": [
    "Metronidazole",
    "Metformin"
  ],
  "normalizedDrugs": [
    "metformin",
    "metronidazole"
  ],
  "severity": "moderate",
  "clinicalConcern": "Possible increased risk of metformin‑associated lactic acidosis when metronidazole is coadministered, particularly in patients with reduced metformin clearance or impaired tissue oxygenation.",
  "mechanism": "Risk likely arises from metformin accumulation when renal clearance is reduced or when tissue oxygenation is impaired during acute illness, dehydration, sepsis, or heavy alcohol use.",
  "management": "Use caution and consider temporarily holding metformin during acute systemic illness, dehydration, sepsis, significant alcohol use, or any renal impairment when clinically appropriate.",
  "monitoring": "Monitor renal function and watch for signs of lactic acidosis such as severe weakness, muscle pain, abdominal pain, rapid breathing, or unusual drowsiness.",
  "counseling": "Advise patients to stay hydrated, report the above symptoms immediately, and seek urgent care if they develop signs suggestive of lactic acidosis.",
  "evidence": "MedLens seed interaction (moderate): notes a possible increased risk of lactic acidosis in susceptible patients and identifies renal impairment, acute illness, dehydration, sepsis, and alcohol use as key risk modifiers.",
  "source": "MedLens seed interaction",
  "sourceText": "Possible increased risk of lactic acidosis in susceptible patients.\nThe concern is greatest when acute illness, dehydration, sepsis, alcohol use, or renal impairment reduces metformin clearance or tissue oxygenation.\nUse caution in patients with renal impairment or acute systemic illness. Consider temporarily holding metformin when clinically appropriate.\nMonitor renal function and symptoms such as severe weakness, muscle pain, abdominal distress, rapid breathing, or unusual sleepiness.\nMaintain hydration and seek urgent care for symptoms suggestive of lactic acidosis.",
  "updatedAt": "2026-09-01T09:31:15.047Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:11:47.268Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Conservative summary based solely on the provided MedLens seed interaction; no additional sources were reviewed."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["metformin-hcl__nifedipine"] = {
  "id": "metformin-hcl__nifedipine",
  "drugs": [
    "Metformin Hcl",
    "Nifedipine"
  ],
  "normalizedDrugs": [
    "metformin-hcl",
    "nifedipine"
  ],
  "type": "exact-pair",
  "severity": "moderate",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Metformin Hcl",
  "sourceDrugId": "metformin-hcl",
  "confidence": "exact-label",
  "clinicalConcern": "Coadministration modestly increases metformin exposure (Cmax ~20%, AUC ~9%), which may increase metformin-related adverse effects in vulnerable patients.",
  "mechanism": "Pharmacokinetic interaction: nifedipine raises metformin plasma concentrations (Cmax ≈20%, AUC ≈9%) as reported in the label; specific mechanism not specified.",
  "management": "Be alert for metformin intolerance and reassess metformin dose if symptoms occur or clinical status changes; adjust dose only if clinically indicated.",
  "monitoring": "Monitor renal function, glycemic control, and for signs of metformin adverse effects after initiating or changing nifedipine therapy.",
  "counseling": "Tell patients to report new or worsening gastrointestinal symptoms or other signs of drug intolerance and to attend routine renal and glycemic monitoring.",
  "evidence": "FDA drug label pharmacokinetic data: metformin Cmax increased ~20% and AUC increased ~9% when coadministered with nifedipine.",
  "sourceText": "increased metformin Cmax (~20%) and AUC (~9%)",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:49:28.568Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:11:57.412Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Data derive from labeling PK results only; clinical significance is not defined in the label, so use caution in patients with reduced renal function or symptoms."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["metronidazole__warfarin"] = {
  "id": "metronidazole__warfarin",
  "drugs": [
    "Warfarin",
    "Metronidazole"
  ],
  "normalizedDrugs": [
    "metronidazole",
    "warfarin"
  ],
  "severity": "major",
  "clinicalConcern": "Marked INR elevation and serious bleeding may occur when metronidazole is coadministered with warfarin.",
  "mechanism": "Metronidazole can inhibit warfarin metabolism, increasing anticoagulant exposure.",
  "management": "Avoid the combination if a reasonable alternative exists; if used, prescriber should consider warfarin dose adjustment and arrange closer INR follow-up.",
  "monitoring": "Check INR more frequently during therapy and shortly after stopping metronidazole, and monitor for signs of bleeding.",
  "counseling": "Advise patients to report nosebleeds, gum bleeding, dark urine, black stools, or unusual bruising promptly.",
  "evidence": "MedLens seed interaction reporting marked INR elevation and serious bleeding with this combination.",
  "source": "MedLens seed interaction",
  "sourceText": "Marked INR elevation and serious bleeding may occur.\nMetronidazole can inhibit warfarin metabolism, increasing anticoagulant exposure.\nAvoid if a reasonable alternative exists. If used together, arrange closer INR follow-up and consider warfarin dose adjustment under prescriber supervision.\nCheck INR more frequently during therapy and shortly after metronidazole is stopped. Watch for bleeding symptoms.\nReport nosebleeds, gum bleeding, dark urine, black stools, or unusual bruising promptly.",
  "updatedAt": "2026-09-01T09:31:15.047Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:12:06.779Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Classified as major in MedLens; ensure prescriber-directed dose adjustments and close INR monitoring if combination cannot be avoided."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["monoamine-oxidase-inhibitors-maois__sertraline"] = {
  "id": "monoamine-oxidase-inhibitors-maois__sertraline",
  "drugs": [
    "Sertraline",
    "monoamine oxidase inhibitors (MAOIs)"
  ],
  "normalizedDrugs": [
    "monoamine-oxidase-inhibitors-maois",
    "sertraline"
  ],
  "type": "class-level",
  "severity": "contraindicated",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "class-label",
  "clinicalConcern": "Combining sertraline with MAOIs can cause life‑threatening serotonin syndrome.",
  "mechanism": "Concurrent use increases overall serotonergic activity and can precipitate serotonin syndrome.",
  "management": "Avoid coadministration; do not start an MAOI in a patient taking sertraline or vice versa and consult the prescriber for alternatives.",
  "monitoring": "If exposure occurs, monitor closely for clinical signs of serotonin syndrome and obtain urgent evaluation if suspected.",
  "counseling": "Tell patients not to take sertraline with MAOIs and to seek immediate medical attention for any symptoms suggestive of serotonin syndrome.",
  "evidence": "Source: FDA drug label (open.fda.gov/apis/drug/label/) — 'Combining sertraline with monoamine oxidase inhibitors (MAOIs) ... can cause life‑threatening serotonin syndrome.'",
  "sourceText": "Combining sertraline with monoamine oxidase inhibitors (MAOIs) ... can cause life‑threatening serotonin syndrome.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:48:25.603Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:12:16.162Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Label lists this combination as contraindicated due to risk of life‑threatening serotonin syndrome; the provided source text is limited to this statement."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["nitroglycerin__sildenafil"] = {
  "id": "nitroglycerin__sildenafil",
  "drugs": [
    "Sildenafil",
    "Nitroglycerin"
  ],
  "normalizedDrugs": [
    "nitroglycerin",
    "sildenafil"
  ],
  "severity": "contraindicated",
  "clinicalConcern": "Severe, potentially life-threatening hypotension when sildenafil and nitroglycerin are combined.",
  "mechanism": "Additive vasodilation via increased nitric oxide-cGMP signaling.",
  "management": "Contraindicated: do not combine sildenafil and nitroglycerin; review emergency chest-pain plans with the prescriber regarding safe alternatives and timing.",
  "monitoring": "If accidental co-use occurs, urgently monitor blood pressure and symptoms in a medical setting.",
  "counseling": "Tell patients not to take nitroglycerin (or other nitrates) after sildenafil and to inform emergency clinicians and prescribers about recent sildenafil use if chest pain occurs.",
  "evidence": "Source: MedLens seed interaction; documents severe, potentially life-threatening hypotension from additive nitric oxide-cGMP effects.",
  "source": "MedLens seed interaction",
  "sourceText": "Severe, potentially life-threatening hypotension.\nBoth medicines increase nitric oxide-cGMP signaling, causing additive vasodilation.\nDo not combine. Nitrates should not be used within the clinically relevant window after sildenafil; emergency chest pain plans should be reviewed with the prescriber.\nIf accidental co-use occurs, monitor blood pressure and symptoms urgently in a medical setting.\nNever use nitroglycerin for chest pain after sildenafil unless emergency clinicians know about the recent dose.",
  "updatedAt": "2026-09-01T09:31:15.048Z",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:12:32.859Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "The source references a 'clinically relevant window' after sildenafil but does not specify timing; confirm exact nitrate-free interval from product labeling or the prescriber."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["nonsteroidal-anti-inflammatory-agents__warfarin"] = {
  "id": "nonsteroidal-anti-inflammatory-agents__warfarin",
  "drugs": [
    "Warfarin",
    "Nonsteroidal Anti-Inflammatory Agents"
  ],
  "normalizedDrugs": [
    "nonsteroidal-anti-inflammatory-agents",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "class-label",
  "clinicalConcern": "The FDA label lists nonsteroidal anti-inflammatory agents as interacting with warfarin and indicates a major interaction; the provided excerpt does not specify the clinical effects.",
  "mechanism": "The supplied label fragment only names the drug class and does not describe a mechanism of interaction.",
  "management": "Prefer avoiding concurrent use when possible; if unavoidable, reassess therapy and consult the prescriber for alternatives.",
  "monitoring": "Increase clinical vigilance and consider more frequent INR checks and assessment for bleeding, since specific monitoring guidance was not provided in the excerpt.",
  "counseling": "Instruct patients to report any new bleeding, bruising, or other concerning symptoms and to inform all healthcare providers and pharmacists before taking any NSAID, including OTC products.",
  "evidence": "Source: FDA drug labeling listing 'Nonsteroidal Anti-Inflammatory Agents' as an interaction with warfarin; no further details were included in the supplied text.",
  "sourceText": "Nonsteroidal Anti-Inflammatory Agents",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:42:32.087Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:13:22.883Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "This card is based solely on the brief label fragment provided and lacks interaction specifics; review the full product labeling or clinical references for detailed guidance."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["other-serotonergic-drugs__sertraline"] = {
  "id": "other-serotonergic-drugs__sertraline",
  "drugs": [
    "Sertraline",
    "other serotonergic drugs"
  ],
  "normalizedDrugs": [
    "other-serotonergic-drugs",
    "sertraline"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "class-label",
  "clinicalConcern": "Concomitant use of sertraline with other serotonergic drugs increases the risk of serotonin syndrome, a potentially life‑threatening condition.",
  "mechanism": "The supplied label statement does not specify a mechanism; the interaction is reported as an increased risk of serotonin syndrome with combined serotonergic agents.",
  "management": "Avoid combining sertraline with other serotonergic drugs when possible; if combination is necessary, reassess risks versus benefits and monitor closely.",
  "monitoring": "Monitor patients for new or worsening signs of serotonin syndrome and discontinue serotonergic agents promptly if syndrome is suspected.",
  "counseling": "Tell patients to inform clinicians about all serotonergic medicines and to seek immediate care for symptoms such as rapid temperature rise, marked agitation, severe stiffness, confusion, or other sudden neurologic changes.",
  "evidence": "Source: FDA drug labeling (open.fda) — clinical statement: 'Increased risk of serotonin syndrome.'",
  "sourceText": "Increased risk of serotonin syndrome",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:48:25.606Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:13:33.967Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "The supplied label provides only a brief risk statement without incidence, onset, or specific management details; consult individual product labels or clinical guidelines for washout intervals and detailed recommendations."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["phenytoin-and-fosphenytoin__sertraline"] = {
  "id": "phenytoin-and-fosphenytoin__sertraline",
  "drugs": [
    "Sertraline",
    "phenytoin (and fosphenytoin)"
  ],
  "normalizedDrugs": [
    "phenytoin-and-fosphenytoin",
    "sertraline"
  ],
  "type": "exact-pair",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "exact-label",
  "clinicalConcern": "Sertraline may increase phenytoin concentrations, which could raise the risk of phenytoin toxicity; effect on fosphenytoin is not specified in the label.",
  "mechanism": "The FDA label reports an increase in phenytoin concentrations with sertraline but does not specify a mechanism.",
  "management": "Monitor and adjust phenytoin therapy as needed when starting, stopping, or changing sertraline; exercise caution and consider dose adjustment based on levels and clinical status.",
  "monitoring": "Obtain baseline and follow-up phenytoin serum concentrations after sertraline initiation, discontinuation, or dose changes, and watch for signs of phenytoin toxicity (eg, ataxia, nystagmus, confusion).",
  "counseling": "Instruct patients to report symptoms of phenytoin toxicity (unsteady gait, vision changes, confusion) and to not change or stop medications without consulting their clinician.",
  "evidence": "FDA drug label (provided source) states that sertraline may increase phenytoin concentrations (https://open.fda.gov/apis/drug/label/).",
  "sourceText": "Phenytoin ... sertraline may increase phenytoin concentrations",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:48:25.606Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:13:42.490Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Label information is brief and lacks quantitative effect size or mechanism; manage conservatively and update guidance if pharmacokinetic data become available."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["pimozide__sertraline"] = {
  "id": "pimozide__sertraline",
  "drugs": [
    "Sertraline",
    "pimozide"
  ],
  "normalizedDrugs": [
    "pimozide",
    "sertraline"
  ],
  "type": "exact-pair",
  "severity": "contraindicated",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "exact-label",
  "clinicalConcern": "FDA labeling states sertraline and pimozide are contraindicated and should not be used together.",
  "mechanism": "The label provides no mechanistic explanation for this contraindication.",
  "management": "Avoid prescribing or dispensing sertraline with pimozide and choose an alternative therapy.",
  "monitoring": "The source gives no monitoring recommendations; prevention by avoiding the combination is the priority.",
  "counseling": "Tell patients not to take sertraline and pimozide together and to report all current medications to their clinician.",
  "evidence": "FDA drug label: \"Do not use sertraline together with pimozide.\" (source: https://open.fda.gov/apis/drug/label/)",
  "sourceText": "Do not use sertraline together with pimozide.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:48:25.606Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:13:49.531Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Recommendation is based solely on the FDA label statement; no additional details or rationale are provided in the source."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["qt-prolonging-drugs__sertraline"] = {
  "id": "qt-prolonging-drugs__sertraline",
  "drugs": [
    "Sertraline",
    "QT‑prolonging drugs"
  ],
  "normalizedDrugs": [
    "qt-prolonging-drugs",
    "sertraline"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "class-label",
  "clinicalConcern": "Concomitant use may produce additive QT interval prolongation and increase the risk of torsades de pointes.",
  "mechanism": "Additive effects on cardiac repolarization causing QT prolongation that can predispose to torsades de pointes.",
  "management": "Avoid coadministration when possible; if unavoidable, prefer non–QT‑prolonging alternatives or seek specialist input.",
  "monitoring": "If combination cannot be avoided, monitor for QT prolongation and clinical signs of ventricular arrhythmia.",
  "counseling": "Tell patients that combining sertraline with other QT‑prolonging drugs can raise the risk of dangerous heart rhythms and to report palpitations, fainting, or lightheadedness promptly.",
  "evidence": "FDA prescribing information: 'Potential additive QT prolongation and risk of torsades de pointes; Avoid combinations when possible.'",
  "sourceText": "Potential additive QT prolongation and risk of torsades de pointes Avoid combinations when possible.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:48:25.607Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:13:59.272Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Summary based solely on the label statement; magnitude of risk and drug-specific interactions are not detailed here—consult full product labels and clinical judgment."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["serotonin-reuptake-inhibitors__warfarin"] = {
  "id": "serotonin-reuptake-inhibitors__warfarin",
  "drugs": [
    "Warfarin",
    "Serotonin Reuptake Inhibitors"
  ],
  "normalizedDrugs": [
    "serotonin-reuptake-inhibitors",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "class-label",
  "clinicalConcern": "Major interaction reported between warfarin and serotonin reuptake inhibitors; the provided source text lists the drug class only and gives no clinical details.",
  "mechanism": "Not specified in the provided source text.",
  "management": "No specific management guidance in the source; consult full prescribing information or interaction databases before co-prescribing and prefer alternatives if deemed safer.",
  "monitoring": "Source provides no monitoring instructions; review detailed references and consider closer INR surveillance if coadministration is used.",
  "counseling": "Tell patients to report any new bleeding, bruising, or unusual symptoms and to inform all prescribers before starting or stopping serotonergic drugs or warfarin.",
  "evidence": "Source: FDA drug labeling index entry 'Serotonin Reuptake Inhibitors' (open.fda.gov); the supplied excerpt contained only the class name without supporting data.",
  "sourceText": "Serotonin Reuptake Inhibitors",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": true,
  "extractedAt": "2026-09-01T10:42:32.088Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:14:11.600Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Severity listed as major; clinicians should review full product labels and current interaction resources to determine specific recommendations for management and monitoring."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["sertraline__warfarin"] = {
  "id": "sertraline__warfarin",
  "drugs": [
    "Sertraline",
    "warfarin"
  ],
  "normalizedDrugs": [
    "sertraline",
    "warfarin"
  ],
  "type": "exact-pair",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Sertraline",
  "sourceDrugId": "sertraline",
  "confidence": "exact-label",
  "clinicalConcern": "Sertraline can interact with warfarin and may alter anticoagulation control, potentially requiring warfarin dose changes.",
  "mechanism": "Not specified in the provided FDA label.",
  "management": "Increase frequency of INR monitoring and adjust the warfarin dose as indicated by INR results.",
  "monitoring": "Obtain INR more frequently after initiating, changing, or stopping sertraline and adjust warfarin per INR.",
  "counseling": "Advise the patient that sertraline may affect warfarin dosing; they should expect more frequent INR checks and promptly report any unusual bleeding or bruising.",
  "evidence": "FDA drug label statement: 'For warfarin, monitor INR more frequently and adjust warfarin dose as needed.' (source: open.fda drug labeling).",
  "sourceText": "For warfarin, monitor INR more frequently and adjust warfarin dose as needed.",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:48:25.606Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:14:21.551Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Major interaction per source; label recommends closer INR monitoring and dose adjustment; mechanism not described in the provided text."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["st-john-s-wort__warfarin"] = {
  "id": "st-john-s-wort__warfarin",
  "drugs": [
    "Warfarin",
    "St. John's wort"
  ],
  "normalizedDrugs": [
    "st-john-s-wort",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "exact-label",
  "clinicalConcern": "The provided FDA label excerpt lists a major interaction between warfarin and St. John's wort but gives no clinical details in the excerpt.",
  "mechanism": "The source text contains only the name 'St. John's wort' and does not specify a mechanism for the interaction.",
  "management": "Prefer avoiding concomitant use when possible; if coadministration is considered necessary, involve the prescriber and plan enhanced monitoring.",
  "monitoring": "No monitoring recommendations are given in the source; because the interaction is classified as major, obtain baseline and perform more frequent INR checks if the drugs are used together.",
  "counseling": "Advise patients to tell all clinicians and pharmacists before starting or stopping St. John's wort and to seek medical advice rather than changing warfarin therapy on their own.",
  "evidence": "Source: FDA drug label API entry; the provided excerpt contains only the term 'St. John's wort' with no supporting details or citations.",
  "sourceText": "St. John’s wort",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:42:32.088Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:14:30.459Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Information in this excerpt is limited; confirm specifics (mechanism, magnitude, and formal recommendations) by reviewing the full product labels and authoritative interaction references before making clinical decisions."
  }
};

window.MEDLENS_INTERACTIONS_DATABASE["vitamin-k-foods__warfarin"] = {
  "id": "vitamin-k-foods__warfarin",
  "drugs": [
    "Warfarin",
    "Vitamin K (foods)"
  ],
  "normalizedDrugs": [
    "vitamin-k-foods",
    "warfarin"
  ],
  "type": "class-level",
  "severity": "major",
  "sourceType": "FDA label-derived",
  "sourceDrug": "Warfarin",
  "sourceDrugId": "warfarin-sodium",
  "confidence": "exact-label",
  "clinicalConcern": "Dietary vitamin K may alter warfarin therapy and thus affect anticoagulation control.",
  "mechanism": "The label only states that the amount of vitamin K in food may affect warfarin therapy; no detailed mechanism is provided in the source.",
  "management": "Maintain consistent dietary vitamin K and consult the prescriber or anticoagulation service before making major dietary changes or altering warfarin dosing.",
  "monitoring": "Monitor anticoagulation status per local clinical protocols; the label provides no specific monitoring instructions.",
  "counseling": "Advise patients to keep vitamin K intake steady and to inform their clinician or anticoagulation clinic of any substantial dietary changes.",
  "evidence": "FDA drug labeling: 'The amount of vitamin K in food may affect therapy with warfarin sodium.' Source: https://open.fda.gov/apis/drug/label/",
  "sourceText": "The amount of vitamin K in food may affect therapy with warfarin sodium",
  "source": "https://open.fda.gov/apis/drug/label/",
  "sourceUrl": "https://open.fda.gov/apis/drug/label/",
  "classMembers": [],
  "needsReview": false,
  "extractedAt": "2026-09-01T10:42:32.088Z",
  "extractorVersion": "medlens-interactions-label-extractor-v1",
  "editor": {
    "provider": "OpenAI",
    "model": "gpt-5-mini",
    "editedAt": "2026-09-01T13:14:45.124Z",
    "editorVersion": "medlens-interactions-ai-editor-v1-structured",
    "reviewNote": "Source statement is brief and nonspecific with no quantitative guidance; follow institutional anticoagulation policies for detailed management."
  }
};
