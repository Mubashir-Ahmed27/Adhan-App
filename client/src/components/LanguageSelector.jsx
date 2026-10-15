import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, theme } from '../utils/theme';
import { LANGUAGE_OPTIONS } from '../utils/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LanguageSelector = ({ currentLanguage, onSelect, onCancel }) => {
  const handleSelect = (languageValue) => {
    onSelect(languageValue);
  };

  const getLanguageFlag = (languageValue) => {
    const flags = {
      en: '🇬🇧',
      ar: '🇸🇦',
      ur: '🇵🇰',
      fr: '🇫🇷',
      es: '🇪🇸',
      de: '🇩🇪',
    };
    return flags[languageValue] || '🌍';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Language</Text>
        <Text style={styles.subtitle}>
          Choose your preferred language
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {LANGUAGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => handleSelect(option.value)}
            style={[
              styles.languageItem,
              currentLanguage === option.value && styles.selectedLanguageItem,
            ]}
          >
            <View style={styles.languageRadio}>
              {currentLanguage === option.value && (
                <View style={styles.selectedRadio} />
              )}
            </View>
            
            <View style={styles.languageInfo}>
              <Text style={styles.languageFlag}>{getLanguageFlag(option.value)}</Text>
              <Text style={styles.languageName}>{option.label}</Text>
              <Text style={styles.languageCode}>{option.value.toUpperCase()}</Text>
            </View>
            
            {currentLanguage === option.value && (
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
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  selectedLanguageItem: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  languageRadio: {
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
  languageInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
    marginRight: 8,
    fontFamily: 'Poppins-Medium',
  },
  languageCode: {
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

export default LanguageSelector;
