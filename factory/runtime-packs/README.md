# Meta_Kim Foundry Runtime Packs

This directory is the machine-facing release surface for the full foundry library.

## Counts

- 100 department runtime agents
- 1000 specialist runtime agents
- 1100 total runtime agents

## Layout

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

## Source Inputs

These packs are published from the release-layer foundry assets:

- `factory/agent-library/departments/**`
- `factory/agent-library/specialists/**`
- `factory/department-call-protocol.json`
- `factory/orchestration-playbooks.md`
- `factory/organization-map.json`

They are not the canonical meta-agent source.  
They are the runtime projections of the foundry release library.
