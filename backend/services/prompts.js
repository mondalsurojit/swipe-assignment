// prompts.js
const generateQuestionPrompt = (difficulty) => `
Generate a single, simple, one-line full-stack development interview question related to React, Next.js, Vite, TailwindCSS, Node.js, or Express.js. Include a concise ideal answer. Focus on topics like hooks, functional/class components, props, state management, Context API, performance optimization, SSR, routing, lazy loading, custom hooks, integration with backend APIs, or common front-end/back-end patterns.

Return the output strictly as JSON with the following keys:
{
  "id": 1,
  "question": "string",
  "answer": "string",
  "level": "easy|medium|hard",
  "time": 60
}

Make sure:
- The question is concise (one line, not multi-step tasks).  
- The answer is brief, clear, and technically accurate.  
- Level is assigned realistically based on the complexity of the question.  
- Time is proportional to difficulty (easy: 60s, medium: 90s, hard: 120s).   
- Do not include extra text or explanations outside the JSON.
`;


const evaluateAnswerPrompt = (question, candidateAnswer, idealAnswer, level) => `
Evaluate the candidate's answer by comparing it to the ideal answer. Consider the difficulty level when scoring.

Instructions:
- Score 0-10 based on accuracy, completeness, clarity, and technical correctness.
- Feedback: concise, constructive, max 50 words.
- Return strictly as JSON:
{
  "score": 0,       // integer 0-10
  "feedback": "string" // concise feedback, max 50 words
}
- Do not include extra text outside JSON.

Question: ${question}
Candidate Answer: ${candidateAnswer}
Ideal Answer (reference): ${idealAnswer}
Difficulty Level: ${level}
`;


const generateFinalSummaryPrompt = (data) => `
Create a brief candidate summary (max 100 words) based on the following data: ${JSON.stringify(data)}.

Instructions:
- Return strictly as JSON:
{
  "summary": "string"  // concise summary, max 100 words
}
- Do not include extra text outside JSON.
`;

module.exports = {
  generateQuestionPrompt,
  evaluateAnswerPrompt,
  generateFinalSummaryPrompt
};
