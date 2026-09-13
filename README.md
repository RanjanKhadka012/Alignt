# Alignt

Alignt is a strategy-driven workforce intelligence prototype. It connects company goals with roles, employee skills, readiness, capability concentration, retirement exposure, development recommendations, and goal-to-team planning.

The application uses deterministic workforce analytics for counts, thresholds, classifications, and financial scenarios. Optional AI integrations derive goal requirements, benchmark current role expectations from live sources, and propose employee development gaps.

## Documentation

Read the [complete engineering and product documentation](docs/PROJECT_DOCUMENTATION.md) for:

- product scope and limitations
- architecture and runtime data flow
- local setup and configuration
- frontend routes and shared state
- domain calculations and thresholds
- workforce data lineage and SQLite tooling
- HTTP API contracts and status behavior
- AI provider selection and output safeguards
- security and privacy considerations
- Vercel and Railway deployment guidance
- testing, troubleshooting, technical debt, and release checks

## Quick start

Prerequisites: Node.js 20+ and npm. Node.js 22.13+ is required for the optional `node:sqlite` tools.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The deterministic dashboard works without an AI key. Goal matching and live recommendations require at least one supported provider configured in `.env.local`.

## Common commands

```bash
npm run dev           # Vite frontend with API middleware
npm run start:api     # standalone API on 127.0.0.1:3001
npm run build         # production frontend bundle
npm run preview       # preview bundle with API middleware
npm test              # Node test suite
```

## Current maturity

This repository is a planning prototype, not a production HR system. Runtime workforce reads currently use checked-in JSON; strategy changes are session-only; the AI workflows use a separate checked-in workforce snapshot; and authentication, authorization, audit logging, API rate limiting, and persistent application writes are not implemented.

Do not expose real employee data publicly or use generated output as an automated employment decision. See the full documentation for the production-hardening roadmap and the exact data-source caveats.
