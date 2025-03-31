import "./globals.css";
import { cookies } from "next/headers";
import Header from "@/components/header/page";
import { Montserrat } from "next/font/google";
import { ReactNode } from "react";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  // Await cookies() properly
  const cookieStore = await cookies(); 
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  
  const isLoggedIn = Boolean(accessToken || refreshToken); // Convert to boolean

  return (
    <html lang="en">
      <body>
        <Header isLoggedIn={isLoggedIn} /> {/* Pass login status */}
        <main className="main_layout">{children}</main>
      </body>
    </html>
  );
}
