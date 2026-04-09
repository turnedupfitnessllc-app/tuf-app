import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import HomeScreen     from "./screens/HomeScreen";
import AssessScreen   from "./screens/AssessScreen";
import WorkoutScreen  from "./screens/WorkoutScreen";
import ProgressScreen from "./screens/ProgressScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0B0B0B" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Home"     component={HomeScreen} />
        <Stack.Screen name="Assess"   component={AssessScreen} />
        <Stack.Screen name="Workout"  component={WorkoutScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
