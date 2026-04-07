import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/auth";
import { useAppsStore } from "../store/apps";
import { SandboxFrame } from "../components/SandboxFrame";
import { Editor } from "../components/Editor";
import { createRoom, getMyRooms, generateInviteLink } from "../lib/rooms";
import type { App, Room } from "../types";

export default function AppRunnerScreen() {
  const { appId, details } = useLocalSearchParams<{ appId: string; details?: string }>();
  const user = useAuthStore((s) => s.user);
  const updateApp = useAppsStore((s) => s.updateApp);
  const deleteApp = useAppsStore((s) => s.deleteApp);
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"run" | "edit" | "readme" | "details">(
    details === "true" ? "details" : "run"
  );
  const [readmeDraft, setReadmeDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  useEffect(() => {
    loadApp();
  }, [appId]);

  async function loadApp() {
    if (!appId) return;

    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .eq("id", appId)
      .single();

    if (error || !data) {
      Alert.alert("Error", "App not found");
      return;
    }

    setApp(data);
    setLoading(false);

    const rooms = await getMyRooms(appId);
    if (rooms.length > 0) {
      setActiveRoom(rooms[0]);
    }
  }

  async function handleCreateRoom() {
    if (!appId || !app) return;
    const room = await createRoom(appId, `${app.title} Room`);
    if (room) {
      setActiveRoom(room);
    }
  }

  async function handleShareRoom() {
    if (!activeRoom) return;
    const link = generateInviteLink(activeRoom.id);
    await Share.share({ message: `Join my room: ${link}` });
  }

  const isOwner = app?.author_id === user?.id;

  async function handleSaveEdit(htmlSource: string) {
    if (!app) return;
    setSaving(true);
    const success = await updateApp(app.id, { html_source: htmlSource });
    setSaving(false);
    if (success) {
      setApp({ ...app, html_source: htmlSource });
      setView("run");
    } else {
      Alert.alert("Error", "Failed to save changes.");
    }
  }

  async function handleTogglePublish() {
    if (!app) return;
    const newPublic = !app.is_public;
    setSaving(true);
    const success = await updateApp(app.id, { is_public: newPublic });
    setSaving(false);
    if (success) {
      setApp({ ...app, is_public: newPublic });
    } else {
      Alert.alert("Error", "Failed to update publish status.");
    }
  }

  async function handleSaveReadme() {
    if (!app) return;
    setSaving(true);
    const readme = readmeDraft.trim() || null;
    const success = await updateApp(app.id, { readme });
    setSaving(false);
    if (success) {
      setApp({ ...app, readme });
      setView("details");
    } else {
      Alert.alert("Error", "Failed to save README.");
    }
  }

  async function handleDelete() {
    if (!app) return;
    Alert.alert("Delete App", `Are you sure you want to delete "${app.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteApp(app.id);
          router.back();
        },
      },
    ]);
  }

  if (loading || !app || !user) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1A73E8" />
      </View>
    );
  }

  if (view === "readme") {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: "Edit README",
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => setView("details")}>
                <Text style={styles.headerAction}>Cancel</Text>
              </Pressable>
            ),
            headerRight: () => (
              <Pressable onPress={handleSaveReadme} disabled={saving}>
                <Text style={[styles.headerAction, saving && { opacity: 0.5 }]}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            ),
          }}
        />
        <TextInput
          style={styles.readmeEditor}
          value={readmeDraft}
          onChangeText={setReadmeDraft}
          multiline
          autoFocus
          placeholder={"Describe your app for the marketplace.\n\nWhat does it do?\nHow to use it?\nAny tips?"}
          placeholderTextColor="#999"
          textAlignVertical="top"
        />
      </View>
    );
  }

  if (view === "edit") {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: `Edit: ${app.title}`,
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => setView("run")}>
                <Text style={styles.headerAction}>Cancel</Text>
              </Pressable>
            ),
          }}
        />
        <Editor initialValue={app.html_source} onSave={handleSaveEdit} saving={saving} />
      </View>
    );
  }

  if (view === "details") {
    return (
      <View style={styles.detailsContainer}>
        <Stack.Screen
          options={{
            title: "App Details",
            headerShown: true,
            headerLeft: () => (
              <Pressable onPress={() => router.back()}>
                <Text style={styles.headerAction}>Back</Text>
              </Pressable>
            ),
            headerRight: () => (
              <Pressable onPress={() => setView("run")}>
                <Text style={styles.headerAction}>Run App</Text>
              </Pressable>
            ),
          }}
        />

        <ScrollView style={styles.detailsBody}>
          <View style={styles.detailsAppInfo}>
            <View style={styles.detailsIcon}>
              <Text style={styles.detailsIconText}>
                {app.title.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.detailsAppName}>{app.title}</Text>
            {app.description && (
              <Text style={styles.detailsAppDesc}>{app.description}</Text>
            )}
            <Text style={styles.detailsAppMeta}>
              {app.install_count} install{app.install_count !== 1 ? "s" : ""}
              {app.is_public ? "  ·  Public" : "  ·  Private"}
            </Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.sectionLabel}>Room</Text>
            {activeRoom ? (
              <View style={styles.roomRow}>
                <View style={styles.roomDot} />
                <Text style={styles.roomName} numberOfLines={1}>
                  {activeRoom.name ?? "Shared Room"}
                </Text>
                <Pressable style={styles.detailsBtn} onPress={handleShareRoom}>
                  <Text style={styles.detailsBtnText}>Invite</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.detailsBtn} onPress={handleCreateRoom}>
                <Text style={styles.detailsBtnText}>+ Create Shared Room</Text>
              </Pressable>
            )}
          </View>

          {isOwner && (
            <>
              <View style={styles.detailsSection}>
                <Text style={styles.sectionLabel}>Manage</Text>
                <Pressable
                  style={styles.detailsRow}
                  onPress={() => setView("edit")}
                >
                  <Text style={styles.detailsRowText}>Edit Code</Text>
                  <Text style={styles.detailsChevron}>{"\u203A"}</Text>
                </Pressable>
                <Pressable
                  style={styles.detailsRow}
                  onPress={() => {
                    setReadmeDraft(app.readme ?? "");
                    setView("readme");
                  }}
                >
                  <Text style={styles.detailsRowText}>Edit README</Text>
                  <Text style={styles.detailsChevron}>{"\u203A"}</Text>
                </Pressable>
                <Pressable
                  style={styles.detailsRow}
                  onPress={handleTogglePublish}
                  disabled={saving}
                >
                  <Text style={styles.detailsRowText}>
                    {app.is_public ? "Unpublish from Marketplace" : "Publish to Marketplace"}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: app.is_public ? "#E8F5E9" : "#FFF3E0" },
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: app.is_public ? "#2E7D32" : "#E65100" },
                    ]}>
                      {app.is_public ? "Public" : "Private"}
                    </Text>
                  </View>
                </Pressable>
              </View>

              <View style={styles.detailsSection}>
                <Pressable style={styles.deleteRow} onPress={handleDelete}>
                  <Text style={styles.deleteText}>Delete App</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: app.title }} />

      <SandboxFrame
        appId={app.id}
        htmlSource={app.html_source}
        userId={user.id}
        roomId={activeRoom?.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAction: {
    fontSize: 16,
    color: "#1A73E8",
    fontWeight: "500",
  },
  readmeEditor: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    padding: 16,
    backgroundColor: "#fff",
    color: "#1a1a1a",
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  detailsBody: {
    flex: 1,
  },
  detailsAppInfo: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  detailsIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  detailsIconText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A73E8",
  },
  detailsAppName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  detailsAppDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  detailsAppMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  detailsSection: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  roomName: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  detailsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#E8F0FE",
    borderRadius: 6,
  },
  detailsBtnText: {
    fontSize: 14,
    color: "#1A73E8",
    fontWeight: "500",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailsRowText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },
  detailsChevron: {
    fontSize: 22,
    color: "#ccc",
    fontWeight: "300",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  deleteRow: {
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteText: {
    fontSize: 15,
    color: "#D32F2F",
    fontWeight: "500",
  },
});
