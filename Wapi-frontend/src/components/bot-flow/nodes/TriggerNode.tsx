/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/src/elements/ui/badge";
import { Button } from "@/src/elements/ui/button";
import { Input } from "@/src/elements/ui/input";
import { Textarea } from "@/src/elements/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/elements/ui/select";
import { useReactFlow } from "@xyflow/react";
import { Check, Copy, Globe, MessageSquare, Plus, X, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

const SELECT_INPUT = "h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg) dark:hover:bg-(--page-body-bg) dark:focus:bg-(--page-body-bg) focus:bg-(--input-color) focus-visible:shadow-none";
const EMPTY_BORDER = "border-gray-200 dark:border-(--card-border-color)";

const CHANNEL_OPTIONS = [
  { value: "whatsapp" as const, label: "WhatsApp", icon: <MessageSquare size={14} /> },
  { value: "chatbot_widget" as const, label: "Chatbot Widget", icon: <Globe size={14} /> },
];

function normalizeChannels(data: any): ("whatsapp" | "chatbot_widget")[] {
  const ch = data.channels;
  if (Array.isArray(ch) && ch.length > 0) {
    const allowed = new Set(["whatsapp", "chatbot_widget"]);
    const filtered = ch.filter((c: string) => allowed.has(c)) as ("whatsapp" | "chatbot_widget")[];
    if (filtered.length > 0) return filtered;
  }
  if (data.channel === "chatbot_widget") return ["chatbot_widget"];
  return ["whatsapp"];
}

export function TriggerNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [keyword, setKeyword] = useState("");
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);

  const channels = normalizeChannels(data);
  const hasWhatsapp = channels.includes("whatsapp");
  const hasWidget = channels.includes("chatbot_widget");

  const keywordsArray = Array.isArray(data.keywords) ? data.keywords : [];

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (channels.length === 0) errors.push("Select at least one channel");
    if (hasWhatsapp && !data.contactType) errors.push("Contact type is required when WhatsApp is selected");
    if (!data.triggerType) errors.push("Trigger type is required");
    if (data.triggerType !== "any message" && data.triggerType !== "order received" && (!keywordsArray || keywordsArray.length === 0)) {
      errors.push("Trigger keywords are required");
    }
    if (data.triggerType === "order received" && !hasWhatsapp) {
      errors.push("Order received applies to WhatsApp only — enable WhatsApp or change trigger type");
    }
  }

  const updateNodeData = (field: string, value: any) => {
    if (!touched) setTouched(true);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, [field]: value } }
          : node,
      ),
    );
  };

  const toggleChannel = (value: "whatsapp" | "chatbot_widget") => {
    if (!touched) setTouched(true);
    const set = new Set(channels);
    if (set.has(value)) {
      if (set.size <= 1) return;
      set.delete(value);
    } else {
      set.add(value);
    }
    const next = Array.from(set) as ("whatsapp" | "chatbot_widget")[];
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, channels: next, channel: undefined } }
          : node,
      ),
    );
  };

  const addKeyword = () => {
    if (keyword.trim()) {
      const currentKeywords = Array.isArray(data.keywords) ? data.keywords : [];
      if (!currentKeywords.includes(keyword.trim())) {
        updateNodeData("keywords", [...currentKeywords, keyword.trim()]);
      }
      setKeyword("");
    }
  };

  const removeKeyword = (kw: string) => {
    const currentKeywords = Array.isArray(data.keywords) ? data.keywords : [];
    updateNodeData(
      "keywords",
      currentKeywords.filter((k: string) => k !== kw),
    );
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "") || "";
  const embedCode = data.widgetApiKey
    ? `<script src="${apiUrl}/public/widget.js" data-widget-id="${data.widgetApiKey}"></script>`
    : "";

  const handleCopy = () => {
    if (!embedCode) return;
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      toast.success("Embed code copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <BaseNode
      id={id}
      title="Start Trigger"
      icon={<Zap size={18} />}
      iconBgColor="bg-orange-100"
      iconColor="text-orange-600"
      borderColor="border-orange-200"
      handleColor="bg-purple-500!"
      errors={errors}
      showInHandle={false}
      headerRight={
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-(--dark-sidebar) dark:text-white dark:hover:bg-(--table-hover) hover:bg-purple-100 text-[10px] h-4 px-1.5">
          Entry Point
        </Badge>
      }
    >
      <NodeField label="Channels" required description="This flow can start from more than one channel" error={(touched || data.forceValidation) && channels.length === 0 ? "Select at least one channel" : ""}>
        <div className="flex flex-col gap-2">
          {CHANNEL_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-(--input-color) px-3 py-2 text-sm dark:border-(--card-border-color) dark:bg-(--page-body-bg)"
            >
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={channels.includes(opt.value)}
                onChange={() => toggleChannel(opt.value)}
              />
              <span className="flex items-center gap-2 text-gray-800 dark:text-gray-100">
                {opt.icon}
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </NodeField>

      {hasWhatsapp && (
        <NodeField label="Contact Type" required error={(touched || data.forceValidation) && !data.contactType ? "Please select a contact type" : ""}>
          <Select value={data.contactType || ""} onValueChange={(value) => updateNodeData("contactType", value)} onOpenChange={() => setTouched(true)}>
            <SelectTrigger className={`${SELECT_INPUT} ${!data.contactType ? EMPTY_BORDER : ""}`}>
              <SelectValue placeholder="Select contact type" />
            </SelectTrigger>
            <SelectContent className="dark:bg-(--page-body-bg) bg-(--input-color)">
              <SelectItem value="Lead" className="dark:hover:bg-(--card-color)">Lead</SelectItem>
              <SelectItem value="Customer" className="dark:hover:bg-(--card-color)">Customer</SelectItem>
              <SelectItem value="Contact" className="dark:hover:bg-(--card-color)">Contact</SelectItem>
            </SelectContent>
          </Select>
        </NodeField>
      )}

      <NodeField label="Trigger Type" required error={(touched || data.forceValidation) && !data.triggerType ? "Please select a trigger type" : ""}>
        <Select value={data.triggerType || ""} onValueChange={(value) => updateNodeData("triggerType", value)} onOpenChange={() => setTouched(true)}>
          <SelectTrigger className={`${SELECT_INPUT} ${!data.triggerType ? EMPTY_BORDER : ""}`}>
            <SelectValue placeholder="Select trigger type" />
          </SelectTrigger>
          <SelectContent className="dark:bg-(--page-body-bg)">
            <SelectItem value="on exact match" className="dark:hover:bg-(--card-color)">on exact match</SelectItem>
            <SelectItem value="contains keyword" className="dark:hover:bg-(--card-color)">contains keyword</SelectItem>
            <SelectItem value="starts with" className="dark:hover:bg-(--card-color)">starts with</SelectItem>
            <SelectItem value="any message" className="dark:hover:bg-(--card-color)">any message</SelectItem>
            {hasWhatsapp && (
              <SelectItem value="order received" className="dark:hover:bg-(--card-color)">order received</SelectItem>
            )}
          </SelectContent>
        </Select>
      </NodeField>

      {data.triggerType !== "any message" && data.triggerType !== "order received" && (
        <>
          <NodeField label="Trigger Keywords" required description="This flow will be triggered when a user sends any of these keywords" error={(touched || data.forceValidation) && data.triggerType !== "any message" && data.triggerType !== "order received" && (!keywordsArray || keywordsArray.length === 0) ? "Trigger keywords are required" : ""}>
            <div className="flex gap-2">
              <Input value={keyword} onChange={(e) => setKeyword(e.target.value)} onFocus={() => setTouched(true)} onKeyDown={(e) => e.key === "Enter" && addKeyword()} placeholder="Add a keyword..." className={`h-9 text-sm bg-(--input-color) dark:focus:bg-(--page-body-bg) focus:bg-(--input-color) ${!data.keywords || data.keywords.length === 0 ? EMPTY_BORDER : ""}`} />
              <Button onClick={addKeyword} size="icon" className="h-9 w-9 bg-primary hover:bg-primary dark:text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {keywordsArray.length > 0 ? (
                keywordsArray.map((kw: string) => (
                  <Badge key={kw} variant="secondary" className="flex items-center gap-1 bg-purple-50 dark:bg-(--dark-sidebar) dark:border-(--card-border-color) dark:hover:bg-(--table-hover) text-primary border-purple-100">
                    {kw}
                    <X size={12} className="cursor-pointer" onClick={() => removeKeyword(kw)} />
                  </Badge>
                ))
              ) : (
                <div className="w-full py-3 border border-dashed dark:bg-(--dark-sidebar) dark:border-(--card-border-color) border-gray-200 rounded-lg flex items-center justify-center bg-gray-50/50">
                  <span className="text-[11px] text-gray-400">No keywords added yet.</span>
                </div>
              )}
            </div>
          </NodeField>

          <NodeField label="Suggestions" labelClassName="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
            <div className="flex flex-wrap gap-1">
              {["hello", "hi", "start", "help", "info", "menu", "order", "support", "contact"].map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  className="cursor-pointer text-[10px] h-5 px-1.5 hover:bg-gray-100 dark:hover:bg-(--table-hover) transition-colors"
                  onClick={() => {
                    const currentKeywords = Array.isArray(data.keywords) ? data.keywords : [];
                    if (!currentKeywords.includes(s)) {
                      updateNodeData("keywords", [...currentKeywords, s]);
                    }
                  }}
                >
                  {s}
                </Badge>
              ))}
            </div>
          </NodeField>
        </>
      )}

      {hasWidget && (
        <div className="mt-1 space-y-3 border-t border-dashed border-gray-200 dark:border-(--card-border-color) pt-3">
          <div className="flex items-center gap-1.5">
            <Globe size={13} className="text-blue-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Widget Settings</span>
          </div>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
            Visitor replies are handled by your flow (e.g. connect an <strong>AI Agent</strong> with a <strong>Chat model</strong> node). This block only controls the widget shell and embed code.
          </p>

          <NodeField label="Widget Title">
            <Input value={data.widgetTitle || ""} onChange={(e) => updateNodeData("widgetTitle", e.target.value)} placeholder="Chat with us" className={`h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg) ${EMPTY_BORDER}`} />
          </NodeField>

          <NodeField label="Welcome Message">
            <Textarea value={data.widgetWelcomeMessage || ""} onChange={(e) => updateNodeData("widgetWelcomeMessage", e.target.value)} placeholder="Hello! How can we help you today?" rows={2} className="text-sm bg-(--input-color) dark:bg-(--page-body-bg) resize-y min-h-[56px]" />
          </NodeField>

          <div className="grid grid-cols-2 gap-2">
            <NodeField label="Primary Color">
              <div className="flex items-center gap-1.5">
                <input type="color" value={data.widgetPrimaryColor || "#0ea5e9"} onChange={(e) => updateNodeData("widgetPrimaryColor", e.target.value)} className="w-7 h-7 rounded cursor-pointer border-0" />
                <Input value={data.widgetPrimaryColor || "#0ea5e9"} onChange={(e) => updateNodeData("widgetPrimaryColor", e.target.value)} className={`h-7 text-xs bg-(--input-color) dark:bg-(--page-body-bg) ${EMPTY_BORDER}`} />
              </div>
            </NodeField>
            <NodeField label="Position">
              <Select value={data.widgetPosition || "right"} onValueChange={(v) => updateNodeData("widgetPosition", v)}>
                <SelectTrigger className={`h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg) focus-visible:shadow-none ${EMPTY_BORDER}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-(--page-body-bg)">
                  <SelectItem value="right" className="dark:hover:bg-(--card-color)">Right</SelectItem>
                  <SelectItem value="left" className="dark:hover:bg-(--card-color)">Left</SelectItem>
                </SelectContent>
              </Select>
            </NodeField>
          </div>

          <NodeField label="Allowed Domains" description="Comma-separated. Leave empty for any domain.">
            <Input value={data.widgetAllowedDomains || ""} onChange={(e) => updateNodeData("widgetAllowedDomains", e.target.value)} placeholder="https://example.com, https://app.example.com" className={`h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg) ${EMPTY_BORDER}`} />
          </NodeField>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" checked={data.widgetEscalateToHuman ?? true} onChange={(e) => updateNodeData("widgetEscalateToHuman", e.target.checked)} />
              <span className="text-xs text-gray-600 dark:text-gray-400">Allow escalation to human</span>
            </label>
          </div>

          {data.widgetApiKey && (
            <NodeField label="Embed Code" description="Add this script to your website">
              <div className="relative">
                <pre className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 pr-8 overflow-x-auto whitespace-pre-wrap break-all text-gray-600 dark:text-gray-300 leading-relaxed">
                  {embedCode}
                </pre>
                <button onClick={handleCopy} className="absolute top-1.5 right-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition" title="Copy">
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                </button>
              </div>
            </NodeField>
          )}
        </div>
      )}
    </BaseNode>
  );
}
