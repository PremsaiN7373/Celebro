import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";

interface Notification {
  id: number;
  kind: string;
  message: string;
  link: string;
  read_at: string | null;
  created_at: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await apiClient.get("/notifications/");
      setNotifications(data.results);
      setUnreadCount(data.unread_count);
    } catch {
      // silently ignore — notification bell shouldn't break the app
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((o) => !o);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read_at) {
      await apiClient.post(`/notifications/${n.id}/read/`);
      load();
    }
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    await apiClient.post("/notifications/read-all/");
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative text-neutral-600 hover:text-black text-sm"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <p className="text-sm font-medium">Notifications</p>
            {unreadCount > 0 && (
              <button className="text-xs underline" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-neutral-500 p-4">No notifications yet.</p>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 ${
                    !n.read_at ? "bg-blue-50" : ""
                  }`}
                >
                  <p>{n.message}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
