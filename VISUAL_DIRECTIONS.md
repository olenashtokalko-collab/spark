# Spark — Two Visual Directions

Purpose: decide the main visual direction for the Spark platform before implementing the brand guidelines. Companion to [BRAND_GUIDELINES.md](BRAND_GUIDELINES.md); the same tags are used:

- **[Spec]** stated in *Spark Studios Brand Guidelines 2026* (page in brackets)
- **[Inferred]** consistent across the brand book's examples, not stated
- **[Product]** a product design decision the brand book does not make
- Contrast ratios are *computed* from the brand HEX values (WCAG 2.x); they are not in the book.

Reference point: the **current Spark UI** (dark navy, `#08090e` ground, Spark-blue accents, raised pill buttons, translucent controls, fluid orb for AI, Inter/Archivo). Nothing in the code has been changed.

---

## Shared foundations (both directions)

These hold in A and B, so the comparison below only covers what differs.

| Decision | Source |
|---|---|
| Five colours: Sand `#F8F6F2`, Ink `#0E1116`, Cobalt `#1E3BD6`, Ember `#E8501F`, Haze `#C8D8F0` | [Spec] p. 11 |
| **Cobalt = human, Ember = AI** | [Spec] p. 19 ("Pills: Cobalt for human, Ember for AI") |
| Noor (Cobalt → Ember spectrum) only as **glow and glass**, never a flat fill | [Spec] p. 11, p. 14 |
| Controls: frosted glass body, spectrum underneath, ink or white on top | [Spec] p. 16 |
| One glow / one glass cluster per screen | [Spec] p. 14 "One cluster per frame", p. 18 "One idea per surface" |
| Diatype Extended (display, text), Diatype Mono (labels), Doto (numbers) | [Spec] p. 12 |
| Voice: short, specific, confident, no hype | [Spec] p. 6 |
| Semantic colours (success, warning, error) outside the brand palette; Ember is never "error" | [Product] — book has no semantic colours |
| Grey text, hairlines and surface steps derived from Sand and Ink (opacity mixes), approved by the brand team | [Product] — book gives no greys |

**The human/AI rule is the backbone of both directions.** In the product, "human" means what the user owns or does (their message, their files, their primary actions, selection, focus); "AI" means what Spark's assistant does (its answers, its working state, AI-generated items, AI actions). The current UI uses blue for both; both directions fix that.

---

## Direction A — Light-first

**One line:** the brand book, applied literally. Sand pages, Ink type, one frosted AI object per screen.

### A1. How the brand translates
- The platform looks like the brand book's pages: warm off-white ground, Ink headlines in Diatype Extended, mono labels in the corners of panels, hairline-ruled lists. **[Inferred]** pp. 2–16.
- "Human mind = clear light" becomes the calm, flat Sand workspace; "AI = the prism" becomes the one glass, spectrum-lit element on each screen (the composer, the assistant's mark, an AI action). **[Spec]** concept p. 5; mapping **[Product]**.
- Proportions stay close to the book: mostly Sand and white, Ink for type and the nav, Cobalt for actions, Ember for the spark. **[Spec]** 45/20/15/5/5, p. 11.

### A2. Look and feel by area
| Area | Direction A |
|---|---|
| **Navigation** | Ink rail or sidebar (the "20% Ink" of the page) with Sand icons and labels; active item marked in Haze or a Cobalt indicator. Or a Sand sidebar with Ink text and a Cobalt active marker. Logo Ink on Sand / Sand on Ink only. [Spec] logo p. 8, 10; layout [Product] |
| **Chat** | Sand thread. User messages: flat, Cobalt-tinted bubble or Ink text in a white bubble (human). Assistant answers: plain Ink text on Sand, introduced by the Ember spark mark; no card around long text. Working state: "On it ⋯" with Ember dots. [Inferred] p. 20 bubbles; [Product] mapping |
| **Composer** | The one glass object: frosted white pill with Noor glowing underneath; Ink spark button at the start, round Cobalt send at the end — almost exactly the book's p. 19 prompt field. Glow strengthens while typing and while the assistant works. [Inferred] p. 19–20 |
| **Agent cards** | White cards with a hairline edge on Sand; glass squircle icon tile with the spectrum inside and a white glyph (the p. 16 recipe); mono uppercase category; Ink title; Cobalt "HUMAN" / Ember "AI" pills. A Cobalt, Ember or Ink band variant only for one featured card. [Spec] bands p. 20; rest [Product] |
| **Inputs** | Flat white fields, hairline edge, Ink text, grey placeholder; focus ring Cobalt. [Product] |
| **Buttons** | Primary: solid Cobalt pill, white label. Secondary: Ink pill (like "FOLLOW", p. 19) or white pill with Ink label. AI action: glass pill with spark and Noor underneath. [Inferred] p. 19; [Product] |
| **States** | Hover: flat elements tint toward Cobalt, glass gets brighter glow. Pressed: one step darker / glow tightens. Focus: Cobalt ring, 2 px, always visible. Disabled: lower opacity, no glow. AI working: slow spectrum drift on the composer edge. [Product] |

### A3. Readability, contrast, hierarchy
| Pair | Contrast | Use in A |
|---|---|---|
| Ink on Sand | 17.5 : 1 | Body and headings |
| Cobalt on Sand | 7.3 : 1 | Links, active labels, human accents as **text** — works |
| White on Cobalt | 7.9 : 1 | Primary button labels |
| Ink on Haze | 13.1 : 1 | Selected rows, info backgrounds |
| Ember on Sand | 3.5 : 1 | Icons, the spark, large labels only — **not body text** |
| Ink on Ember | 5.1 : 1 | Text on Ember pills/bands |
| White on Ember | 3.8 : 1 | Large/bold text only |
| Secondary text, Ink at ≥ 60 % over Sand | ≈ 4.8 : 1 | Passes AA; below ~60 % it fails [Product] |

- Hierarchy comes from type weight and size (Extended Bold vs Regular vs Mono), not from colour — exactly how the book works.
- Risk area: glass on a light ground has **low-contrast edges**. Any glass control needs an Ink or white glyph on top (p. 16) and a visible boundary (≥ 3 : 1 against Sand) for accessibility.

### A4. Specified vs product decisions
- **Specified by the book:** light ground as the default (Sand 45 %), Ink type, logo versions, colour roles of Cobalt/Ember, the control recipe, the composer pattern, bands for statements, typography roles.
- **Product decisions:** surface steps (Sand → white cards), grey text and hairline values, semantic colours, focus/hover/pressed/disabled states, radii and spacing, nav structure, dense views (tables, settings), loading states, and the type scale for UI sizes.

### A5. Advantages, risks, trade-offs
**Advantages**
- Closest to the brand book; every example in it is on a light ground, so the glass recipe, the prompt field and the bands can be reused almost one-to-one.
- Gulf Cobalt works as a text/link colour (7.3 : 1); in B it does not.
- Easier long-form reading (AI answers, proposals, documents) and better for enterprise contexts: daylight offices, screenshots, decks, printing.
- Noor reads as **light on a warm ground**, which is the brand's actual metaphor ("bring sparks to light").

**Risks**
- Largest change from today's UI; the current dark atmosphere (glow behind every page, orb) disappears.
- Glass and glow are subtler on light; done badly, the UI looks flat and generic "SaaS white".
- Ember as text on Sand is weak (3.5 : 1); AI labels must be bold, large, or carried by the spark icon and Ember pills with Ink text.
- Warm Sand plus extended type can feel like a magazine rather than a tool unless density is handled carefully.

**Trade-off:** brand fidelity and readability over the current atmosphere and "wow" factor.

---

## Direction B — Dark-first

**One line:** the brand's "night" version as the main mode. Ink pages, Sand type, glass and Noor glowing in the dark.

### B1. How the brand translates
- Built on the book's reverse version, "Sand on Ink for night and premium print" (**[Spec]** p. 10), extended to the whole product. The book shows no dark UI; everything beyond the logo and Ink bands is **[Product]**.
- "Light in the dark": Noor and glass become the brightest things on screen, so AI moments feel like light switching on. Strong match to the Cybernoor story (p. 5), weaker match to the book's proportions (Ink becomes ~45 %+ instead of 20 %).
- Closest to the current Spark UI, so the existing raised pills, translucent controls and glows can evolve rather than be replaced.

### B2. Look and feel by area
| Area | Direction B |
|---|---|
| **Navigation** | Slightly raised Ink surface (a lighter Ink step) on the Ink ground; Sand icons; active item in Haze or a Cobalt fill with white icon. Logo Sand on Ink. [Spec] logo p. 10; rest [Product] |
| **Chat** | Ink thread. User messages: Cobalt-filled bubble with white text (7.9 : 1). Assistant answers: Sand text on Ink, introduced by the Ember spark; the assistant's working state glows Ember/Noor. [Product] |
| **Composer** | Frosted glass pill whose Noor underneath is clearly visible on dark — the strongest, most "brand" moment in B. Needs a lit top edge and a clear boundary so it doesn't dissolve into the ground. [Product], recipe [Spec] p. 16 |
| **Agent cards** | Lighter-Ink cards with a faint light edge; glass icon tile glowing with the spectrum; Sand title; Haze or Sand-grey description; Cobalt/Ember pills with white or Ink text. One featured card can use a Cobalt or Ember band. [Product] |
| **Inputs** | Translucent Sand-tinted fields on Ink (close to today's translucent controls); Sand text; focus ring in **Haze**, not Cobalt. [Product] |
| **Buttons** | Primary: Cobalt pill with white label **plus a lit edge** so it separates from the Ink ground. Secondary: Sand-tinted translucent pill, Sand label. AI action: glass pill with Noor. [Product] |
| **States** | Hover: glow brightens / surface one step lighter. Pressed: glow tightens, slight sink. Focus: Haze ring. Disabled: lower opacity, no glow. AI working: spectrum drift, Ember dots. [Product] |

### B3. Readability, contrast, hierarchy
| Pair | Contrast | Use in B |
|---|---|---|
| Sand on Ink | 17.5 : 1 | Body and headings |
| Haze on Ink | 13.1 : 1 | Links, focus rings, human accents as **text** |
| **Cobalt on Ink** | **2.4 : 1** | **Fails** for text, icons and thin lines; also below 3 : 1 as a button boundary — Cobalt can only be a **fill** with white text and a lit edge |
| White on Cobalt | 7.9 : 1 | Primary button labels |
| Ember on Ink | 5.1 : 1 | AI labels and icons — works better than on Sand |
| Secondary text, Sand at ≥ 55 % over Ink | ≈ 5–7.7 : 1 | Passes AA; must be re-checked on lighter Ink surfaces [Product] |

- Hierarchy needs surface steps (Ink → lighter Ink → glass) plus type; the book defines none of these steps.
- Glows reduce local contrast: text must never sit directly on a bright Noor glow without a backing surface.

### B4. Specified vs product decisions
- **Specified by the book:** Sand on Ink as a legitimate version ("for night and premium print"), Ink bands for statements, colour roles, control recipe, typography roles.
- **Product decisions:** almost everything else — using night as the default at all, Ink surface steps, Sand grey steps, a light Cobalt variant or Haze for human accents on dark, button edges, glass treatment on dark (book shows glass only on light grounds), semantic colours, all states, density, radii, spacing.

### B5. Advantages, risks, trade-offs
**Advantages**
- Smallest change from the current UI; existing components, glows and the composer evolve rather than restart.
- Ember and Noor glow brilliantly on Ink; AI moments are unmistakable.
- Feels premium and focused; matches "night and premium" in the book and the current team's taste.

**Risks**
- **Cobalt, the leading brand colour, can't be used as text, icon or outline on Ink.** The "human" colour must move to fills only or to Haze, which weakens the human/AI pairing.
- Departs from the book's proportions (Sand 45 % → mostly Ink) and from every UI example in it; the brand team may see it as off-brand.
- Glass is designed for light grounds in the book; on dark it easily turns muddy grey or relies on heavy glow.
- Long answers and documents are harder to read on dark for many users; screenshots and printouts look heavy.
- Easy to drift back to the current generic "dark AI app" look (blue glow, violet gradients) instead of the Spark brand.

**Trade-off:** continuity and atmosphere over brand fidelity and colour flexibility.

---

## Side by side

| | A — Light-first | B — Dark-first |
|---|---|---|
| Brand book fit | High — matches proportions and all examples | Medium — uses the "night" version as the default |
| Cobalt (human) as text | Works (7.3 : 1) | Fails (2.4 : 1); fills only, Haze for text |
| Ember (AI) as text | Weak (3.5 : 1), large/bold only | Good (5.1 : 1) |
| Glass and Noor | Subtle, needs care to not look flat | Dramatic, needs care to not look muddy |
| Long-form reading | Better | Harder for many users |
| Change from current UI | Large | Small |
| Decisions still to make | Fewer (book covers more) | More (book shows no dark UI) |

---

## Recommendation: explore Direction A first

1. **It's what the brand book specifies.** Sand is 45 % of the palette, dark is described as the night/premium variant, and every UI example (prompt field, toggles, chips, cards, bands) is on a light ground. A gives the brand team the least to object to.
2. **The human/AI colour rule holds without compromise.** Cobalt works as text, fill and focus on Sand; in B, the brand's leading colour can't be used as text at all.
3. **More of A is already decided by the book**, so it's faster to reach a credible, consistent prototype and the open questions are fewer.
4. **It suits enterprise use:** long AI answers, proposals and documents, daylight offices, shared screenshots and decks.
5. **B can follow from A cheaply.** Once A's tokens exist (surfaces, text steps, glass, Noor), a night theme is mostly a token swap; the reverse is harder, because B needs a separate human-accent colour (Haze or a lighter Cobalt) that A doesn't.

**What to watch while exploring A:** keep one glass/Noor element per screen so the UI doesn't go flat or generic; make AI moments carry Ember through the spark mark and Ember pills (bold text or Ink-on-Ember), not small Ember text; test Diatype Extended at UI sizes in dense views (tables, settings) early.

**Suggested first prototype scope for A** (when we move to code): the chat start screen and a chat thread, one agent/folder card grid, the navigation, and one modal — the four places where the human/AI rule, glass and type hierarchy are all visible. Behind a theme switch, so the current UI stays available for comparison.
