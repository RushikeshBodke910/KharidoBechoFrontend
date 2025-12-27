// src/screens/LaptopScreens/AddLaptopDetailsScreen.tsx

import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SellFlowLayout from '../common/SellFlowLayout';
import {
  PrimaryButton,
  TextField,
  DropdownField,
  DropdownOption,
} from '@shared/components';
import { colors, spacing } from '@theme/tokens';
import { useFormState } from '@shared/form/hooks/useFormState';

import {
  LaptopDetailsFormValues,
  getDefaultLaptopDetailsValues,
  laptopDetailsSchema,
} from '@shared/form/schemas/laptopDetailsSchema';

import { laptopDetailsFieldConfig } from '@shared/form/config/laptopDetailsFields';
import { normalizeCreateResponse, getFriendlyApiError } from '@shared/utils';
import { toLaptopCreateDTO } from '@shared/mappers/listingMappers';
import { addLaptop } from '@features/seller/sell/api/LaptopsApi';
import { useAuth } from '@context/AuthContext';
import { SellLaptopStackParamList } from '../../navigation/SellLaptopStack';

type AddLaptopNav = NativeStackNavigationProp<
  SellLaptopStackParamList,
  'AddLaptopDetails'
>;

/*  USB Ports dropdown options */
const USB_PORT_OPTIONS: DropdownOption<string>[] = [
  { label: '1 Port', value: '1' },
  { label: '2 Ports', value: '2' },
  { label: '3 Ports', value: '3' },
  { label: '4 Ports', value: '4' },
  { label: '5 Ports', value: '5' },
  { label: '6 Ports', value: '6' },
];

const AddLaptopDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AddLaptopNav>();
  const { sellerId } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    touchField,
    validateForm,
  } = useFormState<LaptopDetailsFormValues>({
    initialValues: getDefaultLaptopDetailsValues(),
    schema: laptopDetailsSchema,
  });

  const renderField = (config: any) => {
    const field = config.field;
    const value = values[field];
    const error = touched[field] ? errors[field] : undefined;

    switch (config.component) {
      case 'text':
        return (
          <TextField
            key={String(field)}
            label={config.label}
            value={value == null ? '' : String(value)}
            onChangeText={(text) => {
              setFieldValue(field, text as any, { validate: true });
            }}
            onBlur={() => handleBlur(field)}
            required={config.required}
            error={error}
            {...config.props}
          />
        );

      case 'dropdown': {
        const data: DropdownOption<string>[] = config.props?.data ?? [];
        return (
          <DropdownField
            key={String(field)}
            label={config.label}
            data={data}
            value={value as string}
            placeholder={config.props?.placeholder}
            onChange={(item) => {
              touchField(field);
              setFieldValue(field, item.value as any, { validate: true });
            }}
            required={config.required}
            error={error}
          />
        );
      }

      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!sellerId) {
      Alert.alert('Error', 'Seller account not found');
      return;
    }

    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      const payload = toLaptopCreateDTO(values, Number(sellerId));
      const response = await addLaptop(payload);
      const normalized = normalizeCreateResponse(response, 'laptop');

      if (!normalized.success) {
        Alert.alert(
          'Failed',
          normalized.rawMessage || 'Laptop could not be created',
        );
        return;
      }

      if (normalized.id == null) {
        Alert.alert(
          'Success',
          'Laptop created. Please upload photos from My Laptop Ads.',
        );
        return;
      }

      Alert.alert('Success', normalized.message || 'Laptop created');
      navigation.navigate('SelectLaptopPhotoScreen', {
        laptopId: normalized.id,
      });
    } catch (error: any) {
      Alert.alert('Error', getFriendlyApiError(error, 'Failed to add laptop'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellFlowLayout
      title="Laptop Details"
      onBack={() => navigation.goBack()}
      footer={
        <PrimaryButton
          label="Next"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          icon={<Icon name="arrow-right" size={20} color={colors.white} />}
        />
      }
      contentContainerStyle={{ paddingBottom: spacing.xxxl }}
    >
      {/*  Render all fields EXCEPT usbPorts */}
      {laptopDetailsFieldConfig
        .filter((config) => config.field !== 'usbPorts')
        .map(renderField)}

      {/*  USB Ports dropdown (single source of truth) */}
      <DropdownField
        label="USB Ports"
        data={USB_PORT_OPTIONS}
        value={values.usbPorts as string}
        placeholder="Select USB ports"
        onChange={(item) => {
          touchField('usbPorts');
          setFieldValue('usbPorts', item.value as any, { validate: true });
        }}
        required
        error={touched.usbPorts ? errors.usbPorts : undefined}
      />

      <View style={{ height: spacing.xxxl }} />
    </SellFlowLayout>
  );
};

export default AddLaptopDetailsScreen;
