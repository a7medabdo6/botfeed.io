"use client";

import ChatbotSection from "@/src/components/reply-materials/ChatbotSection";
import { useAppSelector } from "@/src/redux/hooks";

export default function ChatbotsPage() {
  const wabaId = useAppSelector((s) => s.workspace.selectedWorkspace?.waba_id);

  if (!wabaId) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Select a workspace with a connected WhatsApp account to manage chatbots.
      </div>
    );
  }

  return <ChatbotSection wabaId={wabaId} />;
}
