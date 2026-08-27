import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { apiClient } from "@/lib/api-client";

interface Message {
  id: number;
  sender: number;
  sender_email: string;
  content: string;
  sent_at: string;
}

export default function ChatPage() {
  const user = useSelector((s: RootState) => s.auth.user);
  const { bookingId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await apiClient.get("/chat/", { params: { booking: bookingId } });
        setMessages(data.results ?? data);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [bookingId]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !bookingId) return;

    // Vite dev server proxies /api but not raw ws:// to Django — connect
    // directly to the Django ASGI server's port instead.
    // In dev, connects straight to Django's local port (Vite doesn't proxy
    // raw WebSocket connections). In production, set VITE_API_URL and this
    // derives the wss:// host from it instead — see DEPLOYMENT.md.
    const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
    let wsProtocol: string;
    let wsHost: string;
    if (apiUrl) {
      const parsed = new URL(apiUrl);
      wsProtocol = parsed.protocol === "https:" ? "wss" : "ws";
      wsHost = parsed.host;
    } else {
      wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const host = window.location.hostname;
      // In local dev, Daphne typically listens on 127.0.0.1:8000. If the frontend is loaded
      // via localhost or IPv6 loopback [::1], route local WS traffic to 127.0.0.1:8000 directly.
      wsHost = (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1")
        ? "127.0.0.1:8000"
        : host + ":8000";
    }
    const ws = new WebSocket(
      `${wsProtocol}://${wsHost}/ws/chat/${bookingId}/?token=${token}`
    );
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message: Message = JSON.parse(event.data);
      setMessages((prev) => [...prev, message]);
    };

    return () => ws.close();
  }, [bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: text }));
    setText("");
  };

  return (
    <div className="max-w-2xl flex flex-col h-[75vh] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#17142A]">Messages</h1>
          <p className="text-xs text-[#6B6780] font-medium">Real-time celebration coordination with your planner</p>
        </div>
        <Link
          to={user?.role === "planner" ? "/planner-bookings" : "/bookings"}
          className="btn-secondary text-xs"
        >
          ← Back to Bookings
        </Link>
      </div>

      <div className="flex-1 bg-white border border-[#E9E4F5] rounded-[16px] overflow-y-auto p-6 space-y-4 shadow-[0_4px_20px_rgba(91,33,182,0.06)]">
        {loading ? (
          <p className="text-[#6B6780] text-sm font-medium">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <img src="/images/celebro_icon.png" alt="Celebro" className="h-16 w-auto object-contain mx-auto mb-2" />

            <p className="text-[#17142A] font-semibold mt-2">No messages yet</p>

            <p className="text-xs text-[#6B6780] mt-1 font-medium">Send a message to start planning your event details.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_email === user?.email;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-[#6B6780] font-medium mb-1 px-1">
                  {m.sender_email} • {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div
                  className={`max-w-[75%] px-4 py-3 text-sm font-medium leading-relaxed shadow-xs ${
                    isMe
                      ? "bg-[#5B21B6] text-white rounded-[16px] rounded-br-[2px]"
                      : "bg-[#F5F3FF] text-[#17142A] border border-[#E9E4F5] rounded-[16px] rounded-bl-[2px]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-3">
        <input
          className="input-field flex-1"
          placeholder="Type a message to your planner..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn-primary px-6" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
