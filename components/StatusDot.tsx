export default function StatusDot({ ok = true, colorClass }: { ok?: boolean; colorClass?: string }) {
  const bg = colorClass || (ok ? "bg-emerald-400" : "bg-amber-400");
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={
          "absolute inline-flex h-full w-full rounded-full opacity-60 motion-reduce:hidden animate-ping " + bg
        }
      />
      <span
        className={
          "relative inline-flex h-2 w-2 rounded-full " + bg
        }
      />
    </span>
  );
}