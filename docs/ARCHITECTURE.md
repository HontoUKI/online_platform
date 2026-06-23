# Architecture

## Shape

A React + Vite single-page app. Routing is defined in
[src/routes/Routes.jsx](../src/routes/Routes.jsx); the entry point
[src/main.jsx](../src/main.jsx) loads global styles (`tokens.css`, `utilities.css`) and renders
[src/App.jsx](../src/App.jsx).

```text
src/
  pages/       Student-facing pages (modules, lessons, tests, grades, account)
  teacher/     Teacher pages and modals (modules, lesson editor, test creation)
  admin/       Admin panel: pages/ and components/ + admin-only CSS in assets/
  components/  Reusable UI (menu, modals, toasts, fallbacks)
  sections/    Header and landing Hero
  routes/      Route table
  utils/       apiRequest, session, error handling, route guards
               (unit tests in utils/__tests__/)
  assets/      tokens.css, utilities.css and per-area stylesheets
```

## Conventions

- **HTTP through one wrapper.** Every request uses
  [utils/apiRequest.js](../src/utils/apiRequest.js). Pass `data` as an object for JSON or as a
  `FormData` for uploads (the wrapper omits `Content-Type` so the browser sets the multipart
  boundary). Errors are normalized and surfaced via [utils/handleError.js](../src/utils/handleError.js).
- **Session in one place.** The auth session in `localStorage` is only touched through
  [utils/session.js](../src/utils/session.js) (`getSession`, `getToken`, `setSession`,
  `updateSession`, `clearSession`, `isSessionValid`). Components never call `localStorage`
  for the session directly.
- **Route protection.** [utils/PrivateRoute.jsx](../src/utils/PrivateRoute.jsx) validates the
  token against the API; [utils/withSessionGuard.jsx](../src/utils/withSessionGuard.jsx) gates
  pages on a valid local session.
- **Styling.** Plain CSS. Design tokens (colors/spacing/radii) are CSS variables in
  `assets/tokens.css`; repeated layout/spacing patterns are utility classes in
  `assets/utilities.css`. Component-specific rules live in their own stylesheet. Inline styles
  are avoided.

## API contract

Request bodies for each endpoint the app calls are documented in [REQUESTS.md](REQUESTS.md).
The backend route reference lives in the API repo at `docs/API.md`.

## Decisions To Revisit

- **CSS rule duplication — resolved.** The admin sidebar no longer reuses the global `Menu`
  component's class names: its selectors are namespaced as `.admin-menu-*`, so
  `assets/style.css` and `admin/assets/style.css` no longer collide, and the duplicated
  `.menu-close`/`.menu-title` blocks in `assets/style.css` were merged. `assets/style.css` is
  still large and could be split per area later.
- **Token refresh.** The app stores an access token with a local `expires_at` and redirects to
  login on expiry; there is no refresh flow.
- **Typed API layer.** Request/response shapes are documented but not type-checked; a typed
  client (or TypeScript) would catch drift against the backend schemas.
