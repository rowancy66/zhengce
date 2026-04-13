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

请通过 HTTP 服务预览，因为页面脚本会使用 `fetch` 读取 JSON 数据。

```bash
python3 -m http.server 8765
```

然后在浏览器打开：

```text
http://localhost:8765/
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

## GitHub Pages 部署

推荐部署方式：

1. 打开 GitHub 仓库 Settings。
2. 进入 Pages。
3. Source 选择 GitHub Actions 或 Deploy from a branch。
4. 如果选择分支部署，目录选择仓库根目录 `/`。
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
