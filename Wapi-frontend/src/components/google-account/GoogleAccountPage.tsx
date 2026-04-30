/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Can from "@/src/components/shared/Can";
import { Badge } from "@/src/elements/ui/badge";
import { Button } from "@/src/elements/ui/button";
import {
  useDisconnectGoogleAccountMutation,
  useGetGoogleAccountsQuery,
  useLazyGetGoogleAuthUrlQuery,
  useSyncGoogleCalendarsMutation,
  type GoogleAccountRow,
} from "@/src/redux/api/googleApi";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { DataTable } from "@/src/shared/DataTable";
import { formatDate } from "@/src/utils";
import { Calendar, Link2, Loader2, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const COLUMN_DEFS = [
  { id: "email", label: "Email" },
  { id: "status", label: "Status" },
  { id: "created_at", label: "Created At" },
  { id: "actions", label: "Actions" },
] as const;

const GoogleAccountPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<keyof GoogleAccountRow | "email">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    email: true,
    status: true,
    created_at: true,
    actions: true,
  });
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetGoogleAccountsQuery();
  const [fetchAuthUrl, { isFetching: isConnecting }] = useLazyGetGoogleAuthUrlQuery();
  const [disconnect, { isLoading: isDisconnecting }] = useDisconnectGoogleAccountMutation();
  const [syncCalendars] = useSyncGoogleCalendarsMutation();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    const success = searchParams.get("success");
    const message = searchParams.get("message");
    if (success === "true") {
      toast.success("Google account connected successfully.");
      refetch();
      router.replace("/google_account");
    } else if (success === "false") {
      toast.error(message ? decodeURIComponent(message) : "Google connection failed.");
      router.replace("/google_account");
    }
  }, [searchParams, refetch, router]);

  const accounts = data?.accounts ?? [];

  const processed = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = q ? accounts.filter((a) => a.email?.toLowerCase().includes(q)) : [...accounts];
    rows.sort((a, b) => {
      const av = a[sortBy as keyof GoogleAccountRow] ?? "";
      const bv = b[sortBy as keyof GoogleAccountRow] ?? "";
      if (sortBy === "created_at") {
        const ta = new Date(String(av)).getTime();
        const tb = new Date(String(bv)).getTime();
        return sortOrder === "asc" ? ta - tb : tb - ta;
      }
      const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: "base" });
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [accounts, search, sortBy, sortOrder]);

  const totalCount = processed.length;
  const pageRows = useMemo(() => {
    const start = (page - 1) * limit;
    return processed.slice(start, start + limit);
  }, [processed, page, limit]);

  const handleSortChange = (key: string, order: "asc" | "desc") => {
    setSortBy(key as keyof GoogleAccountRow);
    setSortOrder(order);
    setPage(1);
  };

  const handleConnect = useCallback(async () => {
    try {
      const res = await fetchAuthUrl().unwrap();
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        toast.error(res.message || "Could not start Google sign-in.");
      }
    } catch {
      toast.error("Could not start Google sign-in.");
    }
  }, [fetchAuthUrl]);

  const handleSyncRow = async (id: string) => {
    setSyncingId(id);
    try {
      await syncCalendars(id).unwrap();
      toast.success("Calendars synced from Google.");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || "Sync failed.");
    } finally {
      setSyncingId(null);
    }
  };

  const confirmDisconnect = async () => {
    if (!confirmId) return;
    try {
      await disconnect(confirmId).unwrap();
      toast.success("Google account disconnected.");
      setConfirmId(null);
    } catch {
      toast.error("Failed to disconnect.");
    }
  };

  const headerColumns = COLUMN_DEFS.map((c) => ({
    id: c.id,
    label: c.label,
    isVisible: visibleColumns[c.id] ?? true,
  }));

  const toggleColumn = (id: string) => {
    setVisibleColumns((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const stillVisible = COLUMN_DEFS.filter((c) => next[c.id]).length;
      if (stillVisible === 0) return prev;
      return next;
    });
  };

  const buildTableColumns = (): any[] => {
    const cols: any[] = [];
    if (visibleColumns.email) {
      cols.push({
        header: "email",
        accessorKey: "email",
        sortable: true,
        sortKey: "email",
      });
    }
    if (visibleColumns.status) {
      cols.push({
        header: "Status",
        accessorKey: "status",
        sortable: true,
        sortKey: "status",
        cell: (item: GoogleAccountRow) => (
          <Badge variant={item.status === "active" ? "default" : "secondary"} className="capitalize font-medium">
            {item.status || "—"}
          </Badge>
        ),
      });
    }
    if (visibleColumns.created_at) {
      cols.push({
        header: "Created At",
        sortable: true,
        sortKey: "created_at",
        cell: (item: GoogleAccountRow) => formatDate(item.created_at),
      });
    }
    if (visibleColumns.actions) {
      cols.push({
        header: "Actions",
        className: "text-right",
        cell: (item: GoogleAccountRow) => (
          <div className="flex justify-end gap-1">
            <Button variant="outline" size="icon" className="h-9 w-9 border-none text-slate-400 hover:text-primary hover:bg-sky-50 rounded-lg" asChild title="Calendars">
              <Link href={`/google_account/${item._id}`}>
                <Calendar size={15} />
              </Link>
            </Button>
            <Can permission="view.waba_configuration">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-none text-slate-400 hover:text-primary hover:bg-sky-50 rounded-lg"
                title="Sync calendars"
                disabled={!!syncingId}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSyncRow(item._id);
                }}
              >
                <RefreshCw size={15} className={syncingId === item._id ? "animate-spin" : ""} />
              </Button>
            </Can>
            <Can permission="view.waba_configuration">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-none text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Remove"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmId(item._id);
                }}
              >
                <Trash2 size={15} />
              </Button>
            </Can>
          </div>
        ),
      });
    }
    return cols;
  };

  const tableColumns = buildTableColumns();

  return (
    <div className="sm:p-8 p-4 space-y-8">
      <CommonHeader
        title="Google Account"
        description="Connect your Google account to access your Google Calendar and Google Meet."
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchTerm={search}
        searchPlaceholder="Search by email..."
        onRefresh={() => refetch()}
        isLoading={isLoading || isFetching}
        columns={headerColumns}
        onColumnToggle={toggleColumn}
        rightContent={
          <Can permission="view.waba_configuration">
            <Button onClick={handleConnect} disabled={isConnecting} className="flex items-center gap-2.5 px-4.5 py-5 bg-primary text-white h-12 rounded-lg font-medium cursor-pointer transition-all active:scale-95">
              {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link2 className="w-5 h-5" />}
              <span>Connect Google Account</span>
            </Button>
          </Can>
        }
      />

      <DataTable<GoogleAccountRow>
        data={pageRows}
        columns={tableColumns}
        isLoading={isLoading}
        emptyMessage="No connected google accounts found."
        getRowId={(item) => item._id}
        totalCount={totalCount}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        isFetching={isFetching}
        onSortChange={handleSortChange}
      />

      <ConfirmModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={confirmDisconnect}
        isLoading={isDisconnecting}
        title="Disconnect Google account"
        subtitle="This removes the link in Botfeed. Calendars stored for this account will be marked disconnected."
        confirmText="Disconnect"
        variant="danger"
      />
    </div>
  );
};

export default GoogleAccountPage;
