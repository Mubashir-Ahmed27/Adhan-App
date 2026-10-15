import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, theme } from '../utils/theme';
import { PRAYER_METHODS } from '../utils/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PrayerMethodSelector = ({ currentMethod, onSelect, onCancel }) => {
  const methods = Object.entries(PRAYER_METHODS).map(([key, value]) => ({
    id: key,
    name: value,
  }));

  const handleSelect = (methodId) => {
    onSelect(methodId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Prayer Calculation Method</Text>
        <Text style={styles.subtitle}>
          Choose the method used to calculate prayer times
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {methods.map((method) => (
          <TouchableOpacity
            key={method.id}
            onPress={() => handleSelect(method.id)}
            style={[
              styles.methodItem,
              currentMethod === method.id && styles.selectedMethodItem,
            ]}
          >
            <View style={styles.methodRadio}>
              {currentMethod === method.id && (
                <View style={styles.selectedRadio} />
              )}
            </View>
            
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodId}>Method {method.id}</Text>
            </View>
            
            {currentMethod === method.id && (
              <Icon name="check" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: '80%',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  selectedMethodItem: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  methodRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedRadio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
    fontFamily: 'Poppins-Medium',
  },
  methodId: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: 'Poppins-Regular',
  },
  footer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
});

export default PrayerMethodSelector;
