/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/src/elements/ui/button";
import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { Textarea } from "@/src/elements/ui/textarea";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { List, Plus, X } from "lucide-react";
import { useState } from "react";
import { BaseNode } from "./BaseNode";
import { NodeField } from "./NodeField";

export function ListMessageNode({ data, id }: any) {
  const { setNodes } = useReactFlow();
  const [touched, setTouched] = useState(false);

  const errors: string[] = [];
  if (touched || data.forceValidation) {
    if (!data.bodyText || !data.bodyText.trim()) errors.push("Body text is required");
    if (!data.buttonText || !data.buttonText.trim()) errors.push("Button text is required");
    if (!data.sections || data.sections.length === 0) {
      errors.push("At least one section is required");
    } else {
      data.sections.forEach((section: any, sIdx: number) => {
        if (!section.title) errors.push(`Section ${sIdx + 1} title is required`);
        if (!section.items || section.items.length === 0) {
          errors.push(`Section ${sIdx + 1} must have at least one item`);
        } else {
          section.items.forEach((item: any, iIdx: number) => {
            if (!item.title) errors.push(`Section ${sIdx + 1} item ${iIdx + 1} title is required`);
          });
        }
      });
    }
  }

  const updateNodeData = (field: string, value: any) => {
    if (!touched) setTouched(true);
    setNodes((nds) => nds.map((node) => (node.id === id ? { ...node, data: { ...node.data, [field]: value } } : node)));
  };

  const addSection = () => {
    if (!touched) setTouched(true);
    const sections = data.sections || [];
    if (sections.length < 10) {
      updateNodeData("sections", [...sections, { title: "", items: [{ title: "", description: "" }] }]);
    }
  };

  const removeSection = (index: number) => {
    const sections = data.sections || [];
    updateNodeData(
      "sections",
      sections.filter((_: any, i: number) => i !== index)
    );
  };

  const addItem = (sectionIndex: number) => {
    if (!touched) setTouched(true);
    const currentSections = data.sections || [];
    if ((currentSections[sectionIndex]?.items?.length || 0) < 10) {
      const sections = currentSections.map((sec: any, idx: number) => (idx === sectionIndex ? { ...sec, items: [...(sec.items || []), { title: "", description: "" }] } : sec));
      updateNodeData("sections", sections);
    }
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const sections = (data.sections || []).map((sec: any, idx: number) => (idx === sectionIndex ? { ...sec, items: (sec.items || []).filter((_: any, i: number) => i !== itemIndex) } : sec));
    updateNodeData("sections", sections);
  };

  const updateSectionTitle = (index: number, title: string) => {
    if (!touched) setTouched(true);
    const sections = (data.sections || []).map((sec: any, idx: number) => (idx === index ? { ...sec, title } : sec));
    updateNodeData("sections", sections);
  };

  const updateItem = (sectionIndex: number, itemIndex: number, field: string, value: string) => {
    if (!touched) setTouched(true);
    const sections = (data.sections || []).map((sec: any, sIdx: number) =>
      sIdx === sectionIndex
        ? {
            ...sec,
            items: (sec.items || []).map((item: any, iIdx: number) => (iIdx === itemIndex ? { ...item, [field]: value } : item)),
          }
        : sec
    );
    updateNodeData("sections", sections);
  };

  return (
    <BaseNode id={id} title="List Message" icon={<List size={18} />} iconBgColor="bg-purple-100" iconColor="text-purple-600" borderColor="border-purple-200" handleColor="bg-purple-500!" errors={errors}>
      <div className="space-y-4 pr-1">
        <NodeField label="Header Text (optional)">
          <Input value={data.headerText || ""} onFocus={() => setTouched(true)} onChange={(e) => updateNodeData("headerText", e.target.value)} placeholder="Header text (optional)" className="h-9 text-sm bg-(--input-color)" maxLength={60} />
        </NodeField>

        <NodeField label="Body Text" required error={(touched || data.forceValidation) && !data.bodyText?.trim() ? "Body text is required" : ""}>
          <Textarea value={data.bodyText || ""} onFocus={() => setTouched(true)} onChange={(e) => updateNodeData("bodyText", e.target.value)} placeholder="Body text" className="min-h-16 resize-none text-sm dark:bg-(--page-body-bg) bg-(--input-color)" maxLength={1024} />
        </NodeField>

        <NodeField label="Footer Text">
          <Input value={data.footerText || ""} onFocus={() => setTouched(true)} onChange={(e) => updateNodeData("footerText", e.target.value)} placeholder="Footer text (optional)" className="h-9 text-sm bg-(--input-color)" maxLength={60} />
        </NodeField>

        <NodeField label="Button Text" required error={(touched || data.forceValidation) && !data.buttonText?.trim() ? "Button text is required" : ""}>
          <Input value={data.buttonText || ""} onFocus={() => setTouched(true)} onChange={(e) => updateNodeData("buttonText", e.target.value)} placeholder="Button text" className="h-9 text-sm bg-(--input-color)" maxLength={20} />
        </NodeField>

        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-(--card-border-color)">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-gray-700 dark:text-gray-400">Sections & Items</Label>
            <span className="text-[10px] text-gray-400">{data.sections?.length || 0}/10 items</span>
          </div>

          {(data.sections || []).map((section: any, sIdx: number) => (
            <div key={sIdx} className="space-y-3 rounded-lg border border-gray-100 bg-gray-50/30 p-3 dark:border-(--card-border-color) dark:bg-(--dark-sidebar)">
              <div className="flex items-center justify-between">
                <Input value={section.title || ""} onFocus={() => setTouched(true)} onChange={(e) => updateSectionTitle(sIdx, e.target.value)} placeholder="Section title" className="h-8 text-xs font-bold border-none bg-transparent shadow-none focus-visible:ring-0 p-3" />
                <Button onClick={() => removeSection(sIdx)} variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-red-500">
                  <X size={12} />
                </Button>
              </div>

              <div className="space-y-2 pl-3 border-l-2 border-gray-200 dark:border-(--card-border-color)">
                {section.items.map((item: any, iIdx: number) => (
                  <div key={iIdx} className="relative group bg-white rounded border border-gray-100 p-2 dark:bg-(--dark-sidebar) dark:border-(--card-border-color)">
                    <Button onClick={() => removeItem(sIdx, iIdx)} variant="ghost" size="icon" className="absolute -right-2 -top-2 h-5 w-5 bg-white dark:bg-(--table-hover) dark:border-(--card-border-color) border border-gray-100 rounded-full text-gray-400 hover:text-red-500 z-10 hidden group-hover:flex">
                      <X size={10} />
                    </Button>
                    <Handle type="source" id={`src-item-${sIdx}-${iIdx}`} position={Position.Right} style={{ top: "50%" }} className="w-3! h-3! bg-sky-500! border-2! border-white! dark:border-(--card-border-color)! shadow-sm -right-4" />
                    <Input value={item.title || ""} onFocus={() => setTouched(true)} onChange={(e) => updateItem(sIdx, iIdx, "title", e.target.value)} placeholder="Item title" className="h-7 text-[11px] font-medium border-none shadow-none focus-visible:ring-0 p-3 mb-1" />
                    <Input value={item.description || ""} onFocus={() => setTouched(true)} onChange={(e) => updateItem(sIdx, iIdx, "description", e.target.value)} placeholder="Item description (optional)" className="h-5 text-[10px] text-gray-500 border-none shadow-none focus-visible:ring-0 p-3" />
                  </div>
                ))}

                {section.items.length < 10 && (
                  <Button onClick={() => addItem(sIdx)} variant="ghost" className="w-full h-7 text-[10px] text-blue-600 hover:bg-blue-50/50 dark:hover:bg-(--table-hover) justify-start px-2">
                    <Plus className="mr-1 h-3 w-3" /> Add Item
                  </Button>
                )}
              </div>
            </div>
          ))}

          {(data.sections || []).length < 10 && (
            <Button onClick={addSection} variant="outline" className="w-full h-8 border-dashed border-gray-300 text-blue-600 text-xs">
              <Plus className="mr-1 h-3 w-3" /> Add Section
            </Button>
          )}
        </div>
      </div>
    </BaseNode>
  );
}
