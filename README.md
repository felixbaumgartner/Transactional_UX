# Transactional Messaging UX Demo

Interactive prototype demonstrating the UX for classifying, creating, and managing transactional messages within a marketing messaging platform. Built as a clickable demo to validate workflows before production implementation.

## What This Demo Covers

This app simulates the end-to-end experience of working with transactional messages (booking confirmations, OTPs, payment receipts, etc.) that require guaranteed delivery and bypass marketing subscription preferences.

### Key Workflows

**Campaign Management** (`/campaigns`, `/campaign/new`)
- List view with filtering by name, channel (Email/Push/SMS), and status (Draft/Published/Stopped)
- Campaign creation form with sections for metadata, send configuration, eligibility rules, experiments, and reporting
- Purpose classification: Marketing vs Non-marketing vs Transactional
- Non-marketing selection triggers a questionnaire modal (same questions as the production targeting UI)
- Transactional campaigns require linking to an existing trigger or creating one first

**Trigger Rules** (`/triggers`, `/trigger/new`)
- List view with filtering by name, channel, status (Draft/Live/Archived), and last changed by
- Trigger creation with input topic selection (booking_events, payment_events, identity_events, etc.)
- Rule builder with AND/OR groups, field-operator-value conditions, and metric tags
- Output field configuration and UUID composition for deduplication
- Event time windows and evaluation delays

**Transactional Classification Questionnaire**
- Two-phase decision tree embedded in both campaign and trigger creation flows
- **Phase 1** (Q1-Q4): Determines Marketing vs Non-marketing based on promotional intent
- **Phase 2** (Q5-Q8): Shown only for Non-marketing messages; validates transactional eligibility
- Hybrid content guardrail: any promotional content (Q8=yes) forces reclassification to Marketing

**Message Registry** (`/registry` - via `MessageRegistryDemo`)
- Central registry of all classified messages with their purpose, channel, and tier
- Inline classification flow for registering new messages
- SLO info cards showing delivery commitments per tier

**Transactional Overview** (`/overview` - via `TransactionalOverviewDemo`)
- Dashboard of all transactional messages with delivery rate and latency metrics
- Links campaigns to their trigger rules

**Transactional Experiments** (`/experiments` - via `TransactionalExperimentsDemo`)
- A/B testing for transactional messages with SLO guardrails
- Variant traffic splitting, auto-rollback thresholds, and per-variant metrics

## Project Structure

```
src/
  main.tsx                          # App entry point (BrowserRouter wrapping)
  App.tsx                           # Root layout: header, sidebar nav, route definitions
  constants.ts                      # Type definitions, SLO configs, questionnaire questions, input topic taxonomy
  classificationStore.ts            # React context store for classification records (with seed data)
  ClassificationStoreProvider.tsx   # Context provider with in-memory state
  styles.css                        # All styles (BUI-inspired design tokens + component styles)

  components/
    ClassificationQuestionnaire.tsx # Two-phase questionnaire (modal or inline mode)
    TransactionalDiscoveryBanner.tsx # Dismissible banner prompting transactional classification
    TransactionalSLOInfoCard.tsx    # SLO commitment display card (delivery %, latency, retry policy)
    TransactionalTierBadge.tsx      # Badge component for Tier 1/Tier 2
    TransactionalTierSelector.tsx   # Radio card selector for tier with SLO preview

  pages/
    CampaignListDemo.tsx            # Campaign list with filters and sorting
    CampaignCreateDemo.tsx          # Full campaign creation form
    TriggerListDemo.tsx             # Trigger rules list with filters and sorting
    TriggerCreateDemo.tsx           # Full trigger creation form with rule builder
    MessageRegistryDemo.tsx         # Message classification registry
    TransactionalOverviewDemo.tsx   # Transactional messages dashboard
    TransactionalExperimentsDemo.tsx # Experiment management for transactional messages
```

## Classification Logic

The questionnaire in `constants.ts` implements this decision tree:

| Phase 1 Answers | Phase 2 Answers | Classification |
|---|---|---|
| Q1=yes OR Q2=yes | (skipped) | Marketing |
| Q3=yes, Q4=no, Q1=no, Q2=no | Q5-Q7=yes, Q8=no | Transactional |
| Q3=yes, Q4=no, Q1=no, Q2=no | Q8=yes | Marketing (hybrid guardrail) |
| Q3=yes, Q4=no, Q1=no, Q2=no | any Q5-Q7=no | Non-marketing (not transactional) |
| Q4=yes | Q5-Q7=yes, Q8=no | Transactional |

### Transactional SLO Tiers

| | Tier 1 (Critical) | Tier 2 (Non-Critical) |
|---|---|---|
| **Examples** | OTPs, booking confirmations, payment receipts | Check-in reminders, review requests |
| **Latency (p99)** | < 30 seconds | < 5 minutes |
| **Delivery SLO** | 99.9% | 99.5% |
| **Kafka Topic** | Transactional_Priority (high partition) | Transactional_Priority (standard) |
| **Retry** | 3x, exp. backoff, 1-min cap (15-min TTL) | 3x, exp. backoff, 5-min cap (60-min TTL) |

> Note: Tier selection is currently deferred in the UI - messages are classified as transactional without a tier distinction for now.

### Input Topic Taxonomy

Topics are categorized as **state-change** (can produce transactional messages) or **behavioral** (never transactional):

- **State-change**: Booking Events, Payment Events, Identity & Security Events, Invoice & Legal Events, Account Events
- **Behavioral**: Browsing Events, Trip Reminder Events, Engagement Events, Loyalty & Rewards Events, Review Events

## Tech Stack

- **React 18** with TypeScript
- **React Router v6** for client-side routing
- **Vite** for dev server and builds
- No external UI library - custom CSS inspired by Booking.com's design system (BUI)

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Building for Production

```bash
npm run build
npm run preview   # preview the production build locally
```

## All Data is Mock

This is a frontend-only prototype. All data (campaigns, triggers, classification records, metrics) is hardcoded in the components. There are no API calls or backend dependencies.
