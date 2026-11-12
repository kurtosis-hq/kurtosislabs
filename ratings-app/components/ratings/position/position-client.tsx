"use client";
// Reads the tab, route and evidence filter from the URL in the browser, so the position pages can be
// served as static files (the server-rendered version read them per request).
import { useSearchParams } from "next/navigation";
import { getPosition } from "@/data/ratings";
import { PositionView, parseQuery } from "./position-view";

export function PositionClient({ slug }: { slug: string }) {
  const sp = useSearchParams();
  const p = getPosition(slug)!;
  return <PositionView p={p} q={parseQuery(p, Object.fromEntries(sp.entries()))} />;
}
