import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface EditorProps {
  initialValue?: string;
  onSave: (html: string) => void;
  saving?: boolean;
}

const PLACEHOLDER_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui; padding: 16px; }
  </style>
</head>
<body>
  <h1>Hello Mini App!</h1>
  <script>
    // Use __bridge.getData(key) and __bridge.setData(key, value)
    // for private data storage
  </script>
</body>
</html>`;

export function Editor({ initialValue, onSave, saving }: EditorProps) {
  const [html, setHtml] = useState(initialValue || PLACEHOLDER_HTML);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Pressable
          style={[styles.tab, !showPreview && styles.tabActive]}
          onPress={() => setShowPreview(false)}
        >
          <Text style={[styles.tabText, !showPreview && styles.tabTextActive]}>
            Code
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, showPreview && styles.tabActive]}
          onPress={() => setShowPreview(true)}
        >
          <Text style={[styles.tabText, showPreview && styles.tabTextActive]}>
            Preview
          </Text>
        </Pressable>
        <View style={styles.spacer} />
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={() => onSave(html)}
          disabled={saving}
        >
          <Text style={styles.saveText}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
      </View>

      {showPreview ? (
        <ScrollView style={styles.previewContainer}>
          <Text style={styles.previewNote}>
            Preview is approximate. Run the app for full functionality.
          </Text>
          <View style={styles.previewBox}>
            <Text style={styles.previewCode} selectable>
              {html}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <TextInput
          style={styles.editor}
          value={html}
          onChangeText={setHtml}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textAlignVertical="top"
          placeholder="Write your HTML here..."
          placeholderTextColor="#999"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 4,
  },
  tabActive: {
    backgroundColor: "#1A73E8",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
  },
  spacer: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#1A73E8",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  editor: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
    padding: 12,
    backgroundColor: "#1e1e1e",
    color: "#d4d4d4",
  },
  previewContainer: {
    flex: 1,
    padding: 12,
  },
  previewNote: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginBottom: 8,
  },
  previewBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
  },
  previewCode: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
  },
});
