import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export const hapticImpactLight = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  }
};

export const hapticImpactMedium = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }
};

export const hapticSuccess = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type: 'SUCCESS' });
  }
};

export const hapticWarning = async () => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type: 'WARNING' });
  }
};
