export interface BaseNodeProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  borderColor?: string;
  handleColor?: string;
  errors?: string[];
  children: React.ReactNode;
  /** Rendered after main content, before the right (source) handle — e.g. extra target handles on an AI Agent node */
  slotAfterContent?: React.ReactNode;
  showInHandle?: boolean;
  showOutHandle?: boolean;
  headerRight?: React.ReactNode;
  className?: string;
  /** Solid header bar (e.g. flow builder “Assign Chatbot” node) */
  filledHeader?: boolean;
  /** Header color when `filledHeader` is true */
  filledHeaderTone?: "violet" | "emerald" | "sheets" | "calendar" | "sky";
}

export interface NodeFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
}