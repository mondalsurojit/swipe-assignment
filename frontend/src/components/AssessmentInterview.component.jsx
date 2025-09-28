import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Upload, Modal, Badge, Progress, Spin, Space, Typography, Form, Alert, Avatar, Tabs, message } from 'antd';
import { UploadOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, FileTextOutlined, MessageOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useInterview } from '../hooks/useInterview';
import { useDispatch } from 'react-redux';
import { interviewActions } from '../store';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import successAnimation from "../assets/success.lottie";
import failedAnimation from "../assets/failed.lottie";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const AssessmentInterview = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, signOutUser } = useAuth();
  const { sessionId, userInfo, currentQuestion, questionNumber, isInterviewActive, interviewCompleted, finalScore, summary, chatHistory, missingFields, terminated, loading, uploadResume, submitAnswer, updateUserInfo, terminateInterview } = useInterview();

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNextQuestionLoader, setShowNextQuestionLoader] = useState(false);
  const [timerInitialized, setTimerInitialized] = useState(false);

  const timerRef = useRef(null);
  const visibilityRef = useRef(null);
  const chatEndRef = useRef(null);

  // Get timer duration based on question number
  const getTimerDuration = useCallback((qNum) => {
    if (qNum <= 2) return 20; // Easy: 20 seconds
    if (qNum <= 4) return 60; // Medium: 60 seconds
    return 120; // Hard: 120 seconds
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && isInterviewActive) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isInterviewActive && currentQuestion && timerInitialized) {
      // Auto-submit only if timer was initialized at least once
      handleAutoSubmit();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, isInterviewActive, currentQuestion, timerInitialized]);

  // Initialize timer when new question loads
  useEffect(() => {
    if (currentQuestion && questionNumber && isInterviewActive) {
      const timerDelay = setTimeout(() => {
        const duration = getTimerDuration(questionNumber);
        setTimeLeft(duration);
        setTimerInitialized(true); // mark as initialized
      }, 2000);

      return () => clearTimeout(timerDelay);
    }
  }, [currentQuestion, questionNumber, isInterviewActive, getTimerDuration]);

  // Full-screen and tab-switch detection
  useEffect(() => {
    if (!isInterviewActive || interviewCompleted) return;

    // Request full-screen when interview starts
    const enterFullScreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } catch (err) {
        console.error('Failed to enter fullscreen:', err);
      }
    };

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden && isInterviewActive) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            message.error('Maximum tab switches reached. Interview terminated.');
            handleForceEndInterview();
          } else {
            message.warning(`Warning ${newCount}/3: Please do not switch tabs during the interview.`);
          }
          return newCount;
        });
      }
    };

    // Exit full-screen on interview end
    const exitFullScreen = () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    };

    enterFullScreen();
    visibilityRef.current = handleVisibilityChange;
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!isInterviewActive) {
        exitFullScreen();
      }
    };
  }, [isInterviewActive, interviewCompleted]);

  // Check for saved session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('interviewSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      if (session.status === 'active') {
        setShowWelcomeBack(true);
      }
    }
  }, []);

  // Auto-scroll chat to bottom when messages change or when submitting (single scroll only)
  useEffect(() => {
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [chatHistory.length, isSubmitting, showNextQuestionLoader]);

  const handleAutoSubmit = async () => {
    await handleSubmitAnswer(currentAnswer || 'No answer provided - Time expired');
  };

  const handleFileUpload = async (file) => {
    try {
      await uploadResume(file);
    } catch (error) {
      // Error handled in hook
    }
    return false;
  };

  const handleSubmitAnswer = async (answerText = currentAnswer) => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);

    try {
      const result = await submitAnswer(answerText || '');
      setCurrentAnswer('');

      // Only show next question loading if the next question isn't immediately available
      if (!result?.question) {
        setShowNextQuestionLoader(true);
        setTimeout(() => setShowNextQuestionLoader(false), 2000);
      }
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMissingInfoSubmit = async (values) => {
    await updateUserInfo({ ...userInfo, ...values });
  };

  const handleManualEnd = () => {
    setShowEndConfirm(true);
  };

  const handleConfirmEnd = async () => {
    setShowEndConfirm(false);
    await terminateInterview();
    // Exit fullscreen after terminating interview
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleForceEndInterview = async () => {
    dispatch(interviewActions.setTerminated(true));
    await terminateInterview();
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  const getTimerColor = () => {
    const percentage = timeLeft / getTimerDuration(questionNumber);
    if (percentage > 0.5) return '#52c41a';
    if (percentage > 0.25) return '#faad14';
    return '#f5222d';
  };

  const getDifficultyBadge = (qNum) => {
    if (qNum <= 2) return <Badge color="green" text="Easy" />;
    if (qNum <= 4) return <Badge color="orange" text="Medium" />;
    return <Badge color="red" text="Hard" />;
  };

  // Typing animation components
  const NextQuestionLoader = () => (
    <div className="flex justify-start items-center">
      <div className="mr-3 mt-1 flex-shrink-0 rounded-full bg-blue-100 p-2 border border-blue-200">
        <MessageOutlined className="text-blue-600 text-sm" />
      </div>
      <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md text-sm border border-gray-200 shadow-sm">
        <div className="flex space-x-1 items-center">
          <span className="text-gray-600 mr-2">Preparing next question</span>
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
          <div
            className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );

  if (loading && !isSubmitting) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const IntervieweeContent = () => (
    <>
      <Modal
        title="Welcome Back!"
        open={showWelcomeBack}
        onOk={() => setShowWelcomeBack(false)}
        onCancel={() => {
          setShowWelcomeBack(false);
          localStorage.removeItem('interviewSession');
        }}
      >
        <p>You have an unfinished interview session. Would you like to continue?</p>
      </Modal>

      <Modal
        title="End Interview?"
        open={showEndConfirm}
        onOk={handleConfirmEnd}
        onCancel={() => setShowEndConfirm(false)}
        okText="Yes, End Interview"
        cancelText="Continue"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to end the interview early? This action cannot be undone.</p>
      </Modal>

      {!sessionId && missingFields.length === 0 && (
        <div className="text-center py-10">
          <FileTextOutlined className="text-5xl text-blue-500 mb-4" />
          <Title level={4}>Upload Your Resume</Title>
          <Paragraph>Please upload your resume (PDF or DOCX) to begin the interview process.</Paragraph>

          <Upload
            accept=".pdf,.docx"
            beforeUpload={handleFileUpload}
            showUploadList={false}
          >
            <Button type="primary" size="large" icon={<UploadOutlined />} loading={loading}>
              Upload Resume
            </Button>
          </Upload>
        </div>
      )}

      {missingFields.length > 0 && (
        <div className="p-5">
          <Alert
            message="Missing Information"
            description="Please provide the following details to continue:"
            type="warning"
            showIcon
            className="mb-5"
          />

          <Form layout="vertical" onFinish={handleMissingInfoSubmit} initialValues={userInfo}>
            {missingFields.includes('name') && (
              <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Please enter your name' }]}>
                <Input placeholder="Enter your full name" />
              </Form.Item>
            )}

            {missingFields.includes('email') && (
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                <Input placeholder="Enter your email" />
              </Form.Item>
            )}

            {missingFields.includes('phone') && (
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true, message: 'Please enter your phone number' }]}>
                <Input placeholder="Enter your phone number" />
              </Form.Item>
            )}

            <Button type="primary" htmlType="submit" loading={loading}>
              Start Interview
            </Button>
          </Form>
        </div>
      )}

      {(sessionId || chatHistory.length > 0) && (
        <div>
          {isInterviewActive && (
            <>
              <div className="flex justify-between items-center mb-5 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text strong>Question {questionNumber}/6</Text>
                  <div>{getDifficultyBadge(questionNumber)}</div>
                  {tabSwitchCount > 0 && (
                    <div className="mt-2">
                      <Text type="danger">Tab Switches: {tabSwitchCount}/3</Text>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getTimerColor() }}>
                    <ClockCircleOutlined /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <Progress
                    percent={(timeLeft / getTimerDuration(questionNumber)) * 100}
                    strokeColor={getTimerColor()}
                    showInfo={false}
                    size="small"
                  />
                </div>

                <Button
                  danger
                  size="small"
                  onClick={handleManualEnd}
                  icon={<ExclamationCircleOutlined />}
                >
                  End Interview
                </Button>
              </div>
            </>
          )}

          <div className="h-96 overflow-y-auto border border-gray-200 rounded-2xl bg-gray-50 p-4 mb-4">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <MessageOutlined className="text-4xl text-blue-500" />
                <h4 className="font-medium text-gray-700 text-lg">Welcome to your AI Interview!</h4>
                <p className="text-sm text-gray-500 max-w-xs">
                  Your interview session will begin here. All questions and responses will appear in this chat.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.type === 'user'
                      ? 'justify-end'
                      : 'justify-start items-start'
                      }`}
                  >
                    {msg.type === 'bot' && (
                      <div className="mr-3 mt-1 flex-shrink-0 rounded-full bg-blue-100 p-2 border border-blue-200">
                        <MessageOutlined className="text-blue-600 text-sm" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                        ? 'bg-blue-500 text-white border border-blue-400 rounded-br-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}
                    >
                      <div className="whitespace-pre-wrap break-words">
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}

                {isSubmitting && (
                  <div className="flex justify-center py-4">
                    <Spin size="large" />
                  </div>
                )}
                {showNextQuestionLoader && <NextQuestionLoader />}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {isInterviewActive && !interviewCompleted && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <TextArea
                rows={4}
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="mb-3 border-gray-300 rounded-xl focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                style={{ resize: 'none' }}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Text type="secondary" className="text-xs">
                    Characters: {currentAnswer.length}
                  </Text>
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${isSubmitting ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                    <Text type="secondary" className="text-xs">
                      {isSubmitting ? 'Processing...' : 'Ready to submit'}
                    </Text>
                  </div>
                </div>
                <Button
                  type="primary"
                  onClick={() => handleSubmitAnswer()}
                  loading={isSubmitting}
                  disabled={!currentAnswer.trim() || isSubmitting}
                  className="rounded-xl px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                  icon={!isSubmitting && <CheckCircleOutlined />}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                </Button>
              </div>
            </div>
          )}

          {interviewCompleted && (
            <Card className="mt-5 text-center flex justify-center items-center">
              <div className="flex items-center justify-center">
                <DotLottieReact
                  key={terminated ? "failed" : "success"}
                  src={terminated ? failedAnimation : successAnimation}
                  autoplay
                  className={terminated ? "w-40 h-28" : "w-36 h-24"}
                />
              </div>
              <Title level={3}>
                {terminated ? "Interview Terminated" : "Interview Completed!"}
              </Title>
              <div className="text-md mb-4">
                Final Score:{" "}
                <Text
                  strong
                  className={`${finalScore >= 7
                    ? "text-green-500"
                    : finalScore >= 5
                      ? "text-yellow-500"
                      : "text-red-500"
                    }`}
                >
                  {finalScore?.toFixed(1)}/10
                </Text>
              </div>
            </Card>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white px-6 py-4 border-b border-gray-200 fixed top-0 left-0 w-full z-10 flex justify-between items-center">
        <Title level={3} className="m-0">Swipe</Title>
        <Space>
          <Avatar src={user?.photoURL} icon={<UserOutlined />} />
          <Text>{user?.displayName}</Text>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </Space>
      </div>

      <div className="p-6 pt-20">
        <Tabs
          activeKey="interviewee"
          items={[
            {
              key: 'interviewee',
              label: (
                <span>
                  <MessageOutlined />
                  Interviewee
                </span>
              ),
              children: <Card>{IntervieweeContent()}</Card>
            }
          ]}
        />
      </div>
    </div>
  );
};

export default AssessmentInterview;