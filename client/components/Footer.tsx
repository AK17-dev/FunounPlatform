import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-primary">
              Funoun/فنون
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Creating beautiful, handmade products with traditional
              craftsmanship and modern design. Each piece is made with love and
              attention to detail.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-foreground">
              Get in Touch
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>WhatsApp: +961 76 511 373</p>
              <p>Follow us on social media for updates</p>
              <p>Instagram: @Abdelkaderkhanjii</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-foreground">
              About Our Work
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Made to order</p>
              <p>• Eco-friendly materials</p>
              <p>• Supporting local artisans</p>
              <p>• Traditional techniques</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            Made with <Heart className="h-4 w-4 text-primary fill-current" /> by
            AK17

          </p>
          <p>for website like this contact us on this number:76511373</p>
        </div>
      </div>
    </footer>
  );
}
