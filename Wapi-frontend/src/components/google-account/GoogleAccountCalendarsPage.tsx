/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Can from "@/src/components/shared/Can";
import { Button } from "@/src/elements/ui/button";
import { Switch } from "@/src/elements/ui/switch";
import { useDeleteGoogleCalendarMutation, useGetGoogleCalendarsQuery, useLinkGoogleCalendarMutation, type GoogleCalendarRow } from "@/src/redux/api/googleApi";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { DataTable } from "@/src/shared/DataTable";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const GoogleAccountCalendarsPage = () => {
  const params = useParams();
  const router = useRouter();
  const accountId = typeof params?.accountId === "string" ? params.accountId : "";
  const { data, isLoading, refetch, isFetching } = useGetGoogleCalendarsQuery(accountId, { skip: !accountId });
  const [linkCal] = useLinkGoogleCalendarMutation();
  const [deleteCal, { isLoading: isDeleting }] = useDeleteGoogleCalendarMutation();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const calendars = data?.calendars ?? [];

  const handleLinked = async (row: GoogleCalendarRow, checked: boolean) => {
    try {
      await linkCal({ id: row._id, is_linked: checked }).unwrap();
      toast.success(checked ? "Calendar linked." : "Calendar unlinked.");
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || "Update failed.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCal(deleteId).unwrap();
      toast.success("Calendar removed.");
      setDeleteId(null);
      refetch();
    } catch (e: any) {
      toast.error(e?.data?.message || "Delete failed.");
    }
  };

  const columns: any[] = [
    { header: "Name", accessorKey: "name" as const, sortable: true, sortKey: "name" },
    {
      header: "Linked",
      sortable: true,
      sortKey: "is_linked",
      cell: (row: GoogleCalendarRow) => (
        <Can permission="view.waba_configuration">
          <Switch checked={!!row.is_linked} onCheckedChange={(v) => handleLinked(row, v)} />
        </Can>
      ),
    },
    {
      header: "Calendar ID",
      accessorKey: "calendar_id" as const,
      className: "max-w-xs truncate",
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row: GoogleCalendarRow) => (
        <div className="flex justify-end">
          <Can permission="view.waba_configuration">
            <Button variant="outline" size="icon" className="h-9 w-9 border-none text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete" onClick={() => setDeleteId(row._id)}>
              <Trash2 size={15} />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="sm:p-8 p-4 space-y-8">
      <CommonHeader
        backBtn
        title="Google Calendars"
        description="Calendars for this connected account. Sync pulls the latest list from Google."
        onRefresh={() => refetch()}
        isLoading={isLoading}
      />

      <DataTable<GoogleCalendarRow>
        data={calendars}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No calendars found. Use Refresh to sync from Google."
        getRowId={(r) => r._id}
        isFetching={isFetching}
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.push("/google_account")}>
          Back to accounts
        </Button>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete calendar"
        subtitle="This removes the calendar from Google and clears it in Wapi for this account."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default GoogleAccountCalendarsPage;
