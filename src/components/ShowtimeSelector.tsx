import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, MapPin, X, Film, Check, Users, Sparkles } from 'lucide-react';
import type { Movie, Showtime } from '../types.js';
import { api } from '../api.js';

interface ShowtimeSelectorProps {
  movie: Movie | null;
  onClose: () => void;
  onSelectShowtime: (showtime: Showtime, movie: Movie) => void;
}

export const ShowtimeSelector: React.FC<ShowtimeSelectorProps> = ({
  movie,
  onClose,
  onSelectShowtime
}) => {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<string>('All');

  // Dates for the next 4 days
  const dateOptions = useMemo(() => {
    const list: { label: string; subLabel: string; isoDate: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      const weekday = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayNum = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      list.push({ label: weekday, subLabel: dayNum, isoDate });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].isoDate);

  useEffect(() => {
    if (!movie) return;
    let isMounted = true;
    setLoading(true);

    api.getShowtimes(movie.id)
      .then(res => {
        if (isMounted) {
          setShowtimes(res.showtimes);
        }
      })
      .catch(err => console.error('Failed to load showtimes', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [movie]);

  // Filter showtimes by selected date and format
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(s => {
      const matchesDate = s.dateTime.startsWith(selectedDate);
      const matchesFormat = selectedFormat === 'All' || s.format === selectedFormat;
      return matchesDate && matchesFormat;
    });
  }, [showtimes, selectedDate, selectedFormat]);

  // Group by theater
  const theaterGroups = useMemo(() => {
    const map = new Map<string, Showtime[]>();
    filteredShowtimes.forEach(s => {
      const existing = map.get(s.theaterName) || [];
      existing.push(s);
      map.set(s.theaterName, existing);
    });
    return Array.from(map.entries()).map(([theaterName, slots]) => ({
      theaterName,
      slots: slots.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    }));
  }, [filteredShowtimes]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 p-5 sm:p-6 border-b border-zinc-800 relative flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-16 h-24 rounded-xl object-cover border border-zinc-700 shadow-md shrink-0 hidden sm:block"
            />
            <div>
              <div className="flex items-center space-x-2 text-xs text-amber-400 font-semibold mb-1">
                <Film className="w-3.5 h-3.5" />
                <span>Select Showtime & Experience</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight">
                {movie.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-400">
                <span>{movie.censorRating}</span>
                <span>•</span>
                <span>{Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m</span>
                <span>•</span>
                <span className="text-zinc-300">{movie.genre.slice(0, 2).join(', ')}</span>
              </div>
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

        <div className="p-5 sm:p-6 space-y-6">
          {/* Step 1: Date Bar */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 mb-2.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              1. Choose Date
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {dateOptions.map(opt => {
                const isSelected = selectedDate === opt.isoDate;
                return (
                  <button
                    key={opt.isoDate}
                    onClick={() => setSelectedDate(opt.isoDate)}
                    className={`p-3 rounded-2xl border text-center transition ${
                      isSelected
                        ? 'bg-amber-500 border-amber-400 text-zinc-950 font-bold shadow-lg shadow-amber-500/20'
                        : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <p className={`text-xs ${isSelected ? 'text-zinc-950' : 'text-zinc-400'}`}>
                      {opt.label}
                    </p>
                    <p className="text-sm font-extrabold mt-0.5">
                      {opt.subLabel}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Format Filter */}
          <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
            <span className="text-xs font-semibold text-zinc-400">Experience Format:</span>
            <div className="flex space-x-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {['All', 'IMAX', '2D', '4DX'].map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    selectedFormat === fmt
                      ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Theaters & Showtimes */}
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              2. Available Theaters & Showtimes
            </label>

            {loading ? (
              <div className="p-8 text-center text-sm text-zinc-400">
                Loading live seat availability...
              </div>
            ) : theaterGroups.length === 0 ? (
              <div className="p-8 text-center bg-zinc-950/60 rounded-2xl border border-zinc-800 text-sm text-zinc-400">
                No showtimes available for the selected date and format. Try selecting a different date.
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                {theaterGroups.map(group => (
                  <div
                    key={group.theaterName}
                    className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                        <h4 className="text-sm font-bold text-white">
                          {group.theaterName}
                        </h4>
                      </div>
                      <span className="text-[11px] text-zinc-400">Downtown Metro</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {group.slots.map(slot => {
                        const time = new Date(slot.dateTime).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        });
                        const isAlmostFull = slot.availableSeatsCount <= 20;

                        return (
                          <button
                            key={slot.id}
                            onClick={() => onSelectShowtime(slot, movie)}
                            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 hover:border-amber-500/50 transition group text-left flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-sm font-black text-white group-hover:text-amber-400 transition">
                                {time}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {slot.format}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[11px]">
                              <span className="text-zinc-400 truncate max-w-[100px]">{slot.hallName.split('(')[0]}</span>
                              <span className={`font-semibold ${isAlmostFull ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {slot.availableSeatsCount} left
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
