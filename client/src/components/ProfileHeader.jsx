import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, theme } from '../utils/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LoadingIndicator from './LoadingIndicator';

const ProfileHeader = ({
  name,
  email,
  onEdit,
  onSave,
  onCancel,
  editMode = false,
  isSaving = false,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Icon name="account" size={40} color={colors.primary} />
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        {editMode ? (
          <>
            <Text style={styles.editTitle}>Edit Profile</Text>
            <Text style={styles.editSubtitle}>Update your information</Text>
          </>
        ) : (
          <>
            <Text style={styles.name}>{name || 'User'}</Text>
            <Text style={styles.email}>{email || 'No email'}</Text>
          </>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        {editMode ? (
          <>
            <TouchableOpacity
              onPress={onCancel}
              style={[styles.actionButton, styles.cancelButton]}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              style={[styles.actionButton, styles.saveButton]}
              disabled={isSaving}
            >
              {isSaving ? (
                <LoadingIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={onEdit} style={styles.editButton}>
            <Icon name="pencil" size={20} color={colors.textSecondary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.borderDark,
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    fontFamily: 'Poppins-Bold',
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  editTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
    fontFamily: 'Poppins-SemiBold',
  },
  editSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: colors.textTertiary + '20',
  },
  cancelButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Poppins-Regular',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
});

export default ProfileHeader;
