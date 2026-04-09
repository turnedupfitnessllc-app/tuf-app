import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useState } from "react";
import Button from "../components/Button";
import Card from "../components/Card";
import Navbar from "../components/Navbar";
import colors from "../theme/colors";

const PAIN_REGIONS = [
  { label: "Shoulder",    icon: "💪" },
  { label: "Knee",        icon: "🦵" },
  { label: "Lower Back",  icon: "🔴" },
  { label: "Front Hip",   icon: "⚡" },
  { label: "Neck",        icon: "🔵" },
  { label: "Upper Back",  icon: "🟠" },
  { label: "Ankle",       icon: "🦶" },
  { label: "Deep Glute",  icon: "🟣" },
];

const INSIGHTS = {
  Shoulder:   "Limited shoulder mobility detected. Likely upper crossed syndrome. Corrective: band pull-aparts, face pulls, thoracic extension.",
  Knee:       "Anterior knee pain pattern. Likely quad dominance + weak glutes. Corrective: terminal knee extensions, glute bridges, single-leg work.",
  "Lower Back": "Lower back tension detected. Likely anterior pelvic tilt. Corrective: dead bugs, hip flexor stretches, McGill Big 3.",
  "Front Hip":  "Hip flexor tightness detected. Corrective: 90/90 hip stretch, couch stretch, psoas release.",
  Neck:       "Cervical tension detected. Likely forward head posture. Corrective: chin tucks, deep neck flexor activation.",
  "Upper Back": "Thoracic stiffness detected. Corrective: thoracic extensions over foam roller, cat-cow, open books.",
  Ankle:      "Ankle dorsiflexion restriction detected. Corrective: ankle circles, calf stretches, banded mobilization.",
  "Deep Glute": "Piriformis or deep glute tension detected. Corrective: figure-4 stretch, pigeon pose, hip 90/90.",
};

export default function AssessScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

        <Text style={styles.title}>Where is your pain?</Text>
        <Text style={styles.subtitle}>Select a region for Panther's analysis</Text>

        {/* Pain region grid */}
        <View style={styles.grid}>
          {PAIN_REGIONS.map((region) => {
            const isSelected = selected === region.label;
            return (
              <Button
                key={region.label}
                title={`${region.icon}  ${region.label}`}
                variant={isSelected ? "primary" : "secondary"}
                onPress={() => setSelected(region.label)}
                style={[
                  styles.regionBtn,
                  isSelected && styles.regionBtnActive,
                ]}
              />
            );
          })}
        </View>

        {/* Panther Insight */}
        {selected && (
          <Card style={styles.insightCard}>
            <Text style={styles.insightLabel}>🧠 PANTHER INSIGHT</Text>
            <Text style={styles.insightRegion}>{selected.toUpperCase()}</Text>
            <Text style={styles.insightText}>{INSIGHTS[selected]}</Text>
            <Button
              title="Build My Corrective Plan →"
              onPress={() => navigation.navigate("Workout")}
              style={{ marginTop: 12 }}
            />
          </Card>
        )}

      </ScrollView>
      <Navbar navigation={navigation} activeScreen="Assess" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6,
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.subtext,
    fontSize: 13,
    marginBottom: 24,
  },
  grid: {
    gap: 4,
  },
  regionBtn: {
    marginVertical: 4,
  },
  regionBtnActive: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  insightCard: {
    marginTop: 20,
    borderColor: "rgba(255,30,30,0.3)",
  },
  insightLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 4,
  },
  insightRegion: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
    letterSpacing: 2,
  },
  insightText: {
    color: colors.subtext,
    fontSize: 14,
    lineHeight: 22,
  },
});
