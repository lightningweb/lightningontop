import { SVGProps } from "react";

/** THUNDER lightning bolt — the single canonical logo/mark used everywhere. */
export const BoltIcon = ({ className = "h-4 w-4", ...rest }: SVGProps<SVGSVGElement> & { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-current`} {...rest}>
    <path d="M13 2L3 14h7l-1 8 11-14h-7l1-6z" />
  </svg>
);

export default BoltIcon;