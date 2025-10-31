import { mockCities, mockFlights, mockPlanes, City, FlightInfo, Plane } from '../data/mockFlights';
import { supabaseConfig, supabaseRest } from '../services/supabaseClient';

export type { City, FlightInfo as Flight, Plane };

export interface FlightRecord {
  id: string;
  flight_number: string;
  from_city_id: string;
  to_city_id: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  travel_date: string;
  plane_id: string;
}

interface CityRecord {
  id: string;
  name: string;
  code: string;
  country: string;
}

interface PlaneRecord {
  id: string;
  name: string;
  manufacturer: string;
}

export interface BookingRecord {
  booking_id: string;
  user_id: string;
  flight_id: string;
  created_at?: string;
  flight_info?: FlightRecord | FlightRecord[];
}

export interface FlightSearchParams {
  fromCityId: string;
  toCityId: string;
  travelDate: string;
}

const createBookingId = (userId: string, flightId: string): string => {
  const base = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `booking-${userId}-${flightId}-${base}`;
};

const mapCity = (record: CityRecord): City => ({
  id: record.id,
  name: record.name,
  code: record.code,
  country: record.country,
});

const mapPlane = (record: PlaneRecord): Plane => ({
  id: record.id,
  name: record.name,
  manufacturer: record.manufacturer,
});

export const mapFlightRecord = (record: FlightRecord): FlightInfo => ({
  id: record.id,
  flightNumber: record.flight_number,
  fromCityId: record.from_city_id,
  toCityId: record.to_city_id,
  departureTime: record.departure_time,
  arrivalTime: record.arrival_time,
  price: record.price,
  travelDate: record.travel_date,
  planeId: record.plane_id,
});

export const fetchCities = async (): Promise<City[]> => {
  if (!supabaseConfig.isConfigured) {
    return mockCities;
  }

  const { data, error } = await supabaseRest<CityRecord[]>({ table: 'cities' });
  if (error || !data) {
    console.warn('Falling back to mock cities', error);
    return mockCities;
  }
  return data.map(mapCity);
};

export const fetchPlanes = async (): Promise<Plane[]> => {
  if (!supabaseConfig.isConfigured) {
    return mockPlanes;
  }

  const { data, error } = await supabaseRest<PlaneRecord[]>({ table: 'planes' });
  if (error || !data) {
    console.warn('Falling back to mock planes', error);
    return mockPlanes;
  }

  return data.map(mapPlane);
};

export const searchFlights = async (
  params: FlightSearchParams,
): Promise<FlightInfo[]> => {
  if (!supabaseConfig.isConfigured) {
    return mockFlights.filter(
      (flight) =>
        flight.fromCityId === params.fromCityId &&
        flight.toCityId === params.toCityId &&
        flight.travelDate === params.travelDate,
    );
  }

  const query = new URLSearchParams({
    [`from_city_id`]: `eq.${params.fromCityId}`,
    [`to_city_id`]: `eq.${params.toCityId}`,
    [`travel_date`]: `eq.${params.travelDate}`,
    [`order`]: 'departure_time.asc',
  }).toString();

  const { data, error } = await supabaseRest<FlightRecord[]>({
    table: 'flight_info',
    query,
  });

  if (error || !data) {
    console.warn('Falling back to mock flights', error);
    return mockFlights.filter(
      (flight) =>
        flight.fromCityId === params.fromCityId &&
        flight.toCityId === params.toCityId &&
        flight.travelDate === params.travelDate,
    );
  }

  return data.map(mapFlightRecord);
};

export const fetchFlightById = async (flightId: string): Promise<FlightInfo | undefined> => {
  if (!supabaseConfig.isConfigured) {
    return mockFlights.find((flight) => flight.id === flightId);
  }

  const query = new URLSearchParams({ id: `eq.${flightId}` }).toString();
  const { data, error } = await supabaseRest<FlightRecord[]>({ table: 'flight_info', query });
  if (error || !data || data.length === 0) {
    console.warn('Falling back to mock flight by id', error);
    return mockFlights.find((flight) => flight.id === flightId);
  }

  return mapFlightRecord(data[0]);
};

export const fetchBookingsByUser = async (
  userId: string,
): Promise<BookingRecord[]> => {
  if (!supabaseConfig.isConfigured) {
    return [];
  }

  const query = new URLSearchParams({
    user_id: `eq.${userId}`,
  }).toString();

  const { data, error } = await supabaseRest<BookingRecord[]>({
    table: 'flight_booked',
    query,
    select: 'booking_id,user_id,flight_id,created_at,flight_info(*)',
  });

  if (error || !data) {
    console.warn('Error fetching bookings', error);
    return [];
  }

  return data;
};

export const bookFlight = async (
  userId: string,
  flightId: string,
): Promise<BookingRecord | undefined> => {
  const resolvedUserId = userId?.trim().length ? userId : 'u1';
  const bookingId = createBookingId(resolvedUserId, flightId);

  if (!supabaseConfig.isConfigured) {
    return {
      booking_id: bookingId,
      user_id: resolvedUserId,
      flight_id: flightId,
    };
  }

  const { data, error } = await supabaseRest<BookingRecord[]>({
    table: 'flight_booked',
    method: 'POST',
    body: {
      booking_id: bookingId,
      user_id: resolvedUserId,
      flight_id: flightId,
    },
    prefer: 'return=representation',
    select: 'booking_id,user_id,flight_id,created_at',
  });

  if (error || !data || data.length === 0) {
    console.error('Booking flight failed', error);
    return undefined;
  }

  return data[0];
};

export const cancelBooking = async (bookingId: string): Promise<boolean> => {
  if (!supabaseConfig.isConfigured) {
    return true;
  }

  const query = new URLSearchParams({ booking_id: `eq.${bookingId}` }).toString();
  const { error } = await supabaseRest<unknown>({
    table: 'flight_booked',
    method: 'DELETE',
    query,
  });

  if (error) {
    console.error('Cancel booking failed', error);
    return false;
  }

  return true;
};
