"use client";

import { ChatbotPersonaFields } from "@/src/components/reply-materials/ChatbotPersonaFields";
import { DEFAULT_PERSONA } from "@/src/constants/chatbot-persona";
import { Button } from "@/src/elements/ui/button";
import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/elements/ui/select";
import { Switch } from "@/src/elements/ui/switch";
import { Textarea } from "@/src/elements/ui/textarea";
import { cn } from "@/src/lib/utils";
import { usePreviewSystemPromptMutation } from "@/src/redux/api/chatbotApi";
import { useGetAllModelsQuery } from "@/src/redux/api/settingsApi";
import { ChatbotWizardPageProps } from "@/src/types/replyMaterial";
import type { PersonaProfile } from "@/src/types/chatbot";
import { AIModel } from "@/src/types/settings";
import { ArrowLeft, Bot, Building2, Loader2, RefreshCw, Sparkles } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function mergePersona(saved?: PersonaProfile | null): PersonaProfile {
  return { ...DEFAULT_PERSONA, ...(saved && typeof saved === "object" ? saved : {}) };
}

export default function ChatbotWizardPage({ onCancel, onSubmit, isLoading, editItem, wabaId }: ChatbotWizardPageProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [aiModel, setAiModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [persona, setPersona] = useState<PersonaProfile>(DEFAULT_PERSONA);
  const [previewText, setPreviewText] = useState("");
  const [useManualPrompt, setUseManualPrompt] = useState(false);
  const [manualPrompt, setManualPrompt] = useState("");

  const { data: modelsData, isLoading: loadingModels } = useGetAllModelsQuery();
  const models = modelsData?.data?.models || [];
  const [previewSystemPrompt, { isLoading: previewLoading }] = usePreviewSystemPromptMutation();

  const runPreview = useCallback(async () => {
    try {
      const res = await previewSystemPrompt({
        business_name: businessName,
        business_description: businessDescription,
        persona_profile: persona,
      }).unwrap();
      setPreviewText(res.data.system_prompt);
    } catch {
      setPreviewText("");
    }
  }, [previewSystemPrompt, businessName, businessDescription, persona]);

  useEffect(() => {
    setStep(1);
    setName(editItem?.name ?? "");
    const editAiModel = editItem?.ai_model;
    setAiModel(editAiModel && typeof editAiModel === "object" ? editAiModel._id : editAiModel ?? "");
    setApiKey(editItem?.api_key ?? "");
    setBusinessName(editItem?.business_name ?? "");
    setBusinessDescription(editItem?.business_description ?? "");
    setPersona(mergePersona(editItem?.persona_profile));
    setUseManualPrompt(false);
    setManualPrompt(editItem?.system_prompt ?? "");
    setPreviewText("");
  }, [editItem]);

  useEffect(() => {
    if (step !== 2 || useManualPrompt) return;
    const id = window.setTimeout(() => {
      void runPreview();
    }, 420);
    return () => window.clearTimeout(id);
  }, [step, useManualPrompt, runPreview, businessName, businessDescription, persona]);

  const patchPersona = (patch: Partial<PersonaProfile>) => {
    setPersona((prev) => {
      const next: PersonaProfile = { ...prev, ...patch };
      if (!Object.prototype.hasOwnProperty.call(patch, "archetype_id")) {
        delete next.archetype_id;
      }
      return next;
    });
  };

  const handleFinalSubmit = async () => {
    if (!name.trim() || !aiModel || !apiKey) return;
    const base = {
      waba_id: wabaId,
      name: name.trim(),
      ai_model: aiModel,
      api_key: apiKey.trim(),
      business_name: businessName.trim(),
      business_description: businessDescription.trim(),
      persona_profile: { ...persona },
    };
    if (useManualPrompt && manualPrompt.trim()) {
      await onSubmit({ ...base, system_prompt: manualPrompt.trim(), use_custom_system_prompt: true });
    } else {
      await onSubmit({ ...base, use_custom_system_prompt: false });
    }
  };

  const progressPct = step === 1 ? 50 : 100;

  const stepper = (
    <div className="px-1 pb-1 sm:px-2">
      <div className="flex items-stretch gap-2 sm:gap-4">
        {[
          { n: 1 as const, label: t("chatbot_wizard.step_basics"), icon: Building2 },
          { n: 2 as const, label: t("chatbot_wizard.step_persona"), icon: Sparkles },
        ].map(({ n, label, icon: Icon }, idx) => {
          const active = step === n;
          const done = step > n;
          return (
            <React.Fragment key={n}>
              {idx > 0 && (
                <div className="flex flex-1 items-center px-1 min-w-[1.5rem]">
                  <div className={cn("h-px w-full rounded-full transition-colors", done || active ? "bg-primary/50" : "bg-slate-200 dark:bg-slate-600")} />
                </div>
              )}
              <button
                type="button"
                disabled={isLoading || (n === 2 && (!name.trim() || !aiModel || !apiKey))}
                onClick={() => {
                  if (n === 1) setStep(1);
                  if (n === 2 && name.trim() && aiModel && apiKey) setStep(2);
                }}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all sm:px-4 sm:py-3",
                  active && "border-primary/40 bg-primary/[0.07] shadow-sm ring-1 ring-primary/20",
                  done && !active && "border-emerald-200/80 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20",
                  !active && !done && "border-slate-200/90 bg-slate-50/50 dark:border-(--card-border-color) dark:bg-white/[0.03]",
                  (n === 2 && (!name.trim() || !aiModel || !apiKey)) && "opacity-50 cursor-not-allowed",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                    active && "bg-primary text-white",
                    done && !active && "bg-emerald-600 text-white",
                    !active && !done && "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
                  )}
                >
                  {done && !active ? "✓" : n}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <Icon className="h-3.5 w-3.5 opacity-80" aria-hidden />
                    {t("chatbot_wizard.step_marker", { n })}
                  </span>
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{label}</span>
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80 transition-[width] duration-500 ease-out" style={{ width: `${progressPct}%` }} />
      </div>
    </div>
  );

  const previewPanel = (
    <div className="rounded-2xl border border-slate-200/90 bg-linear-to-b from-slate-50/90 to-white dark:border-(--card-border-color) dark:from-(--dark-body) dark:to-(--card-color) p-4 shadow-sm space-y-3 lg:max-h-[min(560px,calc(100dvh-14rem))] lg:flex lg:flex-col">
      <div className="flex flex-wrap items-start justify-between gap-2 shrink-0">
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bot className="h-4 w-4" aria-hidden />
            </span>
            {t("chatbot_wizard.preview_title")}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-9">{t("chatbot_wizard.preview_hint")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5 shrink-0" disabled={isLoading || useManualPrompt || previewLoading} onClick={() => void runPreview()}>
          <RefreshCw size={14} className={previewLoading ? "animate-spin" : ""} />
          {t("chatbot_wizard.preview_refresh")}
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-(--card-border-color) pb-3 shrink-0">
        <Label htmlFor="manual-prompt" className="text-sm font-medium text-slate-700 dark:text-slate-200 cursor-pointer">
          {t("chatbot_wizard.edit_manual")}
        </Label>
        <Switch
          id="manual-prompt"
          checked={useManualPrompt}
          onCheckedChange={(checked) => {
            const on = checked === true;
            setUseManualPrompt(on);
            if (on) {
              setManualPrompt((m) => m.trim() || previewText || editItem?.system_prompt || "");
            }
          }}
          disabled={isLoading}
        />
      </div>
      {useManualPrompt && <p className="text-xs text-amber-700 dark:text-amber-400/90 shrink-0">{t("chatbot_wizard.manual_hint")}</p>}

      <div className="min-h-0 flex-1 flex flex-col lg:overflow-hidden">
        {useManualPrompt ? (
          <Textarea
            value={manualPrompt}
            onChange={(e) => setManualPrompt(e.target.value)}
            disabled={isLoading}
            className="min-h-[200px] lg:min-h-0 lg:flex-1 lg:resize-none font-mono text-xs rounded-xl border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color)"
          />
        ) : (
          <Textarea
            readOnly
            value={previewLoading ? "" : previewText}
            placeholder={previewLoading ? t("common.loading") : t("chatbot_wizard.preview_empty")}
            className="min-h-[200px] lg:min-h-0 lg:flex-1 lg:resize-none font-mono text-xs rounded-xl border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) text-slate-700 dark:text-slate-200"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-5xl flex flex-col min-h-0">
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-(--card-color) dark:border-(--card-border-color) shadow-xl overflow-hidden flex flex-col min-h-0">
        <div className="flex items-start gap-3 px-4 sm:px-6 pt-5 pb-3 border-b border-slate-100/90 dark:border-(--card-border-color)/80 bg-linear-to-r from-slate-50/50 to-transparent dark:from-white/[0.02]">
          <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-xl h-10 w-10 mt-0.5" onClick={onCancel} disabled={isLoading} aria-label={t("chatbot_wizard.back_to_list")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-primary/12 flex items-center justify-center text-primary shadow-inner shrink-0">
              <Bot size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{editItem ? t("chatbot_wizard.title_edit") : t("chatbot_wizard.title_create")}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{editItem ? t("chatbot_wizard.desc_edit") : t("chatbot_wizard.desc_create")}</p>
            </div>
          </div>
        </div>

        {stepper}

        <div className="p-4 sm:p-6 pt-4 max-h-[min(78vh,720px)] overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300 space-y-5">
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 dark:border-(--card-border-color) dark:bg-white/[0.03] p-5 sm:p-6 shadow-sm">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-4">{t("chatbot_wizard.basics_intro")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_name")}</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("chatbot_wizard.placeholder_name")} required disabled={isLoading} className="h-11 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--dark-body)" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_model")}</Label>
                    <Select value={aiModel} onValueChange={setAiModel} disabled={isLoading || loadingModels}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--dark-body)">
                        <SelectValue placeholder={loadingModels ? t("common.loading") : t("chatbot_wizard.field_model")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl dark:bg-(--card-color) border-slate-100 dark:border-(--card-border-color)">
                        {models.map((model: AIModel) => (
                          <SelectItem key={model._id} value={model._id} className="rounded-lg">
                            {model.display_name} ({model.provider})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_api_key")}</Label>
                    <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." type="password" required disabled={isLoading} className="h-11 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--dark-body)" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_business_name")}</Label>
                    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={t("chatbot_wizard.placeholder_business")} disabled={isLoading} className="h-11 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--dark-body)" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_business_description")}</Label>
                    <Textarea value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} placeholder={t("chatbot_wizard.placeholder_business_desc")} disabled={isLoading} className="min-h-28 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--dark-body) resize-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300 lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(300px,0.88fr)] lg:gap-8 lg:items-start space-y-6 lg:space-y-0">
              <div className="min-w-0 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t("chatbot_wizard.persona_intro")}</p>
                <ChatbotPersonaFields t={t} persona={persona} onChange={patchPersona} disabled={isLoading} />
              </div>
              <div className="lg:sticky lg:top-0 lg:self-start">{previewPanel}</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 dark:border-(--card-border-color) bg-slate-50/70 dark:bg-black/20 backdrop-blur-sm flex-wrap shrink-0">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1 min-w-[120px] h-11 rounded-xl border-slate-200 hover:bg-primary hover:text-white dark:border-(--card-border-color) text-slate-600 dark:text-slate-300">
            {t("common.cancel")}
          </Button>
          {step === 1 ? (
            <Button type="button" disabled={isLoading || !name.trim() || !aiModel || !apiKey} className="flex-1 min-w-[120px] h-11 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/25" onClick={() => setStep(2)}>
              {t("chatbot_wizard.next")}
            </Button>
          ) : (
            <>
              <Button type="button" variant="outline" disabled={isLoading} className="flex-1 min-w-[100px] h-11 rounded-xl" onClick={() => setStep(1)}>
                {t("chatbot_wizard.back")}
              </Button>
              <Button
                type="button"
                disabled={isLoading || !name.trim() || !aiModel || !apiKey || (useManualPrompt && !manualPrompt.trim())}
                className="flex-1 min-w-[120px] h-11 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/25"
                onClick={() => void handleFinalSubmit()}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    {t("chatbot_wizard.saving")}
                  </>
                ) : editItem ? (
                  t("common.save_changes")
                ) : (
                  t("chatbot_wizard.create")
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
