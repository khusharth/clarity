export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-8 text-center shadow-[var(--shadow-soft)]">
      <p className="text-[rgb(var(--color-fg-muted))]">{message}</p>
    </div>
  );
}
