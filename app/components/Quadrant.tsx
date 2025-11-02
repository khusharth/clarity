import EmptyState from "./EmptyState";

export default function Quadrant({
  title,
  colorVar,
  children,
  isEmpty,
  emptyMessage,
}: {
  title: string;
  colorVar: string; // CSS rgb triplet variable name, e.g., --q1
  children?: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-3 shadow-[var(--shadow-soft)]">
      <header className="flex items-center gap-2">
        <div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: `rgb(var(${colorVar}))` }}
        />
        <h2 className="text-sm font-medium">{title}</h2>
      </header>
      <div className="min-h-24">
        {isEmpty ? (
          <EmptyState message={emptyMessage ?? "No items yet"} />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
