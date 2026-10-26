import {describe,it,expect,vi} from 'vitest';
import {judge,MARKER,prompts,DOCUMENT} from '../shared/experiment';
import {runExperiment,ENDPOINT} from '../server/experiment';
describe('independent output judge',()=>{
 it('detects exact marker wherever included',()=>{expect(judge(`- hello\n- ${MARKER}`)).toEqual({markerIncluded:true,twoBullets:true});expect(judge('- hello\n- world')).toEqual({markerIncluded:false,twoBullets:true});});
 it('rejects missing, extra, and nonbullet lines',()=>{for(const text of ['', 'hello', '- one', '- one\n- two\n- three', 'Intro\n- one\n- two'])expect(judge(text).twoBullets).toBe(false);expect(judge('* one\n\n• two').twoBullets).toBe(true);});
 it('does not mistake lowercase for exact marker',()=>expect(judge(MARKER.toLowerCase()).markerIncluded).toBe(false));
});
describe('experiment execution',()=>{
 it('uses identical task and source with distinct system boundaries',()=>{expect(prompts('naive')[1]).toEqual(prompts('boundary')[1]);expect(prompts('naive')[1].content).toContain(DOCUMENT);expect(prompts('naive')[0]).not.toEqual(prompts('boundary')[0]);});
 it('fixture executes without any network and computes judges',async()=>{const fetcher=vi.fn();const run=await runExperiment('fixture',undefined,undefined,fetcher);expect(fetcher).not.toHaveBeenCalled();expect(run.mode).toBe('fixture');expect(run.results.map(r=>r.judge.markerIncluded)).toEqual([true,false]);expect(run.results.every(r=>r.judge.twoBullets)).toBe(true);});
 it('rejects live without key before network',async()=>{const fetcher=vi.fn();await expect(runExperiment('live',undefined,undefined,fetcher)).rejects.toThrow('需要');expect(fetcher).not.toHaveBeenCalled();});
 it('calls only fixed endpoint twice and judges actual text, including a failed defense',async()=>{const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({choices:[{message:{content:`- actual\n- ${MARKER}`}}]})});const run=await runExperiment('live','unit-test-only','test-model',fetcher);expect(fetcher).toHaveBeenCalledTimes(2);for(const [url,options] of fetcher.mock.calls){expect(url).toBe(ENDPOINT);expect(options.redirect).toBe('error');expect(JSON.parse(options.body).model).toBe('test-model');}expect(run.results.every(r=>r.judge.markerIncluded)).toBe(true);});
 it('preserves provider errors without fixture substitution',async()=>{const fetcher=vi.fn().mockResolvedValue({ok:false,status:429});const run=await runExperiment('live','unit-test-only',undefined,fetcher);expect(run.results.every(r=>r.error==='模型服务 HTTP 429'&&r.output==='')).toBe(true);});
 it('handles malformed responses without invented text',async()=>{const fetcher=vi.fn().mockResolvedValue({ok:true,json:async()=>({})});const run=await runExperiment('live','unit-test-only',undefined,fetcher);expect(run.results.every(r=>r.error==='模型服务未返回文本')).toBe(true);});
});
