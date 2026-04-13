const state = {
  policies: [],
  runLog: null,
  dialogReturnFocus: null,
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

const DIALOG_TITLE_ID = "dialog-title";

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

function isSafeHttpUrl(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  try {
    const parsedUrl = new URL(value, window.location.href);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

function createTextParagraph(label, value) {
  const paragraph = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = `${label}：`;
  paragraph.append(strong, document.createTextNode(value || "暂无"));
  return paragraph;
}

function createBulletList(title, items, fallbackText) {
  const heading = document.createElement("h3");
  heading.textContent = title;

  const list = document.createElement("ul");
  for (const item of items && items.length ? items : [fallbackText]) {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.append(listItem);
  }

  return [heading, list];
}

function createSourceLinkSection(url) {
  const paragraph = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = "政策原文：";
  paragraph.append(strong);

  if (isSafeHttpUrl(url)) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "查看政策原文";
    paragraph.append(link);
  } else {
    const text = document.createElement("span");
    text.textContent = url ? "链接不可用" : "暂无可用链接";
    paragraph.append(text);
  }

  return paragraph;
}

function createTag(text, className) {
  const tag = document.createElement("span");
  tag.className = className ? `tag ${className}` : "tag";
  tag.textContent = text;
  return tag;
}

function renderCard(policy) {
  const article = document.createElement("article");
  article.className = "policy-card";

  const title = document.createElement("h3");
  title.textContent = policy.title || "未命名政策";

  const meta = document.createElement("div");
  meta.className = "policy-meta";

  for (const value of [policy.region || "未知地区", policy.sourceName || "未知来源", policy.publishDate || "未知日期"]) {
    const span = document.createElement("span");
    span.textContent = value;
    meta.append(span);
  }

  const tagRow = document.createElement("div");
  tagRow.className = "tag-row";
  const levelClass = policy.matchLevel ? `level-${String(policy.matchLevel).toLowerCase()}` : "";
  tagRow.append(createTag(levelLabel(policy.matchLevel), levelClass));

  if (policy.hasSubsidySignal) {
    tagRow.append(createTag("疑似补贴", "level-a"));
  }

  for (const tagText of policy.businessTags || []) {
    tagRow.append(createTag(tagText));
  }

  const summary = document.createElement("p");
  summary.textContent = policy.oneLineConclusion || policy.summary || "暂无分析结论。";

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "查看详情";
  button.addEventListener("click", () => showPolicy(policy));
  actions.append(button);

  article.append(title, meta, tagRow, summary, actions);
  return article;
}

function showPolicy(policy) {
  state.dialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  const title = document.createElement("h2");
  title.id = DIALOG_TITLE_ID;
  title.textContent = policy.title || "政策详情";

  const fragments = [
    title,
    createTextParagraph("一句话结论", policy.oneLineConclusion || "暂无结论。"),
    createTextParagraph("政策摘要", policy.summary || "暂无摘要。"),
    createTextParagraph("公司匹配", policy.fitAnalysis || "暂无匹配分析。")
  ];

  const benefitNodes = createBulletList("可能利好", policy.benefits || [], "暂无明确利好");
  const actionNodes = createBulletList("建议动作", policy.nextActions || [], "继续观察正式申报通知");
  const riskNodes = createBulletList("风险提示", policy.riskNotes || [], "请以政策原文和主管部门答复为准");

  fragments.push(...benefitNodes, ...actionNodes, ...riskNodes, createSourceLinkSection(policy.sourceUrl));
  elements.dialogContent.replaceChildren(...fragments);
  elements.dialog.showModal();
  requestAnimationFrame(() => {
    elements.dialogClose.focus();
  });
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
  elements.dialog.addEventListener("close", () => {
    if (state.dialogReturnFocus && typeof state.dialogReturnFocus.focus === "function") {
      state.dialogReturnFocus.focus();
    }
    state.dialogReturnFocus = null;
  });
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
  const message = document.createElement("p");
  message.className = "source-note";
  message.textContent = `网站数据加载失败：${error.message}`;
  document.body.prepend(message);
});
