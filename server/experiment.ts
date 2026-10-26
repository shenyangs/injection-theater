import fixtures from '../fixtures/responses.json';
import {prompts, judge, type Lane, type Run, type Result} from '../shared/experiment';
export const ENDPOINT = 'https://api.openai.com/v1/chat/completions';
export async function runExperiment(mode: 'fixture' | 'live', key?: string, model = 'gpt-4o-mini', request: typeof fetch = fetch): Promise<Run> {
  if (mode === 'live' && !key) throw new Error('Live mode requires OPENAI_API_KEY. Select labelled fixture mode instead.');
  const results = await Promise.all((['naive', 'boundary'] as Lane[]).map(async lane => {
    const messages = prompts(lane);
    try {
      let output: string;
      if (mode === 'fixture') output = fixtures[lane];
      else {
        const response = await request(ENDPOINT, {method:'POST', redirect:'error', signal:AbortSignal.timeout(30000), headers:{'Content-Type':'application/json', Authorization:`Bearer ${key}`}, body:JSON.stringify({model, messages, max_tokens:500, temperature:0})});
        if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
        const data = await response.json();
        output = data.choices?.[0]?.message?.content;
        if (typeof output !== 'string' || !output.trim()) throw new Error('Provider returned no text');
      }
      return {lane, messages, output, judge:judge(output)};
    } catch (error) {
      return {lane, messages, output:'', judge:judge(''), error: error instanceof Error && /^Provider /.test(error.message) ? error.message : 'Provider request failed or timed out'};
    }
  }));
  return {id:crypto.randomUUID(), mode, model:mode === 'fixture' ? 'hand-authored simulation · no inference' : model, timestamp:new Date().toISOString(), results:results as Result[]};
}
