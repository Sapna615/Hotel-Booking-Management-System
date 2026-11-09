import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roomType, setRoomType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local booking form state
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getTodayString(1));
  const [checkOut, setCheckOut] = useState(getTodayString(3));
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/types/${id}`);
        setRoomType(res.data);
        if (res.data?.capacity) {
          setGuests(Math.min(2, res.data.capacity));
        }
      } catch (err) {
        setError(err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleBookNow = () => {
    if (new Date(checkOut) <= new Date(checkIn)) {
      alert('Check-out date must be after check-in date');
      return;
    }
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
      roomTypeId: id,
    });
    navigate(`/availability?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4">
        <LoadingSpinner text="Fetching suite details..." size="lg" />
      </div>
    );
  }

  if (error || !roomType) {
    return (
      <div className="py-24 max-w-lg mx-auto text-center px-4">
        <div className="p-8 bg-white rounded-2xl shadow-md border border-slate-200">
          <Info className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Room Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || 'This accommodation could not be retrieved.'}</p>
          <Link to="/rooms" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
            Return to Rooms Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/rooms"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Accommodations
        </Link>
      </div>

      {/* Main Grid: Gallery & Info vs Sticky Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column (Images, Overview, Amenities) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Image Gallery */}
          <div className="space-y-4">
            <div className="h-[400px] sm:h-[480px] rounded-3xl overflow-hidden bg-slate-100 shadow-md">
              <img
                src={roomType.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'}
                alt={roomType.name}
                className="w-full h-full object-cover"
              />
            </div>
            {roomType.images?.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                {roomType.images.slice(1, 3).map((img, idx) => (
                  <div key={idx} className="h-44 rounded-2xl overflow-hidden bg-slate-100 shadow-xs">
                    <img src={img} alt={`${roomType.name} preview ${idx}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details header */}
          <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gold-600">
                  Signature Category
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
                  {roomType.name}
                </h1>
              </div>
              <div className="px-3.5 py-1.5 bg-slate-100 text-slate-800 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gold-500" /> Up to {roomType.capacity} Guests
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
              {roomType.description}
            </p>
          </div>

          {/* Amenities & Inclusions */}
          <div className="bg-white p-8 rounded-3xl shadow-xs border border-slate-200/80 space-y-4">
            <h3 className="font-serif text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-500" /> Exclusive Room Amenities
            </h3>
            <p className="text-xs text-slate-500">
              Every detail is engineered for unmatched acoustic comfort, hygiene, and luxury rest.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {roomType.amenities?.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee Policies */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Grand Azure Reservation Guarantee
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>No Overbooking Policy:</strong> Our system locks room dates on database level, guaranteeing your selected room is exclusively held.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>10-Minute Hold Window:</strong> Price and room allocation are locked for 10 minutes while you complete simulated payment.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Flexible Cancellation:</strong> Cancel online anytime prior to check-in for an automatic simulated refund.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column (Sticky Booking Widget) */}
        <div>
          <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200/80 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Nightly Rate</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-bold text-slate-900">
                  ₹{roomType.basePrice?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500">/ night</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-500" /> Check-In Date
                </label>
                <input
                  type="date"
                  min={getTodayString(0)}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gold-500" /> Check-Out Date
                </label>
                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gold-500" /> Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                >
                  {[...Array(roomType.capacity || 2)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-600 hover:to-gold-600 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-98 text-sm"
              >
                Proceed to Reservation
              </button>
            </div>

            <div className="text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-gold-500" /> Instant confirmation with itemized receipt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
