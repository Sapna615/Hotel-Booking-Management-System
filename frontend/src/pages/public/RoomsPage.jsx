import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Wifi, Tv, Coffee, Filter, Search, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RoomsPage() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [capacityFilter, setCapacityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await api.get('/rooms/types');
        setRoomTypes(res.data || []);
      } catch (err) {
        console.error('Failed to fetch room types:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomTypes();
  }, []);

  const filteredTypes = roomTypes
    .filter((type) => {
      if (capacityFilter === 'all') return true;
      return type.capacity >= Number(capacityFilter);
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4">
        <LoadingSpinner text="Loading luxury suites catalog..." size="lg" />
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-400">
            Grand Azure Catalog
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold mt-2">
            Curated Accommodations
          </h1>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">
            Choose from our bespoke collection of standard rooms, executive spaces, and sprawling family suites.
          </p>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-gold-500" /> Filter:
          </div>
          <select
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            <option value="all">All Capacities</option>
            <option value="2">2+ Guests</option>
            <option value="3">3+ Guests</option>
            <option value="4">4+ Guests</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Room Name</option>
          </select>
        </div>
      </div>

      {/* Rooms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTypes.map((type) => (
          <div
            key={type._id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 flex flex-col group"
          >
            <div className="relative h-64 overflow-hidden bg-slate-100">
              <img
                src={type.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                alt={type.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gold-400" />
                Up to {type.capacity} {type.capacity === 1 ? 'Guest' : 'Guests'}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-900 group-hover:text-gold-600 transition">
                  {type.name}
                </h3>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                  {type.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Included Amenities:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {type.amenities?.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Nightly Rate</span>
                  <div className="text-xl font-bold text-slate-900">
                    ₹{type.basePrice?.toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-normal text-slate-500">/ night</span>
                  </div>
                </div>
                <Link
                  to={`/rooms/${type._id}`}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
                >
                  View Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

