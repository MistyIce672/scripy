import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useAppsStore } from "../store/apps";
import { AppCard } from "../components/AppCard";
import type { App } from "../types";

export default function MarketplaceScreen() {
  const {
    marketplaceApps,
    installedApps,
    loading,
    fetchMarketplaceApps,
    installApp,
    uninstallApp,
    fetchInstalledApps,
  } = useAppsStore();
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchMarketplaceApps();
      fetchInstalledApps();
    }, [fetchMarketplaceApps, fetchInstalledApps])
  );

  function handleSearch(text: string) {
    setSearch(text);
    fetchMarketplaceApps(text || undefined);
  }

  function isInstalled(appId: string): boolean {
    return installedApps.some((a) => a.id === appId);
  }

  async function handleToggleInstall(app: App) {
    if (isInstalled(app.id)) {
      const success = await uninstallApp(app.id);
      if (!success) {
        Alert.alert("Error", "Failed to uninstall app");
      }
    } else {
      const success = await installApp(app.id);
      if (!success) {
        Alert.alert("Error", "Failed to install app");
      }
    }
  }

  function renderApp({ item }: { item: App }) {
    return (
      <AppCard
        app={item}
        onPress={() => setSelectedApp(item)}
      />
    );
  }

  const selectedInstalled = selectedApp ? isInstalled(selectedApp.id) : false;

  return (
    <View style={styles.container}>
      <Modal
        visible={!!selectedApp}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedApp(null)}
      >
        {selectedApp && (
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setSelectedApp(null)}>
                <Text style={styles.modalClose}>Close</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalContent}>
              <View style={styles.modalIconRow}>
                <View style={styles.modalIcon}>
                  <Text style={styles.modalIconText}>
                    {selectedApp.title.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.modalMeta}>
                  <Text style={styles.modalTitle}>{selectedApp.title}</Text>
                  {selectedApp.description && (
                    <Text style={styles.modalDesc}>{selectedApp.description}</Text>
                  )}
                  <Text style={styles.modalInstalls}>
                    {selectedApp.install_count} install{selectedApp.install_count !== 1 ? "s" : ""}
                  </Text>
                </View>
              </View>

              {selectedApp.readme ? (
                <View style={styles.readmeSection}>
                  <Text style={styles.readmeLabel}>README</Text>
                  <Text style={styles.readmeText}>{selectedApp.readme}</Text>
                </View>
              ) : (
                <View style={styles.readmeSection}>
                  <Text style={styles.noReadme}>No README provided.</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              {selectedInstalled ? (
                <>
                  <Pressable
                    style={styles.modalOpenButton}
                    onPress={() => { setSelectedApp(null); router.push(`/${selectedApp.id}`); }}
                  >
                    <Text style={styles.modalOpenText}>Open</Text>
                  </Pressable>
                  <Pressable
                    style={styles.modalRemoveButton}
                    onPress={() => handleToggleInstall(selectedApp)}
                  >
                    <Text style={styles.modalRemoveText}>Remove</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={styles.modalInstallButton}
                  onPress={async () => {
                    await handleToggleInstall(selectedApp);
                    setSelectedApp(null);
                    router.push(`/${selectedApp.id}`);
                  }}
                >
                  <Text style={styles.modalInstallText}>Install</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </Modal>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
          placeholder="Search apps..."
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={marketplaceApps}
        keyExtractor={(item) => item.id}
        renderItem={renderApp}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>
              {loading ? "Loading..." : "No apps found"}
            </Text>
            {!loading && (
              <Text style={styles.emptyText}>
                {search
                  ? "Try a different search term"
                  : "Be the first to publish an app!"}
              </Text>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchBar: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalClose: {
    fontSize: 16,
    color: "#1A73E8",
    fontWeight: "500",
  },
  modalBody: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  modalIconRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  modalIconText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A73E8",
  },
  modalMeta: {
    flex: 1,
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  modalDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  modalInstalls: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  readmeSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  readmeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  readmeText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  noReadme: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 12,
  },
  modalInstallButton: {
    flex: 1,
    backgroundColor: "#1A73E8",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalInstallText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOpenButton: {
    flex: 1,
    backgroundColor: "#1A73E8",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  modalOpenText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalRemoveButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  modalRemoveText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
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
  },
});
