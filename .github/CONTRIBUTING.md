# Contributing to Everglow Website

Thank you for helping improve the Everglow website. Contributions to the site code, documentation, translations, and visual assets are welcome.

## Before you start

- Search existing issues and pull requests to avoid duplicate work.
- For substantial design or content changes, open an issue first so the maintainers can align on the direction.
- Never commit credentials, API keys, deployment configuration, or local `.env` files.

## Local development

This repository uses Node.js 22 and pnpm 11. Enable Corepack, install dependencies, then start the development server:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Before opening a pull request, run the same checks used in CI:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Content and translations

- Keep matching pages in the supported locale directories up to date when appropriate.
- Use clear, concise language and preserve the existing front-matter and Markdown conventions.
- Place images and other static assets under `public/` using descriptive, lowercase file names.
- Do not include copyrighted material unless the project has permission to publish it.

## Pull requests

- Keep each pull request focused on one change.
- Use a descriptive title and explain user-visible changes in the PR template.
- Add screenshots for UI changes and note any translation or content pages that need follow-up.
- Ensure all CI checks pass and respond to review feedback before requesting a final review.
