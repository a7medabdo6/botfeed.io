/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useGetAdminWidgetConfigsQuery,
  useUpdateAdminWidgetConfigMutation,
  useDeleteAdminWidgetConfigMutation,
  AdminWidgetConfig,
} from "@/src/redux/api/widgetConfigApi";
import ConfirmModal from "@/src/shared/ConfirmModal";
import { Pagination } from "@/src/shared/Pagination";
import { Power, PowerOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const MODES: Record<string, string> = { whatsapp: "WhatsApp", chatbot: "Chatbot", both: "Both" };

export default function AdminWidgetConfigs() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetAdminWidgetConfigsQuery({ page });
  const [updateWidget] = useUpdateAdminWidgetConfigMutation();
  const [deleteWidget, { isLoading: isDeleting }] = useDeleteAdminWidgetConfigMutation();

  const configs = data?.data || [];
  const pagination = data?.pagination;

  const toggleActive = async (cfg: AdminWidgetConfig) => {
    try {
      await updateWidget({ id: cfg._id, data: { is_active: !cfg.is_active } as any }).unwrap();
      toast.success(cfg.is_active ? "Widget disabled" : "Widget enabled");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteWidget(deleteId).unwrap();
      toast.success("Widget deleted");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chat Widgets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all website chat widgets across users
          </p>
        </div>
        <button onClick={() => refetch()} className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500 text-sm">Loading…</div>
      ) : configs.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-sm">No widgets found.</div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Owner</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Mode</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Conversations</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {configs.map((cfg) => {
                  const owner = typeof cfg.user_id === "object" ? cfg.user_id : null;
                  return (
                    <tr key={cfg._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.primary_color }} />
                          <span className="font-medium text-gray-900 dark:text-gray-100">{cfg.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {owner ? `${owner.name} (${owner.email})` : String(cfg.user_id)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{MODES[cfg.mode] || cfg.mode}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{cfg.conversation_count}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {cfg.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleActive(cfg)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition" title={cfg.is_active ? "Disable" : "Enable"}>
                            {cfg.is_active ? <PowerOff size={14} className="text-orange-500" /> : <Power size={14} className="text-green-500" />}
                          </button>
                          <button onClick={() => setDeleteId(cfg._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition" title="Delete">
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pagination && pagination.total > pagination.limit && (
            <div className="mt-4">
              <Pagination
                totalCount={pagination.total}
                page={page}
                limit={pagination.limit}
                onPageChange={setPage}
                onLimitChange={() => {}}
              />
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Widget"
        subtitle="Are you sure? This permanently removes the widget and all its conversations."
        isLoading={isDeleting}
      />
    </div>
  );
}
