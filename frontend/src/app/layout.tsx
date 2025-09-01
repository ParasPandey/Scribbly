import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./provider";
import Wrapper from "@/components/Wrapper";
import { SocketProvider } from "@/context/socketContext";
import { ToastContainer } from "react-toastify";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nata-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scriblly.io",
  description: "Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable}`}>
        <Providers>
          <SocketProvider>
            <ToastContainer position="top-right" autoClose={5000} />
            <Wrapper>{children}</Wrapper>
          </SocketProvider>
        </Providers>
      </body>
    </html>
  );
}
