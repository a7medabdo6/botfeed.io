import { baseApi } from "./baseApi";

export type FunnelStatus = "draft" | "published";

export type FunnelBlock =
  | { type: "hero"; title: string; subtitle?: string; ctaLabel?: string; ctaUrl?: string }
  | { type: "text"; body: string }
  | { type: "image"; url: string; alt?: string }
  | { type: "button"; label: string; url: string };

export type FunnelWorkspaceRef = { _id: string; slug?: string; name?: string };

export interface FunnelPageData {
  _id: string;
  user_id: string;
  public_id: string;
  slug: string;
  title: string;
  status: FunnelStatus;
  blocks: FunnelBlock[];
  whatsapp_widget_config_id: string | null;
  chatbot_widget_config_id: string | null;
  workspace_id?: string | FunnelWorkspaceRef | null;
  custom_domain?: string | null;
  ab_test_enabled?: boolean;
  ab_blocks_b?: FunnelBlock[];
  ab_traffic_a_percent?: number;
  created_at: string;
  updated_at: string;
}

export interface FunnelVersionRow {
  _id: string;
  funnel_page_id: string;
  user_id: string;
  version: number;
  snapshot: Record<string, unknown>;
  created_at: string;
}

export interface FunnelAnalyticsData {
  days: number;
  by_day: { date: string; views: number; cta_clicks: number }[];
  totals: { views: number; cta_clicks: number };
  ab_split: Record<string, number>;
}

interface ListResponse {
  success: boolean;
  data: FunnelPageData[];
}

interface SingleResponse {
  success: boolean;
  data: FunnelPageData;
}

interface VersionsResponse {
  success: boolean;
  data: FunnelVersionRow[];
}

interface AnalyticsResponse {
  success: boolean;
  data: FunnelAnalyticsData;
}

export const funnelPageApi = baseApi.enhanceEndpoints({ addTagTypes: ["FunnelPage"] }).injectEndpoints({
  endpoints: (builder) => ({
    getFunnelPages: builder.query<ListResponse, void>({
      query: () => "/funnel-pages",
      providesTags: (res) =>
        res?.data?.length
          ? [...res.data.map((f) => ({ type: "FunnelPage" as const, id: f._id })), { type: "FunnelPage", id: "LIST" }]
          : [{ type: "FunnelPage", id: "LIST" }],
    }),
    getFunnelPageById: builder.query<SingleResponse, string>({
      query: (id) => `/funnel-pages/${id}`,
      providesTags: (_r, _e, id) => [{ type: "FunnelPage", id }],
    }),
    getFunnelVersions: builder.query<VersionsResponse, string>({
      query: (id) => `/funnel-pages/${id}/versions`,
      providesTags: (_r, _e, id) => [{ type: "FunnelPage", id }],
    }),
    getFunnelAnalytics: builder.query<AnalyticsResponse, { id: string; days?: number }>({
      query: ({ id, days = 30 }) => ({ url: `/funnel-pages/${id}/analytics`, params: { days } }),
      providesTags: (_r, _e, { id }) => [{ type: "FunnelPage", id }],
    }),
    createFunnelPage: builder.mutation<
      SingleResponse,
      Partial<
        Pick<
          FunnelPageData,
          | "title"
          | "slug"
          | "blocks"
          | "whatsapp_widget_config_id"
          | "chatbot_widget_config_id"
          | "workspace_id"
          | "custom_domain"
          | "ab_test_enabled"
          | "ab_blocks_b"
          | "ab_traffic_a_percent"
        >
      >
    >({
      query: (body) => ({ url: "/funnel-pages", method: "POST", body }),
      invalidatesTags: [{ type: "FunnelPage", id: "LIST" }],
    }),
    updateFunnelPage: builder.mutation<SingleResponse, { id: string; data: Partial<FunnelPageData> }>({
      query: ({ id, data }) => ({ url: `/funnel-pages/${id}`, method: "PUT", body: data }),
      invalidatesTags: (_r, _e, { id }) => ["FunnelPage", { type: "FunnelPage", id }, { type: "FunnelPage", id: "LIST" }],
    }),
    publishFunnelPage: builder.mutation<SingleResponse, string>({
      query: (id) => ({ url: `/funnel-pages/${id}/publish`, method: "PATCH" }),
      invalidatesTags: (_r, _e, id) => ["FunnelPage", { type: "FunnelPage", id }, { type: "FunnelPage", id: "LIST" }],
    }),
    deleteFunnelPage: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({ url: `/funnel-pages/${id}`, method: "DELETE" }),
      invalidatesTags: (_r, _e, id) => ["FunnelPage", { type: "FunnelPage", id }, { type: "FunnelPage", id: "LIST" }],
    }),
  }),
});

export const {
  useGetFunnelPagesQuery,
  useGetFunnelPageByIdQuery,
  useGetFunnelVersionsQuery,
  useGetFunnelAnalyticsQuery,
  useCreateFunnelPageMutation,
  useUpdateFunnelPageMutation,
  usePublishFunnelPageMutation,
  useDeleteFunnelPageMutation,
} = funnelPageApi;
