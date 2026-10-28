import type { Movie, Showtime, Booking, User, AuthResponse, SystemStats } from './types.js';

const TOKEN_KEY = 'imovies_jwt_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setStoredToken(res.token);
    return res;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  // Movies
  async getMovies(filters?: { status?: string; genre?: string; search?: string }): Promise<{ movies: Movie[]; total: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.genre) params.append('genre', filters.genre);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ movies: Movie[]; total: number }>(`/movies${query}`);
  },

  async getMovieById(id: string): Promise<{ movie: Movie }> {
    return request<{ movie: Movie }>(`/movies/${id}`);
  },

  // Showtimes
  async getShowtimes(movieId?: string, date?: string): Promise<{ showtimes: Showtime[]; total: number }> {
    const params = new URLSearchParams();
    if (movieId) params.append('movieId', movieId);
    if (date) params.append('date', date);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ showtimes: Showtime[]; total: number }>(`/showtimes${query}`);
  },

  async getShowtimeById(id: string): Promise<{ showtime: Showtime }> {
    return request<{ showtime: Showtime }>(`/showtimes/${id}`);
  },

  // Bookings
  async createBooking(payload: {
    showtimeId: string;
    seats: { seatId: string; row: string; col: number; tier: 'standard' | 'premium' | 'vip'; price: number }[];
    paymentMethod: string;
  }): Promise<{ message: string; booking: Booking }> {
    return request<{ message: string; booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getMyBookings(): Promise<{ bookings: Booking[] }> {
    return request<{ bookings: Booking[] }>('/bookings/my');
  },

  async cancelBooking(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/bookings/${id}/cancel`, {
      method: 'PATCH'
    });
  },

  // System & Architecture
  async getSystemStats(): Promise<SystemStats> {
    return request<SystemStats>('/system/stats');
  },

  async resetAndSeed(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>('/system/seed', {
      method: 'POST'
    });
  }
};
