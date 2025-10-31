import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { colors } from '../constants/colors';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onOpenBookings?: () => void;
  showBookingsButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, onOpenBookings, showBookingsButton }) => {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      <Text style={styles.title}>{title}</Text>
      {showBookingsButton ? (
        <TouchableOpacity onPress={onOpenBookings} style={styles.bookingButton}>
          <Text style={styles.bookingText}>My Trips</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: colors.muted,
    fontSize: 14,
  },
  placeholder: {
    width: 64,
  },
  bookingButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bookingText: {
    color: colors.text,
    fontWeight: '600',
  },
});
