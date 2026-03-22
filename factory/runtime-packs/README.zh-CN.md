# Meta_Kim Foundry 运行时总包

这个目录是完整 foundry 的 **机器导入层**。

## 数量

- 100 个部门运行时 agent
- 1000 个 specialist 运行时 agent
- 总计 1100 个运行时 agent

## 目录结构

```text
factory/runtime-packs/
├─ README.md
├─ README.zh-CN.md
├─ summary.json
├─ claude/
│  ├─ manifest.json
│  └─ agents/*.md
├─ codex/
│  ├─ manifest.json
│  └─ agents/*.toml
└─ openclaw/
   ├─ manifest.json
   ├─ openclaw.template.json
   └─ workspaces/<agent-id>/*
```

## 它基于什么发布

这些运行时包来自发布层的 foundry 资产：

- `factory/agent-library/departments/**`
- `factory/agent-library/specialists/**`
- `factory/department-call-protocol.json`
- `factory/orchestration-playbooks.md`
- `factory/organization-map.json`

它们不是元 agent 主源。  
它们是 foundry 发布库投影到三端后的最终机器包。
