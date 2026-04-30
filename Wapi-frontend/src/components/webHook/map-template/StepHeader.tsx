"use client";

import { Button } from "@/src/elements/ui/button";
import { StepHeaderProps } from "@/src/types/webhook";
import { ArrowLeft } from "lucide-react";

const StepHeader = ({ step, router, setStep }: StepHeaderProps) => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => (step === 1 ? router.push("/webhooks") : setStep(1))}
        className="rounded-full hover:bg-sky-50 dark:hover:bg-sky-500/10 h-10 w-10 transition-colors"
      >
        <ArrowLeft size={20} />
      </Button>
      <div className="flex flex-wrap gap-3 sm:gap-0">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Webhook Configuration
        </h1>
          <span className="ml-3 text-sm font-medium text-sky-500 bg-sky-50 dark:bg-sky-500/10 px-3 py-1 rounded-full border border-sky-100 dark:border-sky-500/20">
            Step {step} of 2
          </span>
      </div>
    </div>
        <p className="text-sm text-slate-500 font-medium tracking-tight">
          {step === 1 ? "Select your WABA and message template" : "Map your webhook payload fields to template variables"}
        </p>
  </div>
);

export default StepHeader;
