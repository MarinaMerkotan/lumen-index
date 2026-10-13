/** `01. ECOSYSTEM` microtype label shared by nav and section headers. */
export function SectionLabel({ number, label, className = '' }: { number: string; label: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[3px] font-manrope text-[13px] leading-[15.6px] ${className}`}>
      <span className="text-ice/80">{number}.</span>
      <span className="text-white">{label}</span>
    </span>
  );
}
