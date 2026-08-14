-- Seed the journal with the six launch articles.
-- These become REAL rows, so they can be edited, unpublished and deleted
-- from /admin/blog like any other post. Before this, they were hardcoded
-- in the frontend: visible to visitors but invisible to the admin panel.
--
-- Safe to re-run: ON CONFLICT (slug) DO NOTHING means it will not overwrite
-- anything you have since edited.

insert into public.blog_posts
  (slug, title, excerpt, cover_url, content, tag, read_minutes, author_name, published, published_at, created_at, updated_at)
values
  ('why-measuring-a-room-is-still-hard', 'Why measuring a room is still the hardest part of buying furniture', 'Every returned sofa starts with a number someone guessed. We pulled apart the measuring problem — and what it actually costs a retailer.', '/assets/samples/styled_room.png', 'Ask a hundred people to measure their living room and you will get a hundred different floor plans. Not because people are careless — because rooms are genuinely awkward. Skirting boards eat centimetres. Radiators stick out. Bay windows refuse to be a rectangle. And a tape measure held by one person across four metres sags in the middle.

That gap between the room someone *thinks* they have and the room they actually have is where furniture returns come from.

## The number nobody checks twice

Retail teams have known this for a long time. When a customer buys a three-seater, the decision usually rests on a single measurement taken once, written on a phone note, and never verified. It feels precise. It isn''t.

> A five-centimetre error sounds harmless until it is the difference between a sofa that fits the alcove and a sofa going back on a van.

The cost is not just the refund. It is the second delivery slot, the restocking, the item that now cannot be sold as new, and a customer who will hesitate before ordering anything large again.

## What goes wrong, specifically

- **Diagonal drift.** Tape measures are pulled at an angle far more often than people realise, and the error always runs in the same direction — too long.
- **Obstruction blindness.** Sockets, pipe boxing and door swings are rarely recorded, then discovered on delivery day.
- **Unit slips.** Mixing feet and centimetres inside one plan is more common than any of us would like.
- **No second opinion.** There is nothing checking the numbers before they turn into an order.

## Why phones changed the maths

Modern phone sensors — depth cameras, LiDAR on higher-end devices, and increasingly good monocular depth models — can reconstruct a room''s geometry from a slow walk-through. The measurement stops being a single human act and becomes thousands of samples averaged into a surface.

That matters for one reason: **errors stop compounding**. A tape measure has one chance to be right. A scan has ten thousand, and the wrong ones cancel out.

## Where accuracy actually lands

In our testing across flats, period houses and open-plan extensions, room dimensions come back inside roughly a centimetre against a laser reference. That is more than good enough for furniture, flooring quantities, and paint coverage — the three decisions that drive the most expensive mistakes.

The interesting part is not the accuracy figure. It is that the measurement becomes *reusable*. Scan once, and every subsequent decision — the rug, the shelving, the flooring order — inherits a room that is already correct.

## What we would tell a retail team

1. Treat the measurement as part of the product experience, not a chore you hand to the customer.
2. Capture obstructions, not just walls. The alcove depth matters more than the room length.
3. Store the plan. A customer who scanned once will come back to buy against it.

The room is the constraint every other decision hangs off. It is worth getting right first.', 'Measurement', 7, 'ThinkDecor', true, '2026-07-28T09:00:00.000Z', '2026-07-28T09:00:00.000Z', '2026-07-28T09:00:00.000Z'),
  ('how-mantha-ai-reads-a-room', 'How Mantha AI reads a room before it redesigns one', 'Style transfer is the easy half. The hard half is understanding what a room is for — and refusing to put a wardrobe in front of a door.', '/assets/samples/3.jpg', 'Generative interiors have a credibility problem. Type a prompt into most tools and you get a beautiful image of a room that could not exist: doors opening into sofas, windows halfway behind a bookcase, a rug the wrong shape for the floor beneath it.

The pictures are lovely. They are also useless for buying anything.

## Understanding before styling

Mantha AI runs the problem in two passes. The first pass has nothing to do with aesthetics — it is a structural read of the space:

- Where the walls, floor and ceiling planes sit
- Which openings are doors and which are windows
- Where fixed services are: radiators, sockets, switches, vents
- What the circulation paths are — the space people actually walk through

Only once that map exists does anything get restyled. The geometry is a constraint, not a suggestion.

> The rule we kept coming back to: a design you cannot walk through is not a design, it''s a wallpaper.

## Why circulation is the quiet hero

Most bad AI interiors fail on movement, not taste. A room can be gorgeous and still be unusable because there is no clean path from the door to the window. Human designers hold this instinctively; a model has to be told.

We reserve corridors around every opening and between major pieces, then let the generator work only in the space that''s left. It rules out a lot of prettier compositions. It also means what comes out is something you could actually live in.

## Materials that behave like materials

The second pass handles surfaces — paint, flooring, upholstery, tile. The trick here is lighting consistency. If the room has a north-facing window, a warm oak floor should pick up the cool cast of that light. Get this wrong and the render reads as a collage, even when every individual element is right.

We sample the room''s existing light before applying anything, then relight the new materials to match. It is the least glamorous part of the pipeline and the one people notice most when it''s missing.

## What it is not good at yet

Being straight about this: Mantha is weak on rooms it can only partially see, and on heavily cluttered spaces where the structure is hidden behind belongings. Both are solvable, both are on the list, neither is solved today.

## The point of all of it

A redesign is only worth anything if it survives contact with the actual room. Everything above exists to make one sentence true: what you see is what will fit.', 'Mantha AI', 6, 'ThinkDecor', true, '2026-07-14T09:00:00.000Z', '2026-07-14T09:00:00.000Z', '2026-07-14T09:00:00.000Z'),
  ('floor-plans-from-a-phone-walkthrough', 'From a phone walk-through to a CAD-ready floor plan', 'Point clouds are messy, human, and full of furniture. Here is how a two-minute walk becomes a clean vector plan you can hand to a builder.', '/assets/samples/5.jpg', 'A raw scan of a room is not a floor plan. It is a few million points in space, some of which are walls, most of which are a sofa, a bin, a cat, and the person holding the phone.

Getting from one to the other is a sequence of decisions about what to throw away.

## Step one: find the planes

The first job is separating structure from stuff. Large, flat, vertical clusters are wall candidates. Large, flat, horizontal clusters near the bottom of the scan are floor. Near the top, ceiling. Everything else is provisionally furniture and gets set aside.

This is where most naive approaches fall over: a tall bookcase flush against a wall looks exactly like a wall. The tell is thickness and continuity — real walls run the full height and connect to other walls at their ends.

## Step two: regularise

Real walls are almost never perfectly straight or perfectly square, but they are *meant* to be. A plan that faithfully reproduces a two-degree wobble is less useful than one that snaps it.

We snap to dominant axes, square off corners within a tolerance, and close small gaps — while keeping a record of how much we moved things. If a wall was genuinely three degrees off, that is worth knowing, not hiding.

> Fidelity and usefulness pull in opposite directions here. The right answer is to be honest about the correction rather than pretending it didn''t happen.

## Step three: openings

Doors and windows are found as holes in otherwise continuous wall planes, then classified by their height above the floor. A gap starting at floor level is a door. One starting at roughly waist height is a window. A gap running the full width with no top is usually the scan simply not reaching, and gets flagged rather than guessed.

## Step four: vectorise and export

The regularised outline becomes polylines, openings become parametric symbols, and dimensions get attached to every wall run. From there it exports as **PDF** for humans, **SVG** for design tools, and **DWG** for anyone who has to build from it.

## The failure modes worth knowing

- **Mirrors.** Reflections create phantom rooms. We detect and discard them, mostly.
- **Glass.** Depth sensors struggle with it. Large glazed walls sometimes need a manual nudge.
- **Very dark rooms.** Less light, noisier depth, softer edges.

None of these are exotic; they are just the parts where a human eye still beats the pipeline. The plan tells you where it was unsure, which is the next best thing to being right.', 'Engineering', 8, 'ThinkDecor', true, '2026-06-30T09:00:00.000Z', '2026-06-30T09:00:00.000Z', '2026-06-30T09:00:00.000Z'),
  ('the-cost-of-a-wrong-sofa', 'The real cost of a wrong sofa, in numbers', 'We broke down what a single size-related return costs a furniture retailer end to end. It is considerably more than the refund.', '/assets/samples/7.jpg', 'Ask a finance team what a return costs and you will usually be told the refund value. Ask an operations team and you will get a much longer, much less comfortable answer.

## Where the money actually goes

A size-related furniture return burns money in at least six places:

1. **The outbound delivery** that already happened and cannot be recovered.
2. **The collection**, which is a second two-person slot on a van.
3. **Restocking and inspection**, because anything that has been in a home has to be checked.
4. **Depreciation** — the item usually cannot be sold as new again.
5. **Warehouse dwell time** while it waits to be re-listed or liquidated.
6. **Customer lifetime value**, the hardest to measure and the largest of the six.

That last one is the one people skip. A customer whose sofa didn''t fit does not just return a sofa. They stop buying large items from you, and they tell people.

> Returns are not a logistics cost with a customer footnote. They are a customer cost with a logistics footnote.

## Why size specifically

Colour and comfort returns are messy but hard to prevent — taste is taste. Size returns are different, because they are caused by a factual error that could have been checked before the order was placed.

That makes them the cheapest category of return to attack. You are not trying to change anyone''s mind. You are only trying to replace a guess with a measurement.

## What changes when the room is known

When the room''s geometry is captured before the purchase, three things happen:

- Products that cannot fit stop being shown, or get shown with a clear warning.
- The customer sees the item *in their room*, at true scale, before committing.
- Delivery access — the doorway, the stair turn, the lift — can be checked against the packed dimensions.

None of this is speculative technology. It is arithmetic that nobody had the inputs for until phones could measure rooms.

## A reasonable expectation

We would not promise anyone that size returns go to zero; access problems and changes of mind will always exist. But the subset caused purely by a bad measurement is large, well-defined, and addressable — and it is the most expensive kind of return you have.', 'Retail', 5, 'ThinkDecor', true, '2026-06-11T09:00:00.000Z', '2026-06-11T09:00:00.000Z', '2026-06-11T09:00:00.000Z'),
  ('designing-for-trust-in-ai-visuals', 'Designing for trust when the picture is generated', 'If a customer cannot tell what is real and what the model invented, the render stops being useful. Some rules we work to.', '/assets/samples/2.jpg', 'There is a specific moment where an AI interior tool either earns trust or loses it: the first time the customer notices something in the image that isn''t in their room.

Maybe it is a window that doesn''t exist. Maybe the radiator has quietly vanished. Either way, the customer now has to ask of every future image, *what else did it make up?* — and at that point the tool has stopped being a decision aid.

## Rule one: never remove the room

The generated layer can add, restyle and relight. It cannot delete architecture. If a radiator is there, it stays there, even when it makes the composition worse. A slightly uglier honest render beats a beautiful misleading one every time.

## Rule two: label what is generated

Products the customer selected are real. Everything the model added to fill out the scene — the plant, the throw, the art — is set dressing. We mark the difference, because the alternative is a customer trying to buy a coffee table that was never a product.

> Anything shoppable should be real. Anything not shoppable should be visibly styling.

## Rule three: show the same room twice

A before-and-after with the camera locked in place is far more persuasive than a beautiful standalone render, and far harder to fake. Fixing the viewpoint also makes it obvious if the geometry has drifted.

## Rule four: surface uncertainty

When the model has low confidence — a partially scanned wall, a reflective surface, an unusual ceiling — say so, in the interface, near the thing in question. Users forgive uncertainty that is disclosed. They do not forgive uncertainty that is discovered.

## Rule five: make it reversible

Every material change should be one click from undone. Confidence to explore comes from knowing nothing is permanent. It sounds like a small interaction detail; in testing it changed how much people were willing to try by a wide margin.

## Why any of this matters commercially

Trust is the conversion mechanism. Someone spending eight hundred pounds on a sofa is looking for a reason to believe. Every invented detail in a render is a reason not to.', 'Design', 6, 'ThinkDecor', true, '2026-05-22T09:00:00.000Z', '2026-05-22T09:00:00.000Z', '2026-05-22T09:00:00.000Z'),
  ('four-minutes-scan-to-plan', 'Four minutes: what happens between the scan and the plan', 'A timestamped walk through the pipeline, from the first frame captured on a phone to a downloadable set of drawings.', '/assets/samples/9.jpg', '"Scan to plan in four minutes" is on our homepage, so it is fair to ask what actually fills those four minutes.

## 0:00 — 1:30 · Capture

The user walks the room slowly, keeping the phone roughly at chest height, covering each wall and both floor corners at either end. On-screen guidance nudges them when coverage is thin — the most common miss is the wall directly behind where they started.

Frames, depth samples and device pose stream into a running reconstruction, so coverage gaps show up while the user can still fix them rather than afterwards.

## 1:30 — 2:10 · Reconstruction

The captured frames are fused into a single point cloud and aligned against the device''s motion track. Drift is corrected by closing the loop where the walk-through returns to its starting point.

## 2:10 — 3:00 · Structure

Planes are extracted and classified — wall, floor, ceiling. Furniture is separated out. Openings are detected as gaps in wall planes and classified by their height off the floor.

> Most of the difficulty in this stage is deciding what *isn''t* a wall.

## 3:00 — 3:40 · Regularisation

Walls snap to dominant axes, corners square up, small gaps close, and dimensions are computed for every run. Anything the pipeline had to move by more than the tolerance gets flagged for review rather than silently corrected.

## 3:40 — 4:00 · Output

The plan is vectorised and packaged: a dimensioned **PDF**, an editable **SVG**, and a **DWG** for CAD. Room areas, wall lengths and opening schedules come with it.

## What can make it slower

- Rooms above about forty square metres take longer to capture properly.
- Low light means noisier depth and more reconstruction work.
- Heavy clutter obscures the structure and pushes more decisions into the flagged pile.

The four minutes is a typical domestic room captured in reasonable light. It is a fair average, not a best case — but it is not a promise about every room either.', 'Product', 5, 'ThinkDecor', true, '2026-05-05T09:00:00.000Z', '2026-05-05T09:00:00.000Z', '2026-05-05T09:00:00.000Z')
on conflict (slug) do nothing;
