import FunnelViewTracker from "@/src/components/funnels/FunnelViewTracker";
import FunnelWidgetScripts from "@/src/components/funnels/FunnelWidgetScripts";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug?: string[] }> };

export type PublicFunnelPayload = {
  title: string;
  blocks: Array<Record<string, unknown> & { type: string }>;
  widgets: { whatsapp_api_key: string | null; chatbot_api_key: string | null };
  public_id: string;
  ab_variant: "A" | "B" | null;
  custom_domain: string | null;
};

function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");
}

function scriptOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api";
  const withApi = raw.includes("/api") ? raw.replace(/\/$/, "") : `${raw.replace(/\/$/, "")}/api`;
  return withApi.replace(/\/api\/?$/, "");
}

async function fetchPublicFunnel(slug: string[] | undefined): Promise<PublicFunnelPayload | null> {
  const base = apiBaseUrl();
  if (!slug?.length) return null;
  let url: string;
  if (slug.length === 1) {
    url = `${base}/public/funnel/${encodeURIComponent(slug[0])}`;
  } else if (slug.length === 3 && slug[0] === "w") {
    url = `${base}/public/funnel/w/${encodeURIComponent(slug[1])}/${encodeURIComponent(slug[2])}`;
  } else {
    return null;
  }
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json?.success) return null;
  return json.data as PublicFunnelPayload;
}

function renderBlock(block: Record<string, unknown> & { type: string }, i: number) {
  switch (block.type) {
    case "hero":
      return (
        <section key={i} className="space-y-4">
          <h2 className="text-2xl font-bold">{String(block.title || "")}</h2>
          {block.subtitle ? <p className="text-lg text-slate-600">{String(block.subtitle)}</p> : null}
          {block.ctaLabel && block.ctaUrl ? (
            <a href={String(block.ctaUrl)} className="inline-block rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
              {String(block.ctaLabel)}
            </a>
          ) : null}
        </section>
      );
    case "text":
      return (
        <section key={i} className="prose prose-slate max-w-none">
          <p className="whitespace-pre-wrap text-slate-700">{String(block.body ?? "")}</p>
        </section>
      );
    case "image":
      return (
        <section key={i}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={String(block.url || "")} alt={String(block.alt || "")} className="w-full rounded-xl border border-slate-200 object-cover max-h-[480px]" />
        </section>
      );
    case "button":
      return (
        <section key={i}>
          <a href={String(block.url || "#")} className="inline-block rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
            {String(block.label || "Link")}
          </a>
        </section>
      );
    default:
      return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchPublicFunnel(slug);
  return { title: data?.title || "Page" };
}

export default async function PublicFunnelCatchAllPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await fetchPublicFunnel(slug);
  if (!data) notFound();

  const origin = scriptOrigin();
  const scriptSrc = `${origin}/public/widget.js`;
  const apiBase = apiBaseUrl();

  return (
    <>
      <main className="min-h-screen bg-slate-50 text-slate-900">
        {data.custom_domain ? (
          <p className="text-center text-xs text-amber-800 bg-amber-50 py-2 px-4">
            Custom domain target: {data.custom_domain} — point DNS to this app when supported.
          </p>
        ) : null}
        <article className="mx-auto max-w-2xl px-4 py-12 space-y-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{data.title}</h1>
          {(data.blocks || []).map((b, idx) => renderBlock(b, idx))}
        </article>
      </main>
      <FunnelWidgetScripts scriptSrc={scriptSrc} whatsappKey={data.widgets.whatsapp_api_key} chatbotKey={data.widgets.chatbot_api_key} />
      <FunnelViewTracker apiBase={apiBase} publicId={data.public_id} abVariant={data.ab_variant} />
    </>
  );
}
