export interface LevelConfig {
  level: number;
  title: string;
  emoji: string;
  minXp: number;
  maxXp: number;
  colorClass: string;
  bgClass: string;
}

export const LEVEL_CONFIG: LevelConfig[] = [
  { level: 1, title: "미식 입문자",   emoji: "🌱", minXp: 0,    maxXp: 49,       colorClass: "text-green-600",   bgClass: "bg-green-500" },
  { level: 2, title: "동네 탐험가",   emoji: "🗺️", minXp: 50,   maxXp: 149,      colorClass: "text-emerald-600", bgClass: "bg-emerald-500" },
  { level: 3, title: "맛집 헌터",     emoji: "🔍", minXp: 150,  maxXp: 299,      colorClass: "text-blue-600",    bgClass: "bg-blue-500" },
  { level: 4, title: "단골 큐레이터", emoji: "⭐", minXp: 300,  maxXp: 499,      colorClass: "text-indigo-600",  bgClass: "bg-indigo-500" },
  { level: 5, title: "맛집 전도사",   emoji: "🔥", minXp: 500,  maxXp: 799,      colorClass: "text-violet-600",  bgClass: "bg-violet-500" },
  { level: 6, title: "미식 권위자",   emoji: "🏅", minXp: 800,  maxXp: 1199,     colorClass: "text-amber-600",   bgClass: "bg-amber-500" },
  { level: 7, title: "맛집왕",        emoji: "👑", minXp: 1200, maxXp: Infinity, colorClass: "text-yellow-600",  bgClass: "bg-yellow-500" },
];

export function getUserLevel(xp: number): LevelConfig {
  let result = LEVEL_CONFIG[0];
  for (const c of LEVEL_CONFIG) {
    if (xp >= c.minXp) result = c;
  }
  return result;
}

export function getLevelProgress(xp: number): {
  percent: number;
  remaining: number;
  nextXp: number;
} {
  const config = getUserLevel(xp);
  if (config.maxXp === Infinity) return { percent: 100, remaining: 0, nextXp: Infinity };
  const range = config.maxXp - config.minXp + 1;
  const progress = xp - config.minXp;
  const percent = Math.min(100, Math.round((progress / range) * 100));
  const remaining = config.maxXp + 1 - xp;
  return { percent, remaining, nextXp: config.maxXp + 1 };
}
