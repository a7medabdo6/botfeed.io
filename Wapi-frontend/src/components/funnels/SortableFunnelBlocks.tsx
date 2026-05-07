"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/src/elements/ui/button";
import type { FunnelBlock } from "@/src/redux/api/funnelPageApi";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

function SortableBlockRow({
  id,
  children,
  onRemove,
}: {
  id: string;
  children: React.ReactNode;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) relative">
      <button
        type="button"
        className="absolute left-1 top-2 z-10 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-(--table-hover) cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500 z-10" onClick={onRemove}>
        <Trash2 size={16} />
      </Button>
      <div className="pl-10 pr-12 pt-2 pb-3">{children}</div>
    </div>
  );
}

type BlockType = FunnelBlock["type"];

export default function SortableFunnelBlocks({
  blocks,
  onChange,
  onAdd,
  renderBlockEditor,
}: {
  blocks: FunnelBlock[];
  onChange: (next: FunnelBlock[]) => void;
  onAdd: (type: BlockType) => void;
  renderBlockEditor: (block: FunnelBlock, idx: number, patch: (p: Partial<FunnelBlock>) => void) => React.ReactNode;
}) {
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const curIds = blocks.map((_, i) => `blk-${i}`);
    const oldIndex = curIds.indexOf(String(active.id));
    const newIndex = curIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(blocks, oldIndex, newIndex));
  };

  const patchAt = (idx: number, patch: Partial<FunnelBlock>) => {
    onChange(blocks.map((b, i) => (i === idx ? ({ ...b, ...patch } as FunnelBlock) : b)));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1 justify-end">
        {(["hero", "text", "image", "button"] as const).map((type) => (
          <Button key={type} type="button" variant="outline" size="sm" onClick={() => onAdd(type)}>
            <Plus size={14} className="mr-1" />
            {t(`funnels.add_${type}`)}
          </Button>
        ))}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((_, i) => `blk-${i}`)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block, idx) => (
              <SortableBlockRow key={`blk-${idx}-${block.type}`} id={`blk-${idx}`} onRemove={() => onChange(blocks.filter((_, i) => i !== idx))}>
                <p className="text-xs font-bold text-primary uppercase mb-2">{block.type}</p>
                {renderBlockEditor(block, idx, (p) => patchAt(idx, p))}
              </SortableBlockRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
