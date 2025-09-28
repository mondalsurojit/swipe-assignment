// hooks/useTimer.js
import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { interviewActions } from '../store';

export const useTimer = (onTimeUp) => {
  const dispatch = useDispatch();
  const { timeLeft, isInterviewActive } = useSelector(state => state.interview);
  const timerRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && isInterviewActive && isRunning) {
      timerRef.current = setTimeout(() => {
        dispatch(interviewActions.setTimeLeft(timeLeft - 1));
      }, 1000);
    } else if (timeLeft === 0 && isInterviewActive && isRunning) {
      onTimeUp();
      setIsRunning(false);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isInterviewActive, isRunning, onTimeUp, dispatch]);

  const startTimer = (duration) => {
    dispatch(interviewActions.setTimeLeft(duration));
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    }
  };

  return {
    timeLeft,
    isRunning,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer
  };
};

// Enhanced Interview Component with Timer
import React, { useState, useCallback } from 'react';
import { useInterview } from './hooks/useInterview';
import { useTimer } from './hooks/useTimer';

const EnhancedIntervieweeTab = () => {
  const {
    sessionId,
    currentQuestion,
    questionNumber,
    isInterviewActive,
    submitAnswer,
    // ... other interview state
  } = useInterview();

  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleTimeUp = useCallback(async () => {
    await submitAnswer(currentAnswer || 'No answer provided due to timeout');
    setCurrentAnswer('');
  }, [currentAnswer, submitAnswer]);

  const {
    timeLeft,
    isRunning,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer
  } = useTimer(handleTimeUp);

  const handleSubmitAnswer = async () => {
    stopTimer();
    await submitAnswer(currentAnswer);
    setCurrentAnswer('');
  };

  const getTimerDuration = (qNum) => {
    if (qNum <= 2) return 20; // Easy: 20 seconds
    if (qNum <= 4) return 60; // Medium: 60 seconds
    return 120; // Hard: 120 seconds
  };

  // Start timer when new question arrives
  React.useEffect(() => {
    if (currentQuestion && isInterviewActive) {
      const duration = getTimerDuration(questionNumber);
      startTimer(duration);
    }
  }, [currentQuestion, questionNumber, isInterviewActive, startTimer]);

  const getTimerColor = () => {
    const percentage = timeLeft / getTimerDuration(questionNumber);
    if (percentage > 0.5) return '#52c41a';
    if (percentage > 0.25) return '#faad14';
    return '#f5222d';
  };

  return (
    // ... existing JSX with timer display
    <div>
      {isInterviewActive && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '16px',
          backgroundColor: getTimerColor(),
          color: 'white',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <ClockCircleOutlined style={{ marginRight: '8px' }} />
          <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}
      {/* ... rest of component */}
    </div>
  );
};