import https from "node:https";

// Some VPS networks advertise IPv6 for public APIs without routing IPv6.
// Use an explicit IPv4 socket so provider requests work on those hosts.
function requestJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { family: 4, headers: { Accept: "application/json", ...headers } }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        const status = response.statusCode || 0;
        if (status === 404) return resolve(null);
        if (status < 200 || status >= 300) return reject(new Error(`HTTP ${status}`));
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error("invalid JSON response")); }
      });
    });
    request.setTimeout(20000, () => request.destroy(new Error("request timed out")));
    request.on("error", reject);
  });
}

// Keep provider outages distinct from a genuine missing source record.
export async function fetchMedLensSource(url, provider, headers = {}) {
  try {
    // The isolated regression suite can inject a transport without network access.
    if (typeof globalThis.__MEDLENS_FETCH === "function") {
      const response = await globalThis.__MEDLENS_FETCH(url, {
        headers: { Accept: "application/json", ...headers },
        signal: AbortSignal.timeout(20000),
      });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      try { return await response.json(); }
      catch { throw new Error("invalid JSON response"); }
    }
    return await requestJson(url, headers);
  } catch (error) {
    const message = String(error?.message || "");
    const detail = /^HTTP \d+$/.test(message)
      ? message
      : message.toLowerCase().includes("timed out")
        ? "request timed out"
        : "network request failed";
    throw new Error(provider + ": " + detail + ". Please retry.");
  }
}
