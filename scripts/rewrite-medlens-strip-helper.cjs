const fs = require('fs');
const files = [
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/www/medlens.html',
  'C:/Users/John_Israel/Desktop/AJIXPHARM/AjixPharmacy-mainmerge/android/app/src/main/assets/public/medlens.html',
];
const helper = `    function stripMedLensSourceHeadings(value) {
        let text = String(value || '');
        const labelHeadings = 'Full Prescribing Information|Highlights of Prescribing Information|Indications and Usage|Dosage and Administration|Dosage Forms and Strengths|Contraindications|Warnings and Precautions|Adverse Reactions|Drug Interactions|Use in Specific Populations|Clinical Pharmacology|Clinical Studies|Overdosage|How Supplied\\/Storage and Handling|Patient Counseling Information';
        const terminalHeadings = 'Package Label Panel|Principal Display Panel|Repackaged By|Distributed By|Manufactured By|Questions\\?';
        text = text.replace(new RegExp('<h[1-6][^>]*>\\\\s*(?:\\\\d{1,2}(?:\\\\.\\\\d+)?\\\\s*)?(?:' + labelHeadings + ')\\\\s*<\\\\/h[1-6]>', 'gi'), '');
        text = text.replace(new RegExp('<h[1-6][^>]*>\\\\s*(?:' + terminalHeadings + ')[\\\\s\\\\S]*$', 'gi'), '');
        text = text.replace(/FULL PRESCRIBING INFORMATION|HIGHLIGHTS OF PRESCRIBING INFORMATION/gi, '');
        text = text.replace(new RegExp('(?:Package Label Panel|Principal Display Panel|Repackaged By|Distributed By|Manufactured By)[\\\\s\\\\S]*$', 'gi'), '');
        return text.trim();
    }
`;
for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const start = text.indexOf('    function stripMedLensSourceHeadings(value) {');
  const end = text.indexOf('\n\n    function cleanMedLensPlainText(value) {', start);
  if (start < 0 || end < 0) throw new Error('Missing strip helper block in ' + file);
  text = text.slice(0, start) + helper + text.slice(end);
  fs.writeFileSync(file, text, 'utf8');
  console.log('rewrote', file);
}
