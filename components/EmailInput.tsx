import ButtonChecker from "./ButtonChecker";

export interface EmailInputProps {
  email: string;
  setEmail: (email: string) => void;
  placeholder?: string;
}

export default function EmailInput({
  email,
  setEmail,
  placeholder = "tu@email.com",
}: EmailInputProps) {
  return (
    <input
      type="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600]"
    />
  );
}
