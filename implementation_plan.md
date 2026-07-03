# NEXORA Implementation Plan

This document outlines the detailed, phase-by-phase execution plan to build NEXORA from an empty repository to a shipped, production-grade application, based on the architectural constraints and design aesthetic you specified.

## Open Questions (PHASE 2)

> [!IMPORTANT]
> Please review and confirm these details for Phase 2 before I begin scaffolding the design primitives:

1. **Command Palette (`cmdk`)**: Shall I use `cmdk` (the accessible underlying library for shadcn's command component) to build the ⌘K overlay?
2. **Quick-Capture Foundation**: For the quick-capture triggers, should we just log the captured data to the console for now, or should I create the service interface stubs (e.g., `TaskService.create`) even if they just throw "Not Implemented" until Phase 5?
3. **Icon Weights**: Lucide icons default to a 2px stroke width. For a premium, minimalistic feel, do you prefer we stick to 2px, or drop the global stroke width to 1.5px?

---

## Open Questions (PHASE 0 CONFIRM)

> [!IMPORTANT]
> Please review and confirm the following before we begin Phase 1:

1. **Supabase**: Use `.env.local` placeholders for now, or do you have a project ready with keys?
2. **Design Tokens**: 
   - Charcoal (Bg): `#0A0A0A`, `#121212`, `#1A1A1A`
   - Emerald (Primary): `#10B981`
   - Amber (Accent): `#F59E0B`
   *Do these hexes match your vision from the screenshots, or do you have exact hex values?*
3. **Typography**: Geist or Inter? (I recommend Geist for the premium, technical feel).
4. **Repository**: Repo name `nexora`, Private visibility, deployed to Vercel?
5. **AI Gateway**: What is our initial AI provider, and do we have a latency/budget ceiling in mind?
6. **v1 Scope**: Build all 12 surfaces in v1, or a thin slice first (e.g., Auth + Dashboard + Tasks + Focus)?
7. **Seed Data**: Do you confirm using clearly labeled sample data behind service interfaces for the initial UI build?

---

## Proposed Execution Phases

### Phase 1: Installation & Foundation
- Scaffold Next.js App Router with TypeScript (strict mode).
- Install dependencies: Tailwind CSS, shadcn/ui, Lucide icons, Framer Motion, Recharts, dnd-kit, next-themes, Supabase SSR, date-fns, react-hook-form, zod, TipTap.
- Setup folder structure (app, components, features, services, hooks, lib, utils, types, constants, data, styles).
- Configure ESLint, Prettier, and absolute path aliases.
- Map design tokens to CSS variables and Tailwind theme; set next-themes to dark default.
- Initialize Git repository and add `.gitignore`.

### Phase 2: Design System, Primitives & Command-First Core
- Build the themed component library using shadcn/ui and custom styles (buttons, inputs, cards, dialogs, drawers, tabs, tables, chips, avatars, tooltips, toasts, progress bars, chart wrappers).
- Ensure strict adherence to the palette (Charcoal, Emerald, Amber) and the single sanctioned gradient (Emerald -> Amber).
- Implement the ⌘K command palette framework.
- Build global keyboard shortcut manager and quick-capture foundation.

### Phase 3: Landing Page (Public)
- Build the marketing page to match the screenshot exactly.
- Implement the Hero section with the specific typography, the product-preview card, and the single sanctioned wordmark gradient.
- Build the "Twelve surfaces. One mind." grid.
- Build the "Daily Ritual" and Execution Score panel.
- Build the Assistant section, testimonial, and final CTA.
- Set up scoped SEO/OG/JSON-LD and ensure the `(app)` group is no-indexed.

### Phase 4: Auth + Onboarding
- Initialize Supabase clients (server and browser).
- Create database schema for `profiles` with RLS policies and an auto-create trigger.
- Implement email/password and Google/Apple OAuth sign-in/up components.
- Setup `middleware.ts` to protect `(app)` routes.
- Build the interactive Onboarding product (persona selection, visible modules, default home, planning cadence, success metric formula, templates).

### Phase 5: Data Foundation + Execution Graph + Decision Memory
- Define and run migrations for all core tables: `workspaces`, `memberships`, `tasks`, `projects`, `events`, `goals`, `habits`, `focus_sessions`, `notes`, `research`, `news_items`.
- Implement the **Unified Execution Graph** schema (edges linking entities).
- Implement the **Decision Memory** and **Event History** stores.
- Enforce strict RLS policies across all tables.
- Generate TypeScript database types and write typed repository services.

### Phase 6: App Shell + Dashboard
- Build the collapsible left sidebar navigation and the top bar (search, quick-add, theme toggle).
- Build the customizable Dashboard with KPI cards (Execution Score, Tasks, Focus, Habits).
- Implement 7-day bar charts and goal momentum progress bars.
- Integrate "real zeros" empty states.

### Phase 7: Tasks Module
- Build the Kanban Board (Backlog, In Progress, Review, Completed) with drag-and-drop (dnd-kit).
- Build List, Timeline, and Completed views.
- Implement priority chips, due dates, project links, subtasks, and the new-task modal/detail drawer.
- Wire up optimistic persistence with rollback logic.

### Phase 8: Projects & Calendar
- **Projects**: Build card grid layout, status/progress derived from linked tasks, and detail views.
- **Calendar**: Build Day/Week/Month views. Render priority-colored task chips and typed event blocks. Implement drag-to-time-block functionality.

### Phase 9: Goals & Habits
- **Goals**: Build Yearly/Quarterly/Monthly vision cards and momentum tracking. Link to projects/tasks via the execution graph.
- **Habits**: Implement daily consistency grid with streak counters and daily check-in toggles.

### Phase 10: Focus Mode
- Build the full-screen deep-work session UI.
- Implement timestamp-based Pomodoro timer and stopwatch to ensure background accuracy.
- Add intent capture, session task selector, soundscapes, and distraction logging.
- Feed logs directly to `focus_sessions` for the Dashboard and Analytics.

### Phase 11: Notes + Research + News
- **Notes**: Integrate TipTap rich editor with folders, pinning, tags, instant search, and autosave.
- **Research**: Build source saving, metric cards, and AI distillation pipelines.
- **News**: Implement topic-based AI briefings and "Save to Research" flow.

### Phase 12: Analytics + Execution Score
- Build detailed reporting for last-7-days and monthly ranges.
- Implement productivity heatmaps, best-time blocks, and trend analyses.
- Wire up the tunable weighted Execution Score formula and surface "what moved your score" insights.

### Phase 13: AI Foundation
- Set up the model-agnostic AI gateway (keys safely server-side).
- Build the context builder to read the Execution Graph.
- Implement the threaded Assistant with streaming markdown, code, and table support.
- Wire all AI actions to write rationales into Decision Memory.

### Phase 14: Embedded AI Intelligence
- Build Daily Brief generation.
- Implement Task Triage, Calendar Assistant, Goal Coach, and Research-to-Action features.
- Build Review Synthesis (weekly/monthly wins, misses, and patterns).

### Phase 15: Smart Planning Engine
- Build the daily planning mode that synthesizes deadlines, energy, and goals into a recommended schedule.
- Implement one-click accept/edit/reject workflows.

### Phase 16: Adaptive Personas + Deep Customization
- Implement Persona logic to reshape labels, defaults, and AI suggestions.
- Enable deep customization of module structure, planning behavior, and AI intelligence tone.

### Phase 17: Lifecycle Automation
- Build the rules engine for event-driven automation (e.g., missed goals trigger AI review).

### Phase 18: Templates, Presets & Import/Export
- Build OS presets ("Founder OS", "Student OS").
- Implement robust JSON export/import for user data portability.

### Phase 19: Command-First Completeness + Polish
- Ensure every action is reachable via ⌘K.
- Conduct accessibility (a11y) audit and performance optimization (RSC, dynamic imports, image optimization). Target 90+ Lighthouse score.

### Phase 20: Commercialization Preparedness
- Implement Personal vs. Commercial edition separation in logic.
- Activate workspace/role RLS policies, team dashboards, and billing hooks.

---

## Verification Plan

For each phase, the following steps will be taken before moving to the next:
1. **Automated Verification**: `npm run lint`, `npm run build`, and `npm run type-check`.
2. **Manual Verification**: Run `npm run dev` and visually verify components in the browser against design constraints.
3. **Self-Check Protocol**: Confirm strict adherence to the UI/UX constraints (no default shadcn, no glassmorphism, no emoji, explicit palette adherence) and architectural constraints (Server components by default, UI only talks to services).
4. **Sign-off**: Wait for your explicit "continue" command.
