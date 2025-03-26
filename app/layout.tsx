import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModeToggle } from "@/components/ModeToggle";
import { CapturedImagesProvider } from "@/context/CapturedImagesContext";
import Footer from "@/components/Footer";
import { Spotlight } from "@/components/ui/spotlight-new";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import Header from "@/components/Header";
import AdBanner from "@/components/AdBanner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap", // Improves font loading
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://e-booth.vercel.app"),
  keywords: [
    "photo booth",
    "digital booth",
    "instant photos",
    "e-booth",
    "share photos",
    "capture memories",
    "e booth vercel",
    "e-booth vercel",
    "digibooth",
    "photobooth",
    "online photobooth",
  ],
  title: {
    default: "E-Booth | Capture & Share Memories Instantly",
    template: `%s | E-Booth | Capture & Share Memories Instantly`,
  },
  description:
    "E-Booth is a digital photo booth that lets you capture, customize, and instantly share your memories via email or social media.",
  openGraph: {
    title: "E-Booth | Capture & Share Memories Instantly",
    description:
      "E-Booth is a digital photo booth that lets you capture, customize, and instantly share your memories via email or social media.",
    url: "https://e-booth.vercel.app",
    siteName: "E-Booth",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "E-Booth - Capture & Share Memories Instantly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ebooth",
    title: "E-Booth | Capture & Share Memories Instantly",
    description:
      "E-Booth is a digital photo booth that lets you capture, customize, and instantly share your memories via email or social media.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        <meta name="google-adsense-account" content="ca-pub-3057643117380889" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="canonical" href="https://e-booth.vercel.app" />

        {/* <!-- Google Analytics --> */}
        <Script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');`}
        </Script>

        {/* <!-- Google Adsense --> */}
        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col relative overflow-hidden dark:bg-black-100 bg-white antialiased dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
            <Header />
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100 bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
            <ModeToggle />
            <Spotlight />
            <div className="flex-grow flex justify-center items-center relative">
              <CapturedImagesProvider>{children}</CapturedImagesProvider>
            </div>
            <div className="mb-4">
              <AdBanner
                dataAdFormat="auto"
                dataFullWidthResponsive={true}
                dataAdSlot="6488879549"
              />
            </div>
            <Footer />
            <Toaster richColors />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
