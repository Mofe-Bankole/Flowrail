/**
 * The FlowRail mark: one line in, a fan of keys out. Same motif as the logo
 * artwork in the repo root, redrawn as a currentColor glyph so it themes.
 */
export function Mark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <path d="M3 16h9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M12 16 27 5M12 16l15-5.5M12 16h15M12 16l15 5.5M12 16l15 11"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="3.5" cy="16" r="2.2" fill="currentColor" />
      <circle cx="27" cy="16" r="2.4" fill="currentColor" />
      <circle cx="27" cy="10.5" r="1.9" fill="currentColor" fillOpacity="0.75" />
      <circle cx="27" cy="21.5" r="1.9" fill="currentColor" fillOpacity="0.75" />
      <circle cx="27" cy="5" r="1.7" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.2" />
      <circle cx="27" cy="27" r="1.7" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1.2" />
    </svg>
  );
}
