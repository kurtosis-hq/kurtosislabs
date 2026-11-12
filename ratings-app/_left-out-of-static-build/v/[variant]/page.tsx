import { notFound } from "next/navigation";
import { getVariant } from "@/components/site/variants";
import { OverviewPage } from "@/components/site/pages/overview";

// Review build: blocking navigation is fine.
export const instant = false;

export default async function Page({ params }: PageProps<"/v/[variant]">) {
  const { variant } = await params;
  const v = getVariant(variant);
  if (!v) notFound();
  return <OverviewPage v={v} />;
}
