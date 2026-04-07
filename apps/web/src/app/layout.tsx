"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { Shell } from "@/components/Shell";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
