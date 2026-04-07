import { supabase } from "./supabase";

export interface Room {
  id: string;
  app_id: string;
  created_by: string;
  name: string | null;
  created_at: string;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export async function createRoom(appId: string, name?: string): Promise<Room | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({
      app_id: appId,
      created_by: user.id,
      name: name || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create room:", error);
    return null;
  }

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

  if (error) {
    console.error("Failed to join room:", error);
    return false;
  }

  return true;
}

export async function leaveRoom(roomId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("room_members")
    .delete()
    .eq("room_id", roomId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Failed to leave room:", error);
    return false;
  }

  return true;
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const { data, error } = await supabase
    .from("room_members")
    .select("*")
    .eq("room_id", roomId);

  if (error) {
    console.error("Failed to get room members:", error);
    return [];
  }

  return data || [];
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

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("app_id", appId)
    .in("id", roomIds);

  if (error) {
    console.error("Failed to get rooms:", error);
    return [];
  }

  return rooms || [];
}

export function generateInviteLink(roomId: string): string {
  return `miniapp-platform://room/${roomId}`;
}
