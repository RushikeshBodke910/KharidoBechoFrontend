import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ImageSourcePropType } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyLaptopAdsStackParamList } from '../../navigation/MyLaptopAdsStack';
import { deleteLaptop, getAllLaptops, LaptopItem } from '@features/seller/sell/api/LaptopsApi';

import ListingCard from '../../components/myads/ListingCard';
import ListingCardMenu from '../../components/myads/ListingCardMenu';
import MyAdsListLayout from '../common/MyAdsListLayout';
import { useMyAdsStatusFilter } from '../../hooks/useMyAdsStatusFilter';
import { formatINR } from '@shared/utils';
import {
  DEFAULT_LISTING_LOCATION,
  BOTTOM_SHEET_MENU_HEIGHT,
  getStatusLabel,
} from '@shared/constants/listing';

type NavigationProp = NativeStackNavigationProp<MyLaptopAdsStackParamList>;

const MyLaptopAdsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [laptops, setLaptops] = useState<LaptopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLaptop, setSelectedLaptop] = useState<LaptopItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 🔥 Fix — ensure laptops always passed as array
  const { selectedTab, setSelectedTab, filtered } = useMyAdsStatusFilter({
    items: laptops || [],
    getStatus: (item) => item.status,
  });

  // Sorting logic (unchanged)
  const sortByNewest = useCallback((items: LaptopItem[]) => {
    return [...items].sort((a, b) => {
      const getTimestamp = (entry: LaptopItem) => {
        const source =
          entry?.createdAt ??
          (entry as any)?.created_on ??
          (entry as any)?.createdDate ??
          null;
        const parsed = source ? Date.parse(source) : NaN;
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      return getTimestamp(b) - getTimestamp(a);
    });
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllLaptops();
      setLaptops(sortByNewest(data));
    } catch (e) {
      console.warn('getAllLaptops error:', e);
    } finally {
      setLoading(false);
    }
  }, [sortByNewest]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const openMenuFor = useCallback((l: LaptopItem) => {
    setSelectedLaptop(l);
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setSelectedLaptop(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (!selectedLaptop) return;
    (navigation as any).navigate('UpdateLaptop', { laptopId: selectedLaptop.id });
    closeMenu();
  }, [selectedLaptop, navigation, closeMenu]);

  const handleDelete = useCallback(() => {
    if (!selectedLaptop || deleting) return;

    Alert.alert(
      'Delete laptop',
      'Are you sure you want to delete this laptop?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteLaptop(selectedLaptop.id);
              await fetchData();
              Alert.alert('Deleted', 'Laptop deleted');
            } catch (e: any) {
              Alert.alert('Failed', e?.response?.data?.message ?? 'Please try again');
            } finally {
              setDeleting(false);
              closeMenu();
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [selectedLaptop, deleting, closeMenu, fetchData]);

  // 🔥 NEW — Laptop Chat navigation same as mobile
  const handleChatPress = useCallback((l: LaptopItem) => {
    (navigation as any).navigate('SellerRequestList', {
      laptopId: l.id,
      laptopTitle: [l.brand, l.model].filter(Boolean).join(' ') || 'Laptop',
    });
  }, [navigation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (deleting) setDeleting(false);
    };
  }, [deleting]);

  const resolveImage = (item: LaptopItem): ImageSourcePropType => {
    const photo = item.laptopPhotos?.[0];
    const url =
      typeof photo?.photo_link === 'string'
        ? photo.photo_link
        : typeof (photo as any)?.photoLink === 'string'
        ? (photo as any).photoLink
        : '';

    return url ? { uri: url } : require('@assets/icons/laptop.png');
  };

  // 🔥 UPDATED CARD — Added Chat button
  const renderCard = useCallback(
    ({ item }: { item: LaptopItem }) => {
      const titleText =
        [item.brand, item.model].filter(Boolean).join(' ') || `Laptop #${item.id}`;
      const subtitleText = [item.processor, item.ram].filter(Boolean).join(' | ');

      return (
        <ListingCard
          image={resolveImage(item)}
          priceText={formatINR(item.price || 0)}
          title={titleText}
          subtitle={subtitleText}
          location={DEFAULT_LISTING_LOCATION}
          badgeText={getStatusLabel(item.status as string)}
          onPress={() => navigation.navigate('LaptopDetails', { laptopId: item.id })}
          onMenuPress={() => openMenuFor(item)}
          onChatPress={() => handleChatPress(item)}   // 🔥 added — opens chat list
          showChatButton={true}                      // 🔥 add support to UI
        />
      );
    },
    [navigation, openMenuFor, handleChatPress]
  );

  return (
    <MyAdsListLayout
      title="My Laptop Ads"
      tabLabelSuffix="Laptops"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      data={filtered}
      loading={loading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={renderCard}
      keyExtractor={(item) => String(item.id)}
      emptyMessage="No laptops found."
      onBack={() => navigation.goBack()}
      menuVisible={menuOpen}
      onCloseMenu={closeMenu}
      bottomSheetHeight={BOTTOM_SHEET_MENU_HEIGHT}
      menuContent={
        <ListingCardMenu
          title={
            selectedLaptop
              ? [selectedLaptop.brand, selectedLaptop.model].filter(Boolean).join(' ')
              : undefined
          }
          statusLabel={selectedLaptop?.status as string | undefined}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleting}
          disabled={deleting}
        />
      }
      isInitialLoading={loading && laptops.length === 0}
    />
  );
};

export default MyLaptopAdsListScreen;
