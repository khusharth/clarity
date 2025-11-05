"use client";
import { useState, useEffect, useRef } from "react";
import { useTodos } from "../store/todos";
import { useToast } from "../store/toast";
import { useSfx } from "../hooks/useSfx";
import type { Task } from "../lib/schema";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";

type EditTodoModalProps = {
  task: Task | null;
  open: boolean;
  onCloseAction: () => void;
};

export default function EditTodoModal(props: EditTodoModalProps) {
  const { task, open, onCloseAction } = props;
  const { updateText, toggleUrgent, toggleImportant } = useTodos();
  const sfx = useSfx();
  const toast = useToast();
  const [text, setText] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open || !task) return;
    const id = requestAnimationFrame(() => {
      setText(task.text);
      setUrgent(task.isUrgent);
      setImportant(task.isImportant);
    });
    return () => cancelAnimationFrame(id);
  }, [open, task]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task) return;
    const trimmed = text.trim();
    if (!trimmed) {
      toast.push({ type: "error", message: "Task text cannot be empty" });
      return;
    }

    if (trimmed !== task.text) {
      await updateText(task.id, trimmed);
    }

    if (urgent !== task.isUrgent) {
      await toggleUrgent(task.id);
    }

    if (important !== task.isImportant) {
      await toggleImportant(task.id);
    }

    sfx.toggle();
    toast.push({ type: "success", message: "Task updated" });
    onCloseAction();
  }

  if (!task) return null;

  return (
    <Modal
      open={open}
      onClose={onCloseAction}
      title="Edit Task"
      description="Update the task text and its urgency/importance"
      initialFocusRef={textareaRef}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Textarea
          ref={textareaRef}
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
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
