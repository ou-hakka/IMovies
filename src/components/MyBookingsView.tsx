import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, Clock, MapPin, XCircle, AlertCircle, Eye, Film, Sparkles, RefreshCw } from 'lucide-react';
import type { Booking } from '../types.js';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.js';

interface MyBookingsViewProps {
  onOpenTicketPass: (booking: Booking) => void;
  onBrowseMovies: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  onOpenTicketPass,
  onBrowseMovies
}) => {
  const { user, openAuthModal, quickLogin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.getMyBookings();
      setBookings(res.bookings);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancellingId(cancelModalBooking.id);
    try {
      await api.cancelBooking(cancelModalBooking.id);
      setFeedbackMessage(`Reservation ${cancelModalBooking.bookingCode} cancelled. Seats have been returned to inventory.`);
      setCancelModalBooking(null);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-500 shadow-xl">
          <Ticket className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-serif text-white">
            Access Your Movie Passes
          </h2>
          <p className="text-sm text-zinc-400 max-w-sm mx-auto">
            Please sign in to view your confirmed cinema bookings, digital QR turnstile passes, and seat allocations.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => quickLogin('user')}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Quick Login as Alex Mercer</span>
          </button>
          <button
            onClick={openAuthModal}
            className="w-full sm:w-auto px-6 py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm rounded-xl transition border border-zinc-700"
          >
            Sign In with Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-amber-500" />
            <span>My Cinema Tickets & Bookings</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time reservation wallet for <strong>{user.name}</strong> ({user.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition flex items-center gap-1.5 text-xs"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onBrowseMovies}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition shadow shadow-amber-500/10 flex items-center gap-1.5"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Browse More Movies</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-zinc-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {loading && bookings.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">
          Loading your reservations...
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 space-y-4">
          <Ticket className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-200">No Reservations Yet</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            You don't have any movie tickets booked under this account. Pick a blockbuster and select your favorite seats!
          </p>
          <button
            onClick={onBrowseMovies}
            className="px-6 py-2.5 bg-amber-500 text-zinc-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
          >
            Explore Now Showing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(booking => {
            const isCancelled = booking.status === 'cancelled';
            const showDate = new Date(booking.dateTime).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            });
            const showTime = new Date(booking.dateTime).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return (
              <div
                key={booking.id}
                className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition ${
                  isCancelled
                    ? 'bg-zinc-950/60 border-zinc-900 opacity-60'
                    : 'bg-zinc-900/80 border-zinc-800 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <img
                      src={booking.moviePoster}
                      alt={booking.movieTitle}
                      className="w-14 h-20 rounded-xl object-cover border border-zinc-800 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {booking.format}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            isCancelled
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isCancelled ? 'Cancelled' : 'Confirmed'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold font-serif text-white truncate mt-1">
                        {booking.movieTitle}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        Ref: <span className="text-amber-400 font-bold">{booking.bookingCode}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Theater & Timing Details */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-950/70 p-3 rounded-xl border border-zinc-800/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500" /> Cinema Hall
                    </span>
                    <p className="text-zinc-200 font-medium truncate">{booking.theaterName}</p>
                    <p className="text-zinc-400 text-[11px]">{booking.hallName}</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-zinc-500 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" /> Showtime
                    </span>
                    <p className="text-zinc-200 font-medium">{showDate}</p>
                    <p className="text-amber-400 font-bold">{showTime}</p>
                  </div>
                </div>

                {/* Seats List */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Seats Reserved:</span>
                    <span className="text-white font-bold">${booking.totalAmount.toFixed(2)} Total</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {booking.seats.map(s => (
                      <span
                        key={s.seatId}
                        className="px-2 py-0.5 rounded-lg bg-zinc-800 text-amber-300 font-bold text-xs border border-zinc-700"
                      >
                        {s.seatId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onOpenTicketPass(booking)}
                    className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700 flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Digital Ticket</span>
                  </button>

                  {!isCancelled && (
                    <button
                      onClick={() => setCancelModalBooking(booking)}
                      className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-950/80 text-red-400 text-xs font-semibold transition border border-red-900/50 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">
                Cancel Movie Reservation?
              </h3>
              <p className="text-xs text-zinc-400">
                Are you sure you want to cancel booking <strong>{cancelModalBooking.bookingCode}</strong> for <em>{cancelModalBooking.movieTitle}</em>?
              </p>
              <p className="text-xs text-amber-400/90 pt-1">
                Seats ({cancelModalBooking.seats.map(s => s.seatId).join(', ')}) will be released immediately back to the cinema seat inventory.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={Boolean(cancellingId)}
                onClick={handleCancelBooking}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {cancellingId ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
