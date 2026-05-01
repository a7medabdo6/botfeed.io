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
import { useGetGoogleAccountsQuery, useGetGoogleCalendarsQuery } from "@/src/redux/api/googleApi";
import { useReactFlow } from "@xyflow/react";
import { Timer } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

export function CalendarEventNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);

  const { data: accountsRes, isLoading: accountsLoading } = useGetGoogleAccountsQuery();
  const accounts = accountsRes?.accounts ?? [];
  const googleAccountId = data.googleAccountId || "";
  const { data: calsRes, isLoading: calsLoading } = useGetGoogleCalendarsQuery(googleAccountId, { skip: !googleAccountId });
  const linkedCalendars = useMemo(
    () => (calsRes?.calendars ?? []).filter((c) => c.is_linked !== false),
    [calsRes?.calendars],
  );

  const updateNodeData = (field: string, value: string) => {
    if (!touched) setTouched(true);
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node)),
    );
  };

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!googleAccountId) errors.push("Account is required");
    if (!data.calendarDbId) errors.push("Calendar is required");
    if (!(data.eventTitle || "").trim()) errors.push("Event title is required");
    if (!(data.startTime || "").trim()) errors.push("Start time is required");
  }

  return (
    <BaseNode
      id={id}
      title="Calendar Event"
      icon={<Timer size={18} />}
      borderColor="border-blue-200"
      handleColor="bg-blue-500!"
      errors={errors}
      filledHeader
      filledHeaderTone="calendar"
    >
      <NodeField
        label="Google Account"
        required
        error={(touched || data.forceValidation) && !googleAccountId ? "Account is required" : ""}
      >
        <Select
          value={googleAccountId || ""}
          onValueChange={(v) => {
            if (!touched) setTouched(true);
            setNodes((nds) =>
              nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, googleAccountId: v, calendarDbId: "" } } : node,
              ),
            );
          }}
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
            <Link href="/google_account" className="font-medium text-blue-600 underline-offset-2 hover:underline">
              Connect a Google account
            </Link>
          </p>
        )}
      </NodeField>

      <NodeField
        label="Event Title"
        required
        error={(touched || data.forceValidation) && !(data.eventTitle || "").trim() ? "Title is required" : ""}
      >
        <Input
          placeholder="Meeting with client"
          value={data.eventTitle ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("eventTitle", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField
        label="Calendar"
        required
        error={(touched || data.forceValidation) && !data.calendarDbId ? "Calendar is required" : ""}
        description="Only calendars marked as linked in Google settings are listed."
      >
        <Select
          value={data.calendarDbId || ""}
          onValueChange={(v) => updateNodeData("calendarDbId", v)}
          onOpenChange={() => setTouched(true)}
          disabled={!googleAccountId || calsLoading}
        >
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg)">
            <SelectValue placeholder={!googleAccountId ? "Select an account first" : calsLoading ? "Loading…" : "Select calendar"} />
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

      <NodeField
        label="Start Time (ISO or template)"
        required
        error={(touched || data.forceValidation) && !(data.startTime || "").trim() ? "Start time is required" : ""}
        description="Use ISO 8601 or placeholders like {{timestamp}}."
      >
        <Input
          placeholder="e.g. 2026-04-10T10:00:00Z"
          value={data.startTime ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("startTime", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField label="End Time (optional)">
        <Input
          placeholder="e.g. 2026-04-10T10:30:00Z"
          value={data.endTime ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("endTime", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField label="Description">
        <Input
          placeholder="Schedule a Google Calendar event"
          value={data.eventDescription ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("eventDescription", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>
    </BaseNode>
  );
}
