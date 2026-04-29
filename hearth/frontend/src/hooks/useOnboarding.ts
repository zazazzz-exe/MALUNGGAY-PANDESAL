import { useSyncExternalStore } from "react";

const COMPLETED_KEY = "hearth_onboarding_complete";

interface OnboardingState {
  isOpen: boolean;
  stepIndex: number;
}

let state: OnboardingState = { isOpen: false, stepIndex: 0 };
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notify = () => listeners.forEach((l) => l());
const getSnapshot = () => state;

const setState = (next: OnboardingState) => {
  state = next;
  notify();
};

export const isOnboardingComplete = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }
  try {
    return window.localStorage.getItem(COMPLETED_KEY) === "true";
  } catch {
    return true;
  }
};

const markComplete = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(COMPLETED_KEY, "true");
  } catch {
    // ignore
  }
};

export const useOnboarding = () => {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    isOpen: current.isOpen,
    stepIndex: current.stepIndex,
    start: () => setState({ isOpen: true, stepIndex: 0 }),
    next: () => setState({ ...state, stepIndex: state.stepIndex + 1 }),
    prev: () =>
      setState({ ...state, stepIndex: Math.max(0, state.stepIndex - 1) }),
    complete: () => {
      markComplete();
      setState({ isOpen: false, stepIndex: 0 });
    },
    skip: () => {
      markComplete();
      setState({ isOpen: false, stepIndex: 0 });
    }
  };
};
