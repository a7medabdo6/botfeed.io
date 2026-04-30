/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/elements/ui/select";
import { Input } from "@/src/elements/ui/input";
import { useGetTemplatesQuery } from "@/src/redux/api/templateApi";
import { useAppSelector } from "@/src/redux/hooks";
import { useReactFlow } from "@xyflow/react";
import { LayoutTemplate } from "lucide-react";
import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

export function SendTemplateNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);
  const wabaId = useAppSelector((s) => s.workspace.selectedWorkspace?.waba_id) as string | undefined;

  const { data: templatesRes, isLoading } = useGetTemplatesQuery({ waba_id: wabaId! }, { skip: !wabaId });
  const templates = templatesRes?.data ?? [];

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!data.templateId) errors.push("Select a template");
  }

  const updateNodeData = (field: string, value: string) => {
    if (!touched) setTouched(true);
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node)),
    );
  };

  return (
    <BaseNode
      id={id}
      title="Send Template"
      icon={<LayoutTemplate size={18} />}
      borderColor="border-sky-200"
      handleColor="bg-sky-500!"
      errors={errors}
      filledHeader
      filledHeaderTone="emerald"
    >
      <NodeField label="Step Name" description="Identify this step in your flow report.">
        <Input
          placeholder="e.g. Send Appointment Reminder"
          value={data.stepName ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("stepName", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField
        label="Template"
        required
        error={(touched || data.forceValidation) && !data.templateId ? "Choose a template" : ""}
        description={!wabaId ? "Select a workspace with WABA to load templates." : undefined}
      >
        <Select value={data.templateId || ""} onValueChange={(v) => updateNodeData("templateId", v)} onOpenChange={() => setTouched(true)} disabled={!wabaId || isLoading}>
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg)">
            <SelectValue placeholder={isLoading ? "Loading…" : "Choose a template"} />
          </SelectTrigger>
          <SelectContent className="max-h-60 dark:bg-(--page-body-bg)">
            {templates.map((t: any) => (
              <SelectItem key={t._id} value={t._id} className="dark:hover:bg-(--card-color)">
                {t.template_name || t.name}
                {t.status ? ` · ${t.status}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </NodeField>
    </BaseNode>
  );
}
