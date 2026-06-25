# Portfolio Site — CLAUDE.md

## Project overview

Personal portfolio site for a Senior UX Designer. Built with Astro (static), vanilla Astro components, plain CSS with custom properties, and Inter via Google Fonts. No UI framework, no CSS framework.

## Tech stack

- **Framework:** Astro 4.x (static output)
- **Components:** Vanilla `.astro` only — no React/Vue/Svelte
- **Styling:** Plain CSS, CSS custom properties defined in `src/styles/global.css`
- **Font:** Inter via Google Fonts (`@import` in global.css)
- **Content:** Astro content collections (markdown) for project/case study pages

## Commands

```bash
npm run dev       # dev server on http://localhost:4321
npm run build     # static build to dist/
npm run preview   # preview the built output
```

## Directory structure

```
src/
  content/
    config.ts           # Zod schema for the `work` collection
    work/               # one .md file per project
  layouts/
    Base.astro          # sticky nav + footer shell; wraps every page
    CaseStudy.astro     # article header + prose + back-link; used by [slug].astro
  components/
    Nav.astro           # name left, Work/About right, sticky top
    ProjectCard.astro   # card used on home page for each project
  pages/
    index.astro         # home: hero / project cards / about blurb
    about.astro         # bio, experience, contact
    work/[slug].astro   # dynamic case study route; skips entries with `external`
  styles/
    global.css          # resets, CSS custom properties, type scale
public/
  favicon.svg
```

## Content collections

Collection name: `work`. Schema fields (`src/content/config.ts`):

| Field | Type | Notes |
|---|---|---|
| `title` | string | Project title |
| `company` | string | e.g. "Shopify" |
| `year` | string | e.g. "2022–2023" |
| `description` | string | One-line summary shown on card and case study header |
| `order` | number | Sort order on home page (default 99) |
| `external` | string (optional) | If set, card links here instead of generating a case study page |
| `category` | `'case-study'` \| `'personal'` | Controls which section on home page (default `'case-study'`) |

To add a new project: create `src/content/work/<slug>.md` with the frontmatter above. If it has no `external` field, a case study page is auto-generated at `/work/<slug>`.

## Design rules (do not break these)

- **Colors:** white background (`#ffffff`), black text (`#000000`), muted grey (`#555555`) only — no other colors
- **No:** animations, gradients, shadows, decorative elements, hover effects beyond opacity
- **Whitespace:** generous — the aesthetic is "business card scaled to a website"
- **Mobile:** responsive via `clamp()` on h1, `padding-inline` on containers
- **Max content width:** 720px (`--max-width` in global.css)

## CSS custom properties

Defined in `src/styles/global.css`:

```css
--color-bg: #ffffff
--color-text: #000000
--color-muted: #555555
--color-border: #e5e5e5
--font: 'Inter', system-ui, sans-serif
--max-width: 720px
--space-xs / sm / md / lg / xl  (0.5 / 1 / 2 / 4 / 8 rem)
```

## Placeholder content (to replace)

- Name: "Your Name" — appears in `Nav.astro`, `Base.astro` footer, `index.astro` hero, `about.astro`
- Title: "Senior UX Designer" — `index.astro` hero
- Email: `hello@yourname.com` — `index.astro` and `about.astro`
- External link on Grammar Conjugation Tool card: `https://example.com` — `src/content/work/grammar-conjugation-tool.md`
- All case study body copy is placeholder prose

## Pages

| Route | File | Notes |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero, project cards, about blurb |
| `/about` | `src/pages/about.astro` | Bio, experience list, contact |
| `/work/order-routing` | generated from `work/order-routing.md` | Full case study |
| `/work/pickup-in-store` | generated from `work/pickup-in-store.md` | Full case study |

## Deployment

Repo is `scallsen.github.io` — intended for GitHub Pages. `astro.config.mjs` has `site: 'https://scallsen.github.io'`. A GitHub Actions workflow for deployment has not been set up yet.
