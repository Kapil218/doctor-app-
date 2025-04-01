"use client";
import "./globals.css";
import Header from "@/components/header/page";
import { Montserrat } from "next/font/google";
import { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface RootLayoutProps {
  children: ReactNode;
}

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  
  return (
    <html lang="en">
      <body className={montserrat.className}>
        {" "}
        {/* Apply font class */}
        <Header isLoggedIn={isLoggedIn} />
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
    <AuthProvider>
      <RootLayoutContent>{children}</RootLayoutContent>
    </AuthProvider>
  );
}
