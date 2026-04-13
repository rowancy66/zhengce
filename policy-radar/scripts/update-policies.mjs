import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { analyzePolicy, normalizePolicy } from "./analyze-policy.mjs";
import { fetchPolicyPage } from "./fetch-policies.mjs";
import { readIssueSources } from "./issue-sources.mjs";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(rootDir, "data");

async function readJson(fileName) {
  const text = await fs.readFile(path.join(dataDir, fileName), "utf8");
  return JSON.parse(text);
}

async function writeJson(fileName, value) {
  await fs.writeFile(path.join(dataDir, fileName), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  const companyProfile = await readJson("company-profile.json");
  const builtInSources = await readJson("sources.json");
  const existingPolicies = await readJson("policies.json");
  const issueSources = await readIssueSources();
  const sources = dedupeSources([...builtInSources, ...issueSources]);
  const fetched = [];
  const errors = [];

  for (const source of sources) {
    try {
      const page = await fetchPolicyPage(source);
      const analyzed = await analyzePolicy(normalizePolicy(page), companyProfile, {
        deepSeekApiKey: process.env.DEEPSEEK_API_KEY
      });
      fetched.push(analyzed);
    } catch (error) {
      errors.push({
        source: source.url,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const policies = mergePolicies(existingPolicies, fetched);
  await writeJson("policies.json", policies);
  await writeJson("run-log.json", {
    lastRunAt: new Date().toISOString(),
    status: errors.length > 0 ? "completed_with_errors" : "completed",
    fetchedCount: fetched.length,
    analyzedCount: fetched.length,
    errorCount: errors.length,
    errors,
    message: errors.length > 0 ? "已完成更新，部分来源抓取失败。" : "已完成政策更新。"
  });
}

function dedupeSources(sources) {
  const seen = new Set();
  return sources.filter((source) => {
    if (!source?.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}

function mergePolicies(existingPolicies, fetchedPolicies) {
  const map = new Map();
  for (const policy of existingPolicies) {
    map.set(policy.id, policy);
  }
  for (const policy of fetchedPolicies) {
    map.set(policy.id, policy);
  }
  return [...map.values()].sort((a, b) => String(b.publishDate).localeCompare(String(a.publishDate)));
}

main().catch(async (error) => {
  await writeJson("run-log.json", {
    lastRunAt: new Date().toISOString(),
    status: "failed",
    fetchedCount: 0,
    analyzedCount: 0,
    message: error instanceof Error ? error.message : String(error)
  });
  process.exitCode = 1;
});
