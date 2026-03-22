# Meta_Kim Foundry 发布版说明

这个目录现在是 **开源发布层**，不是中间生产车间。

也就是说，你现在在这里看到的，都是对外保留的最终结果：

- 人能直接看的 **agent 库**
- 精修过的 **20 个旗舰 agent 总包**
- 给 Claude Code / Codex / OpenClaw 直接吃的 **运行时包**

旧的中间构建目录已经从发布面删除了。

## 现在有什么

```text
factory/
├─ agent-library/
│  ├─ departments/<行业>/<部门>.md
│  ├─ specialists/<行业>/<部门>/<specialist>.md
│  └─ agent-index.json
├─ flagship-20/
│  └─ <行业>.md
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
└─ README.zh-CN.md
```

## 当前规模

- 20 个行业
- 每个行业 5 个部门
- 100 个部门 agent
- 1000 个 specialist agent
- 总计 1100 个 foundry agent
- 20 个手工强化旗舰 agent

## 你最该怎么看

如果你要看完整的人类可读产物：

- 先看 `industry-coverage-matrix.md`
- 再看 `agent-library/`

如果你只想先看最强的一层：

- 先看 `flagship-20.md`
- 再看 `flagship-complete/agents/`

如果你要看机器导入面：

- 直接看 `runtime-packs/`

## 每个目录是干嘛的

### `agent-library/`

这是完整的人类可读 agent 库。

里面包含：

- 100 个部门 agent brief
- 1000 个 specialist brief
- 对应的机器索引 `agent-index.json`

### `flagship-20/` 和 `flagship-20.md`

这是从大盘里挑出来的第一批 20 个最关键行业主力。

它们决定了旗舰层的范围。

### `flagship-complete/`

这是已经打磨好的 20 个旗舰总包。

适合这些情况：

- 你不想先看 1100 个
- 你想先看最成熟的一层
- 你要直接拿 20 个旗舰的三端包去测试

### `runtime-packs/`

这是机器导入用的最终分发层。

里面放的是完整的 1100-agent 三端投影：

- Claude Code
- Codex
- OpenClaw

### `organization-map.json`

定义行业 -> 部门 -> specialist 的组织结构。

### `department-call-protocol.json`

定义部门之间默认怎么调用、怎么 handoff。

### `orchestration-playbooks.md`

定义跨部门协作时的默认编排流程。

## 这次收口删掉了什么

这个发布版已经不再暴露旧的中间层：

- 不再有 `generated/`
- 不再有 `catalog/`
- 不再有 `flagship-batch-*`

这些属于内部生产过程层。  
现在保留下来的，都是适合开源展示和交付的最终层。
