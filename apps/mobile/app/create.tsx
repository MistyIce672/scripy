import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAppsStore } from "../store/apps";
import { Editor } from "../components/Editor";

export default function CreateScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const createApp = useAppsStore((s) => s.createApp);

  async function handleSave(htmlSource: string) {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a name for your app.");
      return;
    }

    setSaving(true);
    const app = await createApp(title.trim(), htmlSource, description.trim());
    setSaving(false);

    if (app) {
      router.replace(`/${app.id}`);
    } else {
      Alert.alert("Error", "Failed to create app. Please try again.");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.metaForm}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="App name"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.descInput}
          value={description}
          onChangeText={setDescription}
          placeholder="Description (optional)"
          placeholderTextColor="#999"
        />
      </View>
      <Text style={styles.sectionLabel}>HTML Source</Text>
      <Editor onSave={handleSave} saving={saving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  metaForm: {
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "600",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  descInput: {
    fontSize: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fafafa",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
});
