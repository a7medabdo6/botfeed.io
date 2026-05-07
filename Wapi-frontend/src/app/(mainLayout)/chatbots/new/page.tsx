"use client";

import ChatbotWizardPage from "@/src/components/reply-materials/ChatbotWizardPage";
import { useCreateChatbotMutation } from "@/src/redux/api/chatbotApi";
import type { ChatbotCreatePayload } from "@/src/types/chatbot";
import { useAppSelector } from "@/src/redux/hooks";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function NewChatbotInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return") || "/chatbots";
  const wabaId = useAppSelector((s) => s.workspace.selectedWorkspace?.waba_id);
  const [createChatbot, { isLoading }] = useCreateChatbotMutation();

  const onCancel = useCallback(() => {
    router.push(returnTo);
  }, [router, returnTo]);

  const onSubmit = useCallback(
    async (data: ChatbotCreatePayload) => {
      await createChatbot(data).unwrap();
      toast.success(t("chatbot_wizard.toast_created"));
      router.push(returnTo);
    },
    [createChatbot, router, returnTo, t],
  );

  if (!wabaId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        {t("chatbot_wizard.no_workspace")}
      </div>
    );
  }

  return <ChatbotWizardPage key="chatbot-new" wabaId={wabaId} editItem={null} onCancel={onCancel} onSubmit={onSubmit} isLoading={isLoading} />;
}

function NewChatbotFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 items-center justify-center p-12 text-slate-500 gap-2">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm">{t("common.loading")}</span>
    </div>
  );
}

export default function NewChatbotPage() {
  return (
    <Suspense fallback={<NewChatbotFallback />}>
      <div className="flex flex-1 flex-col min-h-0 min-w-0 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
        <NewChatbotInner />
      </div>
    </Suspense>
  );
}
