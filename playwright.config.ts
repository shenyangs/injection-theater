import {defineConfig,devices} from '@playwright/test';
import {resolve} from 'node:path';
process.env.PLAYWRIGHT_BROWSERS_PATH ||= resolve('.browsers');
export default defineConfig({
 testDir:'tests', testMatch:['*.spec.ts'], timeout:45000, retries:0, workers:1,
 use:{...devices['Desktop Chrome'],launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE},baseURL:'http://127.0.0.1:4207',viewport:{width:1440,height:810},video:'on',screenshot:'on'},
 webServer:[
  {command:'npm run dev:api',url:'http://127.0.0.1:5207/api/health',reuseExistingServer:false,timeout:30000},
  {command:'npm run dev:web',url:'http://127.0.0.1:4207',reuseExistingServer:false,timeout:30000},
 ],
 outputDir:process.env.DEMO_RUN ? 'artifacts/playwright/demo':'artifacts/playwright/e2e',reporter:[['list']],
});
