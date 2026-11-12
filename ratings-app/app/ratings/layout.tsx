import type { Metadata } from "next";
import { FloatingNav } from "@/components/ratings/position/nav";
import { LabsFooter } from "@/components/ratings/position/footer";

export const metadata: Metadata = {
  title: { default: "Kurtosis Ratings", template: "%s · Kurtosis Ratings" },
  description: "Research preview. Ratings are research, not investment advice.",
};

// The live Ratings site. Surface values come from .ratings-root in globals.css (Card Desk style),
// so the light/dark toggle can swap them without touching any component.
export default function RatingsLayout({ children }: LayoutProps<"/ratings">) {
  return (
    <div className="ratings-root flex min-h-screen flex-col pt-12">
      <FloatingNav />
      <div className="flex-1">{children}</div>
      <LabsFooter />
    </div>
  );
}
