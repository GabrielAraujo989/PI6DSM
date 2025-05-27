import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="screens/_layout" options={{ headerShown: false }} />
    </Stack>
  );
}