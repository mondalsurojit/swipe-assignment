import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Spin } from 'antd';
import { store, persistor } from './store';
import { useAuth } from './hooks/useAuth';

// Page components
import HomePage from './pages/Home.page';
import RecruiterPage from './pages/Recruiter.page';
import AssessmentPage from './pages/Assessment.page';
import RecruiterDashboard from './components/RecruiterDashboard.component';
import AssessmentInterview from './components/AssessmentInterview.component';

const ProtectedRoute = ({ children, userType, requiredType }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (userType && userType !== requiredType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user, userType, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="h-full max-w-screen-2xl xl:max-w[1728px] relative overflow-hidden mx-auto bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/recruiter" element={<RecruiterPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />

        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute userType={userType} requiredType="interviewer">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessment/interview"
          element={
            <ProtectedRoute userType={userType} requiredType="candidate">
              <AssessmentInterview />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="flex justify-center items-center min-h-screen">
            <Spin size="large" />
          </div>
        }
        persistor={persistor}
      >
        <AppRoutes />
      </PersistGate>
    </Provider>
  );
};

export default App;