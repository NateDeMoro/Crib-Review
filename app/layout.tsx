import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layouts/Header";
import { BottomNav } from "@/components/layouts/BottomNav";
import { SessionProvider } from "@/components/providers/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusNest - Student Housing Reviews",
  description: "Anonymous reviews of college housing by students, for students. Find your perfect nest!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-school="oregon-state">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <BottomNav />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
