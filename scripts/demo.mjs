import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/@playwright/test/cli.js','test','tests/demo.spec.ts'],{stdio:'inherit',env:{...process.env,DEMO_RUN:'1'}});
process.exit(result.status ?? 1);
