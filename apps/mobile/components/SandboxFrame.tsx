import { useEffect, useRef } from "react";
import { Alert, Linking, Platform, StyleSheet } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import * as Clipboard from "expo-clipboard";
import { supabase } from "../lib/supabase";
import { bridgeScript } from "../lib/bridge";
import type { BridgeMessage } from "../types";

interface SandboxFrameProps {
  appId: string;
  htmlSource: string;
  userId: string;
  roomId?: string | null;
}

export function SandboxFrame({
  appId,
  htmlSource,
  userId,
  roomId,
}: SandboxFrameProps) {
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_data",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newData = payload.new as { key: string; value: unknown };
          sendToWebView({
            type: "roomUpdate",
            key: newData.key,
            value: newData.value,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  function sendToWebView(message: Record<string, unknown>) {
    const json = JSON.stringify(message);
    if (Platform.OS === "web") {
      return;
    }
    webviewRef.current?.postMessage(json);
  }

  async function handleGetData(msg: BridgeMessage) {
    const { data } = await supabase
      .from("user_app_data")
      .select("value")
      .eq("user_id", userId)
      .eq("app_id", appId)
      .eq("key", msg.key)
      .single();

    sendToWebView({ type: "response", id: msg.id, result: data?.value ?? null });
  }

  async function handleSetData(msg: BridgeMessage) {
    await supabase.from("user_app_data").upsert(
      {
        user_id: userId,
        app_id: appId,
        key: msg.key,
        value: msg.value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,app_id,key" }
    );

    sendToWebView({ type: "response", id: msg.id, result: true });
  }

  async function handleGetRoomData(msg: BridgeMessage) {
    if (!roomId) {
      sendToWebView({ type: "response", id: msg.id, result: null });
      return;
    }

    const { data } = await supabase
      .from("room_data")
      .select("value")
      .eq("room_id", roomId)
      .eq("key", msg.key)
      .single();

    sendToWebView({ type: "response", id: msg.id, result: data?.value ?? null });
  }

  async function handleSetRoomData(msg: BridgeMessage) {
    if (!roomId) {
      sendToWebView({ type: "response", id: msg.id, result: false });
      return;
    }

    await supabase.from("room_data").upsert(
      {
        room_id: roomId,
        key: msg.key,
        value: msg.value,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "room_id,key" }
    );

    sendToWebView({ type: "response", id: msg.id, result: true });
  }

  function handleMessage(event: WebViewMessageEvent) {
    let msg: BridgeMessage;
    try {
      msg = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    switch (msg.type) {
      case "getData":
        handleGetData(msg);
        break;
      case "setData":
        handleSetData(msg);
        break;
      case "getRoomData":
        handleGetRoomData(msg);
        break;
      case "setRoomData":
        handleSetRoomData(msg);
        break;
      case "openExternal":
        handleOpenExternal(msg);
        break;
      case "copyToClipboard":
        handleCopyToClipboard(msg);
        break;
    }
  }

  async function handleOpenExternal(msg: BridgeMessage & { url?: string }) {
    if (!msg.url) {
      sendToWebView({ type: "response", id: msg.id, result: false });
      return;
    }
    try {
      await Linking.openURL(msg.url);
      sendToWebView({ type: "response", id: msg.id, result: true });
    } catch (error) {
      Alert.alert("Error", "Could not open link");
      sendToWebView({ type: "response", id: msg.id, result: false });
    }
  }

  async function handleCopyToClipboard(msg: BridgeMessage & { text?: string }) {
    if (msg.text) {
      await Clipboard.setStringAsync(msg.text);
      sendToWebView({ type: "response", id: msg.id, result: true });
    } else {
      sendToWebView({ type: "response", id: msg.id, result: false });
    }
  }

  return (
    <WebView
      ref={webviewRef}
      style={styles.webview}
      source={{ html: htmlSource }}
      onMessage={handleMessage}
      injectedJavaScriptBeforeContentLoaded={bridgeScript}
      javaScriptEnabled
      originWhitelist={["*"]}
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});
