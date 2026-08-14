import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "@/lib/api-client";

interface Message {
  id: number;
  sender: number;
  sender_email: string;
  content: string;
  sent_at: string;
}

export default function ChatPage() {
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
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsHost = window.location.hostname + ":8000";
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
    <div className="max-w-lg flex flex-col h-[70vh]">
      <Link to="/planner-bookings" className="text-sm text-neutral-500 underline mb-3">
        ← Back to bookings
      </Link>

      <div className="flex-1 border rounded-xl bg-white overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-neutral-500 text-sm">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-neutral-500 text-sm">No messages yet — say hello.</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="font-medium">{m.sender_email}</span>{" "}
              <span className="text-xs text-neutral-400">
                {new Date(m.sent_at).toLocaleTimeString()}
              </span>
              <p className="text-neutral-700">{m.content}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 mt-3">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="bg-black text-white rounded-lg px-4 py-2 text-sm" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
