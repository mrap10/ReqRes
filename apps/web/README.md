# @reqres/web

The frontend for ReqRes: a Next.js application with Monaco code editor, real-time test results via SSE, gamification features, and an admin dashboard.

**Framework:** Next.js 16.1 (App Router) + React 19 | **Port:** 3000

## Tech Stack

| Technology                                       | Purpose                            |
| :----------------------------------------------- | :--------------------------------- |
| Next.js 16 (App Router)                          | React framework, SSR, routing      |
| React 19                                         | UI library                         |
| Tailwind CSS 4 + tw-animate-css                  | Styling + animations               |
| Monaco Editor (`@monaco-editor/react`)           | In-browser code editor             |
| Motion (Framer Motion) 12                        | Page transitions, micro-animations |
| Recharts 2                                       | Admin dashboard charts             |
| react-markdown + remark-gfm                      | Problem description rendering      |
| better-auth (React client)                       | Auth state management              |
| Sonner                                           | Toast notifications                |
| next-themes                                      | Dark/light theme (default: dark)   |
| Lucide React                                     | Icons                              |
| class-variance-authority + clsx + tailwind-merge | Component variant patterns         |

## Pages

| Route                 | Description                                            | Auth                          |
| :-------------------- | :----------------------------------------------------- | :---------------------------- |
| `/`                   | Landing page (Hero, Features, How It Works, CTA, FAQ)  | Public                        |
| `/problems`           | Problem listing with difficulty/track filters          | Public                        |
| `/problems/[slug]`    | Split-pane workspace (description ↔ editor + terminal) | Public (submit requires auth) |
| `/leaderboard`        | Global XP leaderboard                                  | Public                        |
| `/profile`            | User profile with activity grid, stats, streaks        | Protected                     |
| `/feedback`           | Feedback form                                          | Public                        |
| `/signin`             | Sign in (email/password + GitHub OAuth)                | Guest only                    |
| `/signup`             | Sign up                                                | Guest only                    |
| `/verify-email`       | Email verification handler                             | Public                        |
| `/reset-password`     | Password reset flow                                    | Public                        |
| `/admin/dashboard`    | Metrics dashboard (charts, counters, active users)     | Admin                         |
| `/admin/add-problems` | Problem creation form                                  | Admin                         |
| `/admin/problem/[id]` | Problem editor                                         | Admin                         |
| `/admin/rate-limit`   | Rate limit management UI                               | Admin                         |

## Key Components

### Problem Workspace (`/problems/[slug]`)

The core user experience ~ a split-pane layout:

**Left panel:** Problem description rendered from Markdown (instructions, examples, constraints, difficulty badge)

**Right panel:**

- **Monaco Editor** ~ Syntax highlighting, file tabs, auto-complete
- **Terminal Panel** ~ Shows real-time execution output via SSE
- **Run button** ~ Quick feedback (2 tests, fast)
- **Submit button** ~ Full test suite + scoring

Real-time flow:

```text
Click Run/Submit → POST /submissions → Open SSE stream
  → Queued... → Running... → Test results
```

### Activity Grid

GitHub-style contribution heatmap on the profile page showing the last 365 days of submissions.

### Admin Dashboard

Metrics visualizations with Recharts ~ submission counts, success rates, active users, queue depth, daily trends.

## Security Headers

Comprehensive CSP and security headers in `next.config.js`:

- Content-Security-Policy (script-src, style-src, connect-src scoped)
- Strict-Transport-Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (restrictive)

## Providers

| Provider                  | Purpose                          |
| :------------------------ | :------------------------------- |
| `AuthProvider`            | better-auth session management   |
| `UserSubmissionsProvider` | Cached submission state per user |
| `ThemeProvider`           | Dark/light mode (default: dark)  |

## Environment Variables

| Variable                   | Required | Purpose                          |
| :------------------------- | :------- | :------------------------------- |
| `API_BASE_URL`             | Yes      | API URL for server-side requests |
| `NEXT_PUBLIC_API_BASE_URL` | Yes      | API URL for client-side requests |

## Development

```bash
# From project root (starts all services)
turbo run dev

# Web only
cd apps/web
bun run dev
```

Open **<http://localhost:3000>** to see the app.

## Project Structure

```text
app/
├── page.tsx                 # Landing page
├── layout.tsx               # Root layout (providers, navbar, footer)
├── globals.css              # Tailwind imports + custom styles
├── problems/
│   └── [slug]/page.tsx      # Problem workspace
├── leaderboard/             # Leaderboard page
├── profile/                 # User profile (protected)
├── feedback/                # Feedback form
├── (auth)/                  # Auth pages (signin, signup, verify, reset)
├── (admin)/                 # Admin pages (dashboard, problems, rate-limits)
└── api/                     # Next.js API routes
components/
├── Navbar.tsx               # Navigation bar
├── Footer.tsx               # Site footer
├── problem-page/            # Workspace components (editor, terminal, panels)
├── landing-page/            # Landing page sections
├── leaderboard-page/        # Leaderboard components
├── admin-components/        # Admin dashboard components
└── ...
lib/                         # Utilities, API helpers, auth client
actions/                     # Server actions
public/                      # Static assets
```

## Links

- [Architecture](../../ARCHITECTURE.md)
- [Main Documentation](../../README.md)
- [/api](../api/README.md)
- [/runner](../runner/README.md)
