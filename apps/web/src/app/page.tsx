"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useAppsStore } from "@/store/apps";
import { AppCard, type MenuAction } from "@/components/AppCard";
import { AuthGuard } from "@/components/AuthGuard";
import type { App } from "@/types";

function HomePage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { myApps, installedApps, fetchMyApps, fetchInstalledApps, deleteApp, uninstallApp } =
    useAppsStore();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchMyApps();
    fetchInstalledApps();
  }, [fetchMyApps, fetchInstalledApps]);

  const allApps: App[] = [
    ...myApps,
    ...installedApps.filter((installed) => !myApps.some((my) => my.id === installed.id)),
  ];

  async function handleRefresh() {
    setRefreshing(true);
    await Promise.all([fetchMyApps(), fetchInstalledApps()]);
    setRefreshing(false);
  }

  function getMenuActions(app: App): MenuAction[] {
    const isOwner = app.author_id === user?.id;
    if (isOwner) {
      return [
        { label: "Details", onPress: () => router.push(`/app?id=${app.id}&details=true`) },
        {
          label: "Delete",
          destructive: true,
          onPress: () => {
            if (confirm(`Delete "${app.title}"?`)) deleteApp(app.id);
          },
        },
      ];
    }
    return [
      { label: "Details", onPress: () => router.push(`/app/${app.id}?details=true`) },
      { label: "Remove", destructive: true, onPress: () => uninstallApp(app.id) },
    ];
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white px-4 lg:px-8 pt-6 pb-4 flex justify-between items-start border-b border-gray-100">
        <div>
          <p className="text-sm text-gray-500 lg:hidden">Hi, {user?.email?.split("@")[0] ?? "there"}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">Your Apps</h1>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button onClick={signOut} className="lg:hidden text-sm text-gray-400 hover:text-gray-600">
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {allApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg font-semibold text-gray-700">No apps yet</p>
            <p className="text-sm text-gray-400 mt-2 text-center max-w-[240px]">
              Create your first mini app or browse the marketplace
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {allApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onPress={() => router.push(`/app?id=${app.id}`)}
                menuActions={getMenuActions(app)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Mobile-only create/marketplace buttons (desktop uses sidebar) */}
      <footer className="lg:hidden bg-white border-t border-gray-200 p-4 flex gap-3">
        <button
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors"
          onClick={() => router.push("/create")}
        >
          + Create
        </button>
        <button
          className="flex-1 bg-white text-blue-600 py-3 rounded-lg font-semibold text-base border border-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() => router.push("/marketplace")}
        >
          Marketplace
        </button>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}
