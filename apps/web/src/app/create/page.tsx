"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppsStore } from "@/store/apps";
import { Editor } from "@/components/Editor";
import { AuthGuard } from "@/components/AuthGuard";

function CreatePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const createApp = useAppsStore((s) => s.createApp);
  const router = useRouter();

  async function handleSave(htmlSource: string) {
    if (!title.trim()) {
      alert("Please enter a name for your app.");
      return;
    }
    setSaving(true);
    const app = await createApp(title.trim(), htmlSource, description.trim());
    setSaving(false);
    if (app) {
      router.replace(`/app?id=${app.id}`);
    } else {
      alert("Failed to create app. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="flex items-center justify-between px-4 lg:px-8 py-3 border-b border-gray-200">
        <button
          className="text-blue-600 font-medium text-sm"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <h1 className="text-lg font-semibold">Create App</h1>
        <div className="w-14" />
      </header>

      <div className="px-4 lg:px-8 py-3 space-y-2 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row gap-2">
          <input
            type="text"
            className="lg:w-72 text-lg font-semibold px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="App name"
          />
          <input
            type="text"
            className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <Editor onSave={handleSave} saving={saving} />
      </div>
    </div>
  );
}

export default function Create() {
  return (
    <AuthGuard>
      <CreatePage />
    </AuthGuard>
  );
}
