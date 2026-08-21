---
title: "Waterproof Maps for a 53-Mile Scout Canoe Trek (No Map Software Required)"
description: "How I turned a trip brief and a phone-drawn route into a spiral-bound book of waterproof custom maps — using an AI assistant, a print shop, and zero mapping skills."
weight: 10
series: "Small Experiments"
series_weight: 100
skin: generative
draft: true
---

![The finished book: spiral-bound, waterproof, one overview page up front](/small_experiments/img/trip_book_cover.jpg)

This August I spent six days paddling 63 miles across the Adirondacks with my son and a crew
of scouts — Long Lake to Franklin Falls Pond, by way of the Raquette River and
the Saranac Lakes. I got a wonderfully detailed email that had our route plan, including GPS coordinates and a GPX file.

I decided to use that information to make a book of maps of our route, with details of each day. I've used various types of software libraries to interact with coordinates and maps, but in this case I wanted to see what AI could do for me, without doing any programming myself.

I ended up using the maps, and they held up. This post is the recipe, so you
can make your own for any trip. There's exactly one non-obvious trick in it, and
I'll spell it out when we get there.

---

## What we ended up with

Twenty-three pages, 8.5×11, in print order:

- **One whole-trip overview** — the route, every campsite, and the legend.
- **Per-day pages** — an overview of each day plus one or two zoomed-in "detail
  strips" for the days that covered a lot of water.
- **Eight close-ups** — every portage, both locks, and the tricky spots: the
  Raquette Falls carry, Indian Carry, Bartlett Carry, the village of Saranac
  Lake, the take-out at Franklin Falls.

Everything we might need to find was marked with a letter in a colored circle:
red **C** for campsites and lean-tos, orange **P** for portages, purple **L**
for the locks (you paddle right in — no carry), gold **★** for worth-a-look
diversions, and little blue numbered circles counting off the miles within each
day.

And one pink **!** for Mountain Mist Custard on Lake Flower — because August 6th
was one scout's birthday, we had a portage through town that day anyway, and it
was going to be hot. More on how that ended up on the map in a minute.

![The whole-trip overview page](/small_experiments/img/p00_trip_overview.jpg)

![Day 5 — through the locks, the village, and the birthday ice cream stop](/small_experiments/img/p50_day5_overview.jpg)

---

## Step 1: Get your route into a file

You need two ingredients before you talk to the AI: the trip brief (a
document describing your itinerary), and a
**GPX file** of the route. I got both in an email, which was nice for me, but what if you don't have that?

The document is just any document - it doesn't have to be in any format, it just says what you're doing. The AI tool can take this and use your descriptions to better label your map. If you say you are doing certain routes on day 4, it'll know those routes labeled as "Day 4".  In my case I asked it to find a place to get ice cream, and it was able to find that place and automatically find its coordinates and put them on the map.

A GPX file sounds technical but it's just a saved copy of a line and some pins.
Any of the phone apps people already use for trips can make one — You could use
[GaiaGPS](https://www.gaiagps.com/) for example: trace the route on your phone, drop a
waypoint at each planned campsite, and choose *Export as GPX*. That's the whole
step.

One lesson from our trip, worth applying here: **trace rivers faithfully**. The lines from my GPX 
file cut across the meanders of the lower Saranac River, and every
distance measured from it inherited that shortcut — the last day measured 6.8
miles on my line but was more like 9.5 on the water. The maps were still right;
my line was just optimistic. **Trace the squiggles if you want accurate distances!**

## Step 2: Ask for the maps — and have it write a program

Here's the actual prompt I used, trimming out some of the email that I pasted in the middle:

> I want to create a series of maps that I'm going to get laminated for a scout
> canoeing trip, so that each day we have as much detail as possible. Here is
> the brief I was given:
>
> ```
> Itinerary:
>
> Everyone will camp at Massawepie Scout Camp the night of Sat 8/1. Your trek
> will start on the morning of Sun 8/2 and progress from the Long Lake Village
> Boat Launch (43.979021123940946, -74.41621441577301). It will end on Friday
> 8/7 2:00pm at Franklin Falls on The Saranac River (44.43759915705529,
> -73.97516813494396). What you do in between is essentially up to you guys...
>
> The suggested route is around 55 miles long and would proceed as follows:
> …
> ```
>
> There is also an attached gpx file, and a screenshot image.
>
> One thing that's vital: I don't want you to try to interpret those files or
> make the maps directly, I want you to write code to generate them, using some
> publicly accessible maps API. I'd like for the maps to have sufficient detail
> that if there are river or trail branches that we'll have a reasonable chance
> to be able to see them and make good choices. It doesn't have to be a single
> map per day, there could be areas of higher detail. If there are areas of
> interest that may be interesting diversions, please also call them out. On
> August 6th it is the birthday of one of the scouts, I believe we have a
> portage in a town on that day, if there are opportunities for some sort of
> treat (it will be hot, ice cream might be nice!), that would be great

Some stuff to point out about that prompt:

**1. Ask for Code, even if you're not a coder: "I don't want you to make the maps directly, I
want you to write code to generate them."** This is the sentence I most want
you to steal, so let me explain why it's there.

If you ask an AI to *draw* you a map, it will — and it'll look convincing. But
it might be drawn from the AI's general impression of what that area looks like:
map-*shaped*, not a map. It also won't place the coordinates right, it'll just guess where they should be.

Asking it to *write a program* instead changes where the truth comes from. The
program fetches real, published maps — mine used the US Geological Survey's
topographic maps and OpenStreetMap, both free for this — and then simply draws
your route and your markers on top of them. Every shoreline, contour line, and
trail on the page comes from the actual map data; the AI only decided the
arrangement: what goes on which page, where to zoom, what to label.

Here's the part that matters for a non-technical reader: **you never have to
look at the program.** I didn't review the code. The program is just the
mechanism that guarantees the geography is real. You judge the output — the
pages — which brings us to Step 3.

(A bonus you get for free: when you change your mind — and you will — the
program just re-runs. "Move the Day 4 campsite" doesn't mean redrawing
anything; it means one more conversation turn and thirty seconds of waiting.)

**2. I pasted the whole brief, verbatim.** Dates, coordinates, the outfitter
note, all of it. Summarizing for the AI is a mistake — you don't know yet which
detail matters. The finish-time ("Friday 2:00pm at Franklin Falls") is why the
take-out got its own close-up page.

**3. I described situations, not features.** Not "zoom level 14, please" — I
don't know what zoom level shows a river fork. Instead: *if there are river or
trail branches, we should have a reasonable chance to see them and make good
choices.* Describe the moment on the water where the map has to earn its keep,
and let the AI translate that into map decisions. Same with "it doesn't have to
be a single map per day" — that one sentence is where the detail strips and all
eight portage close-ups came from.

**4. I included the human stuff.** The birthday made it into the prompt, so the
AI went looking — and found Mountain Mist Custard, right on the water on Lake
Flower, just before the dam portage, open till 10pm. It went on the map in pink
with its own close-up, labeled "BIRTHDAY ICE CREAM." It also volunteered other
diversions I hadn't asked about: a fire-tower trail near one campsite, cliffs
the scouts could jump from near another. Trip maps are for a *crew*, not a GPS
unit. Tell the AI about the crew.

**5. The print was too small.** I've added this in as a follow-up: The maps worked great, and the labels that it added were really easy to see (the camping sites, etc.), but the labels of the geographic features (lakes, rivers, islands) were too small.  I'm 52, and I didn't bring my reading glasses. I would like larger labels! So after I got home I asked it how it would make them bigger - turns out you can just add this to the end of your prompt:

> IMPORTANT lesson learned from a previous run of this prompt: the basemap's own
> text (river, island, and bay names baked into the map tiles) printed too small
> to read. Map tiles are rendered for ~96 DPI screens, so at 300 DPI print their
> labels shrink to about one third the intended size. Don't bother trying DPI
> parameters on tile/export endpoints — cached tile services ignore them. The fix
> that worked: render the basemap at a lower internal resolution and upscale it
> ~1.5x (Lanczos) to the final page size, and draw ALL overlays (route line,
> markers, labels, scale bar) AFTER the upscale so they stay crisp. 1.5x is the
> sweet spot: the renderer can often keep the same tile zoom level by flipping
> page orientation, so text gets 50% bigger with no loss of map detail. Avoid 2x:
> it forces a one-level zoom drop, and small feature labels (e.g. island names)
> disappear entirely because label density is baked into each zoom level. Render
> one test page and ask the user to inspect it for text legibility before generating the full
> set.

## Step 3: Review the pages like a camper, not a programmer

What comes back is a stack of page images. Now you do the part you're already
qualified for — you know what makes a map useful, and none of it requires
technical vocabulary:

- Does each portage close-up show **both ends** of the carry?
- Would I recognize that campsite from a boat, or does the page need to zoom
  out and show the shape of the bay?
- Are the day-mile numbers plausible against the brief?
- Is anything I care about sitting under a label?

Then just say so, in sentences: "Day 3's overview is too zoomed out to be
useful." "Give the take-out its own page — we have a hard 2:00 deadline."

![Close-up: the Raquette Falls carry — both ends of the portage on one page](/small_experiments/img/p80_closeup_1.jpg)

## Step 4: Print it

Ask the AI to also combine the pages into a single PDF in print order — one
file is much easier to hand across a print counter than 23.

I took mine to Office Depot and had them printed on waterproof paper and
spiral-bound. Fair warning: the waterproof paper was by far the most expensive
part of the whole project — it's priced per sheet, so the page count is the
cost. Two ways to keep it down that I'd use next time: be ruthless about which
pages actually earn a spot in the book (I printed all 23; a trimmed set would
have served as well), and ask the shop to print double-sided, which
halves the sheet count outright.

Two things to get right at the counter:

- **Print at 100% / "actual size."** Each page has a scale bar that's only
  honest if nothing gets shrunk to fit.
- **Keep the fine print.** Each page carries a small credit line naming the map
  source (USGS or OpenStreetMap). That attribution is the condition of the free
  data — leave it on.

The spiral binding turned out to be quietly great: the book lies flat on a
thwart, folds back to today's page, and the waterproof pages shrug off wet
hands and rain.

![Day 4, detail page — Lower Saranac Lake, with the backup campsite and the jumping cliffs marked](/small_experiments/img/trip_book_day4.jpg)

---

## How they did on the water

Six days, real weather, wet hands: the book worked. The portage close-ups and
the campsite marks were exactly what we reached for; nobody had to squint at a
phone in a dry bag.

The one systematic flaw was mine, not the maps': the meander-cutting route line
from Step 1. Because the mile ticks were measured along against the GPX line, they were
minimums — fine once we knew, and the pages themselves showed the river
truthfully. The fix is to trace carefully, and you'll get much more accurate distances.

One thing I wish I'd packed: something to write on the maps with. Waterproof
paper shrugs off water, but it also shrugs off a regular pen — and there were
moments (a campsite change, a time check at a carry) where marking the page
would have been genuinely useful. Before the trip, test a wax pencil (grease
pencil / china marker) and a permanent marker on a spare printed sheet and
bring whichever writes and survives handling best.

![Loaded and ready on Lower Saranac](/small_experiments/img/canoes_loaded.jpg)

![Sunrise from camp — worth the paddle](/small_experiments/img/campsite_sunrise.jpg)

---

## The recipe, condensed

1. **Trace the route** in a phone app (GaiaGPS or similar), waypoint each
   campsite, export a GPX file. Trace rivers faithfully.
2. **Prompt the AI** with the *whole* trip brief, the GPX file, and the vital
   sentence: *write code to generate the maps from a public maps source — don't
   draw them yourself.* Describe situations ("we need to see river branches"),
   not settings. Include the human stuff.
3. **Review like a trip leader.** Both ends of every carry, recognizable
   campsites, plausible mileages. Ask for changes in plain English until the
   pages pass.
4. **Print at 100% on waterproof paper**, spiral-bound, attribution intact.
   The paper is the big cost — trim the page set and print double-sided. Pack a
   wax pencil or marker you've tested on a spare sheet.

Total investment: a free app, an evening of conversation, and a print run.
The skill it takes isn't cartography or programming — it's knowing your trip
well enough to specify it, and to recognize when a page would fail you on the
water. 
