import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Typography, Divider, Space, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph } = Typography;

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { validateReferral, signInWithGoogle, isReferralValid } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReferralValidation = async () => {
    if (!referralCode.trim()) {
      message.error('Please enter a referral code');
      return;
    }
    
    setLoading(true);
    const isValid = await validateReferral(referralCode);
    setLoading(false);
    
    if (!isValid) {
      message.error('Invalid referral code');
    }
  };

  const handleGoogleSignIn = async () => {
    const success = await signInWithGoogle('candidate');
    if (success) {
      navigate('/assessment/interview');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <Title level={2}>Candidate Assessment</Title>
        <Paragraph className="text-gray-600">
          Enter your referral code to begin the assessment
        </Paragraph>
        
        <Divider />
        
        <Space direction="vertical" size="large" className="w-full">
          <div>
            <Input
              size="large"
              placeholder="Enter referral code (try: SWIPE2024)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              onPressEnter={handleReferralValidation}
            />
            <Button 
              type="primary" 
              block
              className="mt-2"
              onClick={handleReferralValidation}
              loading={loading}
            >
              Validate Code
            </Button>
          </div>
          
          <Button 
            size="large" 
            block
            icon={<UserOutlined />}
            onClick={handleGoogleSignIn}
            disabled={!isReferralValid}
          >
            Login with Google
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default AssessmentPage;