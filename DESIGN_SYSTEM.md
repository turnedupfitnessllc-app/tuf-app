# TUF — TurnedUp Fitness Design System

## Color Palette (LOCKED v2)

### Backgrounds
- `--bg`: #080808 (Deep black)
- `--bg2`: #0e0e0e
- `--bg3`: #141414
- `--bg4`: #1c1c1c
- `--bg5`: #242424

### Accents
- **Red**: #8B0000 (Dark red) → #b30000 (Bright red)
- **Gold**: #C8973A (Warm gold) → #f0b850 (Bright gold)

### Text
- `--white`: #f2f2f2 (Off-white)
- `--gray`: #888888
- `--gray-lo`: #555555
- `--dim`: #333333

### Semantic
- **OK/Success**: #4caf50 (Green)
- **Warn/Caution**: #C8973A (Gold)
- **Danger**: #b30000 (Red)
- **Blue**: #4A90D9

### Screen Accents
- **MOVE**: #C8973A (Gold)
- **FUEL**: #4caf50 (Green)
- **FEAST**: #f97316 (Orange)
- **VAULT**: #a78bfa (Purple)

## Typography

- **Display**: Bebas Neue (Bold, geometric, all-caps)
- **Body**: Barlow Condensed (Clean, condensed, readable)

## Key Components

### Buttons (TUF Button System v2)
- Diagonal right-edge slash (clip-path)
- Gradient fills (red or gold)
- Arrow icon (›) on right
- Shine sweep animation on hover
- Variants: primary (red), gold, secondary

### Cards
- Background: --bg3
- Border: 1px solid --border
- Left accent border (3px): gold, red, or green
- Hover effect: top bar sweep animation

### Navigation
- **Top Header**: Sticky, brand name, avatar
- **Bottom Nav**: Fixed, 5 pillar icons, active state with gold highlight

### Exercise Cards
- Video placeholder area (16:9 ratio)
- Tags: muscle group, level, equipment
- Stat grid (4 columns): sets, reps, rest, tempo
- Coaching cue box with gold left border
- Modification list with green dots

## Layout

- **Max-width**: 480px (mobile-first)
- **Padding**: 14px horizontal margins
- **Spacing**: 12-16px between sections
- **Z-index Hierarchy**:
  - Bottom nav: 300
  - Header: 200
  - Sticky nav: 100-90

## Animation

- Screen transitions: 0.2s ease (fade + slight slide)
- Hover effects: 0.15-0.3s transitions
- Shine sweep: 0.4s ease
- Progress fills: 1.2s cubic-bezier

## Pillars

1. **MOVE** - Exercise library with progressive difficulty
2. **FUEL** - Nutrition tracking
3. **FEAST** - Recipe management
4. **VAULT** - Progress/history (future)
