import geoip from "geoip-lite";

export function geoLookup(ip) {
  if (!ip || ip === "127.0.0.1" || ip === "localhost") {
    return {
      country: "LOCAL",
      region: null,
      city: null,
      timezone: null,
      latitude: null,
      longitude: null,
    };
  }

  const result = geoip.lookup(ip);

  if (!result) {
    return {
      country: "UNKNOWN",
      region: null,
      city: null,
      timezone: null,
      latitude: null,
      longitude: null,
    };
  }

  return {
    country: result.country || "UNKNOWN",
    region: result.region || null,
    city: result.city || null,
    timezone: result.timezone || null,
    latitude: result.ll?.[0] ?? null,
    longitude: result.ll?.[1] ?? null,
  };
}