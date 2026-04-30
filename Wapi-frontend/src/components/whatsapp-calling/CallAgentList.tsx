/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Can from "@/src/components/shared/Can";
import { Badge } from "@/src/elements/ui/badge";
import { Button } from "@/src/elements/ui/button";
import { Switch } from "@/src/elements/ui/switch";
import { useDeleteCallAgentsMutation, useGetCallAgentsQuery, useUpdateCallAgentMutation } from "@/src/redux/api/whatsappCallingApi";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { DataTable } from "@/src/shared/DataTable";
import { Column } from "@/src/types/shared";
import { WhatsappCallAgent } from "@/src/types/whatsappCalling";
import { formatDate } from "@/src/utils";
import { Bot, Edit2, History, Mic, Settings2, Trash2, UserPlus } from "lucide-react";
import BulkAssignAgentModal from "./BulkAssignAgentModal";
import CallSettingsModal from "./CallSettingsModal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CallAgentList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [bulkAssignAgent, setBulkAssignAgent] = useState<{ id: string; name: string } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState([
    { id: "Agent Name", label: "Agent Name", isVisible: true },
    { id: "AI Model", label: "AI Model", isVisible: true },
    { id: "Voice config", label: "Voice config", isVisible: true },
    { id: "Status", label: "Status", isVisible: true },
    { id: "Created", label: "Created", isVisible: true },
    { id: "Actions", label: "Actions", isVisible: true },
  ]);

  const {
    data: agentsResult,
    isLoading,
    refetch,
    isFetching,
  } = useGetCallAgentsQuery({
    page,
    limit,
    search: searchTerm,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const [updateCallAgent, { isLoading: isStatusUpdating }] = useUpdateCallAgentMutation();
  const [deleteCallAgents, { isLoading: isDeleting }] = useDeleteCallAgentsMutation();

  const agents: WhatsappCallAgent[] = agentsResult?.data || [];
  const totalCount = agentsResult?.pagination?.totalItems || agentsResult?.total || agents.length;

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      await updateCallAgent({ id, body: { is_active: !currentStatus } }).unwrap();
      toast.success(`Agent ${!currentStatus ? "activated" : "deactivated"} successfully`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteCallAgents([deleteId]).unwrap();
        toast.success("Agent deleted successfully");
        setDeleteId(null);
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete agent");
      }
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await deleteCallAgents(selectedIds).unwrap();
      toast.success(`${selectedIds.length} agents deleted successfully`);
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete agents");
    } finally {
      setBulkConfirmOpen(false);
    }
  };

  const columns: Column<WhatsappCallAgent>[] = [
    {
      header: "Agent Name",
      sortable: true,
      sortKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
            <Bot size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700 dark:text-white">{row.name}</span>
            <span className="text-xs text-slate-500 line-clamp-1">{row.welcome_message}</span>
          </div>
        </div>
      ),
    },
    {
      header: "AI Model",
      cell: (row) => {
        const populated = row.ai_config?.ai_model;
        const label =
          populated && typeof populated === "object"
            ? `${populated.display_name || populated.model_id} (${populated.provider || "?"})`
            : row.ai_config?.model_id || "—";
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 max-w-[220px] truncate">
            {label}
          </Badge>
        );
      },
    },
    {
      header: "Voice config",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 italic">
            <Mic size={12} /> {row.voice_config.stt_provider}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 italic">
            <Bot size={12} /> {row.voice_config.tts_provider}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      sortable: true,
      sortKey: "is_active",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Switch checked={row.is_active} onCheckedChange={() => handleStatusToggle(row._id, row.is_active)} disabled={isStatusUpdating} />
        </div>
      ),
    },
    {
      header: "Created",
      sortable: true,
      sortKey: "created_at",
      cell: (row) => <span className="text-slate-500 text-sm">{formatDate(row.created_at)}</span>,
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 hover:text-primary hover:bg-primary/5 border-none" onClick={() => router.push(`/whatsapp_calling/logs?agentId=${row._id}`)} title="Call Recording History">
            <History size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border-none"
            onClick={() => {
              setBulkAssignAgent({ id: row._id, name: row.name });
              setIsBulkAssignOpen(true);
            }}
            title="Bulk Assign to Contacts/Tags"
          >
            <UserPlus size={16} />
          </Button>
          <Can permission="update.whatsapp_calling">
            <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border-none" onClick={() => router.push(`/whatsapp_calling/agents/edit/${row._id}`)}>
              <Edit2 size={16} />
            </Button>
          </Can>
          <Can permission="delete.whatsapp_calling">
            <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50 border-none" onClick={() => setDeleteId(row._id)}>
              <Trash2 size={16} />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      <CommonHeader
        title="AI Call Agents"
        description="Configure intelligent voice assistants to manage your WhatsApp calls with natural AI responses."
        onSearch={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        searchTerm={searchTerm}
        searchPlaceholder="Search agents by name..."
        onRefresh={refetch}
        onAddClick={() => router.push("/whatsapp_calling/agents/create")}
        addLabel="Create Call Agent"
        addPermission="create.whatsapp_calling"
        rightContent={
          <Can permission="update.whatsapp_calling">
            <Button variant="outline" onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2.5 px-4.5! py-5 bg-white dark:bg-(--card-color) border-slate-200 dark:border-(--card-border-color) h-12 rounded-lg font-bold transition-all active:scale-95 group shadow-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-(--table-hover)">
              <Settings2 className="w-5 h-5 transition-transform group-hover:rotate-45" />
              <span className="inline">Call Settings</span>
            </Button>
          </Can>
        }
        deletePermission="delete.whatsapp_calling"
        isLoading={isLoading}
        columns={visibleColumns}
        onColumnToggle={(id) => setVisibleColumns((prev) => prev.map((col) => (col.id === id ? { ...col, isVisible: !col.isVisible } : col)))}
        onBulkDelete={() => setBulkConfirmOpen(true)}
        selectedCount={selectedIds.length}
      />

      <div className="bg-white dark:bg-(--card-color) rounded-xl border border-slate-200/60 dark:border-(--card-border-color) shadow-sm overflow-hidden mt-8">
        <DataTable
          data={agents}
          columns={columns.filter((col) => visibleColumns.find((vc) => vc.id === col.header)?.isVisible !== false)}
          isLoading={isLoading}
          isFetching={isFetching || isDeleting}
          totalCount={totalCount}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          enableSelection={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          getRowId={(item) => item._id}
          emptyMessage={searchTerm ? `No agents found matching "${searchTerm}"` : "No AI call agents configured. Start by creating one!"}
          onSortChange={(key, order) => {
            setSortBy(key);
            setSortOrder(order);
            setPage(1);
          }}
        />
      </div>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} isLoading={isDeleting} title="Delete Call Agent?" subtitle="This will permanently delete the agent. You won't be able to recover it." confirmText="Delete Agent" variant="danger" />

      <ConfirmModal isOpen={bulkConfirmOpen} onClose={() => setBulkConfirmOpen(false)} onConfirm={confirmBulkDelete} isLoading={isDeleting} title="Bulk Delete Agents?" subtitle={`You are about to delete ${selectedIds.length} call agents. This action cannot be undone.`} confirmText="Delete Selected" variant="danger" />

      {bulkAssignAgent && <BulkAssignAgentModal isOpen={isBulkAssignOpen} onClose={() => setIsBulkAssignOpen(false)} agentId={bulkAssignAgent.id} agentName={bulkAssignAgent.name} />}

      <CallSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default CallAgentList;
