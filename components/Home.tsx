import Image from "next/image";

interface HomeProps {
  isLarge?: boolean;
  disableHoverScale?: boolean;
}

export default function Home({
  isLarge = false,
  disableHoverScale = false,
}: HomeProps) {
  const containerClasses = isLarge
    ? "flex items-center justify-center gap-4 md:gap-5 w-full"
    : `flex items-center gap-3 transition-transform ${
        disableHoverScale ? "" : "hover:scale-105"
      }`;

  const imageWidth = isLarge ? "w-20 md:w-24" : "w-[30px]";

  const titleClasses = isLarge ? "text-4xl md:text-5xl" : "text-[15px]";

  const subtitleClasses = isLarge ? "mt-2 text-xs md:text-sm" : "text-[9px]";

  return (
    <a
      href="/"
      title="Volver a la página principal"
      aria-label="Volver a la página principal"
      className={containerClasses}
    >
      <Image
        src="/logo-nobg.png"
        alt="GrandPrix Tracker"
        height={992}
        width={1072}
        className={`${imageWidth} h-auto shrink-0`}
      />
      <span className="flex flex-col justify-center leading-none">
        <span
          className={`font-display font-900 tracking-tight ${titleClasses} text-[#F3F1EA]`}
        >
          GRAND<span className="text-[#E10600]">PRIX</span>
        </span>
        <span
          className={`font-mono tracking-[0.35em] text-[#93949F] ${subtitleClasses}`}
        >
          TRACKER
        </span>
      </span>
    </a>
  );
}