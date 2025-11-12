export default function EmptyState({
  message,
  onClick,
  disabled,
}: {
  message: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const isClickable = onClick && !disabled;

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-8 text-center shadow-(--shadow-soft) ${
        isClickable
          ? "cursor-pointer transition-all hover:border-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-surface-hover))]"
          : ""
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
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
