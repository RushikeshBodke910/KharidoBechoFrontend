// src/features/seller/chat/screens/SellerChatThreadScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '@context/AuthContext';
import { useBookingThread, useSendMessage } from '@core/booking/hooks';
import { createBookingApi } from '@core/booking/api';
import { MobileEntity, LaptopEntity } from '@core/booking/types/entity.types';   // ✅ Added laptop type
import { ConversationMessage } from '@core/booking/types/booking.types';
import MessageBubble from '../../../buyer/chat/components/MessageBubble';
import ChatInput from '../../../buyer/chat/components/ChatInput';
import StatusActionButtons from '../components/StatusActionButtons';
import { getSellerStatusConfig, isChatDisabled } from '@core/booking/utils';

interface RouteParams {
  requestId: number;
  buyerId: number;

  mobileId?: number;
  mobileTitle?: string;

  //  Added laptop params
  laptopId?: number;
  laptopTitle?: string;
}

const SellerChatThreadScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { requestId, buyerId, mobileId, mobileTitle, laptopId, laptopTitle } =
    route.params as RouteParams;

  const { userId } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);


  //  Detect which entity this chat belongs to

  const isLaptop = !!laptopId;
  const entityType = isLaptop ? 'laptop' : 'mobile';
  const contextId = isLaptop ? laptopId! : mobileId!;


  //  Generic booking hook updated (mobile untouched)

  const { booking, loading, error, refresh, updateBooking } =
    useBookingThread<MobileEntity | LaptopEntity>({
      entityType,
      bookingId: requestId,
      contextId,
      enabled: !!contextId,
    });


  //  Send Message hook updated safely

  const { sendMessage, sending } = useSendMessage(entityType);

  const messages = booking?.conversation || [];

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSendMessage = async (message: string) => {

    if (!userId) {
      Alert.alert('Error', 'You must be logged in to send messages');
      return;
    }

    try {
      console.log('[SELLER_SEND_MESSAGE]', {
        entityType,
        requestId,
        senderUserId: userId,
        sellerId: booking?.sellerId,
        buyerId: booking?.buyerId,
      });

      // Auto-status change (still mobile first, laptop unaffected)
      if (booking?.status === 'PENDING') {
        const api = createBookingApi(entityType);
        await api.updateStatus(requestId, 'IN_NEGOTIATION');
      }

      const updatedBooking = await sendMessage(requestId, userId, message);
      updateBooking(updatedBooking);
    } catch (err: any) {
      console.error('[SELLER_CHAT_THREAD] Error sending message:', err);
      Alert.alert('Failed to send', err?.message || 'Try again');
    }
  };

  const handleStatusUpdated = () => refresh();

  // ================================================================
  // Header adjusted to support laptop title
  // ================================================================
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#002F34" />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>Buyer #{buyerId}</Text>

        <Text style={styles.headerSubtitle}>
          {entityType === 'mobile'
            ? mobileTitle || `Mobile Request #${requestId}`
            : laptopTitle || `Laptop Request #${requestId}`}
        </Text>
      </View>

      <TouchableOpacity style={styles.headerIconButton}>
        <Icon name="dots-vertical" size={24} color="#002F34" />
      </TouchableOpacity>
    </View>
  );

  const renderMessage = ({ item }: { item: ConversationMessage }) => {
    const isCurrentUser = item.senderId === userId;
    return <MessageBubble message={item} isCurrentUser={isCurrentUser} />;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0F5E87" />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => `${item.timestamp}-${index}`}
        contentContainerStyle={messages.length === 0 ? styles.emptyList : styles.messagesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F5E87']}
            tintColor="#0F5E87"
          />
        }
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />

      {booking && (
        <StatusActionButtons
          requestId={requestId}
          currentStatus={booking.status}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {booking && !isChatDisabled(booking.status) && (
        <ChatInput onSend={handleSendMessage} disabled={sending} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8F9' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12 },
  backButton: { padding: 4, marginRight: 12 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#002F34' },
  headerSubtitle: { fontSize: 12, color: '#6B7280' },
  headerIconButton: { padding: 4, marginLeft: 12 },
  messagesList: { paddingVertical: 16 },
  emptyList: { flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, fontWeight: '500', color: '#6B7280' },
});

export default SellerChatThreadScreen;
