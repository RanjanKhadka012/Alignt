# Alignt — Engineering and Product Documentation

**Version:** 0.1.0

**Document status:** Reflects the repository as inspected on 2026-09-13

**Audience:** Engineers, technical leads, product owners, security reviewers, and deployment operators

## 1. Executive summary

Alignt is a workforce strategy and capability-planning prototype. It connects business goals to roles, skills, employee records, readiness metrics, concentration risks, development recommendations, and goal-to-team analysis.

The application combines two kinds of decision support:

- **Deterministic analytics** calculate readiness, skill concentration, retirement exposure, development candidates, and illustrative financial scenarios from workforce records.
- **AI-assisted analysis** derives capabilities and relevant roles for a business goal, benchmarks role expectations against live web sources, and proposes employee development gaps.

Alignt is currently a read-oriented prototype rather than a production HR system. Workforce data is served from checked-in JSON, strategy edits live only in React memory, and there is no authentication, authorization, audit trail, or API rate limiting. The repository includes SQLite import and read utilities, but the main workforce API is not currently connected to SQLite.

## 2. Product scope

### 2.1 Problems addressed

Alignt helps leaders answer:

1. Is the current workforce ready to deliver the stated strategy?
2. Which capabilities have too few recorded holders?
3. Is critical knowledge exposed to retirement or succession risk?
4. Which employees are candidates for targeted development?
5. Which roles and skills are relevant to a new initiative?
6. What could an internal-development versus recruitment scenario cost?

### 2.2 Current capabilities

| Capability | Implementation |
| --- | --- |
| Strategy management | Add, edit, remove, and undo short- and long-term goals in the current browser session |
| Strategy readiness | Compare goal-specific roles and qualifying skills with employee skill records |
| Workforce overview | Present goal readiness, gaps, risk level, and execution consequences |
| Skill risk map | Show holder counts, retirement exposure, backup coverage, and department impact |
| Employee directory | Browse and inspect employee records and profiles |
| Role recommendations | Search current role standards, build a sourced benchmark, and compare a selected employee |
| Goal matching | Ask an AI provider to derive exact roles and skills, then classify the workforce deterministically |
| Training planning | Sum selected training fees, learning hours, elapsed duration, and paid-time cost |
| Financial scenarios | Compare illustrative recruitment and blended development/recruitment scenarios |
| Data import tooling | Import normalized workbook rows into a local SQLite database |

### 2.3 Explicit non-goals in the current release

- Acting as a system of record for employees or skills
- Persisting strategy changes
- Writing employee or skill changes through the API
- Proving employee availability, certification validity, or staffing capacity
- Producing authoritative compensation, training-price, ROI, or hiring forecasts
- Enforcing identity, permissions, tenant isolation, or regulatory controls
- Automatically making employment decisions

## 3. Technology stack

| Layer | Technology |
| --- | --- |
| UI | React 18.2 |
| Routing | React Router 6.14 |
| Build/dev server | Vite 5 |
| API runtime | Node.js HTTP server, ECMAScript modules |
| Optional local database | Node `node:sqlite` / SQLite |
| AI providers | OpenAI, OpenRouter, Google Gemini, or Allama |
| Testing | Node's built-in test runner |
| Deployment descriptors | Vercel and Railway |

The project has no state-management, charting, ORM, schema-validation, or CSS-framework dependency. UI state is managed with React context/hooks; visualizations are implemented as React/SVG/CSS components.

## 4. System architecture

```text
Browser
  React pages and components
      |
      +-- StrategyContext (session-only goals)
      +-- WorkforceContext -- GET /api/workforce
      +-- DerivedDataContext (deterministic calculations)
      +-- RoleBenchmarkContext (in-memory AI cache)
      |
      +-- POST /api/matching ----------------------+
      +-- POST /api/recommendations/benchmark ----+--> Node API
      +-- POST /api/recommendations/compare -------+      |
                                                         +-- JSON workforce seed
                                                         +-- AI workforce snapshot
                                                         +-- selected AI provider
                                                         +-- live web search for benchmarks

Offline tooling
  normalized workbook rows -> SQLite importer -> local database
                                             -> AI snapshot generator
```

### 4.1 Runtime boundaries

The same API handler is reused in three environments:

- Vite development and preview middleware through `vite.config.js`
- A standalone Node server through `server/index.mjs`
- A Vercel function adapter through `api/index.mjs`

This keeps endpoint behavior consistent, although hosting configuration still needs to route `/api/*` correctly.

### 4.2 Provider tree

The React application is mounted in this order:

```text
StrategyProvider
  WorkforceProvider
    DerivedDataProvider
      RoleBenchmarkProvider
        BrowserRouter
          App
```

The order matters. Derived data depends on workforce and strategy state; recommendation reviews depend on both the selected employee and strategy.

## 5. Repository layout

```text
api/                     Vercel adapter
docs/                    Engineering documentation
scripts/                 Seed, enrichment, import, and snapshot utilities
server/                  API routing, data access, AI adapters, SQL schema
server/data/             Checked-in AI-safe workforce snapshot
src/components/          Reusable UI and visualization components
src/config/              Financial planning assumptions
src/contexts/            Shared React state and derived data
src/data/                JSON employees, roles, initiatives, and seed data
src/pages/               Route-level screens
src/services/            Browser API clients and training-plan logic
src/utils/               Deterministic domain calculations
tests/                   Node unit and HTTP contract tests
```

## 6. Local development

### 6.1 Prerequisites

- Node.js 20+ for the React application and JSON-backed API
- Node.js 22.13+ when using `node:sqlite` import/read tooling
- npm
- At least one supported AI provider key for matching and live recommendations

### 6.2 Install and run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. In development, Vite serves the frontend and mounts the Node API as middleware.

The non-AI pages work without provider credentials. Matching and recommendations return HTTP 503 until a provider is configured.

### 6.3 Standalone API

```bash
npm run start:api
```

Defaults:

- Host: `127.0.0.1`
- Port: `3001`
- Override port with `PORT` or `MATCHING_PORT`
- Override host with `HOST`

The standalone command serves only the API. Build and serve `dist/` separately and reverse-proxy `/api/*` to the API process.

### 6.4 Build and preview

```bash
npm run build
npm run preview
```

The current production build completes successfully. Vite emits a deprecation warning for its CJS Node API, which should be addressed during the next tooling upgrade.

### 6.5 Tests

```bash
npm test
```

The suite covers:

- API routing and Vercel request adaptation
- SQLite schema integrity and unknown-value preservation
- matching request/response validation and provider failures
- role benchmark caching and evidence validation
- Gemini request/grounding behavior
- readiness, concentration, and goal-risk calculations
- training-plan totals and validation

At inspection time, 12 of 15 tests pass. Three fail in test-loading/runtime setup: one API test cannot bind its local test server in the execution environment, and the goal-risk/readiness test loaders cannot resolve `./proficiency.js` from generated `data:` modules. Treat the test suite as not green until those harness problems are corrected.

## 7. Configuration

All secrets are server-side. Never prefix provider credentials with `VITE_`, because Vite exposes such variables to browser bundles.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | One provider required for AI | — | OpenAI Responses API credential |
| `OPENAI_MODEL` | No | `gpt-4.1-mini` | OpenAI model |
| `OPENROUTER_API_KEY` | One provider required for AI | — | OpenRouter credential |
| `OPENROUTER_MODEL` | No | `google/gemini-2.5-flash` | OpenRouter model |
| `OPENROUTER_MAX_TOKENS` | No | `2048` | Requested output limit, bounded by adapter logic |
| `OPENROUTER_FREE_MODEL` | No | `nvidia/nemotron-3-super-120b-a12b:free` | Fallback after an HTTP 402 |
| `OPENROUTER_SITE_URL` | No | — | Optional HTTP referer metadata |
| `OPENROUTER_APP_NAME` | No | `Alignt` | OpenRouter application title |
| `GEMINI_API_KEY` | One provider required for AI | — | Gemini credential |
| `GEMINI_MODEL` | No | `gemini-3.6-flash` | Gemini model |
| `ALLAMA_API_KEY` | One provider required for AI | — | Allama credential |
| `ALLAMA_MODEL` | No | `allama-base` | Allama model |
| `ALLAMA_AUTH_TYPE` | No | Bearer auth | Set `api_key` to send the key in the query string |
| `PREFERRED_AI_PROVIDER` | No | automatic | `openrouter`, `gemini`, `openai`, or `allama` |
| `DATABASE_PATH` | Tooling only today | — | SQLite path used by snapshot generation/import workflows |
| `WORKFORCE_DATA_SOURCE` | Present but inactive | `json` in example | Not currently consulted by `/api/workforce` |
| `HOST` | No | `127.0.0.1` | Standalone API bind host |
| `PORT` | No | `3001` | Standalone API port |
| `MATCHING_PORT` | No | `3001` | Legacy/fallback API port |

### 7.1 AI provider selection

`server/ai.mjs` first honors `PREFERRED_AI_PROVIDER` when its corresponding key is present. Otherwise, selection order is:

1. OpenRouter
2. Gemini
3. OpenAI
4. Allama

Role-benchmark search has a narrower path: OpenRouter or Gemini is used when preferred (or when no preference is set and its key is present); otherwise OpenAI web search is used. Allama has no search adapter, so an Allama-only configuration can reason but cannot successfully complete a live role benchmark.

## 8. Frontend routes

| Route | Page | Responsibility |
| --- | --- | --- |
| `/` | Redirect | Redirects to `/overview` |
| `/overview` | Overview | Goal-scoped readiness and execution-risk summary |
| `/strategy` | Strategy | Session-only short- and long-term goal management |
| `/risk-map` | Risk Map | Skill-holder, concentration, retirement, and department exposure |
| `/recommendations` | Recommendations | On-demand employee benchmark and training recommendations |
| `/matching` | Matching | Goal-to-capability analysis and financial scenarios |
| `/employees` | Employees | Workforce directory |
| `/employees/:employeeId` | Employee Profile | Individual skill, profile, retirement, and initiative context |
| `/initiatives/:initiativeId` | Initiative Detail | Initiative-specific readiness/development details |
| `/departments/:deptId` | Department Detail | Department employees and inherited skill risks |
| `/categories/:categoryId` | Category Detail | Category-filtered employee view |

An error boundary wraps routed page content. It displays a render error but does not currently report errors to an observability service.

## 9. State and data flow

### 9.1 Workforce state

`WorkforceContext` requests `/api/workforce` once at mount with a 15-second timeout. It validates the four top-level arrays (`employees`, `skills`, `roles`, `departments`), normalizes numeric prefixes out of display names, and exposes state setters to descendants.

Loading and failure states replace the application subtree. Retry reloads the page.

### 9.2 Strategy state

`StrategyContext` seeds goals from `src/data/initiatives.json`. Changes are held only in component memory and disappear on refresh. The Strategy page supports one-level undo for the last changed goal collection.

Each measurable goal needs:

- `relevantRoles`: exact role titles
- `qualifyingSkills`: exact skill names

Without both lists, the goal is displayed but excluded from aggregate readiness.

### 9.3 Derived state

`DerivedDataContext` recalculates memoized analytics whenever workforce or strategy inputs change. It creates:

- named employee skill records
- skill holder and retirement-risk groups
- department risk summaries
- initiative readiness results
- overall readiness
- critical talent concentration
- role documentation coverage
- basic holder-count gap scores

### 9.4 Recommendation cache

`RoleBenchmarkContext` maintains two in-memory layers:

- role benchmarks cached for seven days by normalized role and industry
- employee reviews keyed by serialized employee profile plus strategy

Concurrent benchmark requests for the same role share one promise. Failed requests are not cached. All cache state is lost on reload and is local to one browser session.

## 10. Domain calculations

### 10.1 Proficiency

Numeric proficiency uses a 1–5 scale:

| Value | Label |
| --- | --- |
| 1 | Beginner |
| 2 | Developing |
| 3 | Intermediate |
| 4 | Advanced |
| 5 | Expert |

`Intermediate+` means numeric proficiency of at least 3, or the equivalent string label.

### 10.2 Goal readiness

For a configured goal:

1. Select employees whose role is in `relevantRoles`.
2. Count an employee as qualified when at least one qualifying skill is recorded at Intermediate+.
3. Compute `qualified / relevant workforce × 100`.
4. Apply ties-to-even rounding for exact half values.

Risk thresholds:

| Readiness | Risk |
| --- | --- |
| `< 55%` | Critical |
| `55%–74%` | Watch |
| `≥ 75%` | Healthy |

Overall readiness is a relevant-workforce-weighted mean across configured goals.

Note: some current UI copy says any recorded qualifying skill counts regardless of proficiency; the calculation actually requires Intermediate+. The copy and implementation should be reconciled.

### 10.3 Skill concentration

For goal matching, Intermediate+ holders are counted company-wide:

| Holder count | Flag |
| --- | --- |
| 0–2 | Critical |
| 3–4 | Watch |
| 5+ | OK |

The general risk-map aggregation uses a different rule. A skill becomes critical when at least one holder has a retirement flag and there is no non-flagged Intermediate+ backup. It becomes watch when retirement-flagged holders represent at least 40% of holders or total holders are below three. Otherwise it is healthy.

These are policy rules embedded in code, not externally configurable thresholds.

### 10.4 Retirement status

A valid `retirementDate` flags a record and calculates days relative to today. Dates within 365 days are marked soon. When no date is available, `retirementEligible: true` creates a flag with unconfirmed timing. Missing data is explicitly labeled as not recorded.

### 10.5 Goal matching classification

The AI returns only `requiredSkills` and exact `relevantRoles`. Browser code then performs classification:

- **Fully qualified:** at least two required skills at Intermediate+
- **Trainable:** at least one required skill is recorded, but fewer than two are Intermediate+
- **Skill-gapped:** no required skill is recorded

This is not an availability model. Allocation, schedules, certification currency, and manager approval are not evaluated.

### 10.6 Financial scenarios

Defaults in `src/config/financialAssumptions.js` are illustrative:

| Assumption | Value |
| --- | ---: |
| Average specialist salary | $75,000 |
| Recruiting overhead | 20% |
| Trainable course per person | $1,200 |
| Gapped course per person | $2,400 |
| Safety-margin recruits | 2 |
| Downtime cost per hour | $15,000 |
| Assumed annual downtime | 480 hours |
| Target reduction | 20% |

These values are explicitly not company compensation or verified business data. The scenarios should not be used as approved budgets or hiring plans.

## 11. Data model and sources

### 11.1 Runtime JSON workforce

`server/workforceData.mjs` reads:

- `src/data/employees.json`
- `src/data/roles.json`
- `src/data/initiatives.json`

It builds a normalized skill catalog, role target profiles, and departments at request time. The current seed contains 150 employees. The API labels this source `real-seed` and sets `readinessDataComplete: false`.

### 11.2 AI workforce snapshot

AI matching and employee comparisons do not use the live `/api/workforce` response. They use `server/data/ai-workforce.json`, loaded and cached by `server/aiWorkforceData.mjs`.

This separation reduces client-controlled data in prompts, but creates a synchronization requirement: whenever the canonical workforce changes, regenerate and review the AI snapshot.

```bash
npm run generate-ai-workforce
```

To generate it from SQLite:

```bash
npm run generate-ai-workforce -- .local/workforce.sqlite
```

### 11.3 SQLite schema

The local schema contains:

- `departments`
- `roles`
- `skills`
- `employees`
- `employee_skills`

It enforces primary keys, foreign keys, a unique source row, Boolean checks, a 1–5 proficiency range, and unique employee/skill holdings.

The importer:

- accepts normalized extracted rows rather than an `.xlsx` file directly
- runs in one transaction
- refuses to import into a database that already contains employees
- uses deterministic hashes for department, role, and skill IDs
- preserves source row identity
- removes the `404 ` display prefix and stores it as `isFictional`
- preserves unknown proficiency and retirement fields as `NULL`

```bash
node scripts/import-workforce.mjs .local/workforce-rows.json .local/workforce.sqlite
```

### 11.4 Current source-of-truth caveat

Although `server/database.mjs`, `DATABASE_PATH`, and `WORKFORCE_DATA_SOURCE` exist, `server/app.mjs` calls the JSON `loadWorkforce()` implementation unconditionally. Therefore:

- `/api/workforce` is JSON-backed today.
- Changing `DATABASE_PATH` does not change dashboard data.
- SQLite currently supports offline import/read and snapshot generation only.
- The dashboard and AI snapshot can diverge.

Before production use, introduce one configured repository/data-access layer and make both deterministic and AI workflows consume a versioned, authorized view of the same canonical dataset.

## 12. HTTP API

All responses are JSON. Main API responses include `Cache-Control: no-store`; the shared handler also adds `X-Content-Type-Options: nosniff`. Unknown `/api/*` paths return JSON 404 responses.

### 12.1 `GET /api/health`

Returns service and configuration status without exposing credentials.

```json
{
  "status": "ok",
  "dataSource": "real-seed",
  "aiConfigured": true
}
```

### 12.2 `GET /api/workforce`

Returns normalized workforce data:

```json
{
  "employees": [],
  "skills": [],
  "roles": [],
  "departments": [],
  "initiatives": [],
  "dataSource": "real-seed",
  "readinessDataComplete": false
}
```

### 12.3 `POST /api/matching`

Request:

```json
{
  "goalText": "Roll out automation on Line 4",
  "timeline": "6 months"
}
```

The goal is limited to 2,000 characters, the timeline to 100, and the raw body to 1 MB. The endpoint returns provider-produced JSON as a string:

```json
{
  "text": "{\"requiredSkills\":[\"PLC diagnostics\"],\"relevantRoles\":[\"Maintenance Technician\"]}"
}
```

The browser parses and validates the string, rejects unknown roles, normalizes catalog skill names case-insensitively, and calculates people/counts/costs locally.

### 12.4 `POST /api/recommendations/benchmark`

Request:

```json
{
  "roleTitle": "Quality Technician",
  "industry": "food manufacturing"
}
```

The endpoint requires live search evidence, then returns 5–8 unique requirements whose URLs must be present in the collected source set.

```json
{
  "skills": [
    {
      "name": "HACCP",
      "reason": "Relevant role requirement.",
      "sourceUrls": ["https://example.org/standard"]
    }
  ],
  "sources": [
    {
      "title": "Standard",
      "url": "https://example.org/standard",
      "content": "Search synthesis..."
    }
  ],
  "fetchedAt": 1789257600000
}
```

Role and industry are each limited to 200 characters; the raw body is limited to 250 KB.

### 12.5 `POST /api/recommendations/compare`

Request:

```json
{
  "employee": { "id": "employee-id", "name": "Employee", "role": "Role" },
  "roleBenchmark": {
    "skills": [{ "name": "HACCP", "reason": "Role requirement" }]
  },
  "companyStrategy": {
    "shortTermGoals": [{ "text": "Goal" }],
    "longTermGoals": [],
    "initiatives": []
  }
}
```

The server resolves the employee against the trusted AI snapshot. Returned gaps must use an exact benchmark skill name, a valid priority, and nonnegative numeric ranges for fees, training hours, and duration.

### 12.6 Status behavior

| Status | Meaning |
| --- | --- |
| 200 | Success |
| 400 | Invalid JSON or request contract |
| 404 | Unknown API endpoint |
| 405 | Wrong HTTP method |
| 413 | Request body too large |
| 502 | Provider/search/validation failure |
| 503 | No AI provider configured |

## 13. AI design and safeguards

### 13.1 Responsibilities retained by AI

- Deriving required capabilities and relevant roles from a goal
- Synthesizing current role expectations from live sources
- Comparing a trusted employee snapshot against benchmark requirements
- Estimating training paths, fees, active hours, and elapsed time

### 13.2 Responsibilities retained by application code

- Employee identity resolution
- Exact role validation
- Skill-name normalization
- Workforce classification and counts
- Concentration rules
- Financial calculations
- Benchmark source allow-list validation
- Training range validation

### 13.3 Prompt and output controls

- Prompts instruct providers to treat payloads and sources as untrusted data.
- Providers are asked for JSON-only output.
- Markdown fences are stripped before parsing.
- Benchmark URLs must exactly match collected source URLs.
- Duplicate benchmark skills and gaps are rejected.
- Comparison gaps must refer to supplied benchmark names.
- AI employee data comes from the server-side snapshot, not arbitrary request fields.
- Provider calls use 60-second abort timeouts; browser clients use 65- or 125-second timeouts.
- OpenAI requests set `store: false`.

These controls improve reliability but are not a complete defense against prompt injection or incorrect model output. Human review remains required.

## 14. Security, privacy, and compliance

### 14.1 Current security posture

The prototype does not implement:

- login or session management
- role-based or attribute-based access control
- tenant boundaries
- CSRF protection
- rate limiting or abuse detection
- audit logging
- field-level encryption
- data-retention workflows
- consent or employee-access workflows
- automated secret rotation

The API currently exposes workforce records to any caller who can reach it. Do not deploy with real employee data on a public endpoint.

### 14.2 Sensitive data handling

Workforce records and strategic goals can be sent to the selected external AI provider. Before using real data:

1. Minimize prompt fields to what is operationally necessary.
2. Establish an approved data-processing agreement and retention policy.
3. Add authentication, least-privilege authorization, and tenant isolation.
4. Define regional/data-residency requirements.
5. Log access and AI actions without logging sensitive prompt payloads.
6. Add a human approval step before employment-impacting action.
7. Document lawful basis, retention, correction, and deletion procedures.

### 14.3 Secret handling

- Store keys only in `.env.local` for local use and the host's secret manager for deployment.
- Do not commit `.env.local`.
- Do not expose keys via `VITE_*` variables.
- Restrict provider keys by project, quota, and permissions where supported.

## 15. Deployment

### 15.1 Vercel

`vercel.json` builds the Vite application into `dist`, maps `/api/*` to `api/index.mjs`, and rewrites frontend routes to `index.html`. The function duration is configured for 120 seconds to accommodate search plus reasoning.

Deployment checklist:

1. Set the framework/build command to `npm run build` and output directory to `dist`.
2. Configure provider secrets in Vercel, not in the repository.
3. Deploy.
4. Verify `/api/health` and `/api/workforce`.
5. Verify direct navigation to `/matching` and another nested SPA route.
6. Exercise the selected provider's matching and benchmark flows.

Do not use a public production deployment with real employee data until access controls and a persistent, governed datastore are implemented.

### 15.2 Railway

`railway.json` uses the Nixpacks builder and starts `npm run start:api`. It configures `/api/health` as the health check with a 120-second timeout and restarts failed processes up to ten times.

This starts only the API. A complete Railway deployment needs either a second static frontend service or a server/reverse proxy that also serves `dist` and preserves SPA fallback routing.

### 15.3 Production operations still needed

- Structured request logs with correlation IDs
- Error aggregation and frontend telemetry
- AI latency, error, token, and cost metrics
- Readiness dataset version/lineage reporting
- Health/readiness probes that distinguish provider degradation
- Request concurrency limits and rate limiting
- Backups and restoration testing for the canonical datastore
- Dependency/security scanning and an upgrade policy
- Content Security Policy and other HTTP security headers

## 16. Engineering conventions

### 16.1 Adding a page

1. Add the route-level component under `src/pages/`.
2. Add its route in `src/App.jsx`.
3. Add navigation in `src/components/Sidebar.jsx` if it is a primary destination.
4. Consume shared data through contexts rather than importing runtime workforce JSON directly.
5. Add loading, empty, failure, and accessibility states.
6. Add deterministic tests for extracted domain logic.

### 16.2 Adding a deterministic metric

Keep pure calculations under `src/utils/` and UI rendering under pages/components. Specify:

- exact input schema
- missing/unknown-value behavior
- thresholds and rounding
- whether proficiency is required
- whether counts are company-wide or role-scoped
- tests for zero denominators, duplicates, boundaries, and unknown fields

### 16.3 Adding an AI provider

1. Implement an adapter under `server/` returning at least `{ text, output }`.
2. Add selection logic in `server/ai.mjs`.
3. Add a search-source adapter if recommendations benchmarking must work.
4. Normalize provider authentication and timeout errors.
5. Add contract tests with mocked `fetch`.
6. Update `.env.example` and this document.

### 16.4 Changing workforce data

When workforce data changes:

1. Validate stable employee, role, skill, and department identifiers.
2. Validate proficiency values and distinguish unknown from zero.
3. Update or import the canonical dataset.
4. Regenerate `server/data/ai-workforce.json`.
5. Review the snapshot for data minimization.
6. Run all tests and inspect key pages.
7. Confirm dashboard and AI snapshot counts/version match.

## 17. Known limitations and technical debt

Prioritized issues identified from the current implementation:

### Priority 0 — required before real employee data

- Add authentication and authorization to every workforce and AI endpoint.
- Replace checked-in/runtime demo data with a governed persistent datastore.
- Define privacy, retention, audit, and external-provider controls.
- Add rate limiting, request attribution, and abuse controls.

### Priority 1 — correctness and consistency

- Wire `/api/workforce` to a configured data repository; `DATABASE_PATH` is currently inactive there.
- Eliminate divergence between dashboard data and the AI snapshot.
- Fix the three failing test paths and enforce a green suite in CI.
- Reconcile Overview copy with the Intermediate+ readiness calculation.
- Standardize skill display: some detail pages render `skillId` rather than the skill name.
- Consolidate risk thresholds, which currently differ between general risk-map and goal-matching contexts.
- Validate role/skill criteria entered on Strategy against the catalogs to prevent silent zero matches.

### Priority 2 — maintainability and operations

- Move the nested `ErrorBoundary` class out of the `App` render function.
- Add a formal request/response schema library and shared types.
- Add linting, formatting, type checking, and CI workflows.
- Add component/integration tests for page-level flows.
- Add durable benchmark caching with explicit invalidation and provider/model provenance.
- Replace full-object JSON serialization in review cache keys with stable hashes/version IDs.
- Add dataset version, generated-at time, and lineage metadata to workforce payloads and AI snapshots.
- Make business thresholds and financial assumptions configurable and governed.
- Resolve the Vite CJS API deprecation warning during dependency upgrades.

## 18. Troubleshooting

### Workforce page remains on loading

- Open `/api/health` and `/api/workforce` directly.
- Confirm the frontend is running through Vite or is reverse-proxied to the API.
- Check for a 15-second request timeout or invalid top-level arrays.

### AI endpoints return 503

- Configure at least one supported provider key.
- Restart Vite or the standalone API after changing `.env.local`.
- Confirm variables do not use the `VITE_` prefix.

### Benchmarking fails but matching works

- Confirm the selected provider supports the repository's search path.
- An Allama-only configuration cannot collect benchmark sources.
- Check provider web-search/model availability and quota.
- Benchmarks intentionally fail rather than fall back to unsupported model memory.

### SQLite changes do not appear in the dashboard

This is expected in the current implementation. `/api/workforce` always uses JSON. SQLite can currently feed only offline reads and AI snapshot generation.

### AI comparison rejects an employee

The employee must resolve by ID, or by matching name and role, in `server/data/ai-workforce.json`. Regenerate the snapshot after workforce changes.

### Direct navigation returns a hosting 404

Configure SPA fallback routing to `index.html`, while routing `/api/*` to the server/function first.

## 19. Release-readiness checklist

Before merging or deploying a change:

- [ ] Production build succeeds.
- [ ] Test suite is green.
- [ ] No provider secret is present in source or browser-visible environment variables.
- [ ] API contract changes are documented and tested.
- [ ] Data-model changes include migration/import and snapshot considerations.
- [ ] Empty, loading, timeout, and failure states have been exercised.
- [ ] Readiness/risk threshold changes have explicit product approval.
- [ ] AI output remains server-validated and employment-impacting decisions retain human review.
- [ ] `/api/health`, `/api/workforce`, matching, recommendations, and direct SPA navigation pass smoke tests.

## 20. Command reference

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run Vite UI with API middleware |
| `npm run start:api` | Run standalone API |
| `npm run build` | Create production frontend bundle |
| `npm run preview` | Preview production bundle with API middleware |
| `npm test` | Run all Node tests |
| `npm run generate-seed` | Write `dist-seed.json` from `src/data/seed.json` |
| `npm run generate-ai-workforce` | Regenerate AI snapshot from JSON workforce |
| `npm run generate-ai-workforce -- <db>` | Regenerate AI snapshot from SQLite |
| `node scripts/import-workforce.mjs <rows> [db]` | Import normalized workforce rows into SQLite |

## 21. Ownership decisions to make next

The next engineering phase should explicitly decide:

1. Which datastore is canonical and how schema migrations are managed.
2. Whether strategy belongs to a company, business unit, scenario, or user session.
3. Who can view employees, invoke AI, edit goals, and approve recommendations.
4. Which risk and readiness policies are configurable versus fixed.
5. Which employee fields may leave the system for AI processing.
6. How benchmarks are versioned, reviewed, expired, and audited.
7. What evidence is required before a skill, certification, availability, or retirement field is considered reliable.

Until those decisions are implemented, Alignt should be treated as a transparent planning prototype whose outputs support—not replace—qualified human judgment.
