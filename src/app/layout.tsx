import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepExam - Computer Science Teacher Exam Preparation | PGT STET & BPSE TRE 4",
  description: "Master Computer Science teaching exams with comprehensive study materials, previous year questions & expert guidance. Crack PGT STET and BPSE TRE 4 exams with confidence.",
  keywords: "computer science teacher exam, PGT STET preparation, BPSE TRE 4 exam, computer science teaching jobs, CS teacher recruitment, programming concepts, data structures, algorithms, computer networks, database management, software engineering, teaching methodology",
  authors: [{ name: "PrepExam Team" }],
  creator: "PrepExam",
  publisher: "PrepExam",
  robots: "index, follow",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  themeColor: '#1E40AF',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://prepexam.com",
    title: "PrepExam - Computer Science Teacher Exam Preparation",
    description: "Master Computer Science teaching exams with comprehensive study materials. Crack PGT STET and BPSE TRE 4 exams with expert guidance.",
    siteName: "PrepExam",
  },
  twitter: {
    card: "summary_large_image",
    title: "PrepExam - Computer Science Teacher Exam Preparation",
    description: "Master Computer Science teaching exams with comprehensive study materials. Crack PGT STET and BPSE TRE 4 exams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {publishableKey ? (
          <ClerkProvider publishableKey={publishableKey}>
            {children}
          </ClerkProvider>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Configuration Required
              </h1>
              <p className="text-gray-600">
                Please configure your Clerk publishable key to continue.
              </p>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
