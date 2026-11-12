import { redirect } from "next/navigation";

// A redirect-only page; skip Instant Navigation validation.
export const instant = false;

export default function Home() {
  redirect("/ratings");
}
