// src/features/seller/chat/components/StatusActionButtons.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BookingStatus } from '@core/booking/types/booking.types';
import { createBookingApi } from '@core/booking/api';

interface StatusActionButtonsProps {
  entityType: 'mobile' | 'laptop';
  requestId: number;
  currentStatus: BookingStatus;
  onStatusUpdated: () => void;
}

const StatusActionButtons: React.FC<StatusActionButtonsProps> = ({
  entityType,      // destructuring properly
  requestId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [loading, setLoading] = useState(false);

  // Create correct API instance (mobile OR laptop)
  const api = createBookingApi(entityType);

  const handleStatusUpdate = async (newStatus: BookingStatus, action: string) => {
    Alert.alert(
      `${action}?`,
      `Are you sure you want to ${action.toLowerCase()} this request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: async () => {
            try {
              setLoading(true);
              await api.updateStatus(requestId, newStatus);
              Alert.alert('Success', `Request ${action.toLowerCase()}ed successfully`);
              onStatusUpdated();
            } catch (error: any) {
              Alert.alert('Error', error?.message || `Failed to ${action.toLowerCase()} request`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCompleteDeal = async () => {
    Alert.alert(
      'Complete Deal?',
      'This will mark the item as SOLD and reject all other pending requests. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete Deal',
          onPress: async () => {
            try {
              setLoading(true);
              await api.approveBooking(requestId);
              Alert.alert(
                'Deal Completed!',
                'The item has been marked as SOLD.',
                [{ text: 'OK', onPress: onStatusUpdated }]
              );
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to complete deal');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#0F5E87" />
        <Text style={styles.loadingText}>Updating...</Text>
      </View>
    );
  }

  // PENDING status
  if (currentStatus === 'PENDING') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleStatusUpdate('ACCEPTED', 'Accept')}
        >
          <Icon name="check-circle" size={18} color="#FFFFFF" />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleStatusUpdate('REJECTED', 'Reject')}
        >
          <Icon name="close-circle" size={18} color="#EF4444" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ACCEPTED or IN_NEGOTIATION
  if (currentStatus === 'IN_NEGOTIATION' || currentStatus === 'ACCEPTED') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, styles.completeButton]}
          onPress={handleCompleteDeal}
        >
          <Icon name="check-all" size={18} color="#FFFFFF" />
          <Text style={styles.completeButtonText}>Complete Deal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleStatusUpdate('REJECTED', 'Reject')}
        >
          <Icon name="close-circle" size={18} color="#EF4444" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null; // No buttons when completed or rejected
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  rejectButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#6B7280',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  loadingText: {
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default StatusActionButtons;
