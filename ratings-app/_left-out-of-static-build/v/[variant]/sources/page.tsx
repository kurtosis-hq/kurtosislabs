import { notFound } from "next/navigation";
import { getVariant } from "@/components/site/variants";
import { SourcesPage } from "@/components/site/pages/sources";

// Review build: blocking navigation is fine.
export const instant = false;

export default async function Page({ params }: PageProps<"/v/[variant]/sources">) {
  const { variant } = await params;
  const v = getVariant(variant);
  if (!v) notFound();
  return <SourcesPage v={v} />;
}
