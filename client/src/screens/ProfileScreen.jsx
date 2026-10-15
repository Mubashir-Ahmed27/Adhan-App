import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingIndicator from '../components/LoadingIndicator';
import ProfileHeader from '../components/ProfileHeader';
import SettingItem from '../components/SettingItem';

const ProfileScreen = ({ navigation }) => {
  const { user, isAuthenticated, logout, updateProfile, updatePassword, deleteAccount, isLoading, refreshUser } = useAuth();
  const { defaultLocation, removeDefaultLocation } = useLocation();
  
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const result = await updateProfile({ name, email });
      
      if (result.success) {
        setEditMode(false);
        await refreshUser();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setName(user.name || '');
    setEmail(user.email || '');
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    
    try {
      setIsSaving(true);
      const result = await updatePassword(currentPassword, newPassword);
      
      if (result.success) {
        Alert.alert('Success', 'Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', result.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', error.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              const result = await deleteAccount(currentPassword);
              
              if (result.success) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth', screen: 'Login' }],
                });
              } else {
                Alert.alert('Error', result.message || 'Failed to delete account');
              }
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', error.message || 'Failed to delete account');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth', screen: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLocationPress = () => {
    navigation.navigate('Location');
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.notLoggedInContainer}>
            <Icon name="account-off" size={64} color={colors.textTertiary} />
            <Text style={styles.notLoggedInText}>You are not logged in</Text>
            <Text style={styles.notLoggedInSubtext}>Please login to view your profile</Text>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
              style={styles.loginButton}
            >
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <ProfileHeader
          name={editMode ? name : user.name}
          email={editMode ? email : user.email}
          onEdit={handleEditProfile}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
          editMode={editMode}
          isSaving={isSaving}
        />

        {/* Profile Form (Edit Mode) */}
        {editMode ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <View style={styles.inputContainer}>
                <Icon name="account-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Icon name="email-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>
        ) : (
          // Profile Info (View Mode)
          <View style={styles.profileInfo}>
            <SettingItem
              icon="account"
              title="Name"
              subtitle={user.name || 'Not set'}
              disabled
            />
            <SettingItem
              icon="email"
              title="Email"
              subtitle={user.email || 'Not set'}
              disabled
            />
            
            {/* User Preferences */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              
              <SettingItem
                icon="map-marker"
                title="Default Location"
                subtitle={user.defaultCity && user.defaultCountry 
                  ? `${user.defaultCity}, ${user.defaultCountry}` 
                  : 'Not set'
                }
                onPress={handleLocationPress}
                showChevron
              />
              
              <SettingItem
                icon="calendar-settings"
                title="Prayer Method"
                subtitle={user.prayerMethod ? `Method ${user.prayerMethod}` : 'Default'}
                disabled
              />
              
              <SettingItem
                icon="bell"
                title="Notification Settings"
                subtitle="Configure prayer time notifications"
                disabled
              />
              
              <SettingItem
                icon="theme-light-dark"
                title="Theme"
                subtitle={user.theme || 'Auto'}
                disabled
              />
            </View>
          </View>
        )}

        {/* Password Change Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor={colors.textTertiary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                <Icon
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-plus-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={colors.textTertiary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={styles.passwordToggle}>
                <Icon
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <Icon name="lock-check-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.passwordToggle}>
                <Icon
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUpdatePassword}
            style={styles.updatePasswordButton}
            disabled={isSaving || !currentPassword || !newPassword}
          >
            {isSaving ? (
              <LoadingIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.updatePasswordButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={styles.accountActions}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity onPress={handleLogout} style={styles.actionButton}>
            <Icon name="logout" size={20} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleDeleteAccount} style={[styles.actionButton, styles.deleteButton]}>
            <Icon name="delete" size={20} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
  notLoggedInContainer: {
    alignItems: 'center',
    padding: 40,
  },
  notLoggedInText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  notLoggedInSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  loginButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  editForm: {
    marginBottom: 20,
  },
  profileInfo: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 8,
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
    height: 48,
    fontSize: 16,
    color: colors.textPrimary,
    fontFamily: 'Poppins-Regular',
  },
  passwordToggle: {
    padding: 8,
  },
  updatePasswordButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  updatePasswordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'Poppins-SemiBold',
  },
  accountActions: {
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  deleteButton: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    fontFamily: 'Poppins-Medium',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProfileScreen;
