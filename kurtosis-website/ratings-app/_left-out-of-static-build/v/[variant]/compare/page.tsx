import { notFound } from "next/navigation";
import { getVariant } from "@/components/site/variants";
import { ComparePage } from "@/components/site/pages/compare";

// Review build: blocking navigation is fine.
export const instant = false;

export default async function Page({ params }: PageProps<"/v/[variant]/compare">) {
  const { variant } = await params;
  const v = getVariant(variant);
  if (!v) notFound();
  return <ComparePage v={v} />;
}
