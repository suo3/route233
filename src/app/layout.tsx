import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/SiteShell";
import { OnboardingCheck } from "@/components/OnboardingCheck";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "233 Logistics | Professional USA to Ghana Sourcing & Logistics",
  description: "Your personal sourcing agent in the United States. We find, verify, and ship car parts and electronics from the USA to Ghana.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${font.className} min-h-full flex flex-col bg-white`} suppressHydrationWarning>
        <OnboardingCheck />
        <Navbar />
        <div className="flex-grow pt-20">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}

