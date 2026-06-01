import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The PE Playbook — The operating system for modern PE teachers.",
  description:
    "The first all-in-one PE teaching platform that runs your entire class from one screen. Smart timer, 36-week curriculum, MVPA planner, standards library, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body className="bg-bg text-text font-dm antialiased">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
