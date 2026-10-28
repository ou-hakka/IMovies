/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { MovieList } from './components/MovieList.js';
import { MovieDetailsModal } from './components/MovieDetailsModal.js';
import { ShowtimeSelector } from './components/ShowtimeSelector.js';
import { SeatPickerModal } from './components/SeatPickerModal.js';
import { CheckoutModal } from './components/CheckoutModal.js';
import { TicketPassModal } from './components/TicketPassModal.js';
import { MyBookingsView } from './components/MyBookingsView.js';
import { ArchitectureDocsView } from './components/ArchitectureDocsView.js';
import { AuthModal } from './components/AuthModal.js';
import { api } from './api.js';
import type { Movie, Showtime, ReservedSeatDetail, Booking } from './types.js';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'movies' | 'bookings' | 'docs'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [myBookingsCount, setMyBookingsCount] = useState<number>(0);

  // Modals state
  const [detailsMovie, setDetailsMovie] = useState<Movie | null>(null);
  const [bookingMovie, setBookingMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [checkoutSeats, setCheckoutSeats] = useState<ReservedSeatDetail[]>([]);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Load movies
  const loadMovies = async () => {
    setLoadingMovies(true);
    try {
      const res = await api.getMovies();
      setMovies(res.movies);
    } catch (err) {
      console.error('Error fetching movies:', err);
    } finally {
      setLoadingMovies(false);
    }
  };

  // Load user's bookings count
  const loadBookingsCount = async () => {
    if (!user) {
      setMyBookingsCount(0);
      return;
    }
    try {
      const res = await api.getMyBookings();
      const active = res.bookings.filter(b => b.status === 'confirmed');
      setMyBookingsCount(active.length);
    } catch (err) {
      console.error('Error loading bookings count:', err);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    loadBookingsCount();
  }, [user]);

  // Flow handlers
  const handleOpenShowtimes = (movie: Movie) => {
    setDetailsMovie(null);
    setBookingMovie(movie);
  };

  const handleSelectShowtime = (showtime: Showtime, movie: Movie) => {
    setSelectedShowtime(showtime);
  };

  const handleProceedToCheckout = (showtime: Showtime, movie: Movie, seats: ReservedSeatDetail[]) => {
    setCheckoutSeats(seats);
  };

  const handleBookingSuccess = (booking: Booking) => {
    // Close checkout and seat picker
    setCheckoutSeats([]);
    setSelectedShowtime(null);
    setBookingMovie(null);
    // Show digital boarding pass
    setConfirmedBooking(booking);
    // Refresh bookings count
    loadBookingsCount();
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        bookingCount={myBookingsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {currentTab === 'movies' && (
          <MovieList
            movies={movies}
            onSelectMovieForBooking={handleOpenShowtimes}
            onOpenMovieDetails={(m) => setDetailsMovie(m)}
          />
        )}

        {currentTab === 'bookings' && (
          <MyBookingsView
            onOpenTicketPass={(b) => setConfirmedBooking(b)}
            onBrowseMovies={() => setCurrentTab('movies')}
          />
        )}

        {currentTab === 'docs' && (
          <ArchitectureDocsView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-8 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-zinc-300">The IMovies</span>
            <span>•</span>
            <span>MERN Stack Architecture with JWT & Real-Time Seat Engine</span>
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentTab('docs')}
              className="hover:text-amber-400 transition"
            >
              System Docs
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('movies')}
              className="hover:text-amber-400 transition"
            >
              Movies
            </button>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('bookings')}
              className="hover:text-amber-400 transition"
            >
              My Tickets
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <AuthModal />

      <MovieDetailsModal
        movie={detailsMovie}
        onClose={() => setDetailsMovie(null)}
        onBookNow={handleOpenShowtimes}
      />

      {bookingMovie && !selectedShowtime && (
        <ShowtimeSelector
          movie={bookingMovie}
          onClose={() => setBookingMovie(null)}
          onSelectShowtime={handleSelectShowtime}
        />
      )}

      {selectedShowtime && bookingMovie && checkoutSeats.length === 0 && (
        <SeatPickerModal
          showtime={selectedShowtime}
          movie={bookingMovie}
          onClose={() => setSelectedShowtime(null)}
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}

      {checkoutSeats.length > 0 && selectedShowtime && bookingMovie && (
        <CheckoutModal
          showtime={selectedShowtime}
          movie={bookingMovie}
          seats={checkoutSeats}
          onClose={() => setCheckoutSeats([])}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      <TicketPassModal
        booking={confirmedBooking}
        onClose={() => setConfirmedBooking(null)}
        onViewMyBookings={() => {
          setConfirmedBooking(null);
          setCurrentTab('bookings');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
