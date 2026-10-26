import express from 'express';
import {runExperiment} from './experiment';
process.loadEnvFile && (() => {try {process.loadEnvFile('.env');} catch { /* optional */ }})();
const app = express(); app.use(express.json({limit:'2kb'}));
let busy = false;
app.get('/api/health', (_req,res) => res.json({ok:true, project:'injection-theater', liveAvailable: Boolean(process.env.OPENAI_API_KEY), model:process.env.OPENAI_MODEL || 'gpt-4o-mini'}));
app.post('/api/run', async (req,res) => {
  if (!req.body || !['fixture','live'].includes(req.body.mode) || Object.keys(req.body).some(k => k !== 'mode')) {res.status(400).json({error:'请求只能包含 mode 字段，取值为 fixture 或 live。'}); return;}
  if (busy) {res.status(429).json({error:'已有实验正在运行，请稍后重试。'}); return;}
  if (req.body.mode === 'live' && !process.env.OPENAI_API_KEY) {res.status(400).json({error:'尚未配置 OPENAI_API_KEY，可先使用无需密钥的样例模拟。'}); return;}
  busy = true;
  try {res.json(await runExperiment(req.body.mode, process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL));}
  catch {res.status(500).json({error:'实验执行失败，请重试。'});} finally {busy=false;}
});
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {res.status(error.status === 413 ? 413 : 400).json({error:'请求格式错误或内容过大，请使用页面重新运行。'});});
app.listen(5207,'127.0.0.1',()=>console.log('[Injection Theater] 本地服务已就绪。请打开 http://127.0.0.1:4207（网页）；API：http://127.0.0.1:5207。默认样例模拟无需密钥。')).on('error', (error: NodeJS.ErrnoException) => {console.error(error.code === 'EADDRINUSE' ? '启动失败：5207 端口已被占用，请关闭已有实例后重试。' : '本地服务启动失败，请运行 npm run doctor 检查环境。');process.exit(1);});
