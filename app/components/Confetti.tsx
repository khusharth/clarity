"use client";

export const CONFETTI_ID = "task-completion-confetti";

export default function ConfettiOverlay() {
  // Place the reward ref at the top-center of the viewport so confetti emits from there.
  return <span id={CONFETTI_ID} className="absolute top-0 left-1/2" />;
}
