import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';

import { Flight, FlightSearchParams } from './src/api/flights';
import { BottomTabBar, TabKey } from './src/components/BottomTabBar';
import { BookingProvider, useBookings } from './src/context/BookingContext';
import { UserProvider, useUser } from './src/context/UserContext';
import { AccountScreen } from './src/screens/AccountScreen';
import { BookedFlightsScreen } from './src/screens/BookedFlightsScreen';
import { FlightDetailScreen } from './src/screens/FlightDetailScreen';
import { FlightResultsScreen } from './src/screens/FlightResultsScreen';
import { FlightSearchScreen } from './src/screens/FlightSearchScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
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
      <View style={styles.content}>
        {activeDetail ? (
          <FlightDetailScreen
            flightId={activeDetail.flightId}
            initialFlight={activeDetail.initialFlight}
            onBack={handleCloseDetail}
          />
        ) : (
          renderContent()
        )}
      </View>
      <BottomTabBar currentTab={currentTab} onSelect={(tab) => {
        setActiveDetail(undefined);
        setCurrentTab(tab);
      }} />
    </SafeAreaView>
  );
};

const RootNavigator: React.FC = () => {
  const { user, status, authLoading, login, signup } = useUser();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    if (user) {
      setMode('login');
    }
  }, [user]);

  if (status === 'checking') {
    return (
      <View style={styles.loadingState}>
        <ActivityIndicator size="large" color={colors.text} />
        <StatusBar barStyle='dark-content' backgroundColor={colors.background} />
      </View>
    );
  }

  if (!user) {
    return mode === 'login' ? (
      <LoginScreen
        onLogin={login}
        isLoading={authLoading}
        onNavigateToSignup={() => setMode('signup')}
      />
    ) : (
      <SignupScreen
        onSignup={signup}
        isLoading={authLoading}
        onBackToLogin={() => setMode('login')}
      />
    );
  }

  return (
    <BookingProvider>
      <AppNavigation />
    </BookingProvider>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <RootNavigator />
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
  loadingState: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
