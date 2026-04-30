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
import { useGetChatbotsQuery } from "@/src/redux/api/chatbotApi";
import { useAppSelector } from "@/src/redux/hooks";
import { useReactFlow } from "@xyflow/react";
import Link from "next/link";
import { BotMessageSquare } from "lucide-react";
import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

export function AssignChatbotNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);
  const wabaId = useAppSelector((s) => s.workspace.selectedWorkspace?.waba_id) as string | undefined;

  const { data: chatbotsRes, isLoading } = useGetChatbotsQuery({ waba_id: wabaId! }, { skip: !wabaId });
  const chatbots = chatbotsRes?.data ?? [];

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!data.chatbotId) errors.push("Select a chatbot");
  }

  const updateNodeData = (field: string, value: string) => {
    if (!touched) setTouched(true);
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node,
      ),
    );
  };

  return (
    <BaseNode
      id={id}
      title="Assign Chatbot"
      icon={<BotMessageSquare size={18} />}
      borderColor="border-violet-200"
      handleColor="bg-violet-500!"
      errors={errors}
      filledHeader
      filledHeaderTone="violet"
    >
      <NodeField
        label="Step Name"
        description="Identify this step in your flow report."
      >
        <Input
          placeholder="e.g. Assign AI Support"
          value={data.stepName ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("stepName", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField
        label="Select Chatbot"
        required
        description={!wabaId ? "Select a workspace with a connected WABA to load chatbots." : undefined}
        error={(touched || data.forceValidation) && !data.chatbotId ? "Choose a chatbot" : ""}
      >
        <Select
          value={data.chatbotId || ""}
          onValueChange={(v) => updateNodeData("chatbotId", v)}
          onOpenChange={() => setTouched(true)}
          disabled={!wabaId || isLoading}
        >
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg)">
            <SelectValue placeholder={isLoading ? "Loading…" : "Choose a chatbot"} />
          </SelectTrigger>
          <SelectContent className="dark:bg-(--page-body-bg)">
            {chatbots.map((c: { _id: string; name: string }) => (
              <SelectItem key={c._id} value={c._id} className="dark:hover:bg-(--card-color)">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {wabaId && chatbots.length === 0 && !isLoading && (
          <p className="text-[11px] text-gray-500">
            No chatbots yet.{" "}
            <Link href="/chatbots" className="font-medium text-violet-600 underline-offset-2 hover:underline">
              Create one
            </Link>
          </p>
        )}
      </NodeField>

      <NodeField
        label="Session Duration (Hours)"
        description="Auto-release after this time (0 = No limit)"
      >
        <Input
          type="number"
          min={0}
          step={1}
          placeholder="e.g. 24"
          value={data.sessionDurationHours ?? "0"}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("sessionDurationHours", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>
    </BaseNode>
  );
}
