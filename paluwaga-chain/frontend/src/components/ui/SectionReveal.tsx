import { ReactNode, useEffect, useRef } from "react";
import { useInViewAnimation } from "../../hooks/useInViewAnimation";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  variant?: "base" | "left" | "right" | "scale";
  stagger?: 1 | 2 | 3 | 4 | 5;
}

const variantClass = {
  base: "",
  left: "animate-left",
  right: "animate-right",
  scale: "animate-scale"
};

const staggerClass = {
  1: "stagger-1",
  2: "stagger-2",
  3: "stagger-3",
  4: "stagger-4",
  5: "stagger-5"
};

const SectionReveal = ({ children, className = "", variant = "base", stagger }: SectionRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useInViewAnimation(ref);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (isVisible) {
      ref.current.classList.add("visible");
    }
  }, [isVisible]);

  return (
    <div ref={ref} className={`animate-on-scroll ${variantClass[variant]} ${stagger ? staggerClass[stagger] : ""} ${className}`}>
      {children}
    </div>
  );
};

export default SectionReveal;
