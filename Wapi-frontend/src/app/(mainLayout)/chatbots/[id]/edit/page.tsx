"use client";

import ChatbotWizardPage from "@/src/components/reply-materials/ChatbotWizardPage";
import { useGetChatbotByIdQuery, useUpdateChatbotMutation } from "@/src/redux/api/chatbotApi";
import { useAppSelector } from "@/src/redux/hooks";
import type { ChatbotCreatePayload } from "@/src/types/chatbot";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function EditChatbotInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const returnTo = searchParams.get("return") || "/chatbots";
  const wabaId = useAppSelector((s) => s.workspace.selectedWorkspace?.waba_id);

  const { data, isLoading: loadingChatbot, isError } = useGetChatbotByIdQuery(id, { skip: !id });
  const [updateChatbot, { isLoading: isUpdating }] = useUpdateChatbotMutation();

  const chatbot = data?.data;

  const onCancel = useCallback(() => {
    router.push(returnTo);
  }, [router, returnTo]);

  const onSubmit = useCallback(
    async (payload: ChatbotCreatePayload) => {
      if (!id) return;
      await updateChatbot({ id, data: payload }).unwrap();
      toast.success(t("chatbot_wizard.toast_updated"));
      router.push(returnTo);
    },
    [id, updateChatbot, router, returnTo, t],
  );

  if (!wabaId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
        {t("chatbot_wizard.no_workspace")}
      </div>
    );
  }

  if (!id) {
    return (
      <div className="p-6 text-center text-sm text-slate-600">
        <Link href={returnTo} className="text-primary underline">
          {t("chatbot_wizard.back_to_list")}
        </Link>
      </div>
    );
  }

  if (loadingChatbot) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-slate-500 gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm">{t("common.loading")}</span>
      </div>
    );
  }

  if (isError || !chatbot) {
    return (
      <div className="flex flex-col items-center justify-center p-10 gap-3 text-center max-w-md mx-auto">
        <p className="text-sm text-slate-600 dark:text-slate-400">{t("chatbot_wizard.load_error")}</p>
        <Link href={returnTo} className="text-sm text-primary font-medium hover:underline">
          {t("chatbot_wizard.back_to_list")}
        </Link>
      </div>
    );
  }

  return <ChatbotWizardPage key={id} wabaId={wabaId} editItem={chatbot} onCancel={onCancel} onSubmit={onSubmit} isLoading={isUpdating} />;
}

function EditChatbotFallback() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 items-center justify-center p-12 text-slate-500 gap-2">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span className="text-sm">{t("common.loading")}</span>
    </div>
  );
}

export default function EditChatbotPage() {
  return (
    <Suspense fallback={<EditChatbotFallback />}>
      <div className="flex flex-1 flex-col min-h-0 min-w-0 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
        <EditChatbotInner />
      </div>
    </Suspense>
  );
}
