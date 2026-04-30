/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/src/elements/ui/badge";
import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/elements/ui/select";
import { Switch } from "@/src/elements/ui/switch";
import { Textarea } from "@/src/elements/ui/textarea";
import { cn } from "@/src/lib/utils";
import { useGetAllModelsQuery } from "@/src/redux/api/settingsApi";
import { AIModel } from "@/src/types/settings";
import { useFormikContext } from "formik";
import { Bot, Globe, Loader2 } from "lucide-react";
import InfoModal from "../../common/InfoModal";

const StepAIIntelligence = () => {
  const { values, touched, errors, getFieldProps, setFieldValue } = useFormikContext<any>();
  const { data: modelsData, isLoading: loadingModels } = useGetAllModelsQuery();
  const models = (modelsData?.data?.models || []).filter((m: AIModel) => m.status === "active");

  const selected = models.find((m: AIModel) => m._id === values.ai_config?.ai_model);

  return (
    <div className="mx-auto space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-semibold text-lg">
            <Bot size={22} />
            <span>AI Intelligence</span>
          </div>
          <InfoModal dataKey="ai_intelligence" iconSize={22} className="text-gray-400 hover:text-primary transition-colors" />
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a provider and model from your catalog (same list as chatbots and workspace AI). Use an API key that matches that provider.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="text-sm font-medium">AI model</Label>
          <Select
            value={values.ai_config?.ai_model || ""}
            onValueChange={(id) => {
              setFieldValue("ai_config.ai_model", id);
              const m = models.find((x: AIModel) => x._id === id);
              if (m?.model_id) setFieldValue("ai_config.model_id", m.model_id);
            }}
            disabled={loadingModels}
          >
            <SelectTrigger
              className={cn(
                "h-12 rounded-lg",
                (touched.ai_config as any)?.ai_model && (errors.ai_config as any)?.ai_model && "border-red-500"
              )}
            >
              <SelectValue placeholder={loadingModels ? "Loading models…" : "Select a model"} />
            </SelectTrigger>
            <SelectContent className="rounded-lg max-h-72">
              {models.map((model: AIModel) => (
                <SelectItem key={model._id} value={model._id} className="rounded-lg">
                  <span className="font-medium">{model.display_name}</span>
                  <span className="text-muted-foreground text-xs ml-2">({model.provider})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingModels && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading catalog…
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">API key</Label>
          <Input
            type="password"
            placeholder="••••••••••••••••"
            {...getFieldProps("ai_config.api_key")}
            className={cn("h-12 rounded-lg", (touched.ai_config as any)?.api_key && (errors.ai_config as any)?.api_key && "border-red-500")}
          />
        </div>
      </div>

      {selected && (
        <div className="p-3 bg-slate-50 dark:bg-(--page-body-bg) rounded-lg border border-slate-100 dark:border-(--card-border-color) flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Provider</span>
          <Badge variant="secondary" className="uppercase text-[10px]">
            {selected.provider}
          </Badge>
          <span className="text-muted-foreground">Model id</span>
          <span className="font-mono text-xs">{selected.model_id}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">System instructions / personality</Label>
          <Textarea
            placeholder="You are a helpful customer service representative for a luxury hotel..."
            {...getFieldProps("ai_config.prompt")}
            className="min-h-40 rounded-lg p-4 shadow-inner"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <Globe size={14} /> Knowledge base URL
            </Label>
            <Input placeholder="https://docs.yourcompany.com" {...getFieldProps("ai_config.training_url")} className="rounded-lg h-12" />
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-(--page-body-bg) rounded-lg border border-slate-100 dark:border-(--card-border-color)">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold">Natural conciseness</span>
              <p className="text-[10px] text-slate-500 leading-tight">Optimizes AI for vocal naturalness.</p>
            </div>
            <Switch checked={values.ai_config.include_concise_instruction} onCheckedChange={(val) => setFieldValue("ai_config.include_concise_instruction", val)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepAIIntelligence;
