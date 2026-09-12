# Alignt

Alignt is a strategy-driven skills intelligence platform that connects a company's goals directly to its workforce capabilities.

Instead of treating workforce skills as a standalone inventory, Alignt anchors every skill gap, risk signal, and recommendation to the business strategy that matters right now. The result is a living view of who is ready, who is at risk, who should be developed, and which people are best suited for upcoming projects.

> We connect your company's strategy directly to your people, showing exactly who's ready, who's at risk, and who to develop, put on which project, and why.

## Core Idea

Most skills platforms answer, "What skills do our employees have?"

Alignt answers a sharper question:

> Given our current strategy, what workforce capabilities matter most, where are we exposed, and what should we do next?

Concentration risk and succession risk are calculated relative to strategic importance. A rare skill is only a critical risk if the company's current goals actually depend on it.

## How It Works

```text
Company Strategy
  -> Ideal Skill Profiles by Role
  -> Employee Skill Data
  -> Strategy-Weighted Gap Analysis
  -> Color-Coded Risk Map
  -> AI Recommendations
  -> Goal-to-Project Team Matching
```

## Key Features

### 1. Company Strategy Input

Leaders define the business context that powers the rest of the platform:

- Short-term goals
- Long-term goals
- Core values and priorities
- Key initiatives, such as automation rollout, new plant openings, or sustainability compliance

These inputs become the weighting engine for every downstream analysis.

### 2. Overview / Command Center

The command center gives leaders an immediate snapshot of workforce readiness:

- Workforce size
- Skills tracked
- Strategy-critical risk flags
- Ranked capability-at-risk list

Unlike a static skills dashboard, risks are sorted by strategic weight, not just rarity.

### 3. Risk Map / Heat Map

The risk map shows employees or roles color-coded by:

- Skill gap severity
- Strategic importance
- Succession urgency
- Concentration risk

Users can click into a person or role to see actual skills compared against the ideal profile.

### 4. Skill Gap & Recommendation Panel

For a selected employee or role, Alignt identifies missing skills and recommends a development path.

Each recommendation can include:

- Specific skills or certifications needed
- Estimated time to acquire
- Typical training or certification cost
- Expected impact on strategy-critical risk

This turns risk analysis into an actionable development plan.

### 5. Goal-to-Project Matching

Leaders can enter a new goal or project with a target timeline. Alignt then:

- Derives the skills required
- Checks current organizational coverage
- Suggests the best team from existing employees
- Flags residual gaps that may require training, hiring, or external support

This is the platform's flagship workflow: strategy enters, the right team comes out.

### 6. Employee Profile

Each employee profile includes:

- Role and department
- Responsibilities
- Tenure
- Actual skills and certifications
- Gap against the ideal role profile
- Risk flags where applicable

## Data Model

### Company Strategy

- Short-term goals with target dates
- Long-term goals with target dates
- Core values and priorities
- Key initiatives used to weight skill importance

### Employee

- Name
- Department
- Role
- Responsibilities
- Tenure
- Retirement eligibility

### Position / Role

- Ideal skill profile
- Target proficiency by skill
- Benchmarks based on industry knowledge and top performers in the organization

### Skill

- Name
- Category, such as Food Safety, Equipment and Logistics, IT and Digital, or Leadership
- Dynamic strategic weight based on current company strategy

### Employee-Skill Mapping

- Proficiency level: Beginner, Intermediate, or Expert
- Source: self-rated, manager-rated, or certified

## AI Responsibilities

Alignt uses AI for three clear jobs:

1. Benchmarking
   Builds ideal skill profiles by combining industry knowledge with patterns from top performers in each role.

2. Recommending
   Converts gaps into concrete learning paths, including skill or certification needs, time to acquire, and expected cost.

3. Matching
   Takes a new business goal or project, derives the required skills, and proposes the strongest available team.

## Demo Narrative

1. Set the strategy.
   A leader enters business priorities such as automation rollout, a new plant opening, or sustainability compliance.

2. Show the risk.
   The overview ranks capabilities at risk based on what the strategy depends on most.

3. Make it personal.
   The risk map reveals employees who hold critical knowledge, including possible succession risks.

4. Close the loop.
   The recommendation panel shows exactly what training or certification would reduce the risk.

5. Match a project.
   A leader enters a new initiative, and Alignt assembles a recommended project team from existing staff.

6. Land the message.
   Alignt is not a static report. It is a living connection between company strategy and people decisions.

## Seed Data Approach

Demo data should be realistic and intentionally structured.

For a Schwan's-flavored scenario, seed data may include:

- Food safety certifications
- Plant and equipment expertise
- Packaging line knowledge
- Logistics and cold-chain skills
- Digital transformation capabilities
- Leadership and operational readiness indicators

The demo should include a few intentional risk stories, such as a near-retirement employee who is the sole holder of a strategy-critical skill.

## Suggested Build Plan

For a 24-hour prototype:

1. Hours 0-2: Data model and seed data generator
2. Hours 2-4: Company Strategy Input screen
3. Hours 4-7: Ideal Skill Profile logic
4. Hours 7-10: Gap Analysis, Overview, and Risk Map
5. Hours 10-14: AI Recommendation Panel
6. Hours 14-19: Goal-to-Project Matching
7. Hours 19-21: Employee Profile view
8. Hours 21-23: Polish, styling, and demo rehearsal
9. Hours 23-24: Bug buffer and fallback plan

If time runs short, cut the Employee Profile view or polish depth first. Preserve Strategy Input, Risk Map, and Goal-to-Project Matching, because those screens carry the core connected workflow.

## Future Enhancements

- HRIS integration
- LMS integration
- CSV upload for workforce data
- Employee-facing internal mobility view
- Scenario planning for future strategy changes
- Hiring recommendations for gaps that cannot be solved through development alone

## Status

The React frontend now uses a shared Node API in development, standalone hosting, and Vercel. Workforce reads use the existing seed dataset. Strategy edits and training selections remain client-side; database persistence, authentication, and authorization are not implemented.

## Running goal-to-project matching

### Backend setup

#### Local SQL workforce database

Requires Node.js 22.13 or later. `server/schema.sql` defines departments, roles,
employees, skills, and employee skill holdings with foreign keys and rating checks.
Set `DATABASE_PATH=.local/workforce.sqlite` in `.env.local` to read workforce
data from SQLite. If unset, the original demo seed is used. A configured database
failure returns an error instead of silently replacing records with demo data.

The supplied workbook was imported locally: 167 records, including 148 marked
fictional by the `404` prefix. The prefix is removed from display names and stored
as `isFictional`. Unmarked records are not independently verified as real people.
Rows 2–18 use the leadership layout; rows 19–168 use department/category/role and
rated skills. Required certifications are stored separately from skill holdings.
Unknown ratings, tenure, and retirement eligibility remain SQL NULL.

The database and extracted source rows are ignored by Git. Recreate a database
from the local extracted rows with
`node scripts/import-workforce.mjs .local/workforce-rows.json .local/new-workforce.sqlite`.
The importer refuses to overwrite populated employee tables and imports in one
transaction. Source row numbers preserve identity even when names repeat.

SQLite is persistent on this computer. It is not a hosted database and this file
has not been uploaded to Vercel. Vercel needs a hosted SQL database for persistent
writes across deployments. Existing API routes expose reads only; authentication,
strategy persistence, and employee editing remain future work. Skills imported
without a category use `uncategorized`; no strategic weights are inferred.

Run `npm install`, copy `.env.example` to `.env.local`, and configure the two
OpenAI variables. `npm run dev` serves both the UI and API. For a standalone
API, run `npm run start:api` (default `127.0.0.1:3001`; configure `HOST` and `PORT`
for your host). The standalone command loads `.env.local` and gives deployment
environment variables precedence. It serves the API only; serve `dist` separately.

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Service status and whether AI is configured; no credentials |
| `/api/workforce` | GET | Employees, skills, roles, and departments from seed data |
| `/api/matching` | POST | Goal matching using the existing frontend request contract |
| `/api/recommendations/benchmark` | POST | Search-backed role requirements |
| `/api/recommendations/compare` | POST | Employee gaps and training estimates |

Unknown API routes return JSON 404 responses. Workforce loading shows a loading
state and a retry action on failure. No database writes are exposed yet.
The frontend loads employees, departments, roles, and skills through
`/api/workforce`; browser-side JSON files never override the response. Readiness
objectives now come from the current strategy goals. Restart the local
server after changing `DATABASE_PATH`. Strategy edits still remain session-only.
Run `npm test` for HTTP routing, deployment adapter, and AI service contract tests.

### Vercel

Use the Vite preset, install command `npm install`, build command `npm run build`,
and output directory `dist`. `vercel.json` routes API requests to `api/index.mjs`
and frontend navigation to `index.html`. Set `OPENAI_API_KEY` and `OPENAI_MODEL`
in Vercel's environment settings and redeploy. The function duration is 120 seconds
to accommodate search followed by reasoning; enable Fluid Compute and ensure
your project's duration settings support this value.
See [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json).

Verify `/api/health`, `/api/workforce`, and a direct visit to `/matching` after
deployment. The API currently serves demo data without authentication. Real
employee data requires authentication, authorization, and persistent storage.

Use Node.js 20+ and run `npm install`, then `npm run dev`. Open `/matching`.
Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` and
`OPENAI_MODEL` to `gpt-4.1-mini` (the default), or another compatible model available to your OpenAI project, then restart
Vite. These values are read only by the server; do not use a `VITE_` prefix.
The integration uses the [OpenAI Responses API](https://developers.openai.com/api/docs/guides/text) at `https://api.openai.com/v1/responses` with server-side Bearer authentication.

Vite serves `/api/matching` in development and preview. For deployment, build
with `npm run build`, serve `dist`, and run `npm run start:api` with the
two environment variables set in your server environment. Reverse-proxy
`/api/*` to `127.0.0.1:3001` (override with `PORT` or `MATCHING_PORT`) and configure
SPA routing for `/matching`. Put this endpoint behind your deployment's
employee authentication and rate limiting. Static hosting alone does not run
the API. The submitted workforce data is sent to the configured AI provider.

The page displays explicit service errors; it never substitutes mock matches.
Seed employees have no allocation/commitment data, so their availability is
unknown. Provide explicit commitment fields in workforce records to support
stretched recommendations. AI identifies required skills and suggests gap-closing plans. The app independently
matches exact catalog skill names against positive employee proficiencies, preferring
employees without explicit over-commitment and then highest proficiency. Supported
commitment fields are `stretched`, `overCommitted`, and `allocationPercent` (100 or
more indicates stretched). Availability remains unknown when these are absent.
Covered skills are green/teal; missing skills are yellow/amber. Each gap compares
training a named current employee with hiring a skilled paid intern, with estimated
USD cost ranges, duration, and assumptions. Costs are AI planning estimates, not
live market quotes. Alternative totals assume one person per gap and may double-count
shared people or training. The current workforce source is the seed-backed `/api/workforce` endpoint,
not a persistent database. Training candidate IDs and cost ranges are validated. Run `node --test tests/matching.test.mjs`
for API contract, validation, and failure-path checks.

## Live role recommendations

`/recommendations` uses the same server-only OpenAI configuration as matching.
Role benchmarking first calls OpenAI's Responses API with the required `web_search` tool, then asks the
model to synthesize 5–8 requirements with links to the returned evidence. If
search fails or returns no usable sources, the page reports an error rather
than substituting model memory. See [OpenAI web search](https://developers.openai.com/api/docs/guides/tools-web-search).

`RoleBenchmarkContext` caches successful benchmarks in memory for seven days,
keyed by normalized role title and industry. Concurrent requests share one
promise. The cache survives page navigation and resets on reload. A separate
chat call compares each employee's named skill records and strategy with the
benchmark; no web search runs in that comparison. Employee results are cached
against the profile and strategy and expire with their benchmark.

The employee list gradually reviews profiles in the background to populate real
severity badges; it shows “not checked” until reviewed. Background processing
stops on a service error, and the selected employee can be retried. Prices are
clearly marked as estimated USD course/certification/exam fees. Expand the role
benchmark section to inspect its requirements and source links.

For deployment, also proxy `/api/recommendations/*` to the Node API process
started by `npm run start:api`. Run all service/cache tests with
`node --test tests/*.test.mjs`.
