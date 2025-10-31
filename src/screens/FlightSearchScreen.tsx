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

import { fetchCities, City, FlightSearchParams } from '../api/flights';
import { Header } from '../components/Header';
import { colors } from '../constants/colors';

interface Props {
  onSearch: (params: FlightSearchParams, context: { from: City; to: City }) => void;
  onOpenBookings: () => void;
}

interface CitySelectProps {
  label: string;
  selectedCity?: City;
  cities: City[];
  onSelect: (city: City) => void;
}

const CitySelect: React.FC<CitySelectProps> = ({ label, selectedCity, cities, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity style={styles.select} onPress={() => setIsOpen(true)}>
        <Text style={styles.selectText}>{selectedCity ? `${selectedCity.name} (${selectedCity.code})` : 'Choose city'}</Text>
      </TouchableOpacity>
      <Modal visible={isOpen} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.modalClose}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={cities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(item);
                    setIsOpen(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{`${item.name} (${item.code})`}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const days = Array.from({ length: 31 }, (_, index) => index + 1);

export const FlightSearchScreen: React.FC<Props> = ({ onSearch, onOpenBookings }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCity, setFromCity] = useState<City>();
  const [toCity, setToCity] = useState<City>();
  const [selectedDay, setSelectedDay] = useState<number>(1);

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

  const isValid = useMemo(() => {
    return Boolean(fromCity && toCity && fromCity.id !== toCity.id);
  }, [fromCity, toCity]);

  const handleSearch = () => {
    if (!fromCity || !toCity) {
      return;
    }

    const travelDate = `2025-12-${String(selectedDay).padStart(2, '0')}`;
    const params: FlightSearchParams = {
      fromCityId: fromCity.id,
      toCityId: toCity.id,
      travelDate,
    };
    onSearch(params, { from: fromCity, to: toCity });
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
        <View style={styles.form}>
          <CitySelect label="From" selectedCity={fromCity} cities={cities} onSelect={setFromCity} />
          <CitySelect label="To" selectedCity={toCity} cities={cities} onSelect={setToCity} />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Travel date</Text>
            <Text style={styles.helperText}>December 2025</Text>
            <View style={styles.daysWrapper}>
              {days.map((day) => {
                const isSelected = day === selectedDay;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayItem, isSelected && styles.dayItemSelected]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.searchButton, !isValid && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={!isValid}
          >
            <Text style={styles.searchButtonText}>Search flights</Text>
          </TouchableOpacity>
        </View>
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
  field: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.muted,
    marginBottom: 8,
  },
  helperText: {
    color: colors.muted,
    marginBottom: 8,
  },
  select: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  selectText: {
    fontSize: 16,
    color: colors.text,
  },
  daysWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayItem: {
    width: 48,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  dayItemSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dayText: {
    color: colors.muted,
  },
  dayTextSelected: {
    color: colors.text,
    fontWeight: '600',
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.background,
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
    color: colors.muted,
  },
  modalItem: {
    paddingVertical: 12,
  },
  modalItemText: {
    color: colors.text,
    fontSize: 16,
  },
});
