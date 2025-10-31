import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

import { Flight, FlightSearchParams } from './src/api/flights';
import { BookingProvider, useBookings } from './src/context/BookingContext';
import { UserProvider } from './src/context/UserContext';
import { FlightDetailScreen } from './src/screens/FlightDetailScreen';
import { FlightResultsScreen } from './src/screens/FlightResultsScreen';
import { FlightSearchScreen } from './src/screens/FlightSearchScreen';
import { BookedFlightsScreen } from './src/screens/BookedFlightsScreen';
import { City } from './src/data/mockFlights';
import { colors } from './src/constants/colors';

interface SearchScreenState {
  name: 'search';
}

interface ResultsScreenState {
  name: 'results';
  params: FlightSearchParams;
  fromCity: City;
  toCity: City;
}

interface DetailScreenState {
  name: 'detail';
  flightId: string;
  initialFlight?: Flight;
}

interface BookedScreenState {
  name: 'bookings';
}

type ScreenState = SearchScreenState | ResultsScreenState | DetailScreenState | BookedScreenState;

const AppNavigation: React.FC = () => {
  const [stack, setStack] = useState<ScreenState[]>([{ name: 'search' }]);
  const { bookings } = useBookings();

  const current = useMemo(() => stack[stack.length - 1], [stack]);

  const push = (screen: ScreenState) => setStack((prev) => [...prev, screen]);
  const pop = () =>
    setStack((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.slice(0, -1);
    });

  const handleSearch = (params: FlightSearchParams, context: { from: City; to: City }) => {
    push({ name: 'results', params, fromCity: context.from, toCity: context.to });
  };

  const handleSelectFlight = (flight: Flight) => {
    push({ name: 'detail', flightId: flight.id, initialFlight: flight });
  };

  const handleOpenBookings = () => {
    push({ name: 'bookings' });
  };

  const handleOpenFlightFromBooking = (flightId: string) => {
    const booking = bookings.find((item) => item.flightId === flightId);
    push({ name: 'detail', flightId, initialFlight: booking?.flight });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {current.name === 'search' && (
          <FlightSearchScreen onSearch={handleSearch} onOpenBookings={handleOpenBookings} />
        )}

        {current.name === 'results' && (
          <FlightResultsScreen
            params={current.params}
            fromCity={current.fromCity}
            toCity={current.toCity}
            onSelectFlight={handleSelectFlight}
            onBack={pop}
          />
        )}

        {current.name === 'detail' && (
          <FlightDetailScreen flightId={current.flightId} initialFlight={current.initialFlight} onBack={pop} />
        )}

        {current.name === 'bookings' && (
          <BookedFlightsScreen onBack={pop} onOpenFlight={handleOpenFlightFromBooking} />
        )}
      </View>
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <BookingProvider>
        <AppNavigation />
      </BookingProvider>
    </UserProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
