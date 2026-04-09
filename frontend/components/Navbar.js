import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../theme/colors";

const NAV_ITEMS = [
  { label: "Home",     icon: "🏠", screen: "Home" },
  { label: "Workout",  icon: "🏋️", screen: "Workout" },
  { label: "Assess",   icon: "📋", screen: "Assess" },
  { label: "Progress", icon: "📈", screen: "Progress" },
];

export default function Navbar({ navigation, activeScreen }) {
  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeScreen === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.item}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {item.label}
            </Text>
            {isActive && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 24,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    color: colors.subtext,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  labelActive: {
    color: colors.primary,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
});
