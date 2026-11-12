import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Fallback for Helvetica Neue on systems without it (the Figma frames use Inter where Helvetica could not load).
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kurtosis Ratings",
  description: "Research preview. Ratings are research, not investment advice.",
};

// Applies the saved light/dark choice before first paint so the page never flashes the wrong theme.
const THEME_SCRIPT = `try{var t=sessionStorage.getItem("kurtosis-theme");if(t==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${display.variable} ${inter.variable} h-full`}
      style={{ ["--font-body" as string]: '"Helvetica Neue", Helvetica, var(--font-inter), Arial, sans-serif' }}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Script id="kurtosis-theme" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
      </body>
    </html>
  );
}
