"use client";

import ChatbotTrainSection from "@/src/components/reply-materials/ChatbotTrainSection";
import { useGetChatbotByIdQuery } from "@/src/redux/api/chatbotApi";
import { useAppSelector } from "@/src/redux/hooks";
import { useParams, useRouter } from "next/navigation";

export default function ChatbotTrainPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const chatbotId = params?.id || "";
  const wabaId = useAppSelector((s) => s.workspace.selectedWorkspace?.waba_id);
  const { data, isLoading } = useGetChatbotByIdQuery(chatbotId, { skip: !chatbotId });

  if (!wabaId) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Select a workspace with a connected WhatsApp account to train chatbots.
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center p-6 text-sm text-gray-600 dark:text-gray-400">Loading chatbot…</div>;
  }

  if (!data?.data) {
    return <div className="flex flex-1 items-center justify-center p-6 text-sm text-rose-500">Chatbot not found.</div>;
  }

  return (
    <ChatbotTrainSection
      chatbot={data.data}
      onBack={() => {
        router.push("/chatbots");
      }}
    />
  );
}
