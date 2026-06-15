import { config } from "../config.js";
import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";

const baseUrl = process.env.MEMCHECK_BASE || `http://localhost:${config.port}/api`;
const rounds = Number.parseInt(process.env.MEMCHECK_ROUNDS || "450", 10);
const sampleEvery = Number.parseInt(process.env.MEMCHECK_SAMPLE_EVERY || "25", 10);
const clientBuckets = Number.parseInt(process.env.MEMCHECK_CLIENT_BUCKETS || "24", 10);
const exec = promisify(execCallback);

function toNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

let requestCounter = 0;

function nextClientId() {
  const bucket = requestCounter % Math.max(1, clientBuckets);
  requestCounter += 1;
  return `memcheck-${bucket}`;
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      "x-client-id": nextClientId(),
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function extractPort(url) {
  const parsed = new URL(url);
  return Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80));
}

async function getRssMbFromHealth() {
  const health = await fetchJson(`${baseUrl}/health`);
  const rss = Number(health?.memory?.rssMb);
  return Number.isFinite(rss) && rss > 0 ? rss : null;
}

function parseCsvLine(line) {
  return line
    .split(/,(?=(?:(?:[^\"]*\"){2})*[^\"]*$)/)
    .map((part) => part.replace(/^\"|\"$/g, "").trim());
}

async function getServerPidByPort(port) {
  const { stdout } = await exec(`cmd /c netstat -ano -p tcp | findstr :${port}`);
  const rows = stdout
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .filter((row) => row.includes("LISTENING"));

  if (rows.length === 0) return null;
  const last = rows[rows.length - 1];
  const tokens = last.split(/\s+/);
  const pid = Number(tokens[tokens.length - 1]);
  return Number.isFinite(pid) ? pid : null;
}

async function getRssMbFromTasklist(port) {
  const pid = await getServerPidByPort(port);
  if (!pid) return null;

  const { stdout } = await exec(
    `cmd /c tasklist /FI "PID eq ${pid}" /FO CSV /NH`,
  );
  const line = stdout
    .split(/\r?\n/)
    .map((row) => row.trim())
    .find((row) => row && !row.startsWith("INFO:"));

  if (!line) return null;
  const cells = parseCsvLine(line);
  if (cells.length < 5) return null;

  const memCell = cells[4] || "";
  const kb = Number(memCell.replace(/[^\d]/g, ""));
  if (!Number.isFinite(kb) || kb <= 0) return null;
  return Math.round(((kb / 1024) * 10)) / 10;
}

async function getRssMb() {
  const fromHealth = await getRssMbFromHealth().catch(() => null);
  if (fromHealth) return { rssMb: fromHealth, source: "health" };

  const port = extractPort(baseUrl);
  const fromTasklist = await getRssMbFromTasklist(port).catch(() => null);
  if (fromTasklist) return { rssMb: fromTasklist, source: "tasklist" };

  throw new Error("Unable to read backend memory from health or tasklist.");
}

async function run() {
  if (!Number.isInteger(rounds) || rounds < 50) {
    throw new Error("MEMCHECK_ROUNDS must be an integer >= 50");
  }
  if (!Number.isInteger(sampleEvery) || sampleEvery < 5) {
    throw new Error("MEMCHECK_SAMPLE_EVERY must be an integer >= 5");
  }
  if (!Number.isInteger(clientBuckets) || clientBuckets < 1) {
    throw new Error("MEMCHECK_CLIENT_BUCKETS must be an integer >= 1");
  }

  const start = await getRssMb();
  const memorySource = start.source;
  const startRss = start.rssMb;
  const samples = [{ step: 0, rssMb: startRss }];

  for (let i = 1; i <= rounds; i += 1) {
    await fetchJson(`${baseUrl}/health`);
    if (i % 2 === 0) {
      await fetchJson(`${baseUrl}/categories`);
    }
    if (i % 3 === 0) {
      await fetchJson(`${baseUrl}/questions?limit=5&shuffle=true`);
    }

    if (i % sampleEvery === 0) {
      const sample = await getRssMb();
      samples.push({ step: i, rssMb: sample.rssMb });
    }
  }

  await new Promise((resolve) => setTimeout(resolve, 500));
  const endRss = (await getRssMb()).rssMb;
  samples.push({ step: rounds, rssMb: endRss });

  const peakRss = Math.max(...samples.map((row) => row.rssMb));
  const drift = Math.round((endRss - startRss) * 10) / 10;
  const peakGrowth = Math.round((peakRss - startRss) * 10) / 10;
  const pass = drift <= 40 && peakGrowth <= 80;

  console.log(
    JSON.stringify(
      {
        baseUrl,
        rounds,
        clientBuckets,
        memorySource,
        startRssMb: startRss,
        endRssMb: endRss,
        peakRssMb: peakRss,
        driftMb: drift,
        peakGrowthMb: peakGrowth,
        pass,
        samples,
      },
      null,
      2,
    ),
  );

  if (!pass) {
    throw new Error(
      `Potential memory leak detected (drift=${drift}MB, peakGrowth=${peakGrowth}MB)`,
    );
  }
}

run().catch((error) => {
  console.error("Memory leak check failed:", error.message);
  process.exitCode = 1;
});
