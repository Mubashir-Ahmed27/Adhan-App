import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, theme } from '../utils/theme';
import { THEME_OPTIONS } from '../utils/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ThemeSelector = ({ currentTheme, onSelect, onCancel }) => {
  const handleSelect = (themeValue) => {
    onSelect(themeValue);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Theme</Text>
        <Text style={styles.subtitle}>
          Choose your preferred color scheme
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {THEME_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleSelect(option.value)}
            style={[
              styles.themeItem,
              currentTheme === option.value && styles.selectedThemeItem,
            ]}
          >
            <View style={styles.themeRadio}>
              {currentTheme === option.value && (
                <View style={styles.selectedRadio} />
              )}
            </View>
            
            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>{option.label}</Text>
              <Text style={styles.themeDescription}>
                {option.value === 'light' && 'Light mode with white background'}
                {option.value === 'dark' && 'Dark mode with black background'}
                {option.value === 'auto' && 'Automatically match system theme'}
              </Text>
            </View>
            
            {currentTheme === option.value && (
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
    maxHeight: '60%',
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
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  selectedThemeItem: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  themeRadio: {
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
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 2,
    fontFamily: 'Poppins-Medium',
  },
  themeDescription: {
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

export default ThemeSelector;
