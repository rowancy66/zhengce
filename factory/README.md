# Meta_Kim Foundry Release

This directory is the public release layer for Meta_Kim's industry expansion.

It now exposes only the publishable outputs:

- a human-readable **agent library**
- a polished **20-agent flagship bundle**
- runtime-ready import packs for **Claude Code**, **Codex**, and **OpenClaw**

The old build-stage folders have been removed from the open-source surface.

## What Is Here

```text
factory/
├─ agent-library/
│  ├─ departments/<industry>/<department>.md
│  ├─ specialists/<industry>/<department>/<specialist>.md
│  └─ agent-index.json
├─ flagship-20/
│  └─ <industry>.md
├─ flagship-complete/
│  ├─ README.md
│  ├─ README.zh-CN.md
│  ├─ summary.json
│  ├─ agents/*.md
│  └─ runtime-packs/<runtime>/*
├─ runtime-packs/
│  ├─ README.md
│  ├─ README.zh-CN.md
│  ├─ summary.json
│  ├─ claude/agents/*.md
│  ├─ codex/agents/*.toml
│  └─ openclaw/workspaces/<agent-id>/*
├─ industry-coverage-matrix.md
├─ flagship-20.md
├─ flagship-20.json
├─ organization-map.json
├─ department-call-protocol.json
├─ orchestration-playbooks.md
└─ README.md
```

## Counts

- 20 industries
- 5 departments per industry
- 100 department agents
- 1000 specialist agents
- 1100 total foundry agents
- 20 hand-polished flagship agents

## How To Read It

If you want the full human-readable library:

- start with `industry-coverage-matrix.md`
- then inspect `agent-library/`

If you only want the strongest curated layer:

- open `flagship-20.md`
- then open `flagship-complete/agents/`

If you want machine import surfaces:

- open `runtime-packs/`

## Directory Roles

### `agent-library/`

This is the complete human-readable release library.

It contains:

- 100 department agent briefs
- 1000 specialist agent briefs
- the machine-readable `agent-index.json`

### `flagship-20/` and `flagship-20.md`

These identify the first 20 most important industry leaders inside the broader library.

They are the shortlist used to define the flagship layer.

### `flagship-complete/`

This is the polished 20-agent bundle.

Use it when:

- you do not want to inspect all 1100 agents
- you want the most curated examples first
- you want the polished Claude/Codex/OpenClaw packs for the flagship layer

### `runtime-packs/`

This is the machine-facing distribution surface.

It contains the full 1100-agent runtime projection for:

- Claude Code
- Codex
- OpenClaw

### `organization-map.json`

Maps the industry -> department -> specialist structure.

### `department-call-protocol.json`

Defines default routing and handoff rules between departments.

### `orchestration-playbooks.md`

Provides default cross-department operating flows.

## What Changed

This public release intentionally removed the old build-stage layout:

- no `generated/`
- no `catalog/`
- no `flagship-batch-*`

Those were internal production layers.  
This directory now shows only the release-ready outputs.
