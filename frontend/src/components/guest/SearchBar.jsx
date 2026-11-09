import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Search, ArrowRight } from 'lucide-react';
import api from '../../api/axiosClient';

export default function SearchBar({ initialCheckIn = '', initialCheckOut = '', initialGuests = 1, initialRoomTypeId = '' }) {
  const navigate = useNavigate();

  // Helper to get formatted date string YYYY-MM-DD
  const getTodayString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(initialCheckIn || getTodayString(1));
  const [checkOut, setCheckOut] = useState(initialCheckOut || getTodayString(3));
  const [guests, setGuests] = useState(initialGuests || 2);
  const [roomTypeId, setRoomTypeId] = useState(initialRoomTypeId || '');
  const [roomTypes, setRoomTypes] = useState([]);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await api.get('/rooms/types');
        setRoomTypes(res.data || []);
      } catch (err) {
        console.error('Failed to load room types:', err);
      }
    };
    fetchRoomTypes();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setDateError('');

    if (!checkIn || !checkOut) {
      setDateError('Please select both check-in and check-out dates.');
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateError('Check-out date must be after check-in date.');
      return;
    }

    const queryParams = new URLSearchParams({
      checkIn,
      checkOut,
      guests: String(guests),
    });

    if (roomTypeId) {
      queryParams.set('roomTypeId', roomTypeId);
    }

    navigate(`/availability?${queryParams.toString()}`);
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-6 border border-slate-200/80">
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Check-In Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold-500" /> Check-In
          </label>
          <input
            type="date"
            min={getTodayString(0)}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (new Date(checkOut) <= new Date(e.target.value)) {
                // Auto bump checkout
                const nextDay = new Date(e.target.value);
                nextDay.setDate(nextDay.getDate() + 1);
                setCheckOut(nextDay.toISOString().split('T')[0]);
              }
            }}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition"
          />
        </div>

        {/* Check-Out Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gold-500" /> Check-Out
          </label>
          <input
            type="date"
            min={checkIn || getTodayString(1)}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition"
          />
        </div>

        {/* Guests & Room Type Filter */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gold-500" /> Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 transition"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Room Type
            </label>
            <select
              value={roomTypeId}
              onChange={(e) => setRoomTypeId(e.target.value)}
              className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500 transition truncate"
            >
              <option value="">All Types</option>
              {roomTypes.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Action Button */}
        <div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-gold-500 hover:from-amber-600 hover:to-gold-600 text-slate-950 font-bold rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 text-sm transform active:scale-98"
          >
            <Search className="w-4 h-4" />
            Check Availability
          </button>
        </div>
      </form>

      {dateError && (
        <div className="mt-3 text-xs text-rose-600 font-semibold bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
          {dateError}
        </div>
      )}
    </div>
  );
}
