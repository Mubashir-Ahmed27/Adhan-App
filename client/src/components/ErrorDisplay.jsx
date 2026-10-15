import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ErrorDisplay = ({ message, onRetry, showIcon = true }) => {
  return (
    <View style={styles.container}>
      <View style={styles.errorContainer}>
        {showIcon && <Icon name="alert-circle" size={20} color={colors.error} style={styles.icon} />}
        <Text style={styles.errorText}>{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.error + '20',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.error,
  },
  icon: {
    marginRight: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: colors.error,
    fontFamily: 'Poppins-Regular',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.error,
    borderRadius: 6,
  },
  retryButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});

export default ErrorDisplay;
