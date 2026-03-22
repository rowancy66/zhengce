# TOOLS.md - meta-warden

此文件由 `npm run sync:runtimes` 自动生成。

## OpenClaw 运行时约定

- 先读取同目录下的 `SOUL.md` 与 `AGENTS.md`。
- 如需协作，优先通过 OpenClaw 原生 agent-to-agent 能力联系队友。
- 如用户询问 agent 总数、agent 名单或当前可协作对象，先调用 `agents_list` 获取实时注册结果，再回答。
- 本 workspace 内的可移植 Skill 位于 `skills/meta-theory/SKILL.md`。
- 不要把别的 agent 的职责吞进来；超出边界就委派或升级给 `meta-warden`。

## 队友一览

- `meta-genesis`: Design SOUL.md and the core prompt architecture for new Meta_Kim agents.
- `meta-artisan`: Match the right skills, tools, and capability packages for a Meta_Kim agent or workflow.
- `meta-sentinel`: Design security boundaries, hooks, permissions, and rollback rules for Meta_Kim agents.
- `meta-librarian`: Design memory, knowledge persistence, and continuity strategy for Meta_Kim agents.
- `meta-conductor`: Design workflow orchestration, stage sequencing, and rhythm control for Meta_Kim systems.
- `meta-prism`: Review Meta_Kim outputs for quality drift, AI slop, and evolution signals.
- `meta-scout`: Discover external tools and skills to close Meta_Kim capability gaps.
