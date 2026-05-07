"use client";

import { Button } from "@/src/elements/ui/button";
import { useCreateFunnelPageMutation } from "@/src/redux/api/funnelPageApi";
import CommonHeader from "@/src/shared/CommonHeader";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function FunnelCreateForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [createFunnel, { isLoading }] = useCreateFunnelPageMutation();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t("funnels.title_required"));
      return;
    }
    try {
      const res = await createFunnel({
        title: title.trim(),
        slug: slug.trim() || undefined,
        blocks: [{ type: "hero", title: title.trim(), subtitle: "" }],
      }).unwrap();
      toast.success(t("funnels.created"));
      router.push(`/tools/funnels/${res.data._id}`);
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message;
      toast.error(msg || t("funnels.create_failed"));
    }
  };

  return (
    <div className="space-y-8 sm:p-8 p-4 max-w-lg">
      <CommonHeader backBtn title={t("funnels.new_title")} description={t("funnels.new_description")} />
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) p-6">
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          {t("funnels.field_title")} *
          <input required className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          {t("funnels.field_slug_optional")}
          <input className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} placeholder={t("funnels.slug_placeholder")} />
        </label>
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="animate-spin mr-2" size={16} />}
            {t("funnels.create_continue")}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/tools/funnels">{t("common.cancel")}</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
