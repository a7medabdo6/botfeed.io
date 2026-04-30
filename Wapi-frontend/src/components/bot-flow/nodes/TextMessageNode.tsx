/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/elements/ui/select";
import { Textarea } from "@/src/elements/ui/textarea";
import { Input } from "@/src/elements/ui/input";
import { useReactFlow } from "@xyflow/react";
import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

export function TextMessageNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!data.message || !data.message.trim()) errors.push("Message content is required");
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
      title="Send Message"
      icon={<MessageSquare size={18} />}
      borderColor="border-emerald-200"
      handleColor="bg-emerald-500!"
      errors={errors}
      filledHeader
      filledHeaderTone="emerald"
    >
      <NodeField label="Step Name" description="Identify this step in your flow report.">
        <Input
          placeholder="e.g. Welcome note"
          value={data.stepName ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("stepName", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField label="Select message type">
        <Select value={data.messageType || "Simple text"} onValueChange={(value) => updateNodeData("messageType", value)} onOpenChange={() => setTouched(true)}>
          <SelectTrigger className="h-9 text-sm bg-(--input-color) dark:bg-(--page-body-bg) dark:hover:bg-(--page-body-bg)">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:bg-(--page-body-bg)">
            <SelectItem className="dark:hover:bg-(--card-color)" value="Simple text">
              Simple text
            </SelectItem>
            <SelectItem className="dark:hover:bg-(--card-color)" value="Template">
              Template
            </SelectItem>
            <SelectItem className="dark:hover:bg-(--card-color)" value="Interactive">
              Interactive
            </SelectItem>
            <SelectItem className="dark:hover:bg-(--card-color)" value="Media">
              Media
            </SelectItem>
          </SelectContent>
        </Select>
      </NodeField>

      <NodeField label="Message Content" required error={(touched || data.forceValidation) && !data.message?.trim() ? "Text is required." : ""}>
        <Textarea
          placeholder="Main message text…"
          value={data.message || ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("message", e.target.value)}
          className={`min-h-25 resize-y text-sm ${(touched || data.forceValidation) && !data.message?.trim() ? "border-gray-200 bg-(--input-color) dark:bg-(--page-body-bg) dark:border-(--card-border-color)" : ""}`}
        />
      </NodeField>

      <div className="space-y-2 border-t border-gray-100 pt-3 dark:border-(--card-border-color)">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preview</p>
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3 text-center dark:border-(--card-border-color) dark:bg-(--dark-sidebar)">
          <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">{data.message?.trim() || "Compose your message…"}</p>
        </div>
      </div>
    </BaseNode>
  );
}
