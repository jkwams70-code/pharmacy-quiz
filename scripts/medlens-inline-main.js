
    const embeddedDrugs = [
        {
            id: 'salb',
            brand: 'Ventolin',
            generic: 'Salbutamol / Albuterol',
            icon: '&#x1F48A;',
            hasPediatric: true,
            overview: `<p><strong>Salbutamol (albuterol)</strong> is a short-acting beta2-adrenergic agonist used for rapid relief of bronchospasm in asthma and other reversible obstructive airway conditions. Its bronchodilator effect is fast, making it useful for symptom relief and for acute deterioration when prompt airway opening is needed.</p><p>Salbutamol acts on bronchial smooth muscle to reduce airway resistance and improve ventilation. It does <strong>not</strong> treat the underlying airway inflammation of asthma, so it should be used within an ICS-containing asthma strategy rather than as stand-alone long-term therapy.</p><p>Increasing reliever need, reduced duration of effect, or poor response should prompt reassessment of asthma control, inhaler technique, adherence, and anti-inflammatory treatment.</p>`,
            dose: {
                adult: `<table class="dose-table"><tr><th>Use</th><th>Dose</th><th>Notes</th></tr><tr><td>Relief or prevention of bronchospasm</td><td>1-2 inhalations</td><td>Every 4-6 hours as needed</td></tr><tr><td>Common labeled dose</td><td>2 inhalations</td><td>Every 4-6 hours as needed</td></tr><tr><td>Some patients</td><td>1 inhalation</td><td>Every 4 hours may be sufficient</td></tr><tr><td>Exercise-induced bronchoconstriction</td><td>2 inhalations</td><td>15-30 minutes before exercise</td></tr><tr><td>Acute asthma exacerbation</td><td>4-10 puffs by pMDI with spacer</td><td>Every 20 minutes for up to 3 doses in the first hour</td></tr></table>`,
                pediatric: `<table class="dose-table"><tr><th>Use</th><th>Dose</th><th>Notes</th></tr><tr><td>Children 4 years and older</td><td>1-2 inhalations</td><td>Every 4-6 hours as needed</td></tr><tr><td>Exercise-induced bronchoconstriction</td><td>2 inhalations</td><td>15-30 minutes before exercise</td></tr><tr><td>Children 6-11 years, acute exacerbation</td><td>4-10 puffs by pMDI with spacer</td><td>Every 20 minutes for the first hour, then reassess</td></tr><tr><td>Children 5 years and younger, acute wheeze/asthma</td><td>4+ puffs via pMDI with spacer or 2.5 mg by nebulizer</td><td>May repeat every 20 minutes for up to 3 doses</td></tr></table>`
            },
            sideEffects: `<p><strong>Common adverse effects</strong> include tremor, nervousness, headache, palpitations, tachycardia, muscle cramps, throat irritation, cough, and dizziness. These effects are usually dose-related and more noticeable with frequent use.</p><p><strong>Metabolic effects</strong> may include hypokalemia and hyperglycemia, particularly when higher or repeated doses are required.</p><p><strong>Rare but serious reactions</strong> include paradoxical bronchospasm, hypersensitivity reactions, significant tachyarrhythmia, and severe hypokalemia.</p>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&#x26A0; Excessive Use</div><div class="warning-box-body">Frequent salbutamol use may indicate worsening asthma and inadequate anti-inflammatory treatment. The need for repeated doses should trigger reassessment rather than simple escalation of reliever use.</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; SABA-Only Therapy</div><div class="warning-box-body">Salbutamol should not be used as the only long-term asthma treatment. ICS-containing therapy is required to reduce airway inflammation and exacerbation risk.</div></div><ul><li>Use cautiously in ischemic heart disease, arrhythmias, hypertension, and hyperthyroidism</li><li>High-dose therapy may lower serum potassium</li><li>Use caution with non-selective beta-blockers, MAO inhibitors, tricyclic antidepressants, other sympathomimetics, and non-potassium-sparing diuretics</li><li>Monitor glucose in patients with diabetes if high doses are needed</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Hypersensitivity</strong> to salbutamol/albuterol or any component of the formulation</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Product-specific contraindications, including excipients such as lactose in some dry-powder products, should be checked carefully</div></div>`,
            formulation: `<table class="dose-table"><tr><th>Form</th><th>Common Strengths</th></tr><tr><td>Metered-dose inhaler</td><td>100 micrograms per actuation</td></tr><tr><td>Nebulizer solution</td><td>2.5 mg/2.5 mL, 2.5 mg/3 mL, 5 mg/mL concentrated solution</td></tr><tr><td>Dry powder inhaler</td><td>Available in some markets</td></tr><tr><td>Oral preparations</td><td>Tablets and syrup in some countries</td></tr></table>`
        },
        {
            id: 'budeform',
            brand: 'Symbicort',
            generic: 'Budesonide / Formoterol',
            class: 'ICS/LABA',
            icon: '&#x1F48A;',
            hasPediatric: true,
            overview: `<p><strong>Budesonide/formoterol</strong> combines an inhaled corticosteroid (ICS) with a rapid-onset long-acting &beta;<sub>2</sub>-agonist (LABA). Budesonide suppresses airway inflammation while formoterol relaxes bronchial smooth muscle and produces rapid, prolonged bronchodilation.</p><p>This combination provides anti-inflammatory control, rapid bronchodilation, improved lung function, reduced symptoms, and fewer severe exacerbations. Because formoterol has a rapid onset of action, low-dose budesonide/formoterol can be used as an anti-inflammatory reliever (AIR) and as maintenance-and-reliever therapy (MART).</p><p>GINA 2026 recommends ICS-formoterol as the preferred reliever strategy for many patients with asthma. Dose interpretation matters: some products present the metered dose while others present the delivered dose.</p>`,
            dose: {
                adult: `<p><strong>Asthma &mdash; AIR-only, GINA 2026</strong></p><p><strong>Adults &ge;18 years:</strong> budesonide/formoterol 160mcg/4.5mcg delivered per inhalation (200mcg/6mcg metered).</p><ul><li><strong>Step 1&ndash;2:</strong> 1 inhalation PRN for symptoms</li><li>If symptoms persist after a few minutes: 1 additional inhalation PRN</li><li>May also take 1 inhalation before exercise or anticipated allergen exposure</li><li><strong>Maximum:</strong> 12 inhalations/24 hr</li></ul><p><strong>Asthma &mdash; MART, GINA 2026</strong></p><ul><li><strong>Step 3:</strong> 1 inhalation once daily or BID + 1 inhalation PRN</li><li><strong>Step 4&ndash;5:</strong> 2 inhalations BID + 1 inhalation PRN</li><li><strong>Maximum:</strong> 12 inhalations/24 hr, including both maintenance and PRN doses</li></ul><p><strong>Alternative lower-strength formulation</strong> may use 80mcg/2.25mcg delivered per inhalation (100mcg/3mcg metered).</p><p><strong>Conventional Symbicort maintenance dosing</strong> for patients &ge;12 years: 80mcg/4.5mcg or 160mcg/4.5mcg, 2 inhalations BID about 12 hr apart. Symbicort 160mcg/4.5mcg 2 inhalations BID is also used for COPD maintenance.</p>`,
                pediatric: `<p><strong>Children 6&ndash;11 years &mdash; GINA 2026 AIR/MART</strong></p><p><strong>Strength:</strong> budesonide/formoterol 80mcg/4.5mcg delivered per inhalation (100mcg/6mcg metered).</p><ul><li><strong>Step 1&ndash;2:</strong> 1 inhalation PRN; if needed, 1 additional inhalation PRN</li><li><strong>Maximum:</strong> 8 inhalations/24 hr</li><li><strong>Step 3:</strong> 1 inhalation once daily + 1 inhalation PRN</li><li><strong>Step 4:</strong> 1 inhalation BID + 1 inhalation PRN</li></ul><p><strong>Children 6 to &lt;12 years &mdash; U.S. Symbicort maintenance label:</strong> 80mcg/4.5mcg, 2 inhalations BID.</p><p><strong>Adolescents 12&ndash;17 years &mdash; GINA 2026</strong> use 160mcg/4.5mcg delivered per inhalation (200mcg/6mcg metered): 1 inhalation PRN for Step 1&ndash;2, 1 inhalation once daily or BID + 1 inhalation PRN for Step 3, and 2 inhalations BID + 1 inhalation PRN for Step 4&ndash;5. Maximum: 12 inhalations/24 hr.</p><p><strong>Adolescents &ge;12 years &mdash; U.S. maintenance label:</strong> 80mcg/4.5mcg or 160mcg/4.5mcg, 2 inhalations BID.</p>`,
            },
            sideEffects: `<p><strong>Common</strong> adverse effects include headache, nasopharyngitis, throat irritation, cough, dysphonia, oral candidiasis, tremor, palpitations, nervousness, and muscle cramps.</p><p><strong>Budesonide-related</strong> effects include oropharyngeal candidiasis, adrenal suppression, hypercorticism, reduced bone mineral density, cataracts, glaucoma, and increased infection susceptibility.</p><p><strong>Formoterol-related</strong> effects include tachycardia, palpitations, tremor, arrhythmias, hypokalemia, hyperglycemia, headache, and muscle cramps.</p><p><strong>Rare/serious</strong> reactions include paradoxical bronchospasm, severe hypersensitivity or anaphylaxis, significant arrhythmias, severe hypokalemia, and adrenal insufficiency.</p>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&bull; Do Not Use With Another LABA</div><div class="warning-box-body">Avoid concurrent therapy with any other LABA-containing product because of the risk of formoterol overdose and cardiovascular adverse effects.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Acute Severe Asthma</div><div class="warning-box-body">Do not initiate conventional maintenance Symbicort as the primary treatment of status asthmaticus or rapidly deteriorating asthma. AIR/MART use is different from fixed maintenance dosing.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Oral Candidiasis</div><div class="warning-box-body">Budesonide can cause Candida infection of the mouth and pharynx. Rinse mouth with water and spit out after maintenance inhalations.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Cardiovascular Effects</div><div class="warning-box-body">Use cautiously in coronary artery disease, arrhythmias, hypertension, cardiomyopathy, or QT-prolongation risk.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Hypokalemia and Hyperglycemia</div><div class="warning-box-body">Beta<sub>2</sub>-agonists may shift potassium intracellularly and may increase blood glucose. Risk is higher with high doses, diuretics, systemic corticosteroids, hypoxemia, or poorly controlled diabetes.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Strong CYP3A4 Inhibitors</div><div class="warning-box-body">Strong CYP3A4 inhibitors may increase systemic budesonide exposure and corticosteroid toxicity.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Bone Mineral Density</div><div class="warning-box-body">Long-term ICS therapy may reduce bone mineral density. Consider monitoring in patients with osteoporosis risk factors.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Glaucoma/Cataracts</div><div class="warning-box-body">Long-term corticosteroid exposure may increase the risk of cataracts, glaucoma, and elevated intraocular pressure.</div></div><ul><li>Monitor for paradoxical bronchospasm after inhalation</li><li>Increasing reliever requirement should prompt reassessment rather than repeated unsupervised dosing</li><li>Take care when transferring patients from chronic systemic corticosteroids</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Hypersensitivity</strong> to budesonide, formoterol, or any formulation component</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Primary treatment of status asthmaticus</strong> or other acute episodes requiring intensive emergency treatment</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Product-specific contraindications may differ between pMDI and DPI formulations</div></div>`,
            formulation: `<p><strong>Symbicort pMDI:</strong> 80mcg budesonide/4.5mcg formoterol and 160mcg budesonide/4.5mcg formoterol per actuation.</p><p><strong>Common GINA AIR/MART strengths:</strong> children 6&ndash;11 years use 80mcg/4.5mcg delivered (100mcg/6mcg metered); adults and adolescents use 160mcg/4.5mcg delivered (200mcg/6mcg metered).</p><p><strong>Important:</strong> metered and delivered doses differ between devices and are not interchangeable by assumption.</p>`
        },
        {
            id: 'salme',
            brand: 'Serevent Diskus',
            generic: 'Salmeterol',
            class: 'LABA',
            icon: '&#x1F48A;',
            hasPediatric: true,
            overview: `<p><strong>Salmeterol</strong> is a long-acting selective &beta;<sub>2</sub>-adrenergic receptor agonist that produces prolonged bronchodilation by relaxing bronchial smooth muscle.</p><p>It stimulates &beta;<sub>2</sub> receptors, activating adenylate cyclase and increasing intracellular cAMP. Unlike formoterol, salmeterol has a slower onset of action and must not be used as a reliever medication.</p><p>For asthma, salmeterol must be used with an inhaled corticosteroid. When both an ICS and LABA are needed, a fixed-dose ICS/LABA combination is generally preferred because it helps ensure the corticosteroid is taken with the LABA.</p>`,
            dose: {
                adult: `<p><strong>Asthma &mdash; maintenance:</strong> 50mcg inhaled q12h.</p><p>Administer 1 inhalation of Serevent Diskus 50mcg BID, approximately 12 hr apart. Maximum: 100mcg/day. Must be administered with concomitant ICS therapy.</p><p><strong>Exercise-induced bronchospasm prevention:</strong> 50mcg inhaled once at least 30 min before exercise. Do not repeat within 12 hr, and do not give an additional pre-exercise dose if the patient already receives 50mcg BID.</p><p><strong>COPD maintenance:</strong> 50mcg inhaled q12h for chronic bronchitis, emphysema, or COPD. Not indicated for acute COPD bronchospasm.</p><p><strong>Acute bronchospasm:</strong> no dose &mdash; do not use salmeterol for acute symptom relief. Use an appropriate rapid-acting bronchodilator instead.</p><p><strong>Renal impairment:</strong> no specific routine dosage adjustment established. <strong>Hepatic impairment:</strong> no specific adjustment is established, but use cautiously because systemic exposure may increase.</p><p><strong>Administration:</strong> route is oral inhalation only. Do not swallow the medication, do not exceed 1 inhalation BID, keep the Diskus dry, and do not wash the device.</p>`,
                pediatric: `<p><strong>Children &ge;4 years &mdash; asthma maintenance:</strong> 50mcg inhaled q12h.</p><p>Administer 1 inhalation of Serevent Diskus 50mcg BID, approximately 12 hr apart. Maximum: 100mcg/day. Must be administered with concomitant ICS therapy.</p><p><strong>Exercise-induced bronchospasm prevention:</strong> 50mcg inhaled once at least 30 min before exercise. Do not repeat within 12 hr, and do not add an extra pre-exercise dose if the child already receives 50mcg BID.</p><p><strong>Children &lt;4 years:</strong> safety and efficacy are not established for Serevent Diskus.</p><p><strong>Acute asthma:</strong> no dose &mdash; not indicated for acute symptom relief. Use an appropriate rapid-acting reliever according to the child's asthma action plan.</p><p><strong>Renal/hepatic impairment:</strong> no specific pediatric dosage adjustment is established, but use cautiously if hepatic impairment may increase exposure.</p>`,
            },
            sideEffects: `<p><strong>Common</strong> effects include headache, tremor, palpitations, tachycardia, nervousness, dizziness, muscle cramps, cough, throat irritation, and nasal congestion.</p><p><strong>Cardiovascular</strong> effects include tachycardia, palpitations, increased blood pressure, arrhythmias, angina, and QT-related ECG changes.</p><p><strong>Metabolic</strong> effects include hypokalemia and hyperglycemia.</p><p><strong>Rare/serious</strong> reactions include paradoxical bronchospasm, severe hypersensitivity, angioedema, anaphylaxis, significant cardiac arrhythmia, and severe hypokalemia.</p>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&bull; LABA Monotherapy in Asthma</div><div class="warning-box-body">Salmeterol must not be used alone to treat asthma. LABA monotherapy increases the risk of asthma-related death and serious asthma-related outcomes.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Not a Rescue Inhaler</div><div class="warning-box-body">Do not use salmeterol PRN for acute asthma symptoms or acute COPD symptoms. Use a rapid-acting bronchodilator instead.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Do Not Exceed 50mcg BID</div><div class="warning-box-body">Higher or more frequent doses increase the risk of tachycardia, arrhythmia, tremor, hypokalemia, hyperglycemia, QT prolongation, and other cardiovascular adverse effects.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Do Not Combine With Another LABA</div><div class="warning-box-body">Avoid concurrent use with formoterol, indacaterol, olodaterol, vilanterol, or another salmeterol-containing product.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Paradoxical Bronchospasm</div><div class="warning-box-body">Rarely, inhaled salmeterol may cause immediate worsening of bronchospasm. Stop the medicine and use appropriate alternative therapy.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Cardiovascular Disease</div><div class="warning-box-body">Use cautiously in coronary artery disease, arrhythmias, hypertension, cardiomyopathy, or QT prolongation risk.</div></div><ul><li>Risk of hypokalemia is increased by diuretics, systemic corticosteroids, hypoxemia, and high beta<sub>2</sub>-agonist exposure</li><li>Use cautiously in diabetes because beta<sub>2</sub> agonists can increase blood glucose</li><li>Use cautiously with MAO inhibitors, tricyclic antidepressants, and strong CYP3A4 inhibitors</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Asthma without concomitant ICS therapy</strong> &mdash; contraindicated</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Status asthmaticus</strong> or acute severe asthma requiring intensive emergency treatment</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Severe milk-protein allergy</strong> with Diskus formulations that contain lactose containing milk proteins</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Hypersensitivity</strong> to salmeterol or any formulation component</div></div>`,
            formulation: `<p><strong>Serevent Diskus:</strong> 50mcg salmeterol per inhalation, dry-powder inhaler. Common device presentations contain 60 inhalation doses, with some institutional presentations containing 28 doses.</p><p><strong>Common combination products:</strong> salmeterol is also supplied with an ICS, especially fluticasone propionate/salmeterol in 100mcg/50mcg, 250mcg/50mcg, and 500mcg/50mcg strengths.</p>`
        },
        {
            id: 'fluti',
            brand: 'Flovent Diskus',
            generic: 'Fluticasone Propionate',
            class: 'ICS',
            icon: '&#x1F48A;',
            hasPediatric: true,
            overview: `<p><strong>Fluticasone propionate</strong> is an inhaled corticosteroid used for long-term control of asthma. It reduces airway inflammation by suppressing eosinophilic inflammation, cytokine release, airway edema, mucus production, and bronchial hyperresponsiveness.</p><p>Clinical effects include reduced asthma symptoms, fewer exacerbations, improved lung function, reduced reliever use, and better long-term control. It is a controller medication and does not produce rapid bronchodilation, so it must not be used for acute bronchospasm.</p><p>After each maintenance dose, the mouth should be rinsed and the rinse water spit out to reduce the risk of oropharyngeal candidiasis. Strong CYP3A4 inhibitors may increase systemic corticosteroid exposure.</p>`,
            dose: {
                adult: `<p><strong>Adults and adolescents &ge;12 years</strong></p><p><strong>ICS-na&iuml;ve:</strong> 100mcg inhaled BID, approximately 12 hr apart.</p><p><strong>Dose range:</strong> 100&ndash;1000mcg inhaled BID, depending on previous corticosteroid therapy, asthma severity, symptom control, exacerbation risk, and response to treatment.</p><p><strong>Maximum:</strong> 1000mcg inhaled BID (2000mcg/day).</p><p>If asthma is inadequately controlled after about 2 weeks at the starting dose, a higher dose may provide additional benefit. Once stable, titrate to the lowest effective dose.</p><p><strong>Acute symptoms:</strong> no dose &mdash; not indicated for immediate relief. Use an appropriate rapid-acting reliever instead.</p><p><strong>Administration:</strong> route is oral inhalation only. Do not exhale into the inhaler, keep the device dry, do not wash the Diskus, and rinse the mouth after every dose.</p>`,
                pediatric: `<p><strong>Children 4&ndash;11 years</strong></p><p><strong>ICS-na&iuml;ve:</strong> 50mcg inhaled BID, approximately 12 hr apart.</p><p>If control is inadequate, increase to 100mcg inhaled BID when clinically appropriate.</p><p><strong>Dose range:</strong> 50&ndash;100mcg inhaled BID.</p><p><strong>Maximum:</strong> 100mcg inhaled BID (200mcg/day).</p><p><strong>Children &lt;4 years:</strong> safety and efficacy are not established for the Diskus formulation.</p><p><strong>Acute asthma attack:</strong> no dose &mdash; not indicated. Use an appropriate rapid-acting reliever according to the child's asthma action plan.</p><p><strong>Administration:</strong> route is oral inhalation only. Rinse mouth after every maintenance dose. Ensure adequate inspiratory effort, demonstrate technique, and supervise use when necessary.</p><p><strong>Children &ge;12 years:</strong> use adolescent/adult dosing.</p>`,
            },
            sideEffects: `<p><strong>Common</strong> effects include oropharyngeal candidiasis, dysphonia/hoarseness, throat irritation, cough, headache, and upper respiratory tract symptoms.</p><p><strong>Local corticosteroid effects</strong> include oral candidiasis and pharyngeal irritation.</p><p><strong>Systemic effects at higher or prolonged doses</strong> include adrenal suppression, hypercorticism, reduced bone mineral density, cataracts, glaucoma, increased intraocular pressure, increased infection susceptibility, and skin bruising.</p><p><strong>Rare/serious</strong> reactions include paradoxical bronchospasm, angioedema, anaphylaxis, severe hypersensitivity, and adrenal insufficiency.</p>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&bull; Not for Acute Bronchospasm</div><div class="warning-box-body">Fluticasone does not act quickly enough to treat acute wheeze, acute bronchospasm, status asthmaticus, or rapidly worsening asthma.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Oral Candidiasis</div><div class="warning-box-body">Localized Candida albicans infection may occur. Rinse the mouth with water after every dose and spit it out.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Adrenal Suppression</div><div class="warning-box-body">High-dose or prolonged inhaled corticosteroid therapy may cause hypothalamic-pituitary-adrenal suppression, hypercorticism, or adrenal insufficiency.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Strong CYP3A4 Inhibitors</div><div class="warning-box-body">Ritonavir, cobicistat, ketoconazole, itraconazole, and clarithromycin may markedly increase systemic fluticasone exposure and corticosteroid toxicity.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Bone Mineral Density</div><div class="warning-box-body">Long-term inhaled corticosteroid therapy may reduce bone mineral density, especially at high doses or with other osteoporosis risk factors.</div></div><div class="warning-box"><div class="warning-box-title">&bull; Cataracts and Glaucoma</div><div class="warning-box-body">Long-term corticosteroid exposure may increase the risk of cataracts, glaucoma, and elevated intraocular pressure.</div></div><ul><li>Use cautiously in active or latent tuberculosis, untreated fungal infection, bacterial infection, viral infection, parasitic infection, or ocular herpes simplex</li><li>Do not abruptly discontinue chronic oral corticosteroids when transferring a patient to inhaled therapy</li><li>Monitor children for growth velocity changes during long-term therapy</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Primary treatment of status asthmaticus</strong> or acute asthma requiring intensive emergency therapy</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Severe milk-protein hypersensitivity</strong> with Diskus formulations</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Hypersensitivity</strong> to fluticasone propionate or any component of the formulation</div></div>`,
            formulation: `<p><strong>Fluticasone Propionate Diskus:</strong> 50mcg, 100mcg, and 250mcg per inhalation.</p><p><strong>Common fixed combination:</strong> fluticasone propionate/salmeterol is available in 100mcg/50mcg, 250mcg/50mcg, and 500mcg/50mcg strengths.</p><p><strong>Key point:</strong> fluticasone alone is a controller ICS; the salmeterol combination is maintenance therapy and not an AIR/MART reliever combination.</p>`
        },        {
            id: 'amox',
            brand: 'Amoxil',
            generic: 'Amoxicillin',
            icon: '&#x1F48A;',
            hasPediatric: true,
            overview: `<p><strong>Amoxicillin</strong> is a penicillin-type antibiotic used to treat a wide variety of bacterial infections. It works by stopping the growth of bacteria.</p><p>This antibiotic treats only bacterial infections. It will not work for viral infections (such as common cold, flu).</p><p>Amoxicillin is also used with other medications to treat stomach/intestinal ulcers caused by the bacteria <em>H. pylori</em> and to prevent the ulcers from returning.</p>`,
            dose: {
                adult: `<table class="dose-table"><tr><th>Condition</th><th>Dose</th><th>Frequency</th></tr><tr><td>Ear/Nose/Throat Infection</td><td>500 mg</td><td>Every 8 hours or 875 mg every 12 hours</td></tr><tr><td>Lower Respiratory Tract</td><td>875 mg</td><td>Every 12 hours</td></tr><tr><td>Skin/Skin Structure</td><td>500 mg</td><td>Every 8 hours</td></tr><tr><td>UTI</td><td>500 mg</td><td>Every 8 hours or 875 mg every 12 hours</td></tr><tr><td><em>H. pylori</em> (triple therapy)</td><td>1 g</td><td>Twice daily with lansoprazole + clarithromycin</td></tr></table>`,
                pediatric: `<table class="dose-table"><tr><th>Age/Weight</th><th>Dose</th><th>Frequency</th></tr><tr><td>3 months to 12 years</td><td>5-10 mg/kg PO q6-8h</td><td>40 mg/kg/day</td></tr><tr><td>Fever (6mo-12yr)</td><td>10 mg/kg PO q6-8h PRN</td><td>40 mg/kg/day</td></tr><tr><td>Juvenile Arthritis</td><td>30-50 mg/kg/day divided TID-QID</td><td>2,400 mg/day</td></tr></table>`
            },
            sideEffects: `<p><strong>Common:</strong> Upset stomach, heartburn, nausea, dizziness, headache, rash.</p><p><strong>Serious:</strong></p><ul><li>GI bleeding or ulceration</li><li>Cardiovascular thrombotic events (MI, stroke)</li><li>Renal toxicity / acute kidney injury</li><li>Severe skin reactions (SJS, TEN)</li><li>Anaphylaxis</li><li>Hepatotoxicity</li></ul>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&#x26A0; Cardiovascular Risk</div><div class="warning-box-body">NSAIDs may cause an increased risk of serious cardiovascular thrombotic events, MI, and stroke, which can be fatal.</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; GI Risk</div><div class="warning-box-body">NSAIDs cause an increased risk of serious GI adverse events including bleeding, ulceration, and perforation of the stomach or intestines.</div></div><ul><li>Use lowest effective dose for shortest duration</li><li>Avoid in peri-operative pain following CABG surgery</li><li>Use caution in patients with heart failure, hypertension, or renal impairment</li><li>May interfere with antihypertensive medications</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Hypersensitivity</strong> to ibuprofen or other NSAIDs</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">History of <strong>asthma, urticaria, or allergic-type reactions</strong> after taking aspirin or other NSAIDs</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Peri-operative pain in the setting of <strong>CABG surgery</strong></div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Third trimester of <strong>pregnancy</strong> (may cause premature closure of ductus arteriosus)</div></div>`,
            formulation: `<table class="dose-table"><tr><th>Form</th><th>Strengths</th></tr><tr><td>Tablets</td><td>200 mg (OTC), 400 mg, 600 mg, 800 mg (Rx)</td></tr><tr><td>Capsules</td><td>200 mg</td></tr><tr><td>Oral Suspension</td><td>100 mg/5mL</td></tr><tr><td>Chewable Tablets</td><td>50 mg, 100 mg</td></tr><tr><td>Injection (Caldolor)</td><td>800 mg/8mL</td></tr></table>`
        },
        {
            id: 'para',
            brand: 'Tylenol / Panadol',
            generic: 'Paracetamol / Acetaminophen',
            icon: '&#x1F48A;',
            hasPediatric: true,
            overview: `<p><strong>Paracetamol (Acetaminophen)</strong> is used to relieve mild to moderate pain from headaches, muscle aches, menstrual periods, colds and sore throats, toothaches, backaches, and reactions to vaccinations (shots), and to reduce fever.</p><p>It works by changing the way the body senses pain and by cooling the body.</p>`,
            dose: {
                adult: `<table class="dose-table"><tr><th>Condition</th><th>Dose</th><th>Max Daily</th></tr><tr><td>Pain/Fever</td><td>500-1000 mg PO q4-6h PRN</td><td>3,000-4,000 mg (do not exceed 3,000 mg for chronic use)</td></tr><tr><td>Osteoarthritis</td><td>Up to 1,000 mg PO TID</td><td>3,000 mg</td></tr></table>`,
                pediatric: `<table class="dose-table"><tr><th>Age/Weight</th><th>Dose</th><th>Max Daily</th></tr><tr><td>Infants (<12 kg)</td><td>10-15 mg/kg PO q4-6h PRN</td><td>75 mg/kg/day (max 5 doses/24h)</td></tr><tr><td>Children (&ge;12 kg)</td><td>10-15 mg/kg PO q4-6h PRN</td><td>75 mg/kg/day (max 4,000 mg)</td></tr></table>`
            },
            sideEffects: `<p><strong>Common:</strong> Very few at recommended doses. May cause nausea or rash in some patients.</p><p><strong>Serious (overdose):</strong></p><ul><li>Hepatotoxicity / acute liver failure</li><li>Nephrotoxicity</li><li>Hypoglycemia</li><li>Metabolic acidosis</li><li>Death (in severe overdose)</li></ul>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&#x26A0; Hepatotoxicity</div><div class="warning-box-body">Overdose can cause severe, potentially fatal liver damage. Do not exceed maximum daily dose. Many OTC products contain acetaminophen &mdash; check labels to avoid accidental overdose.</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; Alcohol</div><div class="warning-box-body">Chronic alcohol use increases risk of liver damage. Limit alcohol consumption while taking this medication.</div></div><ul><li>Use with caution in patients with liver disease or G6PD deficiency</li><li>May cause severe skin reactions (SJS, TEN, AGEP) &mdash; rare</li><li>May affect blood glucose readings</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Hypersensitivity</strong> to acetaminophen or any component</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Severe <strong>hepatic impairment</strong> or active liver disease</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Severe <strong>renal impairment</strong> without medical supervision</div></div>`,
            formulation: `<table class="dose-table"><tr><th>Form</th><th>Strengths</th></tr><tr><td>Tablets</td><td>325 mg, 500 mg</td></tr><tr><td>Caplets</td><td>500 mg</td></tr><tr><td>Oral Suspension</td><td>160 mg/5mL</td></tr><tr><td>Suppositories</td><td>80 mg, 120 mg, 325 mg, 650 mg</td></tr><tr><td>IV Injection (Ofirmev)</td><td>1,000 mg/100mL</td></tr></table>`
        },
        {
            id: 'atorva',
            brand: 'Lipitor',
            generic: 'Atorvastatin',
            icon: '&#x1F48A;',
            hasPediatric: true,
            overview: `<p><strong>Atorvastatin</strong> is used together with diet, weight loss, and exercise to reduce the risk of heart attack and stroke and to decrease the chance that heart surgery will be needed in people who have heart disease or who are at risk of developing heart disease.</p><p>It works by slowing the production of cholesterol in the body to decrease the amount of cholesterol that may build up on the walls of the arteries.</p>`,
            dose: {
                adult: `<table class="dose-table"><tr><th>Condition</th><th>Initial Dose</th><th>Target/Maintenance</th></tr><tr><td>Primary Hyperlipidemia</td><td>10-20 mg PO daily</td><td>10-80 mg daily</td></tr><tr><td>HeFH (homozygous)</td><td>10-80 mg PO daily</td><td>Max 80 mg daily</td></tr><tr><td>ASCVD Risk Reduction</td><td>10-80 mg PO daily</td><td>LDL goal <100 mg/dL</td></tr></table>`,
                pediatric: `<table class="dose-table"><tr><th>Age</th><th>Condition</th><th>Dose</th></tr><tr><td>10-17 years (HeFH)</td><td>Heterozygous Familial Hypercholesterolemia</td><td>10 mg PO daily (max 20 mg/day)</td></tr></table>`
            },
            sideEffects: `<p><strong>Common:</strong> Nasopharyngitis, arthralgia, diarrhea, dyspepsia, nausea, muscle spasms, myalgia, insomnia.</p><p><strong>Serious:</strong></p><ul><li>Rhabdomyolysis (muscle breakdown)</li><li>Immune-mediated necrotizing myopathy</li><li>Hepatotoxicity (elevated liver enzymes)</li><li>New-onset diabetes mellitus</li><li>Cognitive impairment (memory loss, confusion)</li></ul>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&#x26A0; Myopathy / Rhabdomyolysis</div><div class="warning-box-body">Risk increases with higher doses, advanced age (>65), renal impairment, and concomitant use of certain medications (fibrates, niacin, cyclosporine, strong CYP3A4 inhibitors).</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; Hepatic Impairment</div><div class="warning-box-body">Contraindicated in active liver disease. Monitor LFTs before starting and as clinically indicated.</div></div><ul><li>Limit alcohol consumption</li><li>Avoid grapefruit juice (>1.2L/day)</li><li>Report unexplained muscle pain, tenderness, or weakness immediately</li><li>May cause modest increases in HbA1c and fasting glucose</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Hypersensitivity</strong> to atorvastatin or any component</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Active <strong>liver disease</strong> or unexplained persistent elevations of serum transaminases</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Pregnancy</strong> and <strong>breastfeeding</strong></div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Concomitant use with <strong>cyclosporine, gemfibrozil, tipranavir/ritonavir, glecaprevir/pibrentasvir</strong></div></div>`,
            formulation: `<table class="dose-table"><tr><th>Form</th><th>Strengths</th></tr><tr><td>Tablets</td><td>10 mg, 20 mg, 40 mg, 80 mg</td></tr></table>`
        },
        {
            id: 'metform',
            brand: 'Glucophage',
            generic: 'Metformin',
            class: 'Biguanide Antidiabetic',
            hasPediatric: true,
            overview: `<p><strong>Metformin</strong> is used with a proper diet and exercise program and possibly with other medications to control high blood sugar in people with type 2 diabetes.</p><p>It works by helping to restore your body's proper response to the insulin you naturally produce, and by decreasing the amount of sugar that your liver makes and that your stomach/intestines absorb.</p>`,
            dose: {
                adult: `<table class="dose-table"><tr><th>Form</th><th>Initial Dose</th><th>Max Dose</th></tr><tr><td>Immediate-Release</td><td>500 mg PO BID or 850 mg PO daily</td><td>2,550 mg/day (divided TID)</td></tr><tr><td>Extended-Release</td><td>500 mg PO daily with evening meal</td><td>2,000 mg/day</td></tr></table>`,
                pediatric: `<table class="dose-table"><tr><th>Age</th><th>Initial Dose</th><th>Max Dose</th></tr><tr><td>10-16 years (IR only)</td><td>500 mg PO BID</td><td>2,000 mg/day</td></tr></table>`
            },
            sideEffects: `<p><strong>Common:</strong> Nausea, vomiting, diarrhea, abdominal bloating, gas, metallic taste, weakness.</p><p><strong>Serious:</strong></p><ul><li>Lactic acidosis (rare but life-threatening)</li><li>Vitamin B12 deficiency (long-term use)</li><li>Hypoglycemia (when combined with other antidiabetics)</li></ul>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&#x26A0; Lactic Acidosis</div><div class="warning-box-body">Rare but serious metabolic complication. Risk factors include renal impairment, sepsis, dehydration, excessive alcohol intake, hepatic impairment, and hypoxic states. Discontinue if suspected.</div></div><ul><li>Obtain eGFR before initiating and at least annually</li><li>Not recommended if eGFR <30 mL/min/1.73m&sup2;</li><li>Hold before and after iodinated contrast procedures</li><li>Monitor vitamin B12 levels periodically</li><li>Excessive alcohol increases risk of lactic acidosis</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Hypersensitivity</strong> to metformin</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Severe <strong>renal impairment</strong> (eGFR <30 mL/min/1.73m&sup2;)</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Acute or chronic <strong>metabolic acidosis</strong>, including diabetic ketoacidosis</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Severe <strong>hypoxic states</strong> (e.g., shock, acute heart failure, recent MI)</div></div>`,
            formulation: `<table class="dose-table"><tr><th>Form</th><th>Strengths</th></tr><tr><td>Immediate-Release Tablets</td><td>500 mg, 850 mg, 1,000 mg</td></tr><tr><td>Extended-Release Tablets</td><td>500 mg, 750 mg, 1,000 mg</td></tr><tr><td>Oral Solution</td><td>500 mg/5mL</td></tr></table>`
        },
        {
            id: 'budesonide',
            brand: 'Pulmicort',
            generic: 'Budesonide',
            class: 'Inhaled Corticosteroid (ICS)',
            hasPediatric: true,
            overview: `<p><strong>Budesonide</strong> is an inhaled corticosteroid used for the maintenance treatment and prevention of asthma symptoms. It reduces airway inflammation by modifying inflammatory gene transcription and suppressing inflammatory cells and mediators, including eosinophils, mast cells, cytokines, and chemokines.</p><p>Clinical benefits include reduced airway inflammation, reduced bronchial hyperresponsiveness, improved asthma control, reduced risk of exacerbations, and improved lung function. Budesonide is a controller medication, not a bronchodilator, and it should not be used alone for rapid relief of acute bronchospasm.</p><p>Improvement may begin within about 24 hours, but maximum benefit may require 1-2 weeks or longer with regular use. In modern asthma management, budesonide-formoterol has an important role as an ICS-formoterol reliever and/or maintenance-and-reliever therapy, but this is distinct from budesonide monotherapy.</p>`,
            dose: {
                adult: `<p><strong>Pulmicort Flexhaler - Adults 18 years and older:</strong></p><ul><li>Starting dose: 360 micrograms inhaled twice daily</li><li>Some patients with less severe disease may be controlled with 180 micrograms inhaled twice daily</li><li>Maximum dose: 720 micrograms inhaled twice daily</li></ul><p>Once good asthma control is achieved, reduce to the lowest effective dose capable of maintaining control.</p><p><strong>Administration:</strong></p><ul><li>Use regularly, even when asymptomatic</li><li>Administer by oral inhalation only</li><li>Use the correct inhaler technique</li><li>Rinse the mouth with water after each dose and spit it out</li><li>Do not use extra doses as emergency treatment for acute wheezing</li><li>Ensure the patient has an appropriate reliever inhaler according to the asthma treatment plan</li></ul><p>If asthma remains uncontrolled after approximately 1-2 weeks despite correct use, reassess adherence, inhaler technique, diagnosis, trigger exposure, and need for treatment escalation.</p>`,
                pediatric: `<p><strong>Pulmicort Flexhaler - Children 6 to 17 years:</strong></p><ul><li>Recommended starting dose: 180 micrograms inhaled twice daily</li><li>In some children, 360 micrograms inhaled twice daily may be an appropriate starting dose</li><li>Maximum dose: 360 micrograms inhaled twice daily</li></ul><p>Once asthma is controlled, titrate to the lowest effective dose.</p><p><strong>Pulmicort Respules - Children 12 months to 8 years:</strong></p><ul><li>Previously treated with bronchodilators alone: 0.5 mg once daily or 0.25 mg twice daily</li><li>Previously receiving inhaled corticosteroids: 0.5 mg once daily or 0.25 mg twice daily</li><li>Previously receiving oral corticosteroids: 0.5 mg twice daily or 1 mg once daily</li></ul><p>For young children, an appropriately fitting face mask may be required. After treatment, rinse the child's mouth where developmentally possible, and if a face mask is used, wash the child's face afterward to reduce local corticosteroid exposure.</p>`
            },
            sideEffects: `<p><strong>Common:</strong> Oral candidiasis, throat irritation, dysphonia or hoarseness, cough, headache, and nasopharyngeal or upper respiratory symptoms.</p><p><strong>Local corticosteroid effects:</strong> Oropharyngeal candidiasis may occur because corticosteroid remains deposited in the mouth and pharynx. Risk can be reduced by correct inhaler technique and mouth rinsing after each dose.</p><p><strong>Less common/systemic effects:</strong> Systemic corticosteroid effects are uncommon at usual inhaled doses but become more likely with high doses, prolonged treatment, significant CYP3A4 inhibition, or concomitant corticosteroid exposure. Potential effects include adrenal suppression, hypercorticism/Cushingoid features, reduced bone mineral density, cataracts, glaucoma, increased intraocular pressure, increased susceptibility to infection, and skin bruising.</p>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&#9888; Not for Acute Bronchospasm</div><div class="warning-box-body">Budesonide does not provide rapid bronchodilation. It must not be relied upon to treat acute wheezing, acute bronchospasm, status asthmaticus, or rapidly deteriorating asthma.</div></div><div class="warning-box"><div class="warning-box-title">&#9888; Oral Candidiasis</div><div class="warning-box-body">Monitor for oral or pharyngeal candidiasis. If candidiasis occurs, treat appropriately; budesonide can often be continued. Mouth rinsing after inhalation reduces risk.</div></div><div class="warning-box"><div class="warning-box-title">&#9888; Adrenal Suppression</div><div class="warning-box-body">Although inhalation markedly reduces systemic exposure compared with oral corticosteroids, high-dose or prolonged therapy may suppress the hypothalamic-pituitary-adrenal axis. Risk is especially important when transferring a patient from chronic systemic corticosteroid therapy.</div></div><div class="warning-box"><div class="warning-box-title">&#9888; Immunosuppression and Infection</div><div class="warning-box-body">Corticosteroids may increase susceptibility to infection. Use additional caution in patients with active or latent tuberculosis, untreated fungal infection, bacterial infection, viral infection, parasitic infection, or ocular herpes simplex.</div></div><div class="warning-box"><div class="warning-box-title">&#9888; CYP3A4 Interactions</div><div class="warning-box-body">Budesonide is substantially metabolized through CYP3A4. Strong CYP3A4 inhibitors may increase systemic budesonide exposure and corticosteroid adverse effects.</div></div><ul><li>Long-term corticosteroid exposure may reduce bone mineral density</li><li>Long-term inhaled corticosteroid therapy may increase the risk of cataracts, glaucoma, and raised intraocular pressure</li><li>Monitor pediatric growth periodically during long-term therapy</li><li>Do not abruptly stop necessary controller therapy</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Severe hypersensitivity</strong> to budesonide or any component of the formulation</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Severe milk-protein allergy</strong> for Pulmicort Flexhaler because the dry-powder formulation contains lactose that may contain trace milk proteins</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Primary treatment of <strong>status asthmaticus</strong> or other acute asthma episodes requiring intensive emergency measures</div></div>`,
            formulation: `<p><strong>Dry powder inhaler - Pulmicort Flexhaler:</strong> Available strengths include 90 micrograms per inhalation and 180 micrograms per inhalation. Devices may contain 60 or 120 actuations and require sufficient inspiratory effort.</p><p><strong>Nebulized budesonide:</strong> Budesonide inhalation suspension is available in unit-dose nebulizer ampules, particularly for pediatric use. Common strengths include 0.25 mg/2 mL, 0.5 mg/2 mL, and 1 mg/2 mL. Formulations and marketed strengths vary between countries.</p>`
        },
        {
            id: 'formoterol',
            brand: 'Foradil / Perforomist',
            generic: 'Formoterol',
            class: 'Long-acting Beta2-adrenergic Agonist (LABA)',
            hasPediatric: true,
            overview: `<p><strong>Formoterol</strong> is a long-acting selective beta<sub>2</sub>-adrenergic receptor agonist (LABA) that relaxes bronchial smooth muscle and produces bronchodilation.</p><p>Its mechanism is mediated through beta<sub>2</sub> receptor activation, which stimulates adenylate cyclase and increases intracellular cyclic AMP. The result is airway smooth-muscle relaxation, improved airflow, and reduction in bronchospasm.</p><p>Formoterol is unusual among LABAs because it combines a <strong>rapid onset of bronchodilation</strong> with a <strong>long duration of action of about 12 hours</strong>. That feature makes it clinically important in asthma when used as part of an inhaled corticosteroid-formoterol regimen for anti-inflammatory reliever therapy or maintenance-and-reliever therapy.</p><p><strong>Important principle:</strong> formoterol should not be used as LABA monotherapy for asthma. Asthma requires an inhaled corticosteroid-containing regimen. In routine asthma care, formoterol is therefore most useful as part of a fixed ICS-formoterol inhaler rather than as an isolated bronchodilator.</p>`,
            dose: {
                adult: `<p><strong>Asthma:</strong> formoterol should be used with an inhaled corticosteroid, preferably as a fixed ICS-formoterol combination inhaler. The exact dose depends on the product, device, and treatment step.</p><ul><li>As-needed anti-inflammatory reliever therapy may use an ICS-formoterol inhaler per guideline-specific regimen.</li><li>Daily maintenance therapy may use a fixed ICS-formoterol product with product-specific inhalation instructions.</li><li>Maintenance-and-reliever therapy (MART) is appropriate only for ICS-formoterol products that are specifically suited for that purpose.</li></ul><p><strong>Historical single-agent dry-powder formoterol:</strong> 12 micrograms inhaled every 12 hours; maximum 24 micrograms per day. This older monotherapy approach should not be used for asthma.</p><p><strong>COPD maintenance therapy:</strong> nebulized formoterol 20 micrograms every 12 hours; maximum 40 micrograms per day. This formulation is for COPD maintenance treatment and is not indicated for asthma.</p><p><strong>Practical note:</strong> dosing is product-specific and should always be verified against the exact inhaler or nebulizer label.</p>`,
                pediatric: `<p><strong>Children and adolescents with asthma:</strong> formoterol should be used only as part of an ICS-containing regimen when supported by the specific product label and guideline step.</p><ul><li>In children 6 to 11 years, low-dose ICS-formoterol may be used in appropriate guideline steps.</li><li>Fixed-dose ICS-formoterol products are preferred over isolated LABA therapy.</li><li>Doses are not interchangeable across inhalers because delivered amounts vary by device.</li></ul><p><strong>Historical single-agent formoterol:</strong> some older dry-powder products were labeled at 12 micrograms inhaled every 12 hours in children 5 years and older, but LABA monotherapy is not appropriate for pediatric asthma management.</p><p><strong>Device caution:</strong> product approval and age indications vary by country and formulation.</p>`
            },
            sideEffects: `<p><strong>Common:</strong> tremor, headache, palpitations, tachycardia, nervousness, muscle cramps, dizziness, cough, and throat irritation.</p><p><strong>Metabolic effects:</strong> beta<sub>2</sub> agonists may cause hypokalemia and hyperglycemia, especially with high or repeated doses or with other sympathomimetic exposure.</p><p><strong>Cardiovascular effects:</strong> tachycardia, palpitations, blood-pressure changes, arrhythmias, and QT-related ECG changes may occur, particularly in susceptible patients.</p><p><strong>Rare but serious:</strong> paradoxical bronchospasm, hypersensitivity reactions, significant arrhythmia, and severe hypokalemia.</p>`,
            warnings: `<div class="warning-box"><div class="warning-box-title">&#x26A0; LABA Monotherapy in Asthma</div><div class="warning-box-body">Do not use formoterol without inhaled corticosteroid therapy in asthma. LABA monotherapy does not adequately treat airway inflammation and is associated with increased risk of serious asthma-related outcomes.</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; Do Not Confuse Formoterol Alone With ICS-Formoterol</div><div class="warning-box-body">Formoterol's rapid onset does not mean that single-agent formoterol should be used as the preferred asthma reliever. The asthma reliever strategy requires an ICS plus formoterol combination.</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; Excessive Use</div><div class="warning-box-body">Increasing bronchodilator need may indicate worsening asthma, poor inhaler technique, poor adherence, or inadequate anti-inflammatory treatment. Reassess rather than simply escalating LABA exposure.</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; Cardiovascular Disease</div><div class="warning-box-body">Use cautiously in patients with ischemic heart disease, arrhythmias, hypertension, cardiomyopathy, or other clinically significant cardiovascular disease.</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; Hypokalemia and Hyperglycemia</div><div class="warning-box-body">Beta<sub>2</sub> agonists may shift potassium intracellularly and may increase blood glucose. Risk is greater with high doses, diuretics, systemic corticosteroids, hypoxemia, or poorly controlled diabetes.</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; Paradoxical Bronchospasm</div><div class="warning-box-body">Rarely, inhaled formoterol may cause immediate worsening of bronchospasm. If this occurs, stop the product and treat the bronchospasm with appropriate alternative therapy.</div></div><div class="warning-box"><div class="warning-box-title">&#x26A0; Drug Interactions</div><div class="warning-box-body">Use caution with other sympathomimetics, nonselective beta-blockers, MAO inhibitors, tricyclic antidepressants, potassium-lowering diuretics, and QT-prolonging medications.</div></div><ul><li>Monitor for tremor, palpitations, and tachycardia after initiation or dose changes</li><li>Do not exceed the recommended product-specific dose</li><li>Reassess frequent reliever use promptly</li><li>Use caution in hyperthyroidism because sympathomimetic effects may be more pronounced</li></ul>`,
            contraindications: `<div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text"><strong>Hypersensitivity</strong> to formoterol or any component of the formulation</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Use of a <strong>LABA without concomitant ICS therapy</strong> for asthma management</div></div><div class="contra-item"><div class="contra-item-icon">&#x1F6AB;</div><div class="contra-item-text">Product-specific contraindications such as <strong>severe milk-protein allergy</strong> for some dry-powder inhalers that contain lactose</div></div>`,
            formulation: `<p><strong>Dry-powder inhalation:</strong> historically and in some markets, formoterol fumarate is available as 12 micrograms per inhalation or capsule for use with the specified device. The capsule is for inhalation only and must not be swallowed.</p><p><strong>Nebulized inhalation solution:</strong> common COPD maintenance formulation is 20 micrograms per 2 mL unit-dose vial, administered about every 12 hours.</p><p><strong>Fixed-dose ICS/formoterol combinations:</strong> these are the most important asthma formulations. Examples include budesonide/formoterol and beclometasone/formoterol. The exact metered and delivered dose depends on the product and device.</p><p><strong>Clinical note:</strong> the product-specific ICS-formoterol monograph should be used to determine the exact maintenance, anti-inflammatory reliever, or MART dose.</p>`
        }
    ];

    function getMedLensExternalDrugs() {
        if (typeof window === 'undefined') return [];
        const store = window.MEDLENS_DATABASE;
        if (!store) return [];
        if (Array.isArray(store)) return store;
        if (typeof store === 'object') return Object.values(store);
        return [];
    }

    function mergeMedLensDrugSources(baseDrugs, externalDrugs) {
        const map = new Map();
        [...baseDrugs, ...externalDrugs].forEach(function (drug) {
            if (drug && drug.id) {
                map.set(drug.id, drug);
            }
        });
        return Array.from(map.values());
    }

    let drugs = mergeMedLensDrugSources(embeddedDrugs, getMedLensExternalDrugs());

    const embeddedDiseases = [
        {
            id: 'dm2',
            name: 'Type 2 Diabetes Mellitus',
            category: 'Endocrine / Metabolic',
            icon: '&#x2695;',
            overview: `<p><strong>Type 2 Diabetes Mellitus (T2DM)</strong> is a chronic metabolic disorder characterized by high blood sugar, insulin resistance, and relative lack of insulin. It is the most common form of diabetes, accounting for approximately 90-95% of all diabetes cases.</p><p>Unlike type 1 diabetes, the body still produces insulin in T2DM, but cells become resistant to its effects. Over time, the pancreas may not be able to produce enough insulin to overcome this resistance.</p>`,
            etiology: `<p><strong>Risk Factors:</strong></p><ul><li>Obesity / overweight (BMI &ge;25 kg/m&sup2;)</li><li>Family history of diabetes</li><li>Sedentary lifestyle</li><li>Age &ge;45 years</li><li>History of gestational diabetes</li><li>Polycystic ovary syndrome (PCOS)</li><li>Hypertension (&ge;140/90 mmHg)</li><li>Dyslipidemia (HDL <35 mg/dL, TG >250 mg/dL)</li><li>Prediabetes (impaired fasting glucose or IGT)</li><li>Certain ethnicities (African American, Hispanic, Native American, Asian American, Pacific Islander)</li></ul>`,
            presentation: `<p><strong>Classic Symptoms (often absent in early T2DM):</strong></p><ul><li>Polyuria (frequent urination)</li><li>Polydipsia (excessive thirst)</li><li>Polyphagia (increased hunger)</li><li>Unexplained weight loss</li><li>Fatigue and blurred vision</li></ul><p><strong>Physical Exam Findings:</strong></p><ul><li>Acanthosis nigricans (insulin resistance marker)</li><li>Obesity (especially central/abdominal)</li><li>Hypertension</li><li>Peripheral neuropathy signs</li><li>Diabetic retinopathy on fundoscopy</li></ul>`,
            diagnosis: `<p><strong>Diagnostic Criteria (ADA 2024):</strong> Any ONE of the following:</p><ul><li>Fasting plasma glucose &ge;126 mg/dL (7.0 mmol/L) &mdash; fasting = no caloric intake for at least 8 hours</li><li>2-hour plasma glucose &ge;200 mg/dL (11.1 mmol/L) during OGTT (75g anhydrous glucose)</li><li>HbA1c &ge;6.5% (48 mmol/mol) &mdash; using NGSP-certified method</li><li>Random plasma glucose &ge;200 mg/dL (11.1 mmol/L) with classic symptoms of hyperglycemia</li></ul><p><em>In the absence of unequivocal hyperglycemia, results should be confirmed by repeat testing.</em></p>`,
            management: `<p><strong>Glycemic Targets (ADA 2024):</strong></p><ul><li>HbA1c: <7% for most nonpregnant adults (individualize: <6.5% if achievable without significant hypoglycemia; <8% if limited life expectancy, advanced complications, or hypoglycemia risk)</li><li>Preprandial glucose: 80-130 mg/dL</li><li>Peak postprandial glucose: <180 mg/dL</li></ul><p><strong>First-Line Therapy:</strong> Metformin + comprehensive lifestyle modification (diet, exercise, weight loss)</p><p><strong>Add-on Therapies (if A1c not at goal after ~3 months):</strong></p><ul><li>GLP-1 receptor agonists (semaglutide, liraglutide) &mdash; CV benefit</li><li>SGLT2 inhibitors (empagliflozin, dapagliflozin) &mdash; CV/renal benefit</li><li>DPP-4 inhibitors (sitagliptin, linagliptin)</li><li>Thiazolidinediones (pioglitazone)</li><li>Sulfonylureas (glipizide, glyburide)</li><li>Insulin (basal or prandial)</li></ul>`,
            complications: `<p><strong>Microvascular:</strong></p><ul><li>Diabetic retinopathy &mdash; leading cause of blindness in adults</li><li>Diabetic nephropathy &mdash; leading cause of ESRD</li><li>Diabetic neuropathy (peripheral, autonomic)</li></ul><p><strong>Macrovascular:</strong></p><ul><li>Coronary artery disease (2-4x increased risk)</li><li>Cerebrovascular disease / stroke</li><li>Peripheral arterial disease</li></ul><p><strong>Other:</strong></p><ul><li>Diabetic foot ulcers and amputations</li><li>Infections (skin, urinary tract, fungal)</li><li>Gastroparesis</li><li>Erectile dysfunction</li></ul>`,
            prevention: `<p><strong>Primary Prevention (for high-risk individuals):</strong></p><ul><li>Weight loss of 5-7% body weight</li><li>&ge;150 minutes/week of moderate physical activity</li><li>Dietary modification (Mediterranean, DASH, or low-carb)</li><li>Smoking cessation</li><li>Metformin for prediabetes (especially BMI &ge;35, age <60, or prior GDM)</li></ul><p><strong>Screening:</strong> All adults &ge;35 years should be screened every 3 years; earlier and more frequent if risk factors present.</p>`
        },
        {
            id: 'asthma',
            name: 'Asthma',
            category: 'Respiratory',
            icon: '&#x1F32C;',
            overview: `<p><strong>Asthma</strong> is a chronic inflammatory airway disease characterized by variable respiratory symptoms and variable expiratory airflow limitation. It is clinically heterogeneous, with symptoms ranging from infrequent episodes to persistent disease with recurrent exacerbations and impaired lung function.</p><p>Typical symptoms include wheeze, dyspnea, chest tightness, and cough. Symptoms often fluctuate over time and are commonly triggered by exercise, viral respiratory infections, allergens, smoke, cold air, or occupational exposures. Some patients may appear entirely well between attacks.</p><p>Clinical priorities are symptom control, exacerbation prevention, preservation of lung function, and avoidance of treatment-related harm. Because airway inflammation is central to the disease process, inhaled corticosteroid-containing therapy is the foundation of long-term management.</p>`,
            etiology: `<p><strong>Asthma develops through interaction between host susceptibility and environmental exposure.</strong> There is no single cause.</p><p><strong>Common contributors include:</strong></p><ul><li>Family history of asthma or atopic disease</li><li>Atopy and allergic sensitization</li><li>Type 2 inflammation involving eosinophils, mast cells, T-helper 2 cells, IgE, IL-4, IL-5, and IL-13</li><li>Bronchial hyperresponsiveness</li><li>Airway remodeling in longstanding disease</li></ul><p><strong>Typical triggers include:</strong> dust mites, pollen, animal dander, molds, respiratory viruses, exercise, cold air, tobacco smoke, vaping, pollution, biomass smoke, strong odors, and occupational fumes or chemicals. Beta-blockers, aspirin, and other NSAIDs may worsen asthma in susceptible patients.</p>`,
            presentation: `<p>Asthma is often episodic, and the clinical picture may vary from visit to visit.</p><p><strong>Typical symptoms include:</strong></p><ul><li>Wheezing</li><li>Shortness of breath</li><li>Chest tightness</li><li>Cough, often worse at night or early morning</li></ul><p><strong>Features that support the diagnosis:</strong> symptoms that vary in intensity, worsen with exercise or cold air, and recur with allergen exposure or viral infection.</p><p><strong>Physical findings:</strong> the exam may be normal between episodes. During symptomatic periods, expiratory wheeze, prolonged expiration, reduced air entry, tachypnea, and accessory-muscle use may be present. Severe attacks may present with hypoxemia, inability to speak in full sentences, exhaustion, agitation, or a silent chest.</p>`,
            diagnosis: `<p>Asthma diagnosis should combine a compatible symptom history with objective evidence of variable airflow limitation whenever possible.</p><p><strong>Diagnostic approaches include:</strong></p><ul><li>Spirometry showing obstruction, often with reduced FEV1/FVC</li><li>Bronchodilator reversibility, typically an increase in FEV1 or FVC of at least 12% and 200 mL in adults</li><li>Peak expiratory flow monitoring demonstrating variability over time</li><li>Bronchial or exercise challenge testing when spirometry is nondiagnostic</li><li>Fractional exhaled nitric oxide and blood eosinophils as supportive markers of Type 2 inflammation</li></ul><p><strong>Common mimics and alternative diagnoses:</strong> COPD, upper airway cough syndrome, inducible laryngeal obstruction, gastroesophageal reflux disease, bronchiectasis, heart failure, pulmonary embolism, foreign-body aspiration, chronic respiratory infection, cystic fibrosis, medication-induced cough, and anxiety or hyperventilation disorders.</p>`,
            management: `<p>The management of asthma is directed at symptom control, risk reduction, and preservation of lung function. Ongoing care should be individualized and reviewed regularly.</p><p><strong>Core treatment principles:</strong></p><ul><li>Use ICS-containing therapy as the treatment foundation</li><li>Avoid SABA-only treatment as sole long-term therapy</li><li><strong>Preferred track:</strong> low-dose ICS-formoterol reliever, with maintenance-and-reliever therapy in higher steps</li><li><strong>Alternative track:</strong> ICS-SABA reliever or SABA with regular ICS-containing controller therapy</li><li>Severe disease may require specialist assessment and add-on therapy such as LAMA or biologics targeting IgE, IL-5/IL-5R, IL-4R alpha, or TSLP</li></ul><p><strong>Non-pharmacologic measures:</strong> smoking cessation, avoidance of second-hand smoke and vaping, regular physical activity, reduction of occupational exposures, management of obesity, and treatment of relevant comorbidities.</p><p><strong>Practical follow-up:</strong> review inhaler technique, adherence, symptom control, exacerbation history, and lung function before stepping treatment up. Provide a written asthma action plan and step down gradually once control is stable. Acute worsening may require repeated bronchodilator therapy, oxygen, systemic corticosteroids, ipratropium, or IV magnesium sulfate in selected severe cases.</p>`,
            complications: `<p><strong>Acute complications:</strong></p><ul><li>Severe airflow obstruction</li><li>Hypoxemia</li><li>Respiratory exhaustion</li><li>Acute respiratory failure</li><li>Status asthmaticus</li><li>Death in severe attacks</li></ul><p><strong>Longer-term and treatment-related complications:</strong></p><ul><li>Persistent airflow limitation and airway remodeling</li><li>Sleep disturbance, reduced exercise tolerance, absenteeism, anxiety, and impaired quality of life</li><li>Systemic corticosteroid adverse effects such as hyperglycemia, hypertension, osteoporosis, cataracts, adrenal suppression, weight gain, and infection risk</li></ul>`,
            prevention: `<p>Asthma cannot always be prevented, but morbidity can be substantially reduced through early recognition, appropriate controller therapy, and trigger reduction.</p><p><strong>Prevention strategies include:</strong></p><ul><li>Use ICS-containing treatment appropriately</li><li>Check and correct inhaler technique regularly</li><li>Support adherence and provide a written action plan</li><li>Avoid tobacco smoke, vaping, and other respiratory irritants</li><li>Reduce exposure to allergens, occupational sensitizers, and air pollution</li><li>Manage comorbidities such as allergic rhinitis, chronic rhinosinusitis, obesity, GERD, sleep apnea, anxiety, and depression</li><li>Provide recommended vaccinations and regular follow-up</li></ul>`
        },
        {
            id: 'htn',
            name: 'Hypertension',
            category: 'Cardiovascular',
            icon: '&#x2764;',
            overview: `<p><strong>Hypertension</strong> (high blood pressure) is a common condition in which the long-term force of the blood against your artery walls is high enough that it may eventually cause health problems, such as heart disease, stroke, and kidney disease.</p><p>Blood pressure is determined both by the amount of blood your heart pumps and the amount of resistance to blood flow in your arteries. The more blood your heart pumps and the narrower your arteries, the higher your blood pressure.</p>`,
            etiology: `<p><strong>Primary (Essential) Hypertension:</strong> Accounts for 90-95% of cases. Multifactorial &mdash; no single identifiable cause.</p><p><strong>Secondary Hypertension:</strong></p><ul><li>Renal: Chronic kidney disease, renal artery stenosis, polycystic kidney disease</li><li>Endocrine: Primary aldosteronism, pheochromocytoma, Cushing syndrome, hyperthyroidism, hyperparathyroidism</li><li>Vascular: Coarctation of the aorta</li><li>Neurologic: Obstructive sleep apnea, chronic stress</li><li>Drug-induced: NSAIDs, oral contraceptives, decongestants, stimulants, corticosteroids, calcineurin inhibitors, EPO</li></ul><p><strong>Risk Factors:</strong></p><ul><li>Age, family history, obesity, sedentary lifestyle, high sodium intake, low potassium intake, excessive alcohol, smoking, stress, African American ethnicity</li></ul>`,
            presentation: `<p><strong>Usually asymptomatic</strong> &mdash; often called the "silent killer."</p><p><strong>Symptoms (if present, usually with very high BP or complications):</strong></p><ul><li>Headache (especially morning occipital headache)</li><li>Dizziness</li><li>Blurred vision</li><li>Chest pain</li><li>Shortness of breath</li><li>Nosebleeds</li><li>Flushing</li></ul><p><strong>Signs of hypertensive emergency:</strong> Severe headache, altered mental status, chest pain, acute heart failure, acute kidney injury, papilledema</p>`,
            diagnosis: `<p><strong>ACC/AHA 2017 Classification:</strong></p><table class="dose-table"><tr><th>Category</th><th>Systolic (mmHg)</th><th>Diastolic (mmHg)</th></tr><tr><td>Normal</td><td><120</td><td>and <80</td></tr><tr><td>Elevated</td><td>120-129</td><td>and <80</td></tr><tr><td>Stage 1</td><td>130-139</td><td>or 80-89</td></tr><tr><td>Stage 2</td><td>&ge;140</td><td>or &ge;90</td></tr></table><p><strong>Diagnosis requires:</strong> Average of &ge;2 readings on &ge;2 occasions. Use proper technique: seated 5 min, arm at heart level, appropriate cuff size.</p><p><strong>Workup:</strong> BMP, fasting glucose, lipid panel, TSH, urinalysis, ECG, echocardiogram (if indicated), renal ultrasound (if secondary suspected)</p>`,
            management: `<p><strong>Lifestyle Modifications (for ALL patients):</strong></p><ul><li>Weight loss (target BMI 18.5-24.9 kg/m&sup2;)</li><li>DASH diet (fruits, vegetables, whole grains, low-fat dairy, reduced saturated fat)</li><li>Sodium restriction (<1,500-2,300 mg/day)</li><li>Physical activity (&ge;150 min/week moderate aerobic)</li><li>Limit alcohol (&le;2 drinks/day men, &le;1 drink/day women)</li><li>Smoking cessation</li><li>Stress management</li></ul><p><strong>Pharmacologic Therapy (Stage 1 with CVD risk or Stage 2):</strong></p><ul><li><strong>Thiazide diuretics</strong> (chlorthalidone, HCTZ) &mdash; first-line for many</li><li><strong>ACE inhibitors</strong> (lisinopril) &mdash; especially with CKD, diabetes, CAD</li><li><strong>ARBs</strong> (losartan) &mdash; if ACE-I cough/intolerance</li><li><strong>Calcium channel blockers</strong> (amlodipine) &mdash; especially in Black patients</li><li><strong>Beta-blockers</strong> &mdash; if CAD, heart failure, or post-MI</li></ul><p><strong>Target BP:</strong> <130/80 mmHg for most adults (ACC/AHA). <140/90 mmHg (JNC-8/ESH).</p>`,
            complications: `<p><strong>Cardiovascular:</strong></p><ul><li>Left ventricular hypertrophy &#x2192; heart failure</li><li>Coronary artery disease / MI</li><li>Aortic dissection</li></ul><p><strong>Cerebrovascular:</strong></p><ul><li>Ischemic stroke</li><li>Hemorrhagic stroke</li><li>Hypertensive encephalopathy</li></ul><p><strong>Renal:</strong></p><ul><li>Chronic kidney disease / nephrosclerosis</li><li>Proteinuria</li></ul><p><strong>Ocular:</strong></p><ul><li>Hypertensive retinopathy (AV nicking, hemorrhages, cotton-wool spots, papilledema)</li></ul>`,
            prevention: `<p><strong>Primary Prevention:</strong></p><ul><li>Maintain healthy weight throughout life</li><li>Regular physical activity from childhood</li><li>Diet rich in potassium, calcium, magnesium; low in sodium and saturated fat</li><li>Limit alcohol intake</li><li>Avoid tobacco</li><li>Manage stress</li><li>Regular BP screening starting at age 18</li></ul>`
        },
        {
            id: 'malaria',
            name: 'Malaria',
            category: 'Infectious Disease / Tropical',
            icon: '&#x1F99F;',
            overview: `<p><strong>Malaria</strong> is a life-threatening disease caused by <em>Plasmodium</em> parasites that are transmitted to people through the bites of infected female <em>Anopheles</em> mosquitoes.</p><p>Five parasite species cause malaria in humans: <em>P. falciparum</em> (most deadly), <em>P. vivax</em> (most widespread), <em>P. ovale</em>, <em>P. malariae</em>, and <em>P. knowlesi</em>.</p><p>Malaria is preventable and curable. In 2022, there were an estimated 249 million cases and 608,000 deaths globally, with 95% of cases in sub-Saharan Africa.</p>`,
            etiology: `<p><strong>Transmission:</strong></p><ul><li>Bite of infected female <em>Anopheles</em> mosquito (primary)</li><li>Congenital transmission (mother to fetus)</li><li>Blood transfusion / organ transplant</li><li>Needle sharing (rare)</li></ul><p><strong>Risk Factors:</strong></p><ul><li>Travel to or residence in endemic areas (sub-Saharan Africa, South Asia, Southeast Asia, South America)</li><li>Lack of preventive measures (bed nets, prophylaxis)</li><li>Pregnancy (increased susceptibility and severity)</li><li>Children under 5 years</li><li>Immunocompromised (HIV, splenectomy)</li></ul>`,
            presentation: `<p><strong>Uncomplicated Malaria:</strong></p><ul><li>Fever (often periodic/paroxysmal)</li><li>Chills and rigors</li><li>Headache</li><li>Myalgia and arthralgia</li><li>Fatigue</li><li>Nausea, vomiting, diarrhea</li><li>Anemia, jaundice</li></ul><p><strong>Severe Malaria (usually <em>P. falciparum</em>):</strong></p><ul><li>Impaired consciousness / coma (cerebral malaria)</li><li>Prostration (inability to sit/stand)</li><li>Multiple convulsions</li><li>Severe anemia (Hb <7 g/dL)</li><li>Acute kidney injury / hemoglobinuria (blackwater fever)</li><li>Acute respiratory distress syndrome (ARDS)</li><li>Shock / circulatory collapse</li><li>Hypoglycemia</li><li>Acidosis</li><li>Jaundice (bilirubin >3 mg/dL)</li></ul>`,
            diagnosis: `<p><strong>Gold Standard:</strong> Microscopic examination of thick and thin blood smears</p><p><strong>Rapid Diagnostic Tests (RDTs):</strong> Detect <em>P. falciparum</em>-specific HRP2 and pan-<em>Plasmodium</em> LDH or aldolase</p><p><strong>Laboratory Findings:</strong></p><ul><li>Thrombocytopenia (very common, even in mild disease)</li><li>Anemia</li><li>Elevated bilirubin and LDH</li><li>Hypoglycemia</li><li>Elevated creatinine</li><li>Metabolic acidosis</li></ul><p><strong>Molecular:</strong> PCR for species confirmation and drug resistance markers</p>`,
            management: `<p><strong>Uncomplicated <em>P. falciparum</em> (Artemisinin-based Combination Therapy &mdash; ACT):</strong></p><ul><li>Artemether-lumefantrine (Coartem)</li><li>Artesunate-amodiaquine</li><li>Dihydroartemisinin-piperaquine</li><li>Artesunate-mefloquine</li></ul><p><strong><em>P. vivax</em> / <em>P. ovale</em>:</strong></p><ul><li>Chloroquine (if sensitive) OR ACT</li><li>PLUS <strong>Primaquine</strong> or <strong>Tafenoquine</strong> for radical cure (hypnozoite eradication) &mdash; G6PD testing required</li></ul><p><strong>Severe Malaria:</strong></p><ul><li><strong>IV Artesunate</strong> (first-line, preferred over quinine)</li><li>Supportive care: fluids, blood transfusion, glucose monitoring, ventilation if needed</li></ul><p><strong>Special Populations:</strong></p><ul><li>Pregnancy: ACT in 2nd/3rd trimester; quinine + clindamycin in 1st trimester</li><li>Children: weight-based dosing; same ACT regimens</li></ul>`,
            complications: `<p><strong>Acute:</strong></p><ul><li>Cerebral malaria (coma, seizures, neurological deficits)</li><li>Severe anemia requiring transfusion</li><li>Acute kidney injury</li><li>ARDS</li><li>Hypoglycemia</li><li>Disseminated intravascular coagulation (DIC)</li><li>Shock / death</li></ul><p><strong>Chronic / Recurrent:</strong></p><ul><li>Splenomegaly and hypersplenism</li><li>Recurrent hemolysis</li><li>Chronic kidney disease (quartan malaria with <em>P. malariae</em>)</li><li>Burkitt lymphoma association (<em>P. falciparum</em>)</li></ul>`,
            prevention: `<p><strong>Vector Control:</strong></p><ul><li>Insecticide-treated mosquito nets (ITNs) &mdash; most effective single intervention</li><li>Indoor residual spraying (IRS)</li><li>Larval source management</li></ul><p><strong>Chemoprophylaxis (for travelers):</strong></p><ul><li>Atovaquone-proguanil (Malarone)</li><li>Doxycycline</li><li>Mefloquine</li><li>Primaquine (for <em>P. vivax</em> prevention, G6PD testing required)</li></ul><p><strong>Intermittent Preventive Treatment:</strong></p><ul><li>IPTp (pregnant women): Sulfadoxine-pyrimethamine</li><li>IPTi (infants): Sulfadoxine-pyrimethamine</li><li>Seasonal Malaria Chemoprevention (SMC): Sulfadoxine-pyrimethamine + amodiaquine</li></ul><p><strong>Vaccines:</strong> RTS,S/AS01 (Mosquirix) and R21/Matrix-M &mdash; WHO-recommended for children in endemic areas</p>`
        }
    ];

    function getMedLensExternalDiseases() {
        if (typeof window === 'undefined') return [];
        const store = window.MEDLENS_DISEASE_DATABASE;
        if (!store) return [];
        if (Array.isArray(store)) return store;
        if (typeof store === 'object') return Object.values(store);
        return [];
    }

    function mergeMedLensDiseaseSources(baseDiseases, externalDiseases) {
        const map = new Map();
        [...baseDiseases, ...externalDiseases].forEach(function (disease) {
            if (disease && disease.id) {
                map.set(disease.id, disease);
            }
        });
        return Array.from(map.values());
    }

    let diseases = mergeMedLensDiseaseSources(embeddedDiseases, getMedLensExternalDiseases());
    const embeddedInteractionData = [];

    function getMedLensExternalInteractions() {
        if (!window.MEDLENS_INTERACTIONS_DATABASE || typeof window.MEDLENS_INTERACTIONS_DATABASE !== 'object') return [];
        return Object.values(window.MEDLENS_INTERACTIONS_DATABASE).filter(Boolean);
    }

    function normalizeInteractionName(value) {
        return normalizeSearchText(value).replace(/\s+/g, ' ').trim();
    }

    function getInteractionPairKey(names) {
        return names.map(normalizeInteractionName).sort().join('__');
    }

    function getKnownDrugClassNames(drugName) {
        const normalized = normalizeInteractionName(drugName);
        const drug = drugs.find(function (item) {
            return normalizeInteractionName(item.generic) === normalized || normalizeInteractionName(item.brand) === normalized;
        });
        const classes = new Set();
        if (drug && drug.class) classes.add(drug.class);
        interactionData.forEach(function (record) {
            if (record.type !== 'class-level') return;
            if ((record.classMembers || []).some(function (member) { return normalizeInteractionName(member) === normalized; })) {
                (record.drugs || []).forEach(function (name) {
                    if (normalizeInteractionName(name) !== normalized) classes.add(name);
                });
            }
        });
        return Array.from(classes);
    }

    function normalizeInteractionRecord(record) {
        const drugsInRecord = Array.isArray(record.drugs) ? record.drugs : [];
        const names = drugsInRecord.map(function (drug) {
            return typeof drug === 'string' ? drug : (drug && (drug.generic || drug.name || drug.brand)) || '';
        }).filter(Boolean);
        if (names.length !== 2) return null;
        return Object.assign({}, record, {
            id: record.id || getInteractionPairKey(names),
            drugs: names,
            pairKey: getInteractionPairKey(names),
            severity: String(record.severity || 'unknown').toLowerCase(),
        });
    }

    function mergeMedLensInteractionSources(baseInteractions, externalInteractions) {
        const map = new Map();
        [...baseInteractions, ...externalInteractions].forEach(function (record) {
            const normalized = normalizeInteractionRecord(record);
            if (normalized) map.set(normalized.pairKey, normalized);
        });
        return Array.from(map.values());
    }

    let interactionData = mergeMedLensInteractionSources(embeddedInteractionData, getMedLensExternalInteractions());

    let selectedInteractionDrugs = [];
    let currentDrugAgeView = 'adult';
    let medlensScreenHistory = [];

    function getActiveScreenId() {
        const activeScreen = document.querySelector('.screen.active');
        if (!activeScreen) return 'home';
        return activeScreen.id.replace('screen-', '');
    }

    function showScreen(screenId, options = {}) {
        const currentScreenId = getActiveScreenId();
        if (!options.skipHistory && currentScreenId && currentScreenId !== screenId) {
            if (screenId === 'home') {
                medlensScreenHistory = [];
            } else if (currentScreenId !== 'home' || medlensScreenHistory.length > 0) {
                medlensScreenHistory.push(currentScreenId);
            }
        }
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const screen = document.getElementById('screen-' + screenId);
        if (screen) screen.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => {
            if (n.dataset.screen === screenId) n.classList.add('active');
        });
        window.scrollTo(0, 0);
    }

    function showDrugList() {
        renderDrugList(drugs);
        showScreen('drug-list');
    }

    function showDiseaseList() {
        renderDiseaseList(diseases);
        showScreen('disease-list');
    }

    function showInteraction() {
        showScreen('interaction');
        updateInteractionDatalist();
    }


    function normalizeSearchText(value) {
        return String(value || '')
            .toLowerCase()
            .replace(/<[^>]*>/g, ' ')
            .replace(/&[a-z0-9#]+;/gi, ' ')
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getDrugSearchText(drug) {
        return normalizeSearchText([
            drug.id,
            drug.brand,
            drug.generic,
            drug.class,
            drug.route,
            drug.mainUses,
            drug.components,
            drug.overview,
            drug.indications,
            drug.monograph && drug.monograph.overview && getMedLensSectionHtml(drug.monograph.overview, 'overview'),
            drug.monograph && drug.monograph.indicationDosage && getMedLensSectionHtml(drug.monograph.indicationDosage, 'indicationDosage')
        ].filter(Boolean).join(' '));
    }

    function getDiseaseSearchText(disease) {
        return normalizeSearchText([
            disease.id,
            disease.name,
            disease.category,
            disease.overview,
            disease.presentation,
            disease.management
        ].filter(Boolean).join(' '));
    }

    function hideGlobalSearch() {
        const panel = document.getElementById('searchResultsPanel');
        const clearBtn = document.getElementById('clearSearch');
        if (panel) {
            panel.classList.remove('active');
            panel.innerHTML = '';
        }
        if (clearBtn) clearBtn.classList.remove('active');
    }

    function openSearchDrug(drugId) {
        hideGlobalSearch();
        const input = document.getElementById('searchInput');
        if (input) input.value = '';
        showDrugDetail(drugId);
    }

    function openSearchDisease(diseaseId) {
        hideGlobalSearch();
        const input = document.getElementById('searchInput');
        if (input) input.value = '';
        showDiseaseDetail(diseaseId);
    }

    function renderSearchGroup(title, items) {
        if (!items.length) return '';
        return '<div class="search-results-section">' +
            '<div class="search-results-section-title">' + escapeHtml(title) + '</div>' +
            items.join('') +
        '</div>';
    }

    function renderDrugSearchResult(drug) {
        const hints = sanitizeVisibleText([drug.brand && drug.brand !== drug.generic ? drug.brand : '', getDrugClassLabel(drug)].filter(Boolean).join(' / '));
        return '<button type="button" class="search-result-item" onclick="openSearchDrug(\'' + drug.id + '\')">' +
            '<span class="search-result-copy"><span class="search-result-title">' + escapeHtml(sanitizeVisibleText(drug.generic || drug.brand || drug.id)) + '</span>' +
            (hints ? '<span class="search-result-subtitle">' + escapeHtml(hints) + '</span>' : '') + '</span>' +
        '</button>';
    }

    function renderDiseaseSearchResult(disease) {
        const hint = sanitizeVisibleText(disease.category || '');
        return '<button type="button" class="search-result-item" onclick="openSearchDisease(\'' + disease.id + '\')">' +
            '<span class="search-result-copy"><span class="search-result-title">' + escapeHtml(sanitizeVisibleText(disease.name || disease.id)) + '</span>' +
            (hint ? '<span class="search-result-subtitle">' + escapeHtml(hint) + '</span>' : '') + '</span>' +
        '</button>';
    }

    function handleGlobalSearch(query) {
        const panel = document.getElementById('searchResultsPanel');
        const clearBtn = document.getElementById('clearSearch');
        const normalized = normalizeSearchText(query);
        if (clearBtn) clearBtn.classList.toggle('active', !!normalized);
        if (!panel) return;
        if (normalized.length < 2) {
            hideGlobalSearch();
            return;
        }

        const terms = normalized.split(' ').filter(Boolean);
        const matchesAll = function (haystack) { return terms.every(function (term) { return haystack.includes(term); }); };
        const drugResults = drugs.filter(function (drug) { return matchesAll(getDrugSearchText(drug)); }).slice(0, 8).map(renderDrugSearchResult);
        const diseaseResults = diseases.filter(function (disease) { return matchesAll(getDiseaseSearchText(disease)); }).slice(0, 5).map(renderDiseaseSearchResult);
        const html = renderSearchGroup('Drugs', drugResults) + renderSearchGroup('Diseases', diseaseResults);

        panel.innerHTML = html || '<div class="search-results-empty">No matches found. Try a drug name, generic name, condition, or disease.</div>';
        panel.classList.add('active');
    }

    function setupGlobalSearch() {
        const input = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearSearch');
        if (!input) return;
        input.addEventListener('input', function () { handleGlobalSearch(input.value); });
        input.addEventListener('focus', function () { if (input.value.trim().length >= 2) handleGlobalSearch(input.value); });
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                input.value = '';
                hideGlobalSearch();
                input.blur();
            }
        });
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                input.value = '';
                hideGlobalSearch();
                input.focus();
            });
        }
        document.addEventListener('click', function (event) {
            const searchWrap = document.getElementById('searchBarWrap');
            const panel = document.getElementById('searchResultsPanel');
            if (!searchWrap || !panel) return;
            if (!searchWrap.contains(event.target) && !panel.contains(event.target)) hideGlobalSearch();
        });
    }
    function showFavorites() {
        showScreen('favorites');
    }

    function goBackToMenu() {
        const activeScreenId = getActiveScreenId();
        if (activeScreenId === 'home') {
            window.location.href = 'index.html?screen=extra-screen';
            return;
        }
        const previousScreenId = medlensScreenHistory.pop();
        if (previousScreenId) {
            showScreen(previousScreenId, { skipHistory: true });
            return;
        }
        showScreen('home', { skipHistory: true });
    }

        function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function(char) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[char];
        });
    }
    function getDrugIcon() {
        return '&#x1F48A;';
    }
    function normalizeDrugLabel(value) {
        return sanitizeVisibleText(String(value || '')
            .replace(/&beta;/gi, 'β')
            .replace(/&lt;sub&gt;/gi, '<sub>')
            .replace(/&lt;\/sub&gt;/gi, '</sub>')
            .replace(/&sup2;/gi, '²')
            .replace(/&ge;/gi, '≥')
            .replace(/&le;/gi, '≤')
            .replace(/<sub>2<\/sub>/gi, '2')
            .replace(/<sub>([^<]+)<\/sub>/gi, '$1'));
    }

    function sanitizeVisibleText(value) {
        let text = String(value || '');
        const replacements = [
            [/\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00ac\u00c5\u201c|\u00c3\u00a2\u00e2\u201a\u00ac\u00e2\u20ac\u0153|\u00e2\u20ac\u201c/g, '-'],
            [/\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u009d|\u00c3\u00a2\u00e2\u201a\u00ac\u00e2\u20ac\u009d|\u00e2\u20ac\u201d/g, '-'],
            [/\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u00b0\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u00a5|\u00c3\u00a2\u00e2\u20ac\u00b0\u00c2\u00a5|\u00e2\u2030\u00a5/g, '≥'],
            [/\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u00b0\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u00a4|\u00c3\u00a2\u00e2\u20ac\u00b0\u00c2\u00a4|\u00e2\u2030\u00a4/g, '≤'],
            [/\u00c3\u0192\u00c5\u00bd\u00c3\u201a\u00c2\u00b2|\u00c3\u017d\u00c2\u00b2|\u00ce\u00b2/g, 'β'],
            [/\u00c3\u0192\u00e2\u20ac\u0161\u00c3\u201a\u00c2\u00b2|\u00c3\u201a\u00c2\u00b2|\u00c2\u00b2/g, '²'],
            [/\u00c3\u0192\u00e2\u20ac\u201d|\u00c3\u2014/g, '×'],
            [/\u00c3\u0192\u00c2\u00b7|\u00c3\u00b7/g, '÷'],
            [/\u00e2\u02c6\u2019/g, '-'],
            [/\u00e2\u02c6\u0161/g, '√'],
            [/\u00c2\u00b5/g, 'µ'],
            [/\u00c2\u00b0/g, '°'],
            [/\u00c2\u00b1/g, '±'],
            [/\u00c2/g, ''],
        ];
        for (let i = 0; i < 3; i += 1) {
            for (const pair of replacements) text = text.replace(pair[0], pair[1]);
        }
        text = text
            .replace(/\u00c3\u0192[\s\S]{0,120}?(?=(?:adrenergic|agonist|antagonist|inhibitor|blocker|steroid|antibiotic|\(|\)|\/|$))/gi, '')
            .replace(/(?:\u00c3|\u00c2|\u00e2\u20ac|\u00e2\u20ac\u0153|\u00e2\u20ac\u009d|\u00e2\u20ac\u2122|\u00e2\u20ac\u02dc|\u00c3\u00a2|\u00c3\u201a|\u00c3\u0192)[^\s,;)\/]{0,80}/g, '')
            .replace(/\bBeta\s*2\b/gi, 'β2')
            .replace(/\s*-\s*/g, '-')
            .replace(/\s{2,}/g, ' ')
            .trim();
        return text;
    }

    function sortByDisplayName(list, getName) {
        return list.slice().sort(function (a, b) {
            return String(getName(a) || '').localeCompare(String(getName(b) || ''), undefined, { sensitivity: 'base' });
        });
    }

    function getAlphaGroupLabel(value) {
        const first = String(value || '').trim().charAt(0).toUpperCase();
        return /^[A-Z]$/.test(first) ? first : '#';
    }

    function renderAlphaGroupedList(list, getName, renderItem) {
        let currentGroup = '';
        return list.map(function (item) {
            const name = getName(item);
            const group = getAlphaGroupLabel(name);
            const divider = group !== currentGroup ? '<div class="alpha-divider">' + escapeHtml(group) + '</div>' : '';
            currentGroup = group;
            return divider + renderItem(item, name);
        }).join('');
    }
    function renderDrugList(list) {
        const container = document.getElementById('drugListContainer');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">&#x1F50D;</div><h3>No drugs found</h3><p>Try a different search term</p></div>`;
            return;
        }
        const sorted = sortByDisplayName(list, function (drug) { return drug.generic || drug.brand || drug.id; });
        container.innerHTML = renderAlphaGroupedList(sorted, function (drug) {
            return drug.generic || drug.brand || drug.id;
        }, function (drug, name) {
            return `<button type="button" class="drug-item" onclick="showDrugDetail('${drug.id}')"><span class="drug-item-name">${escapeHtml(name)}</span></button>`;
        });
    }
    function getMedLensSectionSource(drug, key) {
        const monograph = drug.monograph || {};
        if (key === 'dose') return monograph.dose || drug.dose || '';
        if (key === 'indications') return monograph.indications || drug.indications || drug.mainUses || '';
        if (key === 'warnings') return monograph.warnings || drug.warnings || '';
        if (key === 'sideEffects') return monograph.sideEffects || drug.sideEffects || '';
        if (key === 'patientInfo') return monograph.patientInfo || drug.patientInfo || '';
        if (key === 'formulation') return monograph.formulation || drug.formulation || '';
        if (key === 'storage') return monograph.storage || drug.storage || '';
        if (key === 'geriatricUse') return monograph.geriatricUse || drug.geriatricUse || '';
        return monograph[key] || drug[key] || '';
    }

    function getMedLensSectionHtml(source, sectionKey, ageView) {
        if (!source) return '';
        if (Array.isArray(source)) {
            return source.map(function (item) {
                return getMedLensSectionHtml(item, sectionKey, ageView);
            }).filter(Boolean).join(' ');
        }
        const type = typeof source;
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return String(source);
        }
        if (type !== 'object') {
            return String(source || '');
        }
        if (source.adult || source.pediatric) {
            const active = ageView === 'pediatric' ? (source.pediatric || source.adult) : (source.adult || source.pediatric);
            return getMedLensSectionHtml(active, sectionKey, ageView);
        }
        return source.detailsHtml || source.details || source.html || source.body || source.content || source.text || source.summaryHtml || source.summary || '';
    }

    function getMedLensSectionSummary(source, sectionKey, ageView) {
        if (!source) return '';
        if (Array.isArray(source)) {
            return source.map(function (item) {
                return getMedLensSectionSummary(item, sectionKey, ageView);
            }).filter(Boolean).join(' ');
        }
        const type = typeof source;
        if (type === 'string' || type === 'number' || type === 'boolean') {
            return compactMedLensMarkup(String(source), sectionKey);
        }
        if (type !== 'object') {
            return compactMedLensMarkup(String(source || ''), sectionKey);
        }
        if (source.adult || source.pediatric) {
            const active = ageView === 'pediatric' ? (source.pediatric || source.adult) : (source.adult || source.pediatric);
            return getMedLensSectionSummary(active, sectionKey, ageView);
        }
        if (source.summaryHtml) return source.summaryHtml;
        if (source.summary) return compactMedLensMarkup(source.summary, sectionKey);
        return compactMedLensMarkup(getMedLensSectionHtml(source, sectionKey, ageView), sectionKey);
    }

    function renderMonographSectionBody(summaryHtml, detailsHtml) {
        return '<div class="info-card-body monograph-section-body">' +
            (detailsHtml ? '<div class="medlens-article">' + detailsHtml + '</div>' : '') +
        '</div>';
    }

    const DRUG_PRESENTATION_SECTIONS = [
        { key: 'overview', label: 'Overview', title: 'Overview', sources: ['overview'] },
        { key: 'indicationDosage', label: 'Indication & Dosage', title: 'Indication & Dosage', sources: ['indications', 'dose'], ageAware: true },
        { key: 'mechanism', label: 'Mechanism of Action', title: 'Mechanism of Action', sources: ['mechanism', 'pharmacokinetics'] },
        { key: 'warningsContraindications', label: 'Warnings & Contraindication', title: 'Warnings & Contraindication', sources: ['warnings', 'contraindications'] },
        { key: 'sideEffects', label: 'Adverse Reactions', title: 'Adverse Reactions', sources: ['sideEffects'] },
        { key: 'interactions', label: 'Drug Interactions', title: 'Drug Interactions', sources: ['interactions'] },
        { key: 'specialPopulation', label: 'Special Population', title: 'Special Population', sources: ['pregnancy', 'pediatricUse', 'geriatricUse'] },
        { key: 'clinicalEvidence', label: 'Clinical Evidence', title: 'Clinical Evidence', sources: ['clinicalStudies'] },
        { key: 'practicalInformation', label: 'Practical Information', title: 'Practical Information', sources: ['formulation', 'storage', 'overdosage', 'patientInfo'] },
    ];

    const DRUG_SOURCE_LABELS = {
        indications: 'Indications',
        dose: 'Dosage',
        mechanism: 'Mechanism',
        pharmacokinetics: 'Pharmacokinetics',
        warnings: 'Warnings & Precautions',
        contraindications: 'Contraindications',
        sideEffects: 'Adverse Reactions',
        interactions: 'Drug Interactions',
        pregnancy: 'Pregnancy & Lactation',
        pediatricUse: 'Pediatric Use',
        geriatricUse: 'Geriatric Use',
        clinicalStudies: 'Clinical Studies',
        formulation: 'Formulations & Strengths',
        storage: 'Storage & Handling',
        overdosage: 'Overdosage',
        patientInfo: 'Patient Counseling',
    };


    function wrapMedLensTables(html) {
        return String(html || '').replace(/(<table[\s\S]*?<\/table>)/gi, function (match) {
            if (/medlens-table-scroll/i.test(match)) return match;
            return '<div class="medlens-table-scroll">' + match + '</div>';
        });
    }
    function renderStoredMedLensArticle(value, sectionKey) {
        const raw = stripMedLensSourceHeadings(String(value || '')).trim();
        if (!raw) return '';
        const looksAuthored = /class="medlens-callout|<table[\s>]|<ul[\s>]|<ol[\s>]|<p[\s>]/i.test(raw);
        if (looksAuthored) return wrapMedLensTables(raw);
        return wrapMedLensTables(renderFullMedLensMarkup(raw, sectionKey));
    }

    function renderCompositeDrugSection(drug, def, ageView) {
        const directSource = getMedLensSectionSource(drug, def.key);
        const directHtml = getMedLensSectionHtml(directSource, def.key, ageView);
        if (directHtml) {
            return '<div class="info-card-body monograph-section-body"><div id="' + def.key + '-content" class="medlens-article">' + renderStoredMedLensArticle(directHtml, def.key) + '</div></div>';
        }

        const parts = [];
        def.sources.forEach(function (sourceKey) {
            const source = getMedLensSectionSource(drug, sourceKey);
            const sourceHtml = getMedLensSectionHtml(source, sourceKey, ageView);
            if (!sourceHtml) return;
            const rendered = wrapMedLensTables(renderFullMedLensMarkup(sourceHtml, sourceKey));
            if (!rendered) return;
            parts.push('<section class="medlens-subsection"><h3 class="medlens-subsection-title">' + escapeHtml(DRUG_SOURCE_LABELS[sourceKey] || sourceKey) + '</h3>' + rendered + '</section>');
        });

        if (!parts.length) return '';
        return '<div class="info-card-body monograph-section-body"><div id="' + def.key + '-content" class="medlens-article">' + parts.join('') + '</div></div>';
    }

    function buildDrugSections(drug) {
        const sections = [];
        DRUG_PRESENTATION_SECTIONS.forEach(function (def) {
            const html = renderCompositeDrugSection(drug, def, currentDrugAgeView);
            if (html) {
                sections.push({
                    key: def.key,
                    label: def.label,
                    title: def.title,
                    html: html,
                    ageAware: !!def.ageAware,
                });
            }
        });
        return sections;
    }

    function renderDrugSectionTabs(drug, sections) {
        return sections.map(function (section, index) {
            return '<button class="tab-btn' + (index === 0 ? ' active' : '') + '" onclick="switchDrugTab(\'' + section.key + '\', \'' + drug.id + '\')" data-tab="' + section.key + '">' + escapeHtml(section.label) + '</button>';
        }).join('');
    }

    function renderDrugSectionPanels(drug, sections) {
        return sections.map(function (section, index) {
            return '<div class="tab-content' + (index === 0 ? ' active' : '') + '" id="tab-' + section.key + '"><article class="medlens-section"><h2 class="medlens-section-title">' + escapeHtml(section.title) + '</h2>' + section.html + '</article></div>';
        }).join('');
    }

    function showDrugDetail(drugId) {
        const drug = drugs.find(d => d.id === drugId);
        if (!drug) return;
        currentDrugAgeView = 'adult';
        const sections = buildDrugSections(drug);
        const monographSource = drug.monograph && drug.monograph.source ? drug.monograph.source : {};
        const metaBits = [];
        if (drug.generic && drug.generic !== drug.brand) metaBits.push('<span class="detail-chip">' + escapeHtml(drug.generic) + '</span>');
        if (drug.route) metaBits.push('<span class="detail-chip">' + escapeHtml(drug.route) + '</span>');
        if (drug.class) metaBits.push('<span class="detail-chip">' + escapeHtml(drug.class) + '</span>');
        if (monographSource.name) metaBits.push('<span class="detail-chip">' + escapeHtml(monographSource.name) + '</span>');
        if (monographSource.labelVersion) metaBits.push('<span class="detail-chip">Label ' + escapeHtml(monographSource.labelVersion) + '</span>');
        const container = document.getElementById('drugDetailContainer');
        container.innerHTML = `
            <div class="detail-shell detail-shell-drug">
                <div class="detail-sidebar">
                    <div class="detail-header">
                        <div class="detail-title-wrap">
                            <div class="detail-icon">${getDrugIcon(drug)}</div>
                            <div class="detail-title-block">
                                <div class="detail-brand">${escapeHtml(drug.brand)}</div>
                                ${drug.generic && drug.generic !== drug.brand ? `<div class="detail-subtitle">${escapeHtml(drug.generic)}</div>` : ''}
                                ${metaBits.length ? `<div class="detail-meta">${metaBits.join('')}</div>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="tab-nav">
                        ${renderDrugSectionTabs(drug, sections)}
                    </div>
                </div>
                <div class="detail-main">
                    ${renderDrugSectionPanels(drug, sections)}
                </div>
            </div>
        `;
        showScreen('drug-detail');
        setupDrugTabSwipe(drug.id, sections);
    }

    function switchDrugAge(age, drugId) {
        document.querySelectorAll('.age-toggle-btn').forEach(b => b.classList.remove('active'));
        const active = document.getElementById('ageBtn-' + age);
        if (active) active.classList.add('active');
        const drug = drugs.find(d => d.id === drugId);
        if (!drug) return;
        currentDrugAgeView = age;
        const sections = buildDrugSections(drug);
        sections.forEach(function (section) {
            const panel = document.getElementById('tab-' + section.key);
            const next = sections.find(function (item) { return item.key === section.key; });
            if (panel && next) panel.innerHTML = '<article class="medlens-section"><h2 class="medlens-section-title">' + escapeHtml(next.title) + '</h2>' + next.html + '</article>';
        });
    }


    function getDrugTabKeys() {
        return Array.from(document.querySelectorAll('#screen-drug-detail .tab-btn[data-tab]')).map(function (button) {
            return button.dataset.tab;
        }).filter(Boolean);
    }

    function getActiveDrugTabKey() {
        const active = document.querySelector('#screen-drug-detail .tab-btn.active[data-tab]');
        return active ? active.dataset.tab : '';
    }

    function switchAdjacentDrugTab(direction, drugId) {
        const keys = getDrugTabKeys();
        if (!keys.length) return;
        const activeKey = getActiveDrugTabKey() || keys[0];
        const activeIndex = Math.max(0, keys.indexOf(activeKey));
        const nextIndex = Math.min(keys.length - 1, Math.max(0, activeIndex + direction));
        if (nextIndex === activeIndex) return;
        switchDrugTab(keys[nextIndex], drugId);
    }

    function setupDrugTabSwipe(drugId, sections) {
        const main = document.querySelector('#screen-drug-detail .detail-main');
        if (!main || !sections || sections.length < 2) return;
        let startX = 0;
        let startY = 0;
        let tracking = false;
        main.addEventListener('touchstart', function (event) {
            if (event.touches.length !== 1) return;
            if (event.target.closest('.medlens-table-scroll')) return;
            startX = event.touches[0].clientX;
            startY = event.touches[0].clientY;
            tracking = true;
        }, { passive: true });
        main.addEventListener('touchend', function (event) {
            if (!tracking || !event.changedTouches.length) return;
            tracking = false;
            const dx = event.changedTouches[0].clientX - startX;
            const dy = event.changedTouches[0].clientY - startY;
            if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
            switchAdjacentDrugTab(dx < 0 ? 1 : -1, drugId);
        }, { passive: true });
    }
    function switchDrugTab(tabName, drugId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const tabButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (tabButton) {
            tabButton.classList.add('active');
            tabButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
        const tabContent = document.getElementById('tab-' + tabName);
        if (tabContent) tabContent.classList.add('active');
    }
    function renderDiseaseList(list) {
        const container = document.getElementById('diseaseListContainer');
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">&#x1F50D;</div><h3>No diseases found</h3><p>Try a different search term</p></div>`;
            return;
        }
        const sorted = sortByDisplayName(list, function (disease) { return disease.name || disease.id; });
        container.innerHTML = renderAlphaGroupedList(sorted, function (disease) {
            return disease.name || disease.id;
        }, function (disease, name) {
            return `<button type="button" class="drug-item" onclick="showDiseaseDetail('${disease.id}')"><span class="drug-item-name">${escapeHtml(name)}</span></button>`;
        });
    }
    const DISEASE_SECTION_DEFS = [
        { key: 'overview', label: 'Overview', legacyKey: 'overview' },
        { key: 'causesRiskFactors', label: 'Causes & Risk Factors', legacyKey: 'etiology' },
        { key: 'clinicalPresentation', label: 'Clinical Presentation', legacyKey: 'presentation' },
        { key: 'diagnosis', label: 'Diagnosis', legacyKey: 'diagnosis' },
        { key: 'treatmentManagement', label: 'Treatment & Management', legacyKey: 'management' },
        { key: 'complications', label: 'Complications', legacyKey: 'complications' },
        { key: 'prevention', label: 'Prevention', legacyKey: 'prevention' },
        { key: 'patientEducation', label: 'Patient Education', legacyKey: 'prevention' },
        { key: 'clinicalEvidence', label: 'Clinical Evidence', legacyKey: 'diagnosis' }
    ];

    function getDiseaseSectionHtml(disease, sectionDef) {
        const monographSection = disease && disease.monograph && disease.monograph[sectionDef.key];
        const editedHtml = monographSection && (monographSection.detailsHtml || monographSection.articleHtml || monographSection.html);
        if (editedHtml) return editedHtml;
        return disease && disease[sectionDef.legacyKey] ? disease[sectionDef.legacyKey] : '';
    }

    function getDiseaseSections(disease) {
        return DISEASE_SECTION_DEFS.map(function (sectionDef) {
            return {
                key: sectionDef.key,
                label: sectionDef.label,
                html: getDiseaseSectionHtml(disease, sectionDef)
            };
        }).filter(function (section) {
            return String(section.html || '').trim();
        });
    }

    function renderDiseaseTabButtons(disease) {
        return getDiseaseSections(disease).map(function (section, index) {
            const active = index === 0 ? ' active' : '';
            return `<button class="tab-btn${active}" onclick="switchDiseaseTab('${section.key}', '${disease.id}')" data-dtab="${section.key}">${escapeHtml(section.label)}</button>`;
        }).join('');
    }

    function renderDiseaseTabContents(disease) {
        return getDiseaseSections(disease).map(function (section, index) {
            const active = index === 0 ? ' active' : '';
            return `<div class="tab-content disease-detail${active}" id="dtab-${section.key}">
                <div class="info-card-title"><span class="dot"></span>${escapeHtml(section.label)}</div>
                <div class="info-card-body medlens-article-body">${normalizeMedLensMarkup(section.html)}</div>
            </div>`;
        }).join('');
    }

    function showDiseaseDetail(diseaseId) {
        const disease = diseases.find(d => d.id === diseaseId);
        if (!disease) return;
        const container = document.getElementById('diseaseDetailContainer');
        container.innerHTML = `
            <div class="detail-shell detail-shell-disease">
                <div class="detail-sidebar">
                    <div class="detail-header">
                        <div class="detail-title-wrap">
                            <div class="detail-icon" style="background:linear-gradient(135deg,var(--accent),#e55a2b);">${disease.icon || '&#x2695;'}</div>
                            <div class="detail-title-block">
                                <div class="detail-brand">${escapeHtml(disease.name)}</div>
                                <div class="detail-generic">${escapeHtml(disease.category || 'Disease')}</div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-nav">
                        ${renderDiseaseTabButtons(disease)}
                    </div>
                </div>
                <div class="detail-main">
                    ${renderDiseaseTabContents(disease)}
                </div>
            </div>
        `;
        showScreen('disease-detail');
    }
    function switchDiseaseTab(tabName, diseaseId) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const tabButton = document.querySelector(`.tab-btn[data-dtab="${tabName}"]`);
        if (tabButton) {
            tabButton.classList.add('active');
            tabButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
        const tabContent = document.getElementById('dtab-' + tabName);
        if (tabContent) tabContent.classList.add('active');
    }

    function getInteractionDrugOptions() {
        const names = new Set();
        drugs.forEach(function (drug) {
            if (drug.generic) names.add(drug.generic);
            if (drug.brand) names.add(drug.brand);
        });
        interactionData.forEach(function (record) {
            (record.drugs || []).forEach(function (name) { if (name) names.add(name); });
        });
        return Array.from(names).sort(function (a, b) { return a.localeCompare(b); });
    }

    function findInteractionDrugName(inputName) {
        const normalized = normalizeInteractionName(inputName);
        return getInteractionDrugOptions().find(function (name) { return normalizeInteractionName(name) === normalized; }) || '';
    }

    let interactionAutoAddTimer = null;

    function queueAutoAddInteractionDrug() {
        clearTimeout(interactionAutoAddTimer);
        interactionAutoAddTimer = setTimeout(function () {
            const input = document.getElementById('interactionInput');
            if (!input) return;
            const matchedName = findInteractionDrugName(input.value.trim());
            if (matchedName) addInteractionDrug({ silentMissing: true });
        }, 80);
    }

    function bindInteractionInputAutoAdd() {
        const input = document.getElementById('interactionInput');
        if (!input || input.dataset.autoAddBound === 'true') return;
        input.dataset.autoAddBound = 'true';
        input.addEventListener('input', queueAutoAddInteractionDrug);
        input.addEventListener('change', queueAutoAddInteractionDrug);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                addInteractionDrug();
            }
        });
    }

    function updateInteractionDatalist() {
        interactionData = mergeMedLensInteractionSources(embeddedInteractionData, getMedLensExternalInteractions());
        bindInteractionInputAutoAdd();
        const datalist = document.getElementById('drugDatalist');
        if (!datalist) return;
        datalist.innerHTML = getInteractionDrugOptions().map(function (name) {
            return '<option value="' + escapeHtml(name) + '">';
        }).join('');
    }

    function addInteractionDrug(options) {
        options = options || {};
        clearTimeout(interactionAutoAddTimer);
        const input = document.getElementById('interactionInput');
        const name = input.value.trim();
        if (!name) return;
        const matchedName = findInteractionDrugName(name);
        if (!matchedName) {
            if (!options.silentMissing) alert('Drug not found in MedLens. Please select a name from the list.');
            return;
        }
        if (selectedInteractionDrugs.some(function (existing) { return normalizeInteractionName(existing) === normalizeInteractionName(matchedName); })) {
            alert('This drug is already in your list.');
            return;
        }
        selectedInteractionDrugs.push(matchedName);
        input.value = '';
        renderInteractionTags();
        document.getElementById('checkBtn').disabled = selectedInteractionDrugs.length < 2;
        document.getElementById('interactionResults').classList.remove('active');
    }

    function removeInteractionDrug(index) {
        selectedInteractionDrugs.splice(index, 1);
        renderInteractionTags();
        document.getElementById('checkBtn').disabled = selectedInteractionDrugs.length < 2;
        if (selectedInteractionDrugs.length < 2) {
            document.getElementById('interactionResults').classList.remove('active');
        }
    }

    function renderInteractionTags() {
        const container = document.getElementById('interactionTags');
        if (!container) return;
        container.innerHTML = selectedInteractionDrugs.map(function (name, index) {
            return '<div class="drug-tag">' + escapeHtml(name) + '<button class="drug-tag-remove" onclick="removeInteractionDrug(' + index + ')">&times;</button></div>';
        }).join('');
    }

    function findInteractionForPair(drugA, drugB) {
        const exactKey = getInteractionPairKey([drugA, drugB]);
        const exact = interactionData.find(function (record) { return record.pairKey === exactKey; });
        if (exact) return exact;
        const classNamesA = getKnownDrugClassNames(drugA);
        const classNamesB = getKnownDrugClassNames(drugB);
        const classCandidates = [];
        classNamesA.forEach(function (className) { classCandidates.push([className, drugB]); });
        classNamesB.forEach(function (className) { classCandidates.push([drugA, className]); });
        for (const candidate of classCandidates) {
            const key = getInteractionPairKey(candidate);
            const found = interactionData.find(function (record) { return record.type === 'class-level' && record.pairKey === key; });
            if (found) return Object.assign({}, found, { matchedByClass: true, matchedClassPair: candidate });
        }
        return null;
    }

    function runInteractionCheck() {
        if (selectedInteractionDrugs.length < 2) return;
        interactionData = mergeMedLensInteractionSources(embeddedInteractionData, getMedLensExternalInteractions());
        const results = [];
        const unknownPairs = [];
        for (let i = 0; i < selectedInteractionDrugs.length; i++) {
            for (let j = i + 1; j < selectedInteractionDrugs.length; j++) {
                const drugA = selectedInteractionDrugs[i];
                const drugB = selectedInteractionDrugs[j];
                const found = findInteractionForPair(drugA, drugB);
                if (found) results.push(Object.assign({}, found, { pair: [drugA, drugB] }));
                else unknownPairs.push([drugA, drugB]);
            }
        }
        renderInteractionResults(results, unknownPairs);
    }

    function severityLabel(severity) {
        const labels = { contraindicated: 'Contraindicated', major: 'Major', severe: 'Major', moderate: 'Moderate', minor: 'Minor', unknown: 'Unknown' };
        return labels[severity] || 'Unknown';
    }

    function renderInteractionField(label, value) {
        if (!value) return '';
        return '<div class="interaction-field"><strong>' + escapeHtml(label) + '</strong><span>' + escapeHtml(value) + '</span></div>';
    }

    function renderInteractionPairNames(pair) {
        return pair.map(function (name) {
            return '<span class="interaction-drug-name">' + escapeHtml(name) + '</span>';
        }).join('<span class="interaction-plus">+</span>');
    }

    function renderInteractionResults(results, unknownPairs) {
        const container = document.getElementById('interactionResults');
        if (!container) return;
        unknownPairs = unknownPairs || [];
        if (results.length === 0 && unknownPairs.length === 0) return;
        if (results.length === 0) {
            container.innerHTML = '<div class="no-interaction"><div class="no-interaction-icon">&#x2139;</div><h3>No MedLens Interaction Record Yet</h3><p>No interaction record is currently available in MedLens for this selected pair. This does not rule out an interaction, so verify clinically before making medication decisions.</p></div>';
            container.classList.add('active');
            return;
        }
        const major = results.filter(r => r.severity === 'major' || r.severity === 'severe' || r.severity === 'contraindicated').length;
        const moderate = results.filter(r => r.severity === 'moderate').length;
        const minor = results.filter(r => r.severity === 'minor').length;
        container.innerHTML =
            '<div class="interaction-summary">' +
                '<div class="summary-card severe"><div class="summary-card-count">' + major + '</div><div class="summary-card-label">Major</div></div>' +
                '<div class="summary-card moderate"><div class="summary-card-count">' + moderate + '</div><div class="summary-card-label">Moderate</div></div>' +
                '<div class="summary-card minor"><div class="summary-card-count">' + minor + '</div><div class="summary-card-label">Minor</div></div>' +
            '</div>' +
            results.map(function (r) {
                return '<div class="interaction-card ' + escapeHtml(r.severity) + '">' +
                    '<div class="interaction-card-header">' +
                        '<div class="interaction-drugs">' + renderInteractionPairNames(r.pair) + '</div>' +
                        '<div class="interaction-severity ' + escapeHtml(r.severity) + '">' + severityLabel(r.severity) + '</div>' +
                    '</div>' +
                    (r.matchedByClass ? '<div class="interaction-desc"><strong>Class-level match</strong><span>This result is based on a label warning for ' + escapeHtml((r.matchedClassPair || r.drugs).join(' + ')) + ', not a directly named exact pair.</span></div>' : '') +
                    '<div class="interaction-desc"><strong>Clinical concern</strong><span>' + escapeHtml(r.clinicalConcern || r.desc || 'Interaction details are available, but the clinical concern still needs editorial review.') + '</span></div>' +
                    '<div class="interaction-field-grid">' +
                        renderInteractionField('Mechanism', r.mechanism) +
                        renderInteractionField('Management', r.management) +
                        renderInteractionField('Monitoring', r.monitoring) +
                        renderInteractionField('Patient counseling', r.counseling) +
                        renderInteractionField('Evidence note', r.evidence) +
                    '</div>' +
                '</div>';
            }).join('') +
            (unknownPairs.length ? '<div class="no-interaction"><h3>Unchecked Pair' + (unknownPairs.length > 1 ? 's' : '') + '</h3><p>' + escapeHtml(unknownPairs.map(pair => pair.join(' + ')).join('; ')) + ' ' + (unknownPairs.length > 1 ? 'do' : 'does') + ' not yet have a MedLens interaction record. This does not mean the combination is safe.</p></div>' : '');
        container.classList.add('active');
    }
    function decodeMedLensEntities(value) {
        return sanitizeVisibleText(String(value || '')
            .replace(/&beta;/gi, 'β')
            .replace(/&ge;/gi, '≥')
            .replace(/&le;/gi, '≤')
            .replace(/&sup2;/gi, '²')
            .replace(/&ndash;/gi, '-')
            .replace(/&mdash;/gi, '-')
            .replace(/&#x2192;/gi, '→')
            .replace(/&nbsp;/gi, ' '));
    }

    function collectMedLensBlocks(value) {
        const raw = stripMedLensSourceHeadings(value);
        const blocks = [];
        const seen = new Set();
        const add = function (type, content, maxChars) {
            splitMedLensDetailParagraph(content, maxChars || 260).forEach(function (block) {
                const blockType = block.type || type;
                const text = shortenMedLensText(block.text, maxChars || 260);
                const key = blockType + '|' + text;
                if (text && !seen.has(key)) {
                    seen.add(key);
                    blocks.push({ type: blockType, text: text });
                }
            });
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
            if (cells.length) add('row', cells.join(' - '), 260);
            return '';
        });

        if (!blocks.length) {
            add('p', raw, 320);
        }
        return blocks;
    }

    function isMedLensNoise(text) {
        return /^(package label panel|principal display panel|repackaged by|distributed by|how supplied|ndc|lot|exp|store at|keep out of reach|see warnings|see precautions|drug facts|this product|for oral use|for external use|to report suspected|because clinical trials are conducted)/i.test(String(text || '').trim());
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

    function compactMedLensMarkup(value, sectionKey) {
        let text = stripMedLensSourceHeadings(value);
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
                return '<ul>' + items.map(function (item) { return '<li>' + formatMedLensInlineText(item, sectionKey) + '</li>'; }).join('') + '</ul>';
            }
            return '<p>' + formatMedLensInlineText(shortenMedLensText(text, rules.maxChars), sectionKey) + '</p>';
        }

        const lead = paragraphs.concat(rows).slice(0, rules.paragraphs);
        const extra = bullets.slice(0, rules.bullets);

        if (!lead.length && !extra.length) {
            return '<p>' + formatMedLensInlineText(shortenMedLensText(text, rules.maxChars), sectionKey) + '</p>';
        }

        let html = lead.map(function (item) { return '<p>' + formatMedLensInlineText(item, sectionKey) + '</p>'; }).join('');
        if (extra.length) {
            html += '<ul>' + extra.map(function (item) { return '<li>' + formatMedLensInlineText(item, sectionKey) + '</li>'; }).join('') + '</ul>';
        }
        return html;
    }

    function removeMedLensBoilerplate(value) {
        return String(value || '')
            .replace(/\bTo report SUSPECTED ADVERSE REACTIONS[\s\S]*?(?:www\.fda\.gov\/medwatch\.?|$)/gi, '')
            .replace(/\bBecause clinical trials are conducted under widely varying conditions[\s\S]*?(?:observed in practice\.?|$)/gi, '')
            .replace(/\bSee Full Prescribing Information[^.]*\.?/gi, '')
            .replace(/\bThe following adverse reactions are described in more detail in other sections of the prescribing information:\s*/gi, '')
            .replace(/\bThe following serious adverse reactions[^:]*:\s*/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function removeMedLensSectionNumbers(value) {
        return String(value || '')
            .replace(/(^|\s)\d{1,2}(?:\.\d+)?\s+(?=[A-Z][A-Za-z][A-Za-z\s,/()-]{3,})/g, '$1')
            .replace(/\s*\(\s*\d{1,2}(?:\.\d+)?(?:\s*,\s*\d{1,2}(?:\.\d+)?)*\s*\)\s*/g, ' ')
            .replace(/\s+([:;,.])/g, '$1')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function trimRepeatedMedLensLead(value) {
        return String(value || '')
            .replace(/\b[A-Z][A-Za-z\s-]+ tablets? (?:are|is) (?:a |an )?[^.]*?indicated for[^:]*:\s*/gi, '')
            .replace(/\b[A-Z][A-Za-z\s-]+ is indicated for[^:]*:\s*/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    function cleanMedLensVisibleText(value) {
        return removeMedLensSectionNumbers(removeMedLensBoilerplate(String(value || '')
            .replace(/\[\s*see[^\]]+\]/gi, '')
            .replace(/\s*\(\s*(?:\d{1,2}(?:\.\d+)?|[A-Z])\s*\)\s*/g, ' ')
            .replace(/\bfor the treatment of\s*:/gi, 'for the treatment of the following:')
            .replace(/\s+([:;,.])/g, '$1')
            .replace(/\s{2,}/g, ' ')
            .trim()));
    }
    function stripMedLensSourceHeadings(value) {
        return String(value || '')
            .replace(/<h[1-6][^>]*>s*(?:d{1,2}(?:.d+)?s*)?(?:Full Prescribing Information|Highlights of Prescribing Information|Indications and Usage|Dosage and Administration|Dosage Forms and Strengths|Contraindications|Warnings and Precautions|Adverse Reactions|Drug Interactions|Use in Specific Populations|Clinical Pharmacology|Clinical Studies|Overdosage|How Supplied/Storage and Handling|Patient Counseling Information)s*</h[1-6]>/gi, '')
            .replace(/<h[1-6][^>]*>s*(?:Package Label Panel|Principal Display Panel|Repackaged By|Distributed By|Manufactured By|Questions?)s*[sS]*$/gi, '')
            .replace(/(?:FULL PRESCRIBING INFORMATION|HIGHLIGHTS OF PRESCRIBING INFORMATION)s*/gi, '')
            .replace(/(?:Package Label Panel|Principal Display Panel|Repackaged By|Distributed By|Manufactured By)[sS]*$/gi, '')
            .trim();
    }

    function cleanMedLensPlainText(value) {
        return cleanMedLensVisibleText(stripMedLensHtml(stripMedLensSourceHeadings(value)));
    }

    function splitLongMedLensText(clean, maxChars, type) {
        if (!clean) return [];
        if (clean.length <= maxChars) return [{ type: type || 'p', text: clean }];

        const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
        const chunks = [];
        let current = '';
        sentences.forEach(function (sentence) {
            if ((current + ' ' + sentence).trim().length > maxChars && current) {
                chunks.push({ type: type || 'p', text: current.trim() });
                current = sentence;
            } else {
                current = (current + ' ' + sentence).trim();
            }
        });
        if (current) chunks.push({ type: type || 'p', text: current.trim() });
        return chunks;
    }

    function splitMedLensDetailParagraph(text, maxChars) {
        const clean = cleanMedLensPlainText(text);
        if (!clean) return [];

        const bulletParts = clean.split(/\s*[\u2022]\s+/).map(function (part) {
            return cleanMedLensVisibleText(part);
        }).filter(Boolean);

        if (bulletParts.length > 1) {
            const blocks = [];
            const lead = bulletParts[0].replace(/\s*:\s*$/, '').trim();
            if (lead) {
                blocks.push.apply(blocks, splitLongMedLensText(lead, maxChars, 'p'));
            }
            bulletParts.slice(1).forEach(function (item) {
                const cleanedItem = trimRepeatedMedLensLead(item.replace(/^[;:,\s]+/, '').trim());
                if (!cleanedItem) return;

                const adverseSplit = cleanedItem.match(/^(.*?)(Most common(?: adverse reactions)?[\s\S]*)$/i);
                if (adverseSplit && adverseSplit[1].trim()) {
                    blocks.push.apply(blocks, splitLongMedLensText(adverseSplit[1].trim(), maxChars, 'li'));
                    blocks.push.apply(blocks, splitLongMedLensText(adverseSplit[2].trim(), maxChars, 'p'));
                    return;
                }

                blocks.push.apply(blocks, splitLongMedLensText(cleanedItem, maxChars, 'li'));
            });
            return blocks;
        }

        return splitLongMedLensText(clean, maxChars, 'p');
    }

    function formatMedLensInlineText(text, sectionKey) {
        let html = escapeHtml(cleanMedLensVisibleText(text));
        if (!html) return '';

        html = html.replace(/\b(major or fatal|contraindicated|not recommended|avoid|warning|bleeding risk|serious adverse reactions|gradually|individualize|adjust based on INR response)\b/gi, '<span class="clinical-keyword">$1</span>');
        html = html.replace(/\b(\d+(?:\.\d+)?\s*(?:mg|mcg|g|mL|units?|tablet(?:s)?|capsule(?:s)?|inhalation(?:s)?|spray(?:s)?|%)\b(?:\s*(?:per|once|twice|daily|weekly|every|q\d+h|day|week))?)/gi, '<strong class="dose-token">$1</strong>');
        html = html.replace(/\b(INR|MDD|OCD|PD|PTSD|SAD|PMDD|SSRI|SNRI|MAOI|CYP\d[A-Z]?\d?|AUC|Cmax|Tmax|half-life)\b/g, '<strong>$1</strong>');
        return html;
    }

    function getMedLensCalloutKind(text, sectionKey) {
        const clean = cleanMedLensVisibleText(text).toLowerCase();
        if (!clean) return '';
        if (sectionKey === 'warnings' || /\b(warning|major or fatal|contraindicated|avoid|bleeding risk|serious|life-threatening|do not use)\b/.test(clean)) return 'warning';
        if (sectionKey === 'dose' || /\b(starting dose|maximum dose|recommended dose|titration|not recommended|hepatic impairment|renal impairment|discontinuing|dose gradually|mg per day)\b/.test(clean)) return 'dose';
        if (sectionKey === 'patientInfo' || /\b(advise|counsel|patient should|tell patients|instruct patients)\b/.test(clean)) return 'patient';
        return '';
    }

    function getMedLensCalloutLabel(kind, sectionKey) {
        if (kind === 'warning') return sectionKey === 'contraindications' ? 'Important restriction' : 'Clinical caution';
        if (kind === 'dose') return 'Dose guidance';
        if (kind === 'patient') return 'Patient counseling';
        return 'Clinical note';
    }

    function renderMedLensTextBlock(block, sectionKey) {
        const blockText = cleanMedLensVisibleText(block.text);
        if (!blockText) return '';
        const html = formatMedLensInlineText(blockText, sectionKey);
        const kind = getMedLensCalloutKind(blockText, sectionKey);
        if (kind && block.type !== 'li') {
            return '<div class="medlens-callout ' + kind + '"><span class="medlens-callout-label">' + getMedLensCalloutLabel(kind, sectionKey) + '</span><p>' + html + '</p></div>';
        }
        return '<p>' + html + '</p>';
    }
    function getFullMedLensRules(sectionKey) {
        switch (sectionKey) {
            case 'overview': return { maxBlocks: 8, maxChars: 720 };
            case 'dose': return { maxBlocks: 12, maxChars: 760 };
            case 'warnings': return { maxBlocks: 12, maxChars: 720 };
            case 'sideEffects': return { maxBlocks: 12, maxChars: 720 };
            case 'interactions': return { maxBlocks: 12, maxChars: 720 };
            case 'clinicalStudies': return { maxBlocks: 10, maxChars: 820 };
            case 'formulation': return { maxBlocks: 10, maxChars: 680 };
            default: return { maxBlocks: 10, maxChars: 720 };
        }
    }

    function renderFullMedLensMarkup(value, sectionKey) {
        let raw = stripMedLensSourceHeadings(value)
            .replace(/<h4[^>]*>\s*Package Label Panel[\s\S]*$/i, '')
            .replace(/<h4[^>]*>\s*Principal Display Panel[\s\S]*$/i, '')
            .replace(/<h4[^>]*>\s*Repackaged By[\s\S]*$/i, '')
            .replace(/<h4[^>]*>\s*Distributed By[\s\S]*$/i, '')
            .replace(/<h4[^>]*>\s*How Supplied[\s\S]*$/i, '');
        if (!cleanMedLensPlainText(raw)) return '';

        const rules = getFullMedLensRules(sectionKey);
        const blocks = [];
        const seen = new Set();
        const addBlocks = function (type, content, maxChars) {
            splitMedLensDetailParagraph(content, maxChars).forEach(function (block) {
                const blockType = block.type || type;
                const blockText = cleanMedLensVisibleText(block.text);
                const key = blockType + '|' + blockText.toLowerCase();
                if (blockText && !isMedLensNoise(blockText) && !seen.has(key)) {
                    seen.add(key);
                    blocks.push({ type: blockType, text: blockText });
                }
            });
        };

        raw.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function (_, chunk) {
            addBlocks('li', chunk, rules.maxChars);
            return '';
        });
        raw.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, function (_, chunk) {
            addBlocks('p', chunk, rules.maxChars);
            return '';
        });
        raw.replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, function (_, row) {
            const cells = [];
            row.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi, function (_, cell) {
                const cellText = cleanMedLensPlainText(cell);
                if (cellText) cells.push(cellText);
                return '';
            });
            if (cells.length) addBlocks('p', cells.join(' - '), rules.maxChars);
            return '';
        });

        if (!blocks.length) {
            addBlocks('p', raw, rules.maxChars);
        }

        const selected = blocks.slice(0, rules.maxBlocks);
        if (!selected.length) return '';

        let html = '';
        let listOpen = false;
        selected.forEach(function (block) {
            if (block.type === 'li') {
                if (!listOpen) {
                    html += '<ul>';
                    listOpen = true;
                }
                html += '<li>' + formatMedLensInlineText(block.text, sectionKey) + '</li>'; 
            } else {
                if (listOpen) {
                    html += '</ul>';
                    listOpen = false;
                }
                html += renderMedLensTextBlock(block, sectionKey);
            }
        });
        if (listOpen) html += '</ul>';
        return html;
    }

    function isDuplicateMedLensMarkup(summaryHtml, detailsHtml) {
        const summaryText = cleanMedLensPlainText(summaryHtml).toLowerCase();
        const detailText = cleanMedLensPlainText(detailsHtml).toLowerCase();
        return !!summaryText && summaryText === detailText;
    }
    function normalizeMedLensMarkup(value, sectionKey) {
        const text = stripMedLensSourceHeadings(sanitizeVisibleText(String(value || ''))
            .replace(/warning-box-title">Warning:/g, 'warning-box-title">&#x26A0;')
            .replace(/<div class="contra-item-icon">x<\/div>/g, '<div class="contra-item-icon">&#x1F6AB;<\/div>'));

        if (!sectionKey) {
            return text;
        }
        return compactMedLensMarkup(text, sectionKey);
    }

    function updateMedLensChromeOffsets() {
        const header = document.querySelector('.app-header');
        const nav = document.querySelector('.bottom-nav');
        if (header) {
            document.documentElement.style.setProperty('--medlens-header-offset', Math.ceil(header.getBoundingClientRect().height) + 'px');
        }
        if (nav) {
            document.documentElement.style.setProperty('--medlens-nav-offset', Math.ceil(nav.getBoundingClientRect().height) + 'px');
        }
    }

    updateMedLensChromeOffsets();
    window.addEventListener('resize', updateMedLensChromeOffsets);
    window.addEventListener('orientationchange', updateMedLensChromeOffsets);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(updateMedLensChromeOffsets).catch(function () {});
    }
    setupGlobalSearch();
    