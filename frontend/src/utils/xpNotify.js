import { showXp } from "../components/common/XpToast";

// API response ke "gamification" object se toasts dikhata hai
export const notifyGamification = (g) => {
  if (!g) return;

  if (g.xp?.gained) showXp(`+${g.xp.gained} XP`);
  if (g.xp?.leveledUp) showXp(`Level up! You are now Level ${g.xp.level} 🎉`);
  if (g.streakBonus?.gained) showXp(`${g.streak}-day streak bonus +${g.streakBonus.gained} XP 🔥`);
};