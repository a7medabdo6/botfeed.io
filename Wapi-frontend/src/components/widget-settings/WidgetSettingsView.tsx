/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CommonHeader from "@/src/shared/CommonHeader";
import {
  useDeleteWidgetConfigMutation,
  useGetWidgetConfigsQuery,
  useUpdateWidgetConfigMutation,
  WidgetConfigData,
} from "@/src/redux/api/widgetConfigApi";
import React, { useState } from "react";
import WidgetConfigCard from "./WidgetConfigCard";
import WidgetConfigForm from "./WidgetConfigForm";
import { useAppSelector } from "@/src/redux/hooks";
import { toast } from "sonner";

const WidgetSettingsView: React.FC = () => {
  const selectedWorkspace = useAppSelector((s) => s.workspace.selectedWorkspace);
  const workspaceId = selectedWorkspace?._id;
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState<WidgetConfigData | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, refetch } = useGetWidgetConfigsQuery(workspaceId ? { workspace_id: workspaceId, include_unassigned: "true" } : undefined, {
    skip: !workspaceId,
  });
  const [updateWidgetConfig] = useUpdateWidgetConfigMutation();
  const [deleteWidgetConfig] = useDeleteWidgetConfigMutation();

  const configs = (data?.data || []).filter((c: WidgetConfigData) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSave = async (payload: Partial<WidgetConfigData>) => {
    try {
      setIsSaving(true);
      if (!editing?._id) {
        toast.error("Create new widget configs from Flow Builder website widget trigger only.");
        return;
      }
      await updateWidgetConfig({ id: editing._id, data: payload }).unwrap();
      toast.success("Widget config updated");
      setIsFormOpen(false);
      setEditing(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save widget config");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async (cfg: WidgetConfigData) => {
    if (!window.confirm(`Delete "${cfg.name}"?`)) return;
    try {
      await deleteWidgetConfig(cfg._id).unwrap();
      toast.success("Widget config deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete widget config");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 sm:p-6 p-4 overflow-y-auto custom-scrollbar">
      <CommonHeader
        title="Chat Widgets"
        description="Widgets are auto-created from Flow Builder when using the website widget trigger."
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
        searchPlaceholder="Search widgets..."
        onRefresh={refetch}
      />

      {!workspaceId ? (
        <div className="flex items-center justify-center py-20 text-sm text-gray-500">Select a workspace to manage chatbot widgets.</div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20 text-sm text-gray-500">Loading…</div>
      ) : configs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>No widgets yet. Create one from <strong>Flow Builder</strong> by adding a website widget trigger, then save the flow.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {configs.map((cfg: WidgetConfigData) => (
            <WidgetConfigCard
              key={cfg._id}
              config={cfg}
              onEdit={(config) => {
                setEditing(config);
                setIsFormOpen(true);
              }}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {isFormOpen ? (
        <WidgetConfigForm
          initial={editing}
          isSaving={isSaving}
          onSave={onSave}
          onClose={() => {
            if (isSaving) return;
            setIsFormOpen(false);
            setEditing(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default WidgetSettingsView;
