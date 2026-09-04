const fs = require('fs');
const file = process.argv[2];
const lineNumber = Number(process.argv[3]);
const line = fs.readFileSync(file, 'utf8').split(/\r?\n/)[lineNumber - 1] || '';
console.log(line);
const matches = [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
for (const value of matches.slice(0, 3)) {
  console.log([...value].map((ch) => ch.codePointAt(0).toString(16)).join(' '));
}
