"use client";

import { useEffect, useRef } from "react";

export default function FunnelViewTracker({
  apiBase,
  publicId,
  abVariant,
}: {
  apiBase: string;
  publicId: string;
  abVariant: "A" | "B" | null;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !publicId) return;
    sent.current = true;
    const url = `${apiBase.replace(/\/$/, "")}/public/funnel/${encodeURIComponent(publicId)}/analytics`;
    const body = JSON.stringify({
      event_type: "view",
      ab_variant: abVariant || undefined,
      path: typeof window !== "undefined" ? window.location.pathname : "",
      referrer: typeof document !== "undefined" ? document.referrer || "" : "",
    });
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      return;
    }
    void fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body }).catch(() => {});
  }, [apiBase, publicId, abVariant]);

  return null;
}
