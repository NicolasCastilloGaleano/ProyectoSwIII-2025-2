import type { ReactNode } from "react";

interface HighlightProps {
  icon: ReactNode;
  label: string;
  value: number;
  loading: boolean;
}

const HighlightPill = ({ icon, label, value, loading }: HighlightProps) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2">
    {icon}
    <span className="text-white">
      <strong className="font-semibold">
        {loading ? "—" : value.toString().padStart(2, "0")}
      </strong>{" "}
      <span className="text-white/70">{label}</span>
    </span>
  </span>
);

export default HighlightPill;
