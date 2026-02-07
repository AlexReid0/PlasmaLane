import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlasmaLane · Scan to Pay",
  description:
    "Generate and scan QR payment requests for stablecoin transfers on Plasma L1.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gradient-plasma antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
