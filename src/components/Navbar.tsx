import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar({ 
  hasEntered, 
  onNavigate, 
  currentPage 
}: { 
  hasEntered?: boolean;
  onNavigate: (page: "home" | "lore" | "game") => void;
  currentPage: "home" | "lore" | "game";
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", type: "btn", action: () => onNavigate("home"), active: currentPage === "home" },
    { name: "Lore", type: "btn", action: () => onNavigate("lore"), active: currentPage === "lore" },
    { name: "Banana Catch", type: "btn", action: () => onNavigate("game"), active: currentPage === "game" },
    { name: "Mojo Run", type: "link", href: "https://mojogame.vercel.app/" },
    { name: "Mojo Dojo", type: "link", href: "https://mojodojo.vercel.app/" },
    { name: "Buy Now", type: "link", href: "https://pump.fun/coin/sGzragYKDrmRgCGvJUn9WKwrmnUZwfmkNQLTSPfdMNq" },
    { name: "Community", type: "link", href: "https://x.com/i/communities/2018668722387563000" },
    { name: "PFP Generator", type: "link", href: "https://mojify-backend-production.up.railway.app" },
  ];

  return (
    <nav className="relative z-[60] max-w-[1200px] mx-auto px-6 sm:px-8 py-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => {
            onNavigate("home");
            setIsMenuOpen(false);
          }}
          style={{ fontFamily: "'Instrument Serif', serif" }}
          className="text-[28px] sm:text-[32px] tracking-tight text-foreground font-normal cursor-pointer"
        >
          MOJO
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          link.type === "btn" ? (
            <button 
              key={link.name}
              onClick={link.action}
              className={`text-sm font-medium transition-colors cursor-pointer ${link.active ? 'text-foreground' : 'text-foreground/80 hover:text-foreground'}`}
            >
              {link.name}
            </button>
          ) : (
            <a 
              key={link.name}
              href={link.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              {link.name}
            </a>
          )
        ))}
      </div>

      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden text-foreground p-2"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[80px] z-[100] bg-black/95 backdrop-blur-xl md:hidden flex flex-col items-center pt-20 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
          {navLinks.map((link) => (
            link.type === "btn" ? (
              <button 
                key={link.name}
                onClick={() => {
                  link.action?.();
                  setIsMenuOpen(false);
                }}
                className={`text-2xl font-medium ${link.active ? 'text-foreground border-b-2 border-foreground' : 'text-foreground/80'}`}
              >
                {link.name}
              </button>
            ) : (
              <a 
                key={link.name}
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-medium text-foreground/80"
              >
                {link.name}
              </a>
            )
          ))}
        </div>
      )}
    </nav>
  );
}
