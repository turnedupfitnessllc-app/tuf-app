# TUF App — Full Page Audit
**Date:** April 21, 2026  
**Status:** Pre-Soft-Launch Assessment

---

## Summary

| Category | Count |
|---|---|
| Pages fully working | 12 |
| Pages needing UI/clarity fixes | 14 |
| Pages missing AppShell (no hamburger nav) | 33 |
| Missing pages that need to be built | 3 |
| Hidden/disabled pages | 1 (Schedule) |

**Global font system:** Barlow (body) + Barlow Condensed (headings) + Bebas Neue (accent) — loaded via Google Fonts. Solid foundation. Issue is inconsistent application across older pages.

---

## Page-by-Page Assessment

### ✅ HOME `/`
**Status:** Good — recently rebuilt  
**Strengths:** Hero with breathing panther, quick actions, stat row, AppShell header  
**Issues:**
- Quick action icons are small — could be larger tap targets on mobile
- "Recent Activity" section shows placeholder data, not real sessions
- Greeting font size could be larger (currently `text-2xl`, should be `text-4xl` Barlow Condensed)

**Priority:** Low — functional, minor polish

---

### ✅ MOVE `/move`
**Status:** Good — recently updated  
**Strengths:** AppShell, clean exercise cards, workout launch flow  
**Issues:**
- Exercise cards use small `text-sm` labels — hard to read at a glance
- No visual differentiation between difficulty levels (all cards look the same)
- Missing a "Quick Start" prominent CTA at the top

**Priority:** Medium

---

### ✅ WORKOUT PLAYER `/move` → player
**Status:** Working — Panther cue overlay added  
**Strengths:** Rep counter, timer, coach mode, Panther overlay  
**Issues:**
- Rep counter number (`text-8xl`) is great but the exercise name above it is `text-sm` — too small
- Coach mode badge text is very small on mobile
- No visual rep progress bar (just a number)

**Priority:** Medium

---

### ✅ PANTHER BRAIN `/panther-brain`
**Status:** Working — cinematic entrance added  
**Strengths:** Cinematic wake-up, scan line, neon glow, full chat interface  
**Issues:**
- Chat input placeholder text is light gray on dark — low contrast
- Message bubbles could be slightly larger font (`text-sm` → `text-base`)
- "ONLINE. LOCKED IN." text could be Bebas Neue for more impact

**Priority:** Low

---

### ⚠️ FEAST / TUTK `/feast`
**Status:** Functional but visually incomplete  
**Strengths:** 4-tab layout (Week/Recipes/Shopping/Database), 31 recipes with full data  
**Critical Issues:**
- **Zero food images** — recipe cards are text-only, no visual appetite appeal
- No TUTK branding on the page — should feel like its own brand section
- Recipe cards are very dense — ingredients list visible without expanding
- Category filter chips exist but are small and hard to tap
- The "DATABASE" tab is empty/placeholder

**All 31 TUTK Recipes:**

| ID | Name | Category |
|---|---|---|
| M01 | Seared Scallops with Sprouts | Mains |
| M02 | Stir Fry Cabbage & Pork | Mains |
| M03 | Lean Stuffed Pepper | Mains |
| M04 | Lemon Butter Asparagus & Fish | Mains |
| M05 | Healthy Holiday Comfort | Mains |
| M06 | Lemon & Almond Roasted Salad | Mains |
| M07 | Low Carb Broccoli & Tuna Salad | Mains |
| M08 | Shrimp & Avocado Stuffed Salad | Mains |
| M09 | Honey Mustard Chicken Salad | Mains |
| M10 | Garlic Shrimp | Mains |
| M11 | Turkey Tacos | Mains |
| M12 | Quinoa Chicken Salad | Mains |
| M13 | Seared Whitefish with Couscous Cucumber Salad | Mains |
| M14 | Thai Beef Salad | Mains |
| M15 | Avocado Tuna Salad | Mains |
| M16 | Spicy Thai Shrimp Salad | Mains |
| M17 | Crispy Chicken & Brussels | Mains |
| M18 | Thai Peanut Chicken | Mains |
| B01 | Sweet Egg Scramble | Breakfast |
| B02 | Egg White Omelet | Breakfast |
| B03 | Protein Pancakes | Breakfast |
| B04 | Blueberry Oat Bake | Breakfast |
| B05 | Cottage Cheese Bowl | Breakfast |
| B06 | Egg White Sandwich | Breakfast |
| S01 | Blueberry Pie Smoothie | Shakes |
| S02 | Vanilla Almond Shake | Shakes |
| S03 | Cake for Breakfast Shake | Shakes |
| S04 | PB Sandwich Shake | Shakes |
| D01 | Balsamic Vinegar Dressing | Dressings |
| D02 | Versatile Vinegar Dressing | Dressings |
| D03 | Honey Mustard Dressing | Dressings |

**Priority: HIGH — Day 2 task**

---

### ⚠️ FUEL TRACKER `/fuel-track`
**Status:** Functional  
**Issues:**
- Header text `text-sm` throughout — hard to read
- Macro ring chart labels are tiny
- No AppShell — no hamburger nav access
- "Add Food" button is buried at the bottom

**Priority:** Medium

---

### ⚠️ FUEL `/fuel`
**Status:** Functional  
**Issues:**
- No AppShell
- Page header is a plain `<h1>` with no styling weight
- Macro targets display is functional but visually flat

**Priority:** Medium

---

### ⚠️ PROGRESS `/progress`
**Status:** Working — AppShell added  
**Issues:**
- Chart labels use `text-xs` — barely readable on mobile
- Empty state (no workout data) shows nothing — needs a prompt to start training
- Progress charts are dark on dark — low contrast

**Priority:** Medium

---

### ⚠️ LEADERBOARD `/leaderboard`
**Status:** Functional  
**Issues:**
- No AppShell
- Rank numbers are small
- No visual differentiation for top 3 (gold/silver/bronze treatment missing)
- Font is inconsistent — mixes `text-sm` and `text-base` randomly

**Priority:** Medium

---

### ⚠️ SEASON LEADERBOARD `/season`
**Status:** Functional  
**Issues:**
- No AppShell
- Very similar to Leaderboard — could be merged into a tabbed view
- Season countdown timer font is small

**Priority:** Low

---

### ⚠️ MEMBERSHIP `/membership`
**Status:** Functional — Stripe not live  
**Issues:**
- No AppShell
- Tier cards are well-structured but CTA buttons are small
- "Most Popular" badge is barely visible
- Stripe checkout not wired (Day 6 task)

**Priority:** Medium (Stripe = Day 6)

---

### ⚠️ PvP CHALLENGE `/pvp`
**Status:** Working — bot fix in progress  
**Issues:**
- Bot not appearing reliably (Day 1 fix in progress)
- No AppShell
- Arena background could be more dramatic — currently plain dark

**Priority:** High (bot fix = Day 1)

---

### ⚠️ MINDSET `/mindset`
**Status:** Functional  
**Issues:**
- No AppShell
- Challenge cards use small fonts
- No visual hierarchy between challenge title and description

**Priority:** Low

---

### ⚠️ TRAIN `/train`
**Status:** Functional  
**Issues:**
- No AppShell — largest page without hamburger nav
- Program cards are text-heavy with no visual imagery
- "Start Program" CTA is not prominent enough

**Priority:** High — this is a primary navigation destination

---

### ⚠️ ASSESS `/assess`
**Status:** Functional  
**Issues:**
- No AppShell
- Assessment form inputs are small
- Progress indicator between steps is barely visible

**Priority:** Medium

---

### ⚠️ ONBOARDING `/onboarding`
**Status:** Functional  
**Issues:**
- Step indicator dots are very small
- Font sizes inconsistent between steps
- Final step CTA ("Enter the Arena") is good but button is standard size — should be full-width hero button

**Priority:** Medium — first impression matters

---

## Missing Pages (Need to Be Built)

### 🔴 TUTK DEDICATED PAGE
The Feast page exists but TUTK needs its own branded section with:
- Full-bleed food photography for each recipe
- TUTK logo/branding header
- Category filtering with visual tabs
- Recipe cards with hero images

**Build Day:** Day 2

### 🔴 SCHEDULE PAGE `/schedule`
Currently hidden (`{/* commented out */}`). The Schedule.tsx file exists (42KB) but has calendar bugs. Needs:
- Bug audit of Schedule.tsx
- Fix or rebuild the calendar view
- Re-enable the route

**Build Day:** Day 7 (per master plan)

### 🔴 PROFILE PAGE `/profile`
Profile.tsx exists but is not in the hamburger drawer nav. Users have no way to reach it except direct URL. Needs:
- Added to hamburger drawer under "Account"
- Profile photo upload
- Stats summary

**Build Day:** Day 3 (alongside voice)

---

## Global Issues (Apply to All Pages)

| Issue | Impact | Fix |
|---|---|---|
| 33 pages missing AppShell | High — no hamburger nav | Add AppShell to all primary pages |
| `text-xs` / `text-sm` overuse | High — readability on mobile | Bump to `text-sm` / `text-base` minimum |
| No food images anywhere | High — TUTK looks unfinished | Day 2 task |
| Inconsistent heading treatment | Medium | Apply `.heading-blade` class consistently |
| Dark-on-dark contrast issues | Medium | Increase text opacity from `text-gray-400` to `text-gray-200` |
| Missing back navigation on sub-pages | Medium | AppShell handles this when added |

---

## Action Order

1. **Day 1 (Today):** PvP bot fix ✅ in progress
2. **Day 2:** TUTK food images + Feast page visual upgrade
3. **Day 3:** Add AppShell to all 33 missing pages + Profile page in nav
4. **Day 4:** Font/contrast sweep — bump all `text-xs` to `text-sm`, `text-sm` to `text-base` on key pages
5. **Day 5–10:** Per master plan
