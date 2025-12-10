import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SellEntryStackParamList } from '../navigation/SellEntryStack';
import { useAuth } from '@context/AuthContext';
import AppHeader from '@shared/components/headers/AppHeader';
import SellCategoryGrid from '../components/SellCategoryGrid';
import { SELL_CATEGORIES, SellEntityType } from '../config/sellCategoryConfig';

type Nav = NativeStackNavigationProp<SellEntryStackParamList, 'SellProduct'>;

const ENTITY_STACK_MAP: Record<SellEntityType, { stack: keyof SellEntryStackParamList; screen: string }> = {
  mobile: { stack: 'SellMobileStack', screen: 'AddMobileDetails' },
  laptop: { stack: 'SellLaptopStack', screen: 'AddLaptopDetails' },
  car: { stack: 'SellCarStack', screen: 'AddCarDetails' },
  bike: { stack: 'SellBikeStack', screen: 'AddBikeDetails' },
};

const SellProductScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { roles, sellerId } = useAuth();

  // Role guard: Only sellers with valid sellerId can access this screen
  const isSeller = roles.includes('SELLER') && sellerId !== null;

  if (!isSeller) {
    return (
      <View style={styles.roleGuardContainer}>
        <Text style={styles.roleGuardTitle}>Seller Access Only</Text>
        <Text style={styles.roleGuardMessage}>
          This feature is only available for sellers. Please contact support to upgrade your account.
        </Text>
      </View>
    );
  }

  const handleCategoryPress = useCallback(
    (categoryId: SellEntityType) => {
      const route = ENTITY_STACK_MAP[categoryId];
      if (route) {
        navigation.navigate(route.stack as never, { screen: route.screen } as never);
      }
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <AppHeader showLocation={true} location="Pune" />

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Add Product</Text>
            <Text style={styles.subtitle}>
              Select a category to list your product
            </Text>
          </View>

          {/* Category Grid */}
          <SellCategoryGrid
            categories={SELL_CATEGORIES}
            onCategoryPress={handleCategoryPress}
          />

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: '85%',
  },
  bottomSpacing: {
    height: 40,
  },
  // Role guard styles
  roleGuardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F7F8F9',
  },
  roleGuardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  roleGuardMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SellProductScreen;
