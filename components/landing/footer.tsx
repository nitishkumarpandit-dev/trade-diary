import Link from "next/link";
import { LineChart, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary p-1.5 rounded-lg">
                <LineChart className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">TradeDiary</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              India's most advanced trading journal for serious traders looking
              to improve their performance.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">Company</h5>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">Legal</h5>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Disclosures
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">Resources</h5>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  href="#"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" /> Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Youtube className="w-4 h-4" /> YouTube
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium">
          <p>© 2024 TradeDiary. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white">
              Cookies
            </Link>
            <Link href="#" className="hover:text-white">
              Support
            </Link>
            <Link href="#" className="hover:text-white">
              Status
            </Link>
          </div>
        </div>
        <p className="mt-6 text-xs">
          TradeDiary is not a brokerage platform and does not facilitate any
          trading activity. It is a journaling and analytics tool only.
        </p>
      </div>
    </footer>
  );
}
