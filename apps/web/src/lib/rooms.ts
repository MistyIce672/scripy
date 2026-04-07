import { supabase } from "./supabase";
import type { Room } from "@/types";

export async function createRoom(appId: string, name?: string): Promise<Room | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({ app_id: appId, created_by: user.id, name: name || null })
    .select()
    .single();

  if (error) return null;

  await supabase.from("room_members").insert({
    room_id: room.id,
    user_id: user.id,
    role: "owner",
  });

  return room;
}

export async function joinRoom(roomId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from("room_members").upsert({
    room_id: roomId,
    user_id: user.id,
    role: "member",
  });

  return !error;
}

export async function getMyRooms(appId: string): Promise<Room[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: memberships } = await supabase
    .from("room_members")
    .select("room_id")
    .eq("user_id", user.id);

  if (!memberships?.length) return [];

  const roomIds = memberships.map((m) => m.room_id);
  const { data: rooms } = await supabase
    .from("rooms")
    .select("*")
    .eq("app_id", appId)
    .in("id", roomIds);

  return rooms || [];
}

export function generateInviteLink(roomId: string): string {
  return `${typeof window !== "undefined" ? window.location.origin : ""}/room/${roomId}`;
}
