import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NotificationBell from "../features/notifications/NotificationBell";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900">
      <Sidebar collapsed={!mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-white/80 dark:bg-ink-800/80 backdrop-blur-md border-b border-ink-100 dark:border-ink-700 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-ink-600 dark:text-ink-300 text-xl"
          >
            ☰
          </button>
          <span className="font-display text-lg text-ink-900 dark:text-white">Celebro</span>
          <NotificationBell />
        </header>

        <div className="hidden lg:flex justify-end px-8 pt-5">
          <NotificationBell />
        </div>

        <main className="max-w-6xl mx-auto px-6 py-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
