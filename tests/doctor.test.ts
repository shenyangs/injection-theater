import {it,expect} from 'vitest';
import {spawnSync} from 'node:child_process';
it('缺少依赖时中文诊断可运行，不要求密钥或抛出模块堆栈',()=>{
 const result=spawnSync(process.execPath,['scripts/doctor.mjs','--deps-dir','artifacts/nonexistent-dependency-directory'],{encoding:'utf8',env:{...process.env,OPENAI_API_KEY:''}});
 expect(result.status).toBe(1);expect(result.stdout).toContain('缺少项目依赖');expect(result.stdout).toContain('npm ci --cache .npm-cache');expect(result.stdout).toContain('默认样例模拟无需 API 密钥');expect(result.stderr).not.toContain('ERR_MODULE_NOT_FOUND');
});
