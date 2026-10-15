import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SocialLoginButtons = () => {
  const handleSocialLogin = (provider) => {
    // Placeholder for social login functionality
    console.log(`Login with ${provider} pressed`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => handleSocialLogin('google')}
        style={[styles.socialButton, styles.googleButton]}
      >
        <Icon name="google" size={20} color="#ffffff" />
        <Text style={styles.socialButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => handleSocialLogin('apple')}
        style={[styles.socialButton, styles.appleButton]}
      >
        <Icon name="apple" size={20} color="#ffffff" />
        <Text style={styles.socialButtonText}>Continue with Apple</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => handleSocialLogin('facebook')}
        style={[styles.socialButton, styles.facebookButton]}
      >
        <Icon name="facebook" size={20} color="#ffffff" />
        <Text style={styles.socialButtonText}>Continue with Facebook</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  googleButton: {
    backgroundColor: '#db4437',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  socialButtonText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'Poppins-Medium',
  },
});

export default SocialLoginButtons;
