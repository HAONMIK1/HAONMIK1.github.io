interface NakNakLogoProps {
  className?: string;
  size?: number;
}

export function NakNakLogo({ className = "", size = 32 }: NakNakLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="50" cy="50" r="45" fill="hsl(var(--primary))" />
      
      <text
        x="50"
        y="62"
        fontSize="32"
        fontWeight="800"
        textAnchor="middle"
        fill="hsl(var(--primary-foreground))"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-1"
      >
        낙낙
      </text>
    </svg>
  );
}
