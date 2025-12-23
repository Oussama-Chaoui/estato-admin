'use client';

import { useEffect, useRef } from 'react';

interface NavigatorWithBadge extends Navigator {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
}

export default function useTabBadge(count: number) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const baseTitleRef = useRef<string>('Yakout immobilier'); // Fixed base title

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    // Always use the fixed base title
    const baseTitle = baseTitleRef.current;

    const apply = () => {
      const newTitle = count > 0 ? `(${count}) ${baseTitle}` : baseTitle;

      // Always set the title - don't check if different
      document.title = newTitle;

      const nav = navigator as NavigatorWithBadge;
      if (nav?.setAppBadge) {
        if (count > 0) {
          nav.setAppBadge(count).catch(() => {});
        } else {
          nav.clearAppBadge?.().catch?.(() => {});
        }
      }
    };

    // Apply immediately
    apply();

    // Set up a more frequent interval to constantly enforce our title
    intervalRef.current = setInterval(apply, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [count]);
}
