import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoApply — JD to CV + Cover Letter",
  description: "Paste a job description. Get a tailored CV and cover letter in 60 seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
