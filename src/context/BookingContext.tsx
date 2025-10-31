import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  BookingRecord,
  bookFlight,
  cancelBooking,
  fetchBookingsByUser,
  fetchFlightById,
  mapFlightRecord,
  Flight,
  FlightRecord,
} from '../api/flights';
import { mockFlights } from '../data/mockFlights';
import { supabaseConfig } from '../services/supabaseClient';
import { useUser } from './UserContext';

export interface BookingItem {
  bookingId: string;
  flightId: string;
  userId: string;
  flight?: Flight;
}

interface BookingContextValue {
  bookings: BookingItem[];
  refresh: () => Promise<void>;
  book: (flightId: string) => Promise<boolean>;
  cancel: (bookingId: string) => Promise<boolean>;
  getBookingByFlight: (flightId: string) => BookingItem | undefined;
}

const BookingContext = createContext<BookingContextValue>({
  bookings: [],
  refresh: async () => undefined,
  book: async () => false,
  cancel: async () => false,
  getBookingByFlight: () => undefined,
});

const normalizeBooking = async (
  record: BookingRecord,
): Promise<BookingItem> => {
  const flightRecord = Array.isArray(record.flight_info)
    ? record.flight_info[0]
    : record.flight_info;

  let flight = flightRecord ? mapFlightRecord(flightRecord as FlightRecord) : undefined;

  if (!flight) {
    flight = await fetchFlightById(record.flight_id);
  }

  if (!flight) {
    flight = mockFlights.find((item) => item.id === record.flight_id);
  }

  return {
    bookingId: record.booking_id,
    flightId: record.flight_id,
    userId: record.user_id,
    flight,
  };
};

export const BookingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const localBookings = useRef<BookingItem[]>([]);

  const refresh = useCallback(async () => {
    if (!supabaseConfig.isConfigured) {
      setBookings(localBookings.current);
      return;
    }

    const records = await fetchBookingsByUser(user.id);
    const normalized = await Promise.all(records.map((record) => normalizeBooking(record)));
    setBookings(normalized);
  }, [user.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const book = useCallback(
    async (flightId: string) => {
      const record = await bookFlight(user.id, flightId);
      if (!record) {
        return false;
      }

      const bookingItem = await normalizeBooking(record);

      if (!supabaseConfig.isConfigured) {
        localBookings.current = [...localBookings.current, bookingItem];
      }

      setBookings((prev) => [...prev.filter((item) => item.bookingId !== bookingItem.bookingId), bookingItem]);
      return true;
    },
    [user.id],
  );

  const cancel = useCallback(async (bookingId: string) => {
    const success = await cancelBooking(bookingId);
    if (!success) {
      return false;
    }

    if (!supabaseConfig.isConfigured) {
      localBookings.current = localBookings.current.filter((item) => item.bookingId !== bookingId);
    }

    setBookings((prev) => prev.filter((item) => item.bookingId !== bookingId));
    return true;
  }, []);

  const getBookingByFlight = useCallback(
    (flightId: string) => bookings.find((item) => item.flightId === flightId),
    [bookings],
  );

  const value = useMemo(
    () => ({
      bookings,
      refresh,
      book,
      cancel,
      getBookingByFlight,
    }),
    [bookings, refresh, book, cancel, getBookingByFlight],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBookings = () => useContext(BookingContext);
