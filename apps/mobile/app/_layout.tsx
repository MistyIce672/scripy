import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "../store/auth";

function RootNavigator() {
  const session = useAuthStore((s) => s.session);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="create"
          options={{ headerShown: true, title: "Create App", presentation: "modal" }}
        />
        <Stack.Screen
          name="[appId]"
          options={{ headerShown: true, title: "App" }}
        />
        <Stack.Screen
          name="marketplace"
          options={{ headerShown: true, title: "Marketplace" }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return (
    <>
      <StatusBar style="auto" />
      <RootNavigator />
    </>
  );
}
