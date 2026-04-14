import { useState, useCallback, useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

export function useOrientation() {
  const [isLandscapeLocked, setIsLandscapeLocked] = useState(false);

  const lockLandscape = useCallback(async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setIsLandscapeLocked(true);
    } catch (_) {}
  }, []);

  const unlockOrientation = useCallback(async () => {
    try {
      await ScreenOrientation.unlockAsync();
      setIsLandscapeLocked(false);
    } catch (_) {}
  }, []);

  const toggleLandscape = useCallback(async () => {
    if (isLandscapeLocked) {
      await unlockOrientation();
    } else {
      await lockLandscape();
    }
  }, [isLandscapeLocked, lockLandscape, unlockOrientation]);

  // Always unlock when the hook unmounts so the app doesn't get stuck
  useEffect(() => {
    return () => {
      ScreenOrientation.unlockAsync().catch(() => {});
    };
  }, []);

  return { isLandscapeLocked, lockLandscape, unlockOrientation, toggleLandscape };
}
