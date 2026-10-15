import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';
import { COUNTDOWN_THRESHOLDS } from '../utils/constants';

const CountdownDisplay = ({ countdown, style, showLabels = false }) => {
  const [timeParts, setTimeParts] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  // Parse countdown string
  useEffect(() => {
    if (countdown) {
      const parts = countdown.split(':');
      if (parts.length >= 3) {
        setTimeParts({
          hours: parts[0],
          minutes: parts[1],
          seconds: parts[2],
        });
      }
    }
  }, [countdown]);

  const getCountdownStyle = () => {
    const totalMinutes = parseInt(timeParts.hours) * 60 + parseInt(timeParts.minutes);
    
    if (totalMinutes <= COUNTDOWN_THRESHOLDS.critical) {
      return styles.countdownCritical;
    } else if (totalMinutes <= COUNTDOWN_THRESHOLDS.warning) {
      return styles.countdownWarning;
    }
    return styles.countdownNormal;
  };

  return (
    <View style={styles.container}>
      {showLabels ? (
        <View style={styles.labelContainer}>
          <View style={styles.timePart}>
            <Text style={[styles.timeValue, getCountdownStyle()]}>{timeParts.hours}</Text>
            <Text style={styles.timeLabel}>Hours</Text>
          </View>
          <Text style={[styles.separator, getCountdownStyle()]}>:</Text>
          <View style={styles.timePart}>
            <Text style={[styles.timeValue, getCountdownStyle()]}>{timeParts.minutes}</Text>
            <Text style={styles.timeLabel}>Minutes</Text>
          </View>
          <Text style={[styles.separator, getCountdownStyle()]}>:</Text>
          <View style={styles.timePart}>
            <Text style={[styles.timeValue, getCountdownStyle()]}>{timeParts.seconds}</Text>
            <Text style={styles.timeLabel}>Seconds</Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.countdownText, getCountdownStyle(), style]}>
          {countdown || '00:00:00'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePart: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  timeLabel: {
    fontSize: 10,
    color: colors.textTertiary,
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  countdownText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  countdownNormal: {
    color: colors.countdownNormal,
  },
  countdownWarning: {
    color: colors.countdownWarning,
  },
  countdownCritical: {
    color: colors.countdownCritical,
  },
});

export default CountdownDisplay;
