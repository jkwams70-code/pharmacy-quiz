#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const queuePath = path.join(ROOT, 'backend', 'data', 'medlensDrugQueue.json');
const databasePaths = [
  path.join(ROOT, 'medlens-database.js'),
  path.join(ROOT, 'www', 'medlens-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-database.js'),
];
const expected = 35;
if (!process.argv.includes('--apply')) {
  console.error('Refusing to migrate without --apply.');
  process.exit(1);
}

function readEntries(filePath) {
  const entries = {};
  const content = fs.readFileSync(filePath, 'utf8');
  const pattern = /window\.MEDLENS_DATABASE\[(?:"([^"]+)"|'([^']+)')\]\s*=\s*({[\s\S]*?})\s*;/g;
  let match;
  while ((match = pattern.exec(content))) entries[match[1] || match[2]] = JSON.parse(match[3]);
  return entries;
}
function writeEntries(filePath, entries) {
  const lines = ['window.MEDLENS_DATABASE = window.MEDLENS_DATABASE || {};', ''];
  for (const id of Object.keys(entries).sort((a, b) => a.localeCompare(b))) {
    lines.push(`window.MEDLENS_DATABASE[${JSON.stringify(id)}] = ${JSON.stringify(entries[id], null, 2)};`, '');
  }
  fs.writeFileSync(filePath, `${lines.join('\n').trimEnd()}\n`, 'utf8');
}
function completedRecord(record) {
  const now = new Date().toISOString();
  return {
    ...record,
    status: 'published',
    aiEdited: true,
    needsReview: false,
    completedAt: record.completedAt || now,
    publishedAt: record.publishedAt || now,
    publishedBy: record.publishedBy || 'admin-completed-edit-migration',
    editor: record.editor || {
      provider: 'MedLens AI editor',
      editorVersion: 'completed-before-status-migration',
      editedAt: record.updatedAt || now,
      reviewNotes: [],
    },
  };
}

const queue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
const candidates = queue.filter((record) => record.status === 'fetched');
if (candidates.length !== expected) {
  console.error(`Expected ${expected} fetched records, found ${candidates.length}. No files changed.`);
  process.exit(1);
}
const ids = new Set(candidates.map((record) => String(record.id)));
const backupSuffix = `.before-completed-migration-${new Date().toISOString().replace(/[:.]/g, '-')}.bak`;
for (const filePath of [queuePath, ...databasePaths]) fs.copyFileSync(filePath, `${filePath}${backupSuffix}`);
fs.writeFileSync(queuePath, JSON.stringify(queue.map((record) => ids.has(String(record.id)) ? completedRecord(record) : record), null, 2), 'utf8');
for (const filePath of databasePaths) {
  const entries = readEntries(filePath);
  for (const id of ids) if (entries[id]) entries[id] = completedRecord(entries[id]);
  writeEntries(filePath, entries);
}
console.log(`Migrated ${candidates.length} fetched MedLens records to published/completed.`);
console.log(`Backups written with suffix ${backupSuffix}`);