import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography } from 'antd';
import { UserOutlined, DashboardOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <Title level={2}>AI Interview Assistant</Title>
        <Paragraph className="text-gray-600 mb-8">
          Choose your role to continue
        </Paragraph>
        
        <Space direction="vertical" size="large" className="w-full">
          <Button 
            type="primary" 
            size="large" 
            block
            icon={<DashboardOutlined />}
            onClick={() => navigate('/recruiter')}
          >
            I am Recruiter
          </Button>
          
          <Button 
            size="large" 
            block
            icon={<UserOutlined />}
            onClick={() => navigate('/assessment')}
          >
            I am here to take Assessment
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default HomePage;