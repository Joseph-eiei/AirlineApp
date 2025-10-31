import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

import { Flight, FlightSearchParams } from './src/api/flights';
import { BottomTabBar, TabKey } from './src/components/BottomTabBar';
import { BookingProvider, useBookings } from './src/context/BookingContext';
import { UserProvider } from './src/context/UserContext';
import { AccountScreen } from './src/screens/AccountScreen';
import { BookedFlightsScreen } from './src/screens/BookedFlightsScreen';
import { FlightDetailScreen } from './src/screens/FlightDetailScreen';
import { FlightResultsScreen } from './src/screens/FlightResultsScreen';
import { FlightSearchScreen } from './src/screens/FlightSearchScreen';
import { City } from './src/data/mockFlights';
import { colors } from './src/constants/colors';

type SearchView =
  | {
      name: 'search';
    }
  | {
      name: 'results';
      params: FlightSearchParams;
      fromCity: City;
      toCity: City;
    };

interface DetailState {
  flightId: string;
  initialFlight?: Flight;
}

const AppNavigation: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabKey>('search');
  const [searchView, setSearchView] = useState<SearchView>({ name: 'search' });
  const [activeDetail, setActiveDetail] = useState<DetailState | undefined>();
  const { bookings } = useBookings();

  const handleSearch = (params: FlightSearchParams, context: { from: City; to: City }) => {
    setSearchView({ name: 'results', params, fromCity: context.from, toCity: context.to });
    setCurrentTab('search');
  };

  const handleSelectFlight = (flight: Flight) => {
    setActiveDetail({ flightId: flight.id, initialFlight: flight });
  };

  const handleOpenFlightFromBooking = (flightId: string) => {
    const booking = bookings.find((item) => item.flightId === flightId);
    setActiveDetail({ flightId, initialFlight: booking?.flight });
  };

  const handleCloseDetail = () => {
    setActiveDetail(undefined);
  };

  const renderSearchTab = () => {
    if (searchView.name === 'search') {
      return (
        <FlightSearchScreen
          onSearch={handleSearch}
          onOpenBookings={() => {
            setCurrentTab('bookings');
          }}
        />
      );
    }

    return (
      <FlightResultsScreen
        params={searchView.params}
        fromCity={searchView.fromCity}
        toCity={searchView.toCity}
        onSelectFlight={handleSelectFlight}
        onBack={() => setSearchView({ name: 'search' })}
      />
    );
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'search':
        return renderSearchTab();
      case 'bookings':
        return <BookedFlightsScreen onOpenFlight={handleOpenFlightFromBooking} />;
      case 'account':
        return <AccountScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle='dark-content' backgroundColor={colors.background} />
      <View style={styles.content}>{renderContent()}</View>
      <BottomTabBar currentTab={currentTab} onSelect={setCurrentTab} />
      {activeDetail && (
        <View style={styles.detailOverlay}>
          <FlightDetailScreen
            flightId={activeDetail.flightId}
            initialFlight={activeDetail.initialFlight}
            onBack={handleCloseDetail}
          />
        </View>
      )}
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
  content: {
    flex: 1,
    backgroundColor: colors.background,
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
});

export default App;
