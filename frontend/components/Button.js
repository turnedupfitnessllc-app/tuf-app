import { TouchableOpacity, Text, StyleSheet } from "react-native";
import colors from "../theme/colors";

export default function Button({ title, onPress, variant = "primary", style }) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      style={[styles.button, isPrimary ? styles.primary : styles.secondary, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, !isPrimary && styles.textSecondary]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 6,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  textSecondary: {
    color: colors.subtext,
  },
});
