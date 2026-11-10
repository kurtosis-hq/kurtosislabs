import { notFound } from "next/navigation";
import { getVariant, variants } from "@/components/site/variants";
import { positions } from "@/data/ratings";
import { PositionPage } from "@/components/site/pages/position";

// Review build: blocking navigation is fine.
export const instant = false;

export function generateStaticParams() {
  return variants.flatMap((v) => positions.map((p) => ({ variant: v.id, slug: p.slug })));
}

export default async function Page({ params }: PageProps<"/v/[variant]/positions/[slug]">) {
  const { variant, slug } = await params;
  const v = getVariant(variant);
  if (!v) notFound();
  return <PositionPage v={v} slug={slug} />;
}
