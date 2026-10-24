# Guides: editorial brief

This is the brief the weekly drafting job follows. A person reviews every
draft before it is published.

## Who we write for

Marketers, content owners and analysts who use GA4 and want a clear answer
about one page of their site. They know what a page view is. They do not
want a GA4 course.

## What a guide must do

- Answer the target query in the first two paragraphs. No warm-up.
- Be correct for the current GA4 interface. Use current names: "key events"
  (not conversions), "Average engagement time per active user", "Pages and
  screens", "Explore". If a menu path is uncertain, describe what to look
  for instead of inventing a click path.
- Add something a generic answer would not: a worked example with plausible
  numbers, a common mistake, or a scope rule (page, session or user scoped).
- Mention SideNote Analytics at most twice, where it genuinely saves a step,
  plus the standard call-to-action box. Never claim features the extension
  does not have. Its 16 metrics are listed on the home page.
- Link to at least one other guide or the guides hub, and to official
  Google documentation when citing a definition.

## Voice

Natural, corporate-sounding English. Plain and confident, like a good
internal analytics wiki. Short paragraphs. No hype, no "in today's digital
landscape", no "dive into", no exclamation marks, no emoji. American
spelling.

## Length and structure

- 900 to 1,500 words.
- One `<h1>`, then a short "In short" summary box, then `<h2>` sections.
- A "Common questions" section with 2 to 4 short Q&As at the end.
- Title tag up to 60 characters, meta description 120 to 160 characters.

## Never

- Publish more than one guide per week.
- Invent statistics, benchmarks or quotes. If a benchmark is useful, say
  that it varies by site and explain how to set your own.
- Copy text from other sites.
- Target a query the site has no real answer for.

## Files

- Copy `docs/seo-engine/guide-template.html` to `guides/<slug>/index.html`.
- Fill every placeholder, including both dates (`YYYY-MM-DD`) and the
  JSON-LD block. Set `utm_campaign` on the store link to the slug.
- Run `node scripts/guides.mjs` to update the hub page and the sitemap,
  then `node scripts/guides.mjs --check` to run the quality checks.
- In `content/topics.json`, set the topic's status to `drafted`.
