import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.webp";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Hardware Solutions", path: "/hardware" },
  { label: "Software Solutions", path: "/software" },
  { label: "Pricing", path: "/pricing" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur" style={{ background: 'hsla(215, 85%, 10%, 0.95)' }}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Evolutech Systems" className="h-10 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                location.pathname === l.path
                  ? "text-accent"
                  : "text-white/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-2 bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/contact">Get a Quote</Link>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-t border-white/10 lg:hidden" style={{ background: 'hsl(215, 85%, 10%)' }}>
          <div className="container flex flex-col gap-1 py-4">
            {navLinks.map((l) => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-white ${
                  location.pathname === l.path
                    ? "text-accent"
                    : "text-white/70"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Button asChild size="sm" className="mt-2 bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/contact" onClick={() => setOpen(false)}>
                Get a Quote
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
