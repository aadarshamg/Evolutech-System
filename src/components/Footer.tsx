import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import logo from "@/assets/logo.webp";

const Footer = () => (
  <footer className="border-t border-white/10" style={{ background: 'linear-gradient(135deg, hsl(215 85% 8%), hsl(215 85% 14%))' }}>
    <div className="container py-12">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Brand */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <img src={logo} alt="Evolutech Systems" className="h-9 w-auto" />
            <span className="font-display text-lg font-bold text-white">Evolutech <span className="text-accent">Systems</span></span>
          </div>
          <p className="text-sm leading-relaxed text-white/60 max-w-md">
            Evolutech Systems (OPC) Private Limited delivers integrated security, server infrastructure, and custom technology solutions for modern enterprises.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href="#" aria-label="Facebook" className="rounded-full border border-white/20 p-2 text-white/60 transition-colors hover:bg-accent hover:text-white hover:border-accent">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="rounded-full border border-white/20 p-2 text-white/60 transition-colors hover:bg-accent hover:text-white hover:border-accent">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="rounded-full border border-white/20 p-2 text-white/60 transition-colors hover:bg-accent hover:text-white hover:border-accent">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Instagram" className="rounded-full border border-white/20 p-2 text-white/60 transition-colors hover:bg-accent hover:text-white hover:border-accent">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-accent">Contact</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>+91 91371 10358</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div className="flex flex-col">
                <span>info@evolutechsystem.com</span>
                <span>contact@evolutechsystem.com</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>Office No. 212, 2nd Floor, Building No. 3, 86 Central A, Ghatkopar–Andheri Link Road, Near Shreyas Signal, Gangawadi, Mumbai – 400086</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-10 border-t border-white/10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs text-white/40">
        <span>© 2025 Evolutech Systems (OPC) Private Limited. All Rights Reserved.</span>
        <div className="flex flex-wrap gap-4">
          <Link to="/cancellation-refund" className="hover:text-white transition-colors">Cancellation &amp; Refund Policy</Link>
          <Link to="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
