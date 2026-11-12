import type { Metadata } from "next";
import { MethodologyPage } from "@/components/ratings/pages/methodology";

export const metadata: Metadata = { title: "Methodology" };

export default function Page() {
  return <MethodologyPage />;
}
