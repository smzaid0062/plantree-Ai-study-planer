export const levelFromXp = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

export const xpForLevel = (level) => (level - 1) ** 2 * 100;

export const levelProgress = (xp) => {
  const level = levelFromXp(xp);
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const percent = Math.round(((xp - current) / (next - current)) * 100);
  return { level, current, next, percent };
};