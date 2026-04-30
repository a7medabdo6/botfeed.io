import { baseApi } from "./baseApi";

export type GoogleAccountRow = {
  _id: string;
  email: string;
  status: string;
  created_at: string;
};

export const googleApi = baseApi.enhanceEndpoints({ addTagTypes: ["GoogleAccounts", "GoogleCalendars"] }).injectEndpoints({
  endpoints: (builder) => ({
    getGoogleAuthUrl: builder.query<{ success: boolean; url?: string; message?: string }, void>({
      query: () => "/google/connect",
    }),
    getGoogleAccounts: builder.query<{ success: boolean; accounts?: GoogleAccountRow[]; message?: string }, void>({
      query: () => "/google/accounts",
      providesTags: ["GoogleAccounts"],
    }),
    disconnectGoogleAccount: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/google/accounts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GoogleAccounts", "GoogleCalendars"],
    }),
    syncGoogleCalendars: builder.mutation<{ success: boolean; calendars?: unknown[]; message?: string }, string>({
      query: (googleAccountId) => ({
        url: `/google/accounts/${googleAccountId}/calendars`,
        method: "GET",
      }),
      invalidatesTags: ["GoogleCalendars", "GoogleAccounts"],
    }),
    getGoogleCalendars: builder.query<{ success: boolean; calendars?: GoogleCalendarRow[]; message?: string }, string>({
      query: (googleAccountId) => `/google/accounts/${googleAccountId}/calendars`,
      providesTags: (_r, _e, googleAccountId) => [{ type: "GoogleCalendars", id: googleAccountId }],
    }),
    linkGoogleCalendar: builder.mutation<{ success: boolean; calendar?: GoogleCalendarRow; message?: string }, { id: string; is_linked: boolean }>({
      query: ({ id, is_linked }) => ({
        url: `/google/calendars/${id}/link`,
        method: "PUT",
        body: { is_linked },
      }),
      invalidatesTags: ["GoogleCalendars"],
    }),
    deleteGoogleCalendar: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `/google/calendars/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["GoogleCalendars"],
    }),
  }),
});

export type GoogleCalendarRow = {
  _id: string;
  google_account_id: string;
  calendar_id: string;
  name: string;
  is_linked?: boolean;
  created_at?: string;
};

export const {
  useGetGoogleAuthUrlQuery,
  useLazyGetGoogleAuthUrlQuery,
  useGetGoogleAccountsQuery,
  useDisconnectGoogleAccountMutation,
  useSyncGoogleCalendarsMutation,
  useGetGoogleCalendarsQuery,
  useLinkGoogleCalendarMutation,
  useDeleteGoogleCalendarMutation,
} = googleApi;
