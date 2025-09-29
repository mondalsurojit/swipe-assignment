import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Table, Badge, Progress, Select, Space, Typography, Avatar, Divider, Spin, Tabs, Modal, Dropdown, message } from 'antd';
import { UserOutlined, SearchOutlined, StarOutlined, DashboardOutlined, FileTextOutlined, EyeOutlined, FolderOpenOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { user, signOutUser } = useAuth();
  const {
    candidates,
    selectedCandidate,
    searchTerm,
    sortBy,
    sortOrder,
    loading,
    setSearchTerm,
    setSortBy,
    setSortOrder,
    setSelectedCandidate,
    getCandidateDetails
  } = useDashboard();

  const [resumePreviewOpen, setResumePreviewOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const getDifficultyBadge = (qNum) => {
    if (qNum <= 2) return <Badge color="green" text="Easy" />;
    if (qNum <= 4) return <Badge color="orange" text="Medium" />;
    return <Badge color="red" text="Hard" />;
  };

  const handleCandidateClick = async (candidate) => {
    try {
      await getCandidateDetails(candidate.sessionId);
    } catch (error) {
      console.error('Error loading candidate details:', error);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/');
  };

  const handleResumePreview = (resumePath) => {
    const fullUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/resume/${resumePath}`;
    setResumeUrl(fullUrl);
    setResumePreviewOpen(true);
  };

  const handleDeleteInterview = async (sessionId) => {
    Modal.confirm({
      title: 'Delete Interview',
      content: 'Are you sure you want to delete this interview? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeletingId(sessionId);
          // Call your API to delete the interview
          // await ApiService.deleteCandidate(sessionId);
          message.success('Interview deleted successfully');
          // Refresh the candidates list
          // fetchCandidates();
        } catch (error) {
          message.error('Failed to delete interview');
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const getActionMenuItems = (record) => [
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => handleDeleteInterview(record.sessionId)
    }
  ];

  // Helper function to safely get question text
  const getQuestionText = (question) => {
    if (typeof question === 'string') {
      return question;
    }
    if (typeof question === 'object' && question?.question) {
      return question.question;
    }
    return 'Question not available';
  };

  const DashboardContent = () => {
    if (selectedCandidate) {
      console.log('Selected candidate data:', selectedCandidate);
      
      return (
        <div>
          <Button 
            className="mb-5"
            onClick={() => setSelectedCandidate(null)}
          >
            ← Back to Dashboard
          </Button>
          
          <Card>
            <div className="flex justify-between items-center mb-6">
              <div>
                <Title level={3}>{selectedCandidate.name || 'Unknown Candidate'}</Title>
                <Text type="secondary">{selectedCandidate.email}</Text>
                <br />
                <Text type="secondary">{selectedCandidate.phone}</Text>
                {selectedCandidate.resumePath && (
                  <div className="mt-2">
                    <Button 
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => handleResumePreview(selectedCandidate.resumePath)}
                    >
                      View Resume
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className={`text-3xl font-bold ${
                  selectedCandidate.finalScore >= 7 ? 'text-green-500' : 
                  selectedCandidate.finalScore >= 5 ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {selectedCandidate.finalScore?.toFixed(1) || 'N/A'}/10
                </div>
                <Text type="secondary">Final Score</Text>
                {selectedCandidate.terminated && (
                  <div className="mt-2">
                    <Badge color="red" text="Terminated" />
                  </div>
                )}
              </div>
            </div>

            <Divider />

            <div className="mb-6">
              <Title level={4}>Summary</Title>
              <Paragraph>{selectedCandidate.summary || 'No summary available'}</Paragraph>
            </div>

            <Title level={4}>Interview Details</Title>
            
            {selectedCandidate.questions && selectedCandidate.questions.length > 0 ? (
              selectedCandidate.questions.map((question, index) => (
                <Card key={index} className="mb-4" size="small">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Text strong>Question {index + 1}/{selectedCandidate.questions.length}</Text>
                        {getDifficultyBadge(index + 1)}
                      </div>
                      <Paragraph>{getQuestionText(question)}</Paragraph>
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <div className={`text-xl font-bold ${
                        selectedCandidate.scores?.[index] >= 7 ? 'text-green-500' : 
                        selectedCandidate.scores?.[index] >= 5 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {selectedCandidate.scores?.[index]?.toFixed ? 
                          selectedCandidate.scores[index].toFixed(1) : 
                          selectedCandidate.scores?.[index] || 'N/A'}/10
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-md mb-2">
                    <Text strong>Answer:</Text>
                    <Paragraph className="mt-1 mb-0">
                      {selectedCandidate.answers?.[index] || 'No answer provided'}
                    </Paragraph>
                  </div>
                  
                  {selectedCandidate.evaluations?.[index] && (
                    <div className="bg-orange-50 p-2 rounded">
                      <Text type="secondary">
                        <StarOutlined /> {selectedCandidate.evaluations[index].feedback || 'No feedback available'}
                      </Text>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Text type="secondary">No interview questions available</Text>
              </div>
            )}
          </Card>
        </div>
      );
    }

    return (
      <Card>
        <div className="mb-5 flex gap-4 items-center">
          <Input
            placeholder="Search candidates..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72"
          />
          
          <Select
            value={sortBy}
            onChange={setSortBy}
            className="w-36"
          >
            <Option value="finalScore">Final Score</Option>
            <Option value="completedAt">Date</Option>
            <Option value="name">Name</Option>
          </Select>
          
          <Select
            value={sortOrder}
            onChange={setSortOrder}
            className="w-28"
          >
            <Option value="desc">Descending</Option>
            <Option value="asc">Ascending</Option>
          </Select>
        </div>

        <Table
          dataSource={candidates}
          rowKey="sessionId"
          loading={false}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: 'Candidate',
              dataIndex: 'name',
              key: 'name',
              render: (name, record) => (
                <div>
                  <div className="font-bold">{name || 'Unknown'}</div>
                  <div className="text-xs text-gray-600">{record.email}</div>
                  {record.resumePath && (
                    <FileTextOutlined className="text-blue-500 mt-1" />
                  )}
                  {record.terminated && (
                    <Badge color="red" text="Terminated" className="mt-1" />
                  )}
                </div>
              )
            },
            {
              title: 'Score',
              dataIndex: 'finalScore',
              key: 'finalScore',
              render: (score) => (
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    score >= 7 ? 'text-green-500' : 
                    score >= 5 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {score?.toFixed ? score.toFixed(1) : score || 'N/A'}
                  </div>
                  <Progress
                    percent={score ? score * 10 : 0}
                    strokeColor={score >= 7 ? '#52c41a' : score >= 5 ? '#faad14' : '#f5222d'}
                    showInfo={false}
                    size="small"
                  />
                </div>
              )
            },
            {
              title: 'Completed',
              dataIndex: 'completedAt',
              key: 'completedAt',
              render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
            },
            {
              title: 'View Details',
              key: 'viewDetails',
              align: 'center',
              render: (_, record) => (
                <Button 
                  type="link"
                  icon={<FolderOpenOutlined style={{ fontSize: '18px' }} />}
                  onClick={() => handleCandidateClick(record)}
                />
              )
            },
            {
              title: 'Actions',
              key: 'actions',
              align: 'center',
              render: (_, record) => (
                <Dropdown
                  menu={{ items: getActionMenuItems(record) }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined style={{ fontSize: '18px' }} />}
                    loading={deletingId === record.sessionId}
                  />
                </Dropdown>
              )
            }
          ]}
        />
      </Card>
    );
  };

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
          activeKey="interviewer"
          items={[
            {
              key: 'interviewer',
              label: (
                <span>
                  <DashboardOutlined />
                  Interviewer Dashboard
                </span>
              ),
              children: DashboardContent()
            }
          ]}
        />
      </div>

      <Modal
        title="Resume Preview"
        open={resumePreviewOpen}
        onCancel={() => setResumePreviewOpen(false)}
        footer={null}
        width={800}
        bodyStyle={{ height: '600px', padding: 0 }}
      >
        {resumeUrl && (
          <iframe
            src={resumeUrl}
            className="w-full h-full border-0"
            title="Resume Preview"
          />
        )}
      </Modal>
    </div>
  );
};

export default RecruiterDashboard;