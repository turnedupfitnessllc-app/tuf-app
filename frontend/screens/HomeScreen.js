import { View, Text, StyleSheet, SafeAreaView, Image } from "react-native";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import colors from "../theme/colors";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Logo / Brand */}
        <Text style={styles.logo}>PANTHER</Text>
        <Text style={styles.brand}>TURNED UP FITNESS</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Train with precision.{"\n"}Move without pain.
        </Text>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Primary CTA */}
        <Button
          title="Start Workout"
          onPress={() => navigation.navigate("Workout")}
        />

        {/* Secondary actions */}
        <Button
          title="Assess Pain"
          variant="secondary"
          onPress={() => navigation.navigate("Assess")}
        />
        <Button
          title="View Progress"
          variant="secondary"
          onPress={() => navigation.navigate("Progress")}
        />

      </View>

      {/* Bottom Nav */}
      <Navbar navigation={navigation} activeScreen="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 6,
  },
  brand: {
    color: colors.subtext,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 20,
    textTransform: "uppercase",
  },
  tagline: {
    color: colors.text,
    textAlign: "center",
    fontSize: 18,
    lineHeight: 28,
    marginVertical: 20,
  },
  spacer: {
    height: 20,
  },
});
