/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/elements/ui/button";
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
import { FileSpreadsheet, Plus, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

type MappingRow = { columnName: string; value: string };

export function GoogleSheetsNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);

  const { data: accountsRes, isLoading: accountsLoading } = useGetGoogleAccountsQuery();
  const accounts = accountsRes?.accounts ?? [];
  const googleAccountId = data.googleAccountId || "";
  const { data: sheetsRes, isLoading: sheetsLoading } = useGetGoogleSheetsQuery(googleAccountId, { skip: !googleAccountId });
  const sheets = sheetsRes?.sheets ?? [];

  const columnMappings: MappingRow[] = Array.isArray(data.columnMappings) ? data.columnMappings : [];

  const updateNodeData = (partial: Record<string, unknown>) => {
    if (!touched) setTouched(true);
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...partial } } : node)),
    );
  };

  const setMappings = (next: MappingRow[]) => updateNodeData({ columnMappings: next });

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!googleAccountId) errors.push("Account is required");
    if (!data.sheetDbId) errors.push("Spreadsheet is required");
    if (!columnMappings.length || !columnMappings.every((m) => m.columnName?.trim())) {
      errors.push("Add at least one column mapping with a column name");
    }
  }

  return (
    <BaseNode
      id={id}
      title="Google Sheets"
      icon={<FileSpreadsheet size={18} />}
      borderColor="border-emerald-200"
      handleColor="bg-emerald-500!"
      errors={errors}
      filledHeader
      filledHeaderTone="sheets"
    >
      <NodeField label="Step Name" description="Identify this step in your flow report.">
        <Input
          placeholder="e.g. Sync to Google Sheets"
          value={data.stepName ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData({ stepName: e.target.value })}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField
        label="Google Account"
        required
        error={(touched || data.forceValidation) && !googleAccountId ? "Account is required" : ""}
      >
        <Select
          value={googleAccountId || ""}
          onValueChange={(v) => updateNodeData({ googleAccountId: v, sheetDbId: "" })}
          onOpenChange={() => setTouched(true)}
          disabled={accountsLoading}
        >
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg)">
            <SelectValue placeholder={accountsLoading ? "Loading…" : "Select Account"} />
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
          <p className="text-[11px] text-gray-500 mt-1">
            <Link href="/google_account" className="font-medium text-emerald-600 underline-offset-2 hover:underline">
              Connect a Google account
            </Link>
          </p>
        )}
      </NodeField>

      <NodeField
        label="Spreadsheet"
        required
        error={(touched || data.forceValidation) && !data.sheetDbId ? "Spreadsheet is required" : ""}
      >
        <Select
          value={data.sheetDbId || ""}
          onValueChange={(v) => updateNodeData({ sheetDbId: v })}
          onOpenChange={() => setTouched(true)}
          disabled={!googleAccountId || sheetsLoading}
        >
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg)">
            <SelectValue placeholder={!googleAccountId ? "Select an account first" : sheetsLoading ? "Loading…" : "Select spreadsheet"} />
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

      <NodeField label="Sheet Name" description="Tab name inside the spreadsheet (default Sheet1).">
        <Input
          placeholder="Sheet1"
          value={data.sheetTabName ?? "Sheet1"}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData({ sheetTabName: e.target.value })}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <p className="text-[10px] text-gray-500 leading-snug">
        Each row appends one line to the sheet: values are written in column order A, B, C… matching the order below. Use{" "}
        <code className="text-[10px]">{"{{message}}"}</code> and other placeholders from your automation payload.
      </p>

      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Column mappings</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          onClick={() => {
            setTouched(true);
            setMappings([...columnMappings, { columnName: "", value: "{{message}}" }]);
          }}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add mapping
        </Button>
      </div>

      <div className="space-y-2">
        {columnMappings.map((row, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1.5">
              <div>
                <span className="text-[10px] font-medium text-gray-500">Column name</span>
                <Input
                  placeholder="e.g. Message"
                  value={row.columnName}
                  onFocus={() => setTouched(true)}
                  onChange={(e) => {
                    const next = [...columnMappings];
                    next[idx] = { ...next[idx], columnName: e.target.value };
                    setMappings(next);
                  }}
                  className="h-9 text-sm bg-(--input-color) mt-0.5"
                />
              </div>
              <div>
                <span className="text-[10px] font-medium text-gray-500">Value</span>
                <Input
                  placeholder="{{message}}"
                  value={row.value}
                  onFocus={() => setTouched(true)}
                  onChange={(e) => {
                    const next = [...columnMappings];
                    next[idx] = { ...next[idx], value: e.target.value };
                    setMappings(next);
                  }}
                  className="h-9 text-sm bg-(--input-color) mt-0.5"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-red-500 hover:text-red-600"
              onClick={() => {
                setTouched(true);
                setMappings(columnMappings.filter((_, i) => i !== idx));
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </BaseNode>
  );
}
