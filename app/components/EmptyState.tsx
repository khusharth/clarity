export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-border bg-surface p-8 text-center shadow-[var(--shadow-soft)]">
      <p className="text-fg-muted">{message}</p>
    </div>
  );
}
