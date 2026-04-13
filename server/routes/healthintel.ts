/**
 * TUF Health Intelligence API — v1.0
 * Proxies PopHIVE public health data via MCP for the Health Intel screen.
 *
 * Endpoints:
 *   GET /api/healthintel/obesity      — national obesity prevalence by age group (2020-2024)
 *   GET /api/healthintel/diabetes     — national diabetes prevalence by age group (2020-2024)
 *   GET /api/healthintel/respiratory  — current week respiratory ED visits (COVID/Flu/RSV)
 *   GET /api/healthintel/summary      — combined summary card data (all three in one call)
 *
 * Data source: Yale PopHIVE via MCP server
 * Cached in-memory for 1 hour to avoid hammering MCP on every page load.
 */
import { Router, Request, Response } from "express";
import { execSync } from "child_process";

const router = Router();

// ─── In-memory cache ──────────────────────────────────────────────────────────
interface CacheEntry {
  data: unknown;
  ts: number;
}
const CACHE: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function fromCache(key: string): unknown | null {
  const entry = CACHE[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL_MS) return entry.data;
  return null;
}

function setCache(key: string, data: unknown) {
  CACHE[key] = { data, ts: Date.now() };
}

// ─── MCP helper ───────────────────────────────────────────────────────────────
function callMCP(toolName: string, input: Record<string, unknown>): unknown {
  const inputJson = JSON.stringify(input).replace(/'/g, "'\\''");
  const cmd = `manus-mcp-cli tool call ${toolName} --server pophive --input '${inputJson}'`;
  const raw = execSync(cmd, { timeout: 30000, encoding: "utf8" });
  // manus-mcp-cli outputs "Tool execution result:\n<content>" — extract the content
  const marker = "Tool execution result:\n";
  const idx = raw.indexOf(marker);
  if (idx === -1) return raw;
  return raw.slice(idx + marker.length).trim();
}

// ─── Parse helpers ────────────────────────────────────────────────────────────
interface ObesityRecord {
  year: number;
  age_group: string;
  prevalence_rate: number;
  patient_count: number;
}

interface DiabetesRecord {
  year: number;
  age_group: string;
  prevalence_rate: number;
  patient_count: number;
}

interface RespiratoryRecord {
  date: string;
  virus: string;
  ed_visits: number;
  ed_visits_per_100k: number;
  percent_change: number;
}

function parseJsonBlocks(text: string): unknown[] {
  const results: unknown[] = [];
  const regex = /\{[\s\S]*?\}/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      results.push(JSON.parse(match[0]));
    } catch {
      // skip malformed blocks
    }
  }
  return results;
}

// ─── GET /api/healthintel/obesity ─────────────────────────────────────────────
router.get("/obesity", async (_req: Request, res: Response) => {
  try {
    const cached = fromCache("obesity");
    if (cached) return res.json({ data: cached, cached: true });

    const raw = callMCP("filter_data", { dataset: "chronic_obesity", state: "US" }) as string;
    const records = parseJsonBlocks(raw) as ObesityRecord[];

    // Aggregate: latest year per age group
    const byAgeGroup: Record<string, ObesityRecord> = {};
    for (const r of records) {
      if (!r.age_group || !r.year) continue;
      const existing = byAgeGroup[r.age_group];
      if (!existing || r.year > existing.year) {
        byAgeGroup[r.age_group] = r;
      }
    }

    const summary = Object.values(byAgeGroup)
      .sort((a, b) => a.age_group.localeCompare(b.age_group))
      .map(r => ({
        age_group: r.age_group,
        year: r.year,
        prevalence_rate: Math.round(r.prevalence_rate * 10) / 10,
        patient_count: r.patient_count,
      }));

    setCache("obesity", summary);
    return res.json({ data: summary, cached: false });
  } catch (err) {
    console.error("[healthintel] obesity error:", err);
    return res.status(500).json({ error: "Failed to fetch obesity data" });
  }
});

// ─── GET /api/healthintel/diabetes ────────────────────────────────────────────
router.get("/diabetes", async (_req: Request, res: Response) => {
  try {
    const cached = fromCache("diabetes");
    if (cached) return res.json({ data: cached, cached: true });

    const raw = callMCP("filter_data", { dataset: "chronic_diabetes", state: "US" }) as string;
    const records = parseJsonBlocks(raw) as DiabetesRecord[];

    const byAgeGroup: Record<string, DiabetesRecord> = {};
    for (const r of records) {
      if (!r.age_group || !r.year) continue;
      const existing = byAgeGroup[r.age_group];
      if (!existing || r.year > existing.year) {
        byAgeGroup[r.age_group] = r;
      }
    }

    const summary = Object.values(byAgeGroup)
      .sort((a, b) => a.age_group.localeCompare(b.age_group))
      .map(r => ({
        age_group: r.age_group,
        year: r.year,
        prevalence_rate: Math.round(r.prevalence_rate * 10) / 10,
        patient_count: r.patient_count,
      }));

    setCache("diabetes", summary);
    return res.json({ data: summary, cached: false });
  } catch (err) {
    console.error("[healthintel] diabetes error:", err);
    return res.status(500).json({ error: "Failed to fetch diabetes data" });
  }
});

// ─── GET /api/healthintel/respiratory ────────────────────────────────────────
router.get("/respiratory", async (_req: Request, res: Response) => {
  try {
    const cached = fromCache("respiratory");
    if (cached) return res.json({ data: cached, cached: true });

    const raw = callMCP("filter_data", { dataset: "respiratory_ed" }) as string;
    const records = parseJsonBlocks(raw) as RespiratoryRecord[];

    // Get the most recent week per virus
    const byVirus: Record<string, RespiratoryRecord> = {};
    for (const r of records) {
      if (!r.virus || !r.date) continue;
      const existing = byVirus[r.virus];
      if (!existing || r.date > existing.date) {
        byVirus[r.virus] = r;
      }
    }

    const summary = Object.values(byVirus).map(r => ({
      virus: r.virus,
      date: r.date,
      ed_visits: r.ed_visits,
      ed_visits_per_100k: Math.round(r.ed_visits_per_100k * 10) / 10,
      percent_change: Math.round(r.percent_change * 10) / 10,
      trend: r.percent_change > 5 ? "rising" : r.percent_change < -5 ? "falling" : "stable",
    }));

    setCache("respiratory", summary);
    return res.json({ data: summary, cached: false });
  } catch (err) {
    console.error("[healthintel] respiratory error:", err);
    return res.status(500).json({ error: "Failed to fetch respiratory data" });
  }
});

// ─── GET /api/healthintel/summary ────────────────────────────────────────────
// Combined endpoint — fetches all three in parallel
router.get("/summary", async (_req: Request, res: Response) => {
  try {
    const [obesityRes, diabetesRes, respiratoryRes] = await Promise.allSettled([
      fetch(`http://localhost:${process.env.PORT || 4000}/api/healthintel/obesity`).then(r => r.json()),
      fetch(`http://localhost:${process.env.PORT || 4000}/api/healthintel/diabetes`).then(r => r.json()),
      fetch(`http://localhost:${process.env.PORT || 4000}/api/healthintel/respiratory`).then(r => r.json()),
    ]);

    return res.json({
      obesity: obesityRes.status === "fulfilled" ? obesityRes.value.data : null,
      diabetes: diabetesRes.status === "fulfilled" ? diabetesRes.value.data : null,
      respiratory: respiratoryRes.status === "fulfilled" ? respiratoryRes.value.data : null,
      source: "Yale PopHIVE — Epic Cosmos EHR + CDC",
      last_updated: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[healthintel] summary error:", err);
    return res.status(500).json({ error: "Failed to fetch health summary" });
  }
});

export default router;
