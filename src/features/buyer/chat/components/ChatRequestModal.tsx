// src/features/buyer/chat/components/ChatRequestModal.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

interface ChatRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (message: string, entityType: "mobile" | "laptop") => Promise<void>;
  itemTitle?: string;
  entityType: "mobile" | "laptop";
}

const ChatRequestModal: React.FC<ChatRequestModalProps> = ({
  visible,
  onClose,
  onSend,
  itemTitle = "this item",
  entityType,
}) => {
  const defaultMessage =
    entityType === "laptop"
      ? "Hi, is this laptop available?"
      : "Hi, is this mobile available?";

  const [message, setMessage] = useState(defaultMessage);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) setMessage(defaultMessage);
  }, [visible]);

  const handleSend = async () => {
    if (!message.trim()) return;
    try {
      setLoading(true);
      await onSend(message.trim(), entityType);
      setMessage(defaultMessage);
      onClose();
    } catch (error) {
      console.error("Failed to send request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setMessage(defaultMessage);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
          disabled={loading}
        />

        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <View style={styles.headerIcon}>
                <Icon name="message-text" size={24} color="#0F5E87" />
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
                disabled={loading}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Send request to seller</Text>
            <Text style={styles.subtitle}>
              Your message will be sent to the seller for{" "}
              <Text style={styles.itemName}>{itemTitle}</Text>
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={500}
                editable={!loading}
                autoFocus
              />
              <Text style={styles.charCount}>{message.length}/500</Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!message.trim() || loading) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!message.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="send" size={18} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>Send Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: { width: "90%", maxWidth: 400 },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    elevation: 10,
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5F3F5",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: { padding: 4 },
  title: { fontSize: 22, fontWeight: "700", color: "#0F172A", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
  itemName: { fontWeight: "600", color: "#0F5E87" },
  inputContainer: { marginBottom: 20 },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: { fontSize: 12, color: "#9CA3AF", textAlign: "right", marginTop: 6 },
  buttons: { flexDirection: "row", gap: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "#6B7280" },
  sendButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "#0F5E87",
    borderRadius: 10,
    gap: 8,
  },
  sendButtonDisabled: { backgroundColor: "#CBD5E1" },
  sendButtonText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
});

export default ChatRequestModal;
