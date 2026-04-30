/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/elements/ui/button";
import { Switch } from "@/src/elements/ui/switch";
import { useDeleteTeamsMutation, useGetTeamsQuery, useToggleTeamStatusMutation } from "@/src/redux/api/teamApi";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { DataTable } from "@/src/shared/DataTable";
import { Team } from "@/src/types/components";
import { Column } from "@/src/types/shared";
import { formatDate } from "@/src/utils";
import { Edit2, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Can from "@/src/components/shared/Can";

const TeamList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSortChange = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
  };

  const initialColumns = [
    { id: "Team Info", label: "Team Info", isVisible: true },
    { id: "Note", label: "Note", isVisible: true },
    { id: "Status", label: "Status", isVisible: true },
    { id: "Created", label: "Created", isVisible: true },
    { id: "Actions", label: "Actions", isVisible: true },
  ];

  const [visibleColumns, setVisibleColumns] = useState(initialColumns);

  const handleColumnToggle = (columnId: string) => {
    setVisibleColumns((prev) => prev.map((col) => (col.id === columnId ? { ...col, isVisible: !col.isVisible } : col)));
  };

  const {
    data: teamsResult,
    isLoading,
    refetch,
    isFetching,
  } = useGetTeamsQuery({
    page,
    limit,
    search: searchTerm,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const [toggleTeamStatus, { isLoading: isStatusUpdating }] = useToggleTeamStatusMutation();
  const [deleteTeams, { isLoading: isDeleting }] = useDeleteTeamsMutation();

  const teams: Team[] = teamsResult?.data?.teams || [];
  const totalCount = teamsResult?.data?.pagination?.totalItems || 0;

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    try {
      await toggleTeamStatus(id).unwrap();
      toast.success(`Team ${currentStatus === "active" ? "deactivated" : "activated"} successfully`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteTeams([deleteId]).unwrap();
        toast.success("Team deleted successfully");
        setDeleteId(null);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete team");
      }
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await deleteTeams(selectedIds).unwrap();
      toast.success(`${selectedIds.length} teams deleted successfully`);
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete teams");
    } finally {
      setBulkConfirmOpen(false);
    }
  };

  const columns: Column<Team>[] = [
    {
      header: "Team Info",
      sortable: true,
      sortKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 dark:bg-(--page-body-bg) dark:border-none flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
            <Users size={22} />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-700 dark:text-white text-base">{row.name}</span>
            <span className="text-xs text-slate-500 font-medium line-clamp-1">{row.description || "No description provided"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Note",
      cell: (row) => <span className="text-slate-500 dark:text-slate-300 font-medium py-0.5 rounded-md line-clamp-1 max-w-55">{row.description || "-"}</span>,
    },
    {
      header: "Status",
      sortable: true,
      sortKey: "status",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Switch checked={row.status === "active"} onCheckedChange={() => handleStatusToggle(row._id, row.status)} disabled={isStatusUpdating} className="data-[state=checked]:bg-primary shadow-xs" />
        </div>
      ),
    },
    {
      header: "Created",
      sortable: true,
      sortKey: "created_at",
      cell: (row) => (
        <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
          <span className="dark:text-gray-400">{formatDate(row.created_at)}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex justify-end gap-3">
          <Can permission="update.teams">
            <Button variant="outline" size="icon" className="w-10 h-10 border-none text-slate-400 hover:text-primary hover:bg-sky-50 rounded-lg dark:hover:bg-primary/20 transition-all" onClick={() => router.push(`/teams/${row._id}/edit`)}>
              <Edit2 size={16} />
            </Button>
          </Can>
          <Can permission="delete.teams">
            <Button variant="outline" size="icon" className="w-10 h-10 text-slate-400 hover:text-red-600 dark:text-red-500 hover:bg-red-50 rounded-lg transition-all dark:hover:bg-red-900/20 border-none" onClick={() => setDeleteId(row._id)}>
              <Trash2 size={16} />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="sm:p-8 p-4 space-y-8 min-h-screen bg-slate-50/30 dark:bg-transparent animate-in fade-in duration-500">
      <CommonHeader
        title="Teams Management"
        description="Organize your agents into teams and assign granular permissions for efficient collaboration."
        onSearch={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        searchTerm={searchTerm}
        searchPlaceholder="Find teams by name or description..."
        onRefresh={() => {
          refetch();
          toast.success("Teams synced");
        }}
        onAddClick={() => router.push("/teams/create")}
        addLabel="Add New Team"
        addPermission="create.teams"
        deletePermission="delete.teams"
        isLoading={isLoading}
        columns={visibleColumns}
        onColumnToggle={handleColumnToggle}
        onBulkDelete={() => setBulkConfirmOpen(true)}
        selectedCount={selectedIds.length}
      />

      <div className="bg-white dark:bg-(--card-color) rounded-lg mt-8 border border-slate-200/60 dark:border-(--card-border-color) shadow-sm overflow-hidden">
        <DataTable data={teams} columns={columns.filter((col) => visibleColumns.find((vc) => vc.id === col.header)?.isVisible !== false)} isLoading={isLoading} isFetching={isFetching || isDeleting} totalCount={totalCount} page={page} limit={limit} onPageChange={setPage} onLimitChange={setLimit} enableSelection={true} selectedIds={selectedIds} onSelectionChange={setSelectedIds} getRowId={(item) => item._id} emptyMessage={searchTerm ? `No teams found matching "${searchTerm}"` : "No teams created yet. Start by defining your first team!"} className="border-none shadow-none rounded-none" onSortChange={handleSortChange} />
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Remove Team?" subtitle="This action will delete the team. Agents assigned to this team will lose their team-specific permissions. This cannot be undone." confirmText="Yes, remove team" variant="danger" />

      <ConfirmModal isOpen={bulkConfirmOpen} onClose={() => setBulkConfirmOpen(false)} onConfirm={confirmBulkDelete} isLoading={isDeleting} title="Delete Selected Teams?" subtitle={`You are about to permanently delete ${selectedIds.length} teams. All associated team permissions will be removed. Confirm to proceed?`} confirmText="Delete selected" variant="danger" />
    </div>
  );
};

export default TeamList;
