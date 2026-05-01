"use client";

import { WidgetConfigData } from "@/src/redux/api/widgetConfigApi";
import { Copy, Check } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface Props {
  config: WidgetConfigData;
}

const MODES: Record<string, string> = { whatsapp: "WhatsApp", chatbot: "AI Chatbot", both: "Both" };

const WidgetConfigCard: React.FC<Props> = ({ config }) => {
  const [copied, setCopied] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/?$/, "") || "";
  const embedCode = `<script src="${apiUrl}/public/widget.js" data-widget-id="${config.api_key}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setCopied(true);
      toast.success("Embed code copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white dark:bg-(--card-color) rounded-xl border border-slate-200 dark:border-(--card-border-color) p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.primary_color }} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{config.name}</h3>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}
        >
          {config.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{MODES[config.mode] || config.mode}</span>
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{config.position}</span>
        {config.allowed_domains.length > 0 && (
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{config.allowed_domains.length} domain{config.allowed_domains.length > 1 ? "s" : ""}</span>
        )}
      </div>

      <div className="mt-1">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Embed Code</p>
        <div className="relative">
          <pre className="text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 pr-10 overflow-x-auto whitespace-pre-wrap break-all text-gray-600 dark:text-gray-300 leading-relaxed">
            {embedCode}
          </pre>
          <button onClick={handleCopy} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition" title="Copy">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Managed via Flow Builder</p>
    </div>
  );
};

export default WidgetConfigCard;
