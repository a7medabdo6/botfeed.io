"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WebChatPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/chat?channel=web");
  }, [router]);

  return null;
}
