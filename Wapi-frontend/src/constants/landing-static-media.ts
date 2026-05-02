import type { FloatingImage } from "@/src/types/landingPage";

/** Served from `public/assets/images/` — always used on landing (ignores CMS image URLs). */
export const STATIC_LANDING_HERO = "/assets/images/hero-dashboard-analytics.png";
export const HERO = "/assets/images/hero-crm-chat.png";

export const STATIC_LANDING_FLOATING: { position: FloatingImage["position"]; url: string }[] = [
  { position: "left-top", url: "/assets/images/hero-messaging-floating.png" },
  { position: "right-top", url: "/assets/images/hero-templates-sync.png" },
  { position: "left-bottom", url: "/assets/images/hero-contacts-modals.png" },
  { position: "right-bottom", url: "/assets/images/hero-tasks-agents.png" },
];

const FEATURE_IMAGE_BY_TITLE: Record<string, string> = {
  "Template Library": "/assets/images/hero-templates-sync.png",
  "Chat Inbox": "/assets/images/hero-crm-chat.png",
  "AI Template Generator": "/assets/images/hero-ai-template-generator.png",
  "Agent Task Management": "/assets/images/hero-tasks-agents.png",
  "Contact Import": "/assets/images/hero-contacts-modals.png",
  "WABA Catalog Integration": "/assets/images/hero-catalogues.png",
  "Sync Templates from Meta": "/assets/images/hero-templates-sync.png",
  "E-commerce Webhooks": "/assets/images/hero-webhooks.png",
  "Performance Analytics": "/assets/images/hero-dashboard-analytics.png",
};

const FEATURE_FALLBACK_CYCLE = [
  "/assets/images/hero-crm-chat.png",
  "/assets/images/hero-messaging-floating.png",
  "/assets/images/hero-contacts-modals.png",
  "/assets/images/hero-webhooks.png",
];

export function getStaticFeatureImage(title: string, featureIndex: number): string {
  return FEATURE_IMAGE_BY_TITLE[title] ?? FEATURE_FALLBACK_CYCLE[featureIndex % FEATURE_FALLBACK_CYCLE.length];
}

const PLATFORM_STEP_IMAGES = [
  "/assets/images/hero-messaging-floating.png",
  "/assets/images/hero-dashboard-analytics.png",
  "/assets/images/hero-catalogues.png",
  "/assets/images/hero-templates-sync.png",
  "/assets/images/hero-webhooks.png",
];

export function getStaticPlatformImage(stepIndex: number): string {
  return PLATFORM_STEP_IMAGES[Math.min(stepIndex, PLATFORM_STEP_IMAGES.length - 1)] ?? PLATFORM_STEP_IMAGES[0];
}
