
# Visual Design Decisions — Color & Buttons
*This document captures rationale, not just values — check here before assuming a color or button treatment is unintentional or undocumented. This is a living reference: amend in place as decisions change. Do not snapshot or date this document the way the project Knowledge Base is snapshotted — outdated values should be corrected in place, not stacked underneath new entries.*
 
---
 
## 1. Design Philosophy (context for everything below)
 
Visual design = structure (how it works: hierarchy, spacing, accessibility — stable, slow to change) + expression (how it feels: color, type, shape — shifts with the brand). Structure without expression is generic; expression without structure is decoration.
 
**Sequencing principle used throughout this project:** token/theory work first, then real visual testing against actual UI context, then formalize what tested well back into tokens. Formulas and math tell you if something is *technically sound*; only rendering it against real content tells you if it *works*. Several decisions below were only finalized after being tested visually, not calculated in isolation — flagged where it happened.
 
**Design principles guiding the visual language:**
- User's data and content gets attention; wayfinding (nav, chrome) recedes into the background.
- Buttons and controls look clickable — subtle gradients and shadow signal depth and interactivity, applied deliberately, not everywhere.
- Reduced "boxes within boxes" and line separators — less nested visual noise.
- Moved past pure black/white and generic gray-on-white SaaS default — a cool tone runs through surfaces, giving the product identity without sacrificing lightness.
**Material metaphor:** UI should feel like quality materials layered on a flat surface — real light, real shadow, real depth — not flat design, but also not neumorphism or glassmorphism applied uncritically. Each borrowed technique is evaluated for where it's safe to use and where it creates real risk (see §4, within each button tier, and §6).
 
---
 
## 2. Color System
 
### 2.1 Two governing principles (read this before anything else in this section)
 
**Principle 1 — One dominant hue family, one deliberate outlier.** Sage, Ink, and Teal all live in the same cool hue neighborhood, roughly 150°–186°. This is intentional, not an oversight: the product is data-dense, and restraint through a shared hue family reduces visual noise more than independently "loud" colors would. Blue (~217°) is the **single true outlier** — it carries all of the system's hue contrast on its own (links, focus rings), which is exactly why it works as an accent: there's nothing else competing with it for that job. Any future color decision should ask first whether it can live inside the existing family before introducing a new hue.
 
**Principle 2 — Material names for color, with one confirmed exception.** Sage, Ink, and Teal are material/object names, deliberately, not "Green-100" or "Teal-700." If a hue gets nudged slightly during tuning (as happened more than once with Teal), a literal color name becomes a lie; a material name has slack built in. Material names also communicate role at a glance — Sage reads as a quiet surface, Ink reads as the substance that marks text.
 
**Blue, Red, Green, and Amber are deliberate, permanent exceptions to this rule, not a lapse in it.** Blue was originally named Cobalt — itself a material name, consistent with the rule above — before the ramp was expanded to its current 7 steps and renamed to the literal "Blue." Red, Green, and Amber were added in a separate, dedicated session specifically to carry status roles: error/destructive (Red), success (Green), and alert (Amber) — see §2.6–2.8. All four are literal color names, confirmed deliberate, not an oversight.
 
**The unifying reason:** literal names are used when a color's job is to match a convention people already expect from outside this system — danger reads as red, success as green, warnings as amber, links as blue, everywhere, not just here. A material name would only obscure that recognition rather than add the "slack" material names give Sage, Ink, and Teal. So the rule is really: **material names for the system's own invented surfaces and text colors; literal names for colors doing a borrowed, universally-recognized semantic job.** Apply that distinction to any new primitive family added later, rather than treating Blue/Red/Green/Amber as four unrelated one-off exceptions.
 
### 2.2 Sage — surfaces (primary role), plus light text-on-dark use
 
Sage is not exclusively non-text. Its core role is surfaces, but its lightest steps are also used as **button text when sitting on a dark fill** (e.g., Sage 200 as text on Primary's Teal fill). This isn't a scope violation — the same "light, receding" character that makes Sage work as a quiet surface also makes it work as legible light text on a dark surface. Sage is not, however, used for body text on light surfaces, borders carrying a compliance signal, or links — those remain Ink's and Blue's jobs respectively.
 
| Token | Hex | HSL |
|---|---|---|
| Sage 100 | `#F8FAF9` | H150 S17 L98 |
| Sage 200 | `#F3F7F6` | H165 S20 L96 |
| Sage 300 | `#EAF1EF` | H163 S20 L93 |
| Sage 400 | `#DAE7E3` | H162 S21 L88 |
| Sage 500 | `#C8DAD4` | H160 S20 L82 |
| Sage 600 | `#B6CEC6` | H160 S20 L76 |
| Sage 700 | `#A3C2B8` | H161 S20 L70 |
| Sage 800 | `#91B6AA` | H161 S20 L64 |
 
- **100–300**: page background, card surfaces, content areas. Card gradient = 100→200 (deliberately close, produces a subliminal "polish" transition — do not remove either step).
- **400, 200**: secondary and tertiary button fills, respectively. **200 also doubles as button text color** on dark (Teal) fills — see above.
- **500–800**: reserved for hero cards / high-emphasis surfaces. Confirmed direction (not yet built): dark, glass-like sage surfaces per mood-board inspiration.
**Why there's no Sage 900, and why Ink 700 fills that gap instead:** A need was identified for hero-card/high-emphasis surfaces dark enough to hold light text at real contrast — Sage 800 fails this (~2.2:1 with white text). A dedicated Sage 900 was explored: it would need to sit around L38, a much bigger jump than any other step in this ramp (5–6 points between existing steps vs. ~26 here). At that lightness, it collided with Ink 700 (RGB distance 11.5 — the same failure mode Teal and Ink had before that was fixed). Raising saturation to fix the collision cost contrast, and vice versa; no clean value emerged. **Resolution: reuse Ink 700 (`#4A6B6D`) as the dark surface fill instead of inventing Sage 900.** It already holds light text at 5.5–5.8:1, better than any tuned Sage-900 candidate achieved, and required building nothing new.
 
This is the origin of a broader principle that applies across the whole system: **a token's role is not fixed by its original name or intended layer.** If an existing value's measured properties (contrast, hue distance from neighbors) satisfy a new requirement, reuse it rather than inventing a parallel token — even across families kept conceptually separate until that point. Ink is therefore no longer purely a text/border family; it is also a surface-capable color for dark, high-emphasis contexts. Sage's ramp remains 100–800, complete, with no gap — the gap was never really Sage's to fill.
 
### 2.3 Ink — text, borders, shadows, and select dark surfaces
 
Hue ~185°, chosen over pure black for chromatic cohesion with Sage and a gentler reading experience than true black.
 
| Token | Hex | Role |
|---|---|---|
| Ink 900 | `#063236` | Text primary, shadow base, border base |
| Ink 800 | `#34585B` | Text secondary |
| Ink 700 | `#4A6B6D` | **Placeholder text.** Also: dark, high-emphasis **surface fill** (hero cards, callout panels) — see §2.2 for full reasoning on why this token carries two jobs. |
| Ink 600 | `#668284` | **Disabled text.** A standard primitive solid — confirmed September 2026, see below for why it isn't just "Ink 900 at some opacity." |
 
**Why Ink 600 is `#668284`:** Originally a fix to a disabled-text contrast problem. The original disabled-text value (`#7D9596`) was calculated as Ink 900 @ 48% flattened **against white**. The actual disabled button's fill is Ink 900 @ 8% — a translucent tint of the page surface. Checked against that *real* fill rather than white, contrast dropped to ~2.4:1, well below what was assumed. Fix at the time: raised opacity to 56%, and correctly layered it — text = Ink 900 @ 56%, composited **on top of the button's own fill** (Ink 900 @ 8% over the page surface), not on top of the raw page background. Result was consistent across all realistic page contexts (~3.3:1 against the real fill), computed against Sage 200 as the most common surface. **As of September 2026, `#668284` is a locked primitive solid (`ink.600`) in the token file, not a live opacity composition** — it no longer needs recomputing if the disabled fill's opacity or typical background changes, the way the original derivation required. (Disabled text is WCAG-exempt from a hard contrast minimum, so this was a legibility correction, not a compliance fix.)
 
**Ink 900 opacity ladder** (each step is `#063236` at the given alpha — always apply as an opacity, never bake to a flat hex, since the rendered color depends on background):
 
| Opacity | Confirmed use(s) |
|---|---|
| 64% | Input borders, functional borders (~4.2–4.5:1 against sage/white — passes 3:1 UI-component minimum) |
| 48% | *(available, not currently assigned — disabled text no longer uses an opacity composition at all; see Ink 600 above)* |
| 32% | Pressed-state shadow layer |
| 24% | Medium borders, some outer shadows |
| 16% | Decorative borders, dividers, nav-item background |
| 8% | Subtle button borders, faint separation, nav-item background |
| 4% | Subtle tint, header row fill |
 
- **Nav item background** uses Ink 900 @ 4% — ambient only, not legible as a boundary on its own (~1.08:1 against page). If nav selection/active state ever needs to be perceivable on its own, it must carry a second signal (text weight, icon color) — this opacity cannot carry that job alone.
### 2.4 Teal — Primary button material, "charged" states
 
**Locked hue: ~184–186°** — essentially the *same* hue neighborhood as Ink. This was tested and argued through directly, not a default:
 
Teal's job (Primary button, must hold white/light text) forces its dark stops into the same lightness band Ink's dark text occupies. Early teal values were hue-identical to Ink at that lightness *and* similarly saturated — a real collision (verified: RGB distance as low as 8.1 at the 800 step, meaning the two were nearly indistinguishable). Fixing this by shifting hue away from Ink was tested directly: both a blue-lean and a green-lean variant (10–13° hue shifts) were built and rendered, and both were visually rejected as disrupting the palette's harmony once seen next to Sage and Ink.
 
**Resolution: hold hue at Ink's neighborhood, separate via saturation and role instead** (Teal's saturation floor raised from 35% to 42–45% at the dark end; Ink's saturation at the same lightness is much lower). This connects directly to Principle 1 above (§2.1) — restraint through a shared hue family, with separation coming from saturation and role rather than hue, is a deliberate fit for a data-dense product where an independently "loud" accent color would add noise. Primary buttons appear once per page at most, reinforcing that a singular, well-placed action doesn't need to shout in a different hue family to be found.
 
| Token | Hex | HSL |
|---|---|---|
| Teal 900 | `#214D50` | H184 S42 L22 |
| Teal 800 | `#275E63` | H185 S44 L27 |
| Teal 700 | `#2A696F` | H186 S45 L30 |
| Teal 600 | `#35848D` | H186 S45 L38 |
| Teal 500 | `#3C9FAA` | H186 S48 L45 |
| Teal 400 | `#41BAC8` | H186 S55 L52 |
| Teal 300 | `#59CCD9` | H186 S63 L60 |
| Teal 200 | `#73DCE7` | H186 S71 L68 |
| Teal 100 | `#92EAF2` | H186 S78 L76 |
 
**Teal 100 opacity ladder** (extends the same solid+opacity pattern used for Ink, applied to a second hue family — justified because it fills a real, recurring need: a way to tint a surface toward "engaged/interactive" without fully recoloring it):
 
| Opacity | Confirmed use |
|---|---|
| 64% | Primary button hover, entry inset |
| 48% | Tertiary button hover, entry inset |
| 24% | Primary button hover, exit inset (solid); Secondary button default/focus, exit inset |
| 16% | Hover fill tint, layered under the base fill (Secondary, Tertiary) — a genuinely different signal than a lightness change; adds a hue shift, which is more perceptually salient than a small lightness bump at the pale end of a scale |
 
**Corrected September 2026:** this ladder previously listed only 48% and 8%, with 8% documented as the hover fill tint. Real CSS confirms the hover fill tint (`action.tint.hover`) is actually Teal 100 @ 16% (`opacity.200`), not 8%, and the full set of confirmed uses is wider than previously logged, see table above.
 
#### 2.5 Blue — link & focus

*(Corrected September 2026 — formerly documented as "Cobalt," `#0D4DB4`. That value was accurate when Blue was a single defined value in the ramp. The ramp has since been expanded to a full 7-step primitive family, and the focus/link role documented below now belongs to Blue 600, not the old single value. Renamed to match the primitive token's actual family name — see §2.1, Principle 2, for why this is a documented exception to the material-naming convention rather than a violation of it.)*

| Token | Hex | HSL |
|---|---|---|
| Blue 100 | `#A5BFE9` | H217 S61 L78 |
| Blue 200 | `#84A6DB` | H217 S55 L69 |
| Blue 300 | `#7598D1` | H217 S50 L64 |
| Blue 400 | `#3E74CC` | H217 S58 L52 |
| Blue 500 | `#205FC5` | H217 S72 L45 |
| Blue 600 | `#0C47A7` | H217 S87 L35 |
| Blue 700 | `#0A3376` | H217 S84 L25 |

All seven steps are raw primitive values and are not used directly in components. Three have a role in the semantic tokens (below). Steps 100 to 400 have no role yet.

| Step | Hex | Role | Semantic token |
|---|---|---|---|
| Blue 500 | `#205FC5` | Link text, previously visited | `link.visited` |
| Blue 600 | `#0C47A7` | Link text, default. Focus ring and outline color (outer ring layer, see §5) | `link.default`, `border.focus` |
| Blue 700 | `#0A3376` | Link text, hover | `link.hover` |

The system's one deliberate hue outlier (see Principle 1, §2.1). It carries all of the system's hue contrast on its own. Used for link text in three states (always paired with an underline, since color alone is not a sufficient signal) and as the universal focus-ring color across all button tiers.

**Open item:** the reason for choosing Blue 700 for hover and Blue 500 for visited is not yet documented. Blue 100 to 400 have no role. Do not assign one speculatively until a real use appears (see §7).
 
### 2.6 Red — error & destructive
 
| Token | Hex |
|---|---|
| Red 100 | `#F7B6B6` |
| Red 200 | `#EE8C8C` |
| Red 300 | `#D35A5A` |
| Red 400 | `#C84141` |
| Red 500 | `#AC3939` |
| Red 600 | `#913030` |
| Red 700 | `#742525` |
| Red 800 | `#672222` |
| Red 900 | `#541C1C` |
 
Confirmed role: error and destructive states (e.g., the Destructive button, error text/borders, form validation). Named literally and deliberately — see the updated Principle 2, §2.1.
 
**Per-step usage confirmed for the Destructive button** — see §4.7. Usage for error text/border and form validation outside the button is still undocumented — see §7.
 
### 2.7 Green — success
 
| Token | Hex |
|---|---|
| Green 100 | `#A8FAD1` |
| Green 200 | `#59F3A6` |
| Green 300 | `#12E27A` |
| Green 400 | `#10C66B` |
| Green 500 | `#109E57` |
| Green 600 | `#0C7D45` |
| Green 700 | `#0B6538` |
| Green 800 | `#0A522E` |
| Green 900 | `#093E24` |
 
Confirmed role: success states. Same literal-naming reasoning as Red and Blue — see §2.1.
 
**Open item:** per-step usage not yet documented here — see §7.
 
### 2.8 Amber — alert
 
| Token | Hex |
|---|---|
| Amber 100 | `#FCD29C` |
| Amber 200 | `#F9C076` |
| Amber 300 | `#F3A949` |
| Amber 400 | `#ED921D` |
| Amber 500 | `#C37713` |
| Amber 600 | `#995D0F` |
| Amber 700 | `#7C4C0E` |
| Amber 800 | `#68410D` |
| Amber 900 | `#50320B` |
 
Confirmed role: alert/warning states. Same literal-naming reasoning as Red, Green, and Blue — see §2.1.
 
**Open item:** per-step usage not yet documented here — see §7.
 
### 2.9 White
 
`#FFFFFF` — used deliberately in two distinct roles, worth keeping separate when judging "how much white is really in this system."
 
As a **fill color**, sparingly, as a bevel inset color across nearly every button tier's default/hover/pressed recipes (see §4), and as `action.tertiary.hover`'s base fill is *not* white, see the corrected §4.4 below.
 
As an **effect color**, far more pervasively: white is the fixed color behind the entire `glow` primitive family (the button pressed-state effect, §5.1), the gap ring in every focus ring (§4.1, §5.5), and the majority of bevel inset layers across every button tier.
 
### 2.10 Architecture note
 
Primitive → Semantic → Component, role-based semantic naming, numeric-scale primitives — **unchanged**. This project is a value swap and gap-fill against existing architecture, not a rebuild. Teal's saturation exception and Ink's dual role are value-level and role-level decisions within the existing structure, not new architecture.

### 2.11 Marketing Palette Alignment

*Outcome of checking Marketing's agency-built palette against this system. Like the rest of this document, amend in place if Marketing shares new colors or the open check below resolves. Do not stack dated entries.*

**Why this was done.** Marketing hired an outside agency to build a visual refresh separately from the product work. Leadership asked whether the two palettes could feel like they come from the same company, so moving from the marketing site to the product is not jarring. The rule set before starting: use whichever color does its job better. If Marketing's is better, adopt it. If ours is better, keep it. No compromise colors, since a blend that is worse than both options helps no one.

| Marketing palette | Compared with | Verdict |
|---|---|---|
| Teal and Bright Teal | Teal (§2.4) | Keep ours |
| Blue | Blue, link and focus role, Blue 600 (§2.5) | Likely adopt, one check pending |
| Navy | Ink 700 as dark surface (§2.2) | Not adopting |
| Cyan | Sage (§2.2) | Not adopting |
| Creme and Tan | Sage (§2.2) | Not adopting |

**Teal: keep ours.** Marketing's teal is built to grab attention on a landing page, fully saturated and vivid. Ours is built to hold light button text at a safe contrast and stay calm beside a data-heavy screen. Same color family, different job.
- Using Marketing's exact teal fails: text on top becomes too hard to read on several button states.
- Nudging only our hue slightly toward theirs made almost no visible difference and cost some contrast.
- The two teals are already close in hue. No one would notice a difference unless the swatches sat side by side, so teal was never the source of any jarring shift.

**Blue: likely adopt, pending one check.** Marketing's Blue is close to our link color and performs equally well on strength and readability. Once tested visually, it also looked better against Sage backgrounds than our original value did, so adopting it may be a real improvement and not only an alignment exercise.
- **Pending check:** one of Marketing's blue values is also used to mean "Sales" in their system. Before adopting it as the link color, confirm with Marketing that it does not already carry a different meaning that would cause confusion if people see it used both ways.

**Navy: not adopting.** Navy is meant for dark backgrounds holding light text. That problem is already solved here by reusing Ink as a dark surface (§2.2), so no new color is needed. Marketing's Navy is also nearly identical to our darkest Ink, and adopting it would recreate the "these two colors look the same" problem that was already fixed once between Teal and Ink.

**Cyan: not adopting.** Cyan does the same job as Sage (light backgrounds). It is noticeably more saturated, especially at one step where it spikes unevenly, and a side-by-side render confirmed it by eye. Its lightest step is also nearly impossible to tell apart from plain white, a problem that was specifically tested and fixed for Sage early in the project. Shifting Sage's hue toward Cyan's did not close the gap. The real difference is saturation, not hue.

**Creme and Tan (warm backgrounds): not adopting.** This got the deepest testing, to give a firm answer and not a quick no.
- Took the warmer of the two (Creme) and built a full version in the same structure as Sage (same number of steps, same style of darkening), since Marketing's version does not go dark enough for button fills.
- Checked text readability on every step. It passed, so a carefully built warm palette can technically work.
- Tested a version based on a warm color already in the product (the AI chat background). Same conclusion.
- Mocked up a real product screen in the warm palette and compared it directly with the Sage version. The warm background put the product's cool text, links, and buttons in visible tension, and gave the screen a dated "old paper" feel.

This is not a rejection of warm colors, and a warm version could likely be built with the same care as Sage. The issue is that this product uses low saturation on purpose, to keep data-dense screens calm so the user's data stays the focus and not the background. Marketing's palette is tuned for a different goal (visual pop on a marketing site) and was built without reviewing product screens. Retrofitting it would put decisions made for another context onto the screens customers use for real work. Revisit only if a specific, real use case needs a warm color.

**The pattern across all five.** Either Marketing's color did not hold up for the job the product needs (Teal, Navy, Cyan, Creme and Tan), or it was a strong match on its own merits (Blue, pending the check above). Nothing was rejected out of attachment to existing work and nothing was adopted just to avoid a conversation with Marketing. If anyone asks "why not just match Marketing," this section is the answer.

---
 
## 3. Accepted Accessibility Trade-offs — Overview
 
Several button fills/borders fall short of WCAG's 3:1 non-text contrast minimum for boundary-vs-background separation. Each is a **named, conscious trade-off**, discussed in full within its button tier below (§4.3, §4.4) rather than here — this section exists only to state the standing rule:
 
**Any new fill/border pairing that falls under 3:1 should get the same treatment given to Secondary and Tertiary below: name it, state why it's accepted, note what (if anything) compensates for it. Don't let a soft pairing ship silently.**
 
---
 
## 4. Button System
 
### 4.1 Shared structural rules (all tiers)
 
- Corner radius: 12px. Pill shape reserved for badges/chips only.
- Stroke: Ink at varying opacity, 1px weight.
- Text weight: Medium (500), never SemiBold.
- **Light model:** brightness and shadow/color sit on opposite corners (entry ~-2,-4 / exit ~2,4) — mirrored/symmetric offsets, revised from an earlier asymmetric -2,-2 rule once the discrepancy was noticed; symmetric was judged cleaner and easier to generate procedurally for future components.
- Focus ring: 2px white gap (spread 2px, white) + Blue 600 ring (spread 4px) — identical across all tiers. **Corrected September 2026:** real CSS confirms the ring is `0 0 0 4px {border.focus}`, a standalone box-shadow layer with spread 4px measured from the element edge. Previously documented as "3px ring (spread 5)," which described the stacking incorrectly.
- Disabled (universal, all tiers): fill Ink@8%, border Ink@16%, text Ink 600 (§2.3), no shadows.
- **Pressed states are always transient, never persistent** (confirmed) — this is why pressed states are allowed to rely partly on shadow-only cues in places a *persistent* state could not.
- **What actually makes a pressed state read as "recessed":** the outer shadow must be non-directional — a small, zero-offset ambient glow (`0px 0px 8px #FFFFFF`), not merely a softer version of the corner-offset shadow used elsewhere. A directional corner shadow (bright top-left, dark bottom-right, or any offset variant of it) always reads as "raised," no matter how subtle — this was tried and visibly failed (read as more elevated, not less) before landing on the zero-offset ambient version now used consistently across Primary, Secondary, Tertiary, Destructive, and the Navigation component (§4.6). Primary and Tertiary additionally invert which side is brighter between default and pressed (verified by measuring luminance at each inset position); Secondary *deliberately does not* — see §4.3.
- **Focus state, confirmed by rule, all tiers:** every component with a focus state uses the same gap ring + focus ring, layered on top of that component's own unchanged default-state properties (fill, border, bevel). Confirmed directly from CSS for Primary, Secondary, Tertiary, Destructive, and Navigation.
### 4.2 Primary — "Dark teal sea glass"
 
Appears once per page, at most, by design. Text color: Sage 200 (chosen over pure white for a subtler, more "considered" text-on-material relationship — verified 5.8–6.8:1 depending on state, comfortable margin; see §2.2 for why Sage text on a dark fill is within Sage's intended scope, not an exception to it).
 
| State | Fill | Notes |
|---|---|---|
| Default | Solid Teal 700 | Insets: entry Teal 900 (dark/material-shadow side), exit Teal 500 (lighter/glow side) |
| Hover | Solid Teal 900 | Outer glow: Teal 100 (solid, not alpha). Insets: entry Teal 100 @ 64%, exit Teal 100 (solid) |
| Pressed | Solid Teal 700 | No outer directional shadow (ambient white glow only). Insets invert: entry Teal 500, exit Teal 900 — this is the recessed cue |
| Focus | Same as Default + ring | Ring: white spread 2px + Blue 600 spread 4px |
 
**Correction (per current tokens, source of truth):** Default's fill was previously documented as a gradient (Teal 700→800). The tokens carry a solid Teal 700 instead — no gradient primitive for this fill exists. One consequence worth stating explicitly, per the standing rule in §3 against letting anything ship silently: Default and Pressed now share the exact same base fill value (solid Teal 700), differentiated only by their inverted insets and by Pressed's ambient glow replacing Default's directional shadow. This is not an error — pressed-state intensity isn't required to sit below default's in this system (Navigation's pressed state already relies on the same non-monotonic pattern, §4.6) — but it's noted here so it isn't mistaken for a leftover duplicate value later.
 
**Correction (September 2026):** Hover's insets were previously documented as two separate solid steps (entry Teal 400, exit Teal 200). Real CSS confirms both insets are actually Teal 100, one solid (exit), one at 64% opacity (entry), not two different steps on the ramp.
 
No accepted accessibility trade-off here — Primary's fill is dark and saturated enough to separate cleanly from every realistic page background.
 
### 4.3 Secondary — "Light sage, filled"
 
Text: Teal 900 throughout (7.3–7.4:1 against Sage 400 fill).
 
| State | Fill | Notes |
|---|---|---|
| Default | Sage 400 | Border Ink@16% (`border.standard`). Insets: entry white (brightest), exit Teal 100 @ 24% |
| Hover | Sage 400 + Teal 100@16% tint layer | Insets: entry white, exit Teal 100 (solid) |
| Pressed | Sage 400 | No outer directional shadow. Insets: entry **stays white** (does not invert), exit darkens to Sage 700 |
| Focus | Same as Default + ring | Ring: white spread 2px + Blue 600 spread 4px |
 
**Accepted accessibility trade-off:** Fill (Sage 400) vs. realistic page backgrounds (Sage 100–300) measures ~1.1–1.2:1; border (Ink 16–24%) vs. same measures ~1.1–1.6:1. Both well under the 3:1 non-text minimum. Fixes tried and rejected: bumping fill to Sage 500 (barely moves the number, costs restraint), bumping border to 24% (still fails, costs visual softness). **Why accepted:** identifiability is carried by shape, layered shadow/inset depth cues, elevation, and directive copy ("Get started") rather than a hard color boundary — this is the *same underlying weakness* as the contrast failure, not a separate mitigation. For users who can't perceive the soft shadow/gradient cues (low vision, glare, high-contrast display modes), the button may be genuinely hard to distinguish from the page. Context lowers real-world risk more than the raw number suggests (e.g., placement in an expected, labeled location like a header search action) — revisit if this button is reused in a less-structured context, such as a lone CTA in empty content.
 
**Secondary's pressed state deliberately does not invert its light direction**, unlike Primary and Tertiary (see §4.1). Primary and Tertiary are framed as translucent, glass-like materials — light enters, passes through, and glows on the exit side, which is why inversion on press changes how light interacts with the material. Secondary has not yet been given that same translucent-glass material story; keeping a single, fixed light source across all of Secondary's states is the more physically coherent choice if Secondary is conceptually a different, more opaque material. **Open item:** name Secondary's material explicitly (parallel to Primary's "dark teal sea glass" and Tertiary's "near-clear sea glass") so this reasoning is stated directly rather than implied.
 
### 4.4 Tertiary — "Near-clear sea glass"
 
The most frequently-appearing tier; deliberately the most visually restrained. Text: Teal 900 throughout.
 
| State | Fill | Notes |
|---|---|---|
| Default | Sage 200 | Border Ink@8% (`border.subtle`). Insets: entry Sage 400 (material/shadow side), exit white (glow side) |
| Hover | Sage 200 (unchanged) + Teal 100@48% and Ink@8% insets | Signals "engaged" via a hue-tinted inset shift, not a fill change. Outer layer darkens to Ink@16% |
| Pressed | Sage 200 | No outer directional shadow. Insets invert: entry white, exit Sage 500 |
| Focus | Same as Default + ring | Ring: white spread 2px + Blue 600 spread 4px |
 
**Correction (September 2026):** Hover was previously documented as "White (full break from Sage family)," described as a deliberate one-time departure from the Sage tint. This never existed in the real tokens. `action.tertiary.hover`'s base fill is Sage 200, identical to Default, unchanged, real evidence confirms only the bevel insets shift (Teal 100 @ 48% and Ink @ 8%) and the outer layer darkens (Ink @ 16%). There is no fill-level "break to white" anywhere in this tier.
 
**Accepted accessibility trade-off, more extreme than Secondary's:** Fill (Sage 200) is frequently the *exact same value* as the surface it sits on (~1.0–1.15:1). Border similarly soft (~1.15:1). **Why accepted:** deliberate design goal — Tertiary appears frequently on screen; a stronger boundary would add visual noise/cognitive load across many instances. A UX-team finding that previously flagged borderless tertiary buttons as an affordance problem was conducted against the *old* visual language and is informative, not binding, for this new system. **Open risk, not yet solved:** icon-only Tertiary buttons (a stated common future use) lose the "directive copy" signal that partially carries the text version's affordance. Needs: accessible names (aria-label) for icon-only variants, and a tap-target-size check once built — icon-only buttons often get built smaller than their text counterparts.
 
### 4.5 Navigation / Left Nav Item
 
Icon inside a container sharing the button family's shape language (12px radius, consistent sizing) — deliberately adjacent to the button system, not a Tertiary variant. Reused because the *mechanic* is genuinely different: nav is persistent wayfinding with a real "currently active" state, which Tertiary structurally has no equivalent for (Tertiary is a momentary action trigger by design). Per the component-token philosophy (§2.7), a shared mechanic justifies inheritance; a different mechanic justifies a sibling component that borrows primitives without borrowing component identity.
 
| State | Fill / Border | Notes |
|---|---|---|
| Default | Ink@4% fill, no border | Deliberately a **decorative consistency device, not a structural affordance signal** — contrast against the page is ~1.08:1, well under any boundary-identification threshold, and this is accepted because the fill isn't the thing telling a user "this is clickable." That job is carried by icon shape, consistent nav-rail position, and convention. No shadow of any kind. |
| Hover | Ink@8% fill, border Ink@8% | Insets: entry white (bright), exit Ink@8% — relies on insets alone for the visible lift, fill only deepens from 4% to 8%, doesn't jump further |
| Pressed | Ink@4% fill (matches Default, not Hover) | Zero-offset ambient white outer glow (see §4.1). Insets invert relative to Hover's direction: entry Ink@16%, exit white. State intensity is not a monotonic ladder in this system — pressed fill can sit below hover's, same pattern Primary's pressed state already uses. |
| Selected | Gradient fill, Sage 500 → Sage 400, no border | **Corrected September 2026:** previously documented as "no fill, border Ink@64%." Real tokens confirm the opposite: a gradient fill (`action.selected`), no border at all. Still a **deliberately distinct signal from Default/Hover/Pressed**, not a stronger version of the same opacity scale — "where am I" is a different, more important job than "is this clickable" — it just achieves that distinctness through a fill change rather than a border. No shadow. |
| Focus | Ring only, no bevel | Default has no shadow layers to begin with, so focus is just the gap ring + Blue 600 ring on top of the default Ink@4% fill. Ring: white spread 2px + Blue 600 spread 4px. |
 
**Icon-only accessibility:** every item in this component is icon-only in its collapsed state (text is revealed only on hover-expand). Accessible names (aria-label or equivalent) are a live dependency owned by the content design function, tracked here as an open item until confirmed complete — see §7.
 
**Known interim status:** this pattern, and the underlying icon set, may be superseded by a broader Information Architecture redesign already underway (owned separately). Treat this component as the current, deliberate answer, not a permanent one.
 
### 4.6 Inline Icon Action
 
Small, icon-only, low-emphasis actions that live **inline within content** — e.g., copy, thumbs up/down, read-aloud beneath an AI chat response — rather than in a fixed toolbar or nav position. "Inline" is the deciding factor for reaching for this component over Navigation or a full Tertiary button: same size/shape category as Navigation, but a content-adjacent action rather than a persistent wayfinding element.
 
Named deliberately on its own terms rather than as a variant of either neighbor, because naming it "Tertiary — Icon-only" would promise an appearance (padded text pill) it doesn't have, and naming it after Navigation would misrepresent its behavior (no persistent "selected" state, for most actions in this set). A name should let someone predict what they're looking at — this one states the deciding factor directly instead of borrowing a lineage that only partially fits.
 
**Default, hover, and pressed states reuse Navigation's values exactly** (§4.5) — same container size, same Ink opacity ladder, same non-directional ambient glow on press. This is a deliberate reuse of *values*, not an inheritance of *component identity*: Inline Icon Action's behavioral rules (one-shot action, no persistent state) match Tertiary, not Navigation — it simply happens to need Navigation's compact-size numbers because Tertiary's own hover/pressed values were tuned for a padded text button, the wrong shape for a bare icon.
 
**Copy-specific behavior:** on successful copy, the icon swaps to a checkmark, then reverts to the default copy icon after **1.5–2 seconds**. This exists because the pressed state alone is too momentary to serve as confirmation (per the standing rule that pressed states are transient, §4.1) — the icon swap is a content-level confirmation, separate from container state. **Open:** whether the button remains clickable while showing the checkmark, or briefly disables to avoid a confusing double-trigger.
 
**Thumbs up/down needs a different mental model than the rest of this set** — see §7. Hover/pressed reuse the same values as everything else in this component, but thumbs additionally need a **persistent "already rated" state** once one is chosen, which the rest of Inline Icon Action's members (copy, and likely read-aloud if it turns out to be one-shot) don't need. That persistent state should borrow the *logic* of Navigation's Selected state (a real, distinct signal, not a stronger version of the same opacity scale) without borrowing Navigation's *component identity* — same reasoning that kept Navigation itself from being folded into Tertiary.
 
### 4.7 Destructive — Red material
 
Confirmed live from real CSS and locked, including the outer shadow's use of Red 900 rather than Ink 900 — see the note below. Text: Sage 200 throughout (`content.inverse`, same reuse logic as Primary's text, the fill is dark enough to need light text). Border: Red 900 @ 8% (`border.destructive`).
 
| State | Fill | Notes |
|---|---|---|
| Default | Solid Red 600 | Insets: entry Red 900 (dark/material-shadow side), exit Red 400 (lighter/glow side). Outer shadow: Red 900 @ 24% |
| Hover | Solid Red 900 | Outer glow: Red 100 (solid, not alpha). Insets brighten: entry Red 500, exit Red 300 |
| Pressed | Solid Red 600 | No outer directional shadow, ambient white glow only. Insets invert: entry Red 400, exit Red 900, the recessed cue |
| Focus | Same as Default + ring | Ring: white spread 2px + Blue 600 spread 4px |
 
**Why the outer shadow uses Red 900, not Ink 900:** unlike Primary, Secondary, and Tertiary, whose outer shadows are all Ink-based, Destructive's outer shadow uses its own family's dark step. Confirmed intentional, not reconciled to the Ink-based pattern the other three tiers share. Destructive gets a "hotter" shadow of its own color for extra visual weight, consistent with its status role.
 
---
 
## 5. Effects System — Shadow & Glow Primitives
 
*(Added September 2026, alongside the primitive effect token session. See also the September 17 snapshot in the project Knowledge Base.)*
 
### 5.1 Two shadow-type primitive families, not one
 
`shadow` and `glow` are kept as separate primitive families rather than one family with more steps, because they're genuinely different techniques, not two points on the same scale:
 
- **`shadow`** — ink-based (`core.color.ink.900`), composed with opacity, always darkening and receding. Covers the existing elevation ladder (`shadow.0`–`400`) plus the new `shadow.50` (see below).
- **`glow`** — fixed white, always lightening and lifting. Currently one step, `glow.100`, used for the button pressed-state effect.
This follows the same naming principle already established for color (§2.1, Principle 2): a primitive's name should describe an intrinsic property of the value itself, not what it's used for. Calling the pressed effect "pressedGlow" or similar was considered and rejected — that bakes a use case into a primitive name, the same mistake the material-name convention already avoids for color. Naming it by technique (`glow`) instead keeps it honest about what it *is* without promising what it's *for*.
 
### 5.2 `shadow.0` stays reserved for "no shadow"
 
`shadow.0` (zero offset, zero blur, zero spread) is preserved as the explicit "intentional absence of a shadow" token, matching the same zero-value convention used across every other primitive group (opacity, blur, dimension). It was considered, and rejected, as a slot to repurpose for the pressed-glow effect — the two ideas aren't interchangeable: one represents deliberately having no effect, the other is a specific, fully rendered effect that happens to also be simple. Keeping them separate avoids losing the ability to reference "no shadow" without falling back into conditional logic.
 
### 5.3 `shadow.50` — Card's ambient shadow
 
Card's shadow (`0,0,24px, ink.900@4%`) didn't match any existing step in the ladder. The ladder already reaches 24px blur: `shadow.400`'s outer layer references `blur.500` (24px), the same blur value `shadow.50` uses. What the ladder didn't have wasn't a bigger blur, it was that blur paired with the *minimum* opacity in the scale — every existing step that reaches high blur (`300`, `400`) pairs it with `opacity.100` (8%) inside a two-layer recipe, never with `opacity.50` (4%) alone. Card needed a single-layer recipe at that same maximum blur, paired with the minimum opacity — a combination that didn't exist. Rather than extend the ladder as `shadow.500` (which would have been structurally simpler than `300`/`400` despite being numbered higher, breaking the ladder's own pattern of increasing complexity), it was added as `shadow.50`, sitting below `100` the way `opacity.50` sits below `opacity.100`.
 
### 5.4 Considered and rejected: dedicated `tealAlpha` / `redAlpha` / `whiteAlpha` color primitives
 
Teal-at-opacity and red-at-opacity compositions recur across several button states (insets, hover fill tints). Dedicated alpha color families (mirroring `inkAlpha`) were considered but rejected: composing `rgba({color},{opacity})` inline, directly at the point of use, works identically and is consistent with how the existing `inkAlpha` family is actually used in practice — the current shadow primitives compose `rgba({core.color.ink.900},{core.effect.opacity.X})` inline rather than referencing `inkAlpha` itself, even though `inkAlpha` already exists. Adding `tealAlpha`/`redAlpha` would have added primitive surface without a functional need. `whiteAlpha` specifically had too little real usage (two instances, in two different roles) to justify even considering it.
 
### 5.5 Scoped out of the primitive layer entirely
 
Two things that came up while working through this are deliberately **not** primitive tokens, and shouldn't be added as any part of a future primitive pass:
 
- **Button bevel shadows** (drop shadow + two inset layers, varying by color family and interaction state) — these compose primitive shadow geometry with primitive/semantic color references, but the assembled result is specific to a component and state. Now fully built out as semantic-tier tokens (`core.effect.shadow.primary`, `.secondary`, `.tertiary`, `.destructive`, `.navigation`, `.containerGlass`, `.card`, `.formSection`), confirmed against real CSS — see §4.
- **Focus and selection rings** — already correctly defined at the semantic tier only (`core.effect.ring.focus`), with no primitive layer, and that's by design: a value only earns primitive status when it needs independent reuse across multiple semantics. `ring.selection` was considered and removed, no real component uses a checkable selection ring, Navigation's Selected state (§4.5) and every other selected state in this system communicates through a fill or color change instead. If a real ring-based selection need surfaces later, this may be revisited.
### 5.6 Confirmed semantic shadow architecture (September 2026)
 
No semantic tier exists for the generic elevation ladder (`shadow.0`–`400`), Opacity, or Blur — all three are referenced directly at their point of composition, the same conclusion for the same reason each time: every real use already composes the primitive inline, and a tier that just re-labels a primitive without adding a role fails this system's own "must earn existence" test. Card is the one exception worth naming: `core.effect.shadow.card` exists as a role-based alias for `shadow.50`, since Card is a real, named consumer, not a placeholder tier.
 
Every button and Navigation bevel recipe uses `blur.300` (8px) for every layer without exception. The only other blur value confirmed anywhere in this system is `blur.500` (24px, Card only). No backdrop-filter or true optical-blur glass surface has been built anywhere yet, the "glass" naming throughout §4 refers to the material metaphor, achieved entirely through bevel insets and color, not actual blur.
 
---
 
## 6. Material Techniques — where each is safe, where it's risky
 
From mood-board exploration; all require restraint, none adopted wholesale.
 
- **Neumorphism:** real, known accessibility weakness — relies on shadow alone to signal boundaries, which degrades under high-contrast display modes, glare, or reduced contrast sensitivity. **Safe for:** decorative sections, transient pressed-state feedback (justified specifically because pressed is confirmed non-persistent, §4.1). **Not safe for:** any persistent state (a toggle, a selected tab) — those need a real, checkable color/border signal; shadow cannot be the only cue.
- **Glassmorphism / translucency:** breaks the fixed-contrast guarantee a token system depends on, since a translucent surface's resultant color changes based on whatever renders behind it. **Resolution used:** treat as a "cheat" — either restrict glass surfaces to a small set of known backgrounds, or give them a solid backing tint strong enough to guarantee contrast regardless of context. Decide which per component; don't leave it undefined. No such surface has been built yet — see §5.6.
---
 
## 7. Open Items (explicitly not yet decided — do not assume resolved)
 
- Secondary button's material identity (opaque? what does it represent, conceptually?) — needed to fully justify its non-inverting pressed state (§4.3).
- Icon-only Tertiary buttons: accessible naming (aria-label) and tap-target sizing not yet addressed (§4.4).
- Navigation aria-labeling — dependency on the content design function; confirm complete rather than assuming (§4.5).
- Navigation is explicitly interim, pending a broader Information Architecture redesign owned separately; may be superseded, including the icon set itself (§4.5).
- **Inline Icon Action (§4.6) — still undecided:** (1) thumbs up/down's persistent "already rated" state — not yet designed, only scoped conceptually; (2) whether "read aloud" is one-shot (→ behaves like copy) or a persistent playing/stopped toggle (→ needs the same treatment as thumbs); (3) whether Copy stays clickable during its checkmark-confirmation window, or briefly disables; (4) overflow/scaling plan once more actions are added to the row; (5) tooltip-on-hover is assumed as a baseline (standard chat-UI practice) but not yet confirmed built.
- Hero card / high-emphasis surface treatment using Sage 500–800 and/or Ink 700 (§2.2) — direction inspired by mood board, not yet built.
- Blue: Blue 500 (link visited), 600 (link default, focus ring), and 700 (link hover) have roles in the semantic tokens. The reasoning for the hover and visited step choices is not yet documented, and Blue 100 to 400 have no role. Do not assign roles speculatively (§2.5).
- Green and Amber (§2.7–2.8): the family-level role is confirmed (success, alert respectively), but which specific step within each 9-step ramp maps to which specific use (fill, hover, text, border) is not yet documented. Red's per-step usage is now confirmed for the Destructive button (§4.7); usage elsewhere (inline error text/borders, form validation) is still undocumented. Needs a pass once those components are actually designed.
- Fixed-width/responsive behavior and component structure consistency — both explicitly *not* verifiable from visual comps; require actual implementation review once an engineering team is in place.
- Teal opacity ladder: real per-state usage is now documented in §2.4; only add a new step beyond what's listed there when a real, tested use appears.
- Whether the "named, conscious exception" treatment given to Secondary/Tertiary buttons (§3, §4.3, §4.4) should extend to inputs, tables, and other components not yet reviewed.
---
 
## 8. Key Principles
 
1. **A token's role isn't fixed by its origin.** If an existing value's measured properties satisfy a new job, reuse it — even across families previously kept separate (Ink → surface role, §2.2).
2. **Formula compliance ≠ visual truth.** Saturation/lightness math predicted a light-chroma problem in the Sage ramp that real rendering disproved; conversely, several "passing" values (pre-fix Teal, Ink 600 checked against the wrong background) looked fine in isolation but failed once checked in their real, composited context. Test against real placement before trusting a calculation alone, and vice versa.
3. **Opacity values are not portable hex values.** Any flattened reference solid (Ink 600) is only valid for the specific background it was computed against, and must be documented as derived, not locked, if that background could change.
4. **A named, honest exception beats a silently accepted gap.** Every place this system falls short of a hard number is written down with reasoning, not fixed by assumption or left undocumented.
5. **Restraint can be the point.** Teal sharing Ink's hue, Tertiary's soft boundary — both are deliberate trade-offs in service of a calmer, less noisy system, not compromises to apologize for.
6. **A primitive's name describes what it is, not what it's for.** Material color names over literal color names, `glow` over `pressedGlow` — the same discipline applied in two different primitive categories. If a name only makes sense in light of one use case, it's a semantic decision wearing a primitive's clothes.
7. **Real evidence overrides documented rationale, every time.** This document has been wrong about specific values more than once this project (Primary's fill, the shadow.50 blur claim, Tertiary's hover, Navigation's selected state, the focus ring width, Primary's hover insets), always in the direction of a plausible-sounding claim that didn't match what was actually in the tokens or the real CSS. When the two conflict, the token file and real CSS win, and this document gets corrected in place, not defended.