import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { fetchCities, City, FlightSearchParams } from '../api/flights';
import { Header } from '../components/Header';
import { colors } from '../constants/colors';

interface Props {
  onSearch: (params: FlightSearchParams, context: { from: City; to: City }) => void;
  onOpenBookings: () => void;
}

const daysInDecember = Array.from({ length: 31 }, (_, index) => index + 1);
const firstWeekdayOffset = new Date('2025-12-01T00:00:00').getDay();
const totalWeeks = Math.ceil((firstWeekdayOffset + daysInDecember.length) / 7);

const buildTravelDate = (day: number) => `2025-12-${String(day).padStart(2, '0')}`;

const formatTravelDate = (day: number) => {
  const date = new Date(`${buildTravelDate(day)}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatCityDisplay = (city?: City) => (city ? `${city.name} (${city.code})` : 'Choose city');

export const FlightSearchScreen: React.FC<Props> = ({ onSearch, onOpenBookings }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCity, setFromCity] = useState<City>();
  const [toCity, setToCity] = useState<City>();
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [cityPicker, setCityPicker] = useState<'from' | 'to' | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchCities();
        setCities(response);
        setFromCity(response[0]);
        setToCity(response[1]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const isValid = useMemo(() => Boolean(fromCity && toCity && fromCity.id !== toCity.id), [fromCity, toCity]);

  const travelDateLabel = useMemo(() => formatTravelDate(selectedDay), [selectedDay]);

  const handleSearch = () => {
    if (!fromCity || !toCity) {
      return;
    }

    const params: FlightSearchParams = {
      fromCityId: fromCity.id,
      toCityId: toCity.id,
      travelDate: buildTravelDate(selectedDay),
    };
    onSearch(params, { from: fromCity, to: toCity });
  };

  const handleSwapCities = () => {
    setFromCity(toCity);
    setToCity(fromCity);
  };

  const handleSelectCity = (city: City) => {
    if (cityPicker === 'from') {
      setFromCity(city);
    } else if (cityPicker === 'to') {
      setToCity(city);
    }
    setCityPicker(null);
  };

  return (
    <View style={styles.container}>
      <Header title="Find flights" showBookingsButton onOpenBookings={onOpenBookings} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.loadingText}>Loading cities...</Text>
        </View>
      ) : (
        <>
          <View style={styles.form}>
            <View style={styles.card}>
              <View style={styles.rowGroup}>
                <TouchableOpacity style={styles.row} onPress={() => setCityPicker('from')}>
                  <Ionicons name="airplane-outline" size={20} color={colors.muted} style={styles.rowIcon} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>From</Text>
                    <Text style={styles.rowValue}>{formatCityDisplay(fromCity)}</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.separator} />
                <TouchableOpacity style={styles.row} onPress={() => setCityPicker('to')}>
                  <Ionicons name="airplane" size={20} color={colors.muted} style={styles.rowIcon} />
                  <View style={styles.rowContent}>
                    <Text style={styles.rowLabel}>To</Text>
                    <Text style={styles.rowValue}>{formatCityDisplay(toCity)}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.swapButton} onPress={handleSwapCities}>
                  <Ionicons name="swap-vertical" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={styles.separator} />
              <TouchableOpacity style={styles.row} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color={colors.muted} style={styles.rowIcon} />
                <View style={styles.rowContent}>
                  <Text style={styles.rowLabel}>Date</Text>
                  <Text style={styles.rowValue}>{travelDateLabel}</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.searchButton, !isValid && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={!isValid}
            >
              <Text style={styles.searchButtonText}>Search flights</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={cityPicker !== null} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{cityPicker === 'from' ? 'From city' : 'To city'}</Text>
                  <TouchableOpacity onPress={() => setCityPicker(null)}>
                    <Text style={styles.modalClose}>Close</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={cities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => handleSelectCity(item)}>
                      <Text style={styles.modalItemText}>{`${item.name} (${item.code})`}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>

          <Modal visible={showDatePicker} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <View style={styles.calendarHeader}>
                  <Text style={styles.calendarTitle}>December 2025</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalClose}>Done</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.weekdayRow}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.weekdayLabel}>
                      {day}
                    </Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {Array.from({ length: totalWeeks }).map((_, weekIndex) => {
                    const weekDays = Array.from({ length: 7 }).map((__, dayIndex) => {
                      const dayNumber = weekIndex * 7 + dayIndex + 1 - firstWeekdayOffset;
                      if (dayNumber < 1 || dayNumber > daysInDecember.length) {
                        return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.calendarCellEmpty} />;
                      }

                      const isSelected = dayNumber === selectedDay;

                      return (
                        <TouchableOpacity
                          key={dayNumber}
                          style={[styles.calendarCell, isSelected && styles.calendarCellSelected]}
                          onPress={() => setSelectedDay(dayNumber)}
                        >
                          <Text style={[styles.calendarCellText, isSelected && styles.calendarCellTextSelected]}>
                            {dayNumber}
                          </Text>
                        </TouchableOpacity>
                      );
                    });

                    return (
                      <View key={`week-${weekIndex}`} style={styles.calendarRow}>
                        {weekDays}
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </Modal>
        </>
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
  form: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  rowGroup: {
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowIcon: {
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  swapButton: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -16,
    backgroundColor: '#F3FDF1',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchButton: {
    marginTop: 'auto',
    backgroundColor: colors.accent,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    opacity: 0.4,
  },
  searchButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalClose: {
    color: colors.accent,
    fontWeight: '600',
  },
  modalItem: {
    paddingVertical: 12,
  },
  modalItemText: {
    color: colors.text,
    fontSize: 16,
  },
  modalItemActive: {
    backgroundColor: '#F3FDF1',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  modalItemTextActive: {
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  calendarGrid: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarCell: {
    flex: 1,
    height: 44,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6FFF4',
  },
  calendarCellEmpty: {
    flex: 1,
    height: 44,
    marginHorizontal: 4,
  },
  calendarCellSelected: {
    backgroundColor: colors.accent,
  },
  calendarCellText: {
    color: colors.text,
    fontWeight: '500',
  },
  calendarCellTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
});
