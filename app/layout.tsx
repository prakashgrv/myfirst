import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "FamilyScheduler — Track Every Kid's Schedule",
  description:
    "The beautiful way to manage homework and extracurricular activities for your whole household.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
