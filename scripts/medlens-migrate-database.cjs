#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { normalizeLegacyDrugRecord } = require('./medlens-monograph-schema.cjs');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DB_FILES = [
  path.join(ROOT, 'medlens-database.js'),
  path.join(ROOT, 'www', 'medlens-database.js'),
  path.join(ROOT, 'android', 'app', 'src', 'main', 'assets', 'public', 'medlens-database.js'),
];

function readDatabaseEntries(filePath) {
  const entries = {};
  if (!fs.existsSync(filePath)) return entries;
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /window\.MEDLENS_DATABASE\[(?:"([^"]+)"|'([^']+)')\]\s*=\s*({[\s\S]*?})\s*;/g;
  let match;
  while ((match = regex.exec(content))) {
    const id = match[1] || match[2];
    try {
      entries[id] = JSON.parse(match[3]);
    } catch (error) {
      // Skip malformed entries and keep going.
    }
  }
  return entries;
}

function writeDatabaseFile(filePath, entries) {
  const ids = Object.keys(entries).sort((a, b) => a.localeCompare(b));
  const lines = ['window.MEDLENS_DATABASE = window.MEDLENS_DATABASE || {};', ''];

  for (const id of ids) {
    lines.push(`window.MEDLENS_DATABASE[${JSON.stringify(id)}] = ${JSON.stringify(entries[id], null, 2)};`);
    lines.push('');
  }

  fs.writeFileSync(filePath, lines.join('\n').trimEnd() + '\n', 'utf8');
}

function migrateFile(filePath) {
  const existing = readDatabaseEntries(filePath);
  const migrated = {};

  for (const [id, drug] of Object.entries(existing)) {
    const normalized = normalizeLegacyDrugRecord(drug);
    migrated[id] = {
      ...drug,
      ...normalized,
      id: normalized.id || id,
    };
  }

  writeDatabaseFile(filePath, migrated);
  return Object.keys(migrated).length;
}

function main() {
  let total = 0;
  for (const filePath of TARGET_DB_FILES) {
    if (!fs.existsSync(filePath)) {
      continue;
    }
    total += migrateFile(filePath);
    process.stdout.write(`Migrated ${path.relative(ROOT, filePath)}\n`);
  }
  process.stdout.write(`Completed migration for ${total} drug entries.\n`);
}

main();
