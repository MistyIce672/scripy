"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

const NAV_ITEMS = [
  { label: "Your Apps", href: "/", icon: "grid" },
  { label: "Create", href: "/create", icon: "plus" },
  { label: "Marketplace", href: "/marketplace", icon: "store" },
] as const;

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className ?? "w-5 h-5";
  switch (icon) {
    case "grid":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case "plus":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      );
    case "store":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18l-2 13H5L3 3zm0 0l-1-1m6 17a1 1 0 102 0 1 1 0 00-2 0zm8 0a1 1 0 102 0 1 1 0 00-2 0z" />
        </svg>
      );
    default:
      return null;
  }
}

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  // Don't show shell on sign-in or app runner pages
  const hideShell = pathname === "/sign-in" || pathname.startsWith("/app");
  if (hideShell) return <>{children}</>;

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-200 shrink-0">
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-xl font-bold text-gray-900">Scripy</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {user?.email?.split("@")[0] ?? ""}
          </p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 pb-4">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        <div className="flex-1 overflow-auto">{children}</div>
        <nav className="lg:hidden bg-white border-t border-gray-200 flex shrink-0">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
