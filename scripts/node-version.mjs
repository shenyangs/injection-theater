// 与 Vitest 5 的 Node 支持范围一致；setup/doctor 共用判断，避免漂移。
export const NODE_RANGE = '^22.12.0 || ^24.0.0 || >=26.0.0';
export const NODE_REQUIREMENT = '请使用 Node.js 22.12+（22.x）、24.x 或 26.0+ 稳定版；不支持 23.x、25.x 或预发布版。';
export function isSupportedNode(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) return false;
  const [major, minor] = version.split('.').map(Number);
  return (major === 22 && minor >= 12) || major === 24 || major >= 26;
}
