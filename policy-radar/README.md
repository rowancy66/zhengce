# 政策雷达静态网站

这是一个面向青岛西海岸新区综合型民营企业的政策分析静态站骨架。

当前只完成了 Task 1 的内容：

- 静态页面壳子。
- 初始数据文件。
- 前端读取和展示初始数据的最小逻辑。

后续计划会在之后的任务中逐步加入，但目前尚未实现：

- 每日自动更新。
- DeepSeek 企业适配分析。
- GitHub Issue 表单新增政策来源。

## 本地预览

请通过 HTTP 服务预览，因为页面脚本会使用 `fetch` 读取 JSON 数据：

```bash
cd policy-radar && python3 -m http.server 8765
```

然后在浏览器打开：

```text
http://localhost:8765/
```

## 数据文件

- `data/policies.json`：初始政策列表和示例分析结果。
- `data/sources.json`：初始政策来源配置。
- `data/company-profile.json`：公司画像。
- `data/run-log.json`：初始运行状态。

## 说明

当前版本只是静态骨架和初始数据，方便后续任务继续接入自动抓取、分析和更新流程。
