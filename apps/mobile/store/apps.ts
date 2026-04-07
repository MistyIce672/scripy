import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { App } from "../types";

interface AppsState {
  myApps: App[];
  installedApps: App[];
  marketplaceApps: App[];
  loading: boolean;

  fetchMyApps: () => Promise<void>;
  fetchInstalledApps: () => Promise<void>;
  fetchMarketplaceApps: (search?: string) => Promise<void>;

  createApp: (
    title: string,
    htmlSource: string,
    description?: string
  ) => Promise<App | null>;
  updateApp: (
    id: string,
    updates: Partial<Pick<App, "title" | "description" | "html_source" | "readme" | "is_public">>
  ) => Promise<boolean>;
  deleteApp: (id: string) => Promise<boolean>;

  installApp: (appId: string) => Promise<boolean>;
  uninstallApp: (appId: string) => Promise<boolean>;
}

export const useAppsStore = create<AppsState>((set, get) => ({
  myApps: [],
  installedApps: [],
  marketplaceApps: [],
  loading: false,

  fetchMyApps: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("apps")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

    set({ myApps: data ?? [] });
  },

  fetchInstalledApps: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: installs } = await supabase
      .from("user_installs")
      .select("app_id")
      .eq("user_id", user.id);

    if (!installs?.length) {
      set({ installedApps: [] });
      return;
    }

    const appIds = installs.map((i) => i.app_id);
    const { data } = await supabase
      .from("apps")
      .select("*")
      .in("id", appIds);

    set({ installedApps: data ?? [] });
  },

  fetchMarketplaceApps: async (search?: string) => {
    set({ loading: true });
    let query = supabase
      .from("apps")
      .select("*")
      .eq("is_public", true)
      .order("install_count", { ascending: false });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data } = await query;
    set({ marketplaceApps: data ?? [], loading: false });
  },

  createApp: async (title, htmlSource, description) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("apps")
      .insert({
        author_id: user.id,
        title,
        html_source: htmlSource,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create app:", error);
      return null;
    }

    await get().fetchMyApps();
    return data;
  },

  updateApp: async (id, updates) => {
    const { error } = await supabase
      .from("apps")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Failed to update app:", error);
      return false;
    }

    await get().fetchMyApps();
    return true;
  },

  deleteApp: async (id) => {
    const { error } = await supabase.from("apps").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete app:", error);
      return false;
    }

    await get().fetchMyApps();
    return true;
  },

  installApp: async (appId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("user_installs")
      .upsert({ user_id: user.id, app_id: appId });

    if (error) {
      console.error("Failed to install app:", error);
      return false;
    }

    await supabase.rpc("increment_install_count", { target_app_id: appId });
    await get().fetchInstalledApps();
    return true;
  },

  uninstallApp: async (appId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("user_installs")
      .delete()
      .eq("user_id", user.id)
      .eq("app_id", appId);

    if (error) {
      console.error("Failed to uninstall app:", error);
      return false;
    }

    await get().fetchInstalledApps();
    return true;
  },
}));
