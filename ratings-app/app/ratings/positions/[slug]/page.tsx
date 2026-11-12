import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPosition, positions } from "@/data/ratings";
import { PositionView, parseQuery } from "@/components/ratings/position/position-view";
import { PositionClient } from "@/components/ratings/position/position-client";

export function generateStaticParams() {
  return positions.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ratings/positions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getPosition(slug);
  return { title: p ? `${p.symbol} assessment` : "Position" };
}

// Built as a static page: the default tab is in the HTML, and the browser switches to the tab,
// route and evidence filter named in the URL (?tab=, &route=, &state=).
export default async function Page({ params }: PageProps<"/ratings/positions/[slug]">) {
  const { slug } = await params;
  const p = getPosition(slug);
  if (!p) notFound();
  return (
    <Suspense fallback={<PositionView p={p} q={parseQuery(p, {})} />}>
      <PositionClient slug={slug} />
    </Suspense>
  );
}
