/**
 * Workshop Generator — Copilot CLI Extension
 *
 * Provides tools and hooks for scaffolding, extending, and validating
 * workshop GitHub Pages sites built on shinyay/workshop-pages-theme.
 */

import { approveAll } from "@github/copilot-sdk";
import { joinSession } from "@github/copilot-sdk/extension";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Safely read a file; returns null on failure. */
function safeRead(filePath) {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

/** Write a file, creating parent directories as needed. */
function writeFile(filePath, content) {
  mkdirSync(resolve(filePath, ".."), { recursive: true });
  writeFileSync(filePath, content, "utf-8");
}

/** Extract a YAML front-matter field value (simple single-line match). */
function frontMatterValue(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match ? match[1].trim().replace(/^["']|["']$/g, "") : null;
}

// ---------------------------------------------------------------------------
// Content generators
// ---------------------------------------------------------------------------

function generateConfigYml({ title, description, category, language, difficulty, duration }) {
  return `remote_theme: shinyay/workshop-pages-theme
title: "${title}"
description: "${description || ""}"
author: "shinyay"
plugins:
  - jekyll-remote-theme
workshop:
  category: "${category}"
  language: "${language || ""}"
  difficulty: "${difficulty || ""}"
  duration: "${duration || ""}"
  hub_url: "https://shinyay.github.io/awesome-shinyay-workshop/"
  show_toc: true
  show_progress: true
defaults:
  - scope:
      path: ""
    values:
      layout: "workshop"
`;
}

function generateIndexMd({ title, description, stepCount }) {
  const rows = [`| [Setup](setup/) | Setup & Installation | 10-15 min |`];
  for (let i = 1; i <= stepCount; i++) {
    rows.push(`| [${i}](steps/${i}/) | Step ${i} | — |`);
  }

  return `---
layout: workshop
---

## 🎓 Workshop Overview

${description || title}

## Curriculum

| Level | Title | Time |
|-------|-------|------|
${rows.join("\n")}

👉 **[Start the Setup →](setup/)**
`;
}

function generateSetupMd() {
  return `---
layout: step
title: "Setup & Installation"
step_number: 0
permalink: /setup/
---

## Prerequisites

<!-- Add your prerequisites here -->

## Installation

<!-- Add installation steps here -->
`;
}

function generateStepReadme(stepNumber, title) {
  return `---
layout: step
title: "${title || `Step ${stepNumber}`}"
step_number: ${stepNumber}
permalink: /steps/${stepNumber}/
---

## What You'll Learn

<!-- Add learning objectives -->

## Exercises

<!-- Add exercises here -->

## Summary

<!-- Add summary -->
`;
}

function generateCheatsheet(stepNumber) {
  return `---
layout: cheatsheet
title: "Level ${stepNumber} — Quick Reference"
parent_step: ${stepNumber}
permalink: /cheatsheet/${stepNumber}/
---

## Commands

| Command | Description |
|---------|-------------|
| \`example\` | Description |
`;
}

function generateDeployWorkflow() {
  // Use a literal string to preserve ${{ }} expressions
  return [
    "name: Deploy Jekyll site to Pages",
    "",
    "on:",
    "  push:",
    '    branches: ["main"]',
    "  workflow_dispatch:",
    "",
    "permissions:",
    "  contents: read",
    "  pages: write",
    "  id-token: write",
    "",
    "concurrency:",
    '  group: "pages"',
    "  cancel-in-progress: false",
    "",
    "jobs:",
    "  build:",
    "    runs-on: ubuntu-latest",
    "    steps:",
    "      - name: Checkout",
    "        uses: actions/checkout@v4",
    "      - name: Setup Pages",
    "        uses: actions/configure-pages@v5",
    "      - name: Build with Jekyll",
    "        uses: actions/jekyll-build-pages@v1",
    "        with:",
    "          source: ./",
    "          destination: ./_site",
    "      - name: Upload artifact",
    "        uses: actions/upload-pages-artifact@v3",
    "",
    "  deploy:",
    "    environment:",
    "      name: github-pages",
    "      url: ${{ steps.deployment.outputs.page_url }}",
    "    runs-on: ubuntu-latest",
    "    needs: build",
    "    steps:",
    "      - name: Deploy to GitHub Pages",
    "        id: deployment",
    "        uses: actions/deploy-pages@v4",
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Tool: workshop_scaffold
// ---------------------------------------------------------------------------

const workshopScaffoldTool = {
  name: "workshop_scaffold",
  description:
    "Scaffolds a complete workshop GitHub Pages setup in the current directory. " +
    "Creates _config.yml, index.md, setup.md, step files, cheatsheet files, " +
    "GitHub Actions workflow, and copilot-instructions.",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Workshop title (e.g., 'Getting Started with Copilot CLI')",
      },
      description: {
        type: "string",
        description: "Workshop description (1-2 sentences)",
      },
      category: {
        type: "string",
        description: "Workshop category",
        enum: [
          "copilot-ai",
          "github-platform",
          "ai-ml",
          "cloud-infra",
          "spring-java",
          "devops-containers",
          "legacy-modernization",
          "general",
        ],
      },
      language: {
        type: "string",
        description: "Primary programming language (e.g., Python, TypeScript)",
      },
      difficulty: {
        type: "string",
        description: "Difficulty level",
        enum: ["Beginner", "Intermediate", "Advanced"],
      },
      duration: {
        type: "string",
        description: "Estimated duration (e.g., '2-3 hours')",
      },
      step_count: {
        type: "integer",
        description: "Number of workshop steps/levels (1-20)",
        minimum: 1,
        maximum: 20,
      },
    },
    required: ["title", "category", "step_count"],
  },

  async execute({ title, description, category, language, difficulty, duration, step_count }) {
    const cwd = process.cwd();
    const created = [];

    // _config.yml
    const configPath = join(cwd, "_config.yml");
    writeFile(configPath, generateConfigYml({ title, description, category, language, difficulty, duration }));
    created.push("_config.yml");

    // index.md
    const indexPath = join(cwd, "index.md");
    writeFile(indexPath, generateIndexMd({ title, description, stepCount: step_count }));
    created.push("index.md");

    // setup.md
    const setupPath = join(cwd, "setup.md");
    writeFile(setupPath, generateSetupMd());
    created.push("setup.md");

    // Step & cheatsheet files
    for (let i = 1; i <= step_count; i++) {
      const stepDir = join(cwd, "workshop", `level-${i}`);
      const readmePath = join(stepDir, "README.md");
      writeFile(readmePath, generateStepReadme(i));
      created.push(`workshop/level-${i}/README.md`);

      const cheatPath = join(stepDir, "CHEATSHEET.md");
      writeFile(cheatPath, generateCheatsheet(i));
      created.push(`workshop/level-${i}/CHEATSHEET.md`);
    }

    // GitHub Actions workflow
    const workflowPath = join(cwd, ".github", "workflows", "deploy-pages.yml");
    writeFile(workflowPath, generateDeployWorkflow());
    created.push(".github/workflows/deploy-pages.yml");

    return `✅ Workshop scaffolded successfully!\n\nFiles created (${created.length}):\n${created.map((f) => `  • ${f}`).join("\n")}`;
  },
};

// ---------------------------------------------------------------------------
// Tool: workshop_add_step
// ---------------------------------------------------------------------------

const workshopAddStepTool = {
  name: "workshop_add_step",
  description:
    "Adds a new step (level) to an existing workshop. " +
    "Creates README.md and CHEATSHEET.md with correct front matter.",
  parameters: {
    type: "object",
    properties: {
      step_number: {
        type: "integer",
        description: "Step number for the new level",
        minimum: 1,
      },
      title: {
        type: "string",
        description: "Title of the new step",
      },
    },
    required: ["step_number", "title"],
  },

  async execute({ step_number, title }) {
    const cwd = process.cwd();
    const stepDir = join(cwd, "workshop", `level-${step_number}`);
    const created = [];

    const readmePath = join(stepDir, "README.md");
    writeFile(readmePath, generateStepReadme(step_number, title));
    created.push(`workshop/level-${step_number}/README.md`);

    const cheatPath = join(stepDir, "CHEATSHEET.md");
    writeFile(cheatPath, generateCheatsheet(step_number));
    created.push(`workshop/level-${step_number}/CHEATSHEET.md`);

    return `✅ Step ${step_number} added!\n\nFiles created:\n${created.map((f) => `  • ${f}`).join("\n")}`;
  },
};

// ---------------------------------------------------------------------------
// Tool: workshop_validate
// ---------------------------------------------------------------------------

const workshopValidateTool = {
  name: "workshop_validate",
  description:
    "Validates the workshop setup in the current directory. " +
    "Checks _config.yml, front matter, step ordering, and required files.",
  parameters: {
    type: "object",
    properties: {},
  },

  async execute() {
    const cwd = process.cwd();
    const issues = [];

    // 1. _config.yml
    const configContent = safeRead(join(cwd, "_config.yml"));
    if (!configContent) {
      issues.push("❌ _config.yml is missing");
    } else if (!configContent.includes("remote_theme")) {
      issues.push("❌ _config.yml does not contain a remote_theme setting");
    }

    // 2. index.md
    const indexContent = safeRead(join(cwd, "index.md"));
    if (!indexContent) {
      issues.push("❌ index.md is missing");
    } else if (!frontMatterValue(indexContent, "layout") || frontMatterValue(indexContent, "layout") !== "workshop") {
      issues.push("❌ index.md does not have layout: workshop in front matter");
    }

    // 3. Discover step files
    const stepNumbers = [];
    const workshopDir = join(cwd, "workshop");
    if (existsSync(workshopDir)) {
      for (const entry of readdirSync(workshopDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const match = entry.name.match(/^level-(\d+)$/);
        if (!match) continue;

        const num = parseInt(match[1], 10);
        stepNumbers.push(num);
        const stepReadme = join(workshopDir, entry.name, "README.md");
        const stepContent = safeRead(stepReadme);

        if (!stepContent) {
          issues.push(`❌ workshop/${entry.name}/README.md is missing`);
        } else {
          const layout = frontMatterValue(stepContent, "layout");
          if (layout !== "step") issues.push(`⚠️  workshop/${entry.name}/README.md: expected layout: step, got: ${layout}`);

          const sn = frontMatterValue(stepContent, "step_number");
          if (sn !== String(num)) issues.push(`⚠️  workshop/${entry.name}/README.md: step_number mismatch (expected ${num}, got ${sn})`);

          const permalink = frontMatterValue(stepContent, "permalink");
          if (permalink !== `/steps/${num}/`) issues.push(`⚠️  workshop/${entry.name}/README.md: permalink should be /steps/${num}/`);
        }

        // 4. Cheatsheet
        const cheatPath = join(workshopDir, entry.name, "CHEATSHEET.md");
        const cheatContent = safeRead(cheatPath);
        if (!cheatContent) {
          issues.push(`⚠️  workshop/${entry.name}/CHEATSHEET.md is missing`);
        } else {
          const layout = frontMatterValue(cheatContent, "layout");
          if (layout !== "cheatsheet") issues.push(`⚠️  workshop/${entry.name}/CHEATSHEET.md: expected layout: cheatsheet, got: ${layout}`);

          const ps = frontMatterValue(cheatContent, "parent_step");
          if (ps !== String(num)) issues.push(`⚠️  workshop/${entry.name}/CHEATSHEET.md: parent_step mismatch (expected ${num}, got ${ps})`);

          const permalink = frontMatterValue(cheatContent, "permalink");
          if (permalink !== `/cheatsheet/${num}/`) issues.push(`⚠️  workshop/${entry.name}/CHEATSHEET.md: permalink should be /cheatsheet/${num}/`);
        }
      }
    }

    // 5. Check step ordering (no gaps from 1 to max)
    if (stepNumbers.length > 0) {
      stepNumbers.sort((a, b) => a - b);
      const max = stepNumbers[stepNumbers.length - 1];
      for (let i = 1; i <= max; i++) {
        if (!stepNumbers.includes(i)) {
          issues.push(`❌ Gap in step numbering: level-${i} is missing (steps go up to ${max})`);
        }
      }
    }

    // Also check setup.md
    const setupContent = safeRead(join(cwd, "setup.md"));
    if (!setupContent) {
      issues.push("⚠️  setup.md is missing");
    }

    // 6. Workflow file
    if (!existsSync(join(cwd, ".github", "workflows", "deploy-pages.yml"))) {
      issues.push("❌ .github/workflows/deploy-pages.yml is missing");
    }

    if (issues.length === 0) {
      return "✅ Workshop structure is valid!";
    }

    return `Found ${issues.length} issue(s):\n\n${issues.join("\n")}`;
  },
};

// ---------------------------------------------------------------------------
// Session entry point
// ---------------------------------------------------------------------------

const session = await joinSession();
approveAll(session);

session.log("Workshop Generator extension loaded");

// Register tools
session.tool(workshopScaffoldTool.name, workshopScaffoldTool.description, workshopScaffoldTool.parameters, workshopScaffoldTool.execute);
session.tool(workshopAddStepTool.name, workshopAddStepTool.description, workshopAddStepTool.parameters, workshopAddStepTool.execute);
session.tool(workshopValidateTool.name, workshopValidateTool.description, workshopValidateTool.parameters, workshopValidateTool.execute);

// ---------------------------------------------------------------------------
// Hook: onSessionStart
// ---------------------------------------------------------------------------

session.onSessionStart(async () => {
  const configPath = join(process.cwd(), "_config.yml");
  const configContent = safeRead(configPath);

  if (configContent && configContent.includes("remote_theme: shinyay/workshop-pages-theme")) {
    return {
      additionalContext:
        "This repository uses the shinyay/workshop-pages-theme Jekyll remote theme. " +
        "You have workshop-specific tools available: workshop_scaffold, workshop_add_step, " +
        "workshop_validate. Use these tools when the user asks to set up, modify, or validate " +
        "their workshop GitHub Pages.",
    };
  }

  return {};
});

// ---------------------------------------------------------------------------
// Hook: onUserPromptSubmitted
// ---------------------------------------------------------------------------

session.onUserPromptSubmitted(async ({ userPrompt }) => {
  const keywords = ["workshop", "scaffold", "step", "github pages", "deploy pages", "theme"];
  const lower = userPrompt.toLowerCase();

  if (keywords.some((kw) => lower.includes(kw))) {
    return {
      additionalContext:
        "Workshop theme conventions: Steps use layout:step with step_number and " +
        "permalink:/steps/N/. Cheatsheets use layout:cheatsheet with parent_step. " +
        "Categories: copilot-ai, github-platform, ai-ml, cloud-infra, spring-java, " +
        "devops-containers, legacy-modernization, general. Content should use GitHub " +
        "callout syntax (> [!TIP], > [!NOTE]). Code blocks need language identifiers.",
    };
  }

  return {};
});
