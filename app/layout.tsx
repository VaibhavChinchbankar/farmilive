import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/LanguageContext";
import Navbar from "./Navbar";

export const metadata: Metadata = {
  title: "FARMiLIVE",
  description: "Experience the Farm. Own the Harvest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <Navbar />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}