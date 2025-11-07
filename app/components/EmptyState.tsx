export default function EmptyState({
  message,
  onClick,
}: {
  message: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-8 text-center shadow-(--shadow-soft) ${
        onClick
          ? "cursor-pointer transition-all hover:border-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-surface-hover))]"
          : ""
      }`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <p className="text-[rgb(var(--color-fg-muted))]">{message}</p>
    </div>
  );
}
