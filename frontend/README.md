# TUF Frontend — React Native / Expo

Mobile app for **Turned Up Fitness** — AI-powered corrective fitness coaching.

## Stack

- **React Native** + **Expo** (~50)
- **React Navigation** v6 (native stack)
- Dark theme: `#0B0B0B` background, `#FF1E1E` Panther red

## File Structure

```
frontend/
 ├── App.js                     ← Navigation root
 ├── app.json                   ← Expo config
 ├── screens/
 │    ├── HomeScreen.js         ← Logo, tagline, Start Workout CTA
 │    ├── AssessScreen.js       ← 8-region pain selector + Panther insight
 │    ├── WorkoutScreen.js      ← 4-week program + session player
 │    └── ProgressScreen.js    ← XP, stats, stage ladder
 ├── components/
 │    ├── Button.js             ← Primary + secondary variants
 │    ├── Card.js               ← Dark card container
 │    └── Navbar.js            ← Bottom tab navigation
 └── theme/
      └── colors.js            ← Design tokens
```

## Getting Started

```bash
cd frontend
npm install
npx expo start
```

Then scan the QR code with **Expo Go** on your device, or press:
- `a` — Android emulator
- `i` — iOS simulator
- `w` — Web browser

## Design Tokens

| Token      | Value     | Usage                    |
|------------|-----------|--------------------------|
| background | `#0B0B0B` | All screens              |
| primary    | `#FF1E1E` | CTAs, active states      |
| secondary  | `#1F1F1F` | Cards, secondary buttons |
| text       | `#FFFFFF` | Primary text             |
| subtext    | `#A0A0A0` | Labels, metadata         |
| gold       | `#C8973A` | Streak, achievements     |
