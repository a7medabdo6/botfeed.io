/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/src/elements/ui/input";
import { useReactFlow } from "@xyflow/react";
import { BookKey } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

export function AgentMemoryNode({ data, id }: any) {
  const { setNodes } = useReactFlow();

  const update = (key: string, value: string) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, [key]: value } } : node)),
    );
  };

  return (
    <BaseNode
      id={id}
      title="Memory"
      icon={<BookKey size={18} />}
      borderColor="border-violet-200"
      handleColor="bg-violet-500!"
      showInHandle={false}
      filledHeader
      filledHeaderTone="violet"
    >
      <p className="text-[10px] text-gray-500 -mt-1 mb-2">
        Connect the <strong>right</strong> port to an AI Agent&apos;s <strong>Memory</strong> input to enable conversation history.
      </p>

      <NodeField label="Window size" description="Number of recent messages to include (default 20).">
        <Input
          type="number"
          min={2}
          max={100}
          placeholder="20"
          value={data.windowSize ?? ""}
          onChange={(e) => update("windowSize", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField label="Session TTL (hours)" description="Conversation resets after this many hours of inactivity (default 24).">
        <Input
          type="number"
          min={1}
          max={720}
          placeholder="24"
          value={data.sessionHours ?? ""}
          onChange={(e) => update("sessionHours", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>
    </BaseNode>
  );
}
