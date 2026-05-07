/* eslint-disable @typescript-eslint/no-explicit-any */

export type TrainingDataType = "text" | "q&a" | "website_url" | "document";

export interface ChatbotTrainingItem {
  question: string;
  answer: string;
  context?: string;
}

export type PersonaUseCase = "support" | "sales" | "booking" | "faq" | "lead_capture" | "general";
export type PersonaFormality = "casual" | "neutral" | "formal";
export type PersonaStyle = "classic" | "modern";
export type PersonaLength = "short" | "balanced" | "detailed";
export type PersonaChannel = "whatsapp" | "widget" | "both";
export type PersonaAudience = "b2c" | "b2b" | "mixed";
export type PersonaTechnicalLevel = "lay" | "intermediate" | "technical";
export type PersonaGreeting = "brief" | "friendly" | "minimal";
export type PersonaEmoji = "never" | "sparing" | "ok";
export type PersonaRefusal = "strict" | "friendly";
export type PersonaWarmth = "low" | "medium" | "high";

export interface PersonaProfile {
  use_case?: PersonaUseCase;
  formality?: PersonaFormality;
  warmth?: PersonaWarmth;
  style?: PersonaStyle;
  reply_language?: string;
  allow_mixed_languages?: boolean;
  response_length?: PersonaLength;
  channel_hint?: PersonaChannel;
  audience_type?: PersonaAudience;
  industry_vertical?: string;
  technical_level?: PersonaTechnicalLevel;
  regional_voice?: string;
  greeting_style?: PersonaGreeting;
  emoji_policy?: PersonaEmoji;
  always_rules?: string;
  never_rules?: string;
  escalation_policy?: string;
  knowledge_scope?: string;
  avoid_medical_legal?: boolean;
  refusal_tone?: PersonaRefusal;
  tone_notes?: string;
  archetype_id?: string;
}

export interface Chatbot {
  _id: string;
  waba_id: string;
  name: string;
  ai_model: any;
  api_key: string;
  business_name?: string;
  business_description?: string;
  training_data?: ChatbotTrainingItem[];
  raw_training_text?: string;
  system_prompt?: string;
  persona_profile?: PersonaProfile | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface ChatbotCreatePayload {
  waba_id: string;
  name: string;
  ai_model: string;
  api_key: string;
  business_name?: string;
  business_description?: string;
  persona_profile?: PersonaProfile | null;
  system_prompt?: string;
  use_custom_system_prompt?: boolean;
}

export interface ChatbotPreviewPromptPayload {
  business_name?: string;
  business_description?: string;
  persona_profile?: PersonaProfile | null;
  training_data?: ChatbotTrainingItem[];
  raw_training_text?: string;
}

export interface ChatbotTrainPayload {
  business_name?: string;
  business_description?: string;
  training_data?: ChatbotTrainingItem[];
  raw_training_text?: string;
  knowledgeType?: TrainingDataType;
}

export interface ChatbotResponse {
  success: boolean;
  message?: string;
  data: Chatbot;
}

export interface ChatbotsResponse {
  success: boolean;
  data: Chatbot[];
}

export interface ChatbotPreviewPromptResponse {
  success: boolean;
  data: { system_prompt: string };
}
