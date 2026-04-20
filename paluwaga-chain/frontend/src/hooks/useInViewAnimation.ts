import { RefObject, useEffect, useState } from "react";

export const useInViewAnimation = <T extends HTMLElement>(ref: RefObject<T>, options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
      ...options
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [options, ref]);

  return isVisible;
};
