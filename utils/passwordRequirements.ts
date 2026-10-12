export default function PasswordRequirements({
  password,
}: {
  password: string;
}) {
  const requirements = [
    { id: "len", label: "8+ Caracteres", met: password.length >= 8 },
    { id: "up", label: "1 Mayúscula", met: /[A-Z]/.test(password) },
    { id: "num", label: "1 Número", met: /[0-9]/.test(password) },
    { id: "spc", label: "1 Especial", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const score = requirements.filter((req) => req.met).length;

  return {
    requirements,
    score,
    getLightColor: (index: number) => {
      if (index >= score) return "bg-[#1C1D24]";
      if (score === 1) return "bg-[#E10600] shadow-[0_0_8px_#E10600]";
      if (score === 2) return "bg-[#E7B33C] shadow-[0_0_8px_#E7B33C]";
      if (score === 3) return "bg-[#34D399] shadow-[0_0_8px_#34D399]";
      return "bg-[#7C4DFF] shadow-[0_0_8px_#7C4DFF]";
    },
  };
}
