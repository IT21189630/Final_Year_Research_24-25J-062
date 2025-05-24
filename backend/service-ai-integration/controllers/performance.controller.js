const Performance = require("../models/performance.model");

// const updatePerformance = async (req, res) => {
//     const { userId, lessonId, code, score, completionTime, hintsUsed, attempts } = req.body;
  
//     if (!userId || !lessonId || !code || score === undefined || !completionTime) {
//       return res.status(400).json({ error: "Missing required fields." });
//     }
  
//     try {
//       let performance = await Performance.findOne({ userId, lessonId });
  
//       if (performance) {
//         performance.code = code;
//         performance.score = score;
//         performance.completionTime = completionTime;
//         performance.hintsUsed = hintsUsed;
//         performance.attempts = attempts;
//         performance.date = new Date();
//       } else {
//         performance = new Performance({
//           userId,
//           lessonId,
//           code,
//           score,
//           completionTime,
//           hintsUsed,
//           attempts,
//         });
//       }
  
//       await performance.save();
//       res.status(200).json({ success: true, performance });
//     } catch (error) {
//       console.error("Error updating performance:", error);
//       res.status(500).json({ error: "Internal server error." });
//     }
//   };

const updatePerformance = async (req, res) => {
  const { userId, lessonId, code, score, completionTime, hintsUsed, attempts, feedback } = req.body;

  if (!userId || !lessonId || !code || score === undefined || !completionTime) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    let performance = await Performance.findOne({ userId, lessonId });

    if (performance) {
      performance.code = code;
      performance.score = score;
      performance.completionTime = completionTime;
      performance.hintsUsed = hintsUsed;
      performance.attempts = attempts;

      if (feedback) {
        performance.feedbackHistory.push({
          feedback,
          timestamp: new Date(),
        });
      }
    } else {
      performance = new Performance({
        userId,
        lessonId,
        code,
        score,
        completionTime,
        hintsUsed,
        attempts,
        feedbackHistory: feedback ? [{ feedback, timestamp: new Date() }] : [],
      });
    }

    await performance.save();
    res.status(200).json({ success: true, performance });
  } catch (error) {
    console.error("Error updating performance:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


  module.exports = { updatePerformance };