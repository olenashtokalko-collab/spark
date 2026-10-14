# Spark — Brand Guidelines for the Platform

Source: **Spark Studios Brand Guidelines 2026, V2.0** (PDF, 22 pages, Abu Dhabi). This document turns the brand book into a design reference for the Spark platform. It does not change the UI; it is the basis for doing so.

## How to read this document

Every property is tagged with where it comes from:

| Tag | Meaning |
|---|---|
| **[Spec]** | Stated in the brand book, in words or as a value. Quoted page in brackets, e.g. (p. 11). |
| **[Inferred]** | Not stated, but consistent across the brand book's own examples. Treat as strong guidance; confirm with the brand team before hard-coding. |
| **[Proposed]** | Not covered by the brand book. A recommendation for the platform, open to change. |
| **⚠ Gap** | Missing or unclear in the brand book. Needs a decision or an answer from the brand owner. |

Values are never invented. Where the book gives no number, this document says so instead of guessing. Contrast ratios marked *computed* were calculated from the book's HEX values (WCAG 2.x formula); they are not in the book.

The brand book is a **brand and marketing** book: logo, colour, type, material, imagery, print and social. It contains **no product UI specification** (no spacing scale, no component specs, no interaction states, no dark-mode UI, no motion timings). Sections 5–7 and 9 therefore lean on [Inferred] and [Proposed] by necessity.

---

## 1. Brand identity

### Positioning
- **[Spec]** Brand idea: **"We bring sparks to light."** (p. 4)
- **[Spec]** "Every idea starts with a human: a hunch, a judgement, a feeling. AI gives it power and reach. Spark Studios brings the two together and makes the idea visible." Formula: **Human mind + AI power = Spark** (p. 4).
- **[Spec]** Concept **Cybernoor** = Cyber + *Noor* (Arabic for light). "A human idea enters as clear light, AI is the prism, and the idea leaves as a spectrum." (p. 5)
  - **Human mind · the input** — "One idea, one judgement, one person. Clear and unamplified."
  - **AI power · the prism** — "The studio's tools: they multiply the idea in speed, range and craft."
  - **Noor · the light** — "The idea, amplified into every format, screen and audience."
- **[Spec]** Place: Abu Dhabi. Colour names, coordinates on posts and regional faces in imagery all anchor the brand there (pp. 11, 15, 19).

### Personality and tone of voice
- **[Spec]** "Short, specific, confident. A senior partner who has done it before: no hype, no jargon, proof over promise." (p. 6)
- **[Spec]** Three voice principles, each with a *Say / Not* example (p. 6):

| Principle | Say | Not |
|---|---|---|
| **Clear** | We turn great ideas into real growth. | Leveraging holistic AI-driven synergies. |
| **Bright** | We bring sparks to light. | Unleash limitless innovation. |
| **Grounded** | Human minds. AI power. | The future is here. |

- **[Inferred]** Headlines are short, often two lines, often a pair of short sentences ("One idea. Every format.", "Search less. Spark more.", "Human first. Always on.") (pp. 19–20).
- **[Inferred]** Human comes first in the wording; AI is the amplifier, never the hero on its own.

### Overall visual direction
- **[Spec]** Light ground: Saadiyat Sand carries the page (45% of colour use) (p. 11).
- **[Spec]** Material: **"frosted light"** — "soft frosted glass holding spectral light" (p. 14).
- **[Spec]** The spectrum runs **Cobalt → Ember** (p. 14).
- **[Inferred]** Calm editorial layouts: large flat Sand areas, one strong visual per spread, generous empty space, mono labels in the corners. The colour and glass are concentrated in one object; everything around it stays quiet.

---

## 2. Colour system

### Solid colours
**[Spec]** "Five solid colours, each named after a place in Abu Dhabi. Sand and Ink carry the page, Gulf Cobalt leads, Liwa Ember is the spark." Proportions are given as share of use (p. 11).

| Name | HEX | RGB | Share | Description in book | Role [Spec] |
|---|---|---|---|---|---|
| **Saadiyat Sand** | `#F8F6F2` | 248 246 242 | 45% | The cultural district ground | Carries the page (ground) |
| **Mangrove Ink** | `#0E1116` | 14 17 22 | 20% | Eastern Mangroves after dark | Carries the page (type, dark grounds) |
| **Gulf Cobalt** | `#1E3BD6` | 30 59 214 | 15% | The Arabian Gulf at depth | **Leads** (primary accent) |
| **Liwa Ember** | `#E8501F` | 232 80 31 | 5% | Liwa dunes at last light | **The spark** (secondary accent) |
| **Corniche Haze** | `#C8D8F0` | 200 216 240 | 5% | Dusk haze over the Corniche | ⚠ No role stated; see below |

### Noor (the light)
- **[Spec]** "Noor · light · 10%. Not a colour. The light between Gulf Cobalt and Liwa Ember, used **only as glow and glass**." (p. 11)
- **[Spec]** "The spectrum flows Cobalt to Ember." (p. 14)
- **[Inferred]** The swatch (p. 11) is a soft, grainy, blurred band running Cobalt → violet → pink/magenta → Ember → a pale peach fade. The intermediate violet and pink are **not given as values**.
- ⚠ **Gap:** no gradient stops, angles, blur radius or grain amount. Any implementation of Noor (e.g. `linear-gradient(#1E3BD6 → … → #E8501F)`) is **[Proposed]** and should be approved visually.

### Intended use, colour by colour
- **Saadiyat Sand** — **[Spec]** default page ground; the logo's primary version is Ink on Sand (pp. 8, 10). **[Inferred]** Slightly warmer tint panels sit on Sand (logo and version tiles, pp. 8, 10); ⚠ that tint's value is not given.
- **Mangrove Ink** — **[Spec]** type and logo colour on Sand; ground for the reverse logo "for night and premium print" (p. 10). **[Inferred]** Statement bands on social posts, the "Follow" button, access cards (pp. 18–20).
- **Gulf Cobalt** — **[Spec]** "leads"; the second line of a headline is set in Cobalt (p. 19); "Pills: Cobalt for human" (p. 19). **[Inferred]** Statement bands, the send/arrow button in the prompt field, "SAY" labels (pp. 6, 19, 20).
- **Liwa Ember** — **[Spec]** "the spark"; "Pills: Ember for AI" (p. 19). **[Inferred]** Section labels and index numbers ("THE BRAND IDEA", "01", "CLEAR SPACE", "NOT"), the small spark sign in post corners, the toggle knob, statement bands (pp. 2, 4, 6, 8, 16, 20).
- **Corniche Haze** — ⚠ **Gap:** role not stated. **[Inferred]** Used as a cool, pale ground behind glass objects and portraits (pp. 10, 15, 19, 21) and as the light edge of the Noor glow.

### Neutrals, text, borders and states
- ⚠ **Gap:** the book gives **no secondary text colour, no border/divider colour, and no greys**. **[Inferred]** It visibly uses a mid grey for body copy and labels ("Brand Guidelines 2026", descriptions) and thin grey hairlines between rows (pp. 2, 5, 6, 8, 16), but their values are not specified.
- ⚠ **Gap:** no semantic colours (success, warning, error, info). Ember is "the spark", not an error colour; reusing it for errors would contradict its meaning. **[Proposed]** Define separate semantic colours and keep them out of brand surfaces.
- ⚠ **Gap:** no dark-mode palette beyond "Sand on Ink for night" (p. 10).

### Accessibility (computed, not in the book)
| Pair | Contrast | Verdict (WCAG 2.x) |
|---|---|---|
| Ink on Sand | 17.5 : 1 | AAA, any text |
| Cobalt on Sand | 7.3 : 1 | AAA normal text |
| White on Cobalt | 7.9 : 1 | AAA normal text |
| Ink on Haze | 13.1 : 1 | AAA |
| Ink on Ember | 5.1 : 1 | AA normal text |
| White on Ember | 3.8 : 1 | **Large text / UI only** (fails AA for body text) |
| Ember on Sand | 3.5 : 1 | **Large text / UI only** (fails AA for body text) |
| **Cobalt on Ink** | **2.4 : 1** | **Fails** — do not use Cobalt as text or thin lines on Ink |

**[Proposed]** Consequences: Ember labels must be large/bold or decorative; on Ink, links and accents need a lighter tint than Gulf Cobalt (e.g. Corniche Haze, which has 13.1 : 1 on Ink).

### Gradients
- **[Spec]** Only Noor, only as glow and glass, Cobalt → Ember (pp. 11, 14).
- **[Spec]** The logo is "never filled with the spectrum" (p. 8).
- **[Inferred]** No flat linear UI gradients anywhere; gradients appear only as blurred light (behind or inside glass), with visible grain.

---

## 3. Typography

### Families and roles
| Role | Family and cut | Sizes | Source |
|---|---|---|---|
| **Display** | Diatype Extended **Bold** ("its heaviest cut leads everything we say") | 80 to 120 | [Spec] p. 12 |
| **Text** | Diatype Extended **Regular** | 22 to 30 | [Spec] p. 12 |
| **Label** | **Diatype Mono** | 16 to 18 | [Spec] p. 12 |
| **Highlight** | **Doto Rounded** — numbers | ⚠ not given | [Spec] p. 12 |
| **Arabic** | **Hacen Casablanca** — Heavy, Regular, Light; "carries Arabic with the same weight and width" | ⚠ not given | [Spec] p. 12 |

- ⚠ **Gap — units and context:** sizes have **no unit** (pt/px) and come from a 16:9 presentation. They are presentation sizes, not UI sizes. 80–120 cannot be used as UI heading sizes as-is.
- ⚠ **Gap:** no line heights, letter spacing, or weights other than those listed; no Latin–Arabic pairing rules for mixed lines.
- ⚠ **Gap — licensing:** Diatype Extended, Diatype Mono and Hacen Casablanca are commercial typefaces; web licences must be confirmed before use. Doto should be checked for availability as a web font and for the exact "Rounded" variant the book refers to.

### Hierarchy observed in the examples
- **[Inferred]** Display headlines are set tight: close line spacing and slightly negative tracking (pp. 2–6, 12).
- **[Inferred]** Labels are **uppercase Diatype Mono with wide tracking**: page header ("SPARK STUDIOS", "02 · IDENTITY"), footers, image captions, section labels, the "Say / Not" markers (all pages).
- **[Inferred]** Labels are coloured to carry meaning: Ember for section labels and index numbers, Cobalt for "Say", Ember for "Not" (p. 6); a middle dot " · " separates label parts.
- **[Inferred]** Doto (dot-matrix numerals) is used for page numbers ("12/22"), colour shares ("45%") and chapter indexes ("01"–"04") — numbers only, never words.
- **[Inferred]** Body copy is set in Diatype Extended Regular in a muted grey, short measure (roughly 40–55 characters per line in the examples).
- **[Spec]** Social: "a two-line headline in Diatype Extended, a mono label" and "Second line of the headline in Gulf Cobalt" (p. 19).

### [Proposed] UI type scale
The book has no UI scale. A starting point, to be validated with the licensed fonts:

| Token | Family | Use |
|---|---|---|
| `display` | Diatype Extended Bold | Page titles, empty-state headlines, the chat greeting |
| `title` | Diatype Extended Bold | Dialog and section titles |
| `body` | Diatype Extended Regular | Chat messages, descriptions, table cells |
| `label` | Diatype Mono, uppercase, tracked | Eyebrows, metadata, column headers, status labels, breadcrumbs |
| `numeric` | Doto | Only large decorative numbers (step counts, KPIs, chapter-style indexes); never for data that must be read precisely in tables |

⚠ An **extended** typeface is wide: long UI strings (table cells, buttons, nav labels) will take noticeably more space than today's Inter. Test density before adopting it for body text in dense views; Diatype Extended for display only, with a non-extended text face for dense UI, is an option **to confirm with the brand team** — the book itself uses Extended for text.

---

## 4. Visual language

### Shapes and corner radii
- **[Spec]** The spark: the four-pointed star "cut from the wordmark itself, where the a meets the r" (p. 9).
- **[Inferred]** Image tiles and colour cards use **moderate rounded corners**, the same radius throughout a page (pp. 8–11, 14–21).
- **[Inferred]** The app icon is a **squircle** (continuous-corner rounded square) (pp. 9, 16).
- **[Inferred]** Interactive objects are **pills and squircles**: prompt field, toggle, search field, buttons, glass logo plaque (pp. 16, 20).
- ⚠ **Gap:** no radius values.

### Borders
- **[Inferred]** Thin hairline rules separate list rows and text blocks (index, voice, logo specs, frosted-light list). Rules can be **coloured**: Ink for "human", violet for "AI", Ember for "Noor" (p. 5).
- **[Inferred]** Light-ground cards have a very faint outline (pp. 9, 11 — the Sand swatch).
- **[Inferred]** Glass objects have a **bright, refractive edge** rather than a border.
- ⚠ **Gap:** no stroke widths or colours.

### Depth, shadows and lighting
- **[Spec]** "Frosted, never flat." (p. 14)
- **[Spec]** The app icon is "lit from inside" (pp. 9, 16).
- **[Spec]** Interface recipe: **"01 Frosted glass body · 02 Spectrum underneath · 03 Ink or white on top"** (p. 16).
- **[Inferred]** Depth comes from **light, not shadow**: objects cast a soft **coloured glow** (Noor) onto the ground below them instead of a grey drop shadow (pp. 10, 16, 20).
- **[Inferred]** Glass is thick and soft: rounded bevels, inner refraction, subtle highlights along the top edge.
- **[Inferred]** Flat "page" elements (text, rules, cards) have no shadow at all. Depth is reserved for objects you would touch.

### Textures
- **[Inferred]** Visible **grain/noise** on every gradient and glow (pp. 1, 3, 11, 13, 22).
- **[Inferred]** Heavy **blur** on large background shapes (chapter numerals, the spectrum cloud).

### Decorative elements
- **[Inferred]** Large blurred **chapter numerals** in Ink over the spectrum (pp. 3, 7, 13, 17).
- **[Spec]** "Coordinates and spark sign every post" (p. 19). **[Inferred]** Coordinates appear in small mono ("24.45° N 54.38° E").
- **[Inferred]** Small spark sign in Ember or Ink in a corner; viewfinder **corner brackets** framing an object with a mono tag ("PRISM 01", "FOCUS 100%") (pp. 19–20).
- **[Inferred]** A row of small coloured squares as a progress/step marker (p. 19, "One idea. Every format.").

---

## 5. Component styling

The book shows components only as **3D glass objects in marketing visuals** (pp. 16, 19–20). It specifies one recipe; everything else is inferred from those visuals.

**[Spec] The control recipe (p. 16):** frosted glass body → spectrum underneath → Ink or white on top.

| Component | What the book shows | Tag |
|---|---|---|
| **Toggle / switch** | Glass pill track with the Cobalt→Ember spectrum inside; round **Ember** knob carrying a white spark (p. 16, p. 20 "Switch on the spark") | [Inferred] |
| **Prompt / search field** | Long glass pill on a light ground with a Noor glow beneath; placeholder text ("Ask anything") in grey; round Ember action at the end (p. 20). Variant: white pill, Ink round "spark" button at the start, text, cursor, round **Cobalt** arrow button at the end (p. 19) | [Inferred] |
| **Chat bubbles** | Frosted glass speech pills: "Make it brighter" (user), an empty glowing pill (in progress), "On it ⋯" with Ember dots (AI typing) (p. 20) | [Inferred] |
| **Tags / pills** | Small, solid-filled, uppercase mono labels: **Cobalt = human**, **Ember = AI**, Ink = neutral ("STRATEGY", "CREATIVE", "TECHNOLOGY", "HUMAN", "+ AI") | [Spec] colour meaning p. 19; shape [Inferred] |
| **Buttons (marketing)** | Ink pill "FOLLOW", light pill "MESSAGE" (p. 19); small Cobalt pill "EXPLORE" + round arrow (p. 20); round white button with Cobalt arrow on a Cobalt band (p. 19) | [Inferred] |
| **Icon tile** | Glass squircle with the spectrum inside and a white glyph ("mail" icon) (p. 16) | [Inferred] |
| **Slider** | Glass track with an Ember knob (p. 20, "Different tools. One spark.") | [Inferred] |
| **Cards (content)** | Light ground, one image, two-line headline, mono label; or a full-bleed **solid band** (Cobalt, Ember or Ink) with white headline for statements (pp. 19–20) | [Spec] "Light grounds for ideas, Cobalt, Ember or Ink bands for statements" (p. 20) |
| **Floating info card** | Frosted white panel over an image with a mono label, two-line headline and small pills/buttons (p. 20, "Wear the light", "See the next horizon") | [Inferred] |

⚠ **Gaps** — the book does not cover: inputs (text fields, selects), dropdowns/menus, tabs, navigation, tables, modals/dialogs, toasts, tooltips, avatars, empty states, loading states, or **any interactive state** (hover, pressed, focus, disabled, selected, error). All of these need [Proposed] specs (see section 9).

---

## 6. Layout principles

- **[Spec]** "One idea per surface" (p. 18). "One cluster per frame" (p. 14). "One frosted object or one translucent machine per post" (p. 19). "One portrait, one glow, one line" (p. 21).
- **[Spec]** Logo clear space: 1x on every side, where x is the height of the spark. Minimum size: digital **120 px wide**, print 30 mm wide (p. 8).
- **[Inferred]** Every page shares a frame: mono label top-left (brand) and top-right (section), mono label bottom-left (document) and Doto page number bottom-right. Wide, even outer margins.
- **[Inferred]** Two-column composition: title and short copy on the left, the visual or the list on the right; strong left alignment; large empty areas left intentionally empty.
- **[Inferred]** Lists are rows separated by hairlines, with an index number (Ember, Doto) on the left and the item in text weight.
- **[Inferred]** Low density, strong hierarchy: one large title, one short paragraph, then supporting rows.
- ⚠ **Gap:** no grid (columns, gutters), no spacing scale, no breakpoints.

---

## 7. Imagery, iconography and motion

### Imagery
- **[Spec]** "One world: real faces from the region, translucent machines and the light between them. Warm white ground, one glow, a human gesture in every frame." (p. 15)
- **[Spec]** Campaign: "One portrait, one glow, one line." (p. 21)
- **[Inferred]** Translucent robotic hands and heads, holding or reacting to light (flower, prism); people in regional dress; light streaks across faces; soft, warm studio light.

### Iconography
- **[Spec]** "The app icon is the spark, lit from inside." (p. 16)
- **[Inferred]** UI icons in the marketing examples are simple **outline icons with rounded ends** (like/comment/share, search, arrow, mail glyph) (pp. 16, 19).
- ⚠ **Gap:** no icon set, stroke width, grid or size rules.

### Motion
- **[Spec]** Frosted light is "used for key visuals, backgrounds and motion" (p. 14). The glass logo is "kept for film, events and launches" (p. 10).
- ⚠ **Gap:** no motion principles, durations or easing.
- **[Proposed]** Motion as light: glows that slowly drift or breathe, spectrum moving Cobalt → Ember, glass that brightens on hover. No bouncing, no playful overshoot (contradicts "grounded"). Respect reduced-motion settings.

---

## 8. Do's and don'ts

### Explicit [Spec]
| Do | Don't |
|---|---|
| Use Ink on Sand by default; Sand on Ink for night and premium print (p. 10) | Fill the logo with the spectrum (p. 8) |
| Keep 1x clear space around the logo; min. 120 px wide on screen (p. 8) | Use the glass logo outside film, events and launches (p. 10) |
| Use Noor only as glow and glass (p. 11) | Treat Noor as a flat colour (p. 11: "Not a colour") |
| Make the spectrum flow Cobalt → Ember (p. 14) | Show more than one cluster per frame (p. 14) |
| Keep materials frosted (p. 14) | Make them flat (p. 14: "Frosted, never flat") |
| One idea per surface (p. 18); ink objects carry the spark, glass objects carry the light (p. 18) | Run the wordmark large or off-frame in documents (p. 21: posters only) |
| Use Cobalt pills for human, Ember for AI (p. 19) | Write hype or jargon (p. 6: "Leveraging holistic AI-driven synergies", "Unleash limitless innovation", "The future is here") |
| Keep colour proportions near 45 / 20 / 15 / 5 / 5 (p. 11) | |

### Inferred from the examples
- Do keep large calm Sand areas and let one object hold all the colour.
- Do set labels in uppercase mono; numbers in Doto.
- Don't add grey drop shadows to glass; use a coloured glow underneath.
- Don't use gradients without grain or as flat UI fills.
- Don't put Ember next to Ember: it is the 5% spark, not a fill colour.

---

## 9. Application to the Spark platform

Everything in this section is **[Proposed]** unless tagged otherwise.

### 9.1 What changes compared with today's UI
| Area | Today (code, `src/styles/tokens.css`) | Brand book | Implication |
|---|---|---|---|
| Default theme | Dark first (`--bg #08090e`, navy surfaces) | **Light first**: Sand 45% of use, Ink 20% (p. 11); dark only "for night and premium print" (p. 10) | ⚠ Biggest decision: switch the default to a Sand theme, or keep dark and treat it as the "night" version built from Ink |
| Accent | `--accent #3d7bff`, buttons `#4a69b0` | Gulf Cobalt `#1E3BD6` | Replace with Cobalt; note Cobalt fails as text on dark (2.4 : 1) |
| AI colour | Blue/violet glows, the fluid orb | **Ember = AI**, Noor = AI light (p. 19, p. 5 "AI power · the prism") | AI moments should carry Ember / the Noor spectrum, not more blue |
| Type | Inter (UI), Archivo (display) | Diatype Extended, Diatype Mono, Doto, Hacen Casablanca | Licence and load the brand fonts; replace Archivo; review density |
| Material | Raised dark slabs, translucent navy fills | Frosted glass + spectrum underneath | Keep the volume, swap the recipe to glass + Noor |
| Arabic | Not supported | Hacen Casablanca, same weight and width (p. 12) | Plan RTL and Arabic type early |

### 9.2 Foundations
- **Themes.** *Day* (default): Sand ground, Ink text, white or slightly warm cards. *Night*: Ink ground, Sand text. ⚠ The book defines no surface steps between Sand/white or above Ink; the platform needs 2–3 surface levels per theme — propose them as tints of Sand and Ink and get them approved.
- **Accent rules.** Cobalt for primary actions, selection, focus and links on light grounds. On Ink, use a light tint (Corniche Haze) for links and focus rings. Ember only for AI marks and the spark; never for errors.
- **Semantic colours.** Add success/warning/error/info outside the brand palette, muted, and never on brand surfaces (e.g. not as a band behind a headline).
- **Noor.** One token family for the glow (Cobalt → Ember, with grain), used only behind or inside glass and AI elements; one glow per screen ("one cluster per frame").

### 9.3 Navigation
- Ink or Sand rail/sidebar, flat, no glass (navigation is "the page", not an object).
- Section labels and the current location in uppercase Diatype Mono (mirrors the book's page header "02 · IDENTITY").
- Active item: Cobalt indicator or Cobalt text on Day; Haze on Night.
- Logo: Ink on Sand / Sand on Ink only; min. 120 px wide; the spark alone as the compact/collapsed mark and favicon (p. 9 "the brand in one shape").

### 9.4 Chat interface
This is where the brand concept maps most directly: **the user's message is the input (human), the assistant is the prism (AI), the answer is the light.**
- **Composer:** a glass pill with Noor underneath, following p. 19–20: spark button at the start, text, round Cobalt send button at the end. The glow intensifies while typing and while the assistant works.
- **Messages:** user messages flat and quiet (Ink on Sand, or a Cobalt-tinted bubble — Cobalt = human); assistant messages with an Ember/Noor marker (the spark), never a heavy glass card around long text (readability over effect).
- **Typing / working state:** "On it ⋯" with Ember dots, as on p. 20.
- **Pills in answers:** Cobalt for human-provided context (files, brief), Ember for AI-generated items (p. 19).
- **Copy:** follow the voice — short, specific, no hype ("Here's what I found." not "Unleashing insights!").
- **Empty state:** a two-line headline in Diatype Extended with the second line in Cobalt (p. 19), a mono label above it, suggestion chips below.

### 9.5 Agent cards
- Card body: flat light card (Day) or Ink card (Night) with a hairline edge — the card is "the page".
- One glass object per card at most: the agent's icon tile (glass squircle, spectrum inside, white glyph — p. 16 recipe).
- Mono uppercase label for the agent's category; title in Diatype Extended Bold; one-line description.
- Status/meta in Doto only for prominent numbers (e.g. runs, success rate), Diatype Mono for everything else.
- Human vs AI ownership as pills: Cobalt "HUMAN", Ember "AI".
- A Cobalt/Ember/Ink **band** variant only for featured or statement cards (p. 20 "bands for statements"), one per view.

### 9.6 Components and interactive states
| Component | Proposal |
|---|---|
| Primary button | Solid Cobalt pill, white label; on Night a lighter Cobalt with Ink label may be needed for contrast — test |
| Secondary button | Ink pill on Day (like "FOLLOW"), Sand/white pill with Ink label on Night |
| AI action button | Glass pill with Noor underneath and the spark glyph; the only glass button type |
| Inputs, selects | Flat fields with a hairline edge; focus = Cobalt ring (Day) / Haze ring (Night) |
| Toggle | Glass track with spectrum, Ember knob when on (p. 16); a flat fallback for dense settings lists |
| Tabs | Mono uppercase labels with a Cobalt underline for the active tab |
| Dropdowns, menus | Flat Sand/white (Day) or Ink (Night) panel, hairline edge, soft neutral shadow for elevation (⚠ the book shows no shadows on flat UI; this is a functional exception) |
| Modals | Flat panel; one glass icon tile at the top for success/AI moments only; title in Diatype Extended Bold |
| Tags / status | Small solid pills, uppercase mono; brand colours only for human/AI meaning, semantic colours for status |
| Hover | Glass: brighter glow; flat: subtle tint toward Cobalt (Day) or lighter Ink (Night) |
| Pressed | Glass: glow tightens, object sinks; flat: one step darker |
| Focus | Always visible ring, Cobalt on Day, Haze on Night (never colour alone) |
| Disabled | Reduced opacity, no glow |
| Loading / AI working | Noor shimmer or slow spectrum drift along the element edge; Ember dots for "typing" |

### 9.7 Open questions for the brand team
1. Default theme for the platform: Sand (light) as the book implies, or Ink (dark) as today?
2. Role of **Corniche Haze**, and the values of the secondary text grey, the hairline grey and the warm Sand tint used in the book.
3. **Noor** gradient stops (the violet and pink between Cobalt and Ember), grain amount and blur.
4. Web licences for Diatype Extended, Diatype Mono and Hacen Casablanca; the exact Doto variant ("Doto Rounded").
5. Is Diatype Extended acceptable for dense UI text, or should a non-extended companion be used for tables and forms?
6. Corner radii, spacing and grid — the book has none; approve the platform scale.
7. Semantic colours (success/warning/error) — confirm they may sit outside the five brand colours.
8. Arabic/RTL: is Arabic in scope for the platform at launch?
9. Motion principles and timings for glow, glass and the spark.
10. May the spark glyph be used as the AI assistant's avatar/mark in the product?
