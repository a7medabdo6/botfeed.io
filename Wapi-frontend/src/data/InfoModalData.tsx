export interface InfoContent {
  label: string;
  value: string;
}

export interface InfoModalItem {
  title: string;
  description: string;
  content: InfoContent[];
  externalLink?: {
    label: string;
    url: string;
    description: string;
  };
}

export const INFOMODALDATE: Record<string, InfoModalItem> = {
  webhook_configuration: {
    title: "Webhook Configuration",
    description: "Connect your WhatsApp Business Account to receive real-time updates.",
    content: [
      {
        label: "Webhook URL",
        value: "The endpoint where Meta will send notifications (messages, status updates). Use this URL in your Meta App configuration.",
      },
      {
        label: "Verification Token",
        value: "A secret string used by Meta to verify your webhook. Ensure this matches the token set in your Meta Developer portal.",
      },
      {
        label: "Webhook Subscription Fields",
        value: "Ensure you subscribe to these fields in your Meta App: account_settings_update, calls, history, messages, smb_app_state_sync, smb_message_echoes.",
      },
    ],
    externalLink: {
      label: "Meta Developer Dashboard",
      url: "https://developers.facebook.com/apps/",
      description: "Go to your Meta App > WhatsApp > Configuration to set the Webhook URL and Verification Token.",
    },
  },
  manual_connection_keys: {
    title: "Manual Connection Keys",
    description: "Essential credentials from your Meta Developer App to sync with Botfeed.",
    content: [
      {
        label: "Phone Number ID",
        value: "A unique identifier for the specific phone number you registered with Meta.",
      },
      {
        label: "WhatsApp Business ID",
        value: "The ID for your WhatsApp Business Account (WABA) found in Meta Business Manager.",
      },
      {
        label: "App ID",
        value: "The unique ID of the Meta App you created for this integration.",
      },
      {
        label: "Registered Phone Number",
        value: "The actual phone number linked to your WhatsApp Business Account.",
      },
      {
        label: "Business ID",
        value: "The identifier for your Meta Business Portfolio (Business Manager).",
      },
      {
        label: "Access Token",
        value: "A permanent System User access token with 'whatsapp_business_management' and 'whatsapp_business_messaging' permissions.",
      },
    ],
    externalLink: {
      label: "Meta App Settings",
      url: "https://developers.facebook.com/apps/",
      description: "You can find your IDs and create an Access Token in the WhatsApp section of your Meta App dashboard.",
    },
  },
  ai_intelligence: {
    title: "AI Intelligence (Gemini)",
    description: "Configure the AI brain that powers your automated conversations.",
    content: [
      {
        label: "Model Engine",
        value: "The specific Google Gemini model used for text generation. (e.g., gemini-2.0-flash-lite for speed and efficiency).",
      },
      {
        label: "AI API Key",
        value: "Your Google AI Studio or Vertex AI API key to authorize Gemini model requests.",
      },
      {
        label: "System Instructions",
        value: "Defines the AI's personality, goals, and constraints. This guides how it interacts with your customers.",
      },
      {
        label: "Knowledge Base URL",
        value: "A public URL (e.g., documentation site) that the AI can reference for specific business information.",
      },
      {
        label: "Natural Conciseness",
        value: "When enabled, it adds instructions to keep responses brief and human-like for better vocal flow.",
      },
    ],
    externalLink: {
      label: "Google AI Studio",
      url: "https://aistudio.google.com/app/apikey",
      description: "Generate and manage your Gemini API keys in the Google AI Studio dashboard.",
    },
  },
  voice_stt: {
    title: "Voice & STT (ElevenLabs)",
    description: "Set up the vocal identity and listening capabilities of your assistant.",
    content: [
      {
        label: "ElevenLabs API Key",
        value: "Your API key from ElevenLabs to enable high-quality text-to-speech synthesis.",
      },
      {
        label: "STT Provider",
        value: "The Speech-to-Text provider used to transcribe caller's voice into text for the AI to process.",
      },
      {
        label: "TTS Provider",
        value: "The Text-to-Speech provider used to convert the AI's text responses back into natural-sounding voice.",
      },
      {
        label: "Transcription",
        value: "Automatically logs all voice interactions, allowing for detailed call histories and accuracy monitoring.",
      },
    ],
    externalLink: {
      label: "ElevenLabs Developer Portal",
      url: "https://elevenlabs.io/app/developers",
      description: "Retrieve your API key from the Profile Settings > API Key section of ElevenLabs.",
    },
  },
};
