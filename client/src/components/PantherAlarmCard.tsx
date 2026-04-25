/**
 * PantherAlarmCard — Prominent Panther Alarm management card
 *
 * Always-visible card on the Schedule page (not buried in settings).
 * Features:
 *   - Quick-set morning alarm with large time display
 *   - Alarm type selector: Morning Check-In / Pre-Workout / Custom
 *   - Day-of-week selector (tap to toggle)
 *   - Enable/disable toggle with orange glow when active
 *   - "Schedule Alarm" button that posts to service worker
 *   - Add multiple alarms
 *   - Notification permission prompt inline
 *
 * © 2026 Turned Up Fitness LLC — All rights reserved
 */

import { useState, useCallback } from "react";

export interface AlarmEntry {
  id: string;
  label: string;
  time: string;   // HH:MM
  type: "morning_check_in" | "pre_workout" | "custom";
  enabled: boolean;
  days: number[];  // 0=Sun…6=Sat, empty=every day
  snoozeMin: number;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const ALARM_TYPES = [
  { key: "morning_check_in" as const, icon: "🌅", label: "MORNING", body: "IT'S TRAINING DAY. NO EXCUSES. LET'S GO." },
  { key: "pre_workout"       as const, icon: "💪", label: "PRE-WORK", body: "GET YOUR MIND RIGHT. SESSION STARTS SOON." },
  { key: "custom"            as const, icon: "🔔", label: "CUSTOM",   body: "" },
];

function makeAlarm(): AlarmEntry {
  return {
    id: Date.now().toString(),
    label: "PANTHER ALARM",
    time: "07:00",
    type: "morning_check_in",
    enabled: true,
    days: [],
    snoozeMin: 10,
  };
}

async function scheduleAlarmViaSW(alarm: AlarmEntry): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    if (!reg.active) return false;
    const now = new Date();
    const [h, m] = alarm.time.split(":").map(Number);
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delayMs = target.getTime() - now.getTime();
    if (delayMs <= 0 || delayMs > 48 * 60 * 60 * 1000) return false;
    const typeInfo = ALARM_TYPES.find(t => t.key === alarm.type);
    reg.active.postMessage({
      type: "SCHEDULE_ALARM",
      payload: {
        delay_ms: delayMs,
        title: "🐾 PANTHER",
        body: alarm.type === "custom" ? alarm.label : (typeInfo?.body ?? alarm.label),
        alarm_type: alarm.type,
        tag: `tuf-alarm-${alarm.id}`,
      },
    });
    return true;
  } catch { return false; }
}

async function requestNotifPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function formatTime12(time24: string): { h: string; m: string; ampm: string } {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return { h: String(h12), m: String(m).padStart(2, "0"), ampm };
}

interface PantherAlarmCardProps {
  alarms: AlarmEntry[];
  notifGranted: boolean;
  onAlarmsChange: (alarms: AlarmEntry[]) => void;
  onNotifGranted: () => void;
  onRoar: (msg: string) => void;
}

export function PantherAlarmCard({
  alarms,
  notifGranted,
  onAlarmsChange,
  onNotifGranted,
  onRoar,
}: PantherAlarmCardProps) {
  const [expanded, setExpanded] = useState<string | null>(alarms[0]?.id ?? null);
  const [scheduling, setScheduling] = useState<string | null>(null);
  const [requestingNotif, setRequestingNotif] = useState(false);

  const updateAlarm = useCallback((id: string, patch: Partial<AlarmEntry>) => {
    onAlarmsChange(alarms.map(a => a.id === id ? { ...a, ...patch } : a));
  }, [alarms, onAlarmsChange]);

  const deleteAlarm = useCallback((id: string) => {
    onAlarmsChange(alarms.filter(a => a.id !== id));
  }, [alarms, onAlarmsChange]);

  const addAlarm = useCallback(() => {
    const newAlarm = makeAlarm();
    onAlarmsChange([...alarms, newAlarm]);
    setExpanded(newAlarm.id);
  }, [alarms, onAlarmsChange]);

  const handleSchedule = useCallback(async (alarm: AlarmEntry) => {
    if (!notifGranted) {
      setRequestingNotif(true);
      const granted = await requestNotifPermission();
      setRequestingNotif(false);
      if (!granted) {
        onRoar("ENABLE NOTIFICATIONS IN BROWSER SETTINGS TO ACTIVATE PANTHER ALARMS.");
        return;
      }
      onNotifGranted();
    }
    setScheduling(alarm.id);
    const ok = await scheduleAlarmViaSW(alarm);
    setScheduling(null);
    if (ok) {
      const { h, m, ampm } = formatTime12(alarm.time);
      onRoar(`🔔 ALARM SET: ${h}:${m} ${ampm} — PANTHER WILL WAKE YOU UP.`);
    } else {
      onRoar("ALARM SCHEDULING FAILED. CHECK NOTIFICATION PERMISSIONS.");
    }
  }, [notifGranted, onNotifGranted, onRoar]);

  const handleToggle = useCallback((alarm: AlarmEntry) => {
    const newEnabled = !alarm.enabled;
    updateAlarm(alarm.id, { enabled: newEnabled });
    if (newEnabled && notifGranted) {
      scheduleAlarmViaSW({ ...alarm, enabled: true });
    }
  }, [updateAlarm, notifGranted]);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Section header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 10,
      }}>
        <div style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.35)",
        }}>
          🐾 PANTHER ALARMS
        </div>
        <button
          onClick={addAlarm}
          style={{
            background: "rgba(255,102,0,0.12)", border: "1px solid rgba(255,102,0,0.3)",
            borderRadius: 8, padding: "4px 10px",
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.1em", color: "#FF6600", cursor: "pointer",
          }}
        >
          + ADD
        </button>
      </div>

      {/* Empty state */}
      {alarms.length === 0 && (
        <div
          onClick={addAlarm}
          style={{
            padding: "20px 16px", borderRadius: 16, cursor: "pointer",
            background: "rgba(255,102,0,0.04)", border: "1.5px dashed rgba(255,102,0,0.2)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>⏰</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
            NO ALARMS SET
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
            Tap to add a Panther alarm
          </div>
        </div>
      )}

      {/* Alarm cards */}
      {alarms.map((alarm) => {
        const isExpanded = expanded === alarm.id;
        const { h, m, ampm } = formatTime12(alarm.time);
        const typeInfo = ALARM_TYPES.find(t => t.key === alarm.type)!;
        const dayLabel = alarm.days.length === 0
          ? "Every day"
          : alarm.days.map(d => DAY_LABELS[d]).join(", ");

        return (
          <div
            key={alarm.id}
            style={{
              marginBottom: 10, borderRadius: 18, overflow: "hidden",
              border: alarm.enabled
                ? "1px solid rgba(255,102,0,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              background: alarm.enabled
                ? "linear-gradient(135deg, rgba(255,102,0,0.08) 0%, rgba(0,0,0,0.6) 100%)"
                : "rgba(255,255,255,0.03)",
              boxShadow: alarm.enabled
                ? "0 0 24px rgba(255,102,0,0.12)"
                : "none",
              transition: "all 0.25s ease",
            }}
          >
            {/* Collapsed / header row */}
            <div
              onClick={() => setExpanded(isExpanded ? null : alarm.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", cursor: "pointer",
              }}
            >
              {/* Time display */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 36, letterSpacing: "0.02em",
                    color: alarm.enabled ? "#fff" : "rgba(255,255,255,0.4)",
                    lineHeight: 1,
                  }}>
                    {h}:{m}
                  </span>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: 14, fontWeight: 700,
                    color: alarm.enabled ? "#FF6600" : "rgba(255,255,255,0.3)",
                  }}>
                    {ampm}
                  </span>
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.35)", marginTop: 2,
                }}>
                  {typeInfo.icon} {alarm.label} · {dayLabel}
                </div>
              </div>

              {/* Toggle switch */}
              <button
                onClick={(e) => { e.stopPropagation(); handleToggle(alarm); }}
                style={{
                  width: 50, height: 28, borderRadius: 14, border: "none",
                  cursor: "pointer", flexShrink: 0, position: "relative",
                  background: alarm.enabled
                    ? "linear-gradient(135deg, #FF6600, #cc4400)"
                    : "rgba(255,255,255,0.1)",
                  transition: "background 0.2s",
                  boxShadow: alarm.enabled ? "0 0 12px rgba(255,102,0,0.5)" : "none",
                }}
              >
                <div style={{
                  position: "absolute", top: 4,
                  left: alarm.enabled ? 26 : 4,
                  width: 20, height: 20, borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }} />
              </button>

              {/* Expand chevron */}
              <span style={{
                color: "rgba(255,255,255,0.3)", fontSize: 12,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                flexShrink: 0,
              }}>▼</span>
            </div>

            {/* Expanded editor */}
            {isExpanded && (
              <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>

                {/* Time picker */}
                <div style={{ marginTop: 14, marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    ALARM TIME
                  </div>
                  <input
                    type="time"
                    value={alarm.time}
                    onChange={e => updateAlarm(alarm.id, { time: e.target.value })}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                      padding: "10px 14px", color: "#fff",
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 28,
                      letterSpacing: "0.06em", outline: "none",
                      colorScheme: "dark", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Label */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    LABEL
                  </div>
                  <input
                    type="text"
                    value={alarm.label}
                    maxLength={30}
                    placeholder="PANTHER ALARM"
                    onChange={e => updateAlarm(alarm.id, { label: e.target.value })}
                    style={{
                      width: "100%", background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
                      padding: "10px 14px", color: "#fff",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700,
                      letterSpacing: "0.08em", outline: "none", boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Type selector */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    ALARM TYPE
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {ALARM_TYPES.map(t => (
                      <button
                        key={t.key}
                        onClick={() => updateAlarm(alarm.id, { type: t.key })}
                        style={{
                          flex: 1, padding: "8px 4px", borderRadius: 10,
                          border: "1px solid",
                          background: alarm.type === t.key ? "rgba(255,102,0,0.2)" : "transparent",
                          borderColor: alarm.type === t.key ? "#FF6600" : "rgba(255,255,255,0.1)",
                          color: alarm.type === t.key ? "#FF6600" : "rgba(255,255,255,0.4)",
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 9, fontWeight: 700, letterSpacing: "0.08em",
                          cursor: "pointer", transition: "all 0.15s",
                        }}
                      >
                        {t.icon}<br />{t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day selector */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                    REPEAT DAYS <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>(empty = every day)</span>
                  </div>
                  <div style={{ display: "flex", gap: 5 }}>
                    {DAY_LABELS.map((d, di) => (
                      <button
                        key={di}
                        onClick={() => {
                          const days = alarm.days.includes(di)
                            ? alarm.days.filter(x => x !== di)
                            : [...alarm.days, di].sort();
                          updateAlarm(alarm.id, { days });
                        }}
                        style={{
                          flex: 1, padding: "6px 2px", borderRadius: 8,
                          border: "1px solid",
                          background: alarm.days.includes(di) ? "rgba(255,102,0,0.2)" : "transparent",
                          borderColor: alarm.days.includes(di) ? "#FF6600" : "rgba(255,255,255,0.1)",
                          color: alarm.days.includes(di) ? "#FF6600" : "rgba(255,255,255,0.3)",
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontSize: 9, fontWeight: 700, cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  {/* Schedule button */}
                  <button
                    onClick={() => handleSchedule(alarm)}
                    disabled={scheduling === alarm.id}
                    style={{
                      flex: 2, padding: "12px", borderRadius: 12, border: "none",
                      background: alarm.enabled
                        ? "linear-gradient(135deg, #FF6600, #cc4400)"
                        : "rgba(255,255,255,0.08)",
                      color: alarm.enabled ? "#fff" : "rgba(255,255,255,0.3)",
                      fontFamily: "'Bebas Neue', sans-serif", fontSize: 15,
                      letterSpacing: "0.1em", cursor: alarm.enabled ? "pointer" : "default",
                      boxShadow: alarm.enabled ? "0 4px 16px rgba(255,102,0,0.3)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    {scheduling === alarm.id ? "SCHEDULING..." : requestingNotif ? "REQUESTING..." : "🔔 SET ALARM"}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteAlarm(alarm.id)}
                    style={{
                      flex: 1, padding: "12px", borderRadius: 12,
                      border: "1px solid rgba(239,68,68,0.2)",
                      background: "rgba(239,68,68,0.06)", color: "#ef4444",
                      fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12,
                      fontWeight: 700, letterSpacing: "0.08em", cursor: "pointer",
                    }}
                  >
                    DELETE
                  </button>
                </div>

                {/* Notification denied warning */}
                {!notifGranted && typeof Notification !== "undefined" && Notification.permission === "denied" && (
                  <div style={{
                    marginTop: 10, padding: "8px 12px", borderRadius: 10,
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10,
                    fontWeight: 700, letterSpacing: "0.06em", color: "#ef4444",
                  }}>
                    ⚠ NOTIFICATIONS BLOCKED — Enable in browser/device settings
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PantherAlarmCard;
