"use client";
import { useState, useEffect, useRef } from "react";
import { useTodos } from "../store/todos";
import { useToast } from "../store/toast";
import { useSfx } from "../hooks/useSfx";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";

type AddTodoModalProps = { open: boolean; onCloseAction: () => void };

export default function AddTodoModal(props: AddTodoModalProps) {
  const { open, onCloseAction } = props;
  const { add } = useTodos();
  const sfx = useSfx();
  const toast = useToast();
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);

  // Reset fields when opened (deferred to next frame to satisfy lint rules)
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      setText("");
      setUrgent(false);
      setImportant(false);
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await add(trimmed, urgent, important);
    sfx.add();
    toast.push({ type: "success", message: "Task added" });
    onCloseAction();
  }

  return (
    <Modal
      open={open}
      onClose={onCloseAction}
      title="Add Task"
      description="Create a new task and set its urgency and importance"
      initialFocusRef={inputRef}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What needs to be done?"
        />
        <div className="flex items-center gap-4 text-sm">
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={urgent}
              onCheckedChange={(checked) => setUrgent(checked === true)}
            />
            Urgent
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={important}
              onCheckedChange={(checked) => setImportant(checked === true)}
            />
            Important
          </label>
        </div>
        <div className="mt-2 flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCloseAction}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="accent"
            className="flex-1 sm:flex-none"
          >
            Add
          </Button>
        </div>
        <p className="mt-1 hidden text-xs text-[rgb(var(--color-fg-muted))] sm:block">
          Shortcut: press A to open, Esc to close
        </p>
      </form>
    </Modal>
  );
}
