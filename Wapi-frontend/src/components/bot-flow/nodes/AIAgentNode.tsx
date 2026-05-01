/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/src/elements/ui/input";
import { Handle, Position, useEdges, useReactFlow } from "@xyflow/react";
import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

export function AIAgentNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);
  const edges = useEdges();

  const wiring = useMemo(() => {
    const hasModel = edges.some((e) => e.target === id && e.targetHandle === "model-in");
    const toolCount = edges.filter((e) => e.target === id && e.targetHandle === "tool-in").length;
    return { hasModel, toolCount };
  }, [edges, id]);

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!wiring.hasModel) errors.push('Connect a “Chat model” node to the Chat model port (below)');
    if (wiring.toolCount === 0) errors.push('Connect at least one “Tool” node to the Tools port (below)');
  }

  const slotAfterContent = (
    <div className="relative mx-0 border-t border-sky-100 px-4 pb-1 pt-3 dark:border-white/10">
      <p className="mb-3 text-center text-[10px] text-sky-800/80 dark:text-sky-100/90">
        Like n8n: connect <strong>Chat model</strong> and one or more <strong>Tool</strong> nodes to the ports below. The main flow still uses the <strong>left</strong> port.
      </p>
      <div className="relative flex h-10 w-full items-end justify-center pb-0.5">
        <div className="absolute bottom-0 left-[18%] flex -translate-x-1/2 flex-col items-center gap-1">
          <span className="text-[9px] font-bold uppercase tracking-wide text-sky-900 dark:text-sky-100">Chat model</span>
          <Handle
            type="target"
            position={Position.Bottom}
            id="model-in"
            className="!relative !left-0 !top-0 h-3 w-3 border-2 border-white bg-sky-500 shadow-sm dark:border-(--card-border-color)"
          />
        </div>
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 opacity-45">
          <span className="text-[9px] font-bold uppercase tracking-wide text-gray-500">Memory</span>
          <Handle
            type="target"
            position={Position.Bottom}
            id="memory-in"
            className="!relative !left-0 !top-0 h-3 w-3 border-2 border-dashed border-gray-400 bg-gray-200 dark:bg-gray-600"
          />
        </div>
        <div className="absolute bottom-0 left-[82%] flex -translate-x-1/2 flex-col items-center gap-1">
          <span className="text-[9px] font-bold uppercase tracking-wide text-sky-900 dark:text-sky-100">Tools</span>
          <Handle
            type="target"
            position={Position.Bottom}
            id="tool-in"
            className="!relative !left-0 !top-0 h-3 w-3 border-2 border-white bg-emerald-500 shadow-sm dark:border-(--card-border-color)"
          />
        </div>
      </div>
    </div>
  );

  return (
    <BaseNode
      id={id}
      title="AI Agent"
      icon={<Sparkles size={18} />}
      borderColor="border-sky-200"
      handleColor="bg-sky-500!"
      errors={errors}
      filledHeader
      filledHeaderTone="sky"
      slotAfterContent={slotAfterContent}
    >
      <NodeField label="Step Name" description="Shown in flow reports. Requires OpenAI-style chat model + tools.">
        <Input
          placeholder="e.g. Booking assistant"
          value={data.stepName ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => {
            if (!touched) setTouched(true);
            setNodes((nds) =>
              nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, stepName: e.target.value } } : node)),
            );
          }}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField label="Session (hours)" description="Optional chatbot session lock on contact (0 = off).">
        <Input
          type="number"
          min={0}
          value={data.sessionDurationHours ?? "0"}
          onFocus={() => setTouched(true)}
          onChange={(e) => {
            if (!touched) setTouched(true);
            setNodes((nds) =>
              nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, sessionDurationHours: e.target.value } } : node,
              ),
            );
          }}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>
    </BaseNode>
  );
}
