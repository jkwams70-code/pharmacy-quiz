import dns from "node:dns";

// Some VPS networks advertise IPv6 for public APIs without routing IPv6.
// Prefer IPv4 so Node fetch can reach providers that are available over IPv4.
dns.setDefaultResultOrder("ipv4first");

// Keep provider outages distinct from a genuine missing source record.
export async function fetchMedLensSource(url, provider, headers = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json", ...headers },
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    const detail = error.name === "TimeoutError" ? "request timed out" : "network request failed";
    throw new Error(provider + ": " + detail + ". Please retry.");
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(provider + " returned HTTP " + response.status + ". Please retry.");
  try {
    return await response.json();
  } catch {
    throw new Error(provider + " returned an invalid response. Please retry.");
  }
}
