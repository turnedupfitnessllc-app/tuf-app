import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import colors from "../theme/colors";

const WEEKS = [
  {
    week: 1,
    theme: "INHIBIT + LENGTHEN",
    sessions: [
      {
        day: "D1",
        title: "CORRECTIVE + LOWER",
        duration: "35 min",
        exercises: [
          { name: "Foam Roll IT Band",         sets: "2×60s", cue: "Slow, controlled pressure" },
          { name: "90/90 Hip Stretch",          sets: "2×45s/side", cue: "Keep spine tall" },
          { name: "Dead Bug",                   sets: "3×10", cue: "Press lower back to floor" },
          { name: "Glute Bridge",               sets: "3×15", cue: "Drive through heels" },
          { name: "Terminal Knee Extension",    sets: "3×15", cue: "Full extension, slow return" },
        ],
      },
      {
        day: "D2",
        title: "MOBILITY + UPPER",
        duration: "30 min",
        exercises: [
          { name: "Thoracic Extension (Roller)", sets: "2×60s", cue: "Support neck, breathe deep" },
          { name: "Band Pull-Apart",             sets: "3×15", cue: "Squeeze shoulder blades" },
          { name: "Face Pull",                   sets: "3×15", cue: "External rotation at end" },
          { name: "Chin Tuck",                   sets: "3×10", cue: "Double chin, hold 3s" },
          { name: "Open Book Rotation",          sets: "2×10/side", cue: "Follow hand with eyes" },
        ],
      },
      {
        day: "D3",
        title: "FULL BODY ACTIVATE",
        duration: "40 min",
        exercises: [
          { name: "Goblet Squat",               sets: "3×10", cue: "Chest up, knees track toes" },
          { name: "Romanian Deadlift",           sets: "3×10", cue: "Hinge at hips, soft knees" },
          { name: "Single-Arm Row",              sets: "3×10/side", cue: "Elbow to hip pocket" },
          { name: "Push-Up",                     sets: "3×12", cue: "Hollow body, full range" },
          { name: "Pallof Press",                sets: "3×10/side", cue: "Resist rotation" },
        ],
      },
    ],
  },
];

export default function WorkoutScreen({ navigation }) {
  const [activeSession, setActiveSession] = useState(null);
  const [completed, setCompleted] = useState({});

  const session = activeSession !== null ? WEEKS[0].sessions[activeSession] : null;

  const toggleExercise = (idx) => {
    setCompleted(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (session) {
    const doneCount = Object.values(completed).filter(Boolean).length;
    const total = session.exercises.length;
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
          <TouchableOpacity onPress={() => { setActiveSession(null); setCompleted({}); }}>
            <Text style={styles.back}>← BACK</Text>
          </TouchableOpacity>

          <Text style={styles.sessionDay}>{session.day}</Text>
          <Text style={styles.sessionTitle}>{session.title}</Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(doneCount / total) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{doneCount}/{total} COMPLETE</Text>

          {/* Exercise list */}
          {session.exercises.map((ex, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.exerciseRow, completed[idx] && styles.exerciseRowDone]}
              onPress={() => toggleExercise(idx)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, completed[idx] && styles.checkboxDone]}>
                {completed[idx] && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={[styles.exerciseName, completed[idx] && styles.exerciseNameDone]}>
                  {ex.name}
                </Text>
                <Text style={styles.exerciseSets}>{ex.sets}</Text>
                <Text style={styles.exerciseCue}>"{ex.cue}"</Text>
              </View>
            </TouchableOpacity>
          ))}

          {doneCount === total && (
            <Card style={styles.completeCard}>
              <Text style={styles.completeTitle}>🔥 SESSION COMPLETE</Text>
              <Text style={styles.completeText}>+50 XP earned. Panther approves.</Text>
              <Button title="Back to Program" onPress={() => { setActiveSession(null); setCompleted({}); }} />
            </Card>
          )}
        </ScrollView>
        <Navbar navigation={navigation} activeScreen="Workout" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Your Program</Text>

        <View style={styles.weekHeader}>
          <Text style={styles.weekLabel}>WEEK 1</Text>
          <Text style={styles.weekTheme}>{WEEKS[0].theme}</Text>
        </View>

        {WEEKS[0].sessions.map((s, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => { setActiveSession(idx); setCompleted({}); }}
            activeOpacity={0.85}
          >
            <Card style={styles.sessionCard}>
              <View style={styles.sessionCardRow}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>{s.day}</Text>
                </View>
                <View style={styles.sessionCardInfo}>
                  <Text style={styles.sessionCardTitle}>{s.title}</Text>
                  <Text style={styles.sessionCardMeta}>{s.exercises.length} exercises · {s.duration}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Navbar navigation={navigation} activeScreen="Workout" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginBottom: 20, letterSpacing: 1 },
  weekHeader: { marginBottom: 12 },
  weekLabel: { color: colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 3 },
  weekTheme: { color: colors.subtext, fontSize: 13, marginTop: 2 },
  sessionCard: { marginVertical: 6 },
  sessionCardRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dayBadge: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: "rgba(255,30,30,0.15)",
    borderWidth: 1, borderColor: "rgba(255,30,30,0.3)",
    alignItems: "center", justifyContent: "center",
  },
  dayBadgeText: { color: colors.primary, fontWeight: "900", fontSize: 13, letterSpacing: 1 },
  sessionCardInfo: { flex: 1 },
  sessionCardTitle: { color: colors.text, fontWeight: "800", fontSize: 14, letterSpacing: 0.5 },
  sessionCardMeta: { color: colors.subtext, fontSize: 12, marginTop: 2 },
  chevron: { color: colors.subtext, fontSize: 22 },
  back: { color: colors.primary, fontSize: 13, fontWeight: "700", letterSpacing: 1, marginBottom: 16 },
  sessionDay: { color: colors.primary, fontSize: 12, fontWeight: "700", letterSpacing: 3 },
  sessionTitle: { color: colors.text, fontSize: 22, fontWeight: "900", marginBottom: 16, letterSpacing: 1 },
  progressTrack: { height: 4, backgroundColor: colors.secondary, borderRadius: 2, marginBottom: 6 },
  progressFill: { height: 4, backgroundColor: colors.primary, borderRadius: 2 },
  progressLabel: { color: colors.subtext, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 16 },
  exerciseRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    padding: 14, borderRadius: 12,
    backgroundColor: colors.secondary,
    borderWidth: 1, borderColor: colors.border,
    marginVertical: 4,
  },
  exerciseRowDone: { opacity: 0.5 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6,
    borderWidth: 2, borderColor: colors.subtext,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginTop: 2,
  },
  checkboxDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "900" },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: colors.text, fontWeight: "700", fontSize: 15 },
  exerciseNameDone: { textDecorationLine: "line-through", color: colors.subtext },
  exerciseSets: { color: colors.primary, fontSize: 12, marginTop: 2 },
  exerciseCue: { color: colors.subtext, fontSize: 11, fontStyle: "italic", marginTop: 2 },
  completeCard: { marginTop: 20, borderColor: "rgba(255,30,30,0.3)", alignItems: "center" },
  completeTitle: { color: colors.primary, fontSize: 20, fontWeight: "900", letterSpacing: 2, marginBottom: 6 },
  completeText: { color: colors.subtext, fontSize: 13, marginBottom: 12 },
});
