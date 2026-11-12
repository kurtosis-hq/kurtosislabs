import type { Metadata } from "next";
import { Suspense } from "react";
import { SourcesPage } from "@/components/ratings/pages/sources";

export const metadata: Metadata = { title: "Sources" };

// The register reads ?q= from the URL, so it renders inside Suspense.
export default function Page() {
  return (
    <Suspense>
      <SourcesPage />
    </Suspense>
  );
}
