import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Formix AI — Generate Google Forms with AI",
  description:
    "Describe the form you need in plain English. Our AI builds a fully functional Google Form in seconds. No dragging, no dropping — just results.",
  keywords: [
    "AI form builder",
    "Google Forms",
    "AI",
    "form generator",
    "Formix",
  ],
  openGraph: {
    title: "Formix AI — Generate Google Forms with AI",
    description:
      "Describe the form you need in plain English. Our AI builds a fully functional Google Form in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        />
      </head>
      <body className="min-h-full flex flex-col text-white antialiased">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
