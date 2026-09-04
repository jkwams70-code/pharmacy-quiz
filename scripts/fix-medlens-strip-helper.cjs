const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/medlens.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/medlens.html',
];
const marker = `
    function cleanMedLensPlainText(value) {
`;
const helper = `
    function stripMedLensSourceHeadings(value) {
        return String(value || '')
            .replace(/<h[1-6][^>]*>\s*(?:\d{1,2}(?:\.\d+)?\s*)?(?:Full Prescribing Information|Highlights of Prescribing Information|Indications and Usage|Dosage and Administration|Dosage Forms and Strengths|Contraindications|Warnings and Precautions|Adverse Reactions|Drug Interactions|Use in Specific Populations|Clinical Pharmacology|Clinical Studies|Overdosage|How Supplied\/Storage and Handling|Patient Counseling Information)\s*<\/h[1-6]>/gi, '')
            .replace(/<h[1-6][^>]*>\s*(?:Package Label Panel|Principal Display Panel|Repackaged By|Distributed By|Manufactured By|Questions\?)\s*[\s\S]*$/gi, '')
            .replace(/\b(?:FULL PRESCRIBING INFORMATION|HIGHLIGHTS OF PRESCRIBING INFORMATION)\b\s*/gi, '')
            .replace(/\b(?:Package Label Panel|Principal Display Panel|Repackaged By|Distributed By|Manufactured By)\b[\s\S]*$/gi, '')
            .trim();
    }
`;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  if (!text.includes(marker)) throw new Error('Missing insertion marker in ' + file);
  if (!text.includes('function stripMedLensSourceHeadings(value)')) {
    text = text.replace(marker, helper + marker);
  }
  fs.writeFileSync(file, text, 'utf8');
  console.log('fixed', file);
}
