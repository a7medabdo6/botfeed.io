/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/src/elements/ui/badge";
import { Button } from "@/src/elements/ui/button";
import { useDeleteFormMutation, useGetFormsQuery, usePublishFormMutation, useSyncFlowsStatusMutation } from "@/src/redux/api/formBuilderApi";
import { RootState } from "@/src/redux/store";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { DataTable } from "@/src/shared/DataTable";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import SyncMetaFlowModal from "./SyncMetaFlowModal";
import Can from "../shared/Can";
import { usePermissions } from "@/src/hooks/usePermissions";
import { ClipboardList, Edit2, RefreshCw, Rocket, Trash2 } from "lucide-react";

const FormBuilderList = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const selectedWorkspace = useSelector((state: RootState) => state.workspace.selectedWorkspace);
  const { hasPermission } = usePermissions();

  const {
    data: formsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetFormsQuery(
    {
      page,
      limit,
      search: searchTerm,
      waba_id: selectedWorkspace?.waba_id,
    },
    { skip: !selectedWorkspace?.waba_id }
  );

  const [deleteForm, { isLoading: isDeleting }] = useDeleteFormMutation();
  const [publishForm, { isLoading: isPublishing }] = usePublishFormMutation();
  const [syncStatus, { isLoading: isSyncingStatus }] = useSyncFlowsStatusMutation();

  const handleDelete = (id: string) => {
    setIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!idToDelete) return;
    try {
      await deleteForm(idToDelete).unwrap();
      toast.success("Form deleted successfully");
      setIsDeleteModalOpen(false);
      setIdToDelete(null);
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to delete form");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response: any = await publishForm(id).unwrap();
      toast.success(response?.data?.message || "Form published to Meta successfully");
    } catch (error: any) {
      console.log(error);
      toast.error(error?.data?.error || "Failed to publish form");
    }
  };
  const handleSyncStatus = async () => {
    if (!selectedWorkspace?.waba_id) return;
    try {
      await syncStatus({ waba_id: selectedWorkspace.waba_id }).unwrap();
      toast.success("Flows status synced successfully");
    } catch (error: any) {
      toast.error(error?.data?.error || "Failed to sync status");
    }
  };

  const columns = [
    {
      header: "Form Name",
      accessorKey: "name",
      sortable: true,
      copyable: true,
      copyValue: "name",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row: any) => (
        <Badge variant="outline" className="bg-slate-50 dark:bg-(--dark-body) text-[10px] font-bold">
          {row.category?.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => {
        const status = row.meta_status || row.status;
        return (
          <Badge variant={status === "published" ? "default" : status === "draft" ? "secondary" : "default"} className="capitalize text-[10px]">
            {status?.toLowerCase()}
          </Badge>
        );
      },
    },
    {
      header: "Submissions",
      accessorKey: "stats.submissions",
      cell: (row: any) => <span className="font-mono">{row.stats?.submissions || 0}</span>,
    },
    {
      header: "Actions",
      id: "actions",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Can permission="update.form_builder">
            <Button variant="outline" size="icon" title="Edit Form" className="h-9 w-9 text-slate-500 hover:text-sky-600 hover:bg-sky-50 border-none" onClick={() => router.push(`/form_builder/${row._id}/edit`)}>
              <Edit2 size={16} />
            </Button>

            <Button variant="outline" size="icon" title="Publish to Meta" className="h-9 w-9 text-slate-500 hover:text-sky-600 hover:bg-sky-50 border-none" onClick={() => handlePublish(row._id)} disabled={row?.meta_status.toLowerCase() == "published" || row?.meta_status.toLowerCase() == "deprecated" || isPublishing}>
              <Rocket size={16} />
            </Button>

            <Button variant="outline" size="icon" title="View Submissions" className="h-9 w-9 text-slate-500 hover:text-blue-600 hover:bg-blue-50 border-none" onClick={() => router.push(`/form_builder/${row._id}/submissions`)}>
              <ClipboardList size={16} />
            </Button>
          </Can>

          <Can permission="delete.form_builder">
            <Button variant="outline" size="icon" title="Delete Form" className="h-9 w-9 text-slate-500 hover:text-red-600 hover:bg-red-50 border-none" onClick={() => handleDelete(row._id)} disabled={isDeleting}>
              <Trash2 size={16} />
            </Button>
          </Can>
        </div>
      ),
    },
  ].filter(col => col.id !== "actions" || (hasPermission("update.form_builder") || hasPermission("delete.form_builder")));

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      <CommonHeader
        title="Form Builder"
        description="Design multi-step forms and Meta Flows for WhatsApp"
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search forms..."
        onRefresh={refetch}
        onSyncStatus={handleSyncStatus}
        isSyncingStatus={isSyncingStatus}
        onAddClick={() => router.push("/form_builder/create")}
        addLabel="New Form"
        addPermission="create.form_builder"
        syncStatusPermission="update.form_builder"
        rightContent={
          <Can permission="update.form_builder">
            <Button variant="outline" className="flex items-center gap-2.5 px-4.5! py-5 bg-white dark:bg-(--card-color) border-slate-200 dark:border-(--card-border-color) h-12 rounded-lg font-bold transition-all active:scale-95 group shadow-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-(--table-hover)" onClick={() => setIsSyncModalOpen(true)}>
              <RefreshCw size={18} className="transition-transform group-hover:rotate-180" />
              <span>Sync Meta Flows</span>
            </Button>
          </Can>
        }
        selectedCount={0}
      />

      <div className="bg-white dark:bg-(--card-color) rounded-xl border border-slate-200/60 dark:border-(--card-border-color) shadow-sm overflow-hidden mt-8">
        <DataTable columns={columns as any} data={formsData?.data || []} isLoading={isLoading} isFetching={isFetching || isDeleting} totalCount={formsData?.pagination?.totalForms || 0} page={page} limit={limit} onPageChange={setPage} onLimitChange={setLimit} enableSelection={false} getRowId={(item) => item._id} emptyMessage="No forms found. Create your first automated interaction form!" />
      </div>

      {selectedWorkspace?.waba_id && <SyncMetaFlowModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} wabaId={selectedWorkspace?.waba_id || ""} />}

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} isLoading={isDeleting} title="Delete Form" subtitle="Are you sure you want to delete this form? This action cannot be undone." variant="danger" />
    </div>
  );
};

export default FormBuilderList;
