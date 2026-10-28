import React from 'react';
import { Film, Ticket, BookOpen, LogOut, User as UserIcon, Shield, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  currentTab: 'movies' | 'bookings' | 'docs';
  onSelectTab: (tab: 'movies' | 'bookings' | 'docs') => void;
  bookingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, bookingCount = 0 }) => {
  const { user, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onSelectTab('movies')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight text-white font-serif">
                THE <span className="text-amber-400">IMOVIES</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                MERN
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 hidden sm:block tracking-wide">
              Online Cinema & Real-Time Seat Reservation
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={() => onSelectTab('movies')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-2 ${
              currentTab === 'movies'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Movies</span>
          </button>

          <button
            onClick={() => onSelectTab('bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-2 relative ${
              currentTab === 'bookings'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Bookings</span>
            {bookingCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-zinc-950 font-bold">
                {bookingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('docs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition flex items-center space-x-2 ${
              currentTab === 'docs'
                ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Project Docs & Architecture</span>
            <span className="md:hidden">Docs</span>
          </button>
        </nav>

        {/* User Auth Info */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2 bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 pr-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                {user.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : user.name.charAt(0)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-zinc-200 leading-tight truncate max-w-[110px]">
                  {user.name}
                </p>
                <p className="text-[10px] text-zinc-400 capitalize flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  {user.role}
                </p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="py-1.5 px-3.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-lg transition shadow-md shadow-amber-500/10 flex items-center space-x-1.5"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
