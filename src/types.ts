export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Movie {
  id: string;
  title: string;
  tagline: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  genre: string[];
  durationMinutes: number;
  rating: number; // e.g., 8.8
  censorRating: string; // e.g. "PG-13", "R", "U/A"
  director: string;
  cast: string[];
  releaseDate: string;
  status: 'now_showing' | 'coming_soon';
  languages: string[];
}

export interface SeatTier {
  id: 'standard' | 'premium' | 'vip';
  name: string;
  price: number;
  rows: string[];
}

export interface Showtime {
  id: string;
  movieId: string;
  theaterName: string;
  hallName: string;
  city: string;
  dateTime: string; // ISO string
  format: '2D' | '3D' | 'IMAX' | '4DX';
  language: string;
  totalSeats: number;
  availableSeatsCount: number;
  reservedSeats: string[]; // array of seat IDs e.g. ["C4", "C5"]
  tiers: SeatTier[];
}

export interface ReservedSeatDetail {
  seatId: string; // e.g. "E7"
  row: string;
  col: number;
  tier: 'standard' | 'premium' | 'vip';
  price: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  showtimeId: string;
  theaterName: string;
  hallName: string;
  dateTime: string;
  format: string;
  seats: ReservedSeatDetail[];
  totalSeats: number;
  subtotal: number;
  convenienceFee: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'confirmed' | 'cancelled';
  bookingDate: string;
  qrCodeUrl?: string;
}

export interface SystemStats {
  userCount: number;
  movieCount: number;
  showtimeCount: number;
  bookingCount: number;
  databaseStatus: 'connected';
  jwtConfigured: boolean;
}
