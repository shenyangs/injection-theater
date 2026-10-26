import express from 'express';
const app = express(); app.use(express.json({limit:'512kb'}));
app.get('/api/health', (_req,res) => res.json({ ok: true, project: 'injection-theater' }));
app.listen(5207, '127.0.0.1', () => console.log('[injection-theater] api ready on 5207'));
