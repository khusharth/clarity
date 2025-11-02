import { useReducedMotion as useSystemReduced } from "./useReducedMotion";
import { useTodos } from "../store/todos";

// Combines system reduced motion with app preference
// Pref modes: "system" | "reduce" | "motion"
export function useAppReducedMotion(): boolean {
  const system = useSystemReduced();
  const pref = useTodos((s) => s.reducedMotionPref);
  if (pref === "reduce") return true;
  if (pref === "motion") return false;
  return system;
}


