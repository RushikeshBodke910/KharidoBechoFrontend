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
import { BookingEntity, EntityType } from '@core/booking/types/entity.types';
import { ConversationMessage } from '../types';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import { getBuyerStatusConfig, isChatDisabled } from '@core/booking/utils';

interface RouteParams {
  requestId: number;
  entityType: EntityType;     // 🔥 now read properly
  entityName?: string;
  sellerId?: number;
}

const BuyerChatThreadScreen = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const { requestId, sellerId, entityType = "mobile", entityName } =
    route.params as RouteParams;

  const { userId, buyerId } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // 🔥 use correct API entity type
  const { booking, loading, error, refresh, updateBooking } =
    useBookingThread<BookingEntity>({
      entityType,      // 🔥 dynamic
      bookingId: requestId,
      contextId: buyerId || 0,
      enabled: !!buyerId,
    });

  // 🔥 also dynamic sendMessage hook
  const { sendMessage, sending } = useSendMessage(entityType);

  const messages = booking?.conversation || [];

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

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
      const updatedBooking = await sendMessage(requestId, userId, message);
      updateBooking(updatedBooking);
    } catch (err: any) {
      console.error('[CHAT_THREAD] send error', err);
      Alert.alert('Failed to send', err?.message || 'Try again later');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#002F34" />
      </TouchableOpacity>

      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>
          {entityName || `${entityType.toUpperCase()} Request #${booking?.entityId || requestId}`}
        </Text>
        <Text style={styles.headerSubtitle}>Seller ID: {sellerId || booking?.sellerId}</Text>
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
        contentContainerStyle={
          messages.length === 0 ? styles.emptyList : styles.messagesList
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0F5E87']}
            tintColor="#0F5E87"
          />
        }
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      <ChatInput
        onSend={handleSendMessage}
        disabled={booking ? isChatDisabled(booking.status) : false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8F9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { padding: 4, marginRight: 12 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#002F34' },
  headerSubtitle: { fontSize: 12, color: '#6B7280' },
  headerIconButton: { padding: 4, marginLeft: 12 },
  messagesList: { paddingVertical: 16 },
  emptyList: { flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
});

export default BuyerChatThreadScreen;
