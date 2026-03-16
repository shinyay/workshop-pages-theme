# 🎨 Workshop Pages Theme

A GitHub-branded Jekyll remote theme for workshop documentation. Gives any workshop repository an instant, polished GitHub Pages site with dark/light mode, step navigation, and responsive design.

> Built with [Primer CSS](https://primer.style) (GitHub's own design system) and GitHub's official brand colors.

## ✨ Features

- 🎨 **GitHub Branding** — Official colors, Primer CSS, authentic look & feel
- 🌓 **Dark/Light Mode** — Automatic + manual toggle, persisted in localStorage
- 📱 **Fully Responsive** — Desktop, tablet, and mobile layouts with sidebar slide-out
- 📋 **Step Navigation** — Auto-discovered from your step files, with progress bar
- ⬅️➡️ **Prev/Next** — Navigate between steps with one click
- 📑 **Auto TOC** — Table of contents generated from H2/H3 headings
- 📝 **GitHub Callouts** — Supports `[!NOTE]`, `[!TIP]`, `[!WARNING]` syntax
- 🏷️ **Workshop Badges** — Difficulty, language, duration, step count
- 🏠 **Hub Link** — Every workshop links back to the [Workshop Hub](https://shinyay.github.io/awesome-shinyay-workshop/)
- 🔧 **Customizable** — Override any include, layout, or SCSS variable

---

## 🚀 Quick Start

### 1. Single-Page Workshop (simplest)

Add `_config.yml` to your workshop repo:

```yaml
remote_theme: shinyay/workshop-pages-theme
title: "My Awesome Workshop"
description: "Learn X by building Y"
plugins:
  - jekyll-remote-theme

workshop:
  category: "copilot-ai"
  language: "Python"
  difficulty: "Beginner"
  duration: "60 min"
  prerequisites:
    - "GitHub account with Copilot access"
    - "Python 3.10+"
```

Create `index.md`:

```markdown
---
layout: workshop
---

## Overview

Welcome to this workshop! You will learn...

## Getting Started

First, clone the repository...
```

Enable GitHub Pages (Settings → Pages → Source: GitHub Actions) and you're done!

### 2. Multi-Page Workshop (with steps)

Same `_config.yml` as above, plus create step files:

```
my-workshop/
├── _config.yml
├── index.md              # layout: workshop (overview page)
└── steps/
    ├── 01-setup.md       # layout: step, step_number: 1
    ├── 02-build.md       # layout: step, step_number: 2
    ├── 03-test.md        # layout: step, step_number: 3
    └── 04-deploy.md      # layout: step, step_number: 4
```

Each step file needs front matter:

```markdown
---
layout: step
title: "Set Up Environment"
step_number: 1
---

## Install Dependencies

Run the following command...
```

The theme automatically discovers steps and builds the sidebar navigation + progress bar.

---

## ⚙️ Configuration Reference

All workshop-specific settings go under the `workshop:` key:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `category` | string | `"general"` | Category ID (matches Workshop Hub) |
| `language` | string | `null` | Primary programming language |
| `difficulty` | string | `"Beginner"` | `Beginner` / `Intermediate` / `Advanced` |
| `duration` | string | `null` | Estimated time (e.g. `"60 min"`) |
| `prerequisites` | list | `[]` | List of prerequisite strings |
| `hub_url` | string | Workshop Hub URL | Link to the Workshop Hub |
| `repo_url` | string | auto-detected | GitHub repository URL |
| `show_toc` | boolean | `true` | Show auto-generated TOC |
| `show_progress` | boolean | `true` | Show step progress bar |

### Category IDs

| ID | Description | Accent Color |
|----|-------------|--------------|
| `copilot-ai` | GitHub Copilot & AI Tools | 🟣 Purple |
| `github-platform` | GitHub Platform Features | 🔵 Blue |
| `ai-ml` | AI & Machine Learning | 🟢 Green |
| `cloud-infra` | Cloud & Infrastructure | 🟡 Yellow |
| `spring-java` | Spring / Java / Kotlin | 🟢 Bright Green |
| `legacy-modernization` | Legacy Modernization | 🔴 Red |
| `devops-containers` | DevOps & Containers | 🟤 Brown |

---

## 🎨 Layouts

### `workshop` layout

The main overview page for your workshop. Shows:
- Workshop header card (title, description, badges)
- Prerequisites checklist
- Your content
- Sidebar with step list (if steps exist)
- Table of contents

### `step` layout

For individual step pages. Shows:
- Step number badge + title
- Sidebar with step navigation + progress bar
- Your content
- Previous / Next step navigation
- Table of contents

### `default` layout

Base layout with header and footer only. Use for custom pages.

---

## 📝 Callout Syntax

Use GitHub-flavored callout syntax in your Markdown:

```markdown
> [!NOTE]
> Important information for the user.

> [!TIP]
> Helpful advice for a better experience.

> [!WARNING]
> Critical information requiring user attention.

> [!IMPORTANT]
> Key information users need to know.

> [!CAUTION]
> Potential negative consequences of an action.
```

---

## 🔧 Customization

### Override Includes

Create the same file path in your repo to override any include:

```
my-workshop/
├── _includes/
│   └── head-custom.html    # Add custom analytics, fonts, etc.
```

### Custom CSS

Add custom styles via `_includes/head-custom.html`:

```html
<style>
  .workshop-header {
    border-top-color: #ff6600 !important;
  }
</style>
```

### Override SCSS Variables

Create `assets/css/style.scss` in your repo:

```scss
---
---
$brand-primary: #ff6600;
@import "workshop-theme";
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by [shinyay](https://github.com/shinyay) using GitHub's design language.
