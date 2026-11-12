import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteBase, type Variant } from "@/components/site/variants";
import { PageHeader, Container } from "@/components/site/ui";
import { GradesNotice, OverviewNotes, RubricPill, SiteFooter, Summary } from "@/components/site/blocks";
import { OverviewList } from "@/components/site/overview-list";
import { StatusPill } from "@/components/ratings/primitives";
import { cn } from "@/lib/utils";


export function OverviewPage({ v }: { v: Variant }) {
  const navy = v.header === "navy";
  return (
    <>
      <PageHeader
        v={v}
        title="Know the risks behind each position."
        sub="Understand what you hold, what could go wrong and how to get back to cash. A researched starting point, not a verdict."
        right={
          <>
            {!navy && <StatusPill kind="preview" />}
            {v.summary !== "kv" && <RubricPill dark={navy} />}
            <Link
              href={`${siteBase(v)}/compare`}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 font-display text-[14px] font-bold",
                navy ? "bg-white text-black" : "border border-divider bg-white text-ink hover:bg-mist",
              )}
            >
              Compare positions <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </>
        }
      />
      <Container className={cn("space-y-6", navy && "-mt-20")}>
        <Summary v={v} />
        {v.notice && <GradesNotice />}
        <OverviewList v={v} />
      </Container>
      <SiteFooter extra={<OverviewNotes />} />
    </>
  );
}
