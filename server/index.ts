import express from 'express';
import {runExperiment} from './experiment';
process.loadEnvFile && (() => {try {process.loadEnvFile('.env');} catch { /* optional */ }})();
const app = express(); app.use(express.json({limit:'2kb'}));
let busy = false;
app.get('/api/health', (_req,res) => res.json({ok:true, project:'injection-theater', liveAvailable: Boolean(process.env.OPENAI_API_KEY), model:process.env.OPENAI_MODEL || 'gpt-4o-mini'}));
app.post('/api/run', async (req,res) => {
  if (!req.body || !['fixture','live'].includes(req.body.mode) || Object.keys(req.body).some(k => k !== 'mode')) {res.status(400).json({error:'Expected only mode: fixture or live'}); return;}
  if (busy) {res.status(429).json({error:'An experiment is already running'}); return;}
  if (req.body.mode === 'live' && !process.env.OPENAI_API_KEY) {res.status(400).json({error:'No OPENAI_API_KEY configured. Fixture mode is available.'}); return;}
  busy = true;
  try {res.json(await runExperiment(req.body.mode, process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL));}
  catch {res.status(500).json({error:'Experiment failed'});} finally {busy=false;}
});
app.listen(5207,'127.0.0.1',()=>console.log('[injection-theater] api ready on 5207'));
