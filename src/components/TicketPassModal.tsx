import React from 'react';
import { X, CheckCircle, Film, QrCode, Printer, Ticket, Calendar, Clock, MapPin, Share2 } from 'lucide-react';
import type { Booking } from '../types.js';

interface TicketPassModalProps {
  booking: Booking | null;
  onClose: () => void;
  onViewMyBookings: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  booking,
  onClose,
  onViewMyBookings
}) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(booking.dateTime).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = new Date(booking.dateTime).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto print:p-0 print:bg-white">
      <div 
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:w-full print:max-w-none print:my-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-3 flex items-center justify-between text-emerald-400 print:hidden">
          <div className="flex items-center space-x-2 text-xs font-bold">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Reservation Confirmed & Seats Locked!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Pass Body */}
        <div className="p-6 space-y-6 bg-zinc-950 text-white">
          {/* Ticket Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-black">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-serif font-black tracking-tight text-white block">
                  THE <span className="text-amber-400">IMOVIES</span>
                </span>
                <span className="text-[10px] text-zinc-400 tracking-widest uppercase">Digital Admission Pass</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase text-zinc-400 block">Booking Reference</span>
              <span className="text-sm font-mono font-bold text-amber-400">{booking.bookingCode}</span>
            </div>
          </div>

          {/* Movie Details */}
          <div className="flex gap-4">
            <img
              src={booking.moviePoster}
              alt={booking.movieTitle}
              className="w-20 h-28 object-cover rounded-xl border border-zinc-800 shadow"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                {booking.format} Experience
              </span>
              <h3 className="text-lg font-bold font-serif text-white truncate">
                {booking.movieTitle}
              </h3>
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{booking.theaterName}</span>
              </p>
              <p className="text-xs text-zinc-400">
                {booking.hallName}
              </p>
            </div>
          </div>

          {/* Timing & Seats Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-900/90 rounded-2xl border border-zinc-800/80 text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" /> Date
              </span>
              <p className="font-bold text-zinc-100">{formattedDate}</p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> Showtime
              </span>
              <p className="font-bold text-amber-400">{formattedTime}</p>
            </div>
          </div>

          {/* Reserved Seats List */}
          <div>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-2">
              Reserved Seats ({booking.seats.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {booking.seats.map(s => (
                <div
                  key={s.seatId}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Seat {s.seatId}</span>
                  <span className="text-[10px] text-zinc-400 font-normal">({s.tier})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Perforated separator */}
          <div className="relative py-2 flex items-center justify-between">
            <div className="w-5 h-5 rounded-full bg-zinc-900 -ml-8.5 border border-zinc-800" />
            <div className="border-t-2 border-dashed border-zinc-800 flex-1 mx-2" />
            <div className="w-5 h-5 rounded-full bg-zinc-900 -mr-8.5 border border-zinc-800" />
          </div>

          {/* QR Code Validation Section */}
          <div className="flex items-center justify-between p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Scan for Turnstile Entry</span>
              <p className="text-xs font-mono text-zinc-300 font-medium">PASS #{booking.bookingCode}</p>
              <p className="text-[11px] text-zinc-400">Guest: {booking.userName}</p>
              <p className="text-xs font-bold text-amber-400 mt-1">Paid: ${booking.totalAmount.toFixed(2)}</p>
            </div>

            <div className="p-2.5 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center">
              <QrCode className="w-16 h-16 text-black" />
              <span className="text-[8px] font-mono text-zinc-800 mt-0.5">VALID TICKET</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition border border-zinc-700 flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onViewMyBookings();
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition shadow-md shadow-amber-500/10 flex items-center space-x-1.5"
            >
              <Ticket className="w-4 h-4" />
              <span>Go to My Bookings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
