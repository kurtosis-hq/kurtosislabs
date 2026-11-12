import { notFound } from "next/navigation";
import { DesignNotes, SiteNav } from "@/components/site/chrome";
import { getVariant, variantStyle, variants } from "@/components/site/variants";

// Review build: blocking navigation is fine, so skip Instant Navigation validation.
export const instant = false;

export function generateStaticParams() {
  return variants.map((v) => ({ variant: v.id }));
}

export default async function VariantLayout({ children, params }: LayoutProps<"/v/[variant]">) {
  const { variant } = await params;
  const v = getVariant(variant);
  if (!v) notFound();
  return (
    <div className="flex min-h-screen flex-col bg-[var(--page)]" style={variantStyle(v)} data-variant={v.id}>
      <DesignNotes v={v} />
      <SiteNav v={v} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
