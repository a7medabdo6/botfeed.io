/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Checkbox } from "@/src/elements/ui/checkbox";
import { Label } from "@/src/elements/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/elements/ui/select";
import { useGetGoogleAccountsQuery, useGetGoogleCalendarsQuery } from "@/src/redux/api/googleApi";
import { useReactFlow } from "@xyflow/react";
import { Calendar, List, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

const LEGACY = "agent_tool_google_calendar";

function calendarMeta(nodeType: string): { title: string; subtitle: string; icon: ReactNode } {
  switch (nodeType) {
    case "agent_tool_google_calendar_list":
      return { title: "Calendar Read", subtitle: "getAll: event", icon: <List size={18} /> };
    case "agent_tool_google_calendar_create":
      return { title: "Calendar Create", subtitle: "create: event", icon: <PlusCircle size={18} /> };
    case "agent_tool_google_calendar_delete":
      return { title: "Calendar Delete", subtitle: "delete: event", icon: <Trash2 size={18} /> };
    case LEGACY:
    default:
      return { title: "Tool: Google Calendar", subtitle: "list / create (legacy)", icon: <Calendar size={18} /> };
  }
}

/** Calendar tools for an AI Agent — single-op nodes or legacy multi-op. */
export function AgentGoogleCalendarToolNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);
  const nodeType = data.nodeType || LEGACY;
  const isLegacy = nodeType === LEGACY;
  const meta = calendarMeta(nodeType);

  const { data: accountsRes, isLoading: accountsLoading } = useGetGoogleAccountsQuery();
  const accounts = accountsRes?.accounts ?? [];
  const googleAccountId = data.googleAccountId || "";
  const { data: calsRes, isLoading: calsLoading } = useGetGoogleCalendarsQuery(googleAccountId, { skip: !googleAccountId });
  const linkedCalendars = useMemo(
    () => (calsRes?.calendars ?? []).filter((c) => c.is_linked !== false),
    [calsRes?.calendars],
  );

  const update = (partial: Record<string, unknown>) => {
    if (!touched) setTouched(true);
    setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, ...partial } } : node)));
  };

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!googleAccountId) errors.push("Google account required");
    if (!data.calendarDbId) errors.push("Calendar required");
    if (isLegacy && !data.toolCalendarList && !data.toolCalendarCreate) {
      errors.push("Enable at least list or create");
    }
  }

  return (
    <BaseNode
      id={id}
      title={meta.title}
      icon={meta.icon}
      borderColor="border-blue-200"
      handleColor="bg-blue-500!"
      errors={errors}
      showInHandle={false}
      filledHeader
      filledHeaderTone="calendar"
    >
      {!isLegacy && <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 -mt-1 mb-2">{meta.subtitle}</p>}
      {isLegacy && (
        <p className="text-[10px] text-gray-500 -mt-1 mb-2">
          Connect the <strong>right</strong> port to an AI Agent’s <strong>Tools</strong> input.
        </p>
      )}
      {!isLegacy && (
        <p className="text-[10px] text-gray-500 mb-2">
          Wire the <strong>right</strong> port to the AI Agent <strong>Tools</strong> input.
        </p>
      )}

      <NodeField label="Google Account" required error={(touched || data.forceValidation) && !googleAccountId ? "Required" : ""}>
        <Select
          value={googleAccountId || ""}
          onValueChange={(v) => update({ googleAccountId: v, calendarDbId: "" })}
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
            <Link href="/google_account" className="text-blue-600 underline-offset-2 hover:underline">
              Connect Google
            </Link>
          </p>
        )}
      </NodeField>

      <NodeField label="Calendar" required error={(touched || data.forceValidation) && !data.calendarDbId ? "Required" : ""}>
        <Select
          value={data.calendarDbId || ""}
          onValueChange={(v) => update({ calendarDbId: v })}
          onOpenChange={() => setTouched(true)}
          disabled={!googleAccountId || calsLoading}
        >
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg)">
            <SelectValue placeholder={!googleAccountId ? "Select account first" : "Select calendar"} />
          </SelectTrigger>
          <SelectContent className="dark:bg-(--page-body-bg)">
            {linkedCalendars.map((c) => (
              <SelectItem key={c._id} value={c._id} className="dark:hover:bg-(--card-color)">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </NodeField>

      {isLegacy && (
        <div className="flex flex-col gap-2 rounded-md border border-gray-100 bg-gray-50/80 p-2 dark:border-(--card-border-color) dark:bg-(--dark-sidebar)">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${id}-list`}
              checked={!!data.toolCalendarList}
              onCheckedChange={(v) => update({ toolCalendarList: v === true })}
            />
            <Label htmlFor={`${id}-list`} className="text-xs font-normal cursor-pointer">
              Allow list upcoming events
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`${id}-create`}
              checked={!!data.toolCalendarCreate}
              onCheckedChange={(v) => update({ toolCalendarCreate: v === true })}
            />
            <Label htmlFor={`${id}-create`} className="text-xs font-normal cursor-pointer">
              Allow create event
            </Label>
          </div>
        </div>
      )}
    </BaseNode>
  );
}
