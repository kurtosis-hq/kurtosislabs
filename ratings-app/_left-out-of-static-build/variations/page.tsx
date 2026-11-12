import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { variations } from "@/components/ratings/variations";
import { Eyebrow, NavBar } from "@/components/ratings/primitives";
import { DISCLAIMER } from "@/data/ratings";

export const metadata = { title: "Ratings redesign · five variations" };

export default function VariationsIndex() {
  return (
    <>
      <NavBar />
      <main className="mx-auto w-full max-w-[1000px] px-4 pt-20 pb-16">
        <Eyebrow>Ratings redesign · for review</Eyebrow>
        <h1 className="mt-3 text-[40px] leading-[44px] tracking-[-0.045em]">Five layout variations.</h1>
        <p className="mt-2 max-w-[680px] text-muted-foreground">
          Same brand, same data from the live Ratings site, same grade display rule. Each variation shows the Overview and the ONyc position page.
        </p>
        <ol className="mt-8 grid gap-3 rounded-[42px] bg-panel p-3 md:grid-cols-2">
          {variations.map((v) => (
            <li key={v.id}>
              <Link href={`/variations/${v.id}`} className="flex h-full flex-col rounded-[28px] bg-white p-6 hover:shadow-[0_4px_14px_rgba(15,45,75,.10)]">
                <span className="font-display text-[13px] text-steel tnum">0{v.id}</span>
                <h2 className="mt-1 text-[24px] tracking-[-0.03em]">{v.name}</h2>
                <p className="mt-2 flex-1 text-[15px] leading-6">{v.idea}</p>
                <span className="mt-4 flex items-center gap-1 font-display text-[14px] font-bold text-navy">Open variation<ArrowRight className="size-4" aria-hidden="true" /></span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-[14px] text-ink">{DISCLAIMER}</p>
      </main>
    </>
  );
}
