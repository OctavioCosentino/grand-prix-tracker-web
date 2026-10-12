export default function IconHotel({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 20V6a1 1 0 011-1h4a1 1 0 011 1v14M3 20h18M9 20v-5a1 1 0 011-1h4a1 1 0 011 1v5M13 9h4a1 1 0 011 1v3M5 9h2M5 12h2M5 15h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
