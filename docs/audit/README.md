# Portfolio audit — 18 October 2026

This branch addresses M01–M22 against the original main commit `61eca9088f8eb238a68760ae67c839b55fbad3db`. It is a review checkpoint, not a deployed release or a claim of defect-free software. See the draft PR and its latest Actions checks for the exact tested head.

## Reproduce

Use Node 24. Run `npm ci`, `npm test`, `npm run format:check`, `npm run lint`, `npm run build`, `npx playwright install --with-deps chromium firefox webkit`, then `npm run test:browser`, `npm run test:audit`, `npm run test:a11y`, and `npm run test:metadata`. Set `AUDIT_BROWSER=firefox` or `AUDIT_BROWSER=webkit` to repeat browser suites. On PowerShell set `$env:AUDIT_BROWSER="firefox"` first. CI runs Chromium on actual Windows and Linux, plus Firefox/WebKit on Linux. `.gitattributes` keeps checked-out text LF on Windows.

The tests generate synthetic screenshots and JSON under `docs/audit/`; Actions uploads them as artifacts. Baseline failures, before/after screenshots, exact runtimes and the Russian cross-project register are in the accompanying QA handoff. Fuzz uses seed `0x20261018`, 400 cases and bounded reduction on failure; it is not exhaustive fuzzing.

## Traceability

Status refers to the scoped finding, not universal coverage. See [decisions](../decisions.md) for compatibility and intentional limits.

| Finding                                                                    | Disposition           | Regression entry point                                                                                                           |
| -------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| M01 — CSV column selection (P2)                                            | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs); [audit-fuzz.test.mjs](../../tests/audit-fuzz.test.mjs)         |
| M02 — quadratic CSV duplicate-header detection (P2)                        | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs)                                                                 |
| M03 — quadratic HTML token search (P2)                                     | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs); [audit-fuzz.test.mjs](../../tests/audit-fuzz.test.mjs)         |
| M04 — JSON-LD `@context` falsely treated as Product (P2 accuracy)          | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs); [audit-fuzz.test.mjs](../../tests/audit-fuzz.test.mjs)         |
| M05 — HTML attribute character references (P3)                             | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs); [browser-smoke.mjs](../../tests/browser-smoke.mjs)             |
| M06 — deep JSON recursion (P3)                                             | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs)                                                                 |
| M07 — many malformed blocks → alert amplification (P2–P3 candidate)        | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs); [audit.browser.mjs](../../tests/audit.browser.mjs)             |
| M08 — CSV result table scales to ~10k Issue groups (P2–P3)                 | confirmed-fixed       | [audit.browser.mjs](../../tests/audit.browser.mjs)                                                                               |
| M09 — not enough actionable product examples (P2–P3 UX)                    | optional enhancement  | [audit.browser.mjs](../../tests/audit.browser.mjs)                                                                               |
| M10 — file read/sample race (P2–P3)                                        | confirmed-fixed       | [audit.browser.mjs](../../tests/audit.browser.mjs); [browser-smoke.mjs](../../tests/browser-smoke.mjs)                           |
| M11 — encoding warning (P3 scoped)                                         | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs); [csvAnalysis.test.mjs](../../tests/csvAnalysis.test.mjs)       |
| M12 — CSV whitespace/blank lines (P3)                                      | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs); [csvAnalysis.test.mjs](../../tests/csvAnalysis.test.mjs)       |
| M13 — focus after clearing result (P3)                                     | confirmed-fixed       | [audit.browser.mjs](../../tests/audit.browser.mjs); [browser-smoke.mjs](../../tests/browser-smoke.mjs)                           |
| M14 — sample overwrites ongoing user input (P3 optional UX)                | intentional           | [browser-smoke.mjs](../../tests/browser-smoke.mjs)                                                                               |
| M15 — first Product/Offer, grouping and canonical are intentionally narrow | documented limitation | [schemaAnalysis.test.mjs](../../tests/schemaAnalysis.test.mjs); [browser-smoke.mjs](../../tests/browser-smoke.mjs)               |
| M16 — price/currency provenance (P3 communication)                         | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs); [audit-fuzz.test.mjs](../../tests/audit-fuzz.test.mjs)         |
| M17 — many Issue variants (P3 design)                                      | intentional           | [csvAnalysis.test.mjs](../../tests/csvAnalysis.test.mjs); [browser-smoke.mjs](../../tests/browser-smoke.mjs)                     |
| M18 — rare HTML cases (P3 scoped)                                          | confirmed-fixed       | [audit-analyzers.test.mjs](../../tests/audit-analyzers.test.mjs); [schemaAnalysis.test.mjs](../../tests/schemaAnalysis.test.mjs) |
| M19 — external Google references and user state (P3)                       | confirmed-fixed       | [audit.browser.mjs](../../tests/audit.browser.mjs); [browser-smoke.mjs](../../tests/browser-smoke.mjs)                           |
| M20 — SEO/social cards (P3 portfolio impact)                               | confirmed-fixed       | [static-metadata.mjs](../../tests/static-metadata.mjs); [browser-smoke.mjs](../../tests/browser-smoke.mjs)                       |
| M21 — static guide/report/privacy quality                                  | not reproduced        | [browser-smoke.mjs](../../tests/browser-smoke.mjs); [static-metadata.mjs](../../tests/static-metadata.mjs)                       |
| M22 — full engine invariants                                               | not reproduced        | [browser-smoke.mjs](../../tests/browser-smoke.mjs); [audit.browser.mjs](../../tests/audit.browser.mjs)                           |

## Performance and accessibility evidence

Production-build Chromium 153.0.8010.0, Linux, Node 24.19.0; seven fresh-context samples per condition, including CDP 4× CPU throttling. Timing includes driver interaction and two animation frames. p95 is nearest-rank and therefore the maximum of seven samples: exploratory, not a stable service-level estimate.

For 10,000 unique issue groups, baseline → changed median: **862 → 217 ms** (normal CPU), **3,835 → 832 ms** (4× CPU); 10,000 → 50 visible rows. For 20,000 malformed JSON-LD blocks: **812 → 391 ms**, and **3,370 → 1,672 ms** with 4× CPU; 20,000 → 11 alert paragraphs. Output remains bounded, but large parsing can still occupy the main thread on slow devices. Do not advertise all legal inputs as sub-second. Exact 2,000,000-byte CSV and byte-limit+1 browser tests supplement these fixtures.

Axe scans nine key states, keyboard journeys and nine viewport widths supplement existing review tests. CSS `zoom:2/4` captures are observations, **not native browser-zoom certification**; CSS zoom does not adjust media-query viewport like native zoom and can produce horizontal overflow. The 320/640 CSS-pixel viewport checks provide reflow evidence. Axe `incomplete` contrast items remain human-review tasks; zero automated violations is not WCAG certification.

## Limits and release gate

- No real NVDA/VoiceOver/TalkBack, iOS Safari or physical Android test was available. Run those manually before making an accessibility certification claim.
- Native OS clipboard integration is exercised in Chromium; Firefox/WebKit use an explicitly labelled clipboard double plus failure feedback. Firefox mobile coverage is a narrow touch viewport, not unsupported `isMobile` emulation.
- Live demo smoke covers the already published baseline only. No merge or production deployment is authorized by this audit.
- This remains a bounded CSV/HTML/JSON-LD checker, not live Google validation, an HTML5 parser or a full context/graph resolver. Inputs stay local; no product URLs are fetched.
- Additional review caught unbounded Status groups (N01) and inherited-property entity lookup introduced during the first fix (N02); both have targeted regressions.
- Static metadata/social image source is tested. Post-deployment Cloudflare direct routes/404 and external social crawler caches still require an approved hosted check. Vite preview is not Cloudflare.
- No runtime dependency or data migration is added. Axe is development-only. Rollback should restore metadata generation and `_redirects` together; no user analysis data is migrated.
