import { useEffect, useState } from "react";

export const useCountUp = (target: number, isActive: boolean, duration = 2000) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let rafId = 0;
    const startedAt = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      setValue(Math.floor(target * progress));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [duration, isActive, target]);

  return value;
};
