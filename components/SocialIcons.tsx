export function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 9H15V6.5h-1.5C11.6 6.5 10 8.1 10 10v1.5H8V14h2v7h2.5v-7h2l.5-2.5h-2.5V10c0-.6.4-1 1-1Z" />
    </svg>
  );
}

export function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedinIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 8.5H4V20h2.94V8.5ZM5.47 4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM20 13.3c0-3-1.6-4.4-3.75-4.4a3.24 3.24 0 0 0-2.94 1.62V8.5H10.4c.04.85 0 11.5 0 11.5h2.91v-6.42c0-.34.02-.68.12-.93.28-.68.9-1.4 1.96-1.4 1.38 0 1.93 1.05 1.93 2.6V20H20v-6.7Z" />
    </svg>
  );
}
