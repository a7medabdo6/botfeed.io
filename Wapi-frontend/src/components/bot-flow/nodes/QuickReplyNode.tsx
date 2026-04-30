/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/elements/ui/button";
import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { Textarea } from "@/src/elements/ui/textarea";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { CheckSquare, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

export function QuickReplyNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);

  const updateNodeData = (field: string, value: any) => {
    if (!touched) setTouched(true);
    setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node)));
  };

  useEffect(() => {
    if (data.buttons && Array.isArray(data.buttons)) {
      const needsUpdate = data.buttons.some((btn: any, i: number) => btn.value !== `btn_${i + 1}`);
      if (needsUpdate) {
        const updatedButtons = data.buttons.map((btn: any, i: number) => ({
          ...btn,
          value: `btn_${i + 1}`,
        }));
        updateNodeData("buttons", updatedButtons);
      }
    }
  }, [data.buttons?.length]);

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!data.message || !data.message.trim()) errors.push("Message text is required");
    if (!data.buttons || data.buttons.length === 0) errors.push("Add at least one quick option");
    data.buttons?.forEach((btn: any, i: number) => {
      if (!btn.text?.trim()) errors.push(`Option ${i + 1} label is required`);
    });
  }

  const addButton = () => {
    if (!touched) setTouched(true);
    const buttons = data.buttons || [];
    if (buttons.length < 3) {
      const newButtonIndex = buttons.length + 1;
      updateNodeData("buttons", [...buttons, { text: "", value: `btn_${newButtonIndex}` }]);
    }
  };

  const removeButton = (index: number) => {
    const buttons = data.buttons || [];
    const filteredButtons = buttons.filter((_: any, i: number) => i !== index);
    const updatedButtons = filteredButtons.map((btn: any, i: number) => ({
      ...btn,
      value: `btn_${i + 1}`,
    }));
    updateNodeData("buttons", updatedButtons);
  };

  const updateButton = (index: number, field: string, value: string) => {
    if (!touched) setTouched(true);
    if (field === "value") return;
    const buttons = data.buttons || [];
    const newButtons = [...buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    updateNodeData("buttons", newButtons);
  };

  return (
    <BaseNode
      id={id}
      title="Quick Reply"
      icon={<CheckSquare size={18} />}
      borderColor="border-sky-200"
      handleColor="bg-sky-500!"
      errors={errors}
      showOutHandle={false}
      filledHeader
      filledHeaderTone="emerald"
    >
      <NodeField
        label="Message Text"
        required
        error={(touched || data.forceValidation) && !data.message?.trim() ? "Message text is required" : ""}
      >
        <Textarea
          placeholder="Enter message text here..."
          value={data.message || ""}
          onFocus={() => setTouched(true)}
          onChange={(e) => updateNodeData("message", e.target.value)}
          className="min-h-20 resize-none text-sm dark:bg-(--page-body-bg)"
          maxLength={1024}
        />
        <div className="mt-1 text-right text-[10px] text-gray-400">{data.message?.length || 0}/1024</div>
      </NodeField>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Choice buttons</Label>
          <span className="text-[10px] text-gray-400">{data.buttons?.length || 0} / 3</span>
        </div>

        {(data.buttons || []).map((btn: any, index: number) => (
          <div key={index} className="relative rounded-lg border border-gray-100 dark:border-(--card-border-color) dark:bg-(--dark-sidebar) bg-gray-50/50 p-3 pt-7">
            <Handle type="source" id={`src-btn-${index}`} position={Position.Right} style={{ top: "50%" }} className="w-3! h-3! bg-sky-500! border-2! border-white! dark:border-(--card-border-color)! shadow-sm" />

            <Button onClick={() => removeButton(index)} variant="ghost" size="icon" className="absolute right-1 top-1 h-5 w-5 text-gray-400 hover:text-red-500">
              <X size={12} />
            </Button>
            <div className="absolute left-3 top-2 text-[10px] font-bold text-gray-400 uppercase">Option {index + 1}</div>

            <div>
              <Label className="mb-1 block text-[10px] font-medium text-gray-500">Button label *</Label>
              <Input
                value={btn.text}
                onFocus={() => setTouched(true)}
                onChange={(e) => updateButton(index, "text", e.target.value)}
                placeholder="Button Label (Quick choice)"
                className="h-8 text-xs"
                maxLength={20}
              />
            </div>
          </div>
        ))}

        {(!data.buttons || data.buttons.length < 3) && (
          <Button onClick={addButton} variant="outline" className="h-9 w-full border-dashed border-sky-200 text-xs text-sky-700 hover:bg-sky-50 dark:border-(--card-border-color) dark:text-sky-400">
            <Plus className="mr-1 h-3 w-3" /> Add Quick Option
          </Button>
        )}
      </div>
    </BaseNode>
  );
}
