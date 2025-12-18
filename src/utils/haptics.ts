import * as Haptics from 'expo-haptics';

export const hapticsSelection = () => Haptics.selectionAsync();
export const hapticsSuccess = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
export const hapticsWarning = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
export const hapticsError = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

export const hapticsImpact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) =>
  Haptics.impactAsync(style);
