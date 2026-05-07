import type { PersonaProfile } from "@/src/types/chatbot";

/** Baseline wizard fields (step 2) + optional refinements used by chips and server prompt. */
export function defaultPersona(): PersonaProfile {
  return {
    use_case: "general",
    formality: "neutral",
    style: "modern",
    reply_language: "English",
    channel_hint: "both",
    response_length: "balanced",
    tone_notes: "",
    warmth: "medium",
    emoji_policy: "sparing",
    greeting_style: "friendly",
    allow_mixed_languages: false,
    avoid_medical_legal: false,
    refusal_tone: "friendly",
  };
}

export type ChatbotArchetypeId =
  | "formal_support"
  | "casual_retail"
  | "faq_helper"
  | "b2b_sales"
  | "booking_assistant"
  | "lead_capture";

export const CHATBOT_ARCHETYPE_IDS: ChatbotArchetypeId[] = [
  "formal_support",
  "casual_retail",
  "faq_helper",
  "b2b_sales",
  "booking_assistant",
  "lead_capture",
];

const archetypeProfiles: Record<ChatbotArchetypeId, Omit<PersonaProfile, "archetype_id">> = {
  formal_support: {
    use_case: "support",
    formality: "formal",
    style: "classic",
    warmth: "medium",
    reply_language: "English",
    channel_hint: "both",
    response_length: "balanced",
    tone_notes: "",
    emoji_policy: "never",
    greeting_style: "brief",
    audience_type: "mixed",
    allow_mixed_languages: false,
    avoid_medical_legal: true,
    refusal_tone: "strict",
  },
  casual_retail: {
    use_case: "sales",
    formality: "casual",
    style: "modern",
    warmth: "high",
    reply_language: "English",
    channel_hint: "widget",
    response_length: "short",
    tone_notes: "",
    emoji_policy: "ok",
    greeting_style: "friendly",
    audience_type: "b2c",
    allow_mixed_languages: true,
    avoid_medical_legal: false,
    refusal_tone: "friendly",
  },
  faq_helper: {
    use_case: "faq",
    formality: "neutral",
    style: "modern",
    warmth: "low",
    reply_language: "English",
    channel_hint: "both",
    response_length: "balanced",
    tone_notes: "",
    emoji_policy: "never",
    greeting_style: "minimal",
    audience_type: "mixed",
    allow_mixed_languages: false,
    avoid_medical_legal: true,
    refusal_tone: "friendly",
  },
  b2b_sales: {
    use_case: "sales",
    formality: "neutral",
    style: "modern",
    warmth: "medium",
    reply_language: "English",
    channel_hint: "both",
    response_length: "detailed",
    tone_notes: "",
    emoji_policy: "never",
    greeting_style: "brief",
    audience_type: "b2b",
    technical_level: "intermediate",
    allow_mixed_languages: false,
    avoid_medical_legal: true,
    refusal_tone: "strict",
  },
  booking_assistant: {
    use_case: "booking",
    formality: "neutral",
    style: "modern",
    warmth: "medium",
    reply_language: "English",
    channel_hint: "whatsapp",
    response_length: "short",
    tone_notes: "",
    emoji_policy: "sparing",
    greeting_style: "friendly",
    audience_type: "b2c",
    allow_mixed_languages: true,
    avoid_medical_legal: false,
    refusal_tone: "friendly",
  },
  lead_capture: {
    use_case: "lead_capture",
    formality: "casual",
    style: "modern",
    warmth: "low",
    reply_language: "English",
    channel_hint: "whatsapp",
    response_length: "short",
    tone_notes: "",
    emoji_policy: "sparing",
    greeting_style: "minimal",
    audience_type: "b2c",
    allow_mixed_languages: false,
    avoid_medical_legal: false,
    refusal_tone: "friendly",
  },
};

export function getArchetypePersona(id: ChatbotArchetypeId): PersonaProfile {
  return {
    ...defaultPersona(),
    ...archetypeProfiles[id],
    archetype_id: id,
  };
}

export function hydratePersonaFromSaved(raw: unknown): PersonaProfile {
  const base = defaultPersona();
  if (!raw || typeof raw !== "object" || !("use_case" in raw)) return base;
  const p = raw as Record<string, unknown>;
  const str = (k: string) => (typeof p[k] === "string" ? (p[k] as string) : undefined);
  const bool = (k: string) => (typeof p[k] === "boolean" ? (p[k] as boolean) : undefined);

  return {
    ...base,
    use_case: (str("use_case") as PersonaProfile["use_case"]) ?? base.use_case,
    formality: (str("formality") as PersonaProfile["formality"]) ?? base.formality,
    style: (str("style") as PersonaProfile["style"]) ?? base.style,
    reply_language: str("reply_language") ?? base.reply_language,
    channel_hint: (str("channel_hint") as PersonaProfile["channel_hint"]) ?? base.channel_hint,
    response_length: (str("response_length") as PersonaProfile["response_length"]) ?? base.response_length,
    tone_notes: str("tone_notes") ?? base.tone_notes,
    warmth: (str("warmth") as PersonaProfile["warmth"]) ?? base.warmth,
    emoji_policy: (str("emoji_policy") as PersonaProfile["emoji_policy"]) ?? base.emoji_policy,
    greeting_style: (str("greeting_style") as PersonaProfile["greeting_style"]) ?? base.greeting_style,
    audience_type: (str("audience_type") as PersonaProfile["audience_type"]) ?? base.audience_type,
    technical_level: (str("technical_level") as PersonaProfile["technical_level"]) ?? base.technical_level,
    allow_mixed_languages: bool("allow_mixed_languages") ?? base.allow_mixed_languages,
    avoid_medical_legal: bool("avoid_medical_legal") ?? base.avoid_medical_legal,
    refusal_tone: (str("refusal_tone") as PersonaProfile["refusal_tone"]) ?? base.refusal_tone,
    archetype_id: str("archetype_id") as PersonaProfile["archetype_id"],
    industry_vertical: str("industry_vertical"),
    regional_voice: str("regional_voice"),
    always_rules: str("always_rules"),
    never_rules: str("never_rules"),
    escalation_policy: str("escalation_policy"),
    knowledge_scope: str("knowledge_scope"),
  };
}
