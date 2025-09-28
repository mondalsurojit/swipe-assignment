// hooks/useInterview.js
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { interviewActions } from '../store';
import ApiService from '../services/api';
import { message } from 'antd';

export const useInterview = () => {
  const dispatch = useDispatch();
  const interview = useSelector(state => state.interview);
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);

  const uploadResume = async (file) => {
    try {
      setLoading(true);
      const result = await ApiService.uploadResume(file);
      
      const extractedInfo = result.userInfo;
      dispatch(interviewActions.setUserInfo(extractedInfo));
      
      // Check for missing fields
      const missing = [];
      if (!extractedInfo.name) missing.push('name');
      if (!extractedInfo.email) missing.push('email');
      if (!extractedInfo.phone) missing.push('phone');
      
      dispatch(interviewActions.setMissingFields(missing));
      
      if (missing.length > 0) {
        dispatch(interviewActions.addChatMessage({
          type: 'bot',
          message: `I found your resume! However, I need some additional information: ${missing.join(', ')}. Please provide these details to continue.`
        }));
      } else {
        await startInterview(extractedInfo);
      }
      
      message.success('Resume uploaded successfully!');
      return result;
    } catch (error) {
      message.error(error.message || 'Upload failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const startInterview = async (userInfo = interview.userInfo) => {
    try {
      setLoading(true);
      const result = await ApiService.startInterview(user.uid, userInfo);
      
      dispatch(interviewActions.setSessionId(result.sessionId));
      dispatch(interviewActions.setCurrentQuestion(result.question));
      dispatch(interviewActions.setQuestionNumber(result.questionNumber));
      dispatch(interviewActions.setInterviewActive(true));
      // Don't set timer here - let the component set it after UI renders
      
      dispatch(interviewActions.addChatMessage({
        type: 'bot',
        message: 'Great! Let\'s begin the interview. You have 6 questions total: 2 Easy (20s each), 2 Medium (60s each), 2 Hard (120s each).'
      }));
      
      dispatch(interviewActions.addChatMessage({
        type: 'bot',
        message: `Question ${result.questionNumber}/6: ${result.question}`
      }));
      
      // Save session to localStorage
      localStorage.setItem('interviewSession', JSON.stringify({
        sessionId: result.sessionId,
        status: 'active',
        userInfo
      }));
      
      message.success('Interview started!');
      return result;
    } catch (error) {
      message.error(error.message || 'Failed to start interview');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer) => {
    try {
      setLoading(true);
      const result = await ApiService.submitAnswer(interview.sessionId, answer || 'No answer provided');
      
      dispatch(interviewActions.addChatMessage({
        type: 'user',
        message: answer || 'No answer provided'
      }));
      
      dispatch(interviewActions.addChatMessage({
        type: 'bot',
        message: `Score: ${result.evaluation.score}/10 - ${result.evaluation.feedback}`
      }));
      
      if (result.completed) {
        dispatch(interviewActions.setInterviewCompleted(true));
        dispatch(interviewActions.setInterviewActive(false));
        dispatch(interviewActions.setFinalScore(result.finalScore));
        dispatch(interviewActions.setSummary(result.summary));
        
        dispatch(interviewActions.addChatMessage({
          type: 'bot',
          message: `🎉 Interview completed! Final Score: ${result.finalScore.toFixed(1)}/10`
        }));
        
        dispatch(interviewActions.addChatMessage({
          type: 'bot',
          message: `Summary: ${result.summary}`
        }));
        
        localStorage.removeItem('interviewSession');
        message.success('Interview completed!');
      } else {
        dispatch(interviewActions.setCurrentQuestion(result.question));
        dispatch(interviewActions.setQuestionNumber(result.questionNumber));
        dispatch(interviewActions.setAnswer(''));
        
        // Set timer based on difficulty
        let timer = 20;
        if (result.questionNumber > 2 && result.questionNumber <= 4) timer = 60;
        else if (result.questionNumber > 4) timer = 120;
        dispatch(interviewActions.setTimeLeft(timer));
        
        dispatch(interviewActions.addChatMessage({
          type: 'bot',
          message: `Question ${result.questionNumber}/6: ${result.question}`
        }));
      }
      
      return result;
    } catch (error) {
      message.error(error.message || 'Failed to submit answer');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const terminateInterview = async () => {
    try {
      setLoading(true);
      
      if (interview.sessionId) {
        const result = await ApiService.terminateInterview(interview.sessionId);
        dispatch(interviewActions.setFinalScore(result.finalScore));
        dispatch(interviewActions.setSummary(result.summary));
      }
      
      // Update Redux state to terminate interview
      dispatch(interviewActions.setInterviewActive(false));
      dispatch(interviewActions.setInterviewCompleted(true));
      dispatch(interviewActions.setTerminated(true));
      
      // Clear session data
      localStorage.removeItem('interviewSession');
      
      dispatch(interviewActions.addChatMessage({
        type: 'bot',
        message: 'Interview has been terminated.'
      }));
      
      message.info('Interview terminated successfully');
    } catch (error) {
      // Even if API call fails, terminate the interview locally
      dispatch(interviewActions.setInterviewActive(false));
      dispatch(interviewActions.setInterviewCompleted(true));
      dispatch(interviewActions.setTerminated(true));
      localStorage.removeItem('interviewSession');
      
      message.info('Interview terminated successfully');
    } finally {
      setLoading(false);
    }
  };

  const updateUserInfo = async (info) => {
    try {
      dispatch(interviewActions.setUserInfo(info));
      
      if (interview.sessionId) {
        await ApiService.updateUserInfo(interview.sessionId, info);
      }
      
      // Check if all required fields are filled
      const missing = [];
      if (!info.name) missing.push('name');
      if (!info.email) missing.push('email');
      if (!info.phone) missing.push('phone');
      
      dispatch(interviewActions.setMissingFields(missing));
      
      if (missing.length === 0) {
        await startInterview(info);
      }
    } catch (error) {
      message.error(error.message || 'Failed to update information');
      throw error;
    }
  };

  const restoreSession = async (sessionData) => {
    try {
      const session = await ApiService.getSession(sessionData.sessionId);
      // Restore session state based on API response
      // Implementation depends on your session restoration logic
    } catch (error) {
      message.error('Failed to restore session');
      localStorage.removeItem('interviewSession');
    }
  };

  return {
    ...interview,
    loading,
    uploadResume,
    startInterview,
    submitAnswer,
    updateUserInfo,
    restoreSession,
    terminateInterview
  };
};