"use client";

import { useEffect } from "react";

/**
 * Injects public/widget.js twice (WhatsApp + chatbot) with distinct data-widget-id values.
 * Client-only so data attributes are applied reliably (Next Script omits unknown props in some versions).
 */
export default function FunnelWidgetScripts({
  scriptSrc,
  whatsappKey,
  chatbotKey,
}: {
  scriptSrc: string;
  whatsappKey: string | null;
  chatbotKey: string | null;
}) {
  useEffect(() => {
    const scripts: HTMLScriptElement[] = [];
    const append = (key: string) => {
      const s = document.createElement("script");
      s.src = scriptSrc;
      s.async = true;
      s.setAttribute("data-widget-id", key);
      document.body.appendChild(s);
      scripts.push(s);
    };
    if (whatsappKey) append(whatsappKey);
    if (chatbotKey) append(chatbotKey);
    return () => {
      scripts.forEach((s) => {
        try {
          s.remove();
        } catch {
          /* ignore */
        }
      });
    };
  }, [scriptSrc, whatsappKey, chatbotKey]);

  return null;
}
