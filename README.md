# Astro 6 Starter

This starter repository facilitates the creation of new Astro projects using the configuration described below.

To learn how to use a GitHub template repository, check
out [Creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template).

![project status](https://img.shields.io/badge/project_status-active-success?style=for-the-badge)
[![live site](https://img.shields.io/badge/live_site-blue?style=for-the-badge)](https://resend-astro-demo.mail-25a.workers.dev/)

## Tech Stack

### Frontend

- **Framework**: [Astro 6](https://astro.build/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)

### Backend

- **Hosting**: [Cloudflare Workers](https://workers.cloudflare.com/)

### Quality Assurance

- **Unit testing**: [Vitest](https://vitest.dev/)
- **End-to-end testing**: [Playwright](https://playwright.dev/)

## Notes

- `.nvmrc` is used primarily as a way to specify the Node.js version for Cloudflare Workers (see [Build image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/))
- The GitHub Action `actions/setup-node@v6` relies on both `package.json` `engines` and `devEngines` to set the Node.js version and automatically cache npm dependencies.

## Dev Environment & Tools

- **System**: [Ubuntu](https://ubuntu.com/desktop)
- **Editor**: [VS Code](https://code.visualstudio.com/)
- **Formatter**: [Prettier](https://prettier.io/)
- **Linter**: [ESLint](https://eslint.org/)
- **AI assistant**: [GitHub Copilot](https://github.com/features/copilot)

## Copyright

© 2026 Johnny Gérard
