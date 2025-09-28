const { GoogleGenAI, Type } = require("@google/genai");
const fs = require("fs");
const path = require("path");
const {
  generateQuestionPrompt,
  evaluateAnswerPrompt,
  generateFinalSummaryPrompt
} = require("./prompts");

// Load fallback questions
const fallbackQuestions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/fallbackQuestions.json"), "utf-8")
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to extract candidate text safely
function getCandidateText(response) {
  try {
    return response.candidates[0].content.parts[0].text;
  } catch {
    return null;
  }
}

// Helper to strip markdown ```json or ``` if present
function cleanMarkdown(text) {
  return text ? text.replace(/```json|```/g, '').trim() : text;
}

exports.generateQuestion = async (difficulty, questionNumber) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ type: "text", text: generateQuestionPrompt(difficulty) }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER },
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          level: { type: Type.STRING },
          time: { type: Type.INTEGER }
        },
        required: ["id", "question", "answer", "level", "time"]
      }
    });

    // Log full response
    console.log("Full Gemini raw response (generateQuestion):", JSON.stringify(response, null, 2));

    // Extract and clean candidate text
    const candidateText = cleanMarkdown(getCandidateText(response));
    console.log("Gemini candidate text (generateQuestion):", candidateText);

    let questionData;
    try {
      questionData = JSON.parse(candidateText);
    } catch {
      const questionsByLevel = fallbackQuestions.filter((q) => q.level === difficulty);
      questionData = questionsByLevel[Math.floor(Math.random() * questionsByLevel.length)] || {
        id: questionNumber,
        question: "No question available",
        answer: "N/A",
        level: difficulty,
        time: 60
      };
    }

    return questionData;
  } catch (err) {
    console.error("Gemini API error (generateQuestion):", err);
    const questionsByLevel = fallbackQuestions.filter((q) => q.level === difficulty);
    return questionsByLevel[Math.floor(Math.random() * questionsByLevel.length)] || {
      id: questionNumber,
      question: "No question available",
      answer: "N/A",
      level: difficulty,
      time: 60
    };
  }
};

exports.evaluateAnswer = async (questionObj, candidateAnswer) => {
  // Add detailed logging to debug the issue
  console.log("evaluateAnswer called with:");
  console.log("questionObj:", JSON.stringify(questionObj, null, 2));
  console.log("candidateAnswer:", candidateAnswer);
  
  // Add validation to ensure questionObj has required properties
  if (!questionObj) {
    console.error("questionObj is null or undefined");
    return {
      score: 0,
      feedback: "Error: Question object is missing. Cannot evaluate answer."
    };
  }
  
  if (!questionObj.question) {
    console.error("questionObj.question is missing:", questionObj);
    return {
      score: 0,
      feedback: "Error: Question text is missing. Cannot evaluate answer."
    };
  }
  
  if (!questionObj.answer) {
    console.error("questionObj.answer is missing:", questionObj);
    return {
      score: 0,
      feedback: "Error: Ideal answer is missing. Cannot evaluate answer."
    };
  }

  // Add validation for candidateAnswer
  if (!candidateAnswer || candidateAnswer.trim() === "") {
    return {
      score: 0,
      feedback: "No answer provided."
    };
  }

  const { question, answer: idealAnswer, level } = questionObj;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ type: "text", text: evaluateAnswerPrompt(question, candidateAnswer, idealAnswer, level) }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          feedback: { type: Type.STRING }
        },
        required: ["score", "feedback"]
      }
    });

    console.log("Full Gemini raw response (evaluateAnswer):", JSON.stringify(response, null, 2));

    const candidateText = cleanMarkdown(getCandidateText(response));
    console.log("Gemini candidate text (evaluateAnswer):", candidateText);

    let evalData;
    try {
      evalData = JSON.parse(candidateText);
      // Ensure score is within valid range
      if (evalData.score < 0 || evalData.score > 10) {
        evalData.score = Math.max(0, Math.min(10, evalData.score));
      }
    } catch {
      const baseScore = candidateAnswer.length > 50 ? 6 : 3;
      evalData = {
        score: Math.min(10, baseScore + Math.floor(Math.random() * 3)),
        feedback: "Answer evaluated. Provide more technical details."
      };
    }

    return evalData;
  } catch (err) {
    console.error("Gemini API error (evaluateAnswer):", err);
    const baseScore = candidateAnswer.length > 50 ? 6 : 3;
    return {
      score: Math.min(10, baseScore + Math.floor(Math.random() * 3)),
      feedback: "Answer evaluated. Provide more technical details."
    };
  }
};

exports.generateFinalSummary = async (questions, answers, scores) => {
  const data = questions.map((q, i) => ({
    question: q.question,
    answer: answers[i],
    score: scores[i]
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ type: "text", text: generateFinalSummaryPrompt(data) }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING }
        },
        required: ["summary"]
      }
    });

    const candidateText = cleanMarkdown(getCandidateText(response));
    console.log("Gemini summary text:", candidateText);

    let summaryText;
    try {
      const parsedResponse = JSON.parse(candidateText);
      summaryText = parsedResponse.summary;
    } catch {
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      summaryText = `Candidate completed interview with average score ${avgScore.toFixed(1)}/10.`;
    }

    return summaryText;
  } catch (err) {
    console.error("Gemini API error (generateFinalSummary):", err);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    return `Candidate completed interview with average score ${avgScore.toFixed(1)}/10.`;
  }
};