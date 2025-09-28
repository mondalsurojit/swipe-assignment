const { generateQuestion, evaluateAnswer, generateFinalSummary } = require('../services/generativeAI');
const { sessions, candidates } = require('./candidateController');

exports.startInterview = async (req, res) => {
  const { candidateId, userInfo } = req.body;
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const firstQ = await generateQuestion('easy', 1);
    const session = { 
      sessionId, 
      candidateId, 
      userInfo, 
      currentQuestion: 1, 
      questions: [firstQ], // Store complete question object
      answers: [], 
      scores: [], 
      evaluations: [], 
      startTime: new Date(), 
      status: 'active', 
      currentDifficulty: 'easy', 
      terminated: false 
    };
    
    sessions.push(session);
    res.json({ sessionId, question: firstQ.question, questionNumber: 1 });
  } catch (error) {
    console.error('Error starting interview:', error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId, answer } = req.body;
    const session = sessions.find(s => s.sessionId === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const idx = session.currentQuestion - 1;
    const currentQuestionObj = session.questions[idx];
    
    // Pass the complete question object, not just the question string
    const evalRes = await evaluateAnswer(currentQuestionObj, answer);
    
    session.answers.push(answer);
    session.scores.push(evalRes.score);
    session.evaluations.push(evalRes);

    // Check if interview is complete (6 questions total)
    if (session.currentQuestion >= 6) {
      const summary = await generateFinalSummary(session.questions, session.answers, session.scores);
      session.status = 'completed';
      session.terminated = false;
      session.finalScore = session.scores.reduce((a, b) => a + b, 0) / session.scores.length;
      session.summary = summary;
      session.endTime = new Date();
      
      // Add to candidates
      candidates.push({ 
        ...session.userInfo, 
        sessionId, 
        finalScore: session.finalScore, 
        summary, 
        questions: session.questions, 
        answers: session.answers, 
        scores: session.scores, 
        evaluations: session.evaluations, 
        completedAt: new Date(), 
        terminated: false 
      });
      
      return res.json({ 
        completed: true, 
        finalScore: session.finalScore, 
        summary, 
        evaluation: evalRes 
      });
    }

    // Move to next question
    session.currentQuestion++;
    const difficulty = session.currentQuestion > 4 ? 'hard' : session.currentQuestion > 2 ? 'medium' : 'easy';
    session.currentDifficulty = difficulty;
    
    const nextQ = await generateQuestion(difficulty, session.currentQuestion);
    session.questions.push(nextQ); // Store complete question object
    
    res.json({ 
      completed: false, 
      question: nextQ.question, // Return only the question text to frontend
      questionNumber: session.currentQuestion, 
      evaluation: evalRes 
    });
    
  } catch (err) { 
    console.error('Error submitting answer:', err);
    res.status(500).json({ error: err.message }); 
  }
};

exports.terminateInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = sessions.find(s => s.sessionId === sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.status = 'completed';
    session.terminated = true; 
    session.endTime = new Date();
    session.finalScore = session.scores.length
      ? session.scores.reduce((a, b) => a + b, 0) / session.scores.length
      : 0;
    
    // Generate summary for terminated interview if there are any answers
    if (session.answers.length > 0 && session.questions.length > 0) {
      try {
        session.summary = await generateFinalSummary(
          session.questions.slice(0, session.answers.length), 
          session.answers, 
          session.scores
        );
      } catch (error) {
        console.error('Error generating summary for terminated interview:', error);
        session.summary = "Interview terminated early.";
      }
    } else {
      session.summary = "Interview terminated early.";
    }

    // Add to candidates
    candidates.push({
      ...session.userInfo,
      sessionId,
      finalScore: session.finalScore,
      summary: session.summary,
      questions: session.questions,
      answers: session.answers,
      scores: session.scores,
      evaluations: session.evaluations,
      completedAt: new Date(),
      terminated: true
    });

    res.json({ 
      terminated: true, 
      finalScore: session.finalScore, 
      summary: session.summary 
    });
  } catch (error) {
    console.error('Error terminating interview:', error);
    res.status(500).json({ error: 'Failed to terminate interview' });
  }
};