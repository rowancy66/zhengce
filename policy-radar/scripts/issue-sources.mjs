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
  return issues.map((issue) => parseIssueSource(issue)).filter(Boolean);
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
