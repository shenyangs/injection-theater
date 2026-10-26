import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {isSupportedNode,NODE_RANGE} from '../scripts/node-version.mjs';
it.each(['22.12.0','22.13.0','22.99.0','24.0.0','24.15.0','26.0.0','26.4.0','27.0.0'])('支持稳定版本 %s',version=>expect(isSupportedNode(version)).toBe(true));
it.each(['20.19.0','21.9.0','22.11.9','23.0.0','23.99.0','25.0.0','25.99.0','26.0.0-rc.1','invalid',''])('拒绝不支持的版本 %s',version=>expect(isSupportedNode(version)).toBe(false));
it('包声明与锁文件共用同一支持范围',()=>{
 const pkg=JSON.parse(readFileSync('package.json','utf8'));
 const lock=JSON.parse(readFileSync('package-lock.json','utf8'));
 expect(pkg.engines.node).toBe(NODE_RANGE);expect(lock.packages[''].engines.node).toBe(NODE_RANGE);
});
it.each(['23.0.0','25.0.0'])('setup/doctor 实际入口拒绝 %s',version=>{
 for(const script of ['setup','doctor']){
  const result=spawnSync(process.execPath,['--input-type=module','-e',`Object.defineProperty(process.versions,'node',{value:${JSON.stringify(version)}});process.argv.push('--deps-dir','artifacts/nonexistent-dependency-directory');await import('./scripts/${script}.mjs');`],{encoding:'utf8'});
  expect(result.status).toBe(1);expect(result.stdout+result.stderr).toContain('不支持 23.x、25.x');
  expect(result.stdout).not.toContain('正在按锁文件安装');
 }
});
