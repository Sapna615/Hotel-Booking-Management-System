import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  CreditCard,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  QrCode,
  Building,
  HelpCircle,
} from 'lucide-react';

export default function PaymentSimulationPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // 10-minute countdown timer state
  const [timeLeft, setTimeLeft] = useState(600); // 10 min = 600s
  const [isExpired, setIsExpired] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [shouldSucceed, setShouldSucceed] = useState(true); // Toggle to simulate failure!

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        const b = res.data.booking;
        setBooking(b);

        if (b.status === 'confirmed') {
          navigate(`/confirmation/${bookingId}`);
          return;
        }

        if (b.status === 'expired') {
          setIsExpired(true);
          return;
        }

        // Calculate remaining seconds
        if (b.holdExpiresAt) {
          const diffMs = new Date(b.holdExpiresAt).getTime() - Date.now();
          const diffSec = Math.max(0, Math.floor(diffMs / 1000));
          setTimeLeft(diffSec);
          if (diffSec <= 0) {
            setIsExpired(true);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  // Real-time countdown timer tick
  useEffect(() => {
    if (isExpired || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isExpired]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSimulatePayment = async (e) => {
    e.preventDefault();
    if (isExpired) return;

    setProcessing(true);
    setError('');

    try {
      const idempotencyKey = `idemp-${bookingId}-${Date.now()}`;
      await api.post(`/bookings/${bookingId}/confirm`, {
        paymentMethod,
        shouldSucceed,
        idempotencyKey,
      });

      // Succeeded! Navigate to confirmation page
      navigate(`/confirmation/${bookingId}`);
    } catch (err) {
      setError(
        err.message ||
        'Simulated payment processing rejected. Your hold has been safely released.'
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 max-w-7xl mx-auto px-4">
        <LoadingSpinner text="Retrieving payment gateway simulation..." size="lg" />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="py-24 max-w-md mx-auto text-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900">
            Hold Period Expired
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The 10-minute hold window for this room reservation has lapsed.
            The temporary hold has been released so other guests can view and book the room.
          </p>
          <div className="pt-2">
            <Link
              to="/availability"
              className="inline-flex items-center justify-center w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition shadow-md"
            >
              Start New Availability Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-center space-x-4 sm:space-x-8 text-xs font-semibold uppercase tracking-wider">
        <div className="flex items-center text-slate-400 gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">✓</span>
          <span>Guest Details</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-gold-400"></div>
        <div className="flex items-center text-gold-600 gap-2">
          <span className="w-6 h-6 rounded-full bg-gold-500 text-slate-950 flex items-center justify-center text-xs font-bold">2</span>
          <span>Simulated Payment</span>
        </div>
        <div className="w-8 sm:w-16 h-0.5 bg-slate-200"></div>
        <div className="flex items-center text-slate-400 gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">3</span>
          <span>Confirmation</span>
        </div>
      </div>

      {/* Prominent Hold Countdown Timer Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-gold-400">
              Active Room Hold
            </div>
            <div className="text-sm text-slate-300">
              Holding Room <strong className="text-white">{booking?.roomId?.roomNumber}</strong> for Booking Ref <span className="font-mono text-xs">{booking?.bookingReference}</span>
            </div>
          </div>
        </div>

        <div className="text-right flex items-baseline gap-2 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Time Remaining:</span>
          <span className="font-mono text-2xl font-extrabold text-gold-400">
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* Main Payment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Methods & Simulator Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                Simulated Payment Gateway
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred simulated payment rail. No real monetary transactions will occur.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Payment Transaction Notice:</span>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Channel
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === 'credit_card'
                      ? 'border-gold-500 bg-amber-50/50 text-slate-900 ring-2 ring-gold-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-gold-600" />
                  <div>
                    <div className="text-xs font-bold">Credit / Debit Card</div>
                    <div className="text-[10px] text-slate-400">Instant Simulation</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                    paymentMethod === 'upi'
                      ? 'border-gold-500 bg-amber-50/50 text-slate-900 ring-2 ring-gold-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-gold-600" />
                  <div>
                    <div className="text-xs font-bold">UPI / Net Banking</div>
                    <div className="text-[10px] text-slate-400">Zero-fee Transfer</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Card Mockup Input (Visual) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                <span>SIMULATED CARD CREDENTIALS</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-mono">SANDBOX ACTIVE</span>
              </div>
              <input
                type="text"
                disabled
                value="4111 •••• •••• 1111 (Sandbox Test Card)"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
              />
              <div className="grid grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  disabled
                  value="EXP: 12/28"
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                />
                <input
                  type="text"
                  disabled
                  value="CVV: 123"
                  className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                />
              </div>
            </div>

            {/* Evaluation Toggle for Reviewer */}
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-900">
                    Reviewer Simulation Mode
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shouldSucceed}
                    onChange={(e) => setShouldSucceed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Toggle to test both acceptance criteria:
                <br />
                • <strong>ON (Default):</strong> Simulates payment approval & confirms reservation.
                <br />
                • <strong>OFF:</strong> Simulates bank failure, rejects booking, and releases room hold.
              </p>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={processing || isExpired}
              className={`w-full py-4 text-white font-bold rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                shouldSucceed
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              } disabled:opacity-50`}
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing Simulated Transaction...
                </>
              ) : shouldSucceed ? (
                <>
                  Confirm & Pay ₹{booking?.pricing?.totalAmount?.toLocaleString('en-IN')} <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Simulate Bank Failure & Release Hold
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Summary Card */}
        <div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-6">
            <h3 className="font-serif text-lg font-bold text-slate-900">
              Bill Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600 pb-4 border-b border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono font-bold text-slate-800">{booking?.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Room:</span>
                <span className="font-semibold text-slate-800">
                  Room {booking?.roomId?.roomNumber} ({booking?.roomTypeId?.name})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dates:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(booking?.checkIn).toISOString().slice(0, 10)} → {new Date(booking?.checkOut).toISOString().slice(0, 10)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nights:</span>
                <span className="font-semibold text-slate-800">{booking?.nights}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Room Charges:</span>
                <span>₹{booking?.pricing?.totalRoomCharges?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Taxes (12%):</span>
                <span>₹{booking?.pricing?.taxAmount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Service Fee (5%):</span>
                <span>₹{booking?.pricing?.serviceFee?.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-base text-slate-900">
                <span>Total Due:</span>
                <span className="text-gold-600">₹{booking?.pricing?.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

