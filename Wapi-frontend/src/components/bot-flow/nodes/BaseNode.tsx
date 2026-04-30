"use client";

import { Button } from "@/src/elements/ui/button";
import { cn } from "@/src/lib/utils";
import { BaseNodeProps } from "@/src/types/botFlow";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { AlertCircle, X } from "lucide-react";
import React from "react";

export function BaseNode({
  id,
  title,
  icon,
  iconBgColor = "bg-gray-100",
  iconColor = "text-gray-600",
  borderColor = "border-gray-200",
  handleColor = "bg-primary!",
  errors = [],
  children,
  showInHandle = true,
  showOutHandle = true,
  headerRight,
  className,
  filledHeader,
  filledHeaderTone = "violet",
}: BaseNodeProps) {
  const { deleteElements } = useReactFlow();
  const headerBarClass = filledHeader ? (filledHeaderTone === "emerald" ? "bg-primary" : "bg-violet-600") : "";

  return (
    <div
      className={cn(
        "relative w-80 rounded-lg border-2 bg-white shadow-lg dark:bg-(--card-color) dark:shadow-(--table-hover) dark:border-(--card-border-color) transition-all",
        filledHeader ? "overflow-hidden p-0 pb-4" : "p-4",
        errors.length > 0 ? "border-red-200 shadow-red-50 dark:border-(--card-border-color)" : borderColor,
        className,
      )}
    >
      {showInHandle && <Handle type="target" id="tgt" position={Position.Left} className={cn("w-3! h-3! border-2! border-white! dark:border-(--card-border-color)! shadow-sm", handleColor)} />}

      <div
        className={cn(
          "mb-4 flex items-center gap-2",
          filledHeader ? `mx-0 mb-0 px-4 py-3 text-white ${headerBarClass}` : "",
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
            filledHeader ? "bg-white/20 text-white" : iconBgColor,
            !filledHeader && iconColor,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className={cn("truncate text-[15px] font-bold", filledHeader ? "text-white" : "text-gray-900 dark:text-gray-300")}>{title}</div>
          {headerRight}
        </div>
        <Button
          onClick={() => deleteElements({ nodes: [{ id }] })}
          size="icon"
          variant="ghost"
          className={cn(
            "h-6 w-6 shrink-0 rounded-full",
            filledHeader ? "text-white/90 hover:bg-white/10 hover:text-white" : "text-gray-400 hover:text-red-500",
          )}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {errors.length > 0 && (
        <div className={cn("mb-4 rounded-lg border border-red-100 dark:bg-(--dark-sidebar) bg-red-50 p-3 dark:border-(--card-border-color)", filledHeader && "mx-4 mt-2")}>
          <div className="flex items-start gap-2 text-red-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold mb-1 text-red-900">Please fix the following:</div>
              <ul className="text-[11px] list-disc list-inside space-y-0.5 opacity-90 text-red-800">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className={cn("space-y-4", filledHeader && "px-4 pt-4")}>{children}</div>

      {showOutHandle && <Handle type="source" id="src" position={Position.Right} className={cn("w-3! h-3! border-2! border-white! dark:border-(--card-border-color)! shadow-sm", handleColor)} />}
    </div>
  );
}
