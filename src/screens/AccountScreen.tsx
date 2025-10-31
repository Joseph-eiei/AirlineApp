import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Header } from '../components/Header';
import { colors } from '../constants/colors';
import { useUser } from '../context/UserContext';

export const AccountScreen: React.FC = () => {
  const { user } = useUser();

  return (
    <View style={styles.container}>
      <Header title="Account" />
      <View style={styles.content}>
        <Text style={styles.placeholderTitle}>Account coming soon</Text>
        <Text style={styles.placeholderSubtitle}>
          {`Signed in as ${user.name}. This screen will display your profile details and settings.`}
        </Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    color: colors.muted,
    textAlign: 'center',
  },
});
