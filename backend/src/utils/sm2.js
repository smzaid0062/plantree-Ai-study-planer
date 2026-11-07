// SM-2 spaced repetition algorithm (SuperMemo 2)
// quality (q): 0 = total blackout ... 5 = perfect recall

const MIN_EASE = 1.3;

// Quiz accuracy for one topic → quality grade (0–5)
export const accuracyToQuality = (correct, total) => {
  if (!total) return null;
  const ratio = correct / total;
  if (ratio === 1) return 5;
  if (ratio >= 0.8) return 4;
  if (ratio >= 0.6) return 3;
  if (ratio >= 0.4) return 2;
  if (ratio >= 0.2) return 1;
  return 0;
};

// Current review state + quality → next review state
export const nextReview = (state = {}, quality, now = new Date()) => {
  let easeFactor = state.easeFactor ?? 2.5;
  let interval = state.interval ?? 0;
  let repetitions = state.repetitions ?? 0;

  if (quality < 3) {
    // Failed recall: start over, review tomorrow
    repetitions = 0;
    interval = 1;
  } else {
    // Successful recall: grow the interval
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  // Ease factor update (SM-2 formula), never below 1.3
  easeFactor = Math.max(
    MIN_EASE,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  nextReviewDate.setHours(0, 0, 0, 0);

  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    interval,
    repetitions,
    nextReviewDate,
    lastReviewedAt: now,
  };
};