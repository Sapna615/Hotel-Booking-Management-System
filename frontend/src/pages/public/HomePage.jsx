import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../../components/guest/SearchBar';
import api from '../../api/axiosClient';
import {
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
  Wifi,
  Coffee,
  Waves,
  UtensilsCrossed,
  ArrowRight,
  Star,
} from 'lucide-react';

export default function HomePage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get('/rooms/types');
        setRoomTypes(res.data || []);
      } catch (err) {
        console.error('Failed to load room types:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center bg-slate-950 overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
            alt="Grand Azure Luxury Resort"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-400/30 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" /> Luxury Coastal Escape & Suites
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-tight max-w-4xl">
            Experience Timeless Luxury & Unrivaled Hospitality
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed">
            Discover elegantly appointed suites, world-class culinary dining, and seamless instant reservations guaranteed against double-booking.
          </p>

          {/* Integrated Search Bar */}
          <div className="w-full max-w-5xl mt-10">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Feature Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Guaranteed Integrity</h3>
              <p className="text-xs text-slate-500 mt-1">
                Atomic database concurrency eliminates any risk of overlapping bookings.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">10-Min Temporary Hold</h3>
              <p className="text-xs text-slate-500 mt-1">
                Hold your room with locked pricing while you complete your simulated payment.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Transparent Pricing</h3>
              <p className="text-xs text-slate-500 mt-1">
                Clear itemized rate breakdown with nightly fee, 12% GST, and 5% service fee.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Frontdesk Synced</h3>
              <p className="text-xs text-slate-500 mt-1">
                Immediate sync between guest reservations and staff check-in/out registers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Room Types Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
              Accommodations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
              Rooms & Curated Suites
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-xl">
              Each space is designed with contemporary luxury, acoustic privacy, and personalized amenities.
            </p>
          </div>
          <Link
            to="/rooms"
            className="mt-4 md:mt-0 inline-flex items-center text-sm font-semibold text-gold-600 hover:text-gold-700 transition"
          >
            Explore all accommodations <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roomTypes.map((type) => (
            <div
              key={type._id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 flex flex-col group"
            >
              {/* Image Banner */}
              <div className="relative h-56 overflow-hidden bg-slate-100">
                <img
                  src={type.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                  alt={type.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  Up to {type.capacity} {type.capacity === 1 ? 'Guest' : 'Guests'}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-gold-600 transition">
                    {type.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {type.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {type.amenities?.slice(0, 3).map((a, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nightly Rate</span>
                    <div className="text-lg font-bold text-slate-900">
                      ₹{type.basePrice?.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-slate-500">/ night</span>
                    </div>
                  </div>
                  <Link
                    to={`/rooms/${type._id}`}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-white text-xs font-bold rounded-lg transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guest Reviews */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
              Guest Endorsements
            </span>
            <h2 className="font-serif text-3xl font-bold mt-2">What Our Guests Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic mb-4 leading-relaxed">
                "The reservation experience was instant and completely transparent. The 10-minute hold gave us plenty of time to review taxes and details."
              </p>
              <div className="font-semibold text-xs text-white">Rohit & Priya S.</div>
              <div className="text-[10px] text-slate-400">Deluxe Sea-view Suite</div>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic mb-4 leading-relaxed">
                "Checking in at the frontdesk took under 30 seconds. The staff already had our digital booking confirmed and voucher ready."
              </p>
              <div className="font-semibold text-xs text-white">David Miller</div>
              <div className="text-[10px] text-slate-400">Family Suite Stay</div>
            </div>

            <div className="bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic mb-4 leading-relaxed">
                "Unmatched elegance. Cleanliness, fast Wi-Fi, and a seamless checkout process right on our mobile phone."
              </p>
              <div className="font-semibold text-xs text-white">Amina Al-Kuwari</div>
              <div className="text-[10px] text-slate-400">Premium Suite</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
