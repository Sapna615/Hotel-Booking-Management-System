import React from 'react';
import { Hotel, Heart, ShieldCheck, Clock, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center">
                <Hotel className="w-6 h-6" />
              </div>
              <span className="font-serif text-xl font-bold text-white tracking-wide">
                GRAND AZURE
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Luxury coastal hospitality blending architectural elegance with seamless guest booking experiences.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-400 font-semibold">
              <ShieldCheck className="w-4 h-4" /> ALGIONS AI LABS Assessment Project
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-gold-400 transition">Hotel Overview</Link></li>
              <li><Link to="/rooms" className="hover:text-gold-400 transition">All Rooms & Suites</Link></li>
              <li><Link to="/availability" className="hover:text-gold-400 transition">Live Availability Check</Link></li>
              <li><a href="/api/docs" target="_blank" rel="noreferrer" className="hover:text-gold-400 transition">Interactive API Docs (Swagger)</a></li>
            </ul>
          </div>

          {/* Hotel Amenities */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Signature Amenities
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-gold-400" /> 24/7 Frontdesk Concierge</li>
              <li className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Guaranteed Double-Booking Protection</li>
              <li className="flex items-center gap-2">⭐ High-speed Wi-Fi & Climate Control</li>
              <li className="flex items-center gap-2">☕ Complimentary Gourmet Breakfast</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Demo Operations
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
                <span>100 Promenade Way, Marine Drive</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                <span>concierge@grandazure.demo</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Grand Azure Hotel Booking Management System. Built with MERN Stack.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Full-Stack Assessment
          </p>
        </div>
      </div>
    </footer>
  );
}
