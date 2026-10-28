import React, { useState } from 'react';
import { X, Film, CreditCard, Wallet, Building2, CheckCircle2, AlertCircle, ShieldCheck, User as UserIcon } from 'lucide-react';
import type { Showtime, Movie, ReservedSeatDetail, Booking } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../api.js';

interface CheckoutModalProps {
  showtime: Showtime | null;
  movie: Movie | null;
  seats: ReservedSeatDetail[];
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  showtime,
  movie,
  seats,
  onClose,
  onBookingSuccess
}) => {
  const { user, openAuthModal, quickLogin } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'digital' | 'counter'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!showtime || !movie || seats.length === 0) return null;

  const subtotal = seats.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = Number((subtotal * 0.08 + 1.50).toFixed(2));
  const grandTotal = Number((subtotal + convenienceFee).toFixed(2));

  const handleConfirmReservation = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const paymentLabel = 
      paymentMethod === 'card' ? 'Online Credit Card (•••• 4242)' :
      paymentMethod === 'digital' ? 'Apple Pay / Google Pay' :
      'Pay at Cinema Counter';

    try {
      const res = await api.createBooking({
        showtimeId: showtime.id,
        seats,
        paymentMethod: paymentLabel
      });

      onBookingSuccess(res.booking);
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking. Another user may have reserved these seats.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantSignIn = async () => {
    try {
      await quickLogin('user');
    } catch (err: any) {
      setError('Instant sign in failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-serif">
                Reservation & Checkout
              </h2>
              <p className="text-xs text-zinc-400">Review your ticket summary and confirm seats</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-850 hover:bg-zinc-800 text-zinc-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Movie & Showtime Summary Card */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex gap-4">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-16 h-24 rounded-xl object-cover shrink-0 border border-zinc-700"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {showtime.format}
              </span>
              <h3 className="text-base font-bold text-white font-serif truncate mt-1">
                {movie.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {showtime.theaterName} • {showtime.hallName}
              </p>
              <p className="text-xs text-amber-400 font-medium mt-1">
                {new Date(showtime.dateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(showtime.dateTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}
              </p>
            </div>
          </div>

          {/* Seats Detail Breakdown */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Seats ({seats.length} selected)
            </h4>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {seats.map(s => (
                <div
                  key={s.seatId}
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white px-1.5 py-0.5 rounded bg-zinc-800">
                      {s.seatId}
                    </span>
                    <span className="text-zinc-400 capitalize">
                      {s.tier} Tier (Row {s.row}, Seat {s.col})
                    </span>
                  </div>
                  <span className="font-semibold text-zinc-200">
                    ${s.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Calculation Box */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Ticket Subtotal</span>
              <span className="text-zinc-200 font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Convenience & Booking Fee</span>
              <span className="text-zinc-200 font-medium">${convenienceFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-zinc-800 pt-2 flex justify-between items-center text-sm font-bold">
              <span className="text-white">Total Amount</span>
              <span className="text-amber-400 text-base font-serif">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Authentication Status Check */}
          {!user ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Sign in required to reserve and receive your ticket pass</span>
              </div>
              <p className="text-xs text-zinc-300">
                You can sign in with your email or use 1-click demo patron account.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleInstantSignIn}
                  className="px-3.5 py-1.5 bg-amber-500 text-zinc-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition"
                >
                  Instant Sign-In (Alex Mercer)
                </button>
                <button
                  type="button"
                  onClick={openAuthModal}
                  className="px-3.5 py-1.5 bg-zinc-800 text-zinc-200 font-semibold text-xs rounded-lg hover:bg-zinc-700 transition"
                >
                  Sign In with Password
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-zinc-300">
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span>Reserving ticket for: <strong className="text-white">{user.name}</strong> ({user.email})</span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
              </span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Payment Method
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'card'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-xs">Credit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('digital')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'digital'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span className="text-xs">Digital Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('counter')}
                className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'counter'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400 font-bold'
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-xs">Pay at Counter</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmReservation}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/25 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <span>Locking Seats & Generating Ticket...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Reserve Tickets (${grandTotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
