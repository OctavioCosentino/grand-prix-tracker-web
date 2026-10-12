export interface StepsCardProps {
  step: {
    n: string;
    title: string;
    body: string;
  };
}

export default function StepsCard({ step }: StepsCardProps) {
  return (
    <div className="flex h-full flex-col bg-[#0F0F14] p-8">
      <span className={"font-mono" + " text-sm text-[#7C4DFF]"}>{step.n}</span>
      <h3 className={"font-display" + " mt-4 text-xl font-700"}>
        {step.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[#93949F]">{step.body}</p>
    </div>
  );
}
