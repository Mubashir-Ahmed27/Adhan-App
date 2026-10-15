import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingIndicator from '../components/LoadingIndicator';
import SocialLoginButtons from '../components/SocialLoginButtons';

const LoginScreen = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Clear error on mount
  useEffect(() => {
    clearError();
  }, []);

  // Validate form
  useEffect(() => {
    const isValid = email.trim().length > 0 && password.trim().length >= 6;
    setIsFormValid(isValid);
  }, [email, password]);

  const handleLogin = async () => {
    if (!isFormValid) return;
    
    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Password recovery functionality will be added soon. Please contact support if you need help.',
      [{ text: 'OK' }]
    );
  };

  const handleNavigateToRegister = () => {
    clearError();
    navigation.navigate('Register');
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    clearError();
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    clearError();
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              {error && error.includes('email') && (
                <Text style={styles.errorText}>Invalid email</Text>
              )}
            </View>
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, error && error.includes('email') && styles.inputError]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              {error && error.includes('password') && (
                <Text style={styles.errorText}>Invalid password</Text>
              )}
            </View>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, error && error.includes('password') && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                returnKeyType="done"
              />
              <TouchableOpacity onPress={toggleShowPassword} style={styles.passwordToggle}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Display */}
          {error && !error.includes('email') && !error.includes('password') && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Forgot Password */}
          <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            style={[
              styles.loginButton,
              (!isFormValid || isLoading) && styles.loginButtonDisabled
            ]}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <LoadingIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login Buttons */}
          <SocialLoginButtons />

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleNavigateToRegister}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Mode */}
        <View style={styles.demoContainer}>
          <Text style={styles.demoText}>Or continue as guest to try the app</Text>
          <TouchableOpacity
            onPress={() => {
              clearError();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              });
            }}
            style={styles.demoButton}
          >
            <Text style={styles.demoButtonText}>Try Demo Mode</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    fontFamily: 'Poppins-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'Poppins-Regular',
  },
  inputError: {
    borderColor: colors.error,
  },
  passwordToggle: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  loginButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDark,
  },
  dividerText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'Poppins-SemiBold',
  },
  demoContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  demoText: {
    fontSize: 14,
    color: colors.textTertiary,
    marginBottom: 16,
    fontFamily: 'Poppins-Regular',
  },
  demoButton: {
    height: 44,
    width: '80%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default LoginScreen;
