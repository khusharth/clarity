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
        <div className="flex items-center sm:items-start sm:flex-col gap-2 ">
          <Settings className="sm:mb-2 gap-0" />
          <Link
            href="/completed"
            className="group/completed flex items-center rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-3 h-8 text-sm shadow-(--shadow-soft) transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <CircleCheckBigIcon
              size={16}
              className="shrink-0 transition-all duration-200"
            />
            <span className="inline max-w-0 group-hover/completed:max-w-[100px] opacity-0 group-hover/completed:opacity-100 whitespace-nowrap transition-all duration-200 group-hover/completed:ml-1.5">
              Completed
            </span>
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
