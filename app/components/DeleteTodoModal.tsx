"use client";
import { useTodos } from "../store/todos";
import { useToast } from "../store/toast";
import { useSfx } from "../hooks/useSfx";
import type { Task } from "../lib/schema";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/button";

type DeleteTodoModalProps = {
  task: Task | null;
  open: boolean;
  onCloseAction: () => void;
};

export default function DeleteTodoModal(props: DeleteTodoModalProps) {
  const { task, open, onCloseAction } = props;
  const { remove } = useTodos();
  const sfx = useSfx();
  const toast = useToast();

  async function handleDelete() {
    if (!task) return;
    await remove(task.id);
    sfx.remove();
    toast.push({ type: "success", message: "Task deleted" });
    onCloseAction();
  }

  if (!task) return null;

  return (
    <Modal
      open={open}
      onClose={onCloseAction}
      title="Delete Task"
      description={`Are you sure you want to delete "${task.text}"? This action cannot be undone.`}
      openSfx="remove"
    >
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onCloseAction} size="sm">
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDelete} size="sm">
          Delete
        </Button>
      </div>
    </Modal>
  );
}
