import { useTodos } from "../store/todos";

// Returns the user's reduced motion preference
export function useAppReducedMotion(): boolean {
  const pref = useTodos((s) => s.reducedMotionPref);
  return pref;
}
