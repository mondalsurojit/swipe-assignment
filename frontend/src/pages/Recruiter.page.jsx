import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Typography, Divider } from 'antd';
import { DashboardOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph } = Typography;

const RecruiterPage = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    const success = await signInWithGoogle('interviewer');
    if (success) {
      navigate('/recruiter/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <Title level={2}>Recruiter Login</Title>
        <Paragraph className="text-gray-600">
          Sign in to access the interviewer dashboard
        </Paragraph>
        
        <Divider />
        
        <Button 
          size="large" 
          block
          icon={<DashboardOutlined />}
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>
      </Card>
    </div>
  );
};

export default RecruiterPage;