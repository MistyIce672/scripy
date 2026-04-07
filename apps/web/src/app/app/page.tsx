"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { useAppsStore } from "@/store/apps";
import { SandboxFrame } from "@/components/SandboxFrame";
import { Editor } from "@/components/Editor";
import { AuthGuard } from "@/components/AuthGuard";
import { createRoom, getMyRooms, generateInviteLink } from "@/lib/rooms";
import type { App, Room } from "@/types";

function AppRunnerInner() {
  const searchParams = useSearchParams();
  const appId = searchParams.get("id");
  const details = searchParams.get("details");
  const user = useAuthStore((s) => s.user);
  const updateApp = useAppsStore((s) => s.updateApp);
  const deleteApp = useAppsStore((s) => s.deleteApp);
  const router = useRouter();

  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"run" | "edit" | "readme" | "details">(
    details === "true" ? "details" : "run"
  );
  const [readmeDraft, setReadmeDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (!appId) return;
    (async () => {
      const { data } = await supabase.from("apps").select("*").eq("id", appId).single();
      if (!data) { alert("App not found"); return; }
      setApp(data);
      setLoading(false);
      const rooms = await getMyRooms(appId);
      if (rooms.length > 0) setActiveRoom(rooms[0]);
    })();
  }, [appId]);

  const isOwner = app?.author_id === user?.id;

  async function handleSaveEdit(htmlSource: string) {
    if (!app) return;
    setSaving(true);
    const success = await updateApp(app.id, { html_source: htmlSource });
    setSaving(false);
    if (success) { setApp({ ...app, html_source: htmlSource }); setView("run"); }
    else alert("Failed to save changes.");
  }

  async function handleTogglePublish() {
    if (!app) return;
    setSaving(true);
    const success = await updateApp(app.id, { is_public: !app.is_public });
    setSaving(false);
    if (success) setApp({ ...app, is_public: !app.is_public });
    else alert("Failed to update publish status.");
  }

  async function handleSaveReadme() {
    if (!app) return;
    setSaving(true);
    const readme = readmeDraft.trim() || null;
    const success = await updateApp(app.id, { readme });
    setSaving(false);
    if (success) { setApp({ ...app, readme }); setView("details"); }
    else alert("Failed to save README.");
  }

  async function handleDelete() {
    if (!app) return;
    if (confirm(`Delete "${app.title}"?`)) {
      await deleteApp(app.id);
      router.push("/");
    }
  }

  async function handleCreateRoom() {
    if (!appId || !app) return;
    const room = await createRoom(appId, `${app.title} Room`);
    if (room) setActiveRoom(room);
  }

  async function handleShareRoom() {
    if (!activeRoom) return;
    const link = generateInviteLink(activeRoom.id);
    await navigator.clipboard.writeText(link);
    alert("Invite link copied to clipboard!");
  }

  if (!appId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No app selected.
      </div>
    );
  }

  if (loading || !app || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (view === "readme") {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="flex items-center justify-between px-4 lg:px-8 py-3 border-b border-gray-200">
          <button className="text-blue-600 font-medium text-sm" onClick={() => setView("details")}>
            Cancel
          </button>
          <h1 className="text-lg font-semibold">Edit README</h1>
          <button
            className="text-blue-600 font-medium text-sm disabled:opacity-50"
            onClick={handleSaveReadme}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </header>
        <div className="flex-1 flex justify-center">
          <textarea
            className="flex-1 max-w-3xl text-base leading-relaxed p-4 lg:p-8 outline-none resize-none"
            value={readmeDraft}
            onChange={(e) => setReadmeDraft(e.target.value)}
            autoFocus
            placeholder={"Describe your app for the marketplace.\n\nWhat does it do?\nHow to use it?\nAny tips?"}
          />
        </div>
      </div>
    );
  }

  if (view === "edit") {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="flex items-center justify-between px-4 lg:px-8 py-3 border-b border-gray-200">
          <button className="text-blue-600 font-medium text-sm" onClick={() => setView("run")}>
            Cancel
          </button>
          <h1 className="text-lg font-semibold truncate px-2">Edit: {app.title}</h1>
          <div className="w-14" />
        </header>
        <div className="flex-1 flex flex-col min-h-0">
          <Editor initialValue={app.html_source} onSave={handleSaveEdit} saving={saving} />
        </div>
      </div>
    );
  }

  if (view === "details") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="flex items-center justify-between px-4 lg:px-8 py-3 bg-white border-b border-gray-200">
          <button className="text-blue-600 font-medium text-sm" onClick={() => router.push("/")}>
            Back
          </button>
          <h1 className="text-lg font-semibold">App Details</h1>
          <button className="text-blue-600 font-medium text-sm" onClick={() => setView("run")}>
            Run App
          </button>
        </header>

        <div className="flex-1 overflow-auto flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-white px-6 py-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                <span className="text-3xl font-bold text-blue-600">
                  {app.title.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{app.title}</h2>
              {app.description && (
                <p className="text-sm text-gray-500 mt-1 text-center">{app.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1.5">
                {app.install_count} install{app.install_count !== 1 ? "s" : ""}
                {app.is_public ? "  ·  Public" : "  ·  Private"}
              </p>
            </div>

            <div className="bg-white mt-3 px-4 lg:px-6 py-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Room</p>
              {activeRoom ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    {activeRoom.name ?? "Shared Room"}
                  </span>
                  <button
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100"
                    onClick={handleShareRoom}
                  >
                    Invite
                  </button>
                </div>
              ) : (
                <button
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100"
                  onClick={handleCreateRoom}
                >
                  + Create Shared Room
                </button>
              )}
            </div>

            {isOwner && (
              <>
                <div className="bg-white mt-3 px-4 lg:px-6 py-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Manage
                  </p>
                  <button
                    className="w-full flex items-center justify-between py-3 border-b border-gray-100 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => setView("edit")}
                  >
                    Edit Code <span className="text-gray-300 text-lg">&rsaquo;</span>
                  </button>
                  <button
                    className="w-full flex items-center justify-between py-3 border-b border-gray-100 text-sm text-gray-700 hover:text-gray-900"
                    onClick={() => { setReadmeDraft(app.readme ?? ""); setView("readme"); }}
                  >
                    Edit README <span className="text-gray-300 text-lg">&rsaquo;</span>
                  </button>
                  <button
                    className="w-full flex items-center justify-between py-3 text-sm text-gray-700 hover:text-gray-900 disabled:opacity-50"
                    onClick={handleTogglePublish}
                    disabled={saving}
                  >
                    {app.is_public ? "Unpublish from Marketplace" : "Publish to Marketplace"}
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        app.is_public ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {app.is_public ? "Public" : "Private"}
                    </span>
                  </button>
                </div>

                <div className="bg-white mt-3 px-4 lg:px-6 py-3">
                  <button
                    className="w-full text-center py-3 text-red-600 font-medium text-sm hover:text-red-700"
                    onClick={handleDelete}
                  >
                    Delete App
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Run view
  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="flex items-center justify-between px-4 lg:px-8 py-2 border-b border-gray-200 shrink-0">
        <button className="text-blue-600 font-medium text-sm" onClick={() => router.push("/")}>
          Back
        </button>
        <h1 className="text-base font-semibold truncate px-2">{app.title}</h1>
        <div className="flex items-center gap-4">
          {isOwner && (
            <button className="text-blue-600 font-medium text-sm" onClick={() => setView("edit")}>
              Edit
            </button>
          )}
          <button className="text-blue-600 font-medium text-sm" onClick={() => setView("details")}>
            Details
          </button>
        </div>
      </header>
      <div className="flex-1 min-h-0">
        <SandboxFrame
          appId={app.id}
          htmlSource={app.html_source}
          userId={user.id}
          roomId={activeRoom?.id}
        />
      </div>
    </div>
  );
}

export default function AppRunnerPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <AppRunnerInner />
      </Suspense>
    </AuthGuard>
  );
}
