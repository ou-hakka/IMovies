import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User, Movie, Showtime, Booking } from '../src/types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MOVIES_FILE = path.join(DATA_DIR, 'movies.json');
const SHOWTIMES_FILE = path.join(DATA_DIR, 'showtimes.json');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// In-memory collections with file persistence
let users: User[] = [];
let userPasswords: Record<string, string> = {}; // userId -> bcrypt hash
let movies: Movie[] = [];
let showtimes: Showtime[] = [];
let bookings: Booking[] = [];

function loadData() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const uData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      users = uData.users || [];
      userPasswords = uData.passwords || {};
    }
    if (fs.existsSync(MOVIES_FILE)) {
      movies = JSON.parse(fs.readFileSync(MOVIES_FILE, 'utf-8'));
    }
    if (fs.existsSync(SHOWTIMES_FILE)) {
      showtimes = JSON.parse(fs.readFileSync(SHOWTIMES_FILE, 'utf-8'));
    }
    if (fs.existsSync(BOOKINGS_FILE)) {
      bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf-8'));
    }
  } catch (err) {
    console.error('Error loading data files, falling back to initial seed', err);
  }

  if (movies.length === 0 || showtimes.length === 0 || users.length === 0) {
    seedDatabase();
  }
}

function saveData() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users, passwords: userPasswords }, null, 2));
    fs.writeFileSync(MOVIES_FILE, JSON.stringify(movies, null, 2));
    fs.writeFileSync(SHOWTIMES_FILE, JSON.stringify(showtimes, null, 2));
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error('Error saving data to disk', err);
  }
}

export function seedDatabase() {
  // Demo Users
  const salt = bcrypt.genSaltSync(10);
  const demoUserId = 'usr_demo_101';
  const adminUserId = 'usr_admin_999';

  users = [
    {
      id: demoUserId,
      name: 'Alex Mercer',
      email: 'alex@example.com',
      role: 'user',
      createdAt: new Date().toISOString()
    },
    {
      id: adminUserId,
      name: 'IMovies Admin',
      email: 'admin@imovies.com',
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  ];

  userPasswords = {
    [demoUserId]: bcrypt.hashSync('password123', salt),
    [adminUserId]: bcrypt.hashSync('admin123', salt)
  };

  // Seed Movies
  movies = [
    {
      id: 'mov_dune2',
      title: 'Dune: Part Two',
      tagline: 'Long live the fighters.',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1800&auto=format&fit=crop',
      genre: ['Sci-Fi', 'Adventure', 'Action'],
      durationMinutes: 166,
      rating: 8.6,
      censorRating: 'PG-13',
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler', 'Florence Pugh'],
      releaseDate: '2024-03-01',
      status: 'now_showing',
      languages: ['English', 'Spanish', 'French']
    },
    {
      id: 'mov_oppenheimer',
      title: 'Oppenheimer',
      tagline: 'The world forever changes.',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, examining the moral, political, and personal consequences of scientific ambition.',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1000&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1800&auto=format&fit=crop',
      genre: ['Biography', 'Drama', 'History'],
      durationMinutes: 180,
      rating: 8.9,
      censorRating: 'R',
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
      releaseDate: '2023-07-21',
      status: 'now_showing',
      languages: ['English', 'German']
    },
    {
      id: 'mov_interstellar',
      title: 'Interstellar (10th Anniversary IMAX)',
      tagline: 'Mankind was born on Earth. It was never meant to die here.',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
      posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1000&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1800&auto=format&fit=crop',
      genre: ['Sci-Fi', 'Drama', 'Adventure'],
      durationMinutes: 169,
      rating: 8.7,
      censorRating: 'PG-13',
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      releaseDate: '2024-10-01',
      status: 'now_showing',
      languages: ['English']
    },
    {
      id: 'mov_gladiator2',
      title: 'Gladiator II',
      tagline: 'What we do in life echoes in eternity.',
      description: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome with an iron fist.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1800&auto=format&fit=crop',
      genre: ['Action', 'Drama', 'Adventure'],
      durationMinutes: 148,
      rating: 8.1,
      censorRating: 'R',
      director: 'Ridley Scott',
      cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
      releaseDate: '2024-11-22',
      status: 'now_showing',
      languages: ['English', 'Italian']
    },
    {
      id: 'mov_wicked',
      title: 'Wicked',
      tagline: 'You think you know the story.',
      description: 'The story of how a green-skinned woman framed by the Wizard of Oz becomes the Wicked Witch of the West; the first of a two-part feature film adaptation of the Broadway musical.',
      posterUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1000&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1800&auto=format&fit=crop',
      genre: ['Fantasy', 'Musical', 'Romance'],
      durationMinutes: 160,
      rating: 8.0,
      censorRating: 'PG',
      director: 'Jon M. Chu',
      cast: ['Cynthia Erivo', 'Ariana Grande', 'Jeff Goldblum', 'Jonathan Bailey', 'Michelle Yeoh'],
      releaseDate: '2024-11-20',
      status: 'now_showing',
      languages: ['English']
    },
    {
      id: 'mov_avatar3',
      title: 'Avatar: Fire and Ash',
      tagline: 'Return to Pandora. Meet the Ash People.',
      description: 'Jake Sully and Neytiri face a new antagonistic Na\'vi tribe known as the "Ash People", led by Varang, exploring new biomes across Pandora and testing family resilience.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?q=80&w=1800&auto=format&fit=crop',
      genre: ['Sci-Fi', 'Action', 'Fantasy'],
      durationMinutes: 190,
      rating: 8.5,
      censorRating: 'PG-13',
      director: 'James Cameron',
      cast: ['Sam Worthington', 'Zoe Saldaña', 'Sigourney Weaver', 'Oona Chaplin'],
      releaseDate: '2025-12-19',
      status: 'coming_soon',
      languages: ['English']
    }
  ];

  // Helper to construct dynamic showtimes
  const now = new Date();
  const times = ['10:30', '14:15', '18:00', '21:30'];
  const theaters = [
    { name: 'IMovies Grand Lux Cinema', hall: 'Hall 1 (IMAX Laser)', format: 'IMAX' as const },
    { name: 'Pinnacle Multiplex', hall: 'Audi 3 (Dolby Atmos)', format: '2D' as const },
    { name: 'Metropolis Cinemax', hall: 'Screen 5 (4DX Motion)', format: '4DX' as const }
  ];

  const tiers = [
    { id: 'standard' as const, name: 'Standard', price: 12.50, rows: ['A', 'B', 'C'] },
    { id: 'premium' as const, name: 'Premium Club', price: 17.00, rows: ['D', 'E', 'F'] },
    { id: 'vip' as const, name: 'VIP Recliner', price: 24.00, rows: ['G', 'H'] }
  ];

  showtimes = [];
  let showtimeCounter = 1;

  // Generate showtimes for the next 4 days for now_showing movies
  const nowShowing = movies.filter(m => m.status === 'now_showing');
  
  for (let dayOffset = 0; dayOffset < 4; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];

    for (const movie of nowShowing) {
      for (let tIndex = 0; tIndex < theaters.length; tIndex++) {
        const theater = theaters[tIndex];
        // 2 slots per theater per movie per day
        const slotTimes = tIndex === 0 ? [times[1], times[3]] : [times[0], times[2]];
        
        for (const timeStr of slotTimes) {
          const isoDateTime = `${dateStr}T${timeStr}:00.000Z`;
          
          // Pre-populate some reserved seats for realistic real-time simulation
          const reservedSeats: string[] = [];
          const sampleSeats = ['C3', 'C4', 'D5', 'D6', 'E4', 'E5', 'G2', 'G3', 'H5', 'H6'];
          
          // Seed deterministic occupied seats based on counter
          sampleSeats.forEach((seat, idx) => {
            if ((showtimeCounter + idx) % 3 === 0) {
              reservedSeats.push(seat);
            }
          });

          const totalSeats = 8 * 10; // 8 rows (A-H), 10 cols (1-10) = 80 seats
          
          showtimes.push({
            id: `st_${movie.id}_${showtimeCounter}`,
            movieId: movie.id,
            theaterName: theater.name,
            hallName: theater.hall,
            city: 'Downtown Metro',
            dateTime: isoDateTime,
            format: theater.format,
            language: 'English',
            totalSeats,
            availableSeatsCount: totalSeats - reservedSeats.length,
            reservedSeats,
            tiers
          });

          showtimeCounter++;
        }
      }
    }
  }

  // Pre-seed 1 confirmed booking for Alex Mercer so "My Bookings" has immediate rich preview
  const firstShowtime = showtimes[0];
  const firstMovie = movies.find(m => m.id === firstShowtime.movieId)!;
  bookings = [
    {
      id: 'bk_sample_001',
      bookingCode: 'IMV-784910',
      userId: demoUserId,
      userName: 'Alex Mercer',
      userEmail: 'alex@example.com',
      movieId: firstMovie.id,
      movieTitle: firstMovie.title,
      moviePoster: firstMovie.posterUrl,
      showtimeId: firstShowtime.id,
      theaterName: firstShowtime.theaterName,
      hallName: firstShowtime.hallName,
      dateTime: firstShowtime.dateTime,
      format: firstShowtime.format,
      seats: [
        { seatId: 'E4', row: 'E', col: 4, tier: 'premium', price: 17.00 },
        { seatId: 'E5', row: 'E', col: 5, tier: 'premium', price: 17.00 }
      ],
      totalSeats: 2,
      subtotal: 34.00,
      convenienceFee: 3.50,
      totalAmount: 37.50,
      paymentMethod: 'Credit Card (•••• 4242)',
      status: 'confirmed',
      bookingDate: new Date(Date.now() - 3600000 * 2).toISOString(),
      qrCodeUrl: 'IMV-784910-SECURE-ENTRY-PASS'
    }
  ];

  // Mark seats as reserved in firstShowtime
  if (!firstShowtime.reservedSeats.includes('E4')) firstShowtime.reservedSeats.push('E4');
  if (!firstShowtime.reservedSeats.includes('E5')) firstShowtime.reservedSeats.push('E5');
  firstShowtime.availableSeatsCount = firstShowtime.totalSeats - firstShowtime.reservedSeats.length;

  saveData();
}

// Initial load
loadData();

export const db = {
  // Users
  getUserById(id: string): User | undefined {
    return users.find(u => u.id === id);
  },
  getUserByEmail(email: string): User | undefined {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  verifyPassword(userId: string, passwordAttempt: string): boolean {
    const hash = userPasswords[userId];
    if (!hash) return false;
    return bcrypt.compareSync(passwordAttempt, hash);
  },
  createUser(name: string, email: string, passwordRaw: string, role: 'user' | 'admin' = 'user'): User {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(passwordRaw, salt);

    const newUser: User = {
      id,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    userPasswords[id] = hash;
    saveData();
    return newUser;
  },

  // Movies
  getMovies(filter?: { status?: string; genre?: string; search?: string }): Movie[] {
    let result = [...movies];
    if (filter?.status) {
      result = result.filter(m => m.status === filter.status);
    }
    if (filter?.genre && filter.genre !== 'All') {
      result = result.filter(m => m.genre.includes(filter.genre!));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q) ||
        m.director.toLowerCase().includes(q) ||
        m.cast.some(actor => actor.toLowerCase().includes(q))
      );
    }
    return result;
  },
  getMovieById(id: string): Movie | undefined {
    return movies.find(m => m.id === id);
  },
  addMovie(movieData: Omit<Movie, 'id'>): Movie {
    const id = `mov_${Date.now()}`;
    const movie: Movie = { ...movieData, id };
    movies.unshift(movie);
    saveData();
    return movie;
  },

  // Showtimes
  getShowtimes(movieId?: string, date?: string): Showtime[] {
    let result = [...showtimes];
    if (movieId) {
      result = result.filter(s => s.movieId === movieId);
    }
    if (date) {
      result = result.filter(s => s.dateTime.startsWith(date));
    }
    return result;
  },
  getShowtimeById(id: string): Showtime | undefined {
    return showtimes.find(s => s.id === id);
  },

  // Atomic reservation and booking
  createBooking(bookingPayload: {
    userId: string;
    showtimeId: string;
    seats: { seatId: string; row: string; col: number; tier: 'standard' | 'premium' | 'vip'; price: number }[];
    paymentMethod: string;
  }): { success: boolean; booking?: Booking; error?: string } {
    const showtime = showtimes.find(s => s.id === bookingPayload.showtimeId);
    if (!showtime) {
      return { success: false, error: 'Showtime not found' };
    }

    const user = users.find(u => u.id === bookingPayload.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const movie = movies.find(m => m.id === showtime.movieId);
    if (!movie) {
      return { success: false, error: 'Movie not found' };
    }

    // Check concurrency - verify none of the requested seats are already booked
    const seatIds = bookingPayload.seats.map(s => s.seatId);
    const conflicts = seatIds.filter(seatId => showtime.reservedSeats.includes(seatId));

    if (conflicts.length > 0) {
      return {
        success: false,
        error: `Seats ${conflicts.join(', ')} were just reserved by another guest. Please select different seats.`
      };
    }

    // Reserve seats in showtime document
    showtime.reservedSeats.push(...seatIds);
    showtime.availableSeatsCount = showtime.totalSeats - showtime.reservedSeats.length;

    // Calculate totals
    const subtotal = bookingPayload.seats.reduce((sum, s) => sum + s.price, 0);
    const convenienceFee = Number((subtotal * 0.08 + 1.50).toFixed(2));
    const totalAmount = Number((subtotal + convenienceFee).toFixed(2));

    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const bookingCode = `IMV-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: Booking = {
      id: bookingId,
      bookingCode,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.posterUrl,
      showtimeId: showtime.id,
      theaterName: showtime.theaterName,
      hallName: showtime.hallName,
      dateTime: showtime.dateTime,
      format: showtime.format,
      seats: bookingPayload.seats,
      totalSeats: bookingPayload.seats.length,
      subtotal,
      convenienceFee,
      totalAmount,
      paymentMethod: bookingPayload.paymentMethod || 'Online Credit Card',
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      qrCodeUrl: `${bookingCode}-${showtime.id}-${user.id.substring(0, 5)}`
    };

    bookings.unshift(newBooking);
    saveData();

    return { success: true, booking: newBooking };
  },

  getBookingsByUser(userId: string): Booking[] {
    return bookings.filter(b => b.userId === userId);
  },

  getBookingById(id: string): Booking | undefined {
    return bookings.find(b => b.id === id);
  },

  cancelBooking(bookingId: string, userId: string): { success: boolean; error?: string } {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.userId !== userId && !users.find(u => u.id === userId && u.role === 'admin')) {
      return { success: false, error: 'Unauthorized to cancel this ticket' };
    }

    if (booking.status === 'cancelled') {
      return { success: false, error: 'Booking is already cancelled' };
    }

    // Free the reserved seats in the showtime
    const showtime = showtimes.find(s => s.id === booking.showtimeId);
    if (showtime) {
      const bookedSeatIds = booking.seats.map(s => s.seatId);
      showtime.reservedSeats = showtime.reservedSeats.filter(s => !bookedSeatIds.includes(s));
      showtime.availableSeatsCount = showtime.totalSeats - showtime.reservedSeats.length;
    }

    booking.status = 'cancelled';
    saveData();
    return { success: true };
  },

  getStats() {
    return {
      userCount: users.length,
      movieCount: movies.length,
      showtimeCount: showtimes.length,
      bookingCount: bookings.length,
      databaseStatus: 'connected' as const,
      jwtConfigured: true
    };
  },

  resetAndSeed() {
    seedDatabase();
    return { success: true, message: 'Database reset and re-seeded successfully' };
  }
};
