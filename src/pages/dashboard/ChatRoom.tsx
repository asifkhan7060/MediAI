import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000";

interface ChatMsg {
  _id?: string;
  sender: string;
  senderModel: string;
  receiver: string;
  receiverModel: string;
  message: string;
  roomId: string;
  createdAt: string;
}

export default function ChatRoom() {
  const { oderId } = useParams<{ oderId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherName, setOtherName] = useState("Chat");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const myId = user?._id || user?.id || "";
  const myRole = user?.role || "patient";
  const myModel = myRole === "doctor" ? "Doctor" : "Patient";
  const otherModel = myModel === "Doctor" ? "Patient" : "Doctor";

  // Generate consistent room ID
  const roomId = [myId, oderId].sort().join("_");

  const dashboardPath = myRole === "doctor" ? "/dashboard/doctor" : "/dashboard/patient";

  useEffect(() => {
    if (!oderId || !myId) return;

    // Connect socket
    const s = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    setSocket(s);

    s.on("connect", () => {
      s.emit("join", myId);
      s.emit("join_room", roomId);
    });

    s.on("receive_message", (msg: ChatMsg) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    s.on("user_typing", () => setIsTyping(true));
    s.on("user_stop_typing", () => setIsTyping(false));

    // Load history
    loadHistory();

    return () => {
      s.disconnect();
    };
  }, [oderId, myId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const loadHistory = async () => {
    try {
      const { data } = await chatAPI.getHistory(oderId!);
      setMessages(data.data || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !socket) return;

    const msgData = {
      senderId: myId,
      senderModel: myModel,
      receiverId: oderId!,
      receiverModel: otherModel,
      message: input.trim(),
      roomId,
    };

    socket.emit("send_message", msgData);
    socket.emit("stop_typing", { roomId, userId: myId });
    setInput("");
  };

  const handleTyping = (val: string) => {
    setInput(val);
    if (!socket) return;

    socket.emit("typing", { roomId, userId: myId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { roomId, userId: myId });
    }, 1500);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-4 mb-4">
        <Link to={dashboardPath}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
          <MessageCircle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">Chat</h2>
          {isTyping && (
            <p className="text-xs text-primary animate-pulse">typing...</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No messages yet. Say hello!</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.sender === myId;
              return (
                <motion.div
                  key={msg._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                      isMe ? "gradient-primary" : "bg-muted border border-border/50"
                    }`}
                  >
                    <span className={`text-xs font-bold ${isMe ? "text-primary-foreground" : "text-foreground"}`}>
                      {isMe ? "You" : msg.senderModel?.charAt(0) || "D"}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[75%] px-4 py-2.5 text-sm ${
                      isMe
                        ? "gradient-primary text-primary-foreground rounded-2xl rounded-tr-none shadow-md"
                        : "bg-muted/60 border border-border/30 text-foreground rounded-2xl rounded-tl-none"
                    }`}
                  >
                    <p>{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {msg.createdAt ? formatTime(msg.createdAt) : ""}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {isTyping && (
          <div className="flex gap-1.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted border border-border/50 shadow-sm">
              <span className="text-xs font-bold text-foreground">D</span>
            </div>
            <div className="bg-muted/60 border border-border/30 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2 border-t border-border pt-4">
        <Input
          className="flex-1 h-12"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="h-12 w-12 gradient-primary border-0 text-primary-foreground hover:opacity-90"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
