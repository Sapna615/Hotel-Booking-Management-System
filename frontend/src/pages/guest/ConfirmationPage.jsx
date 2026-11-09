import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import {
  CheckCircle2,
  Printer,
  Calendar,
  BedDouble,
  CreditCard,
  User,
  ArrowRight,
  ShieldCheck,
  Hotel,
} from 'lucide-react';

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfirmation = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data.booking);
        setPayments(res.data.payments || []);
      } catch (err) {
        setError(err.message || 'Failed to load booking voucher');
      } finally {
        setLoading(false);
      }
    };
    fetchConfirmation();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4">
        <LoadingSpinner text="Generating verified reservation voucher..." size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-24 max-w-md mx-auto text-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Reservation Not Found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">{error || 'Unable to retrieve voucher.'}</p>
          <Link to="/" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const latestPayment = payments[0];

  return (
    <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner & Print Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Booking Successfully Confirmed
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-0.5">
            Reservation Voucher
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print Voucher
          </button>
          <Link
            to="/guest/bookings"
            className="px-4 py-2 bg-slate-900 hover:bg-gold-500 hover:text-slate-950 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            My Bookings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Printable Voucher Slip */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Voucher Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-gold-600 flex items-center justify-center">
              <Hotel className="w-7 h-7" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 block">
                GRAND AZURE
              </span>
              <span className="text-[10px] tracking-widest uppercase text-gold-600 font-bold block">
                Hotel & Suites
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Booking Reference</div>
            <div className="font-mono text-base font-extrabold text-slate-900">
              {booking.bookingReference}
            </div>
            <div className="mt-1">
              <StatusBadge status={booking.status} />
            </div>
          </div>
        </div>

        {/* Guest & Reservation Itinerary Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-100 text-xs">
          <div className="space-y-2">
            <div className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              Guest Particulars
            </div>
            <div className="font-bold text-sm text-slate-900">{booking.guestDetails?.name}</div>
            <div className="text-slate-600">{booking.guestDetails?.email}</div>
            <div className="text-slate-600">{booking.guestDetails?.phone}</div>
            {booking.guestDetails?.specialRequests && (
              <div className="text-slate-500 italic mt-2">
                "Special Request: {booking.guestDetails.specialRequests}"
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              Stay Details
            </div>
            <div className="font-bold text-sm text-slate-900">
              Room {booking.roomId?.roomNumber} — {booking.roomTypeId?.name}
            </div>
            <div className="text-slate-600">
              Check-in: <strong>{new Date(booking.checkIn).toLocaleDateString()}</strong> (from 2:00 PM)
            </div>
            <div className="text-slate-600">
              Check-out: <strong>{new Date(booking.checkOut).toLocaleDateString()}</strong> (until 11:00 AM)
            </div>
            <div className="text-slate-600">
              Duration: {booking.nights} Nights • {booking.numberOfGuests} Guests
            </div>
          </div>
        </div>

        {/* Itemized Financial Breakdown */}
        <div className="space-y-3 pb-6 border-b border-slate-100 text-xs">
          <div className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
            Itemized Pricing Breakdown
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Room Base Charges ({booking.nights} nights @ ₹{booking.pricing?.nightlyRate}/night):</span>
            <span className="font-semibold text-slate-800">
              ₹{booking.pricing?.totalRoomCharges?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Goods & Services Tax (GST 12%):</span>
            <span className="font-semibold text-slate-800">
              ₹{booking.pricing?.taxAmount?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Service & Maintenance Charge (5%):</span>
            <span className="font-semibold text-slate-800">
              ₹{booking.pricing?.serviceFee?.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-base text-slate-900">
            <span>Total Paid Amount:</span>
            <span className="text-gold-600">₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment Transaction Details */}
        {latestPayment && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Payment Settlement
            </div>
            <div className="flex justify-between font-mono text-[11px] text-slate-700">
              <span>Transaction Ref:</span>
              <span>{latestPayment.transactionReference}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Payment Channel:</span>
              <span className="capitalize">{latestPayment.method.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-600">
              <span>Settlement Status:</span>
              <span className="text-emerald-700 font-bold uppercase">{latestPayment.status}</span>
            </div>
          </div>
        )}

        {/* Footer Guarantee */}
        <div className="flex items-center gap-3 text-xs text-slate-500 pt-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            This digital reservation voucher is registered on the hotel frontdesk ledger.
            Please present your booking reference or photo ID at check-in.
          </span>
        </div>
      </div>
    </div>
  );
}

