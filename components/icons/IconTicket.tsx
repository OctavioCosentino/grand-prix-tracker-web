export default function IconTicket({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 9a2 2 0 002-2V6a1 1 0 011-1h10a1 1 0 011 1v1a2 2 0 002 2v0a2 2 0 00-2 2v1a2 2 0 002 2v0a2 2 0 00-2 2v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1a2 2 0 00-2-2v0a2 2 0 002-2v-1a2 2 0 00-2-2v0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 5.5v13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
    </svg>
  );
}
