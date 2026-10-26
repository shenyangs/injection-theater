import {spawnSync} from 'node:child_process';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
process.chdir(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
if(process.argv.includes('--help')){console.log('用法：npm run setup。按锁文件安装项目依赖并安装测试浏览器；设置 PLAYWRIGHT_CHROMIUM_EXECUTABLE 可复用已有浏览器。只写项目依赖/缓存目录，不修改系统设置。');process.exit(0);}
const [major,minor]=process.versions.node.split('.').map(Number);
if(major<22 || major===22&&minor<13){console.error('需要 Node.js 22.13 或更高版本，请升级后重试。');process.exit(1);}
const npmCli=process.env.npm_execpath;
if(!npmCli){console.error('请通过 npm run setup 执行安装。');process.exit(1);}
for(const args of [[npmCli,'ci','--cache','.npm-cache'],['scripts/install-browser.mjs']]){
 console.log(args[0]===npmCli?'正在按锁文件安装本项目依赖……':'正在准备浏览器与录屏组件……');
 const result=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});
 if(result.status!==0){console.error('安装未完成，请按上方错误修复后重试；可运行 npm run doctor 检查。');process.exit(result.status ?? 1);}
}
console.log('准备完成。运行 npm run dev，打开 http://127.0.0.1:4207；默认样例无需密钥。');
