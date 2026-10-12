import useCountdown from "../hooks/useCoutdown";

export default function CountdownBoxes({ date }: { date: string }) {
  const nextRaceTarget = new Date(date).getTime();
  const { days, hours, minutes, seconds } = useCountdown(nextRaceTarget);

  return (
    <div className="flex gap-3 md:gap-4">
      {[
        { v: days, l: "DÍAS" },
        { v: hours, l: "HS" },
        { v: minutes, l: "MIN" },
        { v: seconds, l: "SEG" },
      ].map((box) => (
        <div
          key={box.l}
          className="gpt-flicker flex w-16 flex-col items-center rounded-sm border border-[#33343D] bg-[#0B0B10] py-3 md:w-20"
        >
          <span
            className={
              "font-mono" + " text-2xl font-700 tabular-nums md:text-3xl"
            }
          >
            {String(box.v).padStart(2, "0")}
          </span>
          <span
            className={
              "font-mono" + " mt-1 text-[9px] tracking-[0.25em] text-[#7C4DFF]"
            }
          >
            {box.l}
          </span>
        </div>
      ))}
    </div>
  );
}
