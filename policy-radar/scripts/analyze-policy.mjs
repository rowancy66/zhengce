import crypto from "node:crypto";

const BUSINESS_KEYWORDS = {
  建设施工: ["建设施工", "建筑业", "施工", "智能建造", "工程建设"],
  物业服务: ["物业", "物业服务", "住宅小区", "社区服务"],
  安保服务: ["安保", "保安", "安全服务", "秩序维护"],
  商业管理: ["商业管理", "商贸", "商圈", "商业综合体"],
  资产管理: ["资产管理", "资产盘活", "低效资产", "国有资产", "闲置资产"],
  外贸: ["外贸", "出口", "跨境电商", "出口信用保险", "国际市场"],
  商砼: ["商砼", "预拌混凝土", "混凝土"],
  房地产: ["房地产", "住房", "保交楼", "房地产市场"],
  城市更新: ["城市更新", "旧城改造", "片区开发", "老旧小区"],
  社区嵌入式服务: ["社区嵌入式", "嵌入式服务", "养老托育", "便民服务"],
  土地: ["土地", "用地", "工业用地", "低效用地"],
  公共服务: ["公共服务", "民生服务", "政府购买服务", "公共资源"]
};

const SUBSIDY_SIGNALS = ["补贴", "奖励", "专项资金", "资金支持", "申报", "申报指南", "扶持", "贴息"];
const OPPORTUNITY_SIGNALS = ["试点", "示范", "政府采购", "项目入库", "融资支持", "税费优惠", "奖补"];

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter((value) => typeof value === "string" && value.trim()))];
}

function collapseWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function toText(value) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").join(" ");
  }
  return "";
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return uniqueStrings(value);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function normalizeRegion(value, fallbackText) {
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string" && item.trim());
    if (first) {
      return first.trim();
    }
  }
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return inferRegion(fallbackText);
}

function normalizeHashInput(input) {
  return collapseWhitespace(
    [
      input?.title,
      input?.sourceUrl,
      input?.publishDate,
      input?.sourceName,
      input?.text
    ]
      .map((value) => toText(value))
      .join("|")
  );
}

export function createPolicyId(input) {
  return crypto.createHash("sha256").update(normalizeHashInput(input)).digest("hex").slice(0, 16);
}

export function inferRegion(text) {
  const content = toText(text);
  if (content.includes("西海岸新区") || content.includes("黄岛区")) return "西海岸新区";
  if (content.includes("青岛")) return "青岛市";
  if (content.includes("山东")) return "山东省";
  return "国家";
}

export function normalizePolicy(input = {}) {
  const fallbackText = `${toText(input.title)} ${toText(input.text)} ${toText(input.sourceName)}`;

  return {
    id: input.id || createPolicyId(input),
    title: typeof input.title === "string" && input.title.trim() ? input.title.trim() : "未命名政策",
    sourceName: typeof input.sourceName === "string" && input.sourceName.trim() ? input.sourceName.trim() : "未知来源",
    sourceUrl: typeof input.sourceUrl === "string" ? input.sourceUrl : "",
    publishDate: typeof input.publishDate === "string" ? input.publishDate : "",
    region: normalizeRegion(input.region, fallbackText),
    text: toText(input.text),
    businessTags: normalizeList(input.businessTags),
    matchLevel: typeof input.matchLevel === "string" && input.matchLevel.trim() ? input.matchLevel.trim() : "C",
    hasSubsidySignal: Boolean(input.hasSubsidySignal),
    summary: typeof input.summary === "string" ? input.summary : "",
    benefits: normalizeList(input.benefits),
    fitAnalysis: typeof input.fitAnalysis === "string" ? input.fitAnalysis : "",
    nextActions: normalizeList(input.nextActions),
    riskNotes: normalizeList(input.riskNotes),
    oneLineConclusion: typeof input.oneLineConclusion === "string" ? input.oneLineConclusion : ""
  };
}

function collectBusinessTags(text) {
  return Object.entries(BUSINESS_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([tag]) => tag);
}

function collectSignals(text, signals) {
  return signals.filter((signal) => text.includes(signal));
}

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.trim());
}

function readStringArrayOrFallback(value, fallback) {
  return isNonEmptyStringArray(value) ? uniqueStrings(value) : fallback;
}

function readStringOrFallback(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function regionMatches(policyRegion, companyRegions) {
  if (!policyRegion) {
    return false;
  }

  if (policyRegion === "国家") {
    return true;
  }

  return companyRegions.includes(policyRegion);
}

export function analyzeWithRules(policy, companyProfile = {}) {
  const normalizedPolicy = normalizePolicy(policy);
  const text = `${normalizedPolicy.title} ${normalizedPolicy.text}`;
  const businessTags = [...new Set([...normalizedPolicy.businessTags, ...collectBusinessTags(text)])];
  const subsidySignals = collectSignals(text, SUBSIDY_SIGNALS);
  const opportunitySignals = collectSignals(text, OPPORTUNITY_SIGNALS);
  const companyRegions = uniqueStrings(companyProfile.region);
  const companyBusinessLines = uniqueStrings(companyProfile.businessLines);
  const regionFit = regionMatches(normalizedPolicy.region, companyRegions);
  const businessFit = businessTags.some((tag) => companyBusinessLines.includes(tag));
  const hasSubsidySignal = subsidySignals.length > 0;
  const hasOpportunitySignal = opportunitySignals.length > 0;

  let matchLevel = "C";
  if (regionFit && businessFit && (hasSubsidySignal || hasOpportunitySignal)) {
    matchLevel = "A";
  } else if (regionFit && businessFit) {
    matchLevel = "B";
  }

  return {
    ...normalizedPolicy,
    businessTags,
    matchLevel,
    hasSubsidySignal,
    summary:
      normalizedPolicy.summary ||
      `${normalizedPolicy.title} 与 ${businessTags.join("、") || "公司业务"} 相关，需要结合原文进一步核对。`,
    benefits: [
      ...subsidySignals.map((signal) => `出现“${signal}”信号，可能涉及资金或申报机会。`),
      ...opportunitySignals.map((signal) => `出现“${signal}”信号，可能涉及项目或市场机会。`)
    ],
    fitAnalysis:
      regionFit && businessFit
        ? "政策地区和业务方向与公司画像存在匹配，建议结合申报条件继续核对。"
        : "政策与公司画像匹配度有限，建议低优先级关注。",
    nextActions:
      hasSubsidySignal || hasOpportunitySignal
        ? ["打开政策原文核对申报条件", "准备营业执照、资质证书、纳税和项目材料", "联系对应主管部门确认申报口径"]
        : ["继续观察是否发布后续申报指南"],
    riskNotes: [...normalizedPolicy.riskNotes, "自动分析只用于初筛，请以政策原文和主管部门答复为准。"],
    oneLineConclusion:
      matchLevel === "A"
        ? "这条政策可能存在直接机会，建议重点跟进。"
        : "这条政策暂未发现明确补贴机会，建议按匹配等级关注。"
  };
}

export async function analyzePolicy(policy, companyProfile, options = {}) {
  const ruleResult = analyzeWithRules(policy, companyProfile);
  if (!options.deepSeekApiKey) {
    return ruleResult;
  }

  return analyzeWithDeepSeek(ruleResult, companyProfile, options);
}

export async function analyzeWithDeepSeek(policy, companyProfile, options = {}) {
  const apiKey = options.deepSeekApiKey;
  if (!apiKey) {
    return policy;
  }

  const baseUrl = typeof options.deepSeekBaseUrl === "string" && options.deepSeekBaseUrl.trim() ? options.deepSeekBaseUrl.trim() : "https://api.deepseek.com";
  const model = typeof options.deepSeekModel === "string" && options.deepSeekModel.trim() ? options.deepSeekModel.trim() : "deepseek-chat";
  const fetchImpl = typeof options.fetchImpl === "function" ? options.fetchImpl : fetch;

  try {
    const response = await fetchImpl(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "你是企业政策分析师。只输出 JSON，不编造政策金额、日期或条件。"
          },
          {
            role: "user",
            content: JSON.stringify({
              companyProfile,
              policy,
              requiredFields: [
                "matchLevel",
                "hasSubsidySignal",
                "summary",
                "benefits",
                "fitAnalysis",
                "nextActions",
                "riskNotes",
                "oneLineConclusion"
              ]
            })
          }
        ]
      })
    });

    if (!response.ok) {
      return {
        ...policy,
        riskNotes: [...policy.riskNotes, `DeepSeek 分析失败，已保留规则分析结果：HTTP ${response.status}`]
      };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      return {
        ...policy,
        riskNotes: [
          ...policy.riskNotes,
          `DeepSeek 分析失败，已保留规则分析结果：${error instanceof Error ? error.message : String(error)}`
        ]
      };
    }

    const matchLevel = typeof parsed.matchLevel === "string" && /^[ABCD]$/.test(parsed.matchLevel.trim())
      ? parsed.matchLevel.trim()
      : policy.matchLevel;
    const hasSubsidySignal = typeof parsed.hasSubsidySignal === "boolean" ? parsed.hasSubsidySignal : policy.hasSubsidySignal;

    return {
      ...policy,
      matchLevel,
      hasSubsidySignal,
      summary: readStringOrFallback(parsed.summary, policy.summary),
      benefits: readStringArrayOrFallback(parsed.benefits, policy.benefits),
      fitAnalysis: readStringOrFallback(parsed.fitAnalysis, policy.fitAnalysis),
      nextActions: readStringArrayOrFallback(parsed.nextActions, policy.nextActions),
      riskNotes: readStringArrayOrFallback(parsed.riskNotes, policy.riskNotes),
      oneLineConclusion: readStringOrFallback(parsed.oneLineConclusion, policy.oneLineConclusion)
    };
  } catch (error) {
    return {
      ...policy,
      riskNotes: [...policy.riskNotes, `DeepSeek 分析失败，已保留规则分析结果：${error instanceof Error ? error.message : String(error)}`]
    };
  }
}
