/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDeleteChatbotMutation, useGetChatbotsQuery } from "@/src/redux/api/chatbotApi";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { Chatbot } from "@/src/types/chatbot";
import { ChatbotSectionProps } from "@/src/types/replyMaterial";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import ChatbotGrid from "./ChatbotGrid";
import ChatbotTrainSection from "./ChatbotTrainSection";

const ChatbotSection: React.FC<ChatbotSectionProps> = ({ wabaId, onToggleSidebar, chatbotListReturnHref = "/chatbots" }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [trainingChatbot, setTrainingChatbot] = useState<Chatbot | null>(null);

  const { data: chatbotsData, isLoading, refetch } = useGetChatbotsQuery({ waba_id: wabaId }, { skip: !wabaId });
  const [deleteChatbot, { isLoading: isDeleting }] = useDeleteChatbotMutation();

  const filteredChatbots = (chatbotsData?.data || []).filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const returnQuery = chatbotListReturnHref !== "/chatbots" ? `?return=${encodeURIComponent(chatbotListReturnHref)}` : "";

  const goToCreate = useCallback(() => {
    router.push(`/chatbots/new${returnQuery}`);
  }, [router, returnQuery]);

  const goToEdit = useCallback(
    (chatbot: Chatbot) => {
      router.push(`/chatbots/${chatbot._id}/edit${returnQuery}`);
    },
    [router, returnQuery],
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteChatbot(deleteId).unwrap();
      toast.success("Chatbot deleted successfully");
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete chatbot");
    }
  };

  if (trainingChatbot) {
    return (
      <ChatbotTrainSection
        chatbot={trainingChatbot}
        onBack={() => {
          setTrainingChatbot(null);
          refetch();
        }}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 sm:p-6 p-4 overflow-y-auto custom-scrollbar">
      <CommonHeader
        title="AI Chatbots"
        description="Manage your intelligent automated assistants"
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        searchPlaceholder="Search chatbots..."
        onRefresh={refetch}
        onAddClick={goToCreate}
        addLabel="Create Chatbot"
        addPermission="create.chatbots"
        isLoading={isLoading}
        onToggleSidebar={onToggleSidebar}
      />

      <div className="mt-8 flex-1">
        <ChatbotGrid
          items={filteredChatbots}
          isLoading={isLoading}
          onEdit={goToEdit}
          onDelete={setDeleteId}
          onTrain={setTrainingChatbot}
          onAdd={goToCreate}
        />
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Chatbot" subtitle="Are you sure you want to delete this chatbot? This action cannot be undone." confirmText="Delete" variant="danger" />
    </div>
  );
};

export default ChatbotSection;
