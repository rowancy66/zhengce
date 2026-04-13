import test from "node:test";
import assert from "node:assert/strict";

import { analyzeWithDeepSeek, analyzeWithRules, createPolicyId, normalizePolicy } from "../scripts/analyze-policy.mjs";

const companyProfile = {
  region: ["青岛西海岸新区", "青岛市", "山东省"],
  businessLines: ["建设施工", "物业服务", "安保服务", "商业管理", "资产管理", "外贸", "商砼"],
  prioritySignals: ["补贴", "奖励", "专项资金", "申报指南", "试点", "示范", "政府采购"]
};

test("analyzeWithRules marks subsidy construction policy as A level", () => {
  const policy = normalizePolicy({
    title: "青岛市建筑业专项资金申报指南",
    text: "支持建设施工企业申报专项资金补贴和奖励，鼓励智能建造示范项目。",
    sourceName: "青岛市住房和城乡建设局",
    sourceUrl: "https://example.com/a",
    publishDate: "2026-04-13"
  });

  const result = analyzeWithRules(policy, companyProfile);

  assert.equal(result.matchLevel, "A");
  assert.equal(result.hasSubsidySignal, true);
  assert.ok(result.businessTags.includes("建设施工"));
  assert.ok(result.benefits.some((item) => item.includes("专项资金")));
});

test("analyzeWithRules marks unrelated expired policy as C level", () => {
  const policy = normalizePolicy({
    title: "文化旅游宣传活动通知",
    text: "本通知面向景区和旅行社，活动报名已截止。",
    sourceName: "示例来源",
    sourceUrl: "https://example.com/b",
    publishDate: "2025-01-01"
  });

  const result = analyzeWithRules(policy, companyProfile);

  assert.equal(result.matchLevel, "C");
  assert.equal(result.hasSubsidySignal, false);
});

test("analyzeWithRules treats West Coast New Area alias as company region fit", () => {
  const policy = normalizePolicy({
    title: "青岛西海岸新区城市更新试点项目申报通知",
    text: "支持城市更新、建设施工和公共服务项目申报试点。",
    sourceName: "青岛西海岸新区",
    sourceUrl: "https://example.com/west-coast",
    publishDate: "2026-04-13",
    region: "西海岸新区"
  });

  const result = analyzeWithRules(policy, companyProfile);

  assert.equal(result.matchLevel, "A");
  assert.ok(result.businessTags.includes("城市更新"));
});

test("createPolicyId uses publishDate sourceName and text to avoid collisions", () => {
  const base = {
    title: "",
    sourceUrl: "",
    publishDate: "2026-04-13",
    sourceName: "来源一",
    text: "正文一"
  };

  const changed = {
    ...base,
    publishDate: "2026-04-14",
    sourceName: "来源二",
    text: "正文二"
  };

  assert.notEqual(createPolicyId(base), createPolicyId(changed));
});

test("analyzeWithDeepSeek preserves rule result and appends risk note on HTTP failure", async () => {
  const policy = analyzeWithRules(
    normalizePolicy({
      title: "青岛市建筑业专项资金申报指南",
      text: "支持建设施工企业申报专项资金补贴和奖励，鼓励智能建造示范项目。",
      sourceName: "青岛市住房和城乡建设局",
      sourceUrl: "https://example.com/a",
      publishDate: "2026-04-13"
    }),
    companyProfile
  );

  const result = await analyzeWithDeepSeek(policy, companyProfile, {
    deepSeekApiKey: "test-key",
    fetchImpl: async () => ({
      ok: false,
      status: 503,
      json: async () => ({})
    })
  });

  assert.equal(result.matchLevel, policy.matchLevel);
  assert.equal(result.hasSubsidySignal, policy.hasSubsidySignal);
  assert.ok(result.riskNotes.some((item) => item.includes("HTTP 503")));
});

test("analyzeWithDeepSeek preserves rule result and appends risk note on bad JSON", async () => {
  const policy = analyzeWithRules(
    normalizePolicy({
      title: "青岛市建筑业专项资金申报指南",
      text: "支持建设施工企业申报专项资金补贴和奖励，鼓励智能建造示范项目。",
      sourceName: "青岛市住房和城乡建设局",
      sourceUrl: "https://example.com/a",
      publishDate: "2026-04-13"
    }),
    companyProfile
  );

  const result = await analyzeWithDeepSeek(policy, companyProfile, {
    deepSeekApiKey: "test-key",
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: "{not-json"
            }
          }
        ]
      })
    })
  });

  assert.equal(result.matchLevel, policy.matchLevel);
  assert.equal(result.hasSubsidySignal, policy.hasSubsidySignal);
  assert.equal(result.riskNotes.length, policy.riskNotes.length + 1);
  assert.ok(result.riskNotes.some((item) => item.includes("DeepSeek 分析失败")));
});

test("analyzeWithDeepSeek keeps rule result when DeepSeek fields are invalid", async () => {
  const policy = analyzeWithRules(
    normalizePolicy({
      title: "青岛市建筑业专项资金申报指南",
      text: "支持建设施工企业申报专项资金补贴和奖励，鼓励智能建造示范项目。",
      sourceName: "青岛市住房和城乡建设局",
      sourceUrl: "https://example.com/a",
      publishDate: "2026-04-13"
    }),
    companyProfile
  );

  const result = await analyzeWithDeepSeek(policy, companyProfile, {
    deepSeekApiKey: "test-key",
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                matchLevel: "Z",
                hasSubsidySignal: "yes",
                summary: "",
                benefits: [],
                fitAnalysis: 123,
                nextActions: [1, 2],
                riskNotes: [],
                oneLineConclusion: ""
              })
            }
          }
        ]
      })
    })
  });

  assert.equal(result.matchLevel, policy.matchLevel);
  assert.equal(result.hasSubsidySignal, policy.hasSubsidySignal);
  assert.deepEqual(result.benefits, policy.benefits);
  assert.deepEqual(result.nextActions, policy.nextActions);
  assert.deepEqual(result.riskNotes, policy.riskNotes);
  assert.equal(result.summary, policy.summary);
  assert.equal(result.fitAnalysis, policy.fitAnalysis);
  assert.equal(result.oneLineConclusion, policy.oneLineConclusion);
});
