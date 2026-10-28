import React from 'react';
import { X, Star, Clock, Calendar, Film, Shield, Users, Globe } from 'lucide-react';
import type { Movie } from '../types.js';

interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  onBookNow: (movie: Movie) => void;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onBookNow
}) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop Banner */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-zinc-950">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors border border-white/10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-zinc-950 uppercase tracking-wider">
                  {movie.status === 'now_showing' ? 'In Theaters' : 'Coming Soon'}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800/90 text-zinc-300 border border-zinc-700">
                  {movie.censorRating}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight drop-shadow">
                {movie.title}
              </h2>
            </div>

            <div className="bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 flex items-center space-x-1.5 shrink-0 shadow-lg">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-white">{movie.rating.toFixed(1)}</span>
              <span className="text-[10px] text-zinc-400">/ 10</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Info Tags */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pb-4 border-b border-zinc-800/80">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Release: {new Date(movie.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-amber-500" />
              <span>{movie.languages.join(', ')}</span>
            </div>
          </div>

          {/* Genres */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Genres</h4>
            <div className="flex flex-wrap gap-2">
              {movie.genre.map(g => (
                <span
                  key={g}
                  className="px-3 py-1 text-xs rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700 font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Synopsis</h4>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {movie.description}
            </p>
          </div>

          {/* Director & Cast */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Director</span>
              <p className="text-sm font-medium text-zinc-200">{movie.director}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Starring Cast</span>
              <p className="text-sm font-medium text-zinc-200">{movie.cast.join(', ')}</p>
            </div>
          </div>

          {/* Action */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
            >
              Close
            </button>
            {movie.status === 'now_showing' && (
              <button
                onClick={() => {
                  onClose();
                  onBookNow(movie);
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-bold transition shadow-lg shadow-amber-500/20 flex items-center space-x-2"
              >
                <Film className="w-4 h-4" />
                <span>Select Showtime & Seats</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
