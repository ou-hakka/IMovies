import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, Calendar, Film, Play, Sparkles, ChevronRight } from 'lucide-react';
import type { Movie } from '../types.js';

interface MovieListProps {
  movies: Movie[];
  onSelectMovieForBooking: (movie: Movie) => void;
  onOpenMovieDetails: (movie: Movie) => void;
}

export const MovieList: React.FC<MovieListProps> = ({
  movies,
  onSelectMovieForBooking,
  onOpenMovieDetails
}) => {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [statusTab, setStatusTab] = useState<'now_showing' | 'coming_soon'>('now_showing');

  // Available genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach(m => m.genre.forEach(g => set.add(g)));
    return ['All', ...Array.from(set)];
  }, [movies]);

  // Filtered movies
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesStatus = movie.status === statusTab;
      const matchesGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre);
      const matchesSearch =
        movie.title.toLowerCase().includes(search.toLowerCase()) ||
        movie.description.toLowerCase().includes(search.toLowerCase()) ||
        movie.director.toLowerCase().includes(search.toLowerCase()) ||
        movie.cast.some(c => c.toLowerCase().includes(search.toLowerCase()));
      return matchesStatus && matchesGenre && matchesSearch;
    });
  }, [movies, statusTab, selectedGenre, search]);

  const featuredMovie = useMemo(() => {
    return movies.find(m => m.id === 'mov_dune2') || movies[0];
  }, [movies]);

  return (
    <div className="space-y-10 pb-16">
      {/* Cinematic Hero Feature Banner */}
      {featuredMovie && statusTab === 'now_showing' && !search && selectedGenre === 'All' && (
        <section className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 group">
          <div className="absolute inset-0">
            <img
              src={featuredMovie.backdropUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center filter brightness-40 group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
          </div>

          <div className="relative p-6 sm:p-10 lg:p-12 max-w-3xl space-y-4">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-zinc-950 flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Premiere
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700">
                IMAX 3D Experience
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white font-serif tracking-tight leading-none drop-shadow-md">
              {featuredMovie.title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 italic">
              "{featuredMovie.tagline}"
            </p>

            <p className="text-xs sm:text-sm text-zinc-300 line-clamp-3 leading-relaxed max-w-2xl">
              {featuredMovie.description}
            </p>

            {/* Quick Specs */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 pt-1">
              <div className="flex items-center space-x-1 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{featuredMovie.rating.toFixed(1)} / 10</span>
              </div>
              <div className="flex items-center space-x-1 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>{Math.floor(featuredMovie.durationMinutes / 60)}h {featuredMovie.durationMinutes % 60}m</span>
              </div>
              <div className="bg-zinc-800/80 px-2 py-1 rounded-lg border border-zinc-700 font-semibold text-zinc-300">
                {featuredMovie.censorRating}
              </div>
              <div className="text-zinc-400">
                Dir. <span className="text-zinc-200">{featuredMovie.director}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => onSelectMovieForBooking(featuredMovie)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-sm transition shadow-lg shadow-amber-500/25 flex items-center gap-2 group-hover:scale-[1.02]"
              >
                <Film className="w-4 h-4" />
                <span>Book Tickets Now</span>
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </button>
              <button
                onClick={() => onOpenMovieDetails(featuredMovie)}
                className="px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm transition border border-zinc-700 flex items-center gap-2"
              >
                <span>View Synopsis & Cast</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
            <button
              onClick={() => setStatusTab('now_showing')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                statusTab === 'now_showing'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Now Showing
            </button>
            <button
              onClick={() => setStatusTab('coming_soon')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                statusTab === 'coming_soon'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Coming Soon
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movie title, director, actors..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Genre Tags Horizontal Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-zinc-400 text-xs font-semibold mr-1 shrink-0">Genre:</span>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                selectedGenre === genre
                  ? 'bg-zinc-200 text-zinc-950 font-bold'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/90'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-500" />
            {statusTab === 'now_showing' ? 'Movies in Theaters' : 'Anticipated Upcoming Releases'}
          </h2>
          <span className="text-xs text-zinc-500 font-medium">
            Showing {filteredMovies.length} {filteredMovies.length === 1 ? 'title' : 'titles'}
          </span>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
            <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-zinc-300">No movies match your criteria</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query or switching to another genre filter.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedGenre('All'); }}
              className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMovies.map(movie => (
              <div
                key={movie.id}
                className="group bg-zinc-900/80 rounded-2xl border border-zinc-800/90 overflow-hidden flex flex-col hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition duration-300"
              >
                {/* Poster Container */}
                <div 
                  className="relative aspect-[2/3] overflow-hidden cursor-pointer bg-zinc-950"
                  onClick={() => onOpenMovieDetails(movie)}
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center space-x-1 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-zinc-100">{movie.rating.toFixed(1)}</span>
                  </div>

                  {/* Censor Rating */}
                  <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-semibold text-zinc-300 border border-zinc-800">
                    {movie.censorRating}
                  </div>

                  {/* Quick details overlay on bottom of poster */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-zinc-300">
                    <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-amber-300">
                      <span>{movie.languages.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {movie.genre.map(g => (
                        <span
                          key={g}
                          className="text-[10px] uppercase font-semibold text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800"
                        >
                          {g}
                        </span>
                      ))}
                    </div>

                    <h3 
                      onClick={() => onOpenMovieDetails(movie)}
                      className="text-base font-bold text-white font-serif line-clamp-1 hover:text-amber-400 cursor-pointer transition"
                    >
                      {movie.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {movie.description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                    {movie.status === 'now_showing' ? (
                      <button
                        onClick={() => onSelectMovieForBooking(movie)}
                        className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition shadow shadow-amber-500/10 flex items-center justify-center gap-1.5"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>Book Seats</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 py-2 px-3 bg-zinc-800 text-zinc-400 font-semibold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Releasing Soon</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenMovieDetails(movie)}
                      className="py-2 px-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs rounded-xl transition border border-zinc-700/60"
                      title="View Details"
                    >
                      Info
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
