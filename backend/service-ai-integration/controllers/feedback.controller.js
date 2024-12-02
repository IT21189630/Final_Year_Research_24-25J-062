const openai = require("../config/openai");

const getAdvancedFeedback = async (req, res) => {
  const { code, lessonId } = req.body;

  if (!code || !lessonId) {
    return res.status(400).json({ error: "Missing required fields: code or lessonId." });
  }

  try {
    // Prompt for OpenAI API
    const prompt = `
      You are an advanced JavaScript teacher. Analyze the following code for correctness and provide:
      - Feedback on syntax or logic issues.
      - Suggestions to improve or fix the code.
      Code:
      ${code}
    `;

    const response = await openai.createCompletion({
      model: "text-davinci-003", // TO DO: research and figure out the model 
      prompt: prompt,
      max_tokens: 200,
    });

    const feedback = response.data.choices[0].text.trim();

    res.status(200).json({
      success: true,
      feedback: feedback,
    });
  } catch (error) {
    console.error("Error generating feedback:", error);
    res.status(500).json({ error: "Failed to generate feedback." });
  }
};

module.exports = { getAdvancedFeedback };
