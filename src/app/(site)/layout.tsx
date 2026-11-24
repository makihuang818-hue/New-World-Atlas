import type { Metadata } from "next";
import { Instrument_Sans, Libre_Baskerville } from "next/font/google";
import { RevealOnScroll, Newsletter } from "@/components/bits";
import { CartDrawer, CartProvider } from "@/components/cart/Cart";
import { Nav } from "@/components/Nav";
import { getChapters } from "@/content/data";
import "./site.css";

const sans = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
const serif = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: { default: "New World Atlas — Matt Black", template: "%s — New World Atlas" },
  description: "Giga-fires, mega-droughts, and thousand-year floods are reshaping the American West. A photographic atlas by Matt Black.",
};

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const chapters = await getChapters();
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <CartProvider>
          <Nav chapters={chapters} />
          {children}
          <div className="shell-foot">
            <Newsletter />
            <footer className="foot">
              <span>© 2026 Matt Black</span>
              {/* TODO: real Instagram, privacy policy and studio links */}
              <nav><a href="#">Instagram</a><a href="#">Privacy Policy</a><a href="#">Site by Decimal</a></nav>
            </footer>
          </div>
          <CartDrawer />
          <RevealOnScroll />
        </CartProvider>
      </body>
    </html>
  );
}
