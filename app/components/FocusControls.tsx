"use client";
import { useTodos } from "../store/todos";
import { useSfx } from "../hooks/useSfx";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { Toggle } from "./ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function FocusControls() {
  const {
    tasks,
    isFocus,
    focusMode,
    activeTaskId,
    enterFocus,
    exitFocus,
    setFocusMode,
    nextFocusTask,
    setActiveTask,
  } = useTodos();
  const sfx = useSfx();

  const q1 = useMemo(
    () =>
      tasks.filter((t) => t.status === "active" && t.isUrgent && t.isImportant),
    [tasks]
  );
  const hasQ1 = q1.length > 0;
  const hasMoreThanOneQ1 = q1.length > 1;

  if (!hasQ1) return <div className="p-2" />;

  return (
    <div className="flex items-center gap-2 p-2 mb-1">
      <div className="inline-flex items-center gap-2">
        <span className="text-sm font-medium">Focus:</span>

        <Toggle
          pressed={isFocus}
          onPressedChange={(pressed) => {
            sfx.focus();
            if (pressed) {
              enterFocus("all");
            } else {
              exitFocus();
            }
          }}
          disabled={!hasQ1 && !isFocus}
          aria-label="Toggle focus mode"
        />
      </div>

      {isFocus && hasMoreThanOneQ1 && (
        <>
          <div className="ml-2 inline-flex items-center gap-1 text-sm">
            <label className="mr-1">Mode:</label>
            <Select
              value={focusMode}
              onValueChange={(value: string) =>
                setFocusMode(value as "all" | "single")
              }
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Q1</SelectItem>
                <SelectItem value="single">Single</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {focusMode === "single" && (
            <Button
              variant="outline"
              size="sm"
              className="ml-2 shadow-[var(--shadow-soft)]"
              onClick={() => {
                if (!activeTaskId && q1[0]) setActiveTask(q1[0].id);
                else nextFocusTask();
              }}
              disabled={!hasQ1}
            >
              Next
            </Button>
          )}
        </>
      )}
    </div>
  );
}
