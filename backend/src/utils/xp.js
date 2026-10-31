import User from "../models/User.js";

export const xpForLevel = (level) => (level - 1) ** 2 * 100;

export const levelFromXp = (xp) => Math.floor(Math.sqrt(xp / 100)) + 1;

export const awardXp = async (userId, amount, reason) => {
  if (!amount || amount <= 0) return null;

  const user = await User.findById(userId);
  if (!user) return null;

  const before = levelFromXp(user.xp);
  user.xp += amount;
  user.xpHistory.push({ amount, reason });
  if (user.xpHistory.length > 50) {
    user.xpHistory = user.xpHistory.slice(-50);
  }
  await user.save();

  const after = levelFromXp(user.xp);
  return { xp: user.xp, level: after, leveledUp: after > before, gained: amount };
};