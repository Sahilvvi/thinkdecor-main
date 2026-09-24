// One-time content seed for the SEO content plan (report §06): publishes
// the 7 planned spoke articles and expands the existing thin posts with a
// real added section each. Not part of the build, run by hand:
//   node scripts/seed-blog-content.mjs
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY first (e.g. `set -a && source .env && set +a`).');
  process.exit(1);
}
const supabase = createClient(url, key);

const now = new Date();
const daysAgo = (n) => new Date(now.getTime() - n * 86400000).toISOString();

export const NEW_POSTS = [
  {
    slug: 'how-does-ai-interior-design-work',
    title: 'How AI room redesign actually works',
    tag: 'Mantha AI',
    excerpt: 'What actually happens between uploading a photo and getting a redesign back, and why most of the work is refusing to move your walls.',
    cover_url: '/assets/samples/styled_room.png',
    read_minutes: 5,
    published_at: daysAgo(3),
    content: `The honest answer is: less magic than it looks like, and more constraint-checking than people expect.

## You upload one photo

That's the whole input. Not a floor plan, not measurements, not a 3D scan, one photo of the room, ideally straight-on and in daylight so the model can read the walls, windows and floor clearly. Phone photos are fine. A photo taken at an angle works too, it just gives the model less to go on.

## The room gets read before it gets changed

Before anything is generated, the model works out what's fixed and what isn't: where the walls, windows, doors and floor actually are. That's the part that matters most, because it's also the part every cheap version of this gets wrong, a sofa floating in front of a door, a rug the wrong shape for the room, a wall that's moved six inches to make a composition prettier.

The constraint is simple to state and hard to enforce: **the architecture doesn't move.** Style changes on top of it; the room underneath stays the room you photographed.

## Then it applies a style, or your own words

You pick from the built-in styles (Modern, Scandinavian, Minimal, Classic, Japandi, Industrial, Warm Natural) or skip that entirely and just describe what you want in plain English: "keep my sofa, swap the rug for something softer, add warmer lighting." Both paths go through the same model. The style templates exist because most people don't want to write a paragraph describing a look, they want to tap "Japandi" and see it.

## It takes about 10 seconds

Not because it's simple, but because the room understanding step and the generation step now run together rather than as separate passes. Earlier versions of tools like this took much longer; a redesign you're waiting 30-60 seconds for is worse to iterate on, and iteration, try it, change one thing, try again, is most of how people actually use this.

## What it's not doing

It's not measuring your room. It's not calculating how much paint or flooring you'd need to buy, that's a separate, harder problem (see [our post on why room measurement is still hard](/blog/why-measuring-a-room-is-still-hard)) and one we're building toward, not shipping today. What you get is a photorealistic *preview*, enough to know whether the green velvet sofa actually works in your actual light, before you spend anything finding out the hard way.

> The test we hold ourselves to: if you can't tell which one is the photo and which one is the redesign at a glance, we've done our job. If you can immediately tell, we haven't.

## Where it still gets things wrong

Being straight about this, because a tool that claims to be perfect isn't trustworthy: heavily cluttered rooms are harder, because the model has to guess at structure hidden behind your belongings. Very dark or backlit photos lose detail the model needs. And regenerating the same photo with a wildly different prompt each time can occasionally drift, which is why **Regenerate** exists as its own button, not just "try again from scratch."

If you want to see it rather than read about it, [start with a photo of your own room](/app/create), the first two redesigns are free.`,
  },
  {
    slug: 'thinkdecor-vs-roomgpt-vs-interior-ai',
    title: "ThinkDecor vs RoomGPT vs Interior AI: what's actually different",
    tag: 'Product',
    excerpt: "A category this crowded deserves a straight comparison, not a sales pitch. Here's where ThinkDecor is genuinely different, and where it isn't.",
    cover_url: '/assets/samples/styled_room.png',
    read_minutes: 6,
    published_at: daysAgo(9),
    content: `AI room redesign is not short on options. RoomGPT, Interior AI, Collov, Spacely, REimagine Home, and a growing list of newer entrants all do some version of "upload a photo, get a styled room back." If you're deciding between them, the honest differences are narrower than the marketing on any one of these pages, including this one, will tell you.

## Price, without the credit-pack maths

RoomGPT sells credits: $9 for 30, scaling up from there. (Competitor prices were checked in September 2026 and change often, so confirm on their own pricing pages.) Collov's entry plan is listed at $19/month for 60 photo credits. Spacely's paid plans start at roughly $15/month, aimed at working designers who need masking and material-override controls most homeowners will never touch.

ThinkDecor's first month is 69p, then £4.99/month for 20 designs. That's not a promotional gimmick to get you in the door and then charge RoomGPT-level prices later, £4.99 is the actual ongoing price. If you just want to try one redesign before deciding anything, the barrier to entry is a fraction of what a credit pack costs.

## Whether your actual furniture survives

This is the real technical difference, and it's worth being specific about it rather than just claiming it. RoomGPT and Interior AI are known for generating furniture that doesn't exist in your room, a new sofa, a new coffee table, sometimes a new floor plan's worth of stuff you never asked for. That's fine if you want inspiration. It's not useful if you're trying to answer "would this actual sofa look right in this actual room."

ThinkDecor's redesigns work from your photo's real geometry, the walls, windows and layout stay put, and what changes is what you tell it to change. If you only paint over one thing (see [Cleanup](/app/cleanup) and [Replace](/app/replace)), everything else in the photo is untouched pixel-for-pixel outside that area.

## What ThinkDecor doesn't do that others do

No point pretending otherwise: Collov's product-matching (finding the actual real-world item closest to what's in the render) is more built-out than anything ThinkDecor offers today. Spacely's designer-grade masking tools go deeper than our Cleanup/Replace pair. REimagine Home is purpose-built for real estate staging at volume, batch-processing dozens of listing photos, which isn't what ThinkDecor is for.

## Where to actually start

If you want the cheapest possible way to see whether AI redesign is useful to you at all, ThinkDecor's 69p first month is the lowest-commitment entry point in this comparison. If you're a working designer who needs precise material overrides across dozens of client rooms, Spacely is built for that job specifically and ThinkDecor isn't trying to be. If you're staging real estate listings at scale, REimagine Home is the right tool.

For redesigning your own home, one room at a time, without inventing furniture that isn't there: [try it on your own photo](/app/create).`,
  },
  {
    slug: 'scandinavian-living-room-ideas',
    title: 'Scandinavian living room ideas, redesigned with AI',
    tag: 'Design',
    excerpt: 'Light oak, soft linen, a calm palette, the ideas that actually define Scandinavian style, and how to see them on your own walls before committing to any of it.',
    cover_url: '/assets/rooms/room-living-scandinavian.jpg',
    read_minutes: 5,
    published_at: daysAgo(14),
    content: `Scandinavian design gets flattened into "white walls and a plant" more than almost any other style term, which is a shame, because the actual ideas behind it are more specific and more useful than that.

## What Scandinavian actually means, beyond white walls

The style comes out of a real constraint: long, dark Nordic winters and short daylight hours. Every decision traces back to that, light oak floors and pale walls to bounce what daylight exists around the room; layered, warm-toned lighting (not one harsh overhead) to replace it after dark; texture (wool throws, linen cushions, sheepskin) standing in for colour, since colour reads differently under low light than under bright sun.

- **Palette**: whites, soft greys, pale oak, with one or two muted accent tones (dusty blue, sage, ochre), never more
- **Materials**: light unfinished or lightly-oiled wood, wool, linen, rattan, natural and slightly imperfect over polished and uniform
- **Lighting**: multiple low, warm-toned sources instead of a single bright overhead, candles are not a cliché here, they're structural
- **Clutter**: genuinely minimal, but not empty, a Scandinavian room has fewer objects, chosen more carefully, not none

## The mistake most redesigns make

The easy version of "Scandinavian" is just desaturating everything and calling it done. The actual style has warmth in it, that's the whole point, it's built to counteract cold, dark months, not to feel cold itself. A true Scandinavian room should feel calmer than a stark minimalist one, not colder.

## Try it on your own living room

This is exactly the kind of style decision that's hard to picture from a swatch or a Pinterest board, because it depends entirely on your room's own light, proportions and existing furniture. A pale palette that looks calm in a north-facing flat with big windows can look flat and grey in a room with less daylight.

[Upload a photo of your living room](/app/create?template=scandinavian) and apply the Scandinavian template directly, you'll see it against your actual walls, your actual light, not a showroom. It's one of ThinkDecor's most-used templates, alongside Modern and Minimal, and it keeps your existing layout: same windows, same walls, same floor plan, different surfaces.

If it doesn't work for your room, that's useful information you now have for free, better than committing to four litres of paint on a hunch.`,
  },
  {
    slug: 'small-living-room-ai-redesign',
    title: 'Small living room, big change: redesigning tight spaces with AI',
    tag: 'Design',
    excerpt: "Small rooms punish design mistakes harder than large ones. Here's what actually helps a tight living room feel bigger, and why seeing it first matters more here than anywhere else.",
    cover_url: '/assets/rooms/room-living-minimal.jpg',
    read_minutes: 5,
    published_at: daysAgo(20),
    content: `A design choice that's forgivable in a large room can make a small one feel worse. Dark paint that reads as cosy in a big living room can read as cramped in a small one. A patterned rug that anchors a spacious layout can visually shrink a tight one. Small spaces have less margin for error, which is exactly why guessing is riskier here than anywhere else.

## What actually helps a small living room

**Vertical lines, not horizontal ones.** Floor-to-ceiling curtains (hung close to the ceiling, not the window frame), tall narrow shelving, art hung slightly higher than feels natural, all of it pulls the eye up and makes the ceiling feel taller, which reads as "bigger" more reliably than almost anything else.

**One dominant light tone, not a patchwork.** A small room with three different wood tones (floor, coffee table, shelving) reads as busy. Matching or closely coordinating them reads as one continuous surface, which feels larger than the same room broken into visual chunks.

**Furniture that shows its legs.** A sofa or armchair on visible legs lets you see floor underneath it, which your eye reads as "more floor exists" even though the actual square footage hasn't changed. Furniture that sits flush to the ground visually eats the space beneath it.

**Fewer, larger pieces over many small ones.** Small rooms crammed with small furniture look cluttered even when the total volume of stuff is similar to a room with two or three bigger pieces. This is the one that's hardest to believe until you see it.

## Where this goes wrong without seeing it first

All four of those are directionally true, but "directionally true" isn't the same as "true for your specific room." A pale palette that opens up a small room with a big window can look washed-out and flat in a small room with limited daylight. Vertical-line curtains only help if your ceiling height has room to exploit. The advice above is a starting point, not a guarantee, which is exactly the gap a photo-based preview closes.

## See it on your actual room before deciding

[Upload a photo of your small living room](/app/create) and try Minimal or Scandinavian, both templates lean into lighter palettes and fewer, more considered pieces, which tend to work well in tight spaces, but "tend to" is doing a lot of work in that sentence. The only way to know for certain is to see your actual walls, your actual light, your actual furniture, restyled, not a stock photo of someone else's small room that happens to work well.

It's one credit, it takes about 10 seconds, and if it doesn't work you've lost nothing you'd have spent finding out with paint instead.`,
  },
  {
    slug: 'remove-clutter-room-photo-ai',
    title: 'Remove clutter from a room photo before you redesign it',
    tag: 'Product',
    excerpt: "You don't need an empty room to see what it could look like. Here's how Cleanup erases what's in the way, a cable, a stray box, an old poster, before you even get to styling.",
    cover_url: '/assets/samples/empty_room.png',
    read_minutes: 4,
    published_at: daysAgo(26),
    content: `Most rooms people actually photograph aren't styled for the photo. There's a charging cable across the floor, a stack of post on the side table, a poster left over from a previous tenant. None of that is what you're trying to redesign, it's just in the way of seeing the room underneath.

## What Cleanup actually does

Paint over the thing you want gone, the cable, the box, the poster, whatever it is, and it's erased, with the space behind it filled in to match the rest of the room. Not blurred, not blacked out: the wall, floor or surface underneath is reconstructed to look like it was never there.

This runs before or independently of a full redesign. You can use Cleanup on its own if all you want is a tidier photo of the room as it actually is, useful for listings, for insurance documentation, for just seeing the room without the clutter your eye has learned to filter out but a photo hasn't.

## How it's different from Replace

Cleanup removes something and fills the gap with more of what's already there, more wall, more floor, more of the empty surface. [Replace](/app/replace) does the second half of that job: paint over an object and describe what should take its place instead, a different sofa, a new rug, anything. Same paint-over interaction, different outcome: one erases, one swaps.

Both work the same way underneath, the tool identifies what's under your brush strokes (you'll see a quick "Looks like: floor lamp" confirmation before you generate, so you know it read the object correctly) and only touches that masked area. Everything else in the photo stays untouched.

## Why this matters before a full redesign

If you're planning to redesign a room and it's currently full of things you're going to move or get rid of anyway, cleaning those out first gives the redesign a clearer room to work with, one credit to tidy, one credit to restyle, rather than asking a single redesign to both ignore the clutter and reimagine the room around it.

[Try Cleanup on a photo](/app/cleanup), paint over what you want gone, and see the room without it in about 10 seconds.`,
  },
  {
    slug: 'japandi-bedroom-ideas',
    title: 'Japandi bedroom ideas: calm, warm, and generated in seconds',
    tag: 'Design',
    excerpt: 'Japanese restraint meets Scandinavian warmth, the ideas that make Japandi work in a bedroom specifically, and how to see it on your own room first.',
    cover_url: '/assets/rooms/room-bedroom-japanese.jpg',
    read_minutes: 4,
    published_at: daysAgo(31),
    content: `Japandi is one of the few style terms that actually describes a fusion honestly, it's not a marketing blend of two aesthetics that don't relate, it's two traditions (Japanese minimalism, Scandinavian cosiness) that were already unusually compatible, pushed together on purpose.

## Why Japandi works especially well in bedrooms

A living room has to do several jobs at once, entertaining, relaxing, sometimes working. A bedroom has one job, and Japandi's core instinct (fewer things, chosen carefully, low visual noise) maps onto "a room built for rest" more directly than almost any other style.

- **Low furniture**: platform beds, low dressers, closer to the floor, which reads as calmer and more grounded than tall furniture with visible legs and gaps underneath
- **Natural, muted materials**: unfinished or lightly-treated wood, linen bedding, woven textures, nothing glossy, nothing that reflects light sharply
- **Restrained colour**: warm neutrals, muted earth tones, almost no pure white and almost no saturated colour, Japandi sits in the quiet middle of the palette
- **Negative space treated as a feature**, not an oversight, a Japandi bedroom has visible empty wall and floor on purpose, not because nothing's been added yet

## The tension to get right

Pure Japanese minimalism can read as austere in a bedroom, too little warmth for a room built for comfort. Pure Scandinavian cosiness can tip into clutter if you layer in every throw and cushion the style usually calls for. Japandi's actual job is holding both in check at once: warm enough to rest in, restrained enough to stay calm. That balance is easy to describe and surprisingly easy to get wrong by leaning too far either way.

## See it on your own bedroom

Palette and material choices in a bedroom are personal in a way living rooms often aren't, you're looking at these walls last thing at night and first thing in the morning. [Upload a photo of your bedroom](/app/create?template=japandi) and apply the Japandi template directly against your actual window, your actual light, your actual layout, before deciding whether it's the direction you want.

Two free redesigns come with every new account, enough to try Japandi and one other style side by side.`,
  },
  {
    slug: 'cheapest-ai-interior-design-2026',
    title: 'The cheapest way to try AI interior design in 2026',
    tag: 'Retail',
    excerpt: "Every AI redesign tool eventually asks for money. Here's an honest look at what each one actually costs to try, and where the real value sits once you've moved past the free tier.",
    cover_url: '/assets/samples/styled_room.png',
    read_minutes: 4,
    published_at: daysAgo(37),
    content: `"Free trial" in this category almost always means "a small number of free credits, then a paid tier that starts somewhere between $9 and $20." Worth being specific about what that actually costs once you want to use the thing properly, not just once.

## What "free" actually gets you, across the category

RoomGPT's paid credits start at $9 for 30, workable, but you're paying up front for a batch you may not use. Collov's entry plan is listed at $19/month for 60 photo credits, aimed more at professional and e-commerce use than casual redesign. Remodel AI currently offers 3 free designs with no card required, which is a genuinely low-friction way to test the category before spending anything.

## Where ThinkDecor sits

New accounts get 2 free redesigns, no card required, enough to try one room in one style and judge the quality for yourself. Past that, it's 69p for the first month, then £4.99/month for 20 designs. That first-month price isn't a permanently discounted "founding member" rate that quietly reverts to something higher later, £4.99 is the standing price after it.

Twenty designs a month works out to roughly 25p per redesign if you use all of them, which is in the same range as RoomGPT's cheapest pack (about 30 cents a credit) but as a flat monthly price, and well below Collov's higher tiers.

## What "cheap" doesn't mean here

Low price isn't the same as low quality, but it's fair to ask what the trade-off is. The honest answer, covered in more detail in [how AI room redesign actually works](/blog/how-does-ai-interior-design-work): ThinkDecor doesn't do product-matching to real, buyable furniture the way Collov does, and it doesn't offer the professional-grade masking controls Spacely built for working designers. What it does do is restyle your actual room, real walls, real windows, real layout, for less than the cost of a coffee.

## Try it before comparing further

The cheapest way to judge any of this is directly: [upload a photo and try a free redesign](/app/create). If it's not useful to you, you've spent nothing finding that out.`,
  },
];

/** Existing thin posts get one substantial added section, appended after
 *  their current content, not a rewrite, so the voice and any existing
 *  internal links stay intact. */
export const EXPANSIONS = {
  'why-measuring-a-room-is-still-hard': `

## What people do instead, today

In the meantime, the workaround most people actually use is a tape measure, a rough sketch, and a lot of "that should fit, probably." It mostly works. It also produces the exact failure mode that makes measurement worth solving properly: the wardrobe that's 4cm too deep for the alcove, discovered after delivery, not before.

Professional measurement, a surveyor, a fit-out company's own team, solves this reliably, at a cost and a lead time that doesn't make sense for "will this sofa fit." That gap, between a tape measure and a professional survey, is where most furniture-buying decisions actually happen, uncertainly.

## Why a photo alone doesn't solve it

A single photo tells you a lot about a room's *style*, enough for [a full redesign](/blog/how-does-ai-interior-design-work), but comparatively little about its precise dimensions. Perspective distorts distance in ways that are easy for a person to misjudge and genuinely hard for software to correct for without more information than one image provides: a second angle, a known reference object, or ideally a short walkthrough video rather than a single frame.

That's the real reason measurement and redesign are separate features here rather than one. Redesign needs to know where your walls *are*, relatively, enough to keep them fixed while changing what's on them. Measurement needs to know how far apart they are, in centimetres, precisely enough to bet a sofa purchase on. Those are different problems with different error tolerances, and conflating them is how you end up with a tool that's mediocre at both instead of good at one.`,

  'how-mantha-ai-reads-a-room': `

## The bit that took longest to get right

If there's one part of this pipeline that took more iteration than everything else combined, it's window and door recognition specifically, not because it's conceptually hard, but because the failure mode is invisible until it isn't. A misjudged wall angle produces a redesign that looks *slightly* off in a way people notice immediately. A misjudged door produces a redesign that looks perfectly fine right up until you realise the new wardrobe is now blocking it.

The fix wasn't a cleverer model, it was treating openings as harder constraints than everything else in the room. A door gets a wider "keep clear" margin than a plain wall does, because the cost of getting a door wrong (a room you can't actually walk into) is higher than the cost of getting a wall slightly wrong (a shelf that's a few centimetres off where it should be).

## Why this matters more than it sounds like it should

None of this is visible in a finished redesign when it's working. You don't see the circulation map or the opening margins, you just see a room that looks like your room, restyled. That's deliberate. The entire structural-reading pass exists so that the part you actually look at, the styled result, doesn't need a caveat attached to it. "Ignore the sofa blocking the door" shouldn't be something you ever have to say about a redesign, and the amount of engineering behind that one sentence not being necessary is disproportionate to how boring the sentence sounds.`,

  'floor-plans-from-a-phone-walkthrough': `

## Why a walkthrough, not a single photo

A single photo, the input a [redesign](/blog/how-does-ai-interior-design-work) needs, gives you one angle, one moment, one perspective to work from. A floor plan needs to reconcile *multiple* rooms against each other: where the kitchen wall actually sits relative to the hallway, whether two rooms share a wall or just look like they might from separate photos. That requires continuity a single frame can't provide.

A phone walkthrough, walking through the space with the camera recording, the way you'd casually film a room for a friend, gives the model overlapping frames from slightly different angles and positions. That overlap is what lets it triangulate distances and reconcile one room's walls against the next room's, the same underlying principle behind photogrammetry generally, just applied to something people can do in under five minutes with a device they already own instead of specialist scanning hardware.

## What "four minutes" is actually doing

The number isn't arbitrary, it's roughly the amount of walkthrough footage needed to give the reconstruction enough overlapping angles on every wall to resolve confidently, for a typical UK flat or small house. A single large open-plan room needs less; a home with many small rooms and doorways needs more, because each additional wall is another surface that needs to be seen from at least two angles to place accurately.

## Where this is heading

The end goal isn't a pretty 3D model, it's a floor plan precise enough to trust with a furniture-fit decision, the exact gap [described in our piece on why room measurement is still hard](/blog/why-measuring-a-room-is-still-hard). That's a higher bar than "looks roughly right," and it's why this is still labelled coming soon rather than shipped: the difference between "close enough to visualise" and "close enough to buy against" is the whole remaining distance to travel.`,

  'the-cost-of-a-wrong-sofa': `

## The redesign-first alternative

The number above assumes the usual buying process: measure roughly, imagine the rest, hope. The alternative, [redesign the room first, buy second](/blog/how-does-ai-interior-design-work), doesn't eliminate the fit risk (that's a measurement problem, not a style one), but it does eliminate a different, equally common mistake: buying the right-sized thing in the wrong colour, fabric or style for the room's actual light.

A green velvet sofa that looks rich and warm in a showroom under warm spotlighting can look muddy and dark in a north-facing living room with cooler daylight. That mismatch doesn't show up on a tape measure. It shows up the day the sofa arrives, by which point most return windows are measured in restocking fees, not sympathy.

## What this actually costs to check first

One credit. Upload a photo of the room, apply a style close to what you're considering, or describe the specific piece in plain language, "add a green velvet sofa", and see it against your room's actual walls and actual light before the delivery van is booked. It doesn't replace measuring. It does replace guessing at everything measurement can't tell you: whether the colour, the material and the light actually work together in the room you're standing in, not the showroom you saw it in.`,

  'designing-for-trust-in-ai-visuals': `

## The specific tell people learn to spot

Ask anyone who's used a few AI redesign tools what gives a fake one away, and the answer is rarely "it looks bad." Generated images are often beautiful. The tell is usually smaller: a shadow falling the wrong direction for the room's actual window, a reflection in a mirror that doesn't match what's in front of it, a rug whose perspective doesn't quite track the floor beneath it. None of those ruin the image at a glance. All of them register, half-consciously, as "something's off here."

That's the real bar for trust in this category, and it's higher than "photorealistic." An image can be extremely photorealistic and still fail this test, because photorealism is about texture and lighting quality, and the trust problem is about physical consistency, does this image obey the same rules the original photo did.

## Why we show the before, not just the after

The single biggest trust decision in how ThinkDecor presents a result is refusing to show you only the finished redesign. Every result is a before/after comparison against your actual original photo, not a standalone generated image you have to take on faith. That's a deliberately higher bar to clear than most competitors set for themselves, a redesign has to hold up next to the real photo it came from, in the same frame, not be judged in isolation where a viewer has nothing to compare it against.

It also means a bad result is visibly bad, immediately, rather than quietly convincing. We'd rather you catch an off result at a glance and hit Regenerate than trust something that doesn't actually match your room.`,

  'four-minutes-scan-to-plan': `

## What happens in the gap between minute one and minute four

The interesting part isn't the start or the end, it's the middle, where the reconstruction is actively resolving disagreements between frames. Early in a walkthrough, the model has thin evidence: a wall glimpsed once, at one angle, is a guess more than a measurement. By the third or fourth minute, most walls have been seen from multiple angles as you've moved through the space, and the model can cross-check one frame's read of a wall against another's, tightening the estimate each time they agree and flagging it when they don't.

This is also why walking slowly and steadily matters more than walking through quickly. A fast walkthrough covers the same rooms but gives the model less overlap between consecutive frames to reconcile, more distance covered, less evidence per wall. Four unhurried minutes reconstructs more reliably than four minutes at speed, even though both are "four minutes" on a stopwatch.

## Why this is still labelled coming soon

A floor plan that's *roughly* right is easy. One precise enough to bet a furniture purchase on, the actual goal, and the same bar [set out in why room measurement is still hard](/blog/why-measuring-a-room-is-still-hard), is a meaningfully higher standard, and it's the reason this hasn't shipped yet even though the walkthrough-to-reconstruction pipeline broadly works today. The gap between "looks correct" and "correct enough to trust with money" is where the remaining work sits.`,
};

async function main() {
  console.log(`Inserting ${NEW_POSTS.length} new posts...`);
  for (const post of NEW_POSTS) {
    const { error } = await supabase.from('blog_posts').upsert(
      { ...post, published: true, author_name: 'ThinkDecor' },
      { onConflict: 'slug' },
    );
    if (error) console.error(`  FAILED ${post.slug}:`, error.message);
    else console.log(`  ok: ${post.slug}`);
  }

  console.log(`\nExpanding ${Object.keys(EXPANSIONS).length} existing posts...`);
  for (const [slug, addition] of Object.entries(EXPANSIONS)) {
    const { data: existing, error: readErr } = await supabase
      .from('blog_posts').select('content').eq('slug', slug).single();
    if (readErr || !existing) { console.error(`  FAILED to read ${slug}:`, readErr?.message); continue; }
    const { error } = await supabase
      .from('blog_posts')
      .update({ content: existing.content + addition, updated_at: new Date().toISOString() })
      .eq('slug', slug);
    if (error) console.error(`  FAILED ${slug}:`, error.message);
    else console.log(`  ok: ${slug}`);
  }

  console.log('\nDone.');
}

import { fileURLToPath } from 'node:url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
