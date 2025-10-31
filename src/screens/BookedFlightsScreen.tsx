import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Header } from '../components/Header';
import { colors } from '../constants/colors';
import { useBookings } from '../context/BookingContext';

interface Props {
  onBack: () => void;
  onOpenFlight: (flightId: string) => void;
}

export const BookedFlightsScreen: React.FC<Props> = ({ onBack, onOpenFlight }) => {
  const { bookings, refresh, cancel } = useBookings();

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <View style={styles.container}>
      <Header title="My bookings" onBack={onBack} />
      {bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No booked flights yet</Text>
          <Text style={styles.emptySubtitle}>Your future trips will appear here once you book a flight.</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.bookingId}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const flight = item.flight;
            const departureTime = flight
              ? new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '—';
            const travelDate = flight
              ? new Date(flight.departureTime).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—';
            return (
              <View style={styles.card}>
                <TouchableOpacity onPress={() => onOpenFlight(item.flightId)}>
                  <Text style={styles.cardTitle}>{flight ? flight.flightNumber : item.flightId}</Text>
                  <Text style={styles.cardSubtitle}>{travelDate}</Text>
                  <Text style={styles.cardSubtitle}>Departure: {departureTime}</Text>
                  {flight && <Text style={styles.cardSubtitle}>Price: ${flight.price.toFixed(2)}</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => cancel(item.bookingId)}>
                  <Text style={styles.cancelText}>Cancel booking</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.muted,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#F7FFF5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    color: colors.muted,
    marginTop: 4,
  },
  cancelButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FFD6D6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  cancelText: {
    color: '#712626',
    fontWeight: '600',
  },
});
