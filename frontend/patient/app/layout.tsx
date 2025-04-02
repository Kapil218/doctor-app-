"use client";
import "./globals.css";
import Header from "@/components/header/page";
import { Montserrat } from "next/font/google";


const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

function RootLayoutContent({ children }: { children: React.ReactNode }) {

  
  return (
    <html lang="en">
      <body className={montserrat.className}>
        {" "}
        {/* Apply font class */}
        <Header />
        <main className="main_layout">{children}</main>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
   
      <RootLayoutContent>{children}</RootLayoutContent>
  
  );
}