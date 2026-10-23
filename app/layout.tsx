import type { Metadata } from "next";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/noto-sans-sinhala/400.css";
import "@fontsource/noto-sans-sinhala/500.css";
import "@fontsource/noto-sans-sinhala/600.css";
import "@fontsource/noto-sans-sinhala/700.css";
import "@fontsource/poppins/latin.css";
import "@fontsource/nunito/latin.css";
import "@fontsource/lato/latin.css";
import "@fontsource/montserrat/latin.css";
import "@fontsource/quicksand/latin.css";
import "@fontsource/playfair-display/latin.css";
import "@fontsource/fredoka/latin.css";
import "@fontsource/baloo-2/latin.css";
import "@fontsource/roboto/latin.css";
import "@fontsource/noto-serif-sinhala/latin.css";
import "@fontsource/noto-serif-sinhala/sinhala.css";
import "@fontsource/abhaya-libre/latin.css";
import "@fontsource/abhaya-libre/sinhala.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Little Paper | Sticker Studio",
  description: "A colourful local studio for school stickers and cover labels."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
