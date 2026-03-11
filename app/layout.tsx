// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import NavbarWrapper from "./components/NavbarWrapper";

export const metadata: Metadata = {
  title: "Restaurant Search — วลัยลักษณ์",
  description: "ระบบค้นหาร้านอาหารในพื้นที่ถนนวลัยลักษณ์",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#fafafa",
          minHeight: "100vh",
        }}
      >
        <NavbarWrapper />
        <main>{children}</main>
      </body>
    </html>
  );
}