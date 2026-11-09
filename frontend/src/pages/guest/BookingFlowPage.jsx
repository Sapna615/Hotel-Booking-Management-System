import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BedDouble,
  Calendar,
  Users,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  MessageSquare,
} from 'lucide-react';

export default function BookingFlowPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = parseInt(searchParams.get('guests') || '1', 10);

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Guest Details form
  const [guestDetails, setGuestDetails] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: '',
  });

  useEffect(() => {
    if (user) {
      setGuestDetails((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        setRoom(res.data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve room details');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Compute pricing snapshot
  const nights = (checkIn && checkOut)
    ? Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
    : 1;

  const nightlyRate = room?.roomTypeId?.basePrice || 0;
  const roomCharges = nightlyRate * nights;
  const taxAmount = Math.round(roomCharges * 0.12);
  const serviceFee = Math.round(roomCharges * 0.05);
  const totalAmount = roomCharges + taxAmount + serviceFee;

  const handleSubmitHold = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        roomId,
        checkIn,
        checkOut,
        numberOfGuests: guests,
        guestDetails,
      };

      const res = await api.post('/bookings/holds', payload);
      const bookingId = res.data._id;
      navigate(`/payment/${bookingId}`);
    } catch (err) {
      setError(
        err.message ||
        'Failed to hold room. Another guest may have reserved these dates. Please try another room.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4">
        <LoadingSpinner text="Configuring reservation itinerary..." size="lg" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="py-24 max-w-md mx-auto text-center px-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Room Unavailable</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">{error || 'Unable to find requested room.'}</p>
        <Link to="/availability" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
          Check Other Dates
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-center space-x-4 sm:space-x-8 text-xs font-semibold uppercase tracking-wider">
        <div className="flex items-center text-gold-600 gap-2">
          <span className="w-6 h-6 rounded-full bg-gold-500 text-slate-950 flex items-center justify-center text-xs font-bold">1</span>
          <span>Guest Details & Hold</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-slate-200"></div>
        <div className="flex items-center text-slate-400 gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">2</span>
          <span>Simulated Payment</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-slate-200"></div>
        <div className="flex items-center text-slate-400 gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">3</span>
          <span>Confirmation</span>
        </div>
      </div>

      {/* Main Grid: Form vs Booking Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Guest Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Primary Guest Information
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please verify your details. This reservation will be issued under this name.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmitHold} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={guestDetails.name}
                    onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                    placeholder="Sophia Patel"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                      placeholder="sophia@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={guestDetails.phone}
                      onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Special Requests (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <textarea
                    rows={3}
                    value={guestDetails.specialRequests}
                    onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                    placeholder="Late arrival, high floor, quiet room, extra pillows..."
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              {/* Hold Notice */}
              <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">10-Minute Room Lock Guarantee:</span>
                  <p className="mt-0.5 text-amber-800/90 leading-relaxed">
                    Clicking the button below creates an exclusive 10-minute hold on Room {room.roomNumber}.
                    Other guests will not be able to book this room while your hold is active.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {submitting ? 'Creating Room Hold...' : 'Create 10-Min Hold & Continue to Payment'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Summary Card */}
        <div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Reservation Summary
            </h3>

            {/* Room Preview */}
            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="h-32 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={room.roomTypeId?.images?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'}
                  alt={room.roomTypeId?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Room {room.roomNumber} (Floor {room.floor})
                </div>
                <div className="font-serif font-bold text-base text-slate-900">
                  {room.roomTypeId?.name}
                </div>
              </div>
            </div>

            {/* Dates & Guests */}
            <div className="space-y-2 text-xs text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Check-in:</span>
                <span className="font-semibold text-slate-800">{checkIn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Check-out:</span>
                <span className="font-semibold text-slate-800">{checkOut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stay Duration:</span>
                <span className="font-semibold text-slate-800">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guests:</span>
                <span className="font-semibold text-slate-800">{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Room Charges ({nights} nights):</span>
                <span>₹{roomCharges.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Taxes & GST (12%):</span>
                <span>₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Service Fee (5%):</span>
                <span>₹{serviceFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-base text-slate-900">
                <span>Total Amount:</span>
                <span className="text-gold-600">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

