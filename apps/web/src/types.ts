export interface App {
  id: string;
  created_at: string;
  author_id: string;
  title: string;
  description: string | null;
  html_source: string;
  readme: string | null;
  is_public: boolean;
  install_count: number;
}

export interface UserInstall {
  id: string;
  user_id: string;
  app_id: string;
  installed_at: string;
}

export interface UserAppData {
  id: string;
  user_id: string;
  app_id: string;
  key: string;
  value: unknown;
  updated_at: string;
}

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
  role: "owner" | "member";
  joined_at: string;
}

export interface RoomData {
  id: string;
  room_id: string;
  key: string;
  value: unknown;
  updated_by: string;
  updated_at: string;
}

export type BridgeMessageType =
  | "getData"
  | "setData"
  | "getRoomData"
  | "setRoomData"
  | "openExternal"
  | "copyToClipboard";

export interface BridgeMessage {
  id: string;
  type: BridgeMessageType;
  key?: string;
  value?: unknown;
  url?: string;
  text?: string;
}
