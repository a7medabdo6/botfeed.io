"use client";

import { Button } from "@/src/elements/ui/button";
import Can from "@/src/components/shared/Can";
import SortableFunnelBlocks from "@/src/components/funnels/SortableFunnelBlocks";
import {
  useGetFunnelAnalyticsQuery,
  useGetFunnelPageByIdQuery,
  useGetFunnelVersionsQuery,
  usePublishFunnelPageMutation,
  useUpdateFunnelPageMutation,
  type FunnelBlock,
  type FunnelPageData,
} from "@/src/redux/api/funnelPageApi";
import { useGetWidgetConfigsQuery } from "@/src/redux/api/widgetConfigApi";
import { useGetWorkspacesQuery } from "@/src/redux/api/workspaceApi";
import CommonHeader from "@/src/shared/CommonHeader";
import { Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const emptyBlock = (type: FunnelBlock["type"]): FunnelBlock => {
  switch (type) {
    case "hero":
      return { type: "hero", title: "", subtitle: "", ctaLabel: "", ctaUrl: "" };
    case "text":
      return { type: "text", body: "" };
    case "image":
      return { type: "image", url: "", alt: "" };
    case "button":
      return { type: "button", label: "", url: "" };
    default:
      return { type: "text", body: "" };
  }
};

function workspaceIdFromFunnel(f: FunnelPageData): string {
  const w = f.workspace_id;
  if (!w) return "";
  if (typeof w === "object" && "_id" in w) return w._id;
  return String(w);
}

function workspaceSlugFromFunnel(f: FunnelPageData): string | null {
  const w = f.workspace_id;
  if (w && typeof w === "object" && "slug" in w && w.slug) return String(w.slug);
  return null;
}

function FunnelEditorForm({
  funnel,
  refetch,
  publishedStatus,
  publicId,
}: {
  funnel: FunnelPageData;
  refetch: () => void;
  publishedStatus: FunnelPageData["status"];
  publicId: string | undefined;
}) {
  const { t } = useTranslation();
  const initialWorkspaceId = workspaceIdFromFunnel(funnel);
  const [workspaceId, setWorkspaceId] = useState(initialWorkspaceId);
  const { data: widgetsRes } = useGetWidgetConfigsQuery(workspaceId ? { workspace_id: workspaceId } : undefined);
  const { data: wsRes } = useGetWorkspacesQuery();
  const [updateFunnel, { isLoading: isSaving }] = useUpdateFunnelPageMutation();
  const [publishFunnel, { isLoading: isPublishing }] = usePublishFunnelPageMutation();
  const { data: versionsRes } = useGetFunnelVersionsQuery(funnel._id);
  const { data: analyticsRes } = useGetFunnelAnalyticsQuery({ id: funnel._id, days: 30 });

  const [title, setTitle] = useState(funnel.title);
  const [slug, setSlug] = useState(funnel.slug);
  const [blocks, setBlocks] = useState<FunnelBlock[]>(
    Array.isArray(funnel.blocks) && funnel.blocks.length ? funnel.blocks : [{ type: "hero", title: funnel.title || "Welcome", subtitle: "" }]
  );
  const [waId, setWaId] = useState(funnel.whatsapp_widget_config_id || "");
  const [botId, setBotId] = useState(funnel.chatbot_widget_config_id || "");
  const [customDomain, setCustomDomain] = useState(funnel.custom_domain || "");
  const [abEnabled, setAbEnabled] = useState(Boolean(funnel.ab_test_enabled));
  const [abBlocksB, setAbBlocksB] = useState<FunnelBlock[]>(Array.isArray(funnel.ab_blocks_b) ? funnel.ab_blocks_b : []);
  const [abPct, setAbPct] = useState(funnel.ab_traffic_a_percent ?? 50);

  const workspaces = wsRes?.data || [];
  const widgets = useMemo(() => widgetsRes?.data || [], [widgetsRes?.data]);
  const waOptions = useMemo(() => widgets.filter((w) => w.mode === "whatsapp"), [widgets]);
  const botOptions = useMemo(() => widgets.filter((w) => w.mode === "chatbot"), [widgets]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const savedWsSlug = workspaceSlugFromFunnel(funnel);
  const selectedWsSlug = workspaces.find((w) => w._id === workspaceId)?.slug || savedWsSlug;
  const prettyPath =
    publishedStatus === "published" && selectedWsSlug && slug
      ? `${origin}/f/w/${selectedWsSlug}/${slug}`
      : publicId
        ? `${origin}/f/${publicId}`
        : "";

  const copyPublic = () => {
    const url = prettyPath || (publicId ? `${origin}/f/${publicId}` : "");
    if (!url) return;
    void navigator.clipboard.writeText(url);
    toast.success(t("funnels.public_url_copied"));
  };

  const payload = () => ({
    title,
    slug,
    blocks,
    whatsapp_widget_config_id: waId || null,
    chatbot_widget_config_id: botId || null,
    workspace_id: workspaceId || null,
    custom_domain: customDomain.trim() || null,
    ab_test_enabled: abEnabled,
    ab_blocks_b: abBlocksB,
    ab_traffic_a_percent: abPct,
  });

  const save = async () => {
    try {
      await updateFunnel({
        id: funnel._id,
        data: payload(),
      }).unwrap();
      toast.success(t("funnels.saved"));
      refetch();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message;
      toast.error(msg || t("funnels.save_failed"));
    }
  };

  const publish = async () => {
    try {
      await updateFunnel({
        id: funnel._id,
        data: payload(),
      }).unwrap();
      await publishFunnel(funnel._id).unwrap();
      toast.success(t("funnels.published"));
      refetch();
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message;
      toast.error(msg || t("funnels.publish_failed"));
    }
  };

  const renderBlockEditor = (block: FunnelBlock, idx: number, patch: (p: Partial<FunnelBlock>) => void) => {
    if (block.type === "hero") {
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="Title" value={block.title} onChange={(e) => patch({ title: e.target.value })} />
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="Subtitle" value={block.subtitle || ""} onChange={(e) => patch({ subtitle: e.target.value })} />
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="CTA label" value={block.ctaLabel || ""} onChange={(e) => patch({ ctaLabel: e.target.value })} />
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="CTA URL" value={block.ctaUrl || ""} onChange={(e) => patch({ ctaUrl: e.target.value })} />
        </div>
      );
    }
    if (block.type === "text") {
      return <textarea className="w-full min-h-24 rounded border px-2 py-1.5 text-sm" value={block.body} onChange={(e) => patch({ body: e.target.value })} />;
    }
    if (block.type === "image") {
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="Image URL" value={block.url} onChange={(e) => patch({ url: e.target.value })} />
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="Alt" value={block.alt || ""} onChange={(e) => patch({ alt: e.target.value })} />
        </div>
      );
    }
    if (block.type === "button") {
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="Label" value={block.label} onChange={(e) => patch({ label: e.target.value })} />
          <input className="rounded border px-2 py-1.5 text-sm" placeholder="URL" value={block.url} onChange={(e) => patch({ url: e.target.value })} />
        </div>
      );
    }
    return null;
  };

  const versions = versionsRes?.data || [];
  const analytics = analyticsRes?.data;

  return (
    <div className="space-y-8 sm:p-8 p-4 max-w-3xl mx-auto">
      <CommonHeader backBtn title={t("funnels.edit_title")} description={t("funnels.edit_description")} />

      <div className="space-y-4 rounded-xl border border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t("funnels.field_title")}
            <input className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-(--input-color) px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t("funnels.field_slug")}
            <input className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-(--input-color) px-3 py-2 text-sm" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} />
          </label>
        </div>

        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          {t("funnels.field_workspace")}
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-(--input-color) px-3 py-2 text-sm"
            value={workspaceId}
            onChange={(e) => {
              setWorkspaceId(e.target.value);
              setWaId("");
              setBotId("");
            }}
          >
            <option value="">{t("funnels.workspace_none")}</option>
            {workspaces.map((w) => (
              <option key={w._id} value={w._id}>
                {w.name}
                {w.slug ? ` (${w.slug})` : ""}
              </option>
            ))}
          </select>
        </label>
        <p className="text-[11px] text-slate-500">{t("funnels.workspace_hint")}</p>

        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          {t("funnels.field_custom_domain")}
          <input
            className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-(--input-color) px-3 py-2 text-sm"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
            placeholder="links.example.com"
          />
        </label>
        <p className="text-[11px] text-slate-500">{t("funnels.custom_domain_hint")}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t("funnels.field_whatsapp_widget")}
            <select className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-(--input-color) px-3 py-2 text-sm" value={waId} onChange={(e) => setWaId(e.target.value)}>
              <option value="">{t("funnels.widget_none")}</option>
              {waOptions.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {t("funnels.field_chatbot_widget")}
            <select className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-(--input-color) px-3 py-2 text-sm" value={botId} onChange={(e) => setBotId(e.target.value)}>
              <option value="">{t("funnels.widget_none")}</option>
              {botOptions.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-[11px] text-slate-500">{t("funnels.widget_hint")}</p>

        {publishedStatus === "published" && (prettyPath || publicId) && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 dark:bg-(--page-body-bg) p-3 text-xs">
            <span className="text-slate-600 dark:text-slate-400 shrink-0">{t("funnels.public_url")}</span>
            <code className="flex-1 min-w-0 truncate text-primary">{prettyPath || `${origin}/f/${publicId}`}</code>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={copyPublic}>
              <Copy size={14} />
            </Button>
            <Button type="button" variant="outline" size="sm" asChild>
              <a
                href={
                  publishedStatus === "published" && selectedWsSlug && slug
                    ? `/f/w/${selectedWsSlug}/${slug}`
                    : publicId
                      ? `/f/${publicId}`
                      : "#"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("funnels.open_public")}
              </a>
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-white">{t("funnels.ab_section")}</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={abEnabled} onChange={(e) => setAbEnabled(e.target.checked)} className="rounded border-slate-300" />
          {t("funnels.ab_enable")}
        </label>
        {abEnabled && (
          <>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              {t("funnels.ab_traffic_a")} ({abPct}%)
              <input type="range" min={1} max={99} value={abPct} onChange={(e) => setAbPct(parseInt(e.target.value, 10) || 50)} className="mt-1 w-full" />
            </label>
            <p className="text-xs text-slate-500">{t("funnels.ab_variant_b")}</p>
            <SortableFunnelBlocks blocks={abBlocksB} onChange={setAbBlocksB} onAdd={(type) => setAbBlocksB((b) => [...b, emptyBlock(type)])} renderBlockEditor={renderBlockEditor} />
          </>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-white">{t("funnels.blocks")}</h2>
        <p className="text-xs text-slate-500">{t("funnels.blocks_dnd_hint")}</p>
        <SortableFunnelBlocks blocks={blocks} onChange={setBlocks} onAdd={(type) => setBlocks((b) => [...b, emptyBlock(type)])} renderBlockEditor={renderBlockEditor} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) p-4">
          <h3 className="text-sm font-semibold mb-2">{t("funnels.analytics_title")}</h3>
          {analytics ? (
            <ul className="text-xs text-slate-600 space-y-1">
              <li>
                {t("funnels.analytics_views")}: <strong>{analytics.totals.views}</strong>
              </li>
              <li>
                {t("funnels.analytics_cta")}: <strong>{analytics.totals.cta_clicks}</strong>
              </li>
              {Object.keys(analytics.ab_split || {}).length > 0 && (
                <li>
                  A/B: {Object.entries(analytics.ab_split || {})
                    .map(([k, v]) => `${k}:${v}`)
                    .join(" · ")}
                </li>
              )}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">—</p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-(--card-border-color) bg-white dark:bg-(--card-color) p-4 max-h-48 overflow-y-auto">
          <h3 className="text-sm font-semibold mb-2">{t("funnels.versions_title")}</h3>
          {versions.length === 0 ? (
            <p className="text-xs text-slate-400">{t("funnels.versions_empty")}</p>
          ) : (
            <ul className="text-xs space-y-1">
              {versions.map((v) => (
                <li key={v._id} className="flex justify-between gap-2 border-b border-slate-100 pb-1">
                  <span>v{v.version}</span>
                  <span className="text-slate-400 shrink-0">{new Date(v.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Can permission="update.funnel_pages">
          <Button onClick={() => void save()} disabled={isSaving}>
            {isSaving && <Loader2 className="animate-spin mr-2" size={16} />}
            {t("common.save_changes")}
          </Button>
          <Button variant="secondary" onClick={() => void publish()} disabled={isPublishing || isSaving}>
            {isPublishing && <Loader2 className="animate-spin mr-2" size={16} />}
            {t("funnels.publish")}
          </Button>
        </Can>
        <Button variant="outline" type="button" asChild>
          <Link href="/tools/funnels">{t("common.back")}</Link>
        </Button>
      </div>
    </div>
  );
}

export default function FunnelEditor({ funnelId }: { funnelId: string }) {
  const { data, isLoading, refetch } = useGetFunnelPageByIdQuery(funnelId);
  const funnel = data?.data;

  if (isLoading || !funnel) {
    return (
      <div className="flex justify-center py-24 text-slate-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <FunnelEditorForm
      key={funnel._id}
      funnel={funnel}
      refetch={refetch}
      publishedStatus={funnel.status}
      publicId={funnel.public_id}
    />
  );
}
