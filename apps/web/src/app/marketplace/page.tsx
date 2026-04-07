"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppsStore } from "@/store/apps";
import { AppCard } from "@/components/AppCard";
import { AuthGuard } from "@/components/AuthGuard";
import type { App } from "@/types";

function MarketplacePage() {
  const {
    marketplaceApps, installedApps, loading,
    fetchMarketplaceApps, installApp, uninstallApp, fetchInstalledApps,
  } = useAppsStore();
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMarketplaceApps();
    fetchInstalledApps();
  }, [fetchMarketplaceApps, fetchInstalledApps]);

  function handleSearch(text: string) {
    setSearch(text);
    fetchMarketplaceApps(text || undefined);
  }

  function isInstalled(appId: string) {
    return installedApps.some((a) => a.id === appId);
  }

  async function handleToggleInstall(app: App) {
    if (isInstalled(app.id)) {
      await uninstallApp(app.id);
    } else {
      await installApp(app.id);
    }
  }

  const selectedInstalled = selectedApp ? isInstalled(selectedApp.id) : false;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white px-4 lg:px-8 py-3 border-b border-gray-200 flex items-center gap-3">
        <button
          className="lg:hidden text-blue-600 font-medium text-sm shrink-0"
          onClick={() => router.push("/")}
        >
          Back
        </button>
        <h1 className="text-lg lg:text-2xl font-semibold lg:font-bold flex-1">Marketplace</h1>
      </header>

      <div className="bg-white px-4 lg:px-8 py-3 pb-2">
        <input
          type="text"
          className="w-full max-w-md border border-gray-300 rounded-lg px-3 py-2.5 text-base bg-gray-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search apps..."
        />
      </div>

      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {marketplaceApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg font-semibold text-gray-700">
              {loading ? "Loading..." : "No apps found"}
            </p>
            {!loading && (
              <p className="text-sm text-gray-400 mt-2 text-center">
                {search ? "Try a different search term" : "Be the first to publish an app!"}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {marketplaceApps.map((app) => (
              <AppCard key={app.id} app={app} onPress={() => setSelectedApp(app)} />
            ))}
          </div>
        )}
      </main>

      {/* App detail modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSelectedApp(null)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-t-2xl lg:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-end px-4 pt-4">
              <button
                className="text-blue-600 font-medium text-sm"
                onClick={() => setSelectedApp(null)}
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-auto px-5 pb-4">
              <div className="flex gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-blue-600">
                    {selectedApp.title.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-900">{selectedApp.title}</h2>
                  {selectedApp.description && (
                    <p className="text-sm text-gray-500 mt-1">{selectedApp.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedApp.install_count} install{selectedApp.install_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                {selectedApp.readme ? (
                  <>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      README
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedApp.readme}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">No README provided.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t border-gray-200">
              {selectedInstalled ? (
                <>
                  <button
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    onClick={() => { setSelectedApp(null); router.push(`/app?id=${selectedApp.id}`); }}
                  >
                    Open
                  </button>
                  <button
                    className="px-5 py-3 rounded-lg font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
                    onClick={() => handleToggleInstall(selectedApp)}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <button
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  onClick={async () => {
                    await handleToggleInstall(selectedApp);
                    setSelectedApp(null);
                    router.push(`/app?id=${selectedApp.id}`);
                  }}
                >
                  Install
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Marketplace() {
  return (
    <AuthGuard>
      <MarketplacePage />
    </AuthGuard>
  );
}
