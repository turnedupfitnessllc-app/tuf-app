/**
 * TUF Settings — Full App Configuration
 * Sections: Profile · Fitness · Nutrition · Devices · Notifications · App · Account
 * © 2026 Turned Up Fitness LLC. All rights reserved.
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SettingsState {
  // Profile
  displayName: string;
  age: string;
  sex: "male" | "female" | "other" | "";
  heightFt: string;
  heightIn: string;
  heightCm: string;
  weightLbs: string;
  weightKg: string;
  fitnessGoal: string;
  experienceLevel: string;
  healthConditions: string[];
  injuries: string;
  emergencyName: string;
  emergencyPhone: string;

  // Fitness
  workoutDays: string[];
  workoutTime: string;
  sessionDuration: string;
  equipment: string[];
  environment: string;
  restDayActivity: string;

  // Nutrition
  dietaryStyle: string;
  foodAllergies: string[];
  mealFrequency: string;
  waterGoalOz: string;
  waterReminder: boolean;
  supplements: string[];

  // Devices
  appleHealthConnected: boolean;
  googleFitConnected: boolean;
  garminConnected: boolean;
  fitbitConnected: boolean;
  whoopConnected: boolean;
  hrMonitorConnected: boolean;
  smartScaleConnected: boolean;

  // Notifications
  workoutReminder: boolean;
  workoutReminderTime: string;
  restDayReminder: boolean;
  hydrationReminder: boolean;
  hydrationIntervalHours: string;
  mealReminder: boolean;
  weeklyReport: boolean;
  pantherMotivation: boolean;
  streakWarning: boolean;
  notificationSound: string;

  // App
  unitSystem: "imperial" | "metric";
  theme: "dark" | "light" | "system";
  language: string;
  coachVoice: string;
  coachMode: string;
  displayDensity: string;
  hapticFeedback: boolean;
  autoPlayVideos: boolean;
  showMovementCues: boolean;

  // Account
  analyticsOptOut: boolean;
  shareLeaderboard: boolean;
}

const DEFAULTS: SettingsState = {
  displayName: "",
  age: "",
  sex: "",
  heightFt: "",
  heightIn: "",
  heightCm: "",
  weightLbs: "",
  weightKg: "",
  fitnessGoal: "",
  experienceLevel: "",
  healthConditions: [],
  injuries: "",
  emergencyName: "",
  emergencyPhone: "",
  workoutDays: [],
  workoutTime: "",
  sessionDuration: "45",
  equipment: [],
  environment: "",
  restDayActivity: "",
  dietaryStyle: "",
  foodAllergies: [],
  mealFrequency: "3",
  waterGoalOz: "64",
  waterReminder: false,
  supplements: [],
  appleHealthConnected: false,
  googleFitConnected: false,
  garminConnected: false,
  fitbitConnected: false,
  whoopConnected: false,
  hrMonitorConnected: false,
  smartScaleConnected: false,
  workoutReminder: false,
  workoutReminderTime: "07:00",
  restDayReminder: false,
  hydrationReminder: false,
  hydrationIntervalHours: "2",
  mealReminder: false,
  weeklyReport: true,
  pantherMotivation: true,
  streakWarning: true,
  notificationSound: "panther",
  unitSystem: "imperial",
  theme: "dark",
  language: "en",
  coachVoice: "panther",
  coachMode: "motivational",
  displayDensity: "standard",
  hapticFeedback: true,
  autoPlayVideos: true,
  showMovementCues: true,
  analyticsOptOut: false,
  shareLeaderboard: true,
};

const STORAGE_KEY = "tuf_settings_v2";

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  // Migrate legacy unit preference
  const legacy = localStorage.getItem("tuf_unit_preference") as "imperial" | "metric" | null;
  return { ...DEFAULTS, unitSystem: legacy ?? "imperial" };
}

function saveSettings(s: SettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  // Keep legacy key in sync for backward compat
  localStorage.setItem("tuf_unit_preference", s.unitSystem);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle, expanded, onToggle }: {
  icon: string; title: string; subtitle: string;
  expanded: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 14,
        padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
        textAlign: "left",
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: "0.06em", color: "#fff" }}>
          {title}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", marginTop: 1 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, transition: "transform 0.2s", transform: expanded ? "rotate(90deg)" : "none" }}>
        ›
      </div>
    </button>
  );
}

function Row({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "13px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)",
      gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
            {sublabel}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
        background: value ? "linear-gradient(90deg, #FF6600, #C8973A)" : "rgba(255,255,255,0.12)",
        position: "relative", transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", top: 3, left: value ? 23 : 3,
        width: 22, height: 22, borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
      }} />
    </button>
  );
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, color: "#fff", padding: "6px 10px",
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, letterSpacing: "0.04em",
        cursor: "pointer", minWidth: 130,
      }}
    >
      {options.map(o => <option key={o.value} value={o.value} style={{ background: "#1a1a1a" }}>{o.label}</option>)}
    </select>
  );
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8, color: "#fff", padding: "7px 12px",
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
        width: 140, outline: "none",
      }}
    />
  );
}

function ChipGroup({ options, selected, onChange, multi = true }: {
  options: { value: string; label: string }[];
  selected: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}) {
  const sel = Array.isArray(selected) ? selected : [selected];
  const toggle = (v: string) => {
    if (!multi) { onChange(v); return; }
    const next = sel.includes(v) ? sel.filter(x => x !== v) : [...sel, v];
    onChange(next);
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 20px 14px" }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => toggle(o.value)}
          style={{
            padding: "5px 12px", borderRadius: 20, border: "1px solid",
            fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.15s",
            background: sel.includes(o.value) ? "#FF6600" : "transparent",
            borderColor: sel.includes(o.value) ? "#FF6600" : "rgba(255,255,255,0.15)",
            color: sel.includes(o.value) ? "#fff" : "rgba(255,255,255,0.45)",
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function DeviceCard({ icon, name, description, connected, onConnect, onDisconnect, comingSoon }: {
  icon: string; name: string; description: string;
  connected: boolean; onConnect: () => void; onDisconnect: () => void;
  comingSoon?: boolean;
}) {
  return (
    <div style={{
      margin: "0 20px 10px",
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${connected ? "rgba(0,204,102,0.3)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 14, padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{ fontSize: 28, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: "0.06em", color: "#fff" }}>
          {name}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>
          {connected ? "✓ Connected" : description}
        </div>
      </div>
      {comingSoon ? (
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#C8973A", background: "rgba(200,151,58,0.1)", borderRadius: 6, padding: "4px 8px" }}>
          COMING SOON
        </div>
      ) : (
        <button
          onClick={connected ? onDisconnect : onConnect}
          style={{
            padding: "7px 14px", borderRadius: 8, border: "1px solid",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.15s",
            background: connected ? "rgba(239,68,68,0.1)" : "rgba(255,102,0,0.15)",
            borderColor: connected ? "rgba(239,68,68,0.4)" : "rgba(255,102,0,0.4)",
            color: connected ? "#ef4444" : "#FF6600",
          }}
        >
          {connected ? "DISCONNECT" : "CONNECT"}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Settings() {
  const [, navigate] = useLocation();
  const [s, setS] = useState<SettingsState>(loadSettings);
  const [expanded, setExpanded] = useState<string>("profile");
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-save on every change
  useEffect(() => {
    saveSettings(s);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1500);
    return () => clearTimeout(t);
  }, [s]);

  function update<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setS(prev => ({ ...prev, [key]: value }));
  }

  function toggleSection(id: string) {
    setExpanded(prev => prev === id ? "" : id);
  }

  const sections = [
    { id: "profile", icon: "👤", title: "PROFILE", subtitle: "Name · Age · Height · Weight · Goals" },
    { id: "fitness", icon: "💪", title: "FITNESS PREFERENCES", subtitle: "Schedule · Equipment · Environment" },
    { id: "nutrition", icon: "🥗", title: "NUTRITION", subtitle: "Diet style · Allergies · Meal frequency" },
    { id: "devices", icon: "⌚", title: "SMART DEVICES", subtitle: "Apple Health · Garmin · Fitbit · HR Monitor" },
    { id: "notifications", icon: "🔔", title: "NOTIFICATIONS", subtitle: "Reminders · Panther alerts · Sound" },
    { id: "app", icon: "⚙️", title: "APP PREFERENCES", subtitle: "Units · Theme · Coach voice · Display" },
    { id: "account", icon: "🔐", title: "ACCOUNT & PRIVACY", subtitle: "Data · Privacy · Sign out" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#080808", color: "#fff", paddingBottom: 40 }}>
      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <button
          onClick={() => navigate("/profile")}
          style={{ background: "none", border: "none", color: "#FF6600", fontSize: 22, cursor: "pointer", padding: 0 }}
        >
          ‹
        </button>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: "0.08em", color: "#fff" }}>
            SETTINGS
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)" }}>
            TURNED UP FITNESS
          </div>
        </div>
        {saved && (
          <div style={{
            marginLeft: "auto",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.1em", color: "#00CC66",
          }}>
            ✓ SAVED
          </div>
        )}
      </div>

      {/* ── Sections ── */}
      {sections.map(sec => (
        <div key={sec.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <SectionHeader
            icon={sec.icon}
            title={sec.title}
            subtitle={sec.subtitle}
            expanded={expanded === sec.id}
            onToggle={() => toggleSection(sec.id)}
          />

          {expanded === sec.id && (
            <div style={{ background: "rgba(255,255,255,0.015)" }}>

              {/* ─────────── PROFILE ─────────── */}
              {sec.id === "profile" && <>
                <Row label="Display Name" sublabel="Shown on leaderboard and profile">
                  <TextInput value={s.displayName} onChange={v => update("displayName", v)} placeholder="Your name" />
                </Row>
                <Row label="Age">
                  <TextInput value={s.age} onChange={v => update("age", v)} placeholder="e.g. 32" type="number" />
                </Row>
                <Row label="Biological Sex">
                  <Select value={s.sex} onChange={v => update("sex", v as SettingsState["sex"])} options={[
                    { value: "", label: "Select..." },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ]} />
                </Row>
                <Row label="Height" sublabel={s.unitSystem === "imperial" ? "Feet + Inches" : "Centimeters"}>
                  {s.unitSystem === "imperial" ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <TextInput value={s.heightFt} onChange={v => update("heightFt", v)} placeholder="5 ft" type="number" />
                      <TextInput value={s.heightIn} onChange={v => update("heightIn", v)} placeholder="9 in" type="number" />
                    </div>
                  ) : (
                    <TextInput value={s.heightCm} onChange={v => update("heightCm", v)} placeholder="175 cm" type="number" />
                  )}
                </Row>
                <Row label="Body Weight" sublabel={s.unitSystem === "imperial" ? "Pounds" : "Kilograms"}>
                  <TextInput
                    value={s.unitSystem === "imperial" ? s.weightLbs : s.weightKg}
                    onChange={v => update(s.unitSystem === "imperial" ? "weightLbs" : "weightKg", v)}
                    placeholder={s.unitSystem === "imperial" ? "185 lbs" : "84 kg"}
                    type="number"
                  />
                </Row>
                <div style={{ padding: "10px 20px 4px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    FITNESS GOAL
                  </div>
                </div>
                <ChipGroup
                  multi={false}
                  selected={s.fitnessGoal}
                  onChange={v => update("fitnessGoal", v as string)}
                  options={[
                    { value: "fat_loss", label: "FAT LOSS" },
                    { value: "muscle_gain", label: "MUSCLE GAIN" },
                    { value: "athletic", label: "ATHLETIC PERFORMANCE" },
                    { value: "mobility", label: "MOBILITY" },
                    { value: "general", label: "GENERAL HEALTH" },
                  ]}
                />
                <div style={{ padding: "10px 20px 4px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    EXPERIENCE LEVEL
                  </div>
                </div>
                <ChipGroup
                  multi={false}
                  selected={s.experienceLevel}
                  onChange={v => update("experienceLevel", v as string)}
                  options={[
                    { value: "beginner", label: "BEGINNER" },
                    { value: "intermediate", label: "INTERMEDIATE" },
                    { value: "advanced", label: "ADVANCED" },
                    { value: "athlete", label: "ATHLETE" },
                  ]}
                />
                <div style={{ padding: "10px 20px 4px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    HEALTH CONDITIONS
                  </div>
                </div>
                <ChipGroup
                  selected={s.healthConditions}
                  onChange={v => update("healthConditions", v as string[])}
                  options={[
                    { value: "diabetes", label: "DIABETES" },
                    { value: "hypertension", label: "HYPERTENSION" },
                    { value: "joint_inflammation", label: "JOINT INFLAMMATION" },
                    { value: "heart_condition", label: "HEART CONDITION" },
                    { value: "pregnancy", label: "PREGNANCY" },
                    { value: "osteoporosis", label: "OSTEOPOROSIS" },
                    { value: "asthma", label: "ASTHMA" },
                    { value: "none", label: "NONE" },
                  ]}
                />
                <Row label="Current Injuries / Restrictions" sublabel="Affects program recommendations">
                  <textarea
                    value={s.injuries}
                    onChange={e => update("injuries", e.target.value)}
                    placeholder="e.g. Left knee — avoid deep squats"
                    style={{
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, color: "#fff", padding: "7px 12px",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
                      width: 180, height: 60, resize: "none", outline: "none",
                    }}
                  />
                </Row>
                <Row label="Emergency Contact Name">
                  <TextInput value={s.emergencyName} onChange={v => update("emergencyName", v)} placeholder="Full name" />
                </Row>
                <Row label="Emergency Contact Phone">
                  <TextInput value={s.emergencyPhone} onChange={v => update("emergencyPhone", v)} placeholder="+1 555 000 0000" type="tel" />
                </Row>
              </>}

              {/* ─────────── FITNESS ─────────── */}
              {sec.id === "fitness" && <>
                <div style={{ padding: "10px 20px 4px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    PREFERRED WORKOUT DAYS
                  </div>
                </div>
                <ChipGroup
                  selected={s.workoutDays}
                  onChange={v => update("workoutDays", v as string[])}
                  options={[
                    { value: "sun", label: "SUN" }, { value: "mon", label: "MON" },
                    { value: "tue", label: "TUE" }, { value: "wed", label: "WED" },
                    { value: "thu", label: "THU" }, { value: "fri", label: "FRI" },
                    { value: "sat", label: "SAT" },
                  ]}
                />
                <Row label="Preferred Time">
                  <Select value={s.workoutTime} onChange={v => update("workoutTime", v)} options={[
                    { value: "", label: "Any time" },
                    { value: "morning", label: "Morning (5–9am)" },
                    { value: "midday", label: "Midday (10am–2pm)" },
                    { value: "evening", label: "Evening (3–7pm)" },
                    { value: "night", label: "Late Night (8pm+)" },
                  ]} />
                </Row>
                <Row label="Session Duration">
                  <Select value={s.sessionDuration} onChange={v => update("sessionDuration", v)} options={[
                    { value: "20", label: "20 min" }, { value: "30", label: "30 min" },
                    { value: "45", label: "45 min" }, { value: "60", label: "60 min" },
                    { value: "90", label: "90 min" },
                  ]} />
                </Row>
                <div style={{ padding: "10px 20px 4px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    AVAILABLE EQUIPMENT
                  </div>
                </div>
                <ChipGroup
                  selected={s.equipment}
                  onChange={v => update("equipment", v as string[])}
                  options={[
                    { value: "bodyweight", label: "BODYWEIGHT" },
                    { value: "dumbbells", label: "DUMBBELLS" },
                    { value: "barbell", label: "BARBELL" },
                    { value: "resistance_bands", label: "BANDS" },
                    { value: "cables", label: "CABLES" },
                    { value: "machines", label: "MACHINES" },
                    { value: "kettlebells", label: "KETTLEBELLS" },
                    { value: "pullup_bar", label: "PULL-UP BAR" },
                  ]}
                />
                <Row label="Training Environment">
                  <Select value={s.environment} onChange={v => update("environment", v)} options={[
                    { value: "", label: "Select..." },
                    { value: "home", label: "Home Gym" },
                    { value: "gym", label: "Commercial Gym" },
                    { value: "outdoor", label: "Outdoor" },
                    { value: "hotel", label: "Hotel / Travel" },
                  ]} />
                </Row>
                <Row label="Rest Day Activity">
                  <Select value={s.restDayActivity} onChange={v => update("restDayActivity", v)} options={[
                    { value: "", label: "Select..." },
                    { value: "full_rest", label: "Full Rest" },
                    { value: "active_recovery", label: "Active Recovery" },
                    { value: "light_cardio", label: "Light Cardio" },
                    { value: "yoga", label: "Yoga / Stretch" },
                  ]} />
                </Row>
              </>}

              {/* ─────────── NUTRITION ─────────── */}
              {sec.id === "nutrition" && <>
                <Row label="Dietary Style">
                  <Select value={s.dietaryStyle} onChange={v => update("dietaryStyle", v)} options={[
                    { value: "", label: "Select..." },
                    { value: "standard", label: "Standard" },
                    { value: "vegetarian", label: "Vegetarian" },
                    { value: "vegan", label: "Vegan" },
                    { value: "keto", label: "Keto" },
                    { value: "paleo", label: "Paleo" },
                    { value: "mediterranean", label: "Mediterranean" },
                    { value: "gluten_free", label: "Gluten-Free" },
                  ]} />
                </Row>
                <div style={{ padding: "10px 20px 4px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    FOOD ALLERGIES / INTOLERANCES
                  </div>
                </div>
                <ChipGroup
                  selected={s.foodAllergies}
                  onChange={v => update("foodAllergies", v as string[])}
                  options={[
                    { value: "dairy", label: "DAIRY" }, { value: "gluten", label: "GLUTEN" },
                    { value: "nuts", label: "NUTS" }, { value: "shellfish", label: "SHELLFISH" },
                    { value: "eggs", label: "EGGS" }, { value: "soy", label: "SOY" },
                    { value: "none", label: "NONE" },
                  ]}
                />
                <Row label="Meals Per Day">
                  <Select value={s.mealFrequency} onChange={v => update("mealFrequency", v)} options={[
                    { value: "2", label: "2 meals" }, { value: "3", label: "3 meals" },
                    { value: "4", label: "4 meals" }, { value: "5", label: "5 meals" },
                    { value: "6", label: "6 meals" },
                  ]} />
                </Row>
                <Row label="Daily Water Goal" sublabel="Fluid ounces">
                  <TextInput value={s.waterGoalOz} onChange={v => update("waterGoalOz", v)} placeholder="64 oz" type="number" />
                </Row>
                <Row label="Hydration Reminders">
                  <Toggle value={s.waterReminder} onChange={v => update("waterReminder", v)} />
                </Row>
                <div style={{ padding: "10px 20px 4px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    SUPPLEMENT STACK
                  </div>
                </div>
                <ChipGroup
                  selected={s.supplements}
                  onChange={v => update("supplements", v as string[])}
                  options={[
                    { value: "protein", label: "PROTEIN POWDER" },
                    { value: "creatine", label: "CREATINE" },
                    { value: "preworkout", label: "PRE-WORKOUT" },
                    { value: "vitamins", label: "VITAMINS" },
                    { value: "omega3", label: "OMEGA-3" },
                    { value: "bcaa", label: "BCAA" },
                    { value: "none", label: "NONE" },
                  ]}
                />
              </>}

              {/* ─────────── DEVICES ─────────── */}
              {sec.id === "devices" && <>
                <div style={{ padding: "12px 20px 8px" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
                    Connect your health devices to automatically sync steps, heart rate, sleep, and workout data into the Panther Intelligence system.
                  </div>
                </div>
                <DeviceCard
                  icon="🍎" name="APPLE HEALTH"
                  description="Sync steps, HR, sleep & active calories"
                  connected={s.appleHealthConnected}
                  onConnect={() => { update("appleHealthConnected", true); }}
                  onDisconnect={() => update("appleHealthConnected", false)}
                />
                <DeviceCard
                  icon="🔵" name="GOOGLE FIT"
                  description="Sync steps, heart rate & workouts"
                  connected={s.googleFitConnected}
                  onConnect={() => update("googleFitConnected", true)}
                  onDisconnect={() => update("googleFitConnected", false)}
                  comingSoon
                />
                <DeviceCard
                  icon="🏃" name="GARMIN CONNECT"
                  description="Sync HR, VO2max, HRV & sleep"
                  connected={s.garminConnected}
                  onConnect={() => update("garminConnected", true)}
                  onDisconnect={() => update("garminConnected", false)}
                  comingSoon
                />
                <DeviceCard
                  icon="🟣" name="FITBIT"
                  description="Sync steps, HR & sleep stages"
                  connected={s.fitbitConnected}
                  onConnect={() => update("fitbitConnected", true)}
                  onDisconnect={() => update("fitbitConnected", false)}
                  comingSoon
                />
                <DeviceCard
                  icon="⚡" name="WHOOP"
                  description="Sync strain, recovery & sleep"
                  connected={s.whoopConnected}
                  onConnect={() => update("whoopConnected", true)}
                  onDisconnect={() => update("whoopConnected", false)}
                  comingSoon
                />
                <DeviceCard
                  icon="❤️" name="HR MONITOR (BLUETOOTH)"
                  description="Pair a chest strap or arm band via Bluetooth"
                  connected={s.hrMonitorConnected}
                  onConnect={() => {
                    if ("bluetooth" in navigator) {
                      (navigator as any).bluetooth.requestDevice({ filters: [{ services: ["heart_rate"] }] })
                        .then(() => update("hrMonitorConnected", true))
                        .catch(() => {});
                    } else {
                      alert("Web Bluetooth is not supported on this device/browser.");
                    }
                  }}
                  onDisconnect={() => update("hrMonitorConnected", false)}
                />
                <DeviceCard
                  icon="⚖️" name="SMART SCALE"
                  description="Withings · Renpho · Eufy — auto-log weight"
                  connected={s.smartScaleConnected}
                  onConnect={() => update("smartScaleConnected", true)}
                  onDisconnect={() => update("smartScaleConnected", false)}
                  comingSoon
                />
                <div style={{ height: 10 }} />
              </>}

              {/* ─────────── NOTIFICATIONS ─────────── */}
              {sec.id === "notifications" && <>
                <Row label="Workout Reminder" sublabel="Daily push at your preferred time">
                  <Toggle value={s.workoutReminder} onChange={v => update("workoutReminder", v)} />
                </Row>
                {s.workoutReminder && (
                  <Row label="Reminder Time">
                    <input
                      type="time"
                      value={s.workoutReminderTime}
                      onChange={e => update("workoutReminderTime", e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8, color: "#fff", padding: "6px 10px",
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13,
                      }}
                    />
                  </Row>
                )}
                <Row label="Rest Day Reminder" sublabel="Reminder to recover and recharge">
                  <Toggle value={s.restDayReminder} onChange={v => update("restDayReminder", v)} />
                </Row>
                <Row label="Hydration Reminders" sublabel="Periodic water intake nudges">
                  <Toggle value={s.hydrationReminder} onChange={v => update("hydrationReminder", v)} />
                </Row>
                {s.hydrationReminder && (
                  <Row label="Reminder Every">
                    <Select value={s.hydrationIntervalHours} onChange={v => update("hydrationIntervalHours", v)} options={[
                      { value: "1", label: "1 hour" }, { value: "2", label: "2 hours" },
                      { value: "3", label: "3 hours" }, { value: "4", label: "4 hours" },
                    ]} />
                  </Row>
                )}
                <Row label="Meal Reminders" sublabel="Nudge at meal times">
                  <Toggle value={s.mealReminder} onChange={v => update("mealReminder", v)} />
                </Row>
                <Row label="Weekly Progress Report" sublabel="Sunday summary of your week">
                  <Toggle value={s.weeklyReport} onChange={v => update("weeklyReport", v)} />
                </Row>
                <Row label="Panther Daily Motivation" sublabel="Daily quote from The Panther System">
                  <Toggle value={s.pantherMotivation} onChange={v => update("pantherMotivation", v)} />
                </Row>
                <Row label="Streak At-Risk Warning" sublabel="Alert when you haven't trained in 2 days">
                  <Toggle value={s.streakWarning} onChange={v => update("streakWarning", v)} />
                </Row>
                <Row label="Notification Sound">
                  <Select value={s.notificationSound} onChange={v => update("notificationSound", v)} options={[
                    { value: "panther", label: "🐆 Panther Roar" },
                    { value: "standard", label: "Standard" },
                    { value: "silent", label: "Silent" },
                  ]} />
                </Row>
              </>}

              {/* ─────────── APP PREFERENCES ─────────── */}
              {sec.id === "app" && <>
                <Row label="Unit System">
                  <Select value={s.unitSystem} onChange={v => update("unitSystem", v as "imperial" | "metric")} options={[
                    { value: "imperial", label: "Imperial (lbs · in)" },
                    { value: "metric", label: "Metric (kg · cm)" },
                  ]} />
                </Row>
                <Row label="Theme">
                  <Select value={s.theme} onChange={v => update("theme", v as SettingsState["theme"])} options={[
                    { value: "dark", label: "Dark (default)" },
                    { value: "light", label: "Light" },
                    { value: "system", label: "System" },
                  ]} />
                </Row>
                <Row label="Coach Voice">
                  <Select value={s.coachVoice} onChange={v => update("coachVoice", v)} options={[
                    { value: "panther", label: "Marc — The Panther" },
                    { value: "female", label: "Female Coach" },
                    { value: "neutral", label: "Neutral" },
                  ]} />
                </Row>
                <Row label="ElevenLabs Voice ID" sublabel="Paste your cloned Voice ID from elevenlabs.io">
                  <input
                    type="text"
                    defaultValue={localStorage.getItem("tuf_elevenlabs_voice_id") || ""}
                    placeholder="e.g. pNInz6obpgDQGcFmaJgB"
                    onBlur={e => {
                      const id = e.target.value.trim();
                      if (id) {
                        localStorage.setItem("tuf_elevenlabs_voice_id", id);
                        setSaved(true);
                        setTimeout(() => setSaved(false), 2000);
                      }
                    }}
                    style={{
                      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, color: "#fff", padding: "7px 12px",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
                      width: 180, outline: "none",
                    }}
                  />
                </Row>
                <Row label="Coach Mode">
                  <Select value={s.coachMode} onChange={v => update("coachMode", v)} options={[
                    { value: "motivational", label: "Motivational" },
                    { value: "technical", label: "Technical" },
                    { value: "calm", label: "Calm" },
                    { value: "drill_sergeant", label: "Drill Sergeant" },
                  ]} />
                </Row>
                <Row label="Display Density">
                  <Select value={s.displayDensity} onChange={v => update("displayDensity", v)} options={[
                    { value: "compact", label: "Compact" },
                    { value: "standard", label: "Standard" },
                    { value: "comfortable", label: "Comfortable" },
                  ]} />
                </Row>
                <Row label="Haptic Feedback" sublabel="Vibration on reps and alerts">
                  <Toggle value={s.hapticFeedback} onChange={v => update("hapticFeedback", v)} />
                </Row>
                <Row label="Auto-Play Exercise Videos">
                  <Toggle value={s.autoPlayVideos} onChange={v => update("autoPlayVideos", v)} />
                </Row>
                <Row label="Show Movement Cues" sublabel="Video Awareness overlay in Workout Player">
                  <Toggle value={s.showMovementCues} onChange={v => update("showMovementCues", v)} />
                </Row>
                <Row label="Language">
                  <Select value={s.language} onChange={v => update("language", v)} options={[
                    { value: "en", label: "English" },
                    { value: "es", label: "Español (coming soon)" },
                    { value: "fr", label: "Français (coming soon)" },
                  ]} />
                </Row>
              </>}

              {/* ─────────── ACCOUNT ─────────── */}
              {sec.id === "account" && <>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
                    MEMBERSHIP
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "#C8973A", letterSpacing: "0.06em" }}>
                      FREE TIER
                    </div>
                    <button
                      onClick={() => navigate("/pricing")}
                      style={{
                        padding: "5px 12px", borderRadius: 8,
                        background: "linear-gradient(90deg, #FF6600, #C8973A)",
                        border: "none", fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: 12, letterSpacing: "0.08em", color: "#fff", cursor: "pointer",
                      }}
                    >
                      UPGRADE →
                    </button>
                  </div>
                </div>
                <Row label="Share Progress on Leaderboard">
                  <Toggle value={s.shareLeaderboard} onChange={v => update("shareLeaderboard", v)} />
                </Row>
                <Row label="Analytics Opt-Out" sublabel="Stop anonymous usage data collection">
                  <Toggle value={s.analyticsOptOut} onChange={v => update("analyticsOptOut", v)} />
                </Row>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 20 }}>
                  <a href="/terms" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#FF6600", letterSpacing: "0.06em" }}>
                    Terms of Service
                  </a>
                  <a href="/privacy" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "#FF6600", letterSpacing: "0.06em" }}>
                    Privacy Policy
                  </a>
                </div>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <button
                    onClick={() => {
                      const data = { settings: s, exportDate: new Date().toISOString() };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = "tuf-my-data.json"; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    style={{
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                      letterSpacing: "0.06em", color: "#fff", width: "100%", textAlign: "left",
                    }}
                  >
                    📥 EXPORT MY DATA (JSON)
                  </button>
                </div>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      navigate("/onboarding");
                    }}
                    style={{
                      background: "rgba(255,102,0,0.08)", border: "1px solid rgba(255,102,0,0.25)",
                      borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                      letterSpacing: "0.06em", color: "#FF6600", width: "100%", textAlign: "left",
                    }}
                  >
                    ↩ SIGN OUT
                  </button>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      style={{
                        background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                        fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700,
                        letterSpacing: "0.06em", color: "#ef4444", width: "100%", textAlign: "left",
                      }}
                    >
                      🗑 DELETE ACCOUNT
                    </button>
                  ) : (
                    <div style={{
                      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 12, padding: 16,
                    }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: "#ef4444", letterSpacing: "0.06em", marginBottom: 8 }}>
                        ARE YOU SURE?
                      </div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>
                        This will permanently delete your account, progress, and all data. This cannot be undone.
                      </div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <button
                          onClick={() => {
                            localStorage.clear();
                            navigate("/onboarding");
                          }}
                          style={{
                            flex: 1, padding: "10px", borderRadius: 8, border: "none",
                            background: "#ef4444", fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: 14, letterSpacing: "0.06em", color: "#fff", cursor: "pointer",
                          }}
                        >
                          YES, DELETE
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          style={{
                            flex: 1, padding: "10px", borderRadius: 8,
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "transparent", fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: 14, letterSpacing: "0.06em", color: "#fff", cursor: "pointer",
                          }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>}

            </div>
          )}
        </div>
      ))}

      {/* ── Footer ── */}
      <div style={{ padding: "24px 20px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.15)" }}>
          TURNED UP FITNESS LLC · v2.0
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, letterSpacing: "0.1em", color: "rgba(255,255,255,0.1)", marginTop: 4 }}>
          © 2026 All Rights Reserved
        </div>
      </div>
    </div>
  );
}
