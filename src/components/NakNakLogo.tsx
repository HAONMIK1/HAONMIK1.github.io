interface NakNakLogoProps {
  className?: string;
  size?: number;
}

// 낙낙 = 지인의 문을 두드려 맛집을 묻는다 + 밥 먹는 즐거움(樂)이 삶의 낙이라는 뜻을 담아
// 문(door)과 손잡이 하나로 표현한 심플한 마크
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
      <defs>
        <linearGradient id="naknak-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.82" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="45" fill="url(#naknak-bg)" />

      {/* 문 */}
      <path
        d="M37 66V40C37 33.373 42.373 28 49 28H51C57.627 28 63 33.373 63 40V66"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* 문 손잡이 */}
      <circle cx="57.5" cy="52" r="3.2" fill="hsl(var(--primary-foreground))" />
    </svg>
  );
}
