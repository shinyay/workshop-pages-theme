# 🎨 Workshop Pages Theme

A GitHub-branded Jekyll remote theme for workshop documentation. Gives any workshop repository an instant, polished GitHub Pages site with dark/light mode, step navigation, and responsive design.

> Built with [Primer CSS](https://primer.style) (GitHub's own design system) and GitHub's official brand colors.

## ✨ Features

- 🎨 **GitHub Branding** — Official colors, Primer CSS, authentic look & feel
- 🌓 **Dark/Light Mode** — Automatic + manual toggle, persisted in localStorage
- 📱 **Fully Responsive** — Desktop, tablet, and mobile layouts with sidebar slide-out
- 📋 **Step Navigation** — Auto-discovered from your step files, with progress bar
- ⬅️➡️ **Prev/Next + Keyboard** — Navigate steps with click or ← → arrow keys
- 📑 **Auto TOC with Scroll Spy** — Table of contents highlights current section as you scroll
- 📝 **GitHub Callouts** — Supports `[!NOTE]`, `[!TIP]`, `[!WARNING]` syntax
- 🏷️ **Workshop Badges** — Difficulty, language, duration, step count
- 📋 **Copy Buttons** — One-click copy on all code blocks with "Copied!" feedback
- 🔝 **Back to Top** — Floating button appears on long pages
- 📊 **Progress Tracking** — Sidebar tracks visited steps via localStorage
- ✅ **Step Completion** — Sidebar dots turn green as you complete steps
- 🍞 **Breadcrumbs** — Clear navigation trail (Hub → Workshop → Level)
- 🖨️ **Print Stylesheet** — Clean output for offline reading
- ♿ **Accessible** — Skip link, `aria-current`, focus rings, `prefers-reduced-motion`
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
├── setup.md              # layout: step, step_number: 0
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
permalink: /steps/1/
---

## Install Dependencies

Run the following command...
```

The theme automatically discovers steps and builds the sidebar navigation + progress bar.

> [!TIP]
> See the `_templates/` directory for complete templates with all available front matter fields.

---

## 🤖 Generation Rules (Automated Workshop Setup)

Three ways to create new workshop sites that use this theme:

### Option 1: Copilot CLI Extension (Recommended)

If you have this repo cloned and use Copilot CLI, the **`workshop-generator`** extension provides three tools:

| Tool | What it does |
|------|-------------|
| `workshop_scaffold` | Creates complete workshop setup (config, pages, workflow) |
| `workshop_add_step` | Adds a new step with README + Cheatsheet |
| `workshop_validate` | Checks structure, front matter, and step ordering |

The extension also auto-detects workshop repos and injects theme conventions into your Copilot sessions.

### Option 2: Generator Script

```bash
curl -sL https://raw.githubusercontent.com/shinyay/workshop-pages-theme/main/bin/setup-workshop.sh | bash
```

Interactive CLI that prompts for title, category, language, difficulty, duration, and step count.

### Option 3: Custom Instructions for Copilot

Copy `_templates/copilot-instructions.md.template` to your workshop repo as `.github/copilot-instructions.md`. This teaches Copilot all the theme conventions so it can help you create and maintain content.

---

## 🛠️ Local Development

Test the theme locally before deploying:

```bash
# Clone the theme
git clone https://github.com/shinyay/workshop-pages-theme.git
cd workshop-pages-theme

# Install Ruby dependencies
bundle install

# Serve locally (from your workshop repo, not the theme repo)
cd /path/to/your-workshop-repo
bundle exec jekyll serve
```

Your workshop repo needs a `Gemfile`:

```ruby
source "https://rubygems.org"
gem "jekyll", "~> 4.3"
gem "jekyll-remote-theme"
gem "webrick"
```

---

## ⚙️ Configuration Reference

All workshop-specific settings go under the `workshop:` key:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `category` | string | `"general"` | Category ID (see table below) |
| `language` | string | `null` | Primary programming language |
| `difficulty` | string | `"Beginner"` | `Beginner` / `Intermediate` / `Advanced` |
| `duration` | string | `null` | Estimated time (e.g. `"60 min"`) |
| `prerequisites` | list | `[]` | List of prerequisite strings |
| `hub_url` | string | Workshop Hub URL | Link to the Workshop Hub |
| `repo_url` | string | auto-detected | GitHub repository URL |
| `show_toc` | boolean | `true` | Show auto-generated TOC |
| `show_progress` | boolean | `true` | Show step progress bar |

### Category IDs & Accent Colors

| ID | Description | Accent Color |
|----|-------------|--------------|
| `copilot-ai` | GitHub Copilot & AI Tools | 🟣 Purple (`#8534F3`) |
| `github-platform` | GitHub Platform Features | 🔵 Blue (`#0969da`) |
| `ai-ml` | AI & Machine Learning | 🟢 Green (`#1a7f37`) |
| `cloud-infra` | Cloud & Infrastructure | 🟡 Yellow (`#bf8700`) |
| `spring-java` | Spring / Java / Kotlin | 🟢 Bright Green (`#0FBF3E`) |
| `legacy-modernization` | Legacy Modernization | 🔴 Red (`#da3633`) |
| `devops-containers` | DevOps & Containers | 🟤 Brown (`#8a6534`) |
| `general` | Default (no specific category) | 🟢 Green (`#0FBF3E`) |

---

## 🎨 Layouts

### `workshop` layout

The main overview page for your workshop. Shows:
- Workshop header card (title, description, badges)
- Prerequisites checklist
- Sidebar with step list (if steps exist)
- Your content with table of contents

### `step` layout

For individual step pages. Front matter fields:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Step title (displayed in sidebar and header) |
| `step_number` | ✅ | Integer for ordering (0 = setup page) |
| `permalink` | ✅ | URL path (e.g., `/steps/1/`) |
| `duration` | ❌ | Estimated time for this step |

### `cheatsheet` layout

Quick reference pages linked to a step. Front matter fields:

| Field | Required | Description |
|-------|----------|-------------|
| `title` | ✅ | Cheatsheet title |
| `parent_step` | ✅ | Links back to the parent step number |
| `permalink` | ✅ | URL path (e.g., `/cheatsheet/1/`) |

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

#### `head-custom.html` — Custom Head Content

This empty include is a hook for adding custom content to the `<head>` tag. Common uses:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- Custom fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">

<!-- Custom inline styles -->
<style>
  .workshop-header::before { background: #ff6600 !important; }
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

### Available CSS Custom Properties

The theme exposes these CSS custom properties that can be overridden per-theme:

| Property | Light Mode | Dark Mode | Description |
|----------|-----------|-----------|-------------|
| `--bg-primary` | `#ffffff` | `#0d1117` | Page background |
| `--bg-secondary` | `#f6f8fa` | `#161b22` | Card/sidebar background |
| `--text-primary` | `#1f2328` | `#e6edf3` | Main text color |
| `--text-link` | `#0969da` | `#58a6ff` | Link color |
| `--border-primary` | `#d1d9e0` | `#30363d` | Primary border |
| `--gh-green` | `#0FBF3E` | `#0FBF3E` | Primary brand green |
| `--gh-purple` | `#8534F3` | `#8534F3` | Copilot purple |

---

## 📋 Templates

The `_templates/` directory contains ready-to-copy templates:

- **`step.md.template`** — Step page with all front matter fields and exercise structure
- **`cheatsheet.md.template`** — Quick reference page with command tables
- **`_config.yml.template`** — Complete configuration with all options documented

Copy a template to your workshop repo and customize it.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

Built with ❤️ by [shinyay](https://github.com/shinyay) using GitHub's design language.
