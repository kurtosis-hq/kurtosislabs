import Link from "next/link";
import { notFound } from "next/navigation";
import { variations } from "@/components/ratings/variations";
import { NavBar } from "@/components/ratings/primitives";

// Review-only pages: a blocking navigation is fine, so skip Instant Navigation validation.
export const instant = false;

export function generateStaticParams() {
  return variations.map((v) => ({ id: v.id }));
}

export default async function VariationPage({ params }: PageProps<"/variations/[id]">) {
  const { id } = await params;
  const v = variations.find((x) => x.id === id);
  if (!v) notFound();
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-ink px-4 py-2 text-[13px] text-white">
        <Link href="/variations" className="underline">All variations</Link>
        <span>
          Variation {v.id} of {variations.length}: <b className="font-display">{v.name}</b>
        </span>
        <span className="ml-auto flex gap-3">
          {variations.map((x) => (
            <Link key={x.id} href={`/variations/${x.id}`} className={x.id === v.id ? "font-bold" : "text-white/70"}>
              {x.id}
            </Link>
          ))}
        </span>
      </div>
      <NavBar />
      <main id="overview">{v.overview}</main>
      {v.position && (
        <>
          <div id="position" className="border-y border-divider bg-panel px-4 py-3 text-center font-display text-[13px] font-bold text-ink">
            Position page · ONyc
          </div>
          <section>{v.position}</section>
        </>
      )}
    </>
  );
}
