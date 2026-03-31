import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * iOS Premium Haptic Feedback Utility
 */
export const hapticFeedback = {
  /**
   * Small, light feedback for subtle interactions (e.g., toggles)
   */
  light: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },

  /**
   * Medium feedback for standard clicks (e.g., buttons)
   */
  medium: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  },

  /**
   * Heavy feedback for significant actions
   */
  heavy: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  },

  /**
   * Success feedback for completed actions (e.g., form submitted)
   */
  success: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Success });
    }
  },

  /**
   * Warning feedback for alerts
   */
  warning: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Warning });
    }
  },

  /**
   * Error feedback for failures
   */
  error: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type: NotificationType.Error });
    }
  },

  /**
   * Selection feedback for list items or wheel pickers
   */
  selection: async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    }
  }
};
