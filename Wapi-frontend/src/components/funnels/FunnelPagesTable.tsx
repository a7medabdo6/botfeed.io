"use client";

import { Button } from "@/src/elements/ui/button";
import { useDeleteFunnelPageMutation, useGetFunnelPagesQuery, type FunnelPageData } from "@/src/redux/api/funnelPageApi";
import CommonHeader from "@/src/shared/CommonHeader";
import Can from "@/src/components/shared/Can";
import { Copy, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const FunnelPagesTable = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, refetch } = useGetFunnelPagesQuery();
  const [deleteFunnel, { isLoading: isDeleting }] = useDeleteFunnelPageMutation();
  const rows = data?.data || [];

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const publicPath = (f: FunnelPageData) => {
    const w = f.workspace_id;
    const wsSlug = w && typeof w === "object" && "slug" in w && w.slug ? String(w.slug) : "";
    if (f.status === "published" && wsSlug && f.slug) return `/f/w/${wsSlug}/${f.slug}`;
    if (f.status === "published" && f.public_id) return `/f/${f.public_id}`;
    return "";
  };

  const publicUrl = (f: FunnelPageData) => {
    const path = publicPath(f);
    return path ? `${origin}${path}` : "";
  };

  const copyPublicUrl = (f: FunnelPageData) => {
    const url = publicUrl(f);
    if (!url) return;
    void navigator.clipboard.writeText(url);
    toast.success(t("funnels.public_url_copied"));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("funnels.delete_confirm"))) return;
    try {
      await deleteFunnel(id).unwrap();
      toast.success(t("funnels.deleted"));
    } catch {
      toast.error(t("funnels.delete_failed"));
    }
  };

  return (
    <div className="space-y-6">
      <CommonHeader
        title={t("funnels.title")}
        description={t("funnels.list_description")}
        onRefresh={refetch}
        isLoading={isLoading}
      />
      <div className="flex justify-end">
        <Can permission="create.funnel_pages">
          <Button onClick={() => router.push("/tools/funnels/new")} className="gap-2">
            <Plus size={18} />
            {t("funnels.new")}
          </Button>
        </Can>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16 text-slate-500">
            <Loader2 className="animate-spin" size={28} />
          </div>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-slate-500 text-sm">{t("funnels.empty")}</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-(--table-hover) text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">{t("funnels.col_title")}</th>
                <th className="px-4 py-3 font-semibold">{t("funnels.col_slug")}</th>
                <th className="px-4 py-3 font-semibold">{t("funnels.col_status")}</th>
                <th className="px-4 py-3 font-semibold text-right">{t("funnels.col_actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f._id} className="border-t border-slate-100 dark:border-(--card-border-color)">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{f.title}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{f.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        f.status === "published"
                          ? "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Can permission="update.funnel_pages">
                      <Button variant="ghost" size="sm" asChild className="h-9">
                        <Link href={`/tools/funnels/${f._id}`}>{t("common.edit")}</Link>
                      </Button>
                    </Can>
                    {f.status === "published" && (f.public_id || f.slug) && (
                      <Button variant="outline" size="sm" className="h-9 gap-1" onClick={() => copyPublicUrl(f)} title={t("funnels.copy_public_url")}>
                        <Copy size={14} />
                      </Button>
                    )}
                    {f.status === "published" && (f.public_id || f.slug) && (
                      <Button variant="outline" size="sm" className="h-9 gap-1" asChild>
                        <a href={publicPath(f) || "#"} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} />
                        </a>
                      </Button>
                    )}
                    <Can permission="delete.funnel_pages">
                      <Button variant="ghost" size="sm" className="h-9 text-red-600" disabled={isDeleting} onClick={() => handleDelete(f._id)}>
                        <Trash2 size={16} />
                      </Button>
                    </Can>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FunnelPagesTable;
