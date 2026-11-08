import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s · Panel TKF" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">): ReactNode {
  return (
    <>
      {children}
      <Toaster position="bottom-right" />
    </>
  );
}
