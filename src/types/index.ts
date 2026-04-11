// src/types/index.ts
export interface Seat {
  id: string;
  row: number;
  number: number;
  type: 'standard' | 'vip';
  status: 'free' | 'occupied' | 'blocked';   // ← добавили blocked
}

export interface BookingData {
  sessionId: string;
  movieTitle: string;
  time: string;
  hall: string;
  date: string;
  selectedSeats: Seat[];
  totalPrice: number;
}