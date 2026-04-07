"use client";

import { useState, useRef, useEffect } from "react";
import type { App } from "@/types";

export interface MenuAction {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface AppCardProps {
  app: App;
  onPress: () => void;
  menuActions?: MenuAction[];
}

export function AppCard({ app, onPress, menuActions }: AppCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="w-full flex items-center bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow text-left"
        onClick={onPress}
      >
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mr-3 shrink-0">
          <span className="text-xl font-bold text-blue-600">
            {app.title.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{app.title}</p>
          {app.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{app.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {app.install_count} install{app.install_count !== 1 ? "s" : ""}
          </p>
        </div>
        {menuActions && menuActions.length > 0 && (
          <div
            className="px-2 py-3 ml-1 text-xl font-bold text-gray-400 hover:text-gray-600"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          >
            &#8942;
          </div>
        )}
      </button>

      {menuOpen && menuActions && (
        <div className="absolute top-2 right-2 bg-white rounded-lg py-1 min-w-[140px] shadow-lg z-10">
          {menuActions.map((action) => (
            <button
              key={action.label}
              className={`block w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 ${
                action.destructive ? "text-red-600" : "text-gray-700"
              }`}
              onClick={() => { setMenuOpen(false); action.onPress(); }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
