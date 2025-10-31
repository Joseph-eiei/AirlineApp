/*
 * Seed script for Supabase mock data covering December 2025.
 *
 * Usage:
 *   EXPO_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="service_role_key" \
 *   npx ts-node scripts/generateMockData.ts
 *
 * The script expects the following tables (see supabase/schema.sql):
 *   - cities
 *   - planes
 *   - flight_info
 *   - flight_booked
 */

import { mockCities, mockFlights, mockPlanes } from '../src/data/mockFlights';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const headers: Record<string, string> = {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

const chunk = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

async function wipeTable(table: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=id`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    console.warn(`Failed to clean ${table}:`, response.status, text);
  }
}

async function insertRows<T extends Record<string, unknown>>(table: string, rows: T[]) {
  const batches = chunk(rows, 500);
  for (const batch of batches) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(batch),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to insert into ${table}: ${response.status} ${text}`);
    }
  }
}

async function seed() {
  console.log('Seeding Supabase mock data...');
  await wipeTable('flight_booked');
  await wipeTable('flight_info');
  await wipeTable('cities');
  await wipeTable('planes');

  await insertRows(
    'cities',
    mockCities.map((city) => ({
      id: city.id,
      name: city.name,
      code: city.code,
      country: city.country,
    })),
  );

  await insertRows(
    'planes',
    mockPlanes.map((plane) => ({
      id: plane.id,
      name: plane.name,
      manufacturer: plane.manufacturer,
    })),
  );

  await insertRows(
    'flight_info',
    mockFlights.map((flight) => ({
      id: flight.id,
      flight_number: flight.flightNumber,
      from_city_id: flight.fromCityId,
      to_city_id: flight.toCityId,
      departure_time: flight.departureTime,
      arrival_time: flight.arrivalTime,
      price: flight.price,
      travel_date: flight.travelDate,
      plane_id: flight.planeId,
    })),
  );

  const sampleBookings = mockFlights.slice(0, 3).map((flight, index) => ({
    booking_id: `seed-booking-${index + 1}`,
    user_id: 'mock-user-002',
    flight_id: flight.id,
  }));

  await insertRows('flight_booked', sampleBookings);

  console.log('Seed completed successfully.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
