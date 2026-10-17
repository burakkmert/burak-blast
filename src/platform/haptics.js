// Vibration: the Capacitor Haptics plugin on device, navigator.vibrate on the web, otherwise a no-op.
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

const NATIVE = Capacitor.isNativePlatform();

// kind -> [native call, web vibration pattern in ms]
const KINDS = {
  light: [() => Haptics.impact({ style: ImpactStyle.Light }), 10],
  medium: [() => Haptics.impact({ style: ImpactStyle.Medium }), 20],
  heavy: [() => Haptics.impact({ style: ImpactStyle.Heavy }), 40],
  warning: [() => Haptics.notification({ type: NotificationType.Warning }), [20, 40, 20]],
  success: [() => Haptics.notification({ type: NotificationType.Success }), [15, 30, 15]],
  error: [() => Haptics.notification({ type: NotificationType.Error }), [40, 40, 40, 40, 40]],
};

/** @param {'light'|'medium'|'heavy'|'warning'|'success'|'error'} kind */
export function haptic(kind) {
  const entry = KINDS[kind];
  if (!entry) return;
  try {
    if (NATIVE) {
      entry[0]()?.catch?.(() => {});
    } else if (typeof navigator.vibrate === 'function') {
      navigator.vibrate(entry[1]);
    }
  } catch {
    // vibration is optional
  }
}
