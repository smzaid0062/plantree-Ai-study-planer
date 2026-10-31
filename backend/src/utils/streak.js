import StudySession from "../models/StudySession.js";

export const getCurrentStreak = async (userId) => {
  const sessions = await StudySession.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" },
        },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  const days = new Set(sessions.map((s) => s._id));
  const fmt = (d) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  let streak = 0;
  const cursor = new Date();

  // Agar aaj ka session nahi hai to streak kal se count hoga
  if (!days.has(fmt(cursor))) cursor.setDate(cursor.getDate() - 1);

  while (days.has(fmt(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};