const { evaluateCode } = require("../utils/codeEvaluator");

const validateCode = async (req, res) => {
  const { lessonId, userId, code } = req.body;

  // Basic validation
  if (!lessonId || !userId || !code) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // Evaluate the code
    const result = evaluateCode(code);

    // Return the feedback
    res.status(200).json({
      isValid: result.isValid,
      feedback: result.feedback,
      errors: result.errors,
    });
  } catch (error) {
    console.error("Code validation error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


module.exports = { validateCode };
