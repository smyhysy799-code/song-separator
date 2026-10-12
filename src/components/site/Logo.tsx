export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-9 place-items-center rounded-xl bg-brand shadow-glow">
        <svg viewBox="0 0 24 24" className="size-5 fill-primary-foreground" aria-hidden>
          <rect x="3" y="9" width="2.4" height="6" rx="1.2" />
          <rect x="7.4" y="5" width="2.4" height="14" rx="1.2" />
          <rect x="11.8" y="2.5" width="2.4" height="19" rx="1.2" />
          <rect x="16.2" y="7" width="2.4" height="10" rx="1.2" />
          <rect x="20.6" y="10" width="1.6" height="4" rx="0.8" />
        </svg>
      </span>
      <span className="text-xl font-bold tracking-normal text-foreground">صوتي</span>
    </span>
  );
}
