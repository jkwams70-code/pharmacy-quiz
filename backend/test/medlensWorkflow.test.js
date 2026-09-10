import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import vm from 'node:vm';
import express from 'express';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDir, '../..');
const nativeFetch = globalThis.fetch;
const kinds = [
  { kind: 'drugs', file: 'medlensQueue.js', factory: 'createMedLensRouter', database: 'medlens-database.js', global: 'MEDLENS_DATABASE', editor: 'medlens-ai-editor.cjs', flag: '--drug', record: { id: 'existing-drug', generic: 'Existing Drug', name: 'Existing Drug', sourceLabel: { description: ['Synthetic source text.'] } } },
  { kind: 'diseases', file: 'medlensDiseaseQueue.js', factory: 'createMedLensDiseaseRouter', database: 'medlens-disease-database.js', global: 'MEDLENS_DISEASE_DATABASE', editor: 'medlens-disease-ai-editor.cjs', flag: '--disease', record: { id: 'existing-disease', name: 'Existing Disease', overview: 'Synthetic source text.' } },
  { kind: 'interactions', file: 'medlensInteractionQueue.js', factory: 'createMedLensInteractionRouter', database: 'medlens-interactions-database.js', global: 'MEDLENS_INTERACTIONS_DATABASE', editor: 'medlens-interactions-ai-editor.cjs', flag: '--pair', record: { id: 'existing-a__existing-b', drugs: ['Existing A', 'Existing B'], sourceText: 'Synthetic interaction source text.', severity: 'unknown' } },
];

function runEditor(file, args, cwd, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '';
    child.stdout.on('data', b => { output += b; });
    child.stderr.on('data', b => { output += b; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(output) : reject(new Error(output)));
  });
}

test('MedLens loads canonical databases and fetches, edits, reviews and publishes isolated records', { timeout: 120000 }, async t => {
  const root = await fs.mkdtemp(path.join(testDir, '.medlens-workflow-'));
  const serviceDir = path.join(root, 'backend/src/services');
  const frontendPath = path.join(root, 'www');
  const scripts = path.join(root, 'scripts');
  const oldNodeOptions = process.env.NODE_OPTIONS;
  let server;
  t.after(async () => {
    globalThis.fetch = nativeFetch;
    if (oldNodeOptions === undefined) delete process.env.NODE_OPTIONS; else process.env.NODE_OPTIONS = oldNodeOptions;
    if (server) await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    if (path.dirname(path.resolve(root)) !== testDir || !path.basename(root).startsWith('.medlens-workflow-')) throw new Error('Unsafe fixture cleanup path');
    await fs.rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });
  for (const dir of [serviceDir, frontendPath, scripts]) await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(root, 'backend/.env'), 'OPENAI_API_KEY=synthetic-test-key\nOPENAI_MODEL=synthetic-model\n');
  await fs.writeFile(path.join(root, 'backend/src/store.js'), `const data = new Map();
    export async function readCollection(name) { return structuredClone(data.get(name) || []); }
    export async function writeCollection(name, value) { data.set(name, structuredClone(value)); }
  `);
  const mockPath = path.join(root, 'mock-openai.cjs');
  await fs.writeFile(mockPath, `globalThis.fetch = async (url, options) => {
    if (url !== 'https://api.openai.com/v1/responses') throw new Error('Unexpected test network request');
    const request = JSON.parse(options.body);
    if (!request.input?.length) throw new Error('Missing editor prompt');
    return new Response(JSON.stringify({output_text: JSON.stringify({ title:'Synthetic section',articleHtml:'<p>Synthetic edited content.</p>',sourceUsed:true,visualPrompt:'',reviewNotes:[],clinicalConcern:'Synthetic concern',mechanism:'Synthetic mechanism',management:'Synthetic management',monitoring:'Synthetic monitoring',counseling:'Synthetic counseling',evidence:'Synthetic evidence',reviewNote:'' })}), {status:200,headers:{'Content-Type':'application/json'}});
  };`);
  process.env.NODE_OPTIONS = '--require ' + JSON.stringify(mockPath);
  await fs.copyFile(path.join(projectRoot, 'backend/src/services/medlensSource.js'), path.join(serviceDir, 'medlensSource.js'));
  for (const def of kinds) {
    await fs.copyFile(path.join(projectRoot, 'backend/src/services', def.file), path.join(serviceDir, def.file));
    await fs.copyFile(path.join(projectRoot, 'scripts', def.editor), path.join(scripts, def.editor));
    await fs.writeFile(path.join(frontendPath, def.database), `window.${def.global} = {};\nwindow.${def.global}[${JSON.stringify(def.record.id)}] = ${JSON.stringify(def.record)};\n`);
  }
  let providerFailure = false;
  let missingSecondLabel = false;
  globalThis.fetch = async url => {
    const u = new URL(url);
    if (providerFailure) return new Response('{}', { status: 503 });
    if (u.hostname === 'api.fda.gov') {
      const term = u.searchParams.get('search').match(/generic_name:"([^"]+)"/)[1];
      if (missingSecondLabel && term === 'Test B') return new Response('{}', { status: 404 });
      return Response.json({ results: [{ openfda: { generic_name: [term], brand_name: ['Synthetic brand'] }, description: ['Synthetic description.'], indications_and_usage: ['Synthetic indication.'], drug_interactions: ['Synthetic interaction source.'] }] });
    }
    if (u.hostname === 'en.wikipedia.org') return Response.json({ query: { pages: { '1': { title: u.searchParams.get('titles'), extract: 'Synthetic disease source.\n\nSynthetic second paragraph.' } } } });
    throw new Error('Unexpected source URL');
  };
  const app = express();
  app.use(express.json());
  for (const def of kinds) {
    const module = await import(pathToFileURL(path.join(serviceDir, def.file)));
    app.use(module[def.factory]({ config: { adminKey: 'synthetic-admin' }, frontendPath }));
  }
  app.use((error, req, res, next) => res.status(500).json({ error: error.message }));
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/api/admin/medlens`;
  async function request(route, body, authorized = true) {
    const response = await nativeFetch(base + route, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(authorized ? { 'x-admin-key': 'synthetic-admin' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(45000) });
    return { status: response.status, body: await response.json() };
  }
  for (const def of kinds) await t.test(def.kind + ' workflow', async () => {
    assert.equal((await request('/' + def.kind, null, false)).status, 403);
    const initial = await request('/' + def.kind);
    assert.equal(initial.body.total, 1, 'Must seed from www, with no root database or nested www/www');
    assert.equal(initial.body.items[0].status, 'published');
    const term = def.kind === 'drugs' ? 'Test Drug' : def.kind === 'diseases' ? 'Test Disease' : 'Test A + Test B';
    providerFailure = true;
    const failed = await request('/' + def.kind + '/fetch', { terms: term });
    assert.equal(failed.status, 502);
    assert.match(failed.body.error, /HTTP 503/);
    assert.equal((await request('/' + def.kind)).body.total, 1);
    providerFailure = false;
    missingSecondLabel = def.kind === 'interactions';
    const fetched = await request('/' + def.kind + '/fetch', { terms: term });
    assert.equal(fetched.status, 200, JSON.stringify(fetched.body));
    assert.equal(fetched.body.total, 1);
    const item = fetched.body.fetched[0];
    if (def.kind === 'interactions') assert.deepEqual(item.drugs, ['Test A', 'Test B'], 'A missing label must not delete either member of the requested pair');
    assert.equal((await request('/' + def.kind + '/' + item.id + '/publish', {})).status, 409);
    const edited = await request('/' + def.kind + '/' + item.id + '/ai-edit', {});
    assert.equal(edited.status, 200, JSON.stringify(edited.body));
    assert.equal(edited.body.item.id, item.id);
    assert.equal(edited.body.item.status, 'in_review');
    assert.equal(edited.body.item.editor.provider, 'OpenAI');
    const progress = await request('/' + def.kind + '/' + item.id + '/progress');
    assert.equal(progress.body.progress.status, 'done');
    assert.equal(progress.body.progress.percent, 100);
    assert.equal((await request('/' + def.kind + '/' + item.id + '/publish', {})).body.item.status, 'published');
    const final = await request('/' + def.kind);
    assert.equal(final.body.total, 2);
    assert.equal(final.body.items.find(x => x.id === def.record.id).status, 'published');
    const output = path.join(root, def.kind + '-default-source.json');
    const selector = def.kind === 'interactions' ? def.record.drugs.join(' + ') : def.record.id;
    await runEditor(path.join(scripts, def.editor), [def.flag, selector, '--output', output], frontendPath, { ...process.env, OPENAI_API_KEY: 'synthetic-test-key' });
    assert.equal(JSON.parse(await fs.readFile(output, 'utf8'))[0].id, def.record.id, 'CLI default must read canonical www');
    await assert.rejects(fs.access(path.join(root, def.database)), 'No root mirror should be created');
  });
});

test('MedLens progress polling uses the editor kind, independent of the visible tab', async () => {
  const html = await fs.readFile(path.join(projectRoot, 'www/admin/medlens-studio.html'), 'utf8');
  const script = html.match(/function startAiProgress\([\s\S]*?\n\}function renderDrugs/)[0].replace(/function renderDrugs$/, '');
  for (const kind of ['drugs', 'diseases', 'interactions']) {
    let tick;
    const calls = [];
    const context = { current: 'drugs', aiWorkingIds: new Set(), stopAiProgress() {}, showAiProgress() {}, renderDrugs() {}, renderDiseases() {}, renderInteractions() {}, setInterval(fn) { tick = fn; return 1; }, pollAiProgress: id => calls.push(['drugs', id]), pollDiseaseProgress: id => calls.push(['diseases', id]), pollInteractionProgress: id => calls.push(['interactions', id]) };
    vm.createContext(context);
    vm.runInContext(script, context);
    context.startAiProgress('synthetic-record', kind);
    tick();
    assert.deepEqual(calls, [[kind, 'synthetic-record']]);
    assert.equal(context.aiProgressState.total, kind === 'interactions' ? 1 : 9);
  }
});
