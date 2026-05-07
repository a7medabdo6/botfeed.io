import type { PersonaProfile } from "@/src/types/chatbot";

export const DEFAULT_PERSONA: PersonaProfile = {
  use_case: "general",
  formality: "neutral",
  warmth: "medium",
  style: "modern",
  reply_language: "English",
  allow_mixed_languages: false,
  response_length: "balanced",
  channel_hint: "both",
  audience_type: "mixed",
  industry_vertical: "",
  technical_level: "lay",
  regional_voice: "",
  greeting_style: "friendly",
  emoji_policy: "sparing",
  always_rules: "",
  never_rules: "",
  escalation_policy: "If you are unsure after two attempts on the same issue, offer to connect the customer with a human agent.",
  knowledge_scope: "",
  avoid_medical_legal: true,
  refusal_tone: "friendly",
  tone_notes: "",
};

export type ArchetypeId =
  | "formal_support"
  | "casual_retail"
  | "sales_b2b"
  | "booking_concierge"
  | "faq_self_serve"
  | "whatsapp_brief";

export const CHATBOT_ARCHETYPES: { id: ArchetypeId; labelKey: string; persona: PersonaProfile }[] = [
  {
    id: "formal_support",
    labelKey: "archetype_formal_support",
    persona: {
      ...DEFAULT_PERSONA,
      use_case: "support",
      formality: "formal",
      warmth: "medium",
      style: "classic",
      response_length: "balanced",
      channel_hint: "both",
      greeting_style: "brief",
      emoji_policy: "never",
      avoid_medical_legal: true,
      refusal_tone: "strict",
    },
  },
  {
    id: "casual_retail",
    labelKey: "archetype_casual_retail",
    persona: {
      ...DEFAULT_PERSONA,
      use_case: "sales",
      formality: "casual",
      warmth: "high",
      style: "modern",
      audience_type: "b2c",
      response_length: "short",
      channel_hint: "whatsapp",
      greeting_style: "friendly",
      emoji_policy: "ok",
    },
  },
  {
    id: "sales_b2b",
    labelKey: "archetype_sales_b2b",
    persona: {
      ...DEFAULT_PERSONA,
      use_case: "sales",
      formality: "formal",
      warmth: "low",
      style: "modern",
      audience_type: "b2b",
      technical_level: "intermediate",
      response_length: "balanced",
      channel_hint: "widget",
      emoji_policy: "never",
    },
  },
  {
    id: "booking_concierge",
    labelKey: "archetype_booking",
    persona: {
      ...DEFAULT_PERSONA,
      use_case: "booking",
      formality: "neutral",
      warmth: "high",
      style: "modern",
      response_length: "balanced",
      greeting_style: "friendly",
      escalation_policy: "For scheduling conflicts or special requests, offer a human coordinator.",
    },
  },
  {
    id: "faq_self_serve",
    labelKey: "archetype_faq",
    persona: {
      ...DEFAULT_PERSONA,
      use_case: "faq",
      formality: "neutral",
      warmth: "medium",
      style: "modern",
      response_length: "short",
      greeting_style: "minimal",
    },
  },
  {
    id: "whatsapp_brief",
    labelKey: "archetype_whatsapp_brief",
    persona: {
      ...DEFAULT_PERSONA,
      use_case: "general",
      formality: "neutral",
      warmth: "medium",
      style: "modern",
      response_length: "short",
      channel_hint: "whatsapp",
      greeting_style: "brief",
      emoji_policy: "sparing",
    },
  },
];
