import { create } from "zustand";

type ToastType = "success" | "info" | "warn" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (t) =>
    set((state) => ({
      toasts: [...state.toasts, { ...t, id: genId() }],
    })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));


