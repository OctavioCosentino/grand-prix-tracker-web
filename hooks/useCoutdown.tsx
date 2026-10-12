import { useEffect, useState } from "react";

export default function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => Math.max(targetMs - Date.now(), 0);

    // Snap to correct value after paint without calling setState
    // synchronously inside the effect body.
    const snapId = setTimeout(() => {
      setRemaining(calc());
    }, 0);

    const id = setInterval(() => {
      setRemaining(calc());
    }, 1000);

    return () => {
      clearTimeout(snapId);
      clearInterval(id);
    };
  }, [targetMs]);

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining / 3_600_000) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);
  const seconds = Math.floor((remaining / 1_000) % 60);
  return { days, hours, minutes, seconds };
}
