import useSound from "use-sound";
import { useTodos } from "../store/todos";

function beep(duration = 120, frequency = 880) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = frequency;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / 1000);
    o.start();
    o.stop(ctx.currentTime + duration / 1000);
  } catch {}
}

export function useSfx() {
  const enabled = useTodos((s) => s.soundEnabled);

  const [playAdd] = useSound("/sounds/add.mp3", { volume: 0.35, soundEnabled: enabled });
  const [playComplete] = useSound("/sounds/complete.mp3", { volume: 0.4, soundEnabled: enabled });
  const [playDelete] = useSound("/sounds/delete.mp3", { volume: 0.35, soundEnabled: enabled });
  const [playToggle] = useSound("/sounds/toggle.mp3", { volume: 0.25, soundEnabled: enabled });
  const [playFocus] = useSound("/sounds/focus.mp3", { volume: 0.3, soundEnabled: enabled });
  const [playDragStart] = useSound("/sounds/drag-start.mp3", { volume: 0.3, soundEnabled: enabled });
  const [playDragDrop] = useSound("/sounds/drag-drop.mp3", { volume: 0.35, soundEnabled: enabled });

  return {
    add: () => (enabled ? (playAdd?.() ?? beep(100, 660)) : undefined),
    complete: () => (enabled ? (playComplete?.() ?? beep(140, 520)) : undefined),
    remove: () => (enabled ? (playDelete?.() ?? beep(120, 220)) : undefined),
    toggle: () => (enabled ? (playToggle?.() ?? beep(80, 440)) : undefined),
    focus: () => (enabled ? (playFocus?.() ?? beep(120, 380)) : undefined),
    dragStart: () => (enabled ? (playDragStart?.() ?? beep(100, 660)) : undefined),
    dragDrop: () => (enabled ? (playDragDrop?.() ?? beep(120, 520)) : undefined),
  };
}


