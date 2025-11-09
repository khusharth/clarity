"use client";

import { useState } from "react";
import type { Task } from "../lib/schema";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/button";
import { Edit, Trash2, Star, StarOff, Zap, ZapOff, Clock } from "lucide-react";
import { formatDateTime } from "../lib/dates";
import EditTodoModal from "./EditTodoModal";
import DeleteTodoModal from "./DeleteTodoModal";

type ViewTodoModalProps = {
  task: Task | null;
  open: boolean;
  onCloseAction: () => void;
};

export default function ViewTodoModal(props: ViewTodoModalProps) {
  const { task, open, onCloseAction } = props;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!task) return null;

  const handleEditClick = () => setEditOpen(true);
  const handleDeleteClick = () => setDeleteOpen(true);
  const handleEditClose = () => setEditOpen(false);
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    // Don't close view modal on cancel
  };
  const handleDeleteSuccess = () => {
    // Close view modal after successful deletion
    onCloseAction();
  };

  return (
    <>
      <Modal open={open} onClose={onCloseAction} title="Task Details">
        <div className="flex flex-col gap-4">
          {/* Task text */}
          <div className="pb-2">
            <p className="text-lg leading-snug whitespace-pre-wrap">
              {task.text}
            </p>
          </div>

          {/* Badges / chips for properties */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Important */}
            <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] shadow">
              {task.isImportant ? (
                <span className="inline-flex items-center gap-1 text-[rgb(var(--color-accent))]">
                  <Star size={12} /> Important
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[rgb(var(--color-fg-muted))]">
                  <StarOff size={12} /> Not important
                </span>
              )}
            </div>

            {/* Urgent */}
            <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] shadow">
              {task.isUrgent ? (
                <span className="inline-flex items-center gap-1 text-[rgb(var(--color-accent))]">
                  <Zap size={12} /> Urgent
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[rgb(var(--color-fg-muted))]">
                  <ZapOff size={12} /> Not urgent
                </span>
              )}
            </div>
          </div>

          {/* Created date - minimal */}
          <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--color-fg-muted))]">
            <Clock size={12} className="opacity-60" />
            <span>{formatDateTime(task.createdAt)}</span>
          </div>

          {/* Divider - visible only on mobile */}
          <div className="border-t border-[rgb(var(--color-border))] sm:hidden" />

          {/* Actions: Mobile - Delete/Edit on first row 50/50, Close on second row 100%; Desktop - Delete left, Edit/Close right */}
          <div className="mt-4 sm:mt-4 flex flex-wrap items-center gap-2">
            {/* Delete - text hidden on desktop hover, always visible on mobile */}
            <button
              onClick={handleDeleteClick}
              className="group inline-flex items-center justify-center gap-2 h-8 px-3 sm:px-2 rounded-md text-[rgb(var(--color-fg-muted))] hover:text-[rgb(var(--color-error))] hover:bg-[rgb(var(--color-surface))] transition-all flex-1 sm:flex-none cursor-pointer"
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 size={16} className="shrink-0" />
              <span className="text-sm sm:max-w-0 sm:overflow-hidden sm:whitespace-nowrap sm:group-hover:max-w-[100px] sm:transition-all sm:duration-300 sm:ease-out">
                Delete
              </span>
            </button>

            <Button
              variant="outline"
              onClick={handleEditClick}
              size="sm"
              icon={<Edit size={16} />}
              className="flex-1 sm:flex-none sm:ml-auto"
            >
              Edit
            </Button>

            {/* Close button - full width on mobile with top margin, auto on desktop */}
            <Button
              variant="default"
              onClick={onCloseAction}
              size="sm"
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Nested Modals */}
      <EditTodoModal
        task={task}
        open={editOpen}
        onCloseAction={handleEditClose}
      />
      <DeleteTodoModal
        task={task}
        open={deleteOpen}
        onCloseAction={handleDeleteClose}
        onDeleteSuccessAction={handleDeleteSuccess}
      />
    </>
  );
}
