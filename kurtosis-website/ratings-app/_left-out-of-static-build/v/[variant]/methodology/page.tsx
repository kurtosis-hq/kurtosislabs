import { notFound } from "next/navigation";
import { getVariant } from "@/components/site/variants";
import { MethodologyPage } from "@/components/site/pages/methodology";

// Review build: blocking navigation is fine.
export const instant = false;

export default async function Page({ params }: PageProps<"/v/[variant]/methodology">) {
  const { variant } = await params;
  const v = getVariant(variant);
  if (!v) notFound();
  return <MethodologyPage v={v} />;
}
