import React, { useState, useEffect } from 'react';
import { Database, Shield, Server, Layout, RefreshCw, CheckCircle2, Code2, Terminal, Layers, Cpu, ArrowRight, Zap } from 'lucide-react';
import { api } from '../api.js';
import type { SystemStats } from '../types.js';

export const ArchitectureDocsView: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'architecture' | 'mongodb' | 'jwt' | 'concurrency' | 'api' | 'setup'>('architecture');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getSystemStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load system stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetDatabase = async () => {
    if (!confirm('Re-seed cinema database to initial state? This resets sample bookings and resets occupied seats.')) return;
    try {
      const res = await api.resetAndSeed();
      setResetMessage(res.message);
      await fetchStats();
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset database');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Title & Live Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Cpu className="w-4 h-4" />
            <span>MERN Stack Technical Architecture & Documentation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            The IMovies Engineering Guide
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Complete technical specification covering Express.js backend, MongoDB document models, stateless JWT authentication, and real-time seat availability concurrency.
          </p>
        </div>

        {/* Live Diagnostics Pill Box */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center space-x-3 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Database Engine</span>
              <span className="font-bold text-zinc-200">MongoDB / Document Store</span>
            </div>
          </div>

          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center space-x-3 text-xs">
            <Shield className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Security Auth</span>
              <span className="font-bold text-zinc-200">JWT (HS256)</span>
            </div>
          </div>

          <button
            onClick={handleResetDatabase}
            className="p-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-2xl border border-zinc-700 transition flex items-center space-x-2 text-xs font-semibold"
            title="Reset database to initial clean state"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset & Seed DB</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Live Collection Metrics Card */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 font-semibold uppercase">Movies Collection</span>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1">{stats.movieCount}</p>
            <span className="text-[10px] text-zinc-400">Documents stored</span>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 font-semibold uppercase">Showtimes Collection</span>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1">{stats.showtimeCount}</p>
            <span className="text-[10px] text-zinc-400">Live seat matrices</span>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 font-semibold uppercase">Bookings Collection</span>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1">{stats.bookingCount}</p>
            <span className="text-[10px] text-zinc-400">Tickets issued</span>
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <span className="text-[11px] text-zinc-500 font-semibold uppercase">Users Collection</span>
            <p className="text-2xl font-black text-amber-400 font-mono mt-1">{stats.userCount}</p>
            <span className="text-[10px] text-zinc-400">Bcrypt-hashed accounts</span>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'architecture', label: '1. Architecture & MERN Flow', icon: Layers },
          { id: 'mongodb', label: '2. MongoDB Document Schemas', icon: Database },
          { id: 'jwt', label: '3. JWT Auth Lifecycle', icon: Shield },
          { id: 'concurrency', label: '4. Real-Time Seat Concurrency', icon: Zap },
          { id: 'api', label: '5. REST API Specifications', icon: Code2 },
          { id: 'setup', label: '6. Setup & Deployment Guide', icon: Terminal }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section 1: Architecture Overview */}
      {activeSection === 'architecture' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              MERN Stack Client-Server Technical Topology
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              The IMovies follows a decoupled, stateless MERN (MongoDB, Express, React, Node.js) architecture. The React SPA runs in the client browser with optimistic UI updates and reactive state management, interacting with the Node.js/Express REST server through typed JSON payloads guarded by Bearer JWT headers.
            </p>

            {/* Architecture Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3">
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase">
                  <Layout className="w-4 h-4" />
                  <span>1. React Client</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Built with React 19 and Tailwind CSS. Features interactive cinema curved screen seat picking, date filtering, ticket wallet with QR rendering, and instant subtotal recalculation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase">
                  <Server className="w-4 h-4" />
                  <span>2. Express.js API</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Provides unified routing for movies catalogue, showtime schedules, atomic booking transactions, and user authentication with input validation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase">
                  <Shield className="w-4 h-4" />
                  <span>3. JWT & Security</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Stateless JSON Web Tokens signed with HS256 algorithm. Bcrypt rounds (salt factor 10) for one-way password hashing. Role-Based Access Control (RBAC).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center space-x-2 text-green-400 text-xs font-bold uppercase">
                  <Database className="w-4 h-4" />
                  <span>4. MongoDB Storage</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Document-oriented collection storage. Embedded sub-documents for seat pricing tiers, row arrays, and locked seat IDs for high-throughput concurrency.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: MongoDB Document Schemas */}
      {activeSection === 'mongodb' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              MongoDB Document Models & Mongoose Schemas
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300">
              The data model is optimized for rapid reading of movie details, date-based showtime lookups, and atomic array updates on reserved seats.
            </p>

            <div className="space-y-4 pt-2">
              {/* Showtimes Schema */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono">Showtimes Collection Schema</span>
                <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto p-3 bg-zinc-900/60 rounded-xl">
{`const ShowtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
  theaterName: { type: String, required: true },
  hallName: { type: String, required: true },
  dateTime: { type: Date, required: true, index: true },
  format: { type: String, enum: ['2D', '3D', 'IMAX', '4DX'], default: '2D' },
  language: { type: String, default: 'English' },
  totalSeats: { type: Number, default: 80 },
  availableSeatsCount: { type: Number, default: 80 },
  reservedSeats: [{ type: String }], // Array of seat codes e.g. ["D4", "D5", "G2"]
  tiers: [{
    id: { type: String, enum: ['standard', 'premium', 'vip'] },
    name: String,
    price: Number,
    rows: [String]
  }]
}, { timestamps: true });`}
                </pre>
              </div>

              {/* Bookings Schema */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase font-mono">Bookings Collection Schema</span>
                <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto p-3 bg-zinc-900/60 rounded-xl">
{`const BookingSchema = new mongoose.Schema({
  bookingCode: { type: String, unique: true, required: true }, // e.g. "IMV-784910"
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: [{
    seatId: String, // "E5"
    row: String,    // "E"
    col: Number,    // 5
    tier: String,   // "premium"
    price: Number   // 17.00
  }],
  subtotal: { type: Number, required: true },
  convenienceFee: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Online Credit Card' },
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  qrCodeUrl: String
}, { timestamps: true });`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: JWT Lifecycle */}
      {activeSection === 'jwt' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Stateless JWT Authentication & Session Flow
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300">
              Users authenticate via <code>POST /api/auth/login</code> or <code>POST /api/auth/register</code>. Upon validation against bcrypt password hashes, a cryptographically signed JSON Web Token is returned to the client.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase">1. Token Generation</span>
                <p className="text-xs text-zinc-400">
                  Signed server-side with HS256 secret. Encodes <code>user.id</code>, <code>email</code>, and <code>role</code> with a 7-day expiration period.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase">2. Client Storage</span>
                <p className="text-xs text-zinc-400">
                  Stored securely in the client state and attached automatically to all outgoing mutating API calls via the <code>Authorization: Bearer &lt;token&gt;</code> HTTP header.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase">3. Auth Middleware</span>
                <p className="text-xs text-zinc-400">
                  Express <code>authMiddleware</code> intercepts protected routes, validates the digital signature, extracts the user document, and attaches it to <code>req.user</code>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Real-time Concurrency */}
      {activeSection === 'concurrency' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Real-Time Seat Reservation & Concurrency Management
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300">
              In high-demand cinema releases, multiple patrons may attempt to book the exact same premium seat simultaneously. The IMovies utilizes an atomic verification and lock strategy:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
                <span className="font-bold text-white block">1. Atomic Conflict Check</span>
                <p className="text-zinc-400">
                  When <code>POST /api/bookings</code> arrives, the backend compares the requested seat IDs against the current <code>showtime.reservedSeats</code> array.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
                <span className="font-bold text-white block">2. Rollback on Collision</span>
                <p className="text-zinc-400">
                  If any seat is already in <code>reservedSeats</code>, the transaction aborts with HTTP 409 Conflict, returning a clear error specifying which seat was taken, preventing double booking.
                </p>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs space-y-1.5">
                <span className="font-bold text-white block">3. Instant Cancellation Release</span>
                <p className="text-zinc-400">
                  When a user clicks "Cancel Reservation", the seats are atomically removed from <code>showtime.reservedSeats</code>, and the <code>availableSeatsCount</code> is instantly restored in the inventory.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 5: REST API Specs */}
      {activeSection === 'api' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <Code2 className="w-5 h-5 text-amber-400" />
              REST API Endpoints Specification
            </h3>

            <div className="space-y-2.5">
              {[
                { method: 'POST', path: '/api/auth/register', auth: 'Public', desc: 'Create new patron account with name, email, password' },
                { method: 'POST', path: '/api/auth/login', auth: 'Public', desc: 'Verify credentials and issue JWT bearer token' },
                { method: 'GET', path: '/api/auth/me', auth: 'Bearer JWT', desc: 'Fetch currently authenticated user profile' },
                { method: 'GET', path: '/api/movies', auth: 'Public', desc: 'List movies with genre, search, and status filters' },
                { method: 'GET', path: '/api/showtimes', auth: 'Public', desc: 'Query showtimes by movieId and date' },
                { method: 'GET', path: '/api/showtimes/:id', auth: 'Public', desc: 'Fetch detailed hall seat matrix and occupied seats' },
                { method: 'POST', path: '/api/bookings', auth: 'Bearer JWT', desc: 'Atomically reserve seats and generate confirmed ticket' },
                { method: 'GET', path: '/api/bookings/my', auth: 'Bearer JWT', desc: 'Retrieve authenticated user reservation history' },
                { method: 'PATCH', path: '/api/bookings/:id/cancel', auth: 'Bearer JWT', desc: 'Cancel reservation and release seats to inventory' }
              ].map(ep => (
                <div key={ep.path} className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                      ep.method === 'POST' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {ep.method}
                    </span>
                    <span className="font-mono text-zinc-200 font-semibold">{ep.path}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-zinc-400">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                      {ep.auth}
                    </span>
                    <span>{ep.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 6: Setup & Deployment */}
      {activeSection === 'setup' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-amber-400" />
              Environment Variables & Local Setup Guide
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300">
              The project is pre-configured with zero friction. You can run it immediately with full MERN capabilities:
            </p>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3 text-xs">
              <span className="font-bold text-amber-400 uppercase font-mono">Running the Application</span>
              <pre className="p-3 bg-zinc-900 rounded-xl text-zinc-300 font-mono overflow-x-auto">
{`# 1. Install dependencies
npm install

# 2. Run the Express + Vite unified development server
npm run dev

# 3. Build for production deployment
npm run build
npm start`}
              </pre>
            </div>

            <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2 text-xs">
              <span className="font-bold text-amber-400 uppercase font-mono">Pre-Configured Test Credentials</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Patron Account</span>
                  <p className="text-zinc-200 font-medium">Email: <strong>alex@example.com</strong></p>
                  <p className="text-zinc-400">Password: <strong>password123</strong></p>
                </div>
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Cinema Administrator</span>
                  <p className="text-zinc-200 font-medium">Email: <strong>admin@imovies.com</strong></p>
                  <p className="text-zinc-400">Password: <strong>admin123</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
