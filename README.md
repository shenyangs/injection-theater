# Injection Theater · 提示词注入实验剧场

**同一份含注入指令的笔记，同一模型，两种信任边界。**

这是可独立运行的本地实验：左右两栏使用相同文档和用户任务，只改变系统提示词。你可以查看中文结果、完整提示词、原始输出、独立判定和导出的 JSON 轨迹。默认无需密钥，使用明确标注的人工样例；没有真实模型推理时，状态始终为 **部分完成（PARTIAL）**。

## 环境与首次安装

需要 **Node.js 22.13 或更新版本及随附的 npm**。支持 Node 脚本的 Windows、macOS、Linux；本次实际验证环境为 Node.js 26.4.0 / macOS，最低支持版本及其他系统未实机验证。Linux 浏览器还可能需要操作系统图形运行库，脚本不会安装系统包或修改系统设置。

进入本项目目录后，推荐执行：

```sh
npm run setup
npm run doctor
npm run dev
```

`setup` 会依次执行锁文件安装（`npm ci --cache .npm-cache`）和浏览器准备。等价的分步操作：

```sh
npm ci --cache .npm-cache
npm run browser:install
npm run doctor
npm run dev
```

依赖写入 `node_modules`，npm 缓存写入 `.npm-cache`，测试浏览器和 FFmpeg 默认写入 `.browsers`，均不入 Git。脚本使用 Node 跨平台启动子进程，不依赖 Bash。普通网页演示不依赖自动化浏览器，网络受限时完成 `npm ci` 后即可 `npm run dev`，稍后再装浏览器以运行 E2E 和录屏。

启动后打开 **http://127.0.0.1:4207**（也可使用 http://localhost:4207，但建议前者避免 IPv6 差异）。本地 API：http://127.0.0.1:5207；健康检查：http://127.0.0.1:5207/api/health。两个服务均仅监听 `127.0.0.1`。终端会用中文提示访问入口。

### 主要依赖及作用

所有直接依赖固定版本，完整传递依赖由 `package-lock.json` 锁定，请用 `npm ci` 复现。

| 依赖 | 用途 |
| --- | --- |
| React、React DOM | 中文交互界面及状态渲染 |
| Express | 本地实验 API、输入限制和错误响应 |
| lucide-react | 按钮与品牌图标 |
| TypeScript、类型声明包 | 编译期类型检查 |
| Vite、React 插件 | 本地网页开发和生产构建 |
| tsx、concurrently | 运行 TypeScript API，并同时启动网页/API |
| Vitest | 判定器、网络边界和失败处理的单元测试 |
| Playwright、Chromium、FFmpeg | 实际浏览器操作、截图和录屏 |

真实模型调用使用 Node 内置 `fetch`，不需要额外模型 SDK。

## 三步演示（零密钥）

1. 点击 **查看含注入指令的笔记**，阅读中文会议记录及保留原文的无害注入句。
2. 保持 **样例模拟（FIXTURE）· 无模型推理**，点击 **运行一次无害注入实验**，比较两栏原始文本与判定。
3. 点击 **查看完整轨迹**，核对相同输入、不同系统提示词和输出；下载按钮可保存 JSON 供复查。

页面提供首次三步引导、键盘可见焦点、小屏单列布局、运行状态和失败重试提示。所有按钮可通过 Tab/Enter 操作。忙碌时不能重复提交或切换模式。

## 样例与真实调用的边界

**样例模拟**：`fixtures/responses.json` 是人工编写的中文输出，不是预录模型响应。后端真实读取样例，真实判定器计算精确标记及两条要点格式。左右差异不能证明防御有效。

**真实调用（LIVE）**：可选。复制 `.env.example` 为 `.env`，配置 `OPENAI_API_KEY`，可设置 `OPENAI_MODEL`（默认 `gpt-4o-mini`），重启服务再切换模式。需要支持 chat completions、`max_tokens` 和 `temperature` 的模型。每次实验会调用同一模型两次，可能产生费用。没有密钥不会阻塞默认演示，doctor 也不会要求密钥。

`.env` 不入 Git。密钥只在服务端使用，不进入页面或轨迹。端点固定为 `https://api.openai.com/v1/chat/completions`。真实调用失败会显示中文错误，不会偷偷改用样例。验证不会改写模型原文，防御路径也可能包含标记。温度为零仍不保证确定性。

## 常见问题与恢复

- **缺少依赖**：运行 `npm ci --cache .npm-cache`。`npm run doctor` 即使依赖目录不存在也会给出中文修复说明。
- **4207/5207 端口被占用**：停止本项目旧终端里的开发服务（Ctrl+C），再运行 doctor。不要改端口；测试会启动自己的服务，所以执行 E2E/demo 前先停止开发服务。doctor 不会终止进程。
- **页面连接失败**：确认 `npm run dev` 仍在运行，使用 `127.0.0.1` 地址，检查 API 健康地址后刷新。
- **浏览器下载慢/失败**：检查网络后重试 `npm run browser:install`，可复用已安装组件。已有 Chromium 可用下列变量指定；此时安装脚本仅检查/安装 FFmpeg，不下载大浏览器。
- **真实模型报错**：检查自己配置的密钥、网络、余额和模型兼容性；也可切回样例模式。日志和界面不会输出密钥。

复用已有浏览器时设置环境变量（把示例换成真实可执行文件路径）：

macOS/Linux：

```sh
export PLAYWRIGHT_CHROMIUM_EXECUTABLE="/path/to/chromium"
npm run browser:install
npm run doctor
npm run e2e
```

Windows PowerShell：

```powershell
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE="C:\path\to\chrome.exe"
npm run browser:install
npm run doctor
npm run e2e
```

Windows cmd 使用 `set "PLAYWRIGHT_CHROMIUM_EXECUTABLE=C:\path\to\chrome.exe"`。取消变量：macOS/Linux 用 `unset PLAYWRIGHT_CHROMIUM_EXECUTABLE`，PowerShell 用 `Remove-Item Env:PLAYWRIGHT_CHROMIUM_EXECUTABLE`，cmd 用 `set PLAYWRIGHT_CHROMIUM_EXECUTABLE=`。只有明确需要共享已有 Playwright 缓存时才设置 `PLAYWRIGHT_BROWSERS_PATH`；否则保持默认项目目录。

## 真实验证与证据

```sh
npm run build
npm run test
npm run e2e
npm run demo
```

测试保留原有标记检测、两条要点检查、同文档输入、样例零网络、真实模式固定端点/禁止重定向、缺密钥、错误/空响应和“防御也失败”的反例。中文 E2E 走真实本地 API，检查两栏结果与轨迹，额外验证小屏和键盘、运行禁用和恢复、中文错误。单元测试中的模型传输是显式 mock，不能算真实推理。

本次验证会更新 `status.json`。本地证据：`artifacts/build.log`、`test.log`、`e2e.log`、`demo.log`、`doctor.log`、`doctor-missing-deps.log`；中文截图 `artifacts/experiment-results.png`、`mobile-zh.png`；导出轨迹 `artifacts/fixture-trace.json`；真实录像分别位于 `artifacts/playwright/e2e/` 和 `artifacts/playwright/demo/`。这些文件不提交 Git。

初版浏览器缺失、FFmpeg 缺失的失败日志仍保留。中文首轮因按钮展开后改名导致测试定位失败（`artifacts/e2e-zh-first-attempt.log`），修正定位后 6 项通过，原有行为断言保留。中文版本复验复用了现有 Chromium 和项目内 FFmpeg，没有重复下载大型浏览器。**全新机器完整下载、Windows/Linux 实机运行和真实模型推理均未验证**。本次在现有环境运行 setup，不能替代全新安装验证。状态保持 PARTIAL，不把样例差异宣称为安全结论。

## 限制与安全范围

只有一份固定合成文档、一个无害标记。没有文件读取代理、邮件、外部网页、工具执行或数据外传。标记检测区分大小写；两条要点只验证格式，不评估事实准确性。真实调用只发送内置合成文档，每次超时 30 秒、输出最多 500 token，禁止重定向。API 只接受 mode 字段，限制请求大小，同一时间仅运行一个实验。轨迹是原始文本导出，不支持导入或确定性重放。

本地应用无账号或鉴权，不应暴露到公网。输出按文本渲染，不作为 HTML 执行。这是简化实验，不是完整模型安全评估。

采用 MIT 许可证，法律原文见 LICENSE。
