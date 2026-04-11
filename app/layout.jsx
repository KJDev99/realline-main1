import { Onest } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const onest = Onest({
  subsets: ["latin"],
  variable: "--font-onest",
});

export const metadata = {
  title: "RealLayn",
  description: "RealLayn project",
  icons: {
    icon: "/icons/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${onest.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans font-[var(--font-onest)">
        {children}
        <Footer />

      </body>
    </html>
  );
}