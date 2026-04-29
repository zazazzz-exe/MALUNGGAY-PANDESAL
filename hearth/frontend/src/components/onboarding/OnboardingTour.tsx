import { useEffect, useState } from "react";
import { useOnboarding } from "../../hooks/useOnboarding";

export interface TourStep {
  selector: string;
  title: string;
  body: string;
}

interface OnboardingTourProps {
  steps: TourStep[];
}

interface Position {
  top: number;
  left: number;
  arrow: "up" | "down" | "none";
}

const TOOLTIP_WIDTH = 320;
const TOOLTIP_ESTIMATED_HEIGHT = 220;
const MARGIN = 12;

const findVisibleTarget = (selector: string): HTMLElement | null => {
  const candidates = document.querySelectorAll<HTMLElement>(selector);
  for (const el of Array.from(candidates)) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return el;
    }
  }
  return null;
};

const computePosition = (rect: DOMRect): Position => {
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const spaceBelow = viewportHeight - rect.bottom;
  const spaceAbove = rect.top;

  let top: number;
  let arrow: Position["arrow"];
  if (spaceBelow >= TOOLTIP_ESTIMATED_HEIGHT + MARGIN || spaceBelow > spaceAbove) {
    top = rect.bottom + MARGIN;
    arrow = "up";
  } else {
    top = Math.max(MARGIN, rect.top - TOOLTIP_ESTIMATED_HEIGHT - MARGIN);
    arrow = "down";
  }

  const idealLeft = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
  const left = Math.max(
    MARGIN,
    Math.min(idealLeft, viewportWidth - TOOLTIP_WIDTH - MARGIN)
  );

  return { top, left, arrow };
};

const OnboardingTour = ({ steps }: OnboardingTourProps) => {
  const { isOpen, stepIndex, next, prev, skip, complete } = useOnboarding();
  const [pos, setPos] = useState<Position | null>(null);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPos(null);
      setHighlight(null);
      return;
    }

    const step = steps[stepIndex];
    if (!step) {
      return;
    }

    let cancelled = false;

    const update = () => {
      if (cancelled) {
        return;
      }
      const el = findVisibleTarget(step.selector);
      if (!el) {
        setPos(null);
        setHighlight(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setHighlight(rect);
      setPos(computePosition(rect));
    };

    update();

    // Re-run after a short delay in case scrolling or layout shifts after mount.
    const tFirst = window.setTimeout(() => {
      const el = findVisibleTarget(step.selector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
    const tSecond = window.setTimeout(update, 450);

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      cancelled = true;
      window.clearTimeout(tFirst);
      window.clearTimeout(tSecond);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen, stepIndex, steps]);

  if (!isOpen) {
    return null;
  }

  const step = steps[stepIndex];
  if (!step) {
    return null;
  }

  const isLast = stepIndex === steps.length - 1;
  const tooltipStyle = pos
    ? { top: pos.top, left: pos.left, width: TOOLTIP_WIDTH }
    : {
        top: "50%",
        left: "50%",
        width: TOOLTIP_WIDTH,
        transform: "translate(-50%, -50%)"
      };

  const ringStyle = highlight
    ? {
        top: highlight.top - 8,
        left: highlight.left - 8,
        width: highlight.width + 16,
        height: highlight.height + 16
      }
    : null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-wood/45 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      {ringStyle && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[61] rounded-2xl ring-4 ring-amber/85 shadow-[0_0_32px_rgba(255,201,122,0.7)] transition-all duration-300"
          style={ringStyle}
        />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-tour-title"
        className="fixed z-[62] rounded-2xl border border-warmgray/70 bg-cream p-5 shadow-[0_24px_60px_rgba(58,36,24,0.32)]"
        style={tooltipStyle}
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-wood-soft/70">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <h2
          id="onboarding-tour-title"
          className="mt-2 font-display text-xl font-semibold text-wood"
        >
          {step.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-wood-soft">{step.body}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={skip}
            className="text-xs font-semibold text-wood-soft hover:text-wood"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={prev}
                className="rounded-xl border border-warmgray bg-white/60 px-3 py-2 text-xs font-semibold text-wood-soft hover:border-ember hover:text-ember-deep"
              >
                Back
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={complete}
                className="primary-button px-4 py-2 text-xs"
              >
                Done
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                className="primary-button px-4 py-2 text-xs"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
