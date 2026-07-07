# Blog Dynamic Specification

## Purpose

Blog route behavior in server mode — replacing static path generation with dynamic lookup at request time.

## Requirements

### Requirement: Dynamic Post Rendering

Blog post pages (`[...slug].astro`) MUST render at request time using content collection data — NOT from pre-generated paths. The `getStaticPaths()` function MUST be removed.

#### Scenario: Post renders from dynamic lookup

- GIVEN a `[...slug].astro` page without `getStaticPaths()` and without `export const prerender`
- WHEN a GET request is sent to `/blog/tecnicas-de-carboncillo`
- THEN the server MUST find the matching `.md` file using content collection queries
- AND render the page with the correct `frontmatter` and Markdown body
- AND return HTTP 200

### Requirement: Locale-Specific Post Filtering

The post lookup MUST filter by the requesting locale, derived from `Astro.currentLocale`. A post in one locale MUST NOT render for a different locale's route.

#### Scenario: Each locale returns only its own posts

- GIVEN there are blog posts in English (`locale: 'en'`) and Spanish (`locale: 'es'`)
- WHEN a GET request is sent to `/en/blog/painting-tips`
- THEN the server MUST check that the matched post has `frontmatter.locale === 'en'`
- AND render the post if the locale matches
- AND return the 404 state if the locale does not match

#### Scenario: Draft posts are excluded

- GIVEN a blog post has `draft: true` in its frontmatter
- WHEN any locale route requests that post by slug
- THEN the server MUST NOT render the post
- AND return the 404 state

### Requirement: post.Content Rendering Pattern

The existing `<post.Content />` rendering pattern MUST be preserved. The content query mechanism MUST provide a `Content` component and a `frontmatter` object for each matched post.

#### Scenario: Content component renders Markdown body

- GIVEN a matched post with a `Content` component and `frontmatter`
- WHEN the page template renders `<post.Content />`
- THEN the full Markdown content MUST render as HTML inside the `<article>` element
- AND the frontmatter fields (title, date, author) MUST render in the header section

### Requirement: Non-Existent Slug Handling

Requests for slugs that do not match any existing `.md` file MUST return a 404 response. The existing "Artículo no encontrado" fallback in `BlogPostContent` MUST be preserved.

#### Scenario: Requesting a non-existent slug returns 404

- GIVEN no `.md` file with slug `this-post-does-not-exist` exists
- WHEN a GET request is sent to `/blog/this-post-does-not-exist`
- THEN the lookup MUST find no matching entry
- AND render the "Artículo no encontrado" fallback
- AND the response SHOULD have HTTP status 404
