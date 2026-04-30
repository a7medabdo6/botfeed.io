/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/elements/ui/button";
import { Input } from "@/src/elements/ui/input";
import { Textarea } from "@/src/elements/ui/textarea";
import { useReactFlow } from "@xyflow/react";
import { Zap } from "lucide-react";
import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

export function CallToActionNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!data.valueText?.trim()) errors.push("Message body is required");
    if (!data.buttonText?.trim()) errors.push("Button name is required");
    if (!data.buttonLink?.trim()) errors.push("URL is required");
  }

  const updateNodeData = (field: string, value: any) => {
    if (!touched) setTouched(true);
    setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node)));
  };

  return (
    <BaseNode
      id={id}
      title="Call to Action"
      icon={<Zap size={18} />}
      borderColor="border-sky-200"
      handleColor="bg-sky-500!"
      errors={errors}
      filledHeader
      filledHeaderTone="emerald"
    >
      <NodeField label="Step Name" description="Identify this step in your flow report.">
        <Input
          placeholder="e.g. Send Launch Portal"
          value={data.stepName ?? ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("stepName", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <NodeField label="Message Body" required error={(touched || data.forceValidation) && !data.valueText?.trim() ? "Text is required." : ""}>
        <Textarea
          placeholder="Main message text…"
          value={data.valueText || ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("valueText", e.target.value)}
          className="min-h-24 resize-y text-sm dark:bg-(--page-body-bg)"
        />
      </NodeField>

      <NodeField label="Button Name" required error={(touched || data.forceValidation) && !data.buttonText?.trim() ? "Button name is required." : ""}>
        <Input
          placeholder="e.g. Visit Website"
          value={data.buttonText || ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("buttonText", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
          maxLength={20}
        />
      </NodeField>

      <NodeField label="URL" required error={(touched || data.forceValidation) && !data.buttonLink?.trim() ? "URL is required." : ""}>
        <Input
          placeholder="https://example.com"
          value={data.buttonLink || ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("buttonLink", e.target.value)}
          className="h-9 text-sm bg-(--input-color)"
        />
      </NodeField>

      <div className="space-y-2 border-t border-gray-100 pt-3 dark:border-(--card-border-color)">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Preview</p>
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/80 p-3 text-center dark:border-(--card-border-color) dark:bg-(--dark-sidebar)">
          <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">{data.valueText?.trim() || "Compose your message…"}</p>
          <Button type="button" size="sm" className="h-8 w-full bg-sky-600 text-xs font-semibold text-white hover:bg-sky-700">
            {data.buttonText?.trim() || "Visit our site"}
          </Button>
        </div>
      </div>
    </BaseNode>
  );
}
