import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../constants/colors';

export type TabKey = 'search' | 'bookings' | 'account';

interface TabItem {
  key: TabKey;
  label: string;
  icon: string;
  activeIcon?: string;
}

interface BottomTabBarProps {
  currentTab: TabKey;
  onSelect: (tab: TabKey) => void;
}

const tabs: TabItem[] = [
  { key: 'search', label: 'Search', icon: 'search-outline', activeIcon: 'search' },
  { key: 'bookings', label: 'My Trips', icon: 'airplane-outline', activeIcon: 'airplane' },
  { key: 'account', label: 'Account', icon: 'person-circle-outline', activeIcon: 'person-circle' },
];

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ currentTab, onSelect }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === currentTab;
        return (
          <TouchableOpacity
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onSelect(tab.key)}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
          >
            <Ionicons
              name={isActive && tab.activeIcon ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? colors.text : colors.muted}
              style={styles.icon}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    paddingVertical: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabButtonActive: {
    backgroundColor: '#F3FDF1',
  },
  tabLabel: {
    color: colors.muted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  icon: {
    marginBottom: 4,
  },
});
