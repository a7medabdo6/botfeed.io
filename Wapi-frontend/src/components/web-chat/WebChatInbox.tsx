/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useGetWebConversationsQuery,
  useGetWebConversationMessagesQuery,
  useReplyToWebConversationMutation,
} from "@/src/redux/api/widgetConfigApi";
import { useAppDispatch } from "@/src/redux/hooks";
import { setPageTitle } from "@/src/redux/reducers/settingSlice";
import { Globe, Send, User, Bot, Headphones, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function WebChatInbox() {
  const dispatch = useAppDispatch();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [replyText, setReplyText] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  const { data: convData, isLoading: loadingConvs } = useGetWebConversationsQuery({ status: statusFilter || undefined });
  const conversations = convData?.data || [];

  const { data: msgData, isLoading: loadingMsgs, refetch: refetchMsgs } = useGetWebConversationMessagesQuery(
    { conversationId: selectedId! },
    { skip: !selectedId, pollingInterval: 5000 }
  );
  const messages = msgData?.data || [];

  const [sendReply, { isLoading: isSending }] = useReplyToWebConversationMutation();

  const selected = conversations.find((c) => c._id === selectedId);

  useEffect(() => {
    dispatch(setPageTitle("Web Chat"));
    return () => { dispatch(setPageTitle("")); };
  }, [dispatch]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = replyText.trim();
    if (!text || !selectedId) return;
    setReplyText("");
    try {
      await sendReply({ conversationId: selectedId, content: text }).unwrap();
      refetchMsgs();
    } catch (err: any) {
      console.error("send error", err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white dark:bg-(--page-body-bg)">
      {/* Left panel — conversation list */}
      <div className="w-80 min-w-[280px] border-r border-slate-200 dark:border-(--card-border-color) flex flex-col bg-white dark:bg-(--card-color)">
        <div className="p-4 border-b border-slate-200 dark:border-(--card-border-color)">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe size={18} /> Web Chat
          </h2>
          <div className="mt-3 flex gap-1">
            {[
              { value: "", label: "All" },
              { value: "bot", label: "Bot" },
              { value: "human", label: "Human" },
              { value: "closed", label: "Closed" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition ${statusFilter === f.value ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-4 text-center text-sm text-gray-400">Loading…</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedId(conv._id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 dark:border-slate-800 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${selectedId === conv._id ? "bg-primary/5 dark:bg-primary/10" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {conv.visitor_name || conv.visitor_email || `Visitor ${conv.visitor_id.slice(0, 8)}`}
                  </span>
                  <StatusBadge status={conv.status} />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400 truncate">{conv.metadata?.page_url || "—"}</span>
                  {conv.unread_count > 0 && (
                    <span className="ml-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">{conv.unread_count}</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  {new Date(conv.last_message_at).toLocaleString()}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel — messages */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to view messages
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-(--card-border-color) flex items-center gap-3 bg-white dark:bg-(--card-color)">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {selected?.visitor_name || selected?.visitor_email || `Visitor ${selected?.visitor_id.slice(0, 8)}`}
                </p>
                <p className="text-xs text-gray-400 truncate">{selected?.metadata?.page_url}</p>
              </div>
              <StatusBadge status={selected?.status || "bot"} />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50 dark:bg-(--page-body-bg)">
              {loadingMsgs ? (
                <div className="text-center text-sm text-gray-400 py-10">Loading messages…</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-10">No messages yet</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className={`flex ${msg.direction === "inbound" ? "justify-start" : "justify-end"}`}>
                    <div
                      className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.direction === "inbound" ? "bg-white dark:bg-(--card-color) text-gray-800 dark:text-gray-200 border border-slate-200 dark:border-slate-700 rounded-bl-md" : "bg-primary text-white rounded-br-md"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {msg.sender_type === "visitor" && <User size={12} className="text-gray-400" />}
                        {msg.sender_type === "bot" && <Bot size={12} className="text-blue-400" />}
                        {msg.sender_type === "agent" && <Headphones size={12} className="text-green-400" />}
                        <span className="text-[10px] opacity-70 uppercase font-medium">{msg.sender_type}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <span className="block text-[10px] opacity-50 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={msgEndRef} />
            </div>

            {/* Reply bar */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) flex gap-2">
              <input
                className="flex-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-(--input-color) px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition text-gray-900 dark:text-gray-100"
                placeholder="Type a reply…"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <button
                onClick={handleSend}
                disabled={isSending || !replyText.trim()}
                className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-50"
              >
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls: Record<string, string> = {
    bot: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    human: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    closed: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls[status] || cls.bot}`}>
      {status}
    </span>
  );
}
