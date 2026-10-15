import { DefaultTheme, DarkTheme } from 'react-native-paper';

// Custom color palette
const colors = {
  primary: '#6e45e2',
  primaryLight: '#8a63f0',
  primaryDark: '#5433b8',
  secondary: '#88d3ce',
  secondaryLight: '#a5e0d9',
  secondaryDark: '#6cb0ac',
  accent: '#f7b733',
  accentLight: '#f9c865',
  accentDark: '#d49a2a',
  
  // Islamic colors
  islamicGold: '#d4af37',
  islamicGreen: '#009900',
  islamicBlue: '#0066cc',
  islamicPurple: '#660066',
  
  // Background colors
  backgroundDark: '#1a1a2e',
  backgroundDarker: '#16213e',
  backgroundLight: '#f8f9fa',
  surfaceDark: '#1f1f38',
  surfaceLight: '#ffffff',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#b8b8b8',
  textTertiary: '#8a8a8a',
  textDark: '#2c3e50',
  textLight: '#ecf0f1',
  
  // Status colors
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',
  
  // Countdown colors
  countdownNormal: '#88d3ce',
  countdownWarning: '#f39c12',
  countdownCritical: '#e74c3c',
  
  // Border colors
  borderLight: '#e0e0e0',
  borderDark: '#2c3e50',
  
  // Shadows
  shadowColor: '#000000',
  shadowColorLight: 'rgba(0, 0, 0, 0.1)',
  shadowColorDark: 'rgba(0, 0, 0, 0.5)',
};

// Light theme
const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    background: colors.backgroundLight,
    surface: colors.surfaceLight,
    text: colors.textDark,
    textSecondary: colors.textTertiary,
    placeholder: colors.borderLight,
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: colors.textDark,
    onBackground: colors.textDark,
    
    // Custom colors
    islamicGold: colors.islamicGold,
    islamicGreen: colors.islamicGreen,
    islamicBlue: colors.islamicBlue,
    islamicPurple: colors.islamicPurple,
    
    countdownNormal: colors.countdownNormal,
    countdownWarning: colors.countdownWarning,
    countdownCritical: colors.countdownCritical,
    
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  dark: false,
  mode: 'light',
};

// Dark theme
const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primaryLight,
    secondary: colors.secondaryLight,
    accent: colors.accent,
    background: colors.backgroundDark,
    surface: colors.surfaceDark,
    text: colors.textPrimary,
    textSecondary: colors.textSecondary,
    placeholder: colors.borderDark,
    backdrop: 'rgba(0, 0, 0, 0.7)',
    onSurface: colors.textPrimary,
    onBackground: colors.textPrimary,
    
    // Custom colors
    islamicGold: colors.islamicGold,
    islamicGreen: colors.islamicGreen,
    islamicBlue: colors.islamicBlue,
    islamicPurple: colors.islamicPurple,
    
    countdownNormal: colors.countdownNormal,
    countdownWarning: colors.countdownWarning,
    countdownCritical: colors.countdownCritical,
    
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
  },
  dark: true,
  mode: 'dark',
};

// Combined theme object
const theme = {
  light: lightTheme,
  dark: darkTheme,
  colors,
};

// Get theme based on mode
const getTheme = (mode = 'dark') => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export { theme, lightTheme, darkTheme, getTheme, colors };
