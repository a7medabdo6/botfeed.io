import { WabaSetupStep } from "../types/whatsapp";

export const WABA_SETUP_STEPS: WabaSetupStep[] = [
  {
    id: "step1",
    iconName: "Phone",
    title: "Register a Business Phone Number",
    description: "Use a valid phone number that is NOT currently connected to another WhatsApp account. This number will be registered under your Meta Business Manager for WhatsApp messaging.",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    id: "step2",
    iconName: "AppWindow",
    title: "Create & Configure a Meta App",
    description: "Log in to Meta for Developers and create a new Business App. Add the WhatsApp product, link your Business Manager account, and ensure your app is set to LIVE mode.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "step3",
    iconName: "Key",
    title: "Generate Permanent Access Token",
    description: "Create a System User in Business Manager, assign WhatsApp permissions, and generate a permanent access token. You will need this token to connect with Botfeed.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "step4",
    iconName: "Webhook",
    title: "Configure Webhook URL",
    description: "To receive real-time messages and status updates, add your Webhook URL, set a secure Verification Token, and subscribe to message events in your Meta App settings.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "step5",
    iconName: "CheckCircle2",
    title: "Verify & Test Connection",
    description: "After entering all required credentials, save your configuration and send a test message to confirm validation and check connection status.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
];
