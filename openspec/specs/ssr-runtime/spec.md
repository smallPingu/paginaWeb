# SSR Runtime Specification

## Purpose

SSR server configuration, middleware activation, and prerender strategy for public pages.

## Requirements

### Requirement: SSR Server Startup

The SSR server MUST start and serve HTTP requests using the `@astrojs/node` standalone adapter. The server MUST bind to the configured port and remain available until the process is terminated.

#### Scenario: Server starts and serves a prerendered page

- GIVEN the site is built with `output: 'server'` and deployed
- WHEN a GET request is sent to `/` (a prerendered page)
- THEN the server MUST return HTTP 200 with prerendered HTML content
- AND the response MUST include a `Content-Type: text/html` header

#### Scenario: Server renders an SSR-only route at request time

- GIVEN the server is running
- WHEN a GET request is sent to a non-prerendered route that matches a page component
- THEN the server MUST render the page at request time
- AND return HTTP 200 with the rendered HTML

### Requirement: Public Page Prerendering

Index, contacto, galeria, and blog index pages in all three locales MUST be prerendered by declaring `export const prerender = true` in their frontmatter. Blog `[...slug]` detail pages MUST NOT have `export const prerender = true`.

#### Scenario: Build produces static HTML for public pages only

- GIVEN `export const prerender = true` is set on all public pages (index, contacto, galeria, blog index) for all three locales
- WHEN `astro build` runs
- THEN the build output MUST contain static HTML files for `/`, `/contacto/`, `/galeria/`, `/blog/`, `/en/`, `/en/contacto/`, `/en/galeria/`, `/en/blog/`, `/uk/`, `/uk/contacto/`, `/uk/galeria/`, `/uk/blog/`
- AND the blog post `[...slug]` routes MUST NOT produce static HTML files

### Requirement: Middleware Execution

The SSR server MUST execute middleware on every incoming request, including prerendered pages. The middleware SHOULD have access to the `Astro` global.

#### Scenario: Middleware runs on every request

- GIVEN a middleware function is registered (e.g., in `src/middleware/index.ts`)
- WHEN a GET request arrives for any route — prerendered or SSR-only
- THEN the middleware MUST execute before the page handler
- AND the middleware CAN modify the response (e.g., set cookies, authenticate)

### Requirement: Environment Variable Resilience

Missing or invalid environment variables MUST NOT crash the server at startup or at request time. The server SHOULD log a warning and continue with safe defaults.

#### Scenario: Missing env var at startup

- GIVEN required environment variables (e.g., `PUBLIC_SUPABASE_URL`) are not set
- WHEN the server starts
- THEN the server MUST NOT crash or exit
- AND the server MUST log a warning for each missing variable

### Requirement: i18n Route Resolution

The server MUST correctly resolve i18n routes with `prefixDefaultLocale: false` and `redirectToDefaultLocale: false`. Routes at `/`, `/en/`, and `/uk/` MUST render the correct locale page component.

#### Scenario: Each locale route renders its own content

- GIVEN the server is running
- WHEN a GET request is sent to `/en/blog/`
- THEN the response MUST render the English blog index component
- AND a request to `/uk/blog/` MUST render the Ukrainian blog index component

#### Scenario: Default locale renders without prefix

- GIVEN the server is running
- WHEN a GET request is sent to `/blog/` (Spanish default locale)
- THEN the response MUST render the Spanish blog index
- AND the request MUST NOT be redirected
