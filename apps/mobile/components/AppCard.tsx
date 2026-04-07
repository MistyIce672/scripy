import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from "react-native";
import type { App } from "../types";

export interface MenuAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface AppCardProps {
  app: App;
  onPress: () => void;
  menuActions?: MenuAction[];
  style?: ViewStyle;
}

export function AppCard({ app, onPress, menuActions, style }: AppCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={[styles.cardWrapper, style]}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && !menuOpen && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>
            {app.title.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {app.title}
          </Text>
          {app.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {app.description}
            </Text>
          ) : null}
          <Text style={styles.meta}>
            {app.install_count} install{app.install_count !== 1 ? "s" : ""}
          </Text>
        </View>
        {menuActions && menuActions.length > 0 && (
          <Pressable
            style={styles.menuButton}
            onPress={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            hitSlop={8}
          >
            <Text style={styles.menuDots}>{"\u22EE"}</Text>
          </Pressable>
        )}
      </Pressable>

      {menuOpen && menuActions && (
        <>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.menu}>
            {menuActions.map((action) => (
              <Pressable
                key={action.label}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => { setMenuOpen(false); action.onPress(); }}
              >
                <Text style={[styles.menuItemText, action.destructive && styles.menuItemDestructive]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: "relative",
    marginBottom: 8,
    zIndex: 1,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E8F0FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A73E8",
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  description: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginLeft: 4,
  },
  menuDots: {
    fontSize: 20,
    fontWeight: "700",
    color: "#999",
  },
  menuBackdrop: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 10,
  },
  menu: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 140,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 11,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItemPressed: {
    backgroundColor: "#f5f5f5",
  },
  menuItemText: {
    fontSize: 14,
    color: "#333",
  },
  menuItemDestructive: {
    color: "#D32F2F",
  },
});
