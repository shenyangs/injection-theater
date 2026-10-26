import {existsSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import net from 'node:net';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dependencyIndex=process.argv.indexOf('--deps-dir');
const deps=dependencyIndex>=0?resolve(process.argv[dependencyIndex+1] || '__missing_dependencies__'):resolve(root,'node_modules');
let failures=0;
function check(ok,label,help=''){console.log(`${ok?'[通过]':'[需处理]'} ${label}${ok?'':`。${help}`}`);if(!ok)failures++;}
const [major,minor]=process.versions.node.split('.').map(Number);
check(major>22 || major===22&&minor>=13,`Node.js ${process.versions.node}`,'请安装 Node.js 22.13 或更高版本');
const pkg=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));
const missing=Object.keys({...pkg.dependencies,...pkg.devDependencies}).filter(name=>!existsSync(resolve(deps,name,'package.json')));
check(!missing.length,missing.length?`缺少项目依赖：${missing.join('、')}`:'项目依赖齐全','在项目目录运行 npm ci --cache .npm-cache，或 npm run setup');
if(!missing.length){
 try{
  process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve(root,'.browsers');
  const {chromium}=await import('playwright');
  const executable=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || chromium.executablePath();
  check(existsSync(executable),'Chromium 浏览器可用','运行 npm run browser:install；已有浏览器可设置 PLAYWRIGHT_CHROMIUM_EXECUTABLE');
  const catalog=JSON.parse(readFileSync(resolve(deps,'playwright-core/browsers.json'),'utf8'));
  const revision=catalog.browsers.find(b=>b.name==='ffmpeg').revision;
  const file=process.platform==='win32'?'ffmpeg-win64.exe':process.platform==='darwin'?'ffmpeg-mac':'ffmpeg-linux';
  check(existsSync(resolve(process.env.PLAYWRIGHT_BROWSERS_PATH,`ffmpeg-${revision}`,file)),'录屏依赖 FFmpeg 可用','运行 npm run browser:install（已有 Chromium 时只安装 FFmpeg）');
 }catch{check(false,'无法检查浏览器依赖','运行 npm ci --cache .npm-cache 后重试');}
}else console.log('[跳过] 先补齐依赖，再检查浏览器与录屏组件；网页样例演示本身不需要自动化浏览器。');
for(const port of [4207,5207]){
 const available=await new Promise(resolveResult=>{const server=net.createServer();server.once('error',()=>resolveResult(false));server.listen(port,'127.0.0.1',()=>server.close(()=>resolveResult(true)));});
 check(available,`${port} 端口${available?'空闲':'已占用或无法绑定'}`,'关闭占用端口的旧实例；本工具不会停止任何进程');
}
console.log('默认样例模拟无需 API 密钥。启动：npm run dev；访问：http://127.0.0.1:4207');
console.log(failures?`诊断结束：${failures} 项需要处理。`:'诊断完成，可以启动和验证项目。');
process.exitCode=failures?1:0;
