import { ReactNode } from "react";
import useReveal from "../hooks/useReveal";

export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={
        "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 " +
        (visible ? "opacity-100 translate-y-0 " : "opacity-0 translate-y-8 ") +
        className
      }
    >
      {children}
    </div>
  );
}
