import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import SearchBar from '../../components/guest/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BedDouble,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export default function AvailabilityPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests') || '1';
  const roomTypeId = searchParams.get('roomTypeId') || '';

  const [availableData, setAvailableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!checkIn || !checkOut) return;

      setLoading(true);
      setError('');

      try {
        const query = new URLSearchParams({
          checkIn,
          checkOut,
          guests,
        });
        if (roomTypeId) query.set('roomTypeId', roomTypeId);

        const res = await api.get(`/availability?${query.toString()}`);
        setAvailableData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to search available rooms for these dates');
        setAvailableData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [checkIn, checkOut, guests, roomTypeId]);

  const handleSelectRoom = (roomId) => {
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests,
    });
    navigate(`/booking/${roomId}?${params.toString()}`);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Search Controls */}
      <div>
        <SearchBar
          initialCheckIn={checkIn || ''}
          initialCheckOut={checkOut || ''}
          initialGuests={Number(guests) || 1}
          initialRoomTypeId={roomTypeId}
        />
      </div>

      {/* Results Header */}
      {checkIn && checkOut && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400">Search Itinerary</div>
              <div className="text-sm sm:text-base font-bold text-white">
                {checkIn} → {checkOut} ({availableData?.totalNights || 1} {(availableData?.totalNights || 1) === 1 ? 'Night' : 'Nights'}, {guests} {guests === '1' ? 'Guest' : 'Guests'})
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live Availability Verified
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-20">
          <LoadingSpinner text="Checking live room schedules and hold expirations..." size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div className="text-sm font-semibold">{error}</div>
        </div>
      )}

      {/* Available Rooms List */}
      {!loading && availableData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-slate-900">
              Available Rooms ({availableData.totalAvailable})
            </h2>
            <span className="text-xs text-slate-500">
              Prices include 12% GST and 5% service fee
            </span>
          </div>

          {availableData.rooms.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
              <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">
                No Vacancies for the Selected Dates & Criteria
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                All rooms matching your capacity are either reserved, under maintenance, or temporarily held by other guests.
                Try adjusting your dates or choosing another room type.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {availableData.rooms.map(({ room, pricing }) => (
                <div
                  key={room._id}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/80 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between"
                >
                  {/* Left: Room Info */}
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={room.roomType?.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'}
                        alt={room.roomType?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Room {room.roomNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">Floor {room.floor}</span>
                      </div>

                      <h3 className="font-serif text-2xl font-bold text-slate-900">
                        {room.roomType?.name}
                      </h3>

                      <p className="text-xs text-slate-500 max-w-md leading-relaxed line-clamp-2">
                        {room.roomType?.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {room.roomType?.amenities?.slice(0, 4).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Itemized Price & Reserve Button */}
                  <div className="w-full lg:w-72 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 flex flex-col justify-between shrink-0 space-y-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Nightly base rate:</span>
                        <span className="font-semibold">₹{pricing.nightlyRate?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Duration ({pricing.totalNights} nights):</span>
                        <span className="font-semibold">₹{pricing.roomCharges?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Taxes & GST (12%):</span>
                        <span>₹{pricing.taxAmount?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px]">
                        <span>Service charge (5%):</span>
                        <span>₹{pricing.serviceFee?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-bold text-slate-900 text-base">
                        <span>Total Stay Price:</span>
                        <span className="text-gold-600">₹{pricing.totalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectRoom(room._id)}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md transform active:scale-98"
                    >
                      Reserve Room (10-min Hold) <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

