import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PickIt",
  description: "구매 직전의 소비 고민을 함께 검증하는 PickIt",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
