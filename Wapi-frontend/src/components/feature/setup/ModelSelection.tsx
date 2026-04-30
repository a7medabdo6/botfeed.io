"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/elements/ui/card";
import { ModelSelectionProps } from "@/src/types/components";
import { CheckCircle2, Sparkles } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useTranslation } from "react-i18next";

const ModelSelection: React.FC<ModelSelectionProps> = ({ models, selectedModel, onSelect }) => {
  const { t } = useTranslation();

  return (
    <Card className="dark:border-(--card-border-color) border shadow-sm bg-white dark:bg-(--card-color) overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="p-3 rounded-lg bg-primary text-white shadow-lg shadow-sky-500/20">
          <Sparkles size={24} />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl">{t("setup.ai_model")}</CardTitle>
          <CardDescription>{t("setup.choose_assistant")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 max-h-107.5 overflow-auto custom-scrollbar">
        {models.map((model) => (
          <div
            key={model._id}
            onClick={() => onSelect(model._id)}
            className={`relative p-4 rounded-lg border transition-all cursor-pointer group flex items-center gap-4 [@media(max-width:355px)]:flex-col
              ${selectedModel === model._id ? "border-primary bg-sky-50/30 dark:bg-(--table-hover) shadow-md shadow-sky-500/10" : "border-slate-100 dark:border-(--card-border-color) hover:border-[#b8ebcc8c] dark:hover:border-(--card-border-color) hover:bg-slate-50/50 dark:hover:bg-(--table-hover)"}`}
          >
            <div
              className={`p-2.5 rounded-lg shrink-0 transition-colors
              ${selectedModel === model._id ? "bg-primary text-white" : "bg-slate-100 dark:bg-(--dark-sidebar) text-slate-500 group-hover:bg-(--light-primary) group-hover:text-primary dark:group-hover:bg-sky-500/20"}
            `}
            >
              {model.icon ? <Image src={model.icon} alt={model.display_name} width={28} height={28} className="object-contain" /> : <Sparkles size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-bold text-slate-900 dark:text-white">{model.display_name}</span>
                {selectedModel === model._id && <CheckCircle2 size={16} className="text-primary fill-primary-500/10" />}
              </div>
              <p className="text-sm text-slate-500 dark:text-gray-500 truncate">{model.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ModelSelection;
