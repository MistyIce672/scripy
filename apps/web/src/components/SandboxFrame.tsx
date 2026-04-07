"use client";

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { bridgeScript } from "@/lib/bridge";
import type { BridgeMessage } from "@/types";

interface SandboxFrameProps {
  appId: string;
  htmlSource: string;
  userId: string;
  roomId?: string | null;
}

export function SandboxFrame({ appId, htmlSource, userId, roomId }: SandboxFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sendToIframe = useCallback((message: Record<string, unknown>) => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(message), "*");
  }, []);

  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      let msg: BridgeMessage;
      try {
        msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (!msg.type || !msg.id) return;

      switch (msg.type) {
        case "getData": {
          const { data } = await supabase
            .from("user_app_data").select("value")
            .eq("user_id", userId).eq("app_id", appId).eq("key", msg.key).single();
          sendToIframe({ type: "response", id: msg.id, result: data?.value ?? null });
          break;
        }
        case "setData": {
          await supabase.from("user_app_data").upsert(
            { user_id: userId, app_id: appId, key: msg.key, value: msg.value, updated_at: new Date().toISOString() },
            { onConflict: "user_id,app_id,key" }
          );
          sendToIframe({ type: "response", id: msg.id, result: true });
          break;
        }
        case "getRoomData": {
          if (!roomId) { sendToIframe({ type: "response", id: msg.id, result: null }); break; }
          const { data } = await supabase
            .from("room_data").select("value").eq("room_id", roomId).eq("key", msg.key).single();
          sendToIframe({ type: "response", id: msg.id, result: data?.value ?? null });
          break;
        }
        case "setRoomData": {
          if (!roomId) { sendToIframe({ type: "response", id: msg.id, result: false }); break; }
          await supabase.from("room_data").upsert(
            { room_id: roomId, key: msg.key, value: msg.value, updated_by: userId, updated_at: new Date().toISOString() },
            { onConflict: "room_id,key" }
          );
          sendToIframe({ type: "response", id: msg.id, result: true });
          break;
        }
        case "openExternal": {
          if (msg.url) window.open(msg.url, "_blank", "noopener");
          sendToIframe({ type: "response", id: msg.id, result: !!msg.url });
          break;
        }
        case "copyToClipboard": {
          if (msg.text) await navigator.clipboard.writeText(msg.text);
          sendToIframe({ type: "response", id: msg.id, result: !!msg.text });
          break;
        }
      }
    },
    [appId, userId, roomId, sendToIframe]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_data", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const newData = payload.new as { key: string; value: unknown };
          sendToIframe({ type: "roomUpdate", key: newData.key, value: newData.value });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId, sendToIframe]);

  // Inject bridge script into the HTML before </head>
  const injectedHtml = htmlSource.includes("</head>")
    ? htmlSource.replace("</head>", `${bridgeScript}</head>`)
    : `${bridgeScript}${htmlSource}`;

  const blob = new Blob([injectedHtml], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);

  return (
    <iframe
      ref={iframeRef}
      src={blobUrl}
      className="w-full h-full border-0"
      sandbox="allow-scripts allow-forms allow-modals allow-popups"
      title="Scripy App"
    />
  );
}
