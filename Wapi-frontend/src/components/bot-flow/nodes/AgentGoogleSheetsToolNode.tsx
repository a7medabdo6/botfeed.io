/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/src/elements/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/elements/ui/select";
import { useGetGoogleAccountsQuery, useGetGoogleSheetsQuery } from "@/src/redux/api/googleApi";
import { useReactFlow } from "@xyflow/react";
import { FileSpreadsheet, Plus, RefreshCw, Table2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

const LEGACY = "agent_tool_google_sheets";

function sheetsMeta(nodeType: string): { title: string; subtitle: string; icon: ReactNode } {
  switch (nodeType) {
    case "agent_tool_google_sheets_read":
      return { title: "Sheets Read", subtitle: "get: range", icon: <Table2 size={18} /> };
    case "agent_tool_google_sheets_append":
      return { title: "Sheets Add Row", subtitle: "append: sheet", icon: <Plus size={18} /> };
    case "agent_tool_google_sheets_update":
      return {
        title: "Sheets Update Row",
        subtitle: "update: sheet",
        icon: (
          <span className="relative inline-flex">
            <FileSpreadsheet size={18} />
            <RefreshCw className="absolute -bottom-1 -right-1 h-3 w-3 text-red-500" strokeWidth={2.5} />
          </span>
        ),
      };
    case LEGACY:
    default:
      return { title: "Tool: Google Sheets", subtitle: "append row (legacy)", icon: <FileSpreadsheet size={18} /> };
  }
}

/** Google Sheets tools for an AI Agent. */
export function AgentGoogleSheetsToolNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);
  const nodeType = data.nodeType || LEGACY;
  const meta = sheetsMeta(nodeType);
  const showReadRange = nodeType === "agent_tool_google_sheets_read";

  const { data: accountsRes, isLoading: accountsLoading } = useGetGoogleAccountsQuery();
  const accounts = accountsRes?.accounts ?? [];
  const googleAccountId = data.googleAccountId || "";
  const { data: sheetsRes, isLoading: sheetsLoading } = useGetGoogleSheetsQuery(googleAccountId, { skip: !googleAccountId });
  const sheets = sheetsRes?.sheets ?? [];

  const update = (partial: Record<string, unknown>) => {
    if (!touched) setTouched(true);
    setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...partial } } : node)));
  };

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!googleAccountId) errors.push("Google account required");
    if (!data.sheetDbId) errors.push("Spreadsheet required");
  }

  return (
    <BaseNode
      id={id}
      title={meta.title}
      icon={meta.icon}
      borderColor="border-emerald-200"
      handleColor="bg-emerald-500!"
      errors={errors}
      showInHandle={false}
      filledHeader
      filledHeaderTone="sheets"
    >
      <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 -mt-1 mb-1">{meta.subtitle}</p>
      <p className="text-[10px] text-gray-500 mb-2">
        Wire the <strong>right</strong> port to the AI Agent <strong>Tools</strong> input.
      </p>

      <NodeField label="Google Account" required error={(touched || data.forceValidation) && !googleAccountId ? "Required" : ""}>
        <Select
          value={googleAccountId || ""}
          onValueChange={(v) => update({ googleAccountId: v, sheetDbId: "" })}
          onOpenChange={() => setTouched(true)}
          disabled={accountsLoading}
        >
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg)">
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent className="dark:bg-(--page-body-bg)">
            {accounts.map((a) => (
              <SelectItem key={a._id} value={a._id} className="dark:hover:bg-(--card-color)">
                {a.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!accountsLoading && accounts.length === 0 && (
          <p className="text-[11px] text-gray-500">
            <Link href="/google_account" className="text-emerald-600 underline-offset-2 hover:underline">
              Connect Google
            </Link>
          </p>
        )}
      </NodeField>

      <NodeField label="Spreadsheet" required error={(touched || data.forceValidation) && !data.sheetDbId ? "Required" : ""}>
        <Select
          value={data.sheetDbId || ""}
          onValueChange={(v) => update({ sheetDbId: v })}
          onOpenChange={() => setTouched(true)}
          disabled={!googleAccountId || sheetsLoading}
        >
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg)">
            <SelectValue placeholder={!googleAccountId ? "Select account first" : "Select spreadsheet"} />
          </SelectTrigger>
          <SelectContent className="dark:bg-(--page-body-bg)">
            {sheets.map((s) => (
              <SelectItem key={s._id} value={s._id} className="dark:hover:bg-(--card-color)">
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </NodeField>

      <NodeField label="Sheet tab">
        <Input
          placeholder="Sheet1"
          value={data.sheetTabName ?? "Sheet1"}
          onFocus={() => setTouched(true)}
          onChange={(e) => update({ sheetTabName: e.target.value })}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      {showReadRange && (
        <NodeField label="Range (A1)" description="Optional. Leave empty to use Tab!A1:Z200">
          <Input
            placeholder="e.g. Sheet1!A1:D50"
            value={data.sheetsReadRangeA1 ?? ""}
            onFocus={() => setTouched(true)}
            onChange={(e) => update({ sheetsReadRangeA1: e.target.value })}
            className="h-9 text-sm bg-(--input-color)"
          />
        </NodeField>
      )}
    </BaseNode>
  );
}
