/**
 * homeButtonConfig.ts — Doc 15: Gradient Image Buttons
 * All 6 home screen button configurations with CDN image URLs
 * © 2026 Turned Up Fitness LLC | The Panther System
 */

export interface HomeButtonConfig {
  id: string;
  title: string;
  subtitle: string;
  titleColor: string;
  borderColor: string;
  gradientColor: string; // rgba for color wash overlay
  imageSrc: string;      // CDN URL
  iconName: string;      // lucide icon name
  hero: boolean;
  route: string;
  locked?: boolean;
}

export const HOME_BUTTONS: HomeButtonConfig[] = [
  {
    id: "panther_brain",
    title: "PANTHER BRAIN",
    subtitle: "AI Performance Coach — Active",
    titleColor: "#FF6600",
    borderColor: "#FF6600",
    gradientColor: "rgba(255, 102, 0, 0.20)",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/btn_panther_brain_debd99f9.jpg",
    iconName: "Brain",
    hero: true,
    route: "/panther",
  },
  {
    id: "evolve",
    title: "EVOLVE",
    subtitle: "XP · Stages · Level Up",
    titleColor: "#C8973A",
    borderColor: "#C8973A",
    gradientColor: "rgba(200, 151, 58, 0.20)",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/btn_evolve_0c04bc54.jpg",
    iconName: "Zap",
    hero: false,
    route: "/evolve",
  },
  {
    id: "challenge",
    title: "30-DAY CHALLENGE",
    subtitle: "Panther Mindset · Daily Missions",
    titleColor: "#FF6600",
    borderColor: "#FF6600",
    gradientColor: "rgba(255, 102, 0, 0.15)",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/btn_boa_scan_ed4e58b5.jpg",
    iconName: "Flame",
    hero: false,
    route: "/challenge",
  },
  {
    id: "boa_scan",
    title: "BOA SCAN",
    subtitle: "Biomechanical Overlay Analysis",
    titleColor: "#00CC66",
    borderColor: "#00CC66",
    gradientColor: "rgba(0, 204, 102, 0.15)",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/btn_boa_scan_ed4e58b5.jpg",
    iconName: "Camera",
    hero: false,
    route: "/boa",
  },
  {
    id: "fuel_tracker",
    title: "FUEL TRACKER",
    subtitle: "Macros · Meals · Panther Directive",
    titleColor: "#FF6600",
    borderColor: "#FF6600",
    gradientColor: "rgba(200, 0, 0, 0.20)",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/btn_fuel_tracker_a518a0fc.jpg",
    iconName: "Utensils",
    hero: false,
    route: "/fuel",
  },
  {
    id: "health_intelligence",
    title: "HEALTH INTELLIGENCE",
    subtitle: "Vitals · Progress · Analytics",
    titleColor: "#4488FF",
    borderColor: "#4488FF",
    gradientColor: "rgba(68, 136, 255, 0.15)",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/btn_health_intel_a337fe3d.jpg",
    iconName: "Activity",
    hero: false,
    route: "/health-intel",
  },
  {
    id: "membership",
    title: "MEMBERSHIP",
    subtitle: "Plans · Pricing · Prestige Labs",
    titleColor: "#C8973A",
    borderColor: "#C8973A",
    gradientColor: "rgba(200, 151, 58, 0.20)",
    imageSrc:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663432145978/c6QtxNhJJDYmnbZswK9UTR/btn_membership_1c44591c.jpg",
    iconName: "Star",
    hero: false,
    route: "/membership",
  },
];
