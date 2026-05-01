/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/elements/ui/select";
import { useGetChatbotsQuery } from "@/src/redux/api/chatbotApi";
import { useAppSelector } from "@/src/redux/hooks";
import { useReactFlow } from "@xyflow/react";
import { Cpu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

/** Supplies the chatbot (model + API key) to an AI Agent’s “Chat model” port. */
export function AgentChatModelNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);
  const wabaId = useAppSelector((s) => s.workspace.selectedWorkspace?.waba_id) as string | undefined;

  const { data: chatbotsRes, isLoading } = useGetChatbotsQuery({ waba_id: wabaId! }, { skip: !wabaId });
  const chatbots = chatbotsRes?.data ?? [];

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!data.chatbotId) errors.push("Select a chatbot");
  }

  return (
    <BaseNode
      id={id}
      title="Chat model"
      icon={<Cpu size={18} />}
      borderColor="border-cyan-200"
      handleColor="bg-cyan-500!"
      errors={errors}
      showInHandle={false}
      filledHeader
      filledHeaderTone="sky"
    >
      <p className="text-[10px] text-gray-500 -mt-1 mb-2">Connect the <strong>right</strong> port to an AI Agent’s <strong>Chat model</strong> input.</p>
      <NodeField label="Chatbot" required error={(touched || data.forceValidation) && !data.chatbotId ? "Required" : ""}>
        <Select
          value={data.chatbotId || ""}
          onValueChange={(v) => {
            if (!touched) setTouched(true);
            setNodes((nds) =>
              nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, chatbotId: v } } : node)),
            );
          }}
          onOpenChange={() => setTouched(true)}
          disabled={!wabaId || isLoading}
        >
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg)">
            <SelectValue placeholder={isLoading ? "Loading…" : "Select chatbot"} />
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
            <Link href="/chatbots" className="text-cyan-600 underline-offset-2 hover:underline">
              Create a chatbot
            </Link>
          </p>
        )}
      </NodeField>
    </BaseNode>
  );
}
