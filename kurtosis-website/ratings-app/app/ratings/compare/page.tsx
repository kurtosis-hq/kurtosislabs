import type { Metadata } from "next";
import { ComparePage } from "@/components/ratings/pages/compare";

export const metadata: Metadata = { title: "Compare" };

export default function Page() {
  return <ComparePage />;
}
