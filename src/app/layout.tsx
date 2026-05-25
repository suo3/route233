import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/SiteShell";
import { OnboardingCheck } from "@/components/OnboardingCheck";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import { MobileBottomNav } from "@/components/MobileBottomNav";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://233logistics.com'),
  title: {
    default: "233 Logistics | Professional USA to Ghana Sourcing & Logistics",
    template: "%s | 233 Logistics"
  },
  description: "Your personal sourcing agent in the United States. We find, verify, and ship car parts and electronics from the USA to Ghana.",
  appleWebApp: {
    capable: true,
    title: '233 Logistics',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: "233 Logistics | Professional USA to Ghana Sourcing & Logistics",
    description: "Your personal sourcing agent in the United States. We find, verify, and ship car parts and electronics from the USA to Ghana.",
    url: "https://233logistics.com",
    siteName: "233 Logistics",
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "233 Logistics | Professional USA to Ghana Sourcing & Logistics",
    description: "Your personal sourcing agent in the United States. We find, verify, and ship car parts and electronics from the USA to Ghana.",
  },
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
        <MobileBottomNav />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
