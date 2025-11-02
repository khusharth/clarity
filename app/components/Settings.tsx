"use client";
import { useRef, useState } from "react";
import { useTodos } from "../store/todos";
import { useToast } from "../store/toast";

export default function Settings() {
  const {
    reducedMotionPref,
    setReducedMotionPref,
    soundEnabled,
    setSoundEnabled,
    exportJSON,
    importJSON,
  } = useTodos();
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  function download(filename: string, text: string) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 text-sm shadow-[var(--shadow-soft)]"
      >
        Settings
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-4 shadow-[var(--shadow-soft)]">
            <h2 className="mb-3 text-lg font-medium">Settings</h2>
            <div className="flex flex-col gap-3 text-sm">
              <label className="flex items-center justify-between">
                <span>Reduced motion</span>
                <select
                  className="rounded-md border border-[rgb(var(--color-border))] bg-transparent px-2 py-1"
                  value={reducedMotionPref}
                  onChange={(e) => setReducedMotionPref(e.target.value as any)}
                >
                  <option value="system">System</option>
                  <option value="reduce">Reduce</option>
                  <option value="motion">Prefer motion</option>
                </select>
              </label>
              <label className="flex items-center justify-between">
                <span>Sound effects</span>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                />
              </label>
              <div className="mt-2 flex items-center justify-between">
                <button
                  className="rounded-md border border-[rgb(var(--color-border))] px-3 py-1"
                  onClick={() => {
                    download(
                      "clarity-tasks.json",
                      JSON.stringify(exportJSON(), null, 2)
                    );
                    toast.push({
                      type: "success",
                      message: "Exported to JSON",
                    });
                  }}
                >
                  Export JSON
                </button>
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const text = await file.text();
                      const bundle = JSON.parse(text);
                      await importJSON(bundle);
                      toast.push({
                        type: "success",
                        message: "Imported tasks",
                      });
                      setOpen(false);
                    }}
                  />
                  <button
                    className="rounded-md border border-[rgb(var(--color-border))] px-3 py-1"
                    onClick={() => fileRef.current?.click()}
                  >
                    Import JSON
                  </button>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  className="rounded-md border border-[rgb(var(--color-border))] px-3 py-1"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
