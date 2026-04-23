# Resend Demo with Astro

![project status](https://img.shields.io/badge/project_status-active-success?style=for-the-badge)
[![live site](https://img.shields.io/badge/live_site-blue?style=for-the-badge)](https://resend-astro-demo.jgerard.dev)

## Overview

This project showcases a basic contact form built with Astro and hosted on Cloudflare Workers. It serves as a demonstration of how to integrate the Resend API for sending transactional emails from a serverless environment.

Note that while SSR is required for the Astro server action to work, the homepage and the 404 page are prerendered (SSG).

## Tech Stack

### Frontend

- **Framework**: [Astro 6](https://astro.build/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icon library**: [Phosphor Icons](https://phosphoricons.com/)

### Backend

- **Serverless**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Email API**: [Resend](https://resend.com/features/email-api)

### Security

- **Bot detection**: [Cloudflare Turnstile](https://www.cloudflare.com/application-services/products/turnstile/)

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
