# Copilot Instructions — workshop-pages-theme

This is the **workshop-pages-theme** Jekyll remote theme (`shinyay/workshop-pages-theme`).
Consumer repositories activate it with `remote_theme: shinyay/workshop-pages-theme` in their `_config.yml`.
Follow every convention below when generating, editing, or reviewing code in this repository.

---

## 1. Theme Architecture

- This is a **Jekyll remote theme**. There is no `.gemspec`. It works entirely through the `jekyll-remote-theme` plugin.
- Consumer repos declare `remote_theme: shinyay/workshop-pages-theme` — never use `theme:`.
- SCSS partials live in `_sass/workshop-theme/` and are organized by concern:
  - `_variables.scss` — Design tokens (colors, spacing, typography)
  - `_base.scss` — CSS resets and element defaults
  - `_layout.scss` — Page grid and structural layout
  - `_header.scss` — Frosted-glass header and navigation
  - `_sidebar.scss` — Step sidebar with colored hover borders
  - `_content.scss` — Prose and Markdown-rendered content
  - `_components.scss` — Callouts, badges, buttons, cards
  - `_footer.scss` — Footer with gradient separator
  - `_dark-mode.scss` — Dark theme overrides
  - `_responsive.scss` — Breakpoint-based responsive rules
  - `_print.scss` — Print stylesheet
- `_sass/workshop-theme.scss` is the master import file — it `@import`s every partial in the correct order.
- `assets/css/style.scss` is the Jekyll entry point. It **must** have empty YAML front matter (`---\n---`) so Jekyll processes it.

When adding a new partial, create the file in `_sass/workshop-theme/`, then add the `@import` line to `_sass/workshop-theme.scss` in the appropriate position.

---

## 2. GitHub Brand Colors

All colors are defined in `_sass/workshop-theme/_variables.scss` and exposed as both SCSS variables (`$gh-*`) and CSS custom properties (`var(--gh-*)`).

### Primary Palette

| Token | Hex | Usage |
|---|---|---|
| `$gh-green` | `#0FBF3E` | Primary accent, CTA buttons |
| `$gh-green-light` | `#8CF2A6` | Hover states, highlights |
| `$gh-green-dark` | `#08872B` | Active states, borders |
| `$gh-copilot-purple` | `#8534F3` | Copilot-branded elements |
| `$gh-copilot-purple-light` | `#C898FD` | Purple highlights, badges |
| `$gh-orange` | `#FE4C25` | Warnings, attention |
| `$gh-blue` | `#0969da` | Links, info callouts |
| `$gh-light-blue` | `#58a6ff` | Dark-mode links |

### Surface Colors

| Token | Hex | Mode |
|---|---|---|
| `$gh-dark-bg` | `#0d1117` | Dark background |
| `$gh-dark-surface` | `#161b22` | Dark cards/panels |
| `$gh-dark-border` | `#30363d` | Dark borders |
| `$gh-light-bg` | `#ffffff` | Light background |
| `$gh-light-surface` | `#f6f8fa` | Light cards/panels |
| `$gh-light-border` | `#d1d9e0` | Light borders |

Always use the token variables — never hard-code hex values. In SCSS, use `$gh-*`. In CSS or HTML `style` attributes, use `var(--gh-*)`.

---

## 3. Layout System

There are exactly **4 layouts** in `_layouts/`. Every page must use one of them.

### `default.html`

Base HTML shell. Provides:
- `<head>` via `{% include head.html %}`
- Skip-to-content link for accessibility
- Back-to-top floating button
- JS bundle via `<script src="{{ '/assets/js/workshop.js' | relative_url }}">`.

Never use `default` directly in consumer repos — use one of the three content layouts below.

### `workshop.html` (extends `default`)

Overview / landing page. Includes the `workshop-header.html` hero card with animated gradient, sparkle SVGs, category badge, and action buttons. Use for `index.md` only.

```yaml
---
layout: workshop
---
```

### `step.html` (extends `default`)

Step content page. Provides sidebar, breadcrumb, step-header with number badge, auto-generated TOC, step-nav (prev/next), and keyboard-hint banner. Used for every tutorial step.

```yaml
---
layout: step
title: "Create the API endpoint"
step_number: 1
permalink: /steps/1/
duration: "15 min"
description: "Build a REST endpoint with Spring Boot"
---
```

### `cheatsheet.html` (extends `default`)

Reference / cheat-sheet page. Provides sidebar, breadcrumb, and clean content area. Linked from a parent step.

```yaml
---
layout: cheatsheet
title: "API Cheatsheet"
parent_step: 1
permalink: /cheatsheet/1/
---
```

---

## 4. Include System

There are **12 includes** in `_includes/`. Use `{% include <name>.html %}` in layouts.

| Include | Purpose |
|---|---|
| `head.html` | `<head>` tag: meta, fonts, stylesheets, SEO |
| `header.html` | Frosted-glass top bar with nav, hamburger menu, theme toggle |
| `footer.html` | Footer with gradient separator and links |
| `sidebar.html` | Step list sidebar with progress indicators |
| `workshop-header.html` | Hero card: animated gradient, sparkle SVGs, badges, CTA |
| `prerequisites.html` | Renders `site.workshop.prerequisites` as a styled list |
| `step-nav.html` | Previous / Next navigation buttons between steps |
| `toc.html` | Table-of-contents container (populated by JS) |
| `theme-toggle.html` | Light / dark mode toggle button |
| `callout.html` | Styled callout box (note, tip, warning, important, caution) |
| `breadcrumb.html` | Breadcrumb navigation trail |
| `head-custom.html` | **Hook for consumer repos** — add custom analytics, fonts, or styles here |

When creating a new include, place it in `_includes/` and document its expected parameters with a Liquid comment at the top of the file.

---

## 5. Front Matter Schema

### `layout: workshop` (overview page)

No special front-matter fields are required. The layout reads `site.title`, `site.description`, and `site.workshop.*` from `_config.yml`.

### `layout: step` (step pages)

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | **yes** | Step heading |
| `step_number` | integer | **yes** | `0` = setup/prerequisites, `1`+ = tutorial steps |
| `permalink` | string | **yes** | Must match `/steps/<N>/` pattern (e.g., `/steps/1/`) |
| `duration` | string | no | Estimated time (e.g., `"15 min"`) |
| `description` | string | no | Short summary shown in sidebar |

### `layout: cheatsheet` (reference pages)

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | **yes** | Page heading |
| `parent_step` | integer | **yes** | Must match an existing `step_number` |
| `permalink` | string | **yes** | Must match `/cheatsheet/<N>/` pattern |

Always set `permalink` with a trailing slash.

---

## 6. `_config.yml` Schema for Consumer Repos

Every consumer repo must have a `_config.yml` that follows this schema:

```yaml
remote_theme: shinyay/workshop-pages-theme

title: "Workshop Title"
description: "One-line workshop description"
author: "author-name"

plugins:
  - jekyll-remote-theme

workshop:
  category: "copilot-ai"          # See §7 for valid values
  language: "Python"
  difficulty: "Beginner"          # Beginner | Intermediate | Advanced
  duration: "2-3 hours"
  prerequisites:
    - "GitHub account"
    - "VS Code with Copilot extension"
  hub_url: "https://shinyay.github.io/awesome-shinyay-workshop/"
  show_toc: true
  show_progress: true

defaults:
  - scope:
      path: ""
    values:
      layout: "workshop"
```

- `plugins` **must** include `jekyll-remote-theme`.
- `workshop.category` controls the color scheme of the entire site (gradient, badges, sidebar accent). Use one of the 8 valid categories listed in §7.
- `workshop.hub_url` links back to the workshop hub for cross-workshop navigation.
- `defaults` should set `layout: "workshop"` so `index.md` gets the right layout without explicit front matter.

---

## 7. Category System

The `workshop.category` value determines the gradient, badge color, and accent used across the site. There are exactly **8 valid categories**:

| Category | Gradient | Use For |
|---|---|---|
| `copilot-ai` | Purple | GitHub Copilot topics |
| `github-platform` | Blue | GitHub platform features |
| `ai-ml` | Green | AI / Machine Learning topics |
| `cloud-infra` | Orange / yellow | Cloud and infrastructure |
| `spring-java` | Green / spring | Spring Framework and Java |
| `devops-containers` | Amber | DevOps, Docker, Kubernetes |
| `legacy-modernization` | Red | Legacy system modernization |
| `general` | Green → purple → blue | Default / uncategorized |

If no category is set or the value is unrecognized, the theme falls back to `general`.

When adding a new category:
1. Add the gradient definition in `_sass/workshop-theme/_variables.scss`.
2. Add the category selector in `_sass/workshop-theme/_components.scss`.
3. Update this list and the consumer-repo documentation.

---

## 8. JavaScript Features (`assets/js/workshop.js`)

The single JS bundle provides these features — all are auto-initialized on `DOMContentLoaded`:

| Feature | Behavior |
|---|---|
| **Copy buttons** | Automatically added to every `<pre><code>` block. Copies code content to clipboard. |
| **Progress tracking** | Stores completed steps in `localStorage`. Updates sidebar checkmarks. |
| **Scroll-spy TOC** | Uses `IntersectionObserver` to highlight the current section in the TOC. |
| **Keyboard navigation** | `←` / `→` arrow keys navigate to previous / next step. |
| **Back-to-top button** | Floating button appears on scroll, smooth-scrolls to top. |
| **Callout transform** | Converts GitHub-flavored blockquote syntax (`[!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!IMPORTANT]`, `[!CAUTION]`) into styled callout boxes. |
| **Heading dedup** | Removes the first `<h1>` / `<h2>` in step content if it duplicates the step title (avoids double headings). |
| **Code language labels** | Reads the `language-*` class on `<code>` elements and renders a label badge (e.g., "bash", "python"). |
| **Theme toggle** | Switches between light and dark mode. Respects `prefers-color-scheme` on first visit, then persists choice in `localStorage`. |

Do not add inline `<script>` tags. All behavior belongs in `workshop.js`. If you need a new feature, add it as a self-contained function and call it from the `DOMContentLoaded` handler.

---

## 9. Content Guidelines

### Markdown

- Write in **GitHub-Flavored Markdown**.
- Use callout blockquotes for tips, notes, and warnings:

```markdown
> [!TIP]
> Use `gh copilot suggest` for quick CLI help.

> [!NOTE]
> This step requires Node.js 18+.

> [!WARNING]
> This action is irreversible.

> [!IMPORTANT]
> Commit your changes before proceeding.

> [!CAUTION]
> Running this in production will delete all data.
```

- Use **fenced code blocks with language identifiers** so the theme auto-generates language labels:

````markdown
```bash
gh repo clone shinyay/workshop-pages-theme
```

```python
def hello():
    print("Hello, workshop!")
```

```yaml
remote_theme: shinyay/workshop-pages-theme
```
````

### Step Discovery

Steps are auto-discovered by the theme with this Liquid filter chain:

```liquid
{% assign steps = site.pages | where: "layout", "step" | sort: "step_number" %}
```

Cheatsheets are similarly discovered:

```liquid
{% assign cheatsheets = site.pages | where: "layout", "cheatsheet" | sort: "parent_step" %}
```

Do not hard-code step lists — the theme builds navigation dynamically.

---

## 10. Directory Structure Convention

Consumer workshop repositories must follow this structure:

```
workshop-repo/
├── _config.yml                          # Theme config (see §6)
├── index.md                             # layout: workshop — landing page
├── setup.md                             # layout: step, step_number: 0
├── workshop/
│   ├── level-1/
│   │   ├── README.md                    # layout: step, step_number: 1
│   │   ├── CHEATSHEET.md               # layout: cheatsheet, parent_step: 1
│   │   └── sample-app/                  # Sample code for this step
│   ├── level-2/
│   │   ├── README.md                    # layout: step, step_number: 2
│   │   ├── CHEATSHEET.md               # layout: cheatsheet, parent_step: 2
│   │   └── sample-app/
│   └── level-N/
│       └── ...
├── .github/
│   ├── workflows/
│   │   └── deploy-pages.yml            # GitHub Pages deployment
│   └── copilot-instructions.md         # Copilot instructions for this repo
└── assets/                              # Optional repo-specific assets
    └── images/
```

- Each `level-*` directory corresponds to one step.
- `README.md` is the step content; `CHEATSHEET.md` is the reference companion.
- `sample-app/` directories hold runnable code for that step — they are **not** processed by Jekyll.
- `step_number` values must be unique, contiguous integers starting from `0`.

---

## 11. Deployment

Consumer repos deploy to GitHub Pages via GitHub Actions. Use this workflow:

```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/jekyll-build-pages@v1
        with:
          source: ./
          destination: ./_site
      - uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Requirements

- GitHub Pages must be enabled in the repository settings with **Source: GitHub Actions**.
- The workflow triggers on push to `main` — do not use the legacy "Deploy from branch" mode.

---

## 12. Testing

### Local Development

The theme repo includes a `Gemfile` for local testing:

```bash
bundle install
bundle exec jekyll serve
```

This serves the theme's test site (typically from a `docs/` or test fixture directory) at `http://localhost:4000`.

### CI

- The theme's CI workflow lives at `.github/workflows/validate-theme.yml`.
- It validates SCSS compilation, HTML output, and layout rendering.
- Run CI checks locally before pushing changes to the theme.

### Scaffolding

- Templates in `_templates/` provide starter files for new workshops.
- Use them when creating a new consumer repo to ensure correct front matter and structure.

---

## 13. Visual Design Features

The theme includes these visual details — preserve them when editing styles:

| Feature | Implementation |
|---|---|
| **Animated gradient top bar** | Workshop header has a `linear-gradient` animation (green → purple → blue, or per-category). Defined in `_header.scss`. |
| **Copilot sparkle SVGs** | 5 animated star/sparkle SVGs in `workshop-header.html`. Use CSS `@keyframes` for twinkling. |
| **Step-number badges** | Circular badges with `conic-gradient` ring showing progress. Defined in `_components.scss`. |
| **Code language labels** | Small label in the top-right of code blocks. Added by JS, styled in `_content.scss`. |
| **Dot-grid background** | Subtle repeating dot pattern on the page background. Defined in `_base.scss`. |
| **Content entrance animations** | Elements fade-in + slide-up on page load. Uses `@keyframes fadeInUp`. |
| **Sidebar hover borders** | Left-border color transition on sidebar items. Defined in `_sidebar.scss`. |
| **Footer gradient separator** | Thin gradient line above the footer. Defined in `_footer.scss`. |
| **CTA glow pulse** | "Start Workshop" button has a pulsing glow animation. Defined in `_components.scss`. |
| **Frosted glass header** | Header uses `backdrop-filter: blur()` for glass effect. Hamburger icon animates to ✕. |
| **Reduced-motion support** | All animations are wrapped in `@media (prefers-reduced-motion: no-preference)`. Always maintain this. |

When adding new animations, always wrap them in a `prefers-reduced-motion` media query:

```scss
@media (prefers-reduced-motion: no-preference) {
  .my-element {
    animation: myAnimation 0.3s ease;
  }
}
```

---

## Quick Reference: Common Tasks

### Adding a new step to a consumer workshop

1. Create `workshop/level-N/README.md` with correct front matter (see §5).
2. Optionally create `workshop/level-N/CHEATSHEET.md`.
3. Ensure `step_number` is unique and contiguous.
4. The sidebar and navigation update automatically.

### Adding a new SCSS partial to the theme

1. Create `_sass/workshop-theme/_my-partial.scss`.
2. Add `@import "workshop-theme/my-partial";` to `_sass/workshop-theme.scss`.
3. Use existing `$gh-*` variables — never introduce new hard-coded colors.

### Adding a new include to the theme

1. Create `_includes/my-include.html`.
2. Add a Liquid comment at the top documenting parameters.
3. Reference it in the appropriate layout with `{% include my-include.html %}`.

### Modifying the JS bundle

1. Edit `assets/js/workshop.js`.
2. Add new features as self-contained functions.
3. Call them from the `DOMContentLoaded` event handler.
4. Do not add external JS dependencies — the theme is zero-dependency.
