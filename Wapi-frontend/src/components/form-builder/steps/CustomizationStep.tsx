/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { Switch } from "@/src/elements/ui/switch";
import { Textarea } from "@/src/elements/ui/textarea";
import { useFormikContext } from "formik";

const CustomizationStep = () => {
  const { values, setFieldValue } = useFormikContext<any>();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8">
        <div className="space-y-5">
          <div className="pb-2 border-b border-slate-100 dark:border-(--card-border-color)">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Visual Appearance</h2>
            <p className="text-xs text-slate-500">Customize how your form looks</p>
          </div>

          <div className="pt-3 space-y-5">
            <div className="p-5 flex items-center justify-between bg-slate-50/80 dark:bg-(--page-body-bg) rounded-lg border border-slate-100 dark:border-(--card-border-color) ">
              <div className="space-y-1">
                <Label className="text-[13px] font-semibold">Theme Color</Label>
                <div className="text-[11px] text-slate-500">Primary color for buttons and accents</div>
              </div>
              <div className="flex items-center gap-3 relative">
                <div className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-700 shadow-md transition-transform hover:scale-110" style={{ backgroundColor: values.appearance.theme_color }} />
                <Input type="color" className="absolute w-12 h-9 p-0 border-none bg-transparent cursor-pointer ring-offset-background focus-visible:ring-0 opacity-0" value={values.appearance.theme_color} onChange={(e) => setFieldValue("appearance.theme_color", e.target.value)} />
              </div>
            </div>

            <div className="p-5 flex items-center justify-between bg-slate-50/80 dark:bg-(--page-body-bg) rounded-lg border border-slate-100 dark:border-(--card-border-color) ">
              <div className="space-y-1">
                <Label className="text-[13px] font-semibold">Show Branding</Label>
                <div className="text-[11px] text-slate-500">{'Display "Powered by Botfeed"'}</div>
              </div>
              <Switch checked={values.appearance.show_branding} onCheckedChange={(checked) => setFieldValue("appearance.show_branding", checked)} />
            </div>
          </div>
        </div>
      </div>

      {/* Submission Settings */}
      <div className="space-y-8">
        <div className="space-y-5">
          <div className="pb-2 border-b border-slate-100 dark:border-(--card-border-color) pt-4 lg:pt-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Submission Settings</h2>
            <p className="text-xs text-slate-500">What happens after the form is submitted</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="submit_button_text" className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                Submit Button Text
              </Label>
              <Input id="submit_button_text" value={values.submit_settings.button_text} onChange={(e) => setFieldValue("submit_settings.button_text", e.target.value)} placeholder="Submit" className="h-11 rounded-lg bg-slate-50/50 dark:bg-(--page-body-bg) border-slate-200 dark:border-(--card-border-color)" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="success_message" className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                Success Message
              </Label>
              <Textarea id="success_message" value={values.submit_settings.success_message} onChange={(e) => setFieldValue("submit_settings.success_message", e.target.value)} placeholder="Thank you for your submission!" rows={3} className="rounded-lg bg-slate-50/50 dark:bg-(--page-body-bg) border-slate-200 dark:border-(--card-border-color) resize-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationStep;
