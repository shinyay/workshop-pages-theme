#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────────
# Workshop Pages Setup Script
# Scaffolds a complete GitHub Pages workshop site
# using the shinyay/workshop-pages-theme layout.
# ─────────────────────────────────────────────────

readonly CATEGORIES=(
  "copilot-ai"
  "github-platform"
  "ai-ml"
  "cloud-infra"
  "spring-java"
  "devops-containers"
  "legacy-modernization"
  "general"
)

readonly DIFFICULTIES=(
  "Beginner"
  "Intermediate"
  "Advanced"
)

# ── Helpers ──────────────────────────────────────

print_banner() {
  cat <<'BANNER'
╔══════════════════════════════════════════════════╗
║  🎓 Workshop Pages Setup                        ║
║  Powered by shinyay/workshop-pages-theme         ║
╚══════════════════════════════════════════════════╝
BANNER
  echo ""
}

prompt() {
  local var_name="$1"
  local message="$2"
  local default="${3:-}"
  local value

  if [[ -n "$default" ]]; then
    read -rp "$message [$default]: " value
    value="${value:-$default}"
  else
    read -rp "$message: " value
  fi

  printf -v "$var_name" '%s' "$value"
}

prompt_required() {
  local var_name="$1"
  local message="$2"
  local value=""

  while [[ -z "$value" ]]; do
    read -rp "$message: " value
    if [[ -z "$value" ]]; then
      echo "  ⚠  This field is required."
    fi
  done

  printf -v "$var_name" '%s' "$value"
}

write_file() {
  local filepath="$1"
  local content="$2"

  if [[ -f "$filepath" ]]; then
    echo "  ⚠  Skipping $filepath (already exists)"
    return 1
  fi

  mkdir -p "$(dirname "$filepath")"
  printf '%s\n' "$content" > "$filepath"
  return 0
}

# ── Collect inputs ───────────────────────────────

collect_inputs() {
  print_banner

  prompt_required WORKSHOP_TITLE "Workshop title"

  prompt WORKSHOP_DESC "Description" "A hands-on workshop"

  echo ""
  echo "Categories:"
  echo "  1) copilot-ai"
  echo "  2) github-platform"
  echo "  3) ai-ml"
  echo "  4) cloud-infra"
  echo "  5) spring-java"
  echo "  6) devops-containers"
  echo "  7) legacy-modernization"
  echo "  8) general"
  prompt CATEGORY_NUM "Category number" "8"
  # Validate range
  if ! [[ "$CATEGORY_NUM" =~ ^[1-8]$ ]]; then
    echo "  ⚠  Invalid category number, defaulting to 8 (general)"
    CATEGORY_NUM=8
  fi
  WORKSHOP_CATEGORY="${CATEGORIES[$((CATEGORY_NUM - 1))]}"
  echo ""

  prompt WORKSHOP_LANGUAGE "Language (e.g. Python, Java)" ""

  echo ""
  echo "Difficulty:"
  echo "  1) Beginner"
  echo "  2) Intermediate"
  echo "  3) Advanced"
  prompt DIFFICULTY_NUM "Difficulty number" "1"
  if ! [[ "$DIFFICULTY_NUM" =~ ^[1-3]$ ]]; then
    echo "  ⚠  Invalid difficulty number, defaulting to 1 (Beginner)"
    DIFFICULTY_NUM=1
  fi
  WORKSHOP_DIFFICULTY="${DIFFICULTIES[$((DIFFICULTY_NUM - 1))]}"
  echo ""

  prompt WORKSHOP_DURATION "Duration" "1-2 hours"

  prompt WORKSHOP_STEPS "Number of steps" "4"
  if ! [[ "$WORKSHOP_STEPS" =~ ^[1-9][0-9]*$ ]]; then
    echo "  ⚠  Invalid number, defaulting to 4"
    WORKSHOP_STEPS=4
  fi

  echo ""
}

# ── File generators ──────────────────────────────

generate_config() {
  local lang_line=""
  if [[ -n "$WORKSHOP_LANGUAGE" ]]; then
    lang_line="language: \"$WORKSHOP_LANGUAGE\""
  else
    lang_line="language: \"\""
  fi

  cat <<EOF
# ─────────────────────────────────────────────────
# Workshop Configuration
# Theme: shinyay/workshop-pages-theme
# ─────────────────────────────────────────────────

remote_theme: shinyay/workshop-pages-theme

title: "$WORKSHOP_TITLE"
description: "$WORKSHOP_DESC"
category: "$WORKSHOP_CATEGORY"
$lang_line
difficulty: "$WORKSHOP_DIFFICULTY"
duration: "$WORKSHOP_DURATION"
steps: $WORKSHOP_STEPS

# GitHub Pages
baseurl: ""  # Set to "/<repo-name>" if hosted under a sub-path

# Optional metadata
author: ""
repository: ""
EOF
}

generate_index() {
  cat <<EOF
---
layout: default
title: "$WORKSHOP_TITLE"
---

# $WORKSHOP_TITLE

$WORKSHOP_DESC

## What You Will Learn

- Objective 1
- Objective 2
- Objective 3

## Prerequisites

- Prerequisite 1
- Prerequisite 2

## Workshop Steps

| Step | Topic | Difficulty |
|------|-------|------------|
EOF

  local i
  for i in $(seq 1 "$WORKSHOP_STEPS"); do
    echo "| Level $i | [Step $i — Title](workshop/level-$i/) | $WORKSHOP_DIFFICULTY |"
  done

  cat <<'EOF'

## Getting Started

Head over to the [Setup Guide](setup.md) to prepare your environment,
then start with **Level 1**.
EOF
}

generate_setup() {
  cat <<EOF
---
layout: default
title: "Setup Guide"
---

# Setup Guide

Follow these steps to prepare your environment for the workshop.

## 1. Prerequisites

- [ ] A GitHub account
- [ ] Git installed locally
- [ ] A code editor (VS Code recommended)

## 2. Clone the Repository

\`\`\`bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
\`\`\`

## 3. Environment Setup

> Add tool-specific setup instructions here.

## 4. Verify

Run the following command to verify everything is working:

\`\`\`bash
echo "Ready to go!"
\`\`\`

---

Once your environment is ready, proceed to
[Level 1](workshop/level-1/).
EOF
}

generate_step_readme() {
  local step_num="$1"
  cat <<EOF
---
layout: default
title: "Level $step_num"
step: $step_num
---

# Level $step_num — Title

## Objective

Describe what the learner will accomplish in this step.

## Instructions

1. First instruction
2. Second instruction
3. Third instruction

## Validation

Verify your work:

\`\`\`bash
# Add a validation command here
\`\`\`

## Key Takeaways

- Takeaway 1
- Takeaway 2

---
EOF

  if [[ "$step_num" -lt "$WORKSHOP_STEPS" ]]; then
    echo ""
    echo "Next: [Level $((step_num + 1))](../level-$((step_num + 1))/)"
  else
    echo ""
    echo "🎉 Congratulations! You have completed the workshop."
  fi
}

generate_step_cheatsheet() {
  local step_num="$1"
  cat <<EOF
---
layout: default
title: "Level $step_num — Cheatsheet"
step: $step_num
type: cheatsheet
---

# Level $step_num — Cheatsheet

## Quick Reference

| Command / Concept | Description |
|--------------------|-------------|
| \`example\`         | What it does |

## Common Patterns

\`\`\`bash
# Add commonly used snippets here
\`\`\`

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Something fails | Try this fix |
EOF
}

generate_workflow() {
  cat <<'EOF'
# ─────────────────────────────────────────────────
# Deploy Workshop to GitHub Pages
# ─────────────────────────────────────────────────
name: Deploy Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

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
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Build with Jekyll
        uses: actions/jekyll-build-pages@v1
        with:
          source: ./
          destination: ./_site

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
EOF
}

generate_copilot_instructions() {
  cat <<EOF
# Copilot Instructions — Workshop Content

This repository is a GitHub Pages workshop powered by the
**shinyay/workshop-pages-theme** remote Jekyll theme.

## Repository Structure

- \`_config.yml\` — Workshop metadata (title, category, difficulty, etc.)
- \`index.md\` — Landing page with overview and step table
- \`setup.md\` — Environment setup guide for participants
- \`workshop/level-{N}/README.md\` — Step content (one directory per step)
- \`workshop/level-{N}/CHEATSHEET.md\` — Quick-reference cheatsheet per step

## Content Conventions

- Each step directory is named \`level-{N}\` (1-based).
- Front matter must include \`layout: default\`, \`title\`, and \`step\` number.
- Cheatsheets add \`type: cheatsheet\` to front matter.
- Use fenced code blocks with language hints for all code samples.
- Keep each step focused on a single learning objective.
- End each step with a "Validation" section so learners can verify progress.

## Category Values

Valid values for \`category\` in \`_config.yml\`:
copilot-ai | github-platform | ai-ml | cloud-infra |
spring-java | devops-containers | legacy-modernization | general

## Difficulty Values

Beginner | Intermediate | Advanced
EOF
}

# ── Main ─────────────────────────────────────────

main() {
  collect_inputs

  echo "📁 Scaffolding workshop files..."
  echo ""

  local created_files=()
  local skipped=0

  # _config.yml
  if write_file "_config.yml" "$(generate_config)"; then
    created_files+=("_config.yml")
  else
    ((skipped++)) || true
  fi

  # index.md
  if write_file "index.md" "$(generate_index)"; then
    created_files+=("index.md")
  else
    ((skipped++)) || true
  fi

  # setup.md
  if write_file "setup.md" "$(generate_setup)"; then
    created_files+=("setup.md")
  else
    ((skipped++)) || true
  fi

  # Step files
  local i
  for i in $(seq 1 "$WORKSHOP_STEPS"); do
    if write_file "workshop/level-$i/README.md" "$(generate_step_readme "$i")"; then
      created_files+=("workshop/level-$i/README.md")
    else
      ((skipped++)) || true
    fi

    if write_file "workshop/level-$i/CHEATSHEET.md" "$(generate_step_cheatsheet "$i")"; then
      created_files+=("workshop/level-$i/CHEATSHEET.md")
    else
      ((skipped++)) || true
    fi
  done

  # Workflow
  if write_file ".github/workflows/deploy-pages.yml" "$(generate_workflow)"; then
    created_files+=(".github/workflows/deploy-pages.yml")
  else
    ((skipped++)) || true
  fi

  # Copilot instructions
  if write_file ".github/copilot-instructions.md" "$(generate_copilot_instructions)"; then
    created_files+=(".github/copilot-instructions.md")
  else
    ((skipped++)) || true
  fi

  # ── Summary ──────────────────────────────────
  echo ""
  echo "✅ Workshop scaffolded successfully!"
  echo ""
  echo "Files created:"
  for f in "${created_files[@]}"; do
    echo "  $f"
  done

  if [[ "$skipped" -gt 0 ]]; then
    echo ""
    echo "  ($skipped file(s) skipped — already existed)"
  fi

  cat <<'EOF'

Next steps:
  1. Edit _config.yml to customize your workshop metadata
  2. Write your workshop content in the step files
  3. Commit and push to GitHub
  4. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
  5. Your workshop will be live at https://{username}.github.io/{repo-name}/
EOF
}

main "$@"
