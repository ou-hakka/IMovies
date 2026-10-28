import React, { useState, useMemo } from 'react';
import { X, Film, Check, ShieldAlert, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import type { Showtime, Movie, ReservedSeatDetail } from '../types.js';

interface SeatPickerModalProps {
  showtime: Showtime | null;
  movie: Movie | null;
  onClose: () => void;
  onProceedToCheckout: (showtime: Showtime, movie: Movie, seats: ReservedSeatDetail[]) => void;
}

export const SeatPickerModal: React.FC<SeatPickerModalProps> = ({
  showtime,
  movie,
  onClose,
  onProceedToCheckout
}) => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!showtime || !movie) return null;

  const rows = ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']; // Recliners at back, standard near screen
  const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Helper to get tier for a given row
  const getTierForRow = (row: string): { tier: 'standard' | 'premium' | 'vip'; price: number; name: string } => {
    if (['G', 'H'].includes(row)) {
      return { tier: 'vip', price: 24.00, name: 'VIP Recliner' };
    }
    if (['D', 'E', 'F'].includes(row)) {
      return { tier: 'premium', price: 17.00, name: 'Premium Club' };
    }
    return { tier: 'standard', price: 12.50, name: 'Standard' };
  };

  const handleToggleSeat = (seatId: string, row: string, col: number) => {
    setErrorMessage(null);
    // If already booked by someone else
    if (showtime.reservedSeats.includes(seatId)) return;

    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seatId));
    } else {
      if (selectedSeatIds.length >= 8) {
        setErrorMessage('You can select a maximum of 8 seats per reservation.');
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seatId]);
    }
  };

  // Build the list of ReservedSeatDetail objects
  const selectedSeatsDetails: ReservedSeatDetail[] = useMemo(() => {
    return selectedSeatIds.map(seatId => {
      const row = seatId.charAt(0);
      const col = parseInt(seatId.slice(1), 10);
      const tierInfo = getTierForRow(row);
      return {
        seatId,
        row,
        col,
        tier: tierInfo.tier,
        price: tierInfo.price
      };
    });
  }, [selectedSeatIds]);

  const subtotal = selectedSeatsDetails.reduce((sum, s) => sum + s.price, 0);
  const convenienceFee = selectedSeatsDetails.length > 0 ? Number((subtotal * 0.08 + 1.50).toFixed(2)) : 0;
  const grandTotal = Number((subtotal + convenienceFee).toFixed(2));

  const timeFormatted = new Date(showtime.dateTime).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  const dateFormatted = new Date(showtime.dateTime).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-serif">
                  {movie.title}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-zinc-950">
                  {showtime.format}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {showtime.theaterName} • {showtime.hallName} • <span className="text-amber-400 font-semibold">{dateFormatted} at {timeFormatted}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Seat Picker Area */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center overflow-x-auto">
          {/* Cinema Screen Curve Indicator */}
          <div className="w-full max-w-lg mb-8 text-center">
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full opacity-70 cinema-screen-curve" />
            <div className="h-6 w-full bg-gradient-to-b from-amber-400/15 to-transparent blur-md pointer-events-none" />
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400 mt-2">
              Cinema Screen
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-2.5 bg-red-950/70 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2 max-w-md">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Seat Grid Layout */}
          <div className="space-y-2 select-none min-w-[320px] sm:min-w-[500px]">
            {rows.map(row => {
              const tier = getTierForRow(row);
              const isVIP = tier.tier === 'vip';
              const isPremium = tier.tier === 'premium';

              return (
                <div key={row} className="flex items-center justify-center space-x-2">
                  {/* Row Label */}
                  <span className="w-5 text-center text-xs font-bold text-zinc-400">
                    {row}
                  </span>

                  {/* Seat Buttons */}
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    {columns.map((col, index) => {
                      const seatId = `${row}${col}`;
                      const isBooked = showtime.reservedSeats.includes(seatId);
                      const isSelected = selectedSeatIds.includes(seatId);

                      // Aisle gaps after col 3 and col 7
                      const addAisleRight = index === 2 || index === 6;

                      let btnStyle = 'border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-amber-400 hover:scale-105';
                      if (isBooked) {
                        btnStyle = 'border-zinc-800/80 bg-zinc-950 text-zinc-700 cursor-not-allowed opacity-40';
                      } else if (isSelected) {
                        btnStyle = 'border-amber-400 bg-amber-500 text-zinc-950 font-extrabold shadow-lg shadow-amber-500/30 scale-105';
                      } else if (isVIP) {
                        btnStyle = 'border-amber-500/40 bg-zinc-900 text-amber-200 hover:border-amber-400 hover:bg-zinc-800';
                      } else if (isPremium) {
                        btnStyle = 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-amber-400';
                      }

                      return (
                        <React.Fragment key={seatId}>
                          <button
                            type="button"
                            disabled={isBooked}
                            onClick={() => handleToggleSeat(seatId, row, col)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[11px] sm:text-xs font-medium transition flex items-center justify-center ${btnStyle}`}
                            title={`${seatId} - ${tier.name} ($${tier.price.toFixed(2)}) ${isBooked ? '(Occupied)' : isSelected ? '(Selected)' : '(Available)'}`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : col}
                          </button>
                          {addAisleRight && <div className="w-3 sm:w-6" />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Right Row Label */}
                  <span className="w-5 text-center text-xs font-bold text-zinc-400">
                    {row}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-8 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-900" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded border border-amber-400 bg-amber-500 text-zinc-950 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="text-amber-400 font-semibold">Selected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded border border-zinc-800 bg-zinc-950 opacity-50" />
              <span>Booked</span>
            </div>
            <div className="h-3 w-px bg-zinc-800 hidden sm:block" />
            <div className="flex items-center space-x-1.5">
              <span className="text-zinc-400 font-medium">Standard (A-C):</span>
              <span className="text-zinc-200 font-bold">$12.50</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-zinc-400 font-medium">Premium (D-F):</span>
              <span className="text-zinc-200 font-bold">$17.00</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-amber-400 font-medium">VIP Recliner (G-H):</span>
              <span className="text-amber-400 font-bold">$24.00</span>
            </div>
          </div>
        </div>

        {/* Bottom Booking Summary Footer */}
        <div className="p-4 sm:p-5 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-400">Selected Seats:</span>
              {selectedSeatsDetails.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedSeatsDetails.map(s => (
                    <span
                      key={s.seatId}
                      className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      {s.seatId} ({s.tier.toUpperCase()})
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-zinc-400 italic">No seats picked yet</span>
              )}
            </div>

            {selectedSeatsDetails.length > 0 && (
              <div className="flex items-center space-x-3 text-xs text-zinc-400 mt-1">
                <span>Subtotal: ${subtotal.toFixed(2)}</span>
                <span>•</span>
                <span>Convenience: ${convenienceFee.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <p className="text-[11px] text-zinc-400 uppercase tracking-wider">Total Price</p>
              <p className="text-xl font-black text-white font-serif">
                ${grandTotal.toFixed(2)}
              </p>
            </div>

            <button
              type="button"
              disabled={selectedSeatsDetails.length === 0}
              onClick={() => onProceedToCheckout(showtime, movie, selectedSeatsDetails)}
              className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm rounded-xl transition shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
