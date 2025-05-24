require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generalizeError = (error) => {
    const e = error.toLowerCase();
    if (e.includes("is not defined")) return "Undefined variable";
    if (e.includes("missing semicolon")) return "Missing semicolon";
    if (e.includes("unexpected token")) return "Unexpected token";
    if (e.includes("unclosed") || e.includes("unmatched")) return "Unclosed tag or bracket";
    if (e.includes("unterminated string")) return "Unterminated string";
    if (e.includes("unknown")) return null;
    return error;
};

const getRecommendation = async (req, res) => {
    try {
        const rawPredictedErrors = req.body.predictedErrors || [];

        const generalErrors = rawPredictedErrors
            .map(generalizeError)
            .filter(e => e);

        if (generalErrors.length === 0) {
            return res.status(400).json({ error: 'No valid errors for recommendation' });
        }

        const prompt = `The system predicts these general types of coding errors: ${generalErrors.join(", ")}.
Give one short, user-friendly recommendation for each type of error and how to prevent those errors.
Explain it like a teacher would to a beginner student. Do not include any variable names or code unless necessary.`;

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 200,
        });

        res.json({ recommendation: response.choices[0].message.content });
    } catch (error) {
        console.error("OpenAI API Error:", error);
        res.status(500).json({ error: "Failed to generate recommendation" });
    }
};

module.exports = { getRecommendation };
