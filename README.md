# TUF App — Turned Up Fitness

**AI Fitness Coaching App for Adults 40+**

An intelligent fitness platform combining personalized adaptive workouts, AI-powered coaching via JARVIS, nutrition tracking, and recipe management specifically designed for sarcopenia prevention and muscle maintenance in adults over 40.

---

## 🎯 Project Overview

TUF (Turned Up Fitness) is a comprehensive fitness ecosystem built with:
- **Frontend:** React 19 + TypeScript + Tailwind CSS 4
- **Design:** Blade Runner-inspired geometric aesthetic with Orbitron typography
- **Features:** Workout tracking, nutrition planning, recipe library, AI coaching
- **Target:** Adults 40+ focused on muscle maintenance and sarcopenia prevention

### Key Features
✅ **JARVIS AI Coaching** — Real-time personalized guidance  
✅ **Adaptive Workouts** — Progressive strength training programs  
✅ **Nutrition Tracking** — Macro-based meal planning  
✅ **Recipe Library** — 40+ science-backed recipes  
✅ **Progress Dashboard** — Real-time metrics and streaks  
✅ **Dark Mode** — Full light/dark theme support  

---

## 📁 Repository Structure

```
tuf-app/
├── client/                          # React frontend
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── Home.tsx            # Dashboard
│   │   │   ├── Move.tsx            # Workout library
│   │   │   ├── Fuel.tsx            # Nutrition tracking
│   │   │   ├── Feast.tsx           # Recipe library
│   │   │   ├── Progress.tsx        # Progress tracking
│   │   │   ├── Vault.tsx           # Data management
│   │   │   └── JarvisChat.tsx      # AI coaching
│   │   ├── components/             # Reusable UI components
│   │   ├── contexts/               # React contexts
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Utilities
│   │   ├── App.tsx                 # Routes & layout
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   └── public/                     # Static assets
├── docs/                           # Documentation & resources
│   ├── cookbooks/                  # Recipe collections
│   │   └── recipes/                # Individual recipes
│   ├── frameworks/                 # App framework references
│   ├── nutrition/                  # Nutrition guidelines
│   ├── health/                     # Health condition modifications
│   ├── video/                      # Video production materials
│   ├── brand/                      # Brand guidelines
│   └── demos/                      # Interactive demos
├── data/                           # Data files & templates
│   ├── meal_planner_template.html  # Meal planning tool
│   ├── Master_Prompt_*.csv         # User data
│   └── workout_program.pdf         # 12-week program
├── DESIGN_SYSTEM.md                # Design tokens & guidelines
├── README.md                       # This file
└── package.json                    # Dependencies
```

---

## 🎨 Design System

### Typography
- **Headlines:** Orbitron 900 (geometric, futuristic)
- **Body:** Space Mono (monospace, tech-forward)

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Red | #C0392B | Buttons, accents, highlights |
| Gold Accent | #F5A623 | Secondary highlights |
| Dark Background | #0E0E0E | Dark mode background |
| Light Background | #F5F5F5 | Light mode background |
| Text Primary | #FFFFFF | Light mode text |
| Text Secondary | #000000 | Dark mode text |

### Theme Support
- ✅ Full light/dark mode toggle
- ✅ Semantic color classes (text-foreground, bg-background)
- ✅ CSS variables for consistent theming
- ✅ Automatic contrast adjustment

---

## 📚 Documentation

### Cookbooks & Recipes
- **TUTKCompleteCookbookv3** — Complete recipe collection
- **TurnedUpInTheKitchen** — Full cookbook series
- **Individual Recipes** — Thai Peanut Chicken, Seared Scallops, Blueberry Pie, Protein Pancakes

### Nutrition & Health
- **Day3_Nutrition_Framework** — Macro-based nutrition planning
- **Recipe_Module_40Plus** — Age-specific nutrition guidelines
- **Day2_Health_Condition_Modifications** — Adaptations for health conditions

### Frameworks & Demos
- **App Frameworks** — React component structure references
- **Interactive Demos** — HTML prototypes and UI mockups
- **Exercise Library** — Workout demonstrations
- **Admin Dashboard** — Management interface

### Brand Resources
- **Canva Brand Kit** — Official brand guidelines
- **Social Cards** — Marketing materials
- **Thumbnails** — Video thumbnails

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- pnpm package manager
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/turnedupfitnessllc-app/tuf-app.git
cd tuf-app

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Development

```bash
# Run dev server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linting
pnpm lint
```

---

## 🎯 Features

### Home Dashboard
- Welcome message with user name
- Current streak tracking
- Weekly progress metrics
- Quick access to all modules

### Move (Workouts)
- 40+ exercises with difficulty levels
- Muscle group filtering (Chest, Back, Legs, Shoulders, Arms, Full Body)
- Progressive rep/set recommendations
- Beginner to Advanced difficulty levels

### Fuel (Nutrition)
- Daily macro targets (Protein, Carbs, Fat, Calories)
- Meal logging by time (Breakfast, Lunch, Dinner, Snacks)
- Nutritional tracking
- Daily calorie targets

### Feast (Recipes)
- 43 science-backed recipes
- Full macro information
- 40+ scientific notes
- Categories: Breakfast, Mains, Shakes, Dressings

### Progress (Vault)
- Historical data tracking
- Performance metrics
- Achievement badges
- Progress visualization

### JARVIS Chat
- AI-powered coaching
- Real-time guidance
- Personalized recommendations
- Conversational interface

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | shadcn/ui |
| **Routing** | Wouter |
| **Build Tool** | Vite |
| **Package Manager** | pnpm |

---

## 📊 File Statistics

| Category | Files | Size |
|----------|-------|------|
| Documentation | 27 | 51 MB |
| Data/Templates | 5 | 224 KB |
| Source Code | 198 | 210 KB |

---

## 🔄 Git Workflow

### Branches
- `main` — Production-ready code
- `develop` — Development branch
- `feature/*` — Feature branches

### Commit Convention
```
type: description

feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

---

## 📝 Recent Changes

### Latest Commit
**Fix: Dark mode text visibility** (ddd186a)
- Replaced hardcoded colors with semantic theme-aware classes
- Updated all components for proper light/dark mode contrast
- Text now properly converts from black (light) to white (dark)

### Previous Checkpoints
- Integrated Orbitron font for geometric headlines
- Implemented Blade Runner-inspired typography
- Added theme toggle for light/dark mode support
- Fixed dark mode text visibility issues

---

## 🤝 Contributing

### Setup Development Environment
```bash
# Clone and install
git clone https://github.com/turnedupfitnessllc-app/tuf-app.git
cd tuf-app
pnpm install

# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: Your feature description"

# Push to GitHub
git push origin feature/your-feature
```

### Code Style
- Use TypeScript for type safety
- Follow Tailwind CSS conventions
- Use semantic HTML
- Maintain accessibility standards
- Write descriptive commit messages

---

## 📖 Documentation Files

### Quick Reference
- **DESIGN_SYSTEM.md** — Design tokens and guidelines
- **docs/cookbooks/** — Recipe collections
- **docs/nutrition/** — Nutrition frameworks
- **docs/health/** — Health modifications
- **docs/frameworks/** — Component references
- **docs/demos/** — Interactive prototypes

### Data Files
- **data/meal_planner_template.html** — Meal planning tool
- **data/Master_Prompt_*.csv** — User configuration
- **data/workout_program.pdf** — 12-week program

---

## 🔐 Security

- All sensitive data in `.env.example` (never commit `.env`)
- No API keys in source code
- Environment variables for configuration
- Private repository for proprietary content

---

## 📞 Support

For issues, questions, or contributions:
1. Check existing documentation in `/docs`
2. Review code comments and design system
3. Create an issue with detailed description
4. Submit pull requests with clear descriptions

---

## 📄 License

This project is proprietary to Turned Up Fitness LLC. All rights reserved.

---

## 🎉 Acknowledgments

- **Design Inspiration:** Blade Runner aesthetic
- **Typography:** Orbitron (headlines), Space Mono (body)
- **Framework:** React 19 + Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Target Audience:** Adults 40+ focused on fitness and health

---

## 📅 Project Timeline

| Phase | Status | Notes |
|-------|--------|-------|
| **Design System** | ✅ Complete | Blade Runner aesthetic, typography system |
| **Core Features** | ✅ Complete | Home, Move, Fuel, Feast pages |
| **Dark Mode** | ✅ Complete | Full light/dark theme support |
| **AI Coaching** | 🔄 In Progress | JARVIS integration |
| **Data Persistence** | 🔄 In Progress | Backend integration |
| **Deployment** | 📋 Planned | Production deployment |

---

## 🚀 Next Steps

1. **Backend Integration** — Connect to API for data persistence
2. **JARVIS AI** — Implement Claude API for coaching
3. **User Authentication** — Add login/signup flow
4. **Mobile Optimization** — Enhance mobile experience
5. **Analytics** — Track user engagement
6. **Production Deployment** — Launch to production

---

**Last Updated:** April 4, 2026  
**Repository:** https://github.com/turnedupfitnessllc-app/tuf-app  
**Status:** Active Development ✅
