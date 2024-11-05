export const lessonPerformanceScoreCalculator = (
  maximumMargins,
  userMargins
) => {
  const { usedHints, consumedTime, usedAttempts } = userMargins;
  const { maxHints, maxTime, maxAttempts } = maximumMargins;

  const hintWeight = 20;
  const attemptWeight = 40;
  const timeWeight = 40;

  const performanceScore =
    100 -
    hintWeight * (usedHints / maxHints) -
    attemptWeight * (usedAttempts / maxAttempts) -
    timeWeight * (consumedTime / maxTime);

  return Math.ceil(performanceScore);
};

export const projectPerformanceScoreCalculator = () => {};

export const quizPerformanceScoreCalculator = () => {};
