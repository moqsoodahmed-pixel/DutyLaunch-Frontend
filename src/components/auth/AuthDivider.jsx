export function AuthDivider({ label = 'OR' }) {
  return (
    <div className="my-6 flex items-center gap-3" role="separator">
      <span className="h-px flex-1 bg-line" />
      <span className="text-caption font-semibold tracking-wide text-slate-400">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
