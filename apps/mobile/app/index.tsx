import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAuthStore } from "../store/auth";
import { useAppsStore } from "../store/apps";
import { AppCard, type MenuAction } from "../components/AppCard";
import type { App } from "../types";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { myApps, installedApps, fetchMyApps, fetchInstalledApps, deleteApp, uninstallApp } =
    useAppsStore();
  const [refreshing, setRefreshing] = useState(false);

  const allApps: App[] = [
    ...myApps,
    ...installedApps.filter(
      (installed) => !myApps.some((my) => my.id === installed.id)
    ),
  ];

  useFocusEffect(
    useCallback(() => {
      fetchMyApps();
      fetchInstalledApps();
    }, [fetchMyApps, fetchInstalledApps])
  );

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([fetchMyApps(), fetchInstalledApps()]);
    setRefreshing(false);
  }

  function handleAppPress(app: App) {
    router.push(`/${app.id}`);
  }

  function getMenuActions(app: App): MenuAction[] {
    const isOwner = app.author_id === user?.id;

    if (isOwner) {
      return [
        { label: "Details", onPress: () => router.push({ pathname: `/${app.id}`, params: { details: "true" } }) },
        {
          label: "Delete",
          destructive: true,
          onPress: () => {
            Alert.alert("Delete App", `Are you sure you want to delete "${app.title}"?`, [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => deleteApp(app.id) },
            ]);
          },
        },
      ];
    }

    return [
      { label: "Details", onPress: () => router.push({ pathname: `/${app.id}`, params: { details: "true" } }) },
      { label: "Remove", destructive: true, onPress: () => uninstallApp(app.id) },
    ];
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hi, {user?.email?.split("@")[0] ?? "there"}
          </Text>
          <Text style={styles.title}>Your Apps</Text>
        </View>
        <Pressable onPress={signOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>

      <FlatList
        data={allApps}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppCard
            app={item}
            onPress={() => handleAppPress(item)}
            menuActions={getMenuActions(item)}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No apps yet</Text>
            <Text style={styles.emptyText}>
              Create your first mini app or browse the marketplace
            </Text>
          </View>
        }
      />

      <View style={styles.bottomBar}>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/create")}
        >
          <Text style={styles.actionButtonText}>+ Create</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => router.push("/marketplace")}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Marketplace
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 14,
    color: "#666",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 2,
  },
  signOutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  signOutText: {
    color: "#999",
    fontSize: 14,
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 240,
  },
  bottomBar: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#1A73E8",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#1A73E8",
  },
  secondaryButtonText: {
    color: "#1A73E8",
  },
});
