import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { generateToken, authMiddleware, adminMiddleware, type AuthenticatedRequest } from './auth.js';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION (JWT & BCRYPT)
// ==========================================

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const newUser = db.createUser(name.trim(), email.trim().toLowerCase(), password, 'user');
    const token = generateToken(newUser);

    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: newUser
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error during registration' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = db.getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = db.verifyPassword(user.id, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error during login' });
  }
});

apiRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// ==========================================
// 2. MOVIES CATALOGUE
// ==========================================

apiRouter.get('/movies', (req: Request, res: Response) => {
  try {
    const { status, genre, search } = req.query;
    const movies = db.getMovies({
      status: status as string,
      genre: genre as string,
      search: search as string
    });
    return res.json({ movies, total: movies.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve movies list' });
  }
});

apiRouter.get('/movies/:id', (req: Request, res: Response) => {
  const movie = db.getMovieById(req.params.id);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  return res.json({ movie });
});

apiRouter.post('/movies', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, posterUrl, backdropUrl, genre, durationMinutes, rating, censorRating, director, cast, releaseDate, status, languages, tagline } = req.body;

    if (!title || !description || !posterUrl) {
      return res.status(400).json({ error: 'Title, description, and posterUrl are required' });
    }

    const newMovie = db.addMovie({
      title,
      tagline: tagline || '',
      description,
      posterUrl,
      backdropUrl: backdropUrl || posterUrl,
      genre: Array.isArray(genre) ? genre : [genre || 'Drama'],
      durationMinutes: Number(durationMinutes) || 120,
      rating: Number(rating) || 8.0,
      censorRating: censorRating || 'PG-13',
      director: director || 'Director',
      cast: Array.isArray(cast) ? cast : ['Cast Member'],
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      status: status || 'now_showing',
      languages: Array.isArray(languages) ? languages : ['English']
    });

    return res.status(201).json({ message: 'Movie added successfully', movie: newMovie });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to add movie' });
  }
});

// ==========================================
// 3. SHOWTIMES & LIVE SEAT TRACKING
// ==========================================

apiRouter.get('/showtimes', (req: Request, res: Response) => {
  try {
    const { movieId, date } = req.query;
    const showtimes = db.getShowtimes(movieId as string, date as string);
    return res.json({ showtimes, total: showtimes.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve showtimes' });
  }
});

apiRouter.get('/showtimes/:id', (req: Request, res: Response) => {
  const showtime = db.getShowtimeById(req.params.id);
  if (!showtime) {
    return res.status(404).json({ error: 'Showtime not found' });
  }
  return res.json({ showtime });
});

// ==========================================
// 4. BOOKINGS & SEAT RESERVATION
// ==========================================

apiRouter.post('/bookings', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { showtimeId, seats, paymentMethod } = req.body;

    if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ error: 'Invalid booking payload. Showtime ID and at least one seat are required.' });
    }

    if (seats.length > 8) {
      return res.status(400).json({ error: 'Maximum 8 seats allowed per single transaction.' });
    }

    const result = db.createBooking({
      userId: req.user!.id,
      showtimeId,
      seats,
      paymentMethod: paymentMethod || 'Online Credit Card'
    });

    if (!result.success) {
      return res.status(409).json({ error: result.error });
    }

    return res.status(201).json({
      message: 'Seats successfully booked!',
      booking: result.booking
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error processing reservation' });
  }
});

apiRouter.get('/bookings/my', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookings = db.getBookingsByUser(req.user!.id);
    return res.json({ bookings });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load bookings' });
  }
});

apiRouter.get('/bookings/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const booking = db.getBookingById(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  if (booking.userId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied to this ticket' });
  }
  return res.json({ booking });
});

apiRouter.patch('/bookings/:id/cancel', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = db.cancelBooking(req.params.id, req.user!.id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    return res.json({ message: 'Booking successfully cancelled and seats released' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Error cancelling booking' });
  }
});

// ==========================================
// 5. SYSTEM & ARCHITECTURE DOCUMENTATION
// ==========================================

apiRouter.get('/system/stats', (req: Request, res: Response) => {
  return res.json(db.getStats());
});

apiRouter.post('/system/seed', (req: Request, res: Response) => {
  return res.json(db.resetAndSeed());
});

apiRouter.get('/system/architecture', (req: Request, res: Response) => {
  return res.json({
    architecture: {
      pattern: 'MERN (MongoDB, Express.js, React, Node.js)',
      security: 'Stateless JWT (JSON Web Tokens) with Bearer token authentication & Bcrypt password hashing',
      storage: 'Document-oriented collection storage adhering to MongoDB BSON schemas with real-time seat locking',
      concurrency: 'Atomic seat status check-and-reserve transaction preventing double bookings',
      layers: [
        {
          layer: 'Client (React 19 + Tailwind CSS)',
          purpose: 'Cinema discovery, interactive curved SVG seat grid, instant seat pricing calculator, real-time ticket wallet with QR validation, architectural documentation guide.'
        },
        {
          layer: 'API Server (Node.js + Express)',
          purpose: 'REST endpoints for auth, movies, showtimes, seat reservations, and cancellation lifecycle.'
        },
        {
          layer: 'Security (JWT & Bcrypt)',
          purpose: 'Signed HS256 tokens with 7-day TTL, role-based access control (RBAC) separating regular patrons from cinema administrators.'
        },
        {
          layer: 'Database (MongoDB Document Schema)',
          purpose: 'Users, Movies, Showtimes (with embedded seat layouts and occupied seat arrays), and Bookings collections.'
        }
      ]
    }
  });
});
