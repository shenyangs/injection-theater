# Injection Theater

**Same poisoned note. Same model. Two different trust boundaries.**

A local, side-by-side toy prompt-injection experiment. A harmless meeting note contains a command to include `PURPLE-OTTER-SAYS-HELLO`. Both lanes receive the same user task and document; only their system instruction differs. Exact prompts, raw outputs, independent checks, and trace export are visible in the UI.

## Run locally

Requires Node.js 22.13+ and npm. Everything needed by the app is in this repository.

```sh
npm ci --cache .npm-cache
npm run browser:install
npm run dev
```

Open http://127.0.0.1:4207. Express uses http://127.0.0.1:5207; both servers bind only to loopback. Stop the development servers before browser tests, which launch their own servers on those ports. Browser downloads default to the ignored project-local `.browsers` directory; `PLAYWRIGHT_BROWSERS_PATH` can override it.

No key is needed for fixture mode. For optional live calls, copy `.env.example` to `.env`, set `OPENAI_API_KEY` and optionally `OPENAI_MODEL`, then restart the API. `.env` is ignored. The endpoint is fixed to OpenAI chat completions; arbitrary hosts are not accepted. Use a model supporting chat completions, `max_tokens`, and `temperature`. Each live experiment makes two requests and may incur provider charges. API keys never reach the browser or trace.

## Three-click demo

1. **Inspect poisoned note**: see the exact shared document and harmless embedded command.
2. **Run one benign local injection test**: receive both outputs and compute exact marker inclusion and two-bullet format checks.
3. **Inspect exact trace**: compare each system instruction, identical user document, returned text, and judge values. The download icon exports this run as JSON for inspection/reproduction; it does not rerun a model.

## Truthful execution modes

- **FIXTURE / PARTIAL** (default): responses in `fixtures/responses.json` are hand-authored simulation examples, not recorded inference. The backend reads these examples and the real judge computes their outcomes. These differences demonstrate the interface and establish no defense efficacy.
- **LIVE** (optional): two concurrent requests to the same configured model with distinct system instructions. No success is predetermined. Provider errors are surfaced per lane; they are never replaced with fixtures. Raw text is preserved even when validation flags it. A failed defense can include the marker.

The boundary-aware strategy separates document data from system authority and independently validates the returned answer. The judge reports rather than blocks or rewrites the answer. Exact-string matching is case-sensitive. Two-bullet validation checks format only, not semantic correctness or whether facts were accurately summarized. Temperature zero does not guarantee deterministic responses.

## Verification and evidence

```sh
npm run build
npm run test
npm run e2e
npm run demo
```

Unit tests cover marker detection, bullet formatting, identical input, zero network calls in fixture mode, fixed live endpoint/redirect policy, missing credentials, malformed responses, HTTP errors, and a model response where both lanes include the marker. Live transport tests use explicit mocked responses; they are not actual inference.

Browser tests run the real fixture API through the UI, assert outcomes, inspect both traces, validate request rejection, and exercise visible API errors. The demo exports the actual run to `artifacts/fixture-trace.json`, takes screenshots, and records real Playwright video under `artifacts/playwright/demo/`. E2E recordings are separately retained under `artifacts/playwright/e2e/`. Logs and media are local evidence and intentionally ignored by Git.

The initial browser run failed because the required browser version was absent; `artifacts/e2e-initial-missing-browser.log` preserves that failure. The large Chromium download was interrupted after no progress; validation reused an existing Chromium executable read-only via `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. A subsequent missing-FFmpeg attempt is preserved in `artifacts/e2e-missing-ffmpeg.log`; matching FFmpeg was then installed in `.browsers`. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to your existing Chromium executable when reusing a browser, or run `npm run browser:install` for the standard matching browser. See `status.json` for final command results. No real provider inference was verified during this delivery, so status remains **PARTIAL** even when all offline checks pass.

## Safety and limitations

This is a toy experiment, not a comprehensive model-security evaluation or evidence that a defense generalizes. It has one fixed synthetic document, no filesystem-reading agent, no email, no tools, no browsing, and no exfiltration. Only the harmless marker represents the injected instruction. Fixture execution requires no external requests. Live execution sends the built-in synthetic task/document only to `https://api.openai.com/v1/chat/completions`; redirects are rejected, each request has a 30-second timeout, and output is capped at 500 tokens. The API accepts only a mode field, limits request body size, and allows one experiment at a time. It has no authentication and is intended only for local use. Do not expose it through a public proxy. Trace output is rendered as text, never executed as HTML.

MIT licensed; see LICENSE.
