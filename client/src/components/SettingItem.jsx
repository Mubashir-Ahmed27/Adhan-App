import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingItem = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = false,
  disabled = false,
  iconColor = colors.primary,
  titleColor = colors.textPrimary,
  subtitleColor = colors.textSecondary,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, disabled && styles.disabledContainer]}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>
        <Icon name={icon} size={20} color={iconColor} />
      </View>
      
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>}
      </View>
      
      {showChevron && !disabled && (
        <View style={styles.chevronContainer}>
          <Icon name="chevron-right" size={20} color={colors.textTertiary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
    marginBottom: 10,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  chevronContainer: {
    padding: 8,
  },
});

export default SettingItem;
