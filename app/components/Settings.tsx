"use client";
import { useRef, useState } from "react";
import { useTodos } from "../store/todos";
import { useToast } from "../store/toast";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Toggle } from "./ui/toggle";

export default function Settings() {
  const {
    reducedMotionPref,
    setReducedMotionPref,
    soundEnabled,
    setSoundEnabled,
    themePreference,
    setThemePreference,
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
        className="fixed bottom-6 left-6 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 py-2 text-sm shadow-[var(--shadow-soft)] cursor-pointer"
      >
        Settings
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Settings"
        description="Configure your preferences"
      >
        <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-3 items-center text-sm">
          <span>Theme</span>
          <Select
            value={themePreference}
            onValueChange={(value: string) =>
              setThemePreference(value as "system" | "light" | "dark")
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>

          <span>Reduced motion</span>
          <Select
            value={reducedMotionPref}
            onValueChange={(value: string) =>
              setReducedMotionPref(value as "system" | "reduce" | "motion")
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="reduce">Reduce</SelectItem>
              <SelectItem value="motion">Prefer motion</SelectItem>
            </SelectContent>
          </Select>

          <span>Sound effects</span>
          <div className="flex justify-end">
            <Toggle
              pressed={soundEnabled}
              onPressedChange={setSoundEnabled}
              size="sm"
              aria-label="Toggle sound effects"
            />
          </div>
          <div className="col-span-2 mt-2 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
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
            </Button>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                Import JSON
              </Button>
            </div>
          </div>
          <div className="col-span-2 mt-2 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
