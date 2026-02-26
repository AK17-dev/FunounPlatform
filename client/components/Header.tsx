import { Instagram, Facebook, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useCart } from "@/contexts/CartContext";

export function Header() {
  const { itemCount } = useCart();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/20 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md"
      style={{
        background: "linear-gradient(135deg, #E6D6F3 0%, #7F56D9 100%)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F3e1cfa77093d456fa9220d6a72e6b46f%2F4d2fdc9fb17f4a6daeabad083de1b0a0?format=webp&width=800"
              alt="FunounByFatima Logo"
              className="h-10 w-10 sm:h-14 sm:w-14 rounded-full object-contain bg-white/10 p-1 flex-shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <h1 className="font-serif text-lg sm:text-2xl font-bold text-white drop-shadow-sm">
                FunounByFatima
              </h1>
              <span className="text-white/90 font-light text-xs sm:text-sm drop-shadow-sm">
                Handmade with love
              </span>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:text-white transition-colors drop-shadow-sm relative"
              asChild
            >
              <Link to="/cart" aria-label="Open cart">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-white text-primary text-[10px] leading-none font-semibold flex items-center justify-center">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white transition-colors drop-shadow-sm"
              asChild
            >
              <a
                href="https://www.instagram.com/funoun_by_fatima?igsh=MXFvbWZ1eGh2djg4NA=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white transition-colors drop-shadow-sm"
              asChild
            >
              <a
                href="https://wa.me/96176322468"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact us on WhatsApp"
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F3e1cfa77093d456fa9220d6a72e6b46f%2F14aff025dfec4490b3e2c7a489b951f0?format=webp&width=800"
                  alt="WhatsApp"
                  className="h-8 w-9 object-contain"
                />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white transition-colors drop-shadow-sm"
              asChild
            >
              <a
                href="https://www.facebook.com/share/18pStMaAAX/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

