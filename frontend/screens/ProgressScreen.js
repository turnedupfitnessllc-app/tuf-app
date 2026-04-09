import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import colors from "../theme/colors";

const STATS = [
  { icon: "🔥", label: "Streak",    value: "7 days",     color: colors.gold },
  { icon: "💪", label: "Strength",  value: "Improving",  color: colors.success },
  { icon: "🦵", label: "Knee Pain", value: "Reduced",    color: colors.info },
  { icon: "⚡", label: "XP",        value: "350 pts",    color: colors.primary },
  { icon: "🏋️", label: "Sessions",  value: "12 total",   color: colors.text },
];

const STAGES = [
  { name: "CUB",        xp: 0,    unlocked: true  },
  { name: "STEALTH",    xp: 500,  unlocked: false },
  { name: "CONTROLLED", xp: 1500, unlocked: false },
  { name: "DOMINANT",   xp: 3000, unlocked: false },
  { name: "APEX",       xp: 6000, unlocked: false },
];

export default function ProgressScreen({ navigation }) {
  const currentXP = 350;
  const nextStage = STAGES.find(s => s.xp > currentXP);
  const xpToNext  = nextStage ? nextStage.xp - currentXP : 0;
  const progress  = nextStage ? currentXP / nextStage.xp : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

        <Text style={styles.title}>Progress</Text>

        {/* XP Progress to next stage */}
        <Card style={styles.xpCard}>
          <Text style={styles.stageLabel}>CURRENT STAGE</Text>
          <Text style={styles.stageName}>CUB</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.xpLabel}>
            {currentXP} XP · {xpToNext} XP to {nextStage?.name}
          </Text>
        </Card>

        {/* Stats */}
        <Text style={styles.sectionLabel}>YOUR STATS</Text>
        {STATS.map((stat) => (
          <Card key={stat.label} style={styles.statCard}>
            <View style={styles.statRow}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          </Card>
        ))}

        {/* Stage Ladder */}
        <Text style={styles.sectionLabel}>STAGE LADDER</Text>
        {STAGES.map((stage, idx) => (
          <Card
            key={stage.name}
            style={[styles.stageCard, !stage.unlocked && styles.stageCardLocked]}
          >
            <View style={styles.stageRow}>
              <Text style={styles.stageNum}>{idx + 1}</Text>
              <View style={styles.stageInfo}>
                <Text style={[styles.stageName2, !stage.unlocked && styles.stageLocked]}>
                  {stage.name}
                </Text>
                <Text style={styles.stageXP}>{stage.xp} XP required</Text>
              </View>
              <Text style={styles.stageLock}>
                {stage.unlocked ? "✅" : "🔒"}
              </Text>
            </View>
          </Card>
        ))}

      </ScrollView>
      <Navbar navigation={navigation} activeScreen="Progress" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: "900", marginBottom: 20, letterSpacing: 1 },
  xpCard: { borderColor: "rgba(255,30,30,0.25)", marginBottom: 20 },
  stageLabel: { color: colors.primary, fontSize: 10, fontWeight: "700", letterSpacing: 3, marginBottom: 4 },
  stageName: { color: colors.text, fontSize: 26, fontWeight: "900", letterSpacing: 4, marginBottom: 12 },
  progressTrack: { height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 6 },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  xpLabel: { color: colors.subtext, fontSize: 12 },
  sectionLabel: {
    color: colors.subtext, fontSize: 10, fontWeight: "700",
    letterSpacing: 3, marginTop: 8, marginBottom: 8,
  },
  statCard: { marginVertical: 4 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  statIcon: { fontSize: 22, width: 30 },
  statLabel: { color: colors.subtext, fontSize: 14, flex: 1 },
  statValue: { fontSize: 15, fontWeight: "700" },
  stageCard: { marginVertical: 4 },
  stageCardLocked: { opacity: 0.45 },
  stageRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stageNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(255,30,30,0.15)",
    color: colors.primary, fontWeight: "900",
    textAlign: "center", lineHeight: 28, fontSize: 13,
  },
  stageInfo: { flex: 1 },
  stageName2: { color: colors.text, fontWeight: "800", fontSize: 15, letterSpacing: 2 },
  stageLocked: { color: colors.subtext },
  stageXP: { color: colors.subtext, fontSize: 11, marginTop: 2 },
  stageLock: { fontSize: 18 },
});
