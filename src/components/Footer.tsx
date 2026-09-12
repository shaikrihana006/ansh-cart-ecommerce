import React, { useState } from 'react';
import { Mail, Check, ShieldCheck, Truck, RefreshCw, Heart, Database, Terminal } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenProjectInfo: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenProjectInfo }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <footer className="bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-800 mt-20">
      {/* Top Value Assurance Grid */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-neutral-800 text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Free Expedited Courier</h4>
              <p className="mt-1 text-neutral-400 leading-relaxed">
                Enjoy complimentary delivery on all curated orders exceeding $75.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-neutral-800 text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Craftsmanship Guaranteed</h4>
              <p className="mt-1 text-neutral-400 leading-relaxed">
                Every item is rigorously tested and covered by a 2-year warranty.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-neutral-800 text-amber-400 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">30-Day Risk-Free Returns</h4>
              <p className="mt-1 text-neutral-400 leading-relaxed">
                Try at home or at your desk. Hassle-free exchanges within 30 days.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-neutral-800 text-amber-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">SQLite & Express Engine</h4>
              <p className="mt-1 text-neutral-400 leading-relaxed">
                Persistent relational data storage for users, catalog, and orders.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Brand Narrative */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand Column */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-extrabold text-lg">
              A
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk']">
              ANSH CART
            </span>
          </div>
          <p className="text-neutral-400 leading-relaxed max-w-sm">
            A modern, human-designed online store focused on curated everyday products: ergonomic desk accessories, artisanal coffee gear, fine leather folios, and mindful wellness essentials.
          </p>
          <div className="pt-2">
            <button
              id="footer-tech-stack-btn"
              onClick={onOpenProjectInfo}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-semibold text-xs border border-neutral-700 transition-colors cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Explore Internship Architecture</span>
            </button>
          </div>
        </div>

        {/* Collections */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Collections</h4>
          <ul className="space-y-2">
            {['Workspace & Tech', 'Everyday Carry', 'Home & Living', 'Kitchen & Brew', 'Wellness & Rest'].map((cat) => (
              <li key={cat}>
                <button
                  id={`footer-nav-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => onSelectCategory(cat)}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Care */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Assistance</h4>
          <ul className="space-y-2">
            <li><span className="text-neutral-400">Track Order Online</span></li>
            <li><span className="text-neutral-400">Shipping & Delivery</span></li>
            <li><span className="text-neutral-400">Returns & Warranty</span></li>
            <li><span className="text-neutral-400">Sustainability Pledge</span></li>
            <li><span className="text-neutral-400">Terms & Privacy</span></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider">Curator’s Digest</h4>
          <p className="text-neutral-400 leading-relaxed">
            Receive exclusive drops, design stories, and 10% off your first curated order using coupon code <strong className="text-amber-400">ANSH10</strong>.
          </p>
          {subscribed ? (
            <div className="p-3 rounded-xl bg-neutral-800 text-emerald-400 flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4" />
              <span>You're on the list! Check your inbox.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="newsletter-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..."
                  className="w-full bg-neutral-800 text-white pl-9 pr-3 py-2.5 rounded-xl border border-neutral-700 focus:outline-none focus:border-amber-400 text-xs"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              </div>
              <button
                id="newsletter-submit-btn"
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors cursor-pointer shrink-0"
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Copyright & Tech Badges */}
      <div className="border-t border-neutral-800 bg-neutral-950/60 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} ANSH CART. Designed with care for discerning creators & everyday living.
          </div>
          <div className="flex items-center gap-4">
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
              Node.js + Express
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
              SQLite DB
            </span>
            <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">
              React 19 + Tailwind
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
