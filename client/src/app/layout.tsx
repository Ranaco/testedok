import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { type ReactNode } from "react";
import { cookieToInitialState } from "wagmi";
import { headers } from "next/headers";
import { getConfig } from "../wagmi";
import { Providers } from "./providers";
import NavBar from "./components/navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout(props: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    getConfig(),
    headers().get("cookie"),
  );
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers initialState={initialState}>
          <NavBar />
          <div className="min-h-[calc(100vh - 100px)]">{props.children}</div>
          <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto text-center">
              <p>&copy; 2023 Tested OK. All rights reserved.</p>
              <div className="flex justify-center space-x-4 mt-2">
                <a href="/privacy" className="hover:underline">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:underline">
                  Terms of Service
                </a>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
