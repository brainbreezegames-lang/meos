import { useCallback, useRef } from 'react';
import { playSound, SoundType } from '@/lib/sounds';

/**
 * Hook for playing UI sounds
 *
 * Provides memoized sound functions with optional debouncing
 * to prevent sound spam on rapid interactions.
 */
export function useSound() {
  const lastPlayedRef = useRef<Record<string, number>>({});

  /**
   * Play a sound with optional debounce
   * @param type - The sound type to play
   * @param debounceMs - Optional debounce time in ms (default: 0)
   * @param volume - Optional volume multiplier (0-1)
   */
  const play = useCallback(
    (type: SoundType, options?: { debounceMs?: number; volume?: number }) => {
      const now = Date.now();
      const debounceMs = options?.debounceMs ?? 0;

      if (debounceMs > 0) {
        const lastPlayed = lastPlayedRef.current[type] ?? 0;
        if (now - lastPlayed < debounceMs) return;
        lastPlayedRef.current[type] = now;
      }

      playSound(type, { volume: options?.volume });
    },
    []
  );

  // Pre-made handlers for common interactions
  const handlers = {
    click: useCallback(() => play('click'), [play]),
    clickSoft: useCallback(() => play('clickSoft'), [play]),
    pop: useCallback(() => play('pop'), [play]),
    popReverse: useCallback(() => play('popReverse'), [play]),
    minimize: useCallback(() => play('minimize'), [play]),
    maximize: useCallback(() => play('maximize'), [play]),
    expand: useCallback(() => play('expand'), [play]),
    collapse: useCallback(() => play('collapse'), [play]),
    drop: useCallback(() => play('drop'), [play]),
    drag: useCallback(() => play('drag'), [play]),
    toggle: useCallback(() => play('toggle'), [play]),
    success: useCallback(() => play('success'), [play]),
    delete: useCallback(() => play('delete'), [play]),
    error: useCallback(() => play('error'), [play]),
    notification: useCallback(() => play('notification'), [play]),
    whoosh: useCallback(() => play('whoosh'), [play]),
    bubble: useCallback(() => play('bubble'), [play]),
  };

  return { play, ...handlers };
}

export default useSound;
