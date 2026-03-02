import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="FastDép Connect Logo"
      {...props}
    >
      <g fill="hsl(var(--primary))">
        <path d="M20.19 8.2a7.5 7.5 0 0 0-12.38 0 7.5 7.5 0 0 0-1.62 9.2A7.5 7.5 0 0 0 12 22a7.5 7.5 0 0 0 5.81-2.6 7.5 7.5 0 0 0-1.62-9.2Z" />
        <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </g>
      <text
        x="12"
        y="13.5"
        textAnchor="middle"
        alignmentBaseline="middle"
        fill="hsl(var(--primary-foreground))"
        fontSize="5"
        fontWeight="bold"
      >
        D
      </text>
    </svg>
  );
}
