import { baseApi } from "./baseApi";

export interface AdminWidgetConfig {
  _id: string;
  user_id: { _id: string; name: string; email: string } | string;
  name: string;
  mode: string;
  is_active: boolean;
  primary_color: string;
  api_key: string;
  allowed_domains: string[];
  conversation_count: number;
  created_at: string;
}

interface ListResponse {
  success: boolean;
  data: AdminWidgetConfig[];
  pagination: { page: number; limit: number; total: number };
}

export const adminWidgetConfigApi = baseApi
  .enhanceEndpoints({ addTagTypes: ["AdminWidgetConfig"] })
  .injectEndpoints({
    endpoints: (builder) => ({
      getAdminWidgetConfigs: builder.query<ListResponse, { page?: number; is_active?: string }>({
        query: (params) => ({ url: "/admin/widget-configs", params }),
        providesTags: ["AdminWidgetConfig"],
      }),
      updateAdminWidgetConfig: builder.mutation<{ success: boolean }, { id: string; data: Partial<AdminWidgetConfig> }>({
        query: ({ id, data }) => ({ url: `/admin/widget-configs/${id}`, method: "PUT", body: data }),
        invalidatesTags: ["AdminWidgetConfig"],
      }),
      deleteAdminWidgetConfig: builder.mutation<{ success: boolean }, string>({
        query: (id) => ({ url: `/admin/widget-configs/${id}`, method: "DELETE" }),
        invalidatesTags: ["AdminWidgetConfig"],
      }),
    }),
  });

export const {
  useGetAdminWidgetConfigsQuery,
  useUpdateAdminWidgetConfigMutation,
  useDeleteAdminWidgetConfigMutation,
} = adminWidgetConfigApi;
