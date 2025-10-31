export interface City {
  id: string;
  name: string;
  code: string;
  country: string;
}

export interface Plane {
  id: string;
  name: string;
  manufacturer: string;
}

export interface FlightInfo {
  id: string;
  flightNumber: string;
  fromCityId: string;
  toCityId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  travelDate: string; // yyyy-mm-dd
  planeId: string;
}

const baseCities: City[] = [
  { id: 'city-nyc', name: 'New York', code: 'NYC', country: 'USA' },
  { id: 'city-lax', name: 'Los Angeles', code: 'LAX', country: 'USA' },
  { id: 'city-chi', name: 'Chicago', code: 'CHI', country: 'USA' },
  { id: 'city-mia', name: 'Miami', code: 'MIA', country: 'USA' },
  { id: 'city-dal', name: 'Dallas', code: 'DAL', country: 'USA' },
  { id: 'city-den', name: 'Denver', code: 'DEN', country: 'USA' },
];

const basePlanes: Plane[] = [
  { id: 'plane-a320', name: 'Airbus A320', manufacturer: 'Airbus' },
  { id: 'plane-b737', name: 'Boeing 737', manufacturer: 'Boeing' },
  { id: 'plane-e195', name: 'Embraer 195', manufacturer: 'Embraer' },
];

const generateMockFlights = (): FlightInfo[] => {
  const flights: FlightInfo[] = [];
  const startDate = new Date('2025-12-01T00:00:00Z');
  const daysInMonth = 31;
  let flightCounter = 1;

  baseCities.forEach((fromCity, fromIndex) => {
    baseCities.forEach((toCity, toIndex) => {
      if (fromCity.id === toCity.id) {
        return;
      }

      for (let day = 0; day < daysInMonth; day += 1) {
        for (let flightIndex = 0; flightIndex < 3; flightIndex += 1) {
          const currentDate = new Date(startDate);
          currentDate.setUTCDate(1 + day);
          const baseHour = 8 + flightIndex * 4 + ((fromIndex + toIndex) % 3);
          currentDate.setUTCHours(baseHour, 0, 0, 0);
          const departure = new Date(currentDate);
          const durationHours = 2 + ((fromIndex + toIndex + flightIndex) % 3);
          const arrival = new Date(departure.getTime() + durationHours * 60 * 60 * 1000);

          const travelDate = departure.toISOString().slice(0, 10);
          const priceBase = 120 + (fromIndex * 15) + (toIndex * 10) + flightIndex * 5;
          const priceVariance = ((day + flightCounter) % 7) * 4;
          const flightNumber = `AB${(flightCounter % 900 + 100).toString().padStart(3, '0')}`;
          const plane = basePlanes[(flightCounter + flightIndex) % basePlanes.length];

          flights.push({
            id: `flight-${fromCity.code}-${toCity.code}-${travelDate}-${flightIndex}`,
            flightNumber,
            fromCityId: fromCity.id,
            toCityId: toCity.id,
            departureTime: departure.toISOString(),
            arrivalTime: arrival.toISOString(),
            price: parseFloat((priceBase + priceVariance).toFixed(2)),
            travelDate,
            planeId: plane.id,
          });

          flightCounter += 1;
        }
      }
    });
  });

  return flights;
};

export const mockCities = baseCities;
export const mockPlanes = basePlanes;
export const mockFlights = generateMockFlights();
