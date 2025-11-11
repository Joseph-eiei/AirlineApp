import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Header } from '../components/Header';
import { colors } from '../constants/colors';
import { useBookings } from '../context/BookingContext';
import { useUser } from '../context/UserContext';

export const AccountScreen: React.FC = () => {
  const { user, logout, authLoading } = useUser();
  const { bookings } = useBookings();

  if (!user) {
    return null;
  }

  const totalFlightsBooked = bookings.length;

  return (
    <View style={styles.container}>
      <Header title="Account" />
      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.username}>{user.username}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Total flights booked</Text>
            <Text style={styles.metric}>{totalFlightsBooked}</Text>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          onPress={logout}
          disabled={authLoading}
          style={[styles.logoutButton, authLoading && styles.logoutDisabled]}
        >
          {authLoading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.logoutLabel}>Sign out</Text>
          )}
        </TouchableOpacity>
      </View>
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
    padding: 24,
    gap: 24,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoBlock: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    color: colors.muted,
    marginBottom: 6,
  },
  username: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
  },
  metric: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.accent,
  },
  logoutButton: {
    backgroundColor: colors.text,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutDisabled: {
    opacity: 0.7,
  },
  logoutLabel: {
    fontWeight: '700',
    color: colors.background,
    fontSize: 16,
  },
});
