import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Flight, fetchFlightById, fetchPlanes, Plane } from '../api/flights';
import { Header } from '../components/Header';
import { colors } from '../constants/colors';
import { mockCities } from '../data/mockFlights';
import { useBookings } from '../context/BookingContext';

interface Props {
  flightId: string;
  initialFlight?: Flight;
  onBack: () => void;
}

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const calculateDuration = (departure: string, arrival: string) => {
  const diff = new Date(arrival).getTime() - new Date(departure).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.round((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

export const FlightDetailScreen: React.FC<Props> = ({ flightId, initialFlight, onBack }) => {
  const [flight, setFlight] = useState<Flight | undefined>(initialFlight);
  const [planes, setPlanes] = useState<Plane[]>([]);
  const [loading, setLoading] = useState(!initialFlight);

  const { book, cancel, getBookingByFlight } = useBookings();
  const booking = getBookingByFlight(flightId);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [flightResponse, planeResponse] = await Promise.all([
          fetchFlightById(flightId),
          fetchPlanes(),
        ]);
        setFlight(flightResponse ?? initialFlight);
        setPlanes(planeResponse);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [flightId, initialFlight]);

  const plane = useMemo(() => planes.find((item) => item.id === flight?.planeId), [planes, flight?.planeId]);

  const fromCity = useMemo(() => mockCities.find((city) => city.id === flight?.fromCityId), [flight?.fromCityId]);
  const toCity = useMemo(() => mockCities.find((city) => city.id === flight?.toCityId), [flight?.toCityId]);

  const handleBooking = async () => {
    if (!flight) {
      return;
    }

    if (booking) {
      await cancel(booking.bookingId);
    } else {
      await book(flight.id);
    }
  };

  if (!flight || loading) {
    return (
      <View style={styles.container}>
        <Header title="Flight detail" onBack={onBack} />
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Loading flight...</Text>
        </View>
      </View>
    );
  }

  const departureTime = formatTime(flight.departureTime);
  const arrivalTime = formatTime(flight.arrivalTime);
  const travelDate = formatDate(flight.departureTime);
  const duration = calculateDuration(flight.departureTime, flight.arrivalTime);

  return (
    <View style={styles.container}>
      <Header title="Flight detail" onBack={onBack} />
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>
          <Text style={styles.routeText}>
            {fromCity ? `${fromCity.name} (${fromCity.code})` : flight.fromCityId} →
            {` ${toCity ? `${toCity.name} (${toCity.code})` : flight.toCityId}`}
          </Text>
          <Text style={styles.metaText}>{travelDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.scheduleRow}>
            <Text style={styles.timeLabel}>Departure</Text>
            <Text style={styles.timeValue}>{departureTime}</Text>
          </View>
          <View style={styles.scheduleRow}>
            <Text style={styles.timeLabel}>Arrival</Text>
            <Text style={styles.timeValue}>{arrivalTime}</Text>
          </View>
          <View style={styles.scheduleRow}>
            <Text style={styles.timeLabel}>Duration</Text>
            <Text style={styles.timeValue}>{duration}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Flight information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Flight number</Text>
            <Text style={styles.infoValue}>{flight.flightNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Aircraft</Text>
            <Text style={styles.infoValue}>{plane ? `${plane.name} · ${plane.manufacturer}` : flight.planeId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={styles.infoValue}>${flight.price.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={[styles.actionButton, booking && styles.cancelButton]} onPress={handleBooking}>
        <Text style={styles.actionText}>{booking ? 'Cancel booking' : 'Book this flight'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#F7FFF5',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  routeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  metaText: {
    color: colors.muted,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeLabel: {
    color: colors.muted,
  },
  timeValue: {
    fontWeight: '600',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoLabel: {
    color: colors.muted,
  },
  infoValue: {
    fontWeight: '600',
    color: colors.text,
  },
  actionButton: {
    margin: 16,
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFD6D6',
  },
  actionText: {
    fontWeight: '700',
    color: colors.text,
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
  },
});
