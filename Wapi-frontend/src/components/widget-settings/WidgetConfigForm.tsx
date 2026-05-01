/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { WidgetConfigData } from "@/src/redux/api/widgetConfigApi";
import { useGetChatbotsQuery } from "@/src/redux/api/chatbotApi";
import { useAppSelector } from "@/src/redux/hooks";
import { X, Loader2 } from "lucide-react";
import React, { useState } from "react";

interface Props {
  initial: WidgetConfigData | null;
  isSaving: boolean;
  onSave: (data: Partial<WidgetConfigData>) => void;
  onClose: () => void;
}

const WidgetConfigForm: React.FC<Props> = ({ initial, isSaving, onSave, onClose }) => {
  const wabaId = useAppSelector((s) => s.workspace.selectedWorkspace?.waba_id) || "";
  const { data: chatbotsData } = useGetChatbotsQuery({ waba_id: wabaId }, { skip: !wabaId });
  const chatbots = chatbotsData?.data || [];

  const [form, setForm] = useState({
    name: initial?.name || "My Widget",
    mode: initial?.mode || "both",
    whatsapp_number: initial?.whatsapp_number || "",
    prefill_message: initial?.prefill_message || "Hi! I have a question.",
    chatbot_id: initial?.chatbot_id || "",
    welcome_message: initial?.welcome_message || "Hello! How can we help you today?",
    placeholder_text: initial?.placeholder_text || "Type a message…",
    escalate_to_human: initial?.escalate_to_human ?? true,
    escalate_after_messages: initial?.escalate_after_messages ?? 10,
    primary_color: initial?.primary_color || "#0ea5e9",
    position: initial?.position || "right",
    title: initial?.title || "Chat with us",
    subtitle: initial?.subtitle || "We usually reply within minutes",
    allowed_domains: initial?.allowed_domains?.join(", ") || "",
    is_active: initial?.is_active ?? true,
  });

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    payload.allowed_domains = form.allowed_domains
      .split(",")
      .map((d: string) => d.trim())
      .filter(Boolean);
    payload.chatbot_id = form.chatbot_id || null;
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-(--card-color) rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-(--card-border-color)">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {initial ? "Edit Widget" : "Create Widget"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
          {/* Name */}
          <Field label="Name">
            <input className={INPUT_CLS} value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>

          {/* Mode */}
          <Field label="Mode">
            <select className={INPUT_CLS} value={form.mode} onChange={(e) => set("mode", e.target.value)}>
              <option value="both">Both (Chat + WhatsApp)</option>
              <option value="chatbot">AI Chatbot only</option>
              <option value="whatsapp">WhatsApp only</option>
            </select>
          </Field>

          {/* WhatsApp settings */}
          {(form.mode === "whatsapp" || form.mode === "both") && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 space-y-3">
              <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">WhatsApp</p>
              <Field label="Phone number (with country code)">
                <input className={INPUT_CLS} value={form.whatsapp_number} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="+1234567890" />
              </Field>
              <Field label="Pre-fill message">
                <input className={INPUT_CLS} value={form.prefill_message} onChange={(e) => set("prefill_message", e.target.value)} />
              </Field>
            </div>
          )}

          {/* Chatbot settings */}
          {(form.mode === "chatbot" || form.mode === "both") && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 space-y-3">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">Chatbot</p>
              <Field label="AI Chatbot">
                <select className={INPUT_CLS} value={form.chatbot_id} onChange={(e) => set("chatbot_id", e.target.value)}>
                  <option value="">— Select chatbot —</option>
                  {chatbots.map((b: any) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Welcome message">
                <input className={INPUT_CLS} value={form.welcome_message} onChange={(e) => set("welcome_message", e.target.value)} />
              </Field>
              <Field label="Input placeholder">
                <input className={INPUT_CLS} value={form.placeholder_text} onChange={(e) => set("placeholder_text", e.target.value)} />
              </Field>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300" checked={form.escalate_to_human} onChange={(e) => set("escalate_to_human", e.target.checked)} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Allow escalation to human agent</span>
                </label>
              </div>
              {form.escalate_to_human && (
                <Field label="Escalate after N visitor messages">
                  <input type="number" className={INPUT_CLS} value={form.escalate_after_messages} onChange={(e) => set("escalate_after_messages", parseInt(e.target.value) || 5)} min={1} />
                </Field>
              )}
            </div>
          )}

          {/* Appearance */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Appearance</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title">
                <input className={INPUT_CLS} value={form.title} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <Field label="Subtitle">
                <input className={INPUT_CLS} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
              </Field>
              <Field label="Primary color">
                <div className="flex items-center gap-2">
                  <input type="color" value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                  <input className={INPUT_CLS} value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} />
                </div>
              </Field>
              <Field label="Position">
                <select className={INPUT_CLS} value={form.position} onChange={(e) => set("position", e.target.value)}>
                  <option value="right">Bottom right</option>
                  <option value="left">Bottom left</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Security */}
          <Field label="Allowed domains (comma-separated, leave blank for any)">
            <input className={INPUT_CLS} value={form.allowed_domains} onChange={(e) => set("allowed_domains", e.target.value)} placeholder="https://example.com, https://app.example.com" />
          </Field>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-(--card-border-color)">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
            {isSaving && <Loader2 size={14} className="animate-spin" />}
            {initial ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

const INPUT_CLS = "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-(--input-color) px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition text-gray-900 dark:text-gray-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      {children}
    </div>
  );
}

export default WidgetConfigForm;
