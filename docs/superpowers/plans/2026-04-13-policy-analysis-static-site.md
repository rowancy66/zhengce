# Policy Analysis Static Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub Pages static site that tracks policy updates, classifies them by company business relevance, and refreshes daily through GitHub Actions with optional DeepSeek analysis.

**Architecture:** Create an isolated `policy-radar/` static web app inside the repository. The browser reads JSON files from `policy-radar/data/`; Node scripts refresh those files by fetching configured policy sources, reading GitHub Issue submissions, applying deterministic rules, and optionally calling DeepSeek through a GitHub Secret.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Node.js 20 built-ins, GitHub Actions, GitHub Pages, DeepSeek OpenAI-compatible API.

---

## File Structure

Create this isolated project structure:

```text
policy-radar/
  index.html
  assets/
    styles.css
    app.js
  data/
    company-profile.json
    policies.json
    run-log.json
    sources.json
  scripts/
    analyze-policy.mjs
    fetch-policies.mjs
    issue-sources.mjs
    update-policies.mjs
  tests/
    analyze-policy.test.mjs
  README.md
.github/
  ISSUE_TEMPLATE/
    policy-source.yml
  workflows/
    policy-radar-update.yml
```

Responsibilities:

- `policy-radar/index.html` owns the static page shell and visible sections.
- `policy-radar/assets/styles.css` owns all website visual styling.
- `policy-radar/assets/app.js` owns client-side loading, filtering, rendering, and detail display.
- `policy-radar/data/company-profile.json` stores the company matching profile.
- `policy-radar/data/sources.json` stores built-in policy source URLs.
- `policy-radar/data/policies.json` stores policy records and analysis results.
- `policy-radar/data/run-log.json` stores the latest update status.
- `policy-radar/scripts/analyze-policy.mjs` owns rules and DeepSeek analysis normalization.
- `policy-radar/scripts/fetch-policies.mjs` owns page fetching and lightweight text extraction.
- `policy-radar/scripts/issue-sources.mjs` owns GitHub Issue source parsing.
- `policy-radar/scripts/update-policies.mjs` owns the end-to-end daily update pipeline.
- `.github/ISSUE_TEMPLATE/policy-source.yml` gives the user a no-code way to add policy sources.
- `.github/workflows/policy-radar-update.yml` runs the daily update and commits refreshed data.

## Task 1: Scaffold Static Site Data And Shell

**Files:**

- Create: `policy-radar/index.html`
- Create: `policy-radar/assets/styles.css`
- Create: `policy-radar/assets/app.js`
- Create: `policy-radar/data/company-profile.json`
- Create: `policy-radar/data/policies.json`
- Create: `policy-radar/data/run-log.json`
- Create: `policy-radar/data/sources.json`
- Create: `policy-radar/README.md`

- [ ] **Step 1: Create initial data files**

Create `policy-radar/data/company-profile.json`:

```json
{
  "companyName": "青岛西海岸新区综合型民营企业",
  "region": ["青岛西海岸新区", "青岛市", "山东省"],
  "companyType": ["民营企业", "中小企业"],
  "businessLines": [
    "建设施工",
    "物业服务",
    "安保服务",
    "商业管理",
    "资产管理",
    "外贸",
    "商砼",
    "房地产",
    "城市更新",
    "社区嵌入式服务",
    "土地",
    "公共服务"
  ],
  "prioritySignals": [
    "补贴",
    "奖励",
    "专项资金",
    "申报指南",
    "试点",
    "示范",
    "政府采购",
    "融资支持",
    "税费优惠"
  ]
}
```

Create `policy-radar/data/sources.json`:

```json
[
  {
    "id": "mohurd",
    "name": "住房和城乡建设部",
    "level": "国家",
    "url": "https://www.mohurd.gov.cn/gongkai/zhengce/index.html",
    "tags": ["建设施工", "房地产", "城市更新", "装配式建筑"]
  },
  {
    "id": "mofcom",
    "name": "商务部",
    "level": "国家",
    "url": "https://www.mofcom.gov.cn/zcfb/",
    "tags": ["外贸", "商业管理"]
  },
  {
    "id": "shandong-gov",
    "name": "山东省人民政府",
    "level": "山东省",
    "url": "https://www.shandong.gov.cn/col/col267492/",
    "tags": ["民营经济", "公共服务", "土地", "外贸"]
  },
  {
    "id": "qingdao-gov",
    "name": "青岛市人民政府",
    "level": "青岛市",
    "url": "http://www.qingdao.gov.cn/zwgk/zdgk/fgwj/",
    "tags": ["青岛市", "建设施工", "外贸", "公共服务"]
  },
  {
    "id": "west-coast",
    "name": "青岛西海岸新区",
    "level": "西海岸新区",
    "url": "https://www.xihaian.gov.cn/zwgk/",
    "tags": ["西海岸新区", "建设施工", "物业服务", "城市更新"]
  }
]
```

Create `policy-radar/data/policies.json`:

```json
[
  {
    "id": "sample-001",
    "title": "示例政策：青岛市支持民营企业高质量发展政策",
    "sourceName": "示例数据",
    "sourceUrl": "https://example.com/policy",
    "publishDate": "2026-04-13",
    "region": "青岛市",
    "businessTags": ["民营经济", "公共服务"],
    "matchLevel": "B",
    "hasSubsidySignal": true,
    "summary": "这是一条用于验证网站展示效果的示例政策。",
    "benefits": ["可能涉及民营企业支持", "需要关注后续申报指南"],
    "fitAnalysis": "公司位于青岛西海岸新区，若政策后续发布具体申报细则，建议继续关注。",
    "nextActions": ["等待正式申报指南", "准备营业执照、纳税和资质材料"],
    "riskNotes": ["示例数据不代表真实政策结论"],
    "oneLineConclusion": "这条示例政策用于测试页面展示，真实上线后会由自动任务替换。"
  }
]
```

Create `policy-radar/data/run-log.json`:

```json
{
  "lastRunAt": "2026-04-13T00:00:00.000Z",
  "status": "initialized",
  "fetchedCount": 0,
  "analyzedCount": 0,
  "message": "初始数据已创建，等待 GitHub Actions 自动更新。"
}
```

- [ ] **Step 2: Create the static page shell**

Create `policy-radar/index.html`:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>政策雷达 | 西海岸新区企业政策分析</title>
    <link rel="stylesheet" href="./assets/styles.css" />
  </head>
  <body>
    <header class="site-header">
      <nav class="top-nav" aria-label="主导航">
        <a href="#overview">政策雷达</a>
        <a href="#opportunities">补贴机会</a>
        <a href="#library">政策库</a>
        <a href="#sources">数据源</a>
      </nav>
      <section class="hero" id="overview">
        <p class="eyebrow">青岛西海岸新区民营企业政策监测</p>
        <h1>每天追踪政策，优先发现补贴和项目机会</h1>
        <p class="hero-copy">
          面向建设施工、物业、安保、商业管理、资产管理、外贸、商砼等业务，自动汇总国家、山东省、青岛市和西海岸新区政策。
        </p>
      </section>
    </header>

    <main>
      <section class="summary-grid" aria-label="政策统计">
        <article>
          <span class="metric" id="metric-total">0</span>
          <p>政策总数</p>
        </article>
        <article>
          <span class="metric" id="metric-priority">0</span>
          <p>A级重点跟进</p>
        </article>
        <article>
          <span class="metric" id="metric-subsidy">0</span>
          <p>疑似补贴机会</p>
        </article>
        <article>
          <span class="metric" id="metric-updated">-</span>
          <p>最近更新</p>
        </article>
      </section>

      <section class="section" id="opportunities">
        <div class="section-heading">
          <p class="eyebrow">Priority</p>
          <h2>重点跟进</h2>
        </div>
        <div class="policy-list" id="priority-list"></div>
      </section>

      <section class="section" id="library">
        <div class="section-heading">
          <p class="eyebrow">Library</p>
          <h2>政策库</h2>
        </div>
        <div class="filters" aria-label="政策筛选">
          <input id="search-input" type="search" placeholder="搜索政策标题、业务板块或关键词" />
          <select id="region-filter">
            <option value="">全部地区</option>
          </select>
          <select id="business-filter">
            <option value="">全部业务</option>
          </select>
          <select id="level-filter">
            <option value="">全部等级</option>
            <option value="A">A级重点跟进</option>
            <option value="B">B级持续关注</option>
            <option value="C">C级低优先级</option>
            <option value="D">D级暂不适用</option>
          </select>
        </div>
        <div class="policy-list" id="policy-list"></div>
      </section>

      <section class="section" id="sources">
        <div class="section-heading">
          <p class="eyebrow">Sources</p>
          <h2>新增政策网站</h2>
        </div>
        <p class="source-note">
          第一版通过 GitHub Issue 表单新增政策来源。打开仓库的 Issues，选择“新增政策来源”，填写政策网址、地区和业务标签，系统会在下一次每日任务中读取。
        </p>
      </section>
    </main>

    <dialog id="policy-dialog">
      <button class="dialog-close" id="dialog-close" aria-label="关闭">关闭</button>
      <div id="dialog-content"></div>
    </dialog>

    <script type="module" src="./assets/app.js"></script>
  </body>
</html>
```

- [ ] **Step 3: Create minimal styling**

Create `policy-radar/assets/styles.css` with the first page-ready style:

```css
:root {
  color-scheme: light;
  --bg: #f6f7f9;
  --surface: #ffffff;
  --ink: #17202a;
  --muted: #5d6978;
  --line: #d8dde5;
  --accent: #0f766e;
  --accent-strong: #0b5f59;
  --warn: #b45309;
  --danger: #b91c1c;
  --radius: 8px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

a {
  color: inherit;
}

.site-header {
  background: linear-gradient(180deg, #e8f3ef 0%, #f6f7f9 100%);
  border-bottom: 1px solid var(--line);
}

.top-nav {
  display: flex;
  gap: 18px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px 20px;
  color: var(--muted);
  font-size: 15px;
}

.top-nav a {
  text-decoration: none;
}

.hero {
  max-width: 1180px;
  margin: 0 auto;
  padding: 54px 20px 64px;
}

.eyebrow {
  color: var(--accent-strong);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  margin: 0 0 10px;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  max-width: 760px;
  font-size: clamp(34px, 6vw, 64px);
  line-height: 1.05;
  margin-bottom: 18px;
}

.hero-copy {
  max-width: 760px;
  color: var(--muted);
  font-size: 19px;
  line-height: 1.7;
}

main {
  max-width: 1180px;
  margin: 0 auto;
  padding: 24px 20px 64px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-top: -42px;
}

.summary-grid article,
.policy-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: 0 12px 30px rgba(23, 32, 42, 0.06);
}

.summary-grid article {
  padding: 20px;
}

.metric {
  display: block;
  font-size: 32px;
  font-weight: 800;
  color: var(--accent-strong);
}

.summary-grid p {
  color: var(--muted);
  margin-bottom: 0;
}

.section {
  padding-top: 44px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}

.section-heading h2 {
  font-size: 28px;
  margin-bottom: 0;
}

.filters {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

input,
select,
button {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  font: inherit;
  min-height: 42px;
}

input,
select {
  background: var(--surface);
  color: var(--ink);
  padding: 0 12px;
}

.policy-list {
  display: grid;
  gap: 14px;
}

.policy-card {
  padding: 18px;
}

.policy-card h3 {
  font-size: 20px;
  margin-bottom: 10px;
}

.policy-meta,
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.policy-meta {
  color: var(--muted);
  font-size: 14px;
  margin-bottom: 12px;
}

.tag {
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  font-size: 13px;
  padding: 5px 9px;
}

.level-a {
  color: var(--danger);
  border-color: #fecaca;
  background: #fff1f2;
}

.level-b {
  color: var(--warn);
  border-color: #fed7aa;
  background: #fff7ed;
}

.card-actions {
  margin-top: 14px;
}

.card-actions button,
.dialog-close {
  background: var(--accent);
  color: white;
  cursor: pointer;
  padding: 0 14px;
}

.source-note {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--muted);
  line-height: 1.8;
  padding: 18px;
}

dialog {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  max-width: 760px;
  width: calc(100% - 32px);
}

dialog::backdrop {
  background: rgba(23, 32, 42, 0.42);
}

.dialog-close {
  float: right;
}

@media (max-width: 820px) {
  .summary-grid,
  .filters {
    grid-template-columns: 1fr;
  }

  .top-nav {
    overflow-x: auto;
  }
}
```

- [ ] **Step 4: Create placeholder app loader**

Create `policy-radar/assets/app.js`:

```js
const state = {
  policies: [],
  runLog: null,
  filters: {
    search: "",
    region: "",
    business: "",
    level: ""
  }
};

const elements = {
  total: document.querySelector("#metric-total"),
  priority: document.querySelector("#metric-priority"),
  subsidy: document.querySelector("#metric-subsidy"),
  updated: document.querySelector("#metric-updated"),
  priorityList: document.querySelector("#priority-list"),
  policyList: document.querySelector("#policy-list"),
  searchInput: document.querySelector("#search-input"),
  regionFilter: document.querySelector("#region-filter"),
  businessFilter: document.querySelector("#business-filter"),
  levelFilter: document.querySelector("#level-filter"),
  dialog: document.querySelector("#policy-dialog"),
  dialogClose: document.querySelector("#dialog-close"),
  dialogContent: document.querySelector("#dialog-content")
};

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`读取 ${path} 失败：${response.status}`);
  }
  return response.json();
}

function uniqueValues(items) {
  return [...new Set(items.filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function fillFilter(select, values) {
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
}

function levelLabel(level) {
  const labels = {
    A: "A级重点跟进",
    B: "B级持续关注",
    C: "C级低优先级",
    D: "D级暂不适用"
  };
  return labels[level] || "未评级";
}

function renderCard(policy) {
  const article = document.createElement("article");
  article.className = "policy-card";
  const tags = (policy.businessTags || [])
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  article.innerHTML = `
    <h3>${policy.title}</h3>
    <div class="policy-meta">
      <span>${policy.region || "未知地区"}</span>
      <span>${policy.sourceName || "未知来源"}</span>
      <span>${policy.publishDate || "未知日期"}</span>
    </div>
    <div class="tag-row">
      <span class="tag level-${String(policy.matchLevel || "").toLowerCase()}">${levelLabel(policy.matchLevel)}</span>
      ${policy.hasSubsidySignal ? '<span class="tag level-a">疑似补贴</span>' : ""}
      ${tags}
    </div>
    <p>${policy.oneLineConclusion || policy.summary || "暂无分析结论。"}</p>
    <div class="card-actions">
      <button type="button">查看详情</button>
    </div>
  `;

  article.querySelector("button").addEventListener("click", () => showPolicy(policy));
  return article;
}

function showPolicy(policy) {
  elements.dialogContent.innerHTML = `
    <h2>${policy.title}</h2>
    <p><strong>一句话结论：</strong>${policy.oneLineConclusion || "暂无结论。"}</p>
    <p><strong>政策摘要：</strong>${policy.summary || "暂无摘要。"}</p>
    <p><strong>公司匹配：</strong>${policy.fitAnalysis || "暂无匹配分析。"}</p>
    <h3>可能利好</h3>
    <ul>${(policy.benefits || ["暂无明确利好"]).map((item) => `<li>${item}</li>`).join("")}</ul>
    <h3>建议动作</h3>
    <ul>${(policy.nextActions || ["继续观察正式申报通知"]).map((item) => `<li>${item}</li>`).join("")}</ul>
    <h3>风险提示</h3>
    <ul>${(policy.riskNotes || ["请以政策原文和主管部门答复为准"]).map((item) => `<li>${item}</li>`).join("")}</ul>
    <p><a href="${policy.sourceUrl}" target="_blank" rel="noreferrer">查看政策原文</a></p>
  `;
  elements.dialog.showModal();
}

function matchesFilters(policy) {
  const haystack = [policy.title, policy.summary, policy.oneLineConclusion, ...(policy.businessTags || [])]
    .join(" ")
    .toLowerCase();
  const searchMatch = !state.filters.search || haystack.includes(state.filters.search.toLowerCase());
  const regionMatch = !state.filters.region || policy.region === state.filters.region;
  const businessMatch = !state.filters.business || (policy.businessTags || []).includes(state.filters.business);
  const levelMatch = !state.filters.level || policy.matchLevel === state.filters.level;
  return searchMatch && regionMatch && businessMatch && levelMatch;
}

function render() {
  const priorityPolicies = state.policies.filter((policy) => policy.matchLevel === "A" || policy.hasSubsidySignal);
  const filteredPolicies = state.policies.filter(matchesFilters);

  elements.total.textContent = String(state.policies.length);
  elements.priority.textContent = String(state.policies.filter((policy) => policy.matchLevel === "A").length);
  elements.subsidy.textContent = String(state.policies.filter((policy) => policy.hasSubsidySignal).length);
  elements.updated.textContent = state.runLog?.lastRunAt ? state.runLog.lastRunAt.slice(0, 10) : "-";

  elements.priorityList.replaceChildren(...priorityPolicies.map(renderCard));
  elements.policyList.replaceChildren(...filteredPolicies.map(renderCard));
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim();
    render();
  });
  elements.regionFilter.addEventListener("change", (event) => {
    state.filters.region = event.target.value;
    render();
  });
  elements.businessFilter.addEventListener("change", (event) => {
    state.filters.business = event.target.value;
    render();
  });
  elements.levelFilter.addEventListener("change", (event) => {
    state.filters.level = event.target.value;
    render();
  });
  elements.dialogClose.addEventListener("click", () => elements.dialog.close());
}

async function init() {
  state.policies = await loadJson("./data/policies.json");
  state.runLog = await loadJson("./data/run-log.json");
  fillFilter(elements.regionFilter, uniqueValues(state.policies.map((policy) => policy.region)));
  fillFilter(elements.businessFilter, uniqueValues(state.policies.flatMap((policy) => policy.businessTags || [])));
  bindEvents();
  render();
}

init().catch((error) => {
  document.body.insertAdjacentHTML("afterbegin", `<p class="source-note">网站数据加载失败：${error.message}</p>`);
});
```

- [ ] **Step 5: Create initial project README**

Create `policy-radar/README.md`:

```markdown
# 政策雷达静态网站

这是一个面向青岛西海岸新区综合型民营企业的政策分析静态网站。

## 第一版功能

- 展示政策库。
- 筛选地区、业务板块、匹配等级。
- 标记疑似补贴、奖励、专项资金和申报机会。
- 使用 GitHub Actions 每天自动更新政策数据。
- 支持 DeepSeek API 生成企业适配分析。
- 支持通过 GitHub Issue 表单新增政策来源。

## 本地预览

在浏览器中打开：

```bash
open policy-radar/index.html
```

## 数据文件

- `data/policies.json`：政策列表和分析结果。
- `data/sources.json`：内置政策来源。
- `data/company-profile.json`：公司画像。
- `data/run-log.json`：最近一次更新状态。

## DeepSeek 配置

在 GitHub 仓库的 Settings -> Secrets and variables -> Actions 中新增：

- `DEEPSEEK_API_KEY`

没有配置密钥时，系统会使用规则分析生成基础结果。
```

- [ ] **Step 6: Verify static page loads**

Run:

```bash
open policy-radar/index.html
```

Expected: Browser opens the policy radar page and shows the sample policy.

- [ ] **Step 7: Commit scaffold**

Run:

```bash
git add policy-radar/index.html policy-radar/assets/styles.css policy-radar/assets/app.js policy-radar/data/company-profile.json policy-radar/data/policies.json policy-radar/data/run-log.json policy-radar/data/sources.json policy-radar/README.md
git commit -m "feat: scaffold policy radar static site"
```

Expected: Commit succeeds with only the scaffold files.

## Task 2: Add Deterministic Policy Analysis Rules

**Files:**

- Create: `policy-radar/scripts/analyze-policy.mjs`
- Create: `policy-radar/tests/analyze-policy.test.mjs`

- [ ] **Step 1: Write rule analysis tests**

Create `policy-radar/tests/analyze-policy.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { analyzeWithRules, normalizePolicy } from "../scripts/analyze-policy.mjs";

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
node --test policy-radar/tests/analyze-policy.test.mjs
```

Expected: FAIL because `policy-radar/scripts/analyze-policy.mjs` does not exist.

- [ ] **Step 3: Implement rule analyzer**

Create `policy-radar/scripts/analyze-policy.mjs`:

```js
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

export function createPolicyId(input) {
  return crypto.createHash("sha256").update(`${input.title}|${input.sourceUrl}`).digest("hex").slice(0, 16);
}

export function normalizePolicy(input) {
  return {
    id: input.id || createPolicyId(input),
    title: input.title || "未命名政策",
    sourceName: input.sourceName || "未知来源",
    sourceUrl: input.sourceUrl || "",
    publishDate: input.publishDate || "",
    region: input.region || inferRegion(`${input.title || ""} ${input.text || ""} ${input.sourceName || ""}`),
    text: input.text || "",
    businessTags: input.businessTags || [],
    matchLevel: input.matchLevel || "C",
    hasSubsidySignal: Boolean(input.hasSubsidySignal),
    summary: input.summary || "",
    benefits: input.benefits || [],
    fitAnalysis: input.fitAnalysis || "",
    nextActions: input.nextActions || [],
    riskNotes: input.riskNotes || [],
    oneLineConclusion: input.oneLineConclusion || ""
  };
}

export function inferRegion(text) {
  if (text.includes("西海岸新区") || text.includes("黄岛区")) return "西海岸新区";
  if (text.includes("青岛")) return "青岛市";
  if (text.includes("山东")) return "山东省";
  return "国家";
}

function collectBusinessTags(text) {
  return Object.entries(BUSINESS_KEYWORDS)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([tag]) => tag);
}

function collectSignals(text, signals) {
  return signals.filter((signal) => text.includes(signal));
}

export function analyzeWithRules(policy, companyProfile) {
  const text = `${policy.title} ${policy.text}`;
  const businessTags = [...new Set([...policy.businessTags, ...collectBusinessTags(text)])];
  const subsidySignals = collectSignals(text, SUBSIDY_SIGNALS);
  const opportunitySignals = collectSignals(text, OPPORTUNITY_SIGNALS);
  const regionFit = companyProfile.region.includes(policy.region) || policy.region === "国家";
  const businessFit = businessTags.some((tag) => companyProfile.businessLines.includes(tag));
  const hasSubsidySignal = subsidySignals.length > 0;
  const hasOpportunitySignal = opportunitySignals.length > 0;

  let matchLevel = "C";
  if (regionFit && businessFit && (hasSubsidySignal || hasOpportunitySignal)) {
    matchLevel = "A";
  } else if (regionFit && businessFit) {
    matchLevel = "B";
  }

  return {
    ...policy,
    businessTags,
    matchLevel,
    hasSubsidySignal,
    summary: policy.summary || `${policy.title} 与 ${businessTags.join("、") || "公司业务"} 相关，需要结合原文进一步核对。`,
    benefits: [
      ...subsidySignals.map((signal) => `出现“${signal}”信号，可能涉及资金或申报机会。`),
      ...opportunitySignals.map((signal) => `出现“${signal}”信号，可能涉及项目或市场机会。`)
    ],
    fitAnalysis: regionFit && businessFit
      ? "政策地区和业务方向与公司画像存在匹配，建议结合申报条件继续核对。"
      : "政策与公司画像匹配度有限，建议低优先级关注。",
    nextActions: hasSubsidySignal || hasOpportunitySignal
      ? ["打开政策原文核对申报条件", "准备营业执照、资质证书、纳税和项目材料", "联系对应主管部门确认申报口径"]
      : ["继续观察是否发布后续申报指南"],
    riskNotes: ["自动分析只用于初筛，请以政策原文和主管部门答复为准。"],
    oneLineConclusion: matchLevel === "A"
      ? "这条政策可能存在直接机会，建议重点跟进。"
      : "这条政策暂未发现明确补贴机会，建议按匹配等级关注。"
  };
}

export async function analyzePolicy(policy, companyProfile, options = {}) {
  const ruleResult = analyzeWithRules(policy, companyProfile);
  if (!options.deepSeekApiKey) {
    return ruleResult;
  }
  return analyzeWithDeepSeek(ruleResult, companyProfile, options.deepSeekApiKey);
}

async function analyzeWithDeepSeek(policy, companyProfile, apiKey) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
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
  const content = data.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(content);
  return {
    ...policy,
    matchLevel: parsed.matchLevel || policy.matchLevel,
    hasSubsidySignal: Boolean(parsed.hasSubsidySignal ?? policy.hasSubsidySignal),
    summary: parsed.summary || policy.summary,
    benefits: Array.isArray(parsed.benefits) ? parsed.benefits : policy.benefits,
    fitAnalysis: parsed.fitAnalysis || policy.fitAnalysis,
    nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions : policy.nextActions,
    riskNotes: Array.isArray(parsed.riskNotes) ? parsed.riskNotes : policy.riskNotes,
    oneLineConclusion: parsed.oneLineConclusion || policy.oneLineConclusion
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
node --test policy-radar/tests/analyze-policy.test.mjs
```

Expected: PASS with two tests passing.

- [ ] **Step 5: Commit analyzer**

Run:

```bash
git add policy-radar/scripts/analyze-policy.mjs policy-radar/tests/analyze-policy.test.mjs
git commit -m "feat: add policy analysis rules"
```

Expected: Commit succeeds with analyzer and tests.

## Task 3: Add Policy Fetch And Update Pipeline

**Files:**

- Create: `policy-radar/scripts/fetch-policies.mjs`
- Create: `policy-radar/scripts/issue-sources.mjs`
- Create: `policy-radar/scripts/update-policies.mjs`

- [ ] **Step 1: Create web fetcher**

Create `policy-radar/scripts/fetch-policies.mjs`:

```js
export async function fetchPolicyPage(source) {
  const response = await fetch(source.url, {
    headers: {
      "User-Agent": "PolicyRadarBot/1.0 (+https://github.com)"
    }
  });

  if (!response.ok) {
    throw new Error(`抓取失败 ${source.url}: HTTP ${response.status}`);
  }

  const html = await response.text();
  const text = extractText(html);
  return {
    title: extractTitle(html) || source.name,
    sourceName: source.name,
    sourceUrl: source.url,
    publishDate: new Date().toISOString().slice(0, 10),
    region: source.level,
    text,
    businessTags: source.tags || []
  };
}

export function extractTitle(html) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
  if (!titleMatch) return "";
  return decodeHtml(titleMatch[1]).replace(/\s+/g, " ").trim();
}

export function extractText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  ).slice(0, 12000);
}

function decodeHtml(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}
```

- [ ] **Step 2: Create GitHub Issue source reader**

Create `policy-radar/scripts/issue-sources.mjs`:

```js
export async function readIssueSources() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!token || !repository) {
    return [];
  }

  const response = await fetch(`https://api.github.com/repos/${repository}/issues?labels=policy-source&state=open`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    throw new Error(`读取 GitHub Issue 失败：HTTP ${response.status}`);
  }

  const issues = await response.json();
  return issues
    .map((issue) => parseIssueSource(issue))
    .filter(Boolean);
}

function parseIssueSource(issue) {
  const urlMatch = issue.body?.match(/https?:\/\/[^\s)]+/);
  if (!urlMatch) return null;
  return {
    id: `issue-${issue.number}`,
    name: issue.title.replace(/^新增政策来源[:：]\s*/, ""),
    level: inferLevel(issue.body || ""),
    url: urlMatch[0],
    tags: inferTags(issue.body || "")
  };
}

function inferLevel(text) {
  if (text.includes("西海岸")) return "西海岸新区";
  if (text.includes("青岛")) return "青岛市";
  if (text.includes("山东")) return "山东省";
  if (text.includes("国家")) return "国家";
  return "其他";
}

function inferTags(text) {
  const tags = ["建设施工", "物业服务", "安保服务", "商业管理", "资产管理", "外贸", "商砼", "城市更新"];
  return tags.filter((tag) => text.includes(tag));
}
```

- [ ] **Step 3: Create update pipeline**

Create `policy-radar/scripts/update-policies.mjs`:

```js
import fs from "node:fs/promises";
import path from "node:path";
import { analyzePolicy, normalizePolicy } from "./analyze-policy.mjs";
import { fetchPolicyPage } from "./fetch-policies.mjs";
import { readIssueSources } from "./issue-sources.mjs";

const rootDir = new URL("..", import.meta.url).pathname;
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
      errors.push({ source: source.url, message: error.message });
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
    if (seen.has(source.url)) return false;
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
    message: error.message
  });
  process.exitCode = 1;
});
```

- [ ] **Step 4: Run update pipeline locally without API key**

Run:

```bash
node policy-radar/scripts/update-policies.mjs
```

Expected: Command completes or records source-specific fetch errors in `policy-radar/data/run-log.json`. `policy-radar/data/policies.json` remains valid JSON.

- [ ] **Step 5: Verify JSON remains parseable**

Run:

```bash
node -e "JSON.parse(require('fs').readFileSync('policy-radar/data/policies.json','utf8')); JSON.parse(require('fs').readFileSync('policy-radar/data/run-log.json','utf8')); console.log('policy data ok')"
```

Expected: `policy data ok`

- [ ] **Step 6: Commit pipeline**

Run:

```bash
git add policy-radar/scripts/fetch-policies.mjs policy-radar/scripts/issue-sources.mjs policy-radar/scripts/update-policies.mjs policy-radar/data/policies.json policy-radar/data/run-log.json
git commit -m "feat: add policy update pipeline"
```

Expected: Commit succeeds with update scripts and refreshed data.

## Task 4: Add GitHub Issue Form And Daily Workflow

**Files:**

- Create: `.github/ISSUE_TEMPLATE/policy-source.yml`
- Create: `.github/workflows/policy-radar-update.yml`

- [ ] **Step 1: Create policy source issue form**

Create `.github/ISSUE_TEMPLATE/policy-source.yml`:

```yaml
name: 新增政策来源
description: 提交一个政策网站或单条政策链接，供每日任务自动抓取分析
title: "新增政策来源："
labels: ["policy-source"]
body:
  - type: input
    id: url
    attributes:
      label: 政策网址
      description: 填写政府网站栏目地址或单条政策原文地址
      placeholder: "https://example.gov.cn/policy"
    validations:
      required: true
  - type: dropdown
    id: region
    attributes:
      label: 来源地区
      options:
        - 国家
        - 山东省
        - 青岛市
        - 西海岸新区
        - 其他
    validations:
      required: true
  - type: checkboxes
    id: business
    attributes:
      label: 相关业务
      options:
        - label: 建设施工
        - label: 物业服务
        - label: 安保服务
        - label: 商业管理
        - label: 资产管理
        - label: 外贸
        - label: 商砼
        - label: 城市更新
        - label: 社区嵌入式服务
        - label: 土地
        - label: 公共服务
  - type: textarea
    id: note
    attributes:
      label: 备注
      description: 说明这个来源为什么值得关注
```

- [ ] **Step 2: Create daily GitHub Actions workflow**

Create `.github/workflows/policy-radar-update.yml`:

```yaml
name: Update Policy Radar

on:
  schedule:
    - cron: "15 23 * * *"
  workflow_dispatch:

permissions:
  contents: write
  issues: read

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run policy update
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
        run: node policy-radar/scripts/update-policies.mjs

      - name: Commit updated policy data
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update policy radar data"
          file_pattern: "policy-radar/data/*.json"
```

The cron runs at 23:15 UTC, which is 07:15 Beijing time.

- [ ] **Step 3: Commit automation files**

Run:

```bash
git add .github/ISSUE_TEMPLATE/policy-source.yml .github/workflows/policy-radar-update.yml
git commit -m "ci: add policy radar daily update"
```

Expected: Commit succeeds with GitHub Issue form and workflow.

## Task 5: Add Deployment And Usage Documentation

**Files:**

- Modify: `policy-radar/README.md`
- Modify: root `README.md`

- [ ] **Step 1: Extend policy radar README**

Append this to `policy-radar/README.md`:

```markdown
## GitHub Pages 部署

推荐部署方式：

1. 打开 GitHub 仓库 Settings。
2. 进入 Pages。
3. Source 选择 GitHub Actions 或 Deploy from a branch。
4. 如果选择分支部署，目录选择 `/policy-radar`。
5. 保存后等待 GitHub Pages 生成访问地址。

## 每天自动更新

`.github/workflows/policy-radar-update.yml` 会每天北京时间 07:15 自动运行。

也可以在 GitHub Actions 页面手动点击 `Run workflow` 立即更新。

## 新增政策来源

1. 打开 GitHub 仓库 Issues。
2. 点击 New issue。
3. 选择“新增政策来源”。
4. 填写政策网址、来源地区、相关业务和备注。
5. 提交后保持 Issue 打开状态。

每日任务会读取带有 `policy-source` 标签的打开状态 Issue。

## 注意事项

- 自动分析只用于政策初筛。
- 是否能申报补贴，以正式申报指南和主管部门答复为准。
- 如果网站有验证码、登录限制或复杂动态加载，第一版可能无法抓取。
- DeepSeek API Key 只能配置在 GitHub Secrets 中，不要写入代码。
```

- [ ] **Step 2: Add root README pointer**

Add a short section near the root `README.md` project overview:

```markdown
## Policy Radar Static Site

This repository also contains an isolated static site experiment under `policy-radar/`.
It tracks government policy sources for a Qingdao West Coast New Area private enterprise,
refreshes data through GitHub Actions, and can use DeepSeek for policy benefit analysis.

See `policy-radar/README.md` for setup and deployment instructions.
```

- [ ] **Step 3: Verify docs mention required setup**

Run:

```bash
rg -n "DEEPSEEK_API_KEY|GitHub Pages|新增政策来源|policy-radar" policy-radar/README.md README.md
```

Expected: Output includes all four setup topics.

- [ ] **Step 4: Commit docs**

Run:

```bash
git add policy-radar/README.md README.md
git commit -m "docs: document policy radar deployment"
```

Expected: Commit succeeds with deployment and usage documentation.

## Task 6: Final Verification

**Files:**

- Verify: `policy-radar/index.html`
- Verify: `policy-radar/assets/app.js`
- Verify: `policy-radar/scripts/*.mjs`
- Verify: `.github/workflows/policy-radar-update.yml`

- [ ] **Step 1: Run unit tests**

Run:

```bash
node --test policy-radar/tests/analyze-policy.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Run update pipeline**

Run:

```bash
node policy-radar/scripts/update-policies.mjs
```

Expected: Command finishes and updates `policy-radar/data/run-log.json`. If some government sites fail, the run log records `completed_with_errors` and keeps valid JSON.

- [ ] **Step 3: Validate JSON**

Run:

```bash
node -e "for (const file of ['company-profile.json','sources.json','policies.json','run-log.json']) { JSON.parse(require('fs').readFileSync('policy-radar/data/'+file,'utf8')); } console.log('all json ok')"
```

Expected: `all json ok`

- [ ] **Step 4: Open static page**

Run:

```bash
open policy-radar/index.html
```

Expected: The site opens, policy cards render, filters work, and the detail dialog opens.

- [ ] **Step 5: Check git state**

Run:

```bash
git status --short
```

Expected: Only intentional uncommitted files are present. If data files changed during verification, either commit them intentionally or restore them only if they are verification noise.

## Self-Review Notes

- Spec coverage: The plan covers the static site, JSON data, GitHub Issue source submission, daily GitHub Actions update, DeepSeek integration, documentation, and verification.
- Scope boundary: The plan intentionally does not add login, database, WeChat push, formal申报材料 generation, or captcha bypass.
- Type consistency: Policy objects consistently use `id`, `title`, `sourceName`, `sourceUrl`, `publishDate`, `region`, `businessTags`, `matchLevel`, `hasSubsidySignal`, `summary`, `benefits`, `fitAnalysis`, `nextActions`, `riskNotes`, and `oneLineConclusion`.
- Risk handling: The update pipeline records source-level errors in `run-log.json` and falls back to rule analysis when `DEEPSEEK_API_KEY` is absent.
