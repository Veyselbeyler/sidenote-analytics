# The guides engine

An AI-assisted content workflow for organic search, with a person in the loop.

1. **Plan.** `content/topics.json` is a queue of topics, each with a target
   query, search intent and angle. Topics are low-competition, long-tail GA4
   questions that the extension genuinely helps with.
2. **Draft.** Once a week a scheduled Claude job takes the first `queued`
   topic, writes a guide following `style-guide.md` and
   `guide-template.html`, runs `node scripts/guides.mjs`, and opens a pull
   request.
3. **Review.** The pull request is the editorial gate. A person checks the
   facts against the current GA4 interface, edits the copy and merges.
   Nothing is published without that merge.
4. **Check.** `.github/workflows/guides.yml` runs `scripts/guides.mjs
   --check` on every pull request: title and description length, one `<h1>`,
   canonical URL, valid Article JSON-LD, word count, tracked store link,
   no broken guide links, hub and sitemap up to date.
5. **Measure.** See below. After a few months, Search Console queries that
   already earn impressions feed new topics into the queue.

## Why not publish automatically

Google's spam policies treat content produced at scale mainly to rank,
with little value added, as *scaled content abuse*, whether or not AI wrote
it. A new domain with little authority is the most exposed. One reviewed
guide a week, each answering a real question with a worked example, keeps
the site on the right side of that line.

## Measurement plan

Each guide pushes `content_group: 'Guides'` and `page_type` to the
dataLayer before GTM loads. The store button carries
`data-track="store_click"` and UTM tags `utm_medium=guide`,
`utm_campaign=<slug>`.

| Question | Where |
| --- | --- |
| Are guides being found? | Search Console › Pages, URL contains `/guides/`: impressions, clicks, CTR, position |
| Which queries bring them? | Search Console › Queries, filtered to a guide URL |
| How much organic traffic do they bring? | GA4 › Landing page, Content group = Guides, Session default channel group = Organic Search |
| Do readers engage? | GA4 › Pages and screens, Content group = Guides: engagement time, views per user |
| Do guides drive installs? | GA4 key event `store_click` by page; Chrome Web Store dashboard, UTM medium `guide` |

### GTM setup (one-off)

1. Variables › New › Data Layer Variable `content_group` → name it
   `DLV - content_group`.
2. Open the Google tag for `G-PMHCFEW4B5` › Configuration settings › add
   parameter `content_group` = `{{DLV - content_group}}`. GA4 maps this to
   its built-in **Content group** dimension.
3. Make sure the GA4 event tag's trigger regex includes `store_click`.
4. Publish, then in GA4 › Admin › Events mark `store_click` as a key event.

Pages without a push (the home page, privacy, support) show
`(not set)` in the Content group dimension, which is expected.
