import { useEffect, useRef } from 'react';

/**
 * Hook to animate the favicon by cycling through a list of frames.
 * @param {string[]} frames - Array of image URLs to be used as frames.
 * @param {number} interval - Animation interval in milliseconds.
 */
const useAnimatedFavicon = (frames, interval = 200) => {
  const frameIndex = useRef(0);
  const intervalId = useRef(null);
  const originalFavicon = useRef(null);

  useEffect(() => {
    // Save the original favicon to restore later
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    
    if (!originalFavicon.current) {
        originalFavicon.current = link.href;
    }

    // Preload images
    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    let frameIndex = 0;
    let direction = 1; // 1 for forward, -1 for backward

    const animate = () => {
      const currentFrame = frames[frameIndex];
      link.href = currentFrame;
      document.getElementsByTagName('head')[0].appendChild(link); // Ensure it's attached

      // Calculate next frame index
      if (frames.length > 1) {
        frameIndex += direction;

        // "Bounce" logic: reverse direction at ends
        if (frameIndex >= frames.length - 1 || frameIndex <= 0) {
          direction *= -1;
        }
      }
    };

    if (frames.length > 0) {
      intervalId.current = setInterval(animate, interval);
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      // Restore original favicon
      if (originalFavicon.current) {
        link.href = originalFavicon.current;
      }
    };
  }, [frames, interval]);
};

export default useAnimatedFavicon;
