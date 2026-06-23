# Online Platform Frontend

Frontend for an educational online platform built with React and Vite.

## Features

- authentication and protected routes;
- student personal account;
- module and lesson pages;
- tests and grades;
- teacher lesson/module management;
- admin panels for users, groups, modules and access control;
- configurable API URL through environment variables.

## Tech stack

- React
- Vite
- React Router
- Axios / Fetch API
- ESLint

## Project structure

```text
src/
  admin/       Admin panel components and pages
  assets/      Shared styles
  components/  Reusable UI components
  pages/       Student-facing pages
  routes/      Application routes
  sections/    Landing/header sections
  teacher/     Teacher-facing pages and modals
  utils/       apiRequest, session, file download and error helpers
```

All HTTP calls go through `utils/apiRequest.js` (JSON and multipart), and the auth session is
read/written only through `utils/session.js`. Colors, spacing and radii live in
`assets/tokens.css`; common layout/spacing classes are in `assets/utilities.css`.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — project shape and conventions.
- [docs/REQUESTS.md](docs/REQUESTS.md) — request bodies the frontend sends, per endpoint.

## Environment variables

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Example values:

```env
VITE_API_URL=http://localhost:8000
VITE_SERVER_URL=http://localhost:8000
VITE_ALLOWED_HOSTS=online-platform-t3xm.onrender.com,do.vtgk.kz
VITE_SUPPORT_ENABLED=true
VITE_SUPPORT_PHONE=+7 (700) 000-00-00
```

Do not commit the real `.env` file. Only `.env.example` should be stored in Git.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Tests

Unit tests for the utilities (`apiRequest`, `session`, `handleError`) run with Vitest:

```bash
npm run test
```

Test files live next to the code in `src/utils/__tests__/`.

## Checks

```bash
npm run lint
npm run test
npm run build
npm audit
```

## CI

`.github/workflows/ci.yml` runs on every push to `main` and on pull requests: `npm ci`, then
lint, unit tests and a production build on Node 20.

## Publication notes

Before making the repository public, check that local-only files are not tracked:

```bash
git ls-files | findstr ".env"
git ls-files | findstr "node_modules"
git ls-files | findstr "dist"
```

Expected safe result for environment files:

```text
.env.example
```

