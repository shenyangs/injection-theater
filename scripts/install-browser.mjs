import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
const cli=resolve('node_modules/playwright/cli.js');
if(!existsSync(cli)){console.error('缺少 Playwright 项目依赖，请先运行 npm ci --cache .npm-cache。');process.exit(1);}
const external=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
if(external&&!existsSync(external)){console.error('PLAYWRIGHT_CHROMIUM_EXECUTABLE 指向的浏览器不存在，请修正路径或取消该变量。');process.exit(1);}
console.log(external?'复用已有 Chromium，仅检查或安装录屏用 FFmpeg。':'检查或安装项目内 Chromium 与 FFmpeg，不修改系统设置。');
const result=spawnSync(process.execPath,[cli,'install',external?'ffmpeg':'chromium'],{stdio:'inherit',env:{...process.env,PLAYWRIGHT_BROWSERS_PATH:process.env.PLAYWRIGHT_BROWSERS_PATH || resolve('.browsers')}});
if(result.status!==0)console.error('浏览器安装失败，请检查网络后重试 npm run browser:install。');
process.exit(result.status ?? 1);
