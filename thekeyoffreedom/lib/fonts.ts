import { Unbounded, Work_Sans } from "next/font/google";

export const display = Unbounded({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-display",
});

export const body = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-body",
});
