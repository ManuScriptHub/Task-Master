
import { Geist, Geist_Mono } from "next/font/google"; // Corrected font import
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import { ClientLayout } from "@/components/layout/ClientLayout";

const geistSans = Geist({ // Corrected variable name
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({ // Corrected variable name
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TaskMaster Pro",
  description: "Manage your projects and tasks efficiently.",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <AppProviders>
          <ClientLayout>{children}</ClientLayout>
        </AppProviders>
      </body>
    </html>
  );
}
