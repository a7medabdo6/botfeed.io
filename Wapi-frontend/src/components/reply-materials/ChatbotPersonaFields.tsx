"use client";

import { Button } from "@/src/elements/ui/button";
import { Checkbox } from "@/src/elements/ui/checkbox";
import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/elements/ui/select";
import { Textarea } from "@/src/elements/ui/textarea";
import { CHATBOT_ARCHETYPES } from "@/src/constants/chatbot-persona";
import { cn } from "@/src/lib/utils";
import type { PersonaProfile, PersonaUseCase } from "@/src/types/chatbot";
import { TFunction } from "i18next";
import { Building2, ChevronDown, ChevronUp, Globe2, Mic2, Minus, Plus, Shield, Sparkles, Target, Wand2 } from "lucide-react";
import React, { useMemo, useState } from "react";

type Props = {
  t: TFunction;
  persona: PersonaProfile;
  onChange: (patch: Partial<PersonaProfile>) => void;
  disabled?: boolean;
};

function Section({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-slate-200/80 bg-white/60 dark:border-(--card-border-color) dark:bg-white/[0.03] p-4 sm:p-5 shadow-sm", className)}>
      <div className="flex gap-3 mb-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>
          {description ? <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function ChatbotPersonaFields({ t, persona, onChange, disabled }: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const hasAdvancedContent = useMemo(() => {
    const keys: (keyof PersonaProfile)[] = ["industry_vertical", "regional_voice", "always_rules", "never_rules", "knowledge_scope", "tone_notes"];
    const strFilled = keys.some((k) => {
      const v = persona[k];
      return typeof v === "string" && v.trim().length > 0;
    });
    const techNonDefault = persona.technical_level != null && persona.technical_level !== "lay";
    return strFilled || techNonDefault;
  }, [persona]);

  const sel = <T extends string>(key: keyof PersonaProfile, options: { value: T; labelKey: string }[], defaultValue: T) => (
    <Select value={((persona[key] as string) ?? defaultValue) as string} onValueChange={(v) => onChange({ [key]: v } as Partial<PersonaProfile>)} disabled={disabled}>
      <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body)">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl dark:bg-(--card-color)">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {t(`chatbot_wizard.${o.labelKey}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.04] dark:bg-primary/5 p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="h-4 w-4 text-primary shrink-0" aria-hidden />
          <Label className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("chatbot_wizard.archetypes_title")}</Label>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{t("chatbot_wizard.archetypes_hint")}</p>
        <div className="flex flex-wrap gap-2">
          {CHATBOT_ARCHETYPES.map((a) => {
            const selected = persona.archetype_id === a.id;
            return (
              <Button
                key={a.id}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 rounded-full border px-3 text-xs font-medium transition-all",
                  selected
                    ? "border-primary bg-primary/12 text-primary shadow-sm ring-1 ring-primary/25"
                    : "border-slate-200 bg-white/80 hover:border-primary/30 dark:border-(--card-border-color) dark:bg-(--dark-body)",
                )}
                disabled={disabled}
                onClick={() => onChange({ ...a.persona, archetype_id: a.id })}
              >
                {t(`chatbot_wizard.${a.labelKey}`)}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-slate-50/40 dark:border-(--card-border-color) dark:bg-white/[0.02] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden />
          <Label className="text-sm font-bold text-slate-800 dark:text-slate-100">{t("chatbot_wizard.refine_title")}</Label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" className="h-9 rounded-full text-xs gap-1.5" disabled={disabled} onClick={() => onChange({ response_length: "short" })}>
            <Minus className="h-3.5 w-3.5 opacity-70" />
            {t("chatbot_wizard.refine_shorter")}
          </Button>
          <Button type="button" variant="secondary" size="sm" className="h-9 rounded-full text-xs gap-1.5" disabled={disabled} onClick={() => onChange({ response_length: "detailed" })}>
            <Plus className="h-3.5 w-3.5 opacity-70" />
            {t("chatbot_wizard.refine_longer")}
          </Button>
          <Button type="button" variant="secondary" size="sm" className="h-9 rounded-full text-xs" disabled={disabled} onClick={() => onChange({ formality: "formal", warmth: "low" })}>
            {t("chatbot_wizard.refine_formal")}
          </Button>
          <Button type="button" variant="secondary" size="sm" className="h-9 rounded-full text-xs" disabled={disabled} onClick={() => onChange({ formality: "casual", warmth: "high" })}>
            {t("chatbot_wizard.refine_friendly")}
          </Button>
        </div>
      </section>

      <Section title={t("chatbot_wizard.section_role")} description={t("chatbot_wizard.section_role_desc")} icon={Target}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_use_case")}</Label>
            <Select value={(persona.use_case as PersonaUseCase) || "general"} onValueChange={(v) => onChange({ use_case: v as PersonaUseCase })} disabled={disabled}>
              <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body)">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-(--card-color)">
                {(
                  [
                    ["support", "use_case_support"],
                    ["sales", "use_case_sales"],
                    ["booking", "use_case_booking"],
                    ["faq", "use_case_faq"],
                    ["lead_capture", "use_case_lead_capture"],
                    ["general", "use_case_general"],
                  ] as const
                ).map(([value, labelKey]) => (
                  <SelectItem key={value} value={value}>
                    {t(`chatbot_wizard.${labelKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_audience")}</Label>
            {sel(
              "audience_type",
              [
                { value: "b2c", labelKey: "audience_b2c" },
                { value: "b2b", labelKey: "audience_b2b" },
                { value: "mixed", labelKey: "audience_mixed" },
              ],
              "mixed",
            )}
          </div>
        </div>
      </Section>

      <Section title={t("chatbot_wizard.section_voice")} description={t("chatbot_wizard.section_voice_desc")} icon={Mic2}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_formality")}</Label>
            {sel(
              "formality",
              [
                { value: "casual", labelKey: "formality_casual" },
                { value: "neutral", labelKey: "formality_neutral" },
                { value: "formal", labelKey: "formality_formal" },
              ],
              "neutral",
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_warmth")}</Label>
            {sel(
              "warmth",
              [
                { value: "low", labelKey: "warmth_low" },
                { value: "medium", labelKey: "warmth_medium" },
                { value: "high", labelKey: "warmth_high" },
              ],
              "medium",
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_style")}</Label>
            {sel(
              "style",
              [
                { value: "classic", labelKey: "style_classic" },
                { value: "modern", labelKey: "style_modern" },
              ],
              "modern",
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_greeting")}</Label>
            {sel(
              "greeting_style",
              [
                { value: "brief", labelKey: "greeting_brief" },
                { value: "friendly", labelKey: "greeting_friendly" },
                { value: "minimal", labelKey: "greeting_minimal" },
              ],
              "friendly",
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_emoji")}</Label>
            {sel(
              "emoji_policy",
              [
                { value: "never", labelKey: "emoji_never" },
                { value: "sparing", labelKey: "emoji_sparing" },
                { value: "ok", labelKey: "emoji_ok" },
              ],
              "sparing",
            )}
          </div>
        </div>
      </Section>

      <Section title={t("chatbot_wizard.section_delivery")} description={t("chatbot_wizard.section_delivery_desc")} icon={Globe2}>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_reply_language")}</Label>
            <Input value={persona.reply_language ?? ""} onChange={(e) => onChange({ reply_language: e.target.value })} disabled={disabled} className="h-10 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body)" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_response_length")}</Label>
            {sel(
              "response_length",
              [
                { value: "short", labelKey: "length_short" },
                { value: "balanced", labelKey: "length_balanced" },
                { value: "detailed", labelKey: "length_detailed" },
              ],
              "balanced",
            )}
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_channel")}</Label>
            {sel(
              "channel_hint",
              [
                { value: "whatsapp", labelKey: "channel_whatsapp" },
                { value: "widget", labelKey: "channel_widget" },
                { value: "both", labelKey: "channel_both" },
              ],
              "both",
            )}
          </div>
          <div className="flex items-center gap-2 sm:col-span-2 rounded-xl border border-slate-100 dark:border-(--card-border-color) bg-slate-50/50 dark:bg-black/10 px-3 py-2.5">
            <Checkbox id="mix-lang" checked={!!persona.allow_mixed_languages} onCheckedChange={(c) => onChange({ allow_mixed_languages: c === true })} disabled={disabled} />
            <Label htmlFor="mix-lang" className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer leading-snug">
              {t("chatbot_wizard.field_allow_mixed_languages")}
            </Label>
          </div>
        </div>
      </Section>

      <div>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-between rounded-xl h-11 px-4 border-slate-200 dark:border-(--card-border-color)", hasAdvancedContent && !advancedOpen && "border-amber-200/80 dark:border-amber-900/40")}
          disabled={disabled}
          onClick={() => setAdvancedOpen((o) => !o)}
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-slate-500" aria-hidden />
            {advancedOpen ? t("chatbot_wizard.advanced_toggle_hide") : t("chatbot_wizard.advanced_toggle_show")}
            {hasAdvancedContent && !advancedOpen ? (
              <span className="ml-1 rounded-full bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">{t("chatbot_wizard.advanced_badge")}</span>
            ) : null}
          </span>
          {advancedOpen ? <ChevronUp className="h-4 w-4 opacity-60" /> : <ChevronDown className="h-4 w-4 opacity-60" />}
        </Button>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">{t("chatbot_wizard.advanced_hint")}</p>

        {advancedOpen && (
          <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
            <Section title={t("chatbot_wizard.section_advanced_ctx")} icon={Building2} className="border-dashed">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_industry")}</Label>
                  <Input value={persona.industry_vertical ?? ""} onChange={(e) => onChange({ industry_vertical: e.target.value })} placeholder={t("chatbot_wizard.field_industry_ph")} disabled={disabled} className="h-10 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body)" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_technical_level")}</Label>
                  {sel(
                    "technical_level",
                    [
                      { value: "lay", labelKey: "tech_lay" },
                      { value: "intermediate", labelKey: "tech_intermediate" },
                      { value: "technical", labelKey: "tech_technical" },
                    ],
                    "lay",
                  )}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_regional_voice")}</Label>
                  <Input value={persona.regional_voice ?? ""} onChange={(e) => onChange({ regional_voice: e.target.value })} placeholder={t("chatbot_wizard.field_regional_voice_ph")} disabled={disabled} className="h-10 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body)" />
                </div>
              </div>
            </Section>

            <Section title={t("chatbot_wizard.section_policies")} description={t("chatbot_wizard.section_policies_desc")} icon={Shield}>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_always")}</Label>
                  <Textarea value={persona.always_rules ?? ""} onChange={(e) => onChange({ always_rules: e.target.value })} disabled={disabled} className="min-h-[72px] rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body) resize-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_never")}</Label>
                  <Textarea value={persona.never_rules ?? ""} onChange={(e) => onChange({ never_rules: e.target.value })} disabled={disabled} className="min-h-[72px] rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body) resize-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_escalation")}</Label>
                  <Textarea value={persona.escalation_policy ?? ""} onChange={(e) => onChange({ escalation_policy: e.target.value })} disabled={disabled} className="min-h-[60px] rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body) resize-none text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_scope")}</Label>
                  <Input value={persona.knowledge_scope ?? ""} onChange={(e) => onChange({ knowledge_scope: e.target.value })} placeholder={t("chatbot_wizard.field_scope_ph")} disabled={disabled} className="h-10 rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body)" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("chatbot_wizard.field_tone_notes")}</Label>
                  <Textarea value={persona.tone_notes ?? ""} onChange={(e) => onChange({ tone_notes: e.target.value })} disabled={disabled} className="min-h-[60px] rounded-xl border-slate-200 dark:border-(--card-border-color) bg-slate-50/80 dark:bg-(--dark-body) resize-none text-sm" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-(--card-border-color)">
                <div className="flex items-center gap-2">
                  <Checkbox id="med-leg" checked={persona.avoid_medical_legal === true} onCheckedChange={(c) => onChange({ avoid_medical_legal: c === true })} disabled={disabled} />
                  <Label htmlFor="med-leg" className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                    {t("chatbot_wizard.field_avoid_medical_legal")}
                  </Label>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto min-w-[200px]">
                  <Label className="text-xs text-slate-500 shrink-0">{t("chatbot_wizard.field_refusal_tone")}</Label>
                  {sel(
                    "refusal_tone",
                    [
                      { value: "friendly", labelKey: "refusal_friendly" },
                      { value: "strict", labelKey: "refusal_strict" },
                    ],
                    "friendly",
                  )}
                </div>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
