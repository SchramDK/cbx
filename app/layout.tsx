import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "./ui/Sidebar";
import AuthGate from "./ui/AuthGate";

export const metadata: Metadata = {
  title: "Colourbox Demo",
  description: "Files/Upload demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <AuthGate>
          <Sidebar />
          <div className="min-h-screen pl-[76px]">
            {children}
          </div>
        </AuthGate>
      </body>
    </html>
  );
}