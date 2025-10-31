import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FlightSearchParams, Flight } from '../api/flights';
import { Header } from '../components/Header';
import { colors } from '../constants/colors';
import { searchFlights } from '../api/flights';
import { City } from '../data/mockFlights';

interface Props {
  params: FlightSearchParams;
  fromCity: City;
  toCity: City;
  onSelectFlight: (flight: Flight) => void;
  onBack: () => void;
}

export const FlightResultsScreen: React.FC<Props> = ({ params, fromCity, toCity, onSelectFlight, onBack }) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await searchFlights(params);
        setFlights(response);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params]);

  return (
    <View style={styles.container}>
      <Header title={`${fromCity.code} → ${toCity.code}`} onBack={onBack} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Searching flights...</Text>
        </View>
      ) : flights.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No flights found</Text>
          <Text style={styles.emptySubtitle}>Try a different date or city pair.</Text>
        </View>
      ) : (
        <FlatList
          data={flights}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const departureTime = new Date(item.departureTime);
            const arrivalTime = new Date(item.arrivalTime);
            return (
              <TouchableOpacity style={styles.card} onPress={() => onSelectFlight(item)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.flightNumber}>{item.flightNumber}</Text>
                  <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.cardRow}>
                  <Text style={styles.timeText}>
                    {departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text style={styles.arrow}>➜</Text>
                  <Text style={styles.timeText}>
                    {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {departureTime.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
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
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: colors.muted,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  flightNumber: {
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontWeight: '700',
    color: colors.text,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  arrow: {
    fontSize: 16,
    color: colors.muted,
  },
  dateText: {
    marginTop: 8,
    color: colors.muted,
  },
});
