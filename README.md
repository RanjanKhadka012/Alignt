# Aliant

Aliant is a strategy-driven skills intelligence platform that connects a company's goals directly to its workforce capabilities.

Instead of treating workforce skills as a standalone inventory, Aliant anchors every skill gap, risk signal, and recommendation to the business strategy that matters right now. The result is a living view of who is ready, who is at risk, who should be developed, and which people are best suited for upcoming projects.

> We connect your company's strategy directly to your people, showing exactly who's ready, who's at risk, and who to develop, put on which project, and why.

## Core Idea

Most skills platforms answer, "What skills do our employees have?"

Aliant answers a sharper question:

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

For a selected employee or role, Aliant identifies missing skills and recommends a development path.

Each recommendation can include:

- Specific skills or certifications needed
- Estimated time to acquire
- Typical training or certification cost
- Expected impact on strategy-critical risk

This turns risk analysis into an actionable development plan.

### 5. Goal-to-Project Matching

Leaders can enter a new goal or project with a target timeline. Aliant then:

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

Aliant uses AI for three clear jobs:

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
   A leader enters a new initiative, and Aliant assembles a recommended project team from existing staff.

6. Land the message.
   Aliant is not a static report. It is a living connection between company strategy and people decisions.

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

This repository currently contains the product README and concept brief for Aliant. Implementation details, setup instructions, and deployment notes should be added once the application stack is introduced.
