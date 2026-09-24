# ThinkDecor backlink and entity plan

Based on the linkbuilding, eeat-audit and featured-snippet skills in inhouseseo/superseo-skills.
Phase: **Foundation** (new domain, thin brand signals). Do not buy links, join link exchanges or use PBNs.

## Month 1: entity stacking (15-25 links, all by hand, needs the founder's own accounts)
Use the identical name, description, logo and URL everywhere ("ThinkDecor, AI room redesign from one photo, thinkdecor.app"):
- Google Business Profile (Northampton), LinkedIn company page, Crunchbase, X, Instagram, Pinterest (pin room redesigns, high fit), YouTube, Facebook page
- Product Hunt, BetaList, AlternativeTo (list as an alternative to RoomGPT / Interior AI), There's An AI For That, Futurepedia, SaaSHub
- UK directories: Yell, Thomson Local, FreeIndex; Northampton Chamber of Commerce
- Wikidata entry once there is press or a directory page to cite
Then add every profile URL to `organizationSchema().sameAs` in `src/lib/schema.ts` (currently empty).

## Months 2-3: earn 5-10 relevant links
- Pinterest boards of before/after redesigns linking to the matching blog post
- Resource pages: search `intitle:resources "home decor"` and `"AI interior design tools"`; pitch the free 2-redesign trial
- Interior-design and renter-advice bloggers: offer a free account for an honest review (disclose the relationship)
- Reddit (r/InteriorDesign, r/malelivingspace, r/RoomPorn) as a participant, never link-dropping

## Months 4-6: link-worthy assets
- Original data: a survey of UK homeowners on paint regrets, with the numbers published as a stats page
- Free tool pages (paint colour visualiser landing page) that others cite

## Anchor text (safe ranges)
Branded 40-50%, naked URL 15-20%, generic 15-20%, partial match 10-15%, exact match under 5%.
Velocity: 15-25 links month 1, then 5-10 a month. Never 50+ in a month.

## E-E-A-T fixes still open (need real information from the team)
- Named author with a verifiable profile (LinkedIn) plus Person schema on posts
- A short "how we tested" method note on comparison posts, with a screenshot from our own workflow
- Real customer quotes with permission, then add Review markup (never before)
