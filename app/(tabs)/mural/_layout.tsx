import { Stack } from "expo-router";

export default function MuralLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // você já tem header custom
      }}
    />
  );
}