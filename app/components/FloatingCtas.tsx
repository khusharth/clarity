import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus as PlusIcon, CircleCheckBigIcon } from "lucide-react";
import { Button } from "./ui/button";
import Settings from "./Settings";
import AddTodoModal from "./AddTodoModal";

const FloatingCtas = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          (target as any).isContentEditable);
      if (open || isTyping) return;
      if (
        e.key.toLowerCase() === "a" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="z-1 fixed w-full pr-6 pl-6 bottom-6 flex items-center justify-between">
        <div className="inline-flex items-center">
          <Settings className="mr-2" />
          <Link
            href="/completed"
            className="inline-flex items-center rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3  h-8 text-sm shadow-(--shadow-soft) transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <CircleCheckBigIcon size={16} className="sm:mr-1.5" />{" "}
            <span className="hidden sm:inline">Completed</span>
          </Link>
        </div>

        <Button
          icon={<PlusIcon />}
          variant="accent"
          size="lg"
          onClick={() => setOpen(true)}
          className="shadow-(--shadow-soft) transition-transform duration-200 hover:-translate-y-0.5"
        >
          Add <span className="hidden sm:inline">Task</span>
        </Button>
      </div>

      <AddTodoModal open={open} onCloseAction={() => setOpen(false)} />
    </>
  );
};

export default FloatingCtas;
