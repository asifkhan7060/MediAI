import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Disclaimer from "@/components/Disclaimer";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/lib/types";

export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI medical assistant. I can help you understand your symptoms and suggest the right type of doctor. What symptoms are you experiencing?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem('mediai_token');
      const CHAT_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/chatbot`;
      
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) {
          setMessages(prev => [...prev, { role: "assistant", content: "I'm getting too many requests right now. Please try again in a moment." }]);
          return;
        }
        throw new Error("Stream failed");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantSoFar = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > allMessages.length) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, idx);
          textBuffer = textBuffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { /* partial */ }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      <div className="absolute inset-0 gradient-mesh pointer-events-none" />

      <div className="container relative mx-auto flex max-w-3xl flex-1 flex-col px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-4 flex items-center justify-center rounded-2xl gradient-accent p-4 shadow-lg"
            style={{ width: 68, height: 68 }}
          >
            <MessageCircle className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            AI Doctor <span className="gradient-text">Assistant</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Describe your symptoms and get AI-powered health guidance
          </p>
        </div>

        <Disclaimer />

        {/* Messages container */}
        <div
          className="mt-4 flex-1 space-y-4 overflow-y-auto rounded-2xl glass-card p-5"
          style={{ maxHeight: "58vh" }}
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-1.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-md ${
                    msg.role === "user" ? "gradient-primary" : "gradient-accent"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>

                {/* Message bubble */}
                {msg.role === "user" ? (
                  <div className="max-w-[80%] rounded-2xl rounded-tr-none px-4 py-3 text-sm leading-relaxed gradient-primary text-primary-foreground shadow-md">
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-2xl rounded-tl-none bg-muted/40 border border-border/30 text-foreground overflow-hidden">
                    {/* AI label */}
                    <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
                      <Sparkles className="h-3 w-3 text-accent" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">AI Response</span>
                    </div>
                    {/* Markdown body */}
                    <div className="px-4 pb-3 text-sm leading-relaxed ai-markdown">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold text-foreground mt-3 mb-2 pb-1.5 border-b border-border/40">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold text-foreground mt-3 mb-1.5 flex items-center gap-2">
                              <span className="inline-block w-1 h-4 rounded-full gradient-primary" />
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold text-foreground mt-2.5 mb-1">{children}</h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0 text-foreground/90 leading-relaxed">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-2 space-y-1 ml-1">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-2 space-y-1 ml-1 list-decimal list-inside">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="flex items-start gap-2 text-foreground/90">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                              <span className="flex-1">{children}</span>
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-foreground">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="text-primary italic">{children}</em>
                          ),
                          code: ({ className, children, ...props }) => {
                            const isBlock = className?.includes('language-');
                            if (isBlock) {
                              return (
                                <code className="block my-2 rounded-lg bg-card border border-border/50 px-3 py-2 text-xs font-mono text-foreground overflow-x-auto">
                                  {children}
                                </code>
                              );
                            }
                            return (
                              <code className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary font-medium">
                                {children}
                              </code>
                            );
                          },
                          blockquote: ({ children }) => (
                            <blockquote className="my-2 border-l-3 border-primary/40 bg-primary/5 rounded-r-lg pl-3 pr-2 py-2 text-foreground/80 italic">
                              {children}
                            </blockquote>
                          ),
                          hr: () => (
                            <hr className="my-3 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                          ),
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2.5 text-sm text-muted-foreground"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-accent shadow-md">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-muted/60 border border-border/30 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs">Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="mt-4 flex gap-2.5">
          <div className="relative flex-1 group">
            <Sparkles className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              className="h-13 pl-11 text-base rounded-xl glass-card border-border/40 focus:border-primary/40 focus:ring-primary/20 transition-all"
              style={{ height: 52 }}
              placeholder="Describe your symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              disabled={loading}
            />
          </div>
          <Button
            onClick={send}
            disabled={!input.trim() || loading}
            className="h-13 w-13 gradient-primary border-0 text-primary-foreground btn-premium rounded-xl shadow-md"
            style={{ height: 52, width: 52 }}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
