import { baseApi } from "./baseApi";

export interface WidgetConfigData {
  _id: string;
  user_id: string;
  name: string;
  mode: "whatsapp" | "chatbot" | "both";
  whatsapp_number: string;
  prefill_message: string;
  wa_style: string;
  chatbot_id: string | null;
  welcome_message: string;
  placeholder_text: string;
  escalate_to_human: boolean;
  escalate_after_messages: number;
  primary_color: string;
  position: "left" | "right";
  bubble_icon: string;
  title: string;
  subtitle: string;
  api_key: string;
  allowed_domains: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ListResponse {
  success: boolean;
  data: WidgetConfigData[];
}

interface SingleResponse {
  success: boolean;
  data: WidgetConfigData;
}

interface WebConversation {
  _id: string;
  widget_config_id: string;
  visitor_id: string;
  visitor_name: string;
  visitor_email: string;
  status: "bot" | "human" | "closed";
  assigned_agent_id: string | null;
  metadata: { user_agent: string; referrer: string; page_url: string; ip: string };
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

interface WebMessage {
  _id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  sender_type: "visitor" | "bot" | "agent";
  content: string;
  message_type: string;
  created_at: string;
}

interface ConversationsResponse {
  success: boolean;
  data: WebConversation[];
  pagination: { page: number; limit: number; total: number };
}

interface MessagesResponse {
  success: boolean;
  data: WebMessage[];
}

export const widgetConfigApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["WidgetConfig", "WebConversation"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getWidgetConfigs: builder.query<ListResponse, void>({
        query: () => "/widget-configs",
        providesTags: ["WidgetConfig"],
      }),
      getWidgetConfigById: builder.query<SingleResponse, string>({
        query: (id) => `/widget-configs/${id}`,
        providesTags: (_r, _e, id) => [{ type: "WidgetConfig", id }],
      }),
      createWidgetConfig: builder.mutation<SingleResponse, Partial<WidgetConfigData>>({
        query: (body) => ({ url: "/widget-configs", method: "POST", body }),
        invalidatesTags: ["WidgetConfig"],
      }),
      updateWidgetConfig: builder.mutation<SingleResponse, { id: string; data: Partial<WidgetConfigData> }>({
        query: ({ id, data }) => ({ url: `/widget-configs/${id}`, method: "PUT", body: data }),
        invalidatesTags: (_r, _e, { id }) => ["WidgetConfig", { type: "WidgetConfig", id }],
      }),
      deleteWidgetConfig: builder.mutation<{ success: boolean }, string>({
        query: (id) => ({ url: `/widget-configs/${id}`, method: "DELETE" }),
        invalidatesTags: ["WidgetConfig"],
      }),
      getWebConversations: builder.query<ConversationsResponse, { status?: string; widget_config_id?: string; page?: number }>({
        query: (params) => ({ url: "/widget-configs/conversations/list", params }),
        providesTags: ["WebConversation"],
      }),
      getWebConversationMessages: builder.query<MessagesResponse, { conversationId: string; page?: number }>({
        query: ({ conversationId, ...params }) => ({ url: `/widget-configs/conversations/${conversationId}/messages`, params }),
      }),
      replyToWebConversation: builder.mutation<{ success: boolean; data: WebMessage }, { conversationId: string; content: string }>({
        query: ({ conversationId, content }) => ({
          url: `/widget-configs/conversations/${conversationId}/reply`,
          method: "POST",
          body: { content },
        }),
        invalidatesTags: ["WebConversation"],
      }),
    }),
  });

export const {
  useGetWidgetConfigsQuery,
  useGetWidgetConfigByIdQuery,
  useCreateWidgetConfigMutation,
  useUpdateWidgetConfigMutation,
  useDeleteWidgetConfigMutation,
  useGetWebConversationsQuery,
  useGetWebConversationMessagesQuery,
  useReplyToWebConversationMutation,
} = widgetConfigApi;
