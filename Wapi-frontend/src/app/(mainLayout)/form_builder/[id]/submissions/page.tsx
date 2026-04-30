/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import SubmissionDetailsModal from "@/src/components/form-builder/submissions/SubmissionDetailsModal";
import UpdateSubmissionStatusModal from "@/src/components/form-builder/submissions/UpdateSubmissionStatusModal";
import { Badge } from "@/src/elements/ui/badge";
import { Button } from "@/src/elements/ui/button";
import { useDeleteSubmissionMutation, useGetSubmissionDetailsQuery, useGetSubmissionsQuery, useGetSubmissionStatsQuery, useUpdateSubmissionStatusMutation } from "@/src/redux/api/submissionApi";
import CommonHeader from "@/src/shared/CommonHeader";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { DataTable } from "@/src/shared/DataTable";
import { CheckCircle2, CircleDashed, Clock, Eye, MessageSquare, Trash2, UserPlus, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const SubmissionsPage = () => {
  const params = useParams();
  const formId = params.id as string;

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [subToUpdate, setSubToUpdate] = useState<{ id: string; status: string } | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subToDelete, setSubToDelete] = useState<string | null>(null);

  // Queries
  const {
    data: submissionsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetSubmissionsQuery({
    form_id: formId,
    params: {
      page,
      limit,
      search: searchTerm,
    },
  });

  const { data: statsData, refetch: refetchStats } = useGetSubmissionStatsQuery(formId);

  const { data: detailsData, isFetching: isDetailsLoading } = useGetSubmissionDetailsQuery(selectedSubId || "", {
    skip: !selectedSubId || !isDetailsModalOpen,
  });

  // Mutations
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateSubmissionStatusMutation();
  const [deleteSubmission, { isLoading: isDeleting }] = useDeleteSubmissionMutation();

  // Handlers
  const handleViewDetails = (id: string) => {
    setSelectedSubId(id);
    setIsDetailsModalOpen(true);
  };

  const handleOpenStatusModal = (id: string, currentStatus: string) => {
    setSubToUpdate({ id, status: currentStatus });
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!subToUpdate) return;
    try {
      await updateStatus({ id: subToUpdate.id, status: newStatus }).unwrap();
      toast.success("Status updated successfully");
      setIsStatusModalOpen(false);
      refetchStats();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteClick = (id: string) => {
    setSubToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subToDelete) return;
    try {
      await deleteSubmission(subToDelete).unwrap();
      toast.success("Submission deleted successfully");
      setIsDeleteModalOpen(false);
      refetchStats();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete submission");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      new: { variant: "default", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
      viewed: { variant: "secondary", color: "bg-indigo-500/10 text-indigo-600 border-indigo-200" },
      in_progress: { variant: "outline", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
      contacted: { variant: "outline", color: "bg-cyan-500/10 text-cyan-600 border-cyan-200" },
      qualified: { variant: "default", color: "bg-sky-500/10 text-sky-600 border-sky-200" },
      closed: { variant: "secondary", color: "bg-slate-500/10 text-slate-600 border-slate-200" },
      failed: { variant: "destructive", color: "bg-red-500/10 text-red-600 border-red-200" },
    };

    const config = variants[status] || variants.new;
    return (
      <Badge variant={config.variant} className={`capitalize text-[10px] font-bold ${config.color}`}>
        {status.replace(/_/g, " ")}
      </Badge>
    );
  };

  const columns = [
    {
      header: "Lead / Contact",
      accessorKey: "contact_info.name",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">{row.contact_info.name.substring(0, 2)}</div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-white">{row.contact_info.name}</span>
            <span className="text-[10px] text-slate-500 dark:text-gray-400">{row.contact_info.phone}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Data Preview",
      accessorKey: "preview",
      cell: (row: any) => <span className="text-xs text-slate-600 dark:text-gray-300 max-w-50 truncate block">{row.preview}</span>,
    },
    {
      header: "Submitted At",
      accessorKey: "submitted_at",
      cell: (row: any) => (
        <span className="text-xs text-slate-500 dark:text-gray-400">
          {new Date(row.submitted_at).toLocaleDateString()} at {new Date(row.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => getStatusBadge(row.status),
    },
    {
      header: "Actions",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="View Details" className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border-none" onClick={() => handleViewDetails(row._id)}>
            <Eye size={14} />
          </Button>
          <Button variant="outline" size="icon" title="Update Status" className="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-50 border-none" onClick={() => handleOpenStatusModal(row._id, row.status)}>
            <Clock size={14} />
          </Button>
          <Button variant="outline" size="icon" title="Delete" className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 border-none" onClick={() => handleDeleteClick(row._id)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  const stats = statsData?.data;

  const statCards = [
    { label: "Total Leads", value: stats?.total || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "New", value: stats?.new || 0, icon: UserPlus, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    { label: "In Progress", value: stats?.in_progress || 0, icon: CircleDashed, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
    { label: "Qualified", value: stats?.qualified || 0, icon: CheckCircle2, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-500/10" },
    { label: "Contacted", value: stats?.contacted || 0, icon: MessageSquare, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-500/10" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      <CommonHeader
        title="Form Submissions"
        description="Manage and track leads captured from your forms"
        backBtn={true}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onRefresh={() => {
          refetch();
          refetchStats();
        }}
      />

      {/* Stat Cards */}
      <div className="grid [@media(max-width:470px)]:grid-cols-1! [@media(max-width:700px)]:grid-cols-2 [@media(max-width:1355px)]:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-(--card-color) p-6 rounded-lg border border-slate-200/60 dark:border-(--card-border-color) shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
              <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <Icon size={24} className={card.color} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{card.value}</span>
                <span className="text-xs font-bold text-slate-500 dark:text-gray-400 mt-1 line-clamp-1">{card.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-(--card-color) rounded-xl border border-slate-200/60 dark:border-(--card-border-color) shadow-sm overflow-hidden">
        <DataTable columns={columns as any} data={submissionsData?.data || []} isLoading={isLoading} isFetching={isFetching || isUpdatingStatus || isDeleting} totalCount={submissionsData?.pagination?.totalForms || 0} page={page} limit={limit} onPageChange={setPage} onLimitChange={setLimit} enableSelection={false} getRowId={(item) => item._id} emptyMessage="No submissions found yet. Share your form to start collected data!" />
      </div>

      <SubmissionDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} data={detailsData?.data || null} isLoading={isDetailsLoading} />

      {subToUpdate && <UpdateSubmissionStatusModal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} currentStatus={subToUpdate.status} onConfirm={handleUpdateStatus} isLoading={isUpdatingStatus} />}

      <ConfirmModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} isLoading={isDeleting} title="Delete Submission" subtitle="Are you sure you want to delete this submission? This action cannot be undone." />
    </div>
  );
};

export default SubmissionsPage;
