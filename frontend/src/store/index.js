// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';

// Auth Slice
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    userType: null,
    isAuthenticated: false,
    referralCode: '',
    isReferralValid: false
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    setReferralCode: (state, action) => {
      state.referralCode = action.payload;
    },
    setReferralValid: (state, action) => {
      state.isReferralValid = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.userType = null;
      state.isAuthenticated = false;
      state.referralCode = '';
      state.isReferralValid = false;
    }
  }
});

// Interview Slice
const interviewSlice = createSlice({
  name: 'interview',
  initialState: {
    sessionId: null,
    userInfo: { name: '', email: '', phone: '' },
    currentQuestion: '',
    questionNumber: 0,
    answer: '',
    timeLeft: 0,
    isInterviewActive: false,
    interviewCompleted: false,
    finalScore: 0,
    summary: '',
    chatHistory: [],
    missingFields: [],
    terminated: false
  },
  reducers: {
    setSessionId: (state, action) => {
      state.sessionId = action.payload;
    },
    setUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestion = action.payload;
    },
    setQuestionNumber: (state, action) => {
      state.questionNumber = action.payload;
    },
    setAnswer: (state, action) => {
      state.answer = action.payload;
    },
    setTimeLeft: (state, action) => {
      state.timeLeft = action.payload;
    },
    setInterviewActive: (state, action) => {
      state.isInterviewActive = action.payload;
    },
    setInterviewCompleted: (state, action) => {
      state.interviewCompleted = action.payload;
    },
    setFinalScore: (state, action) => {
      state.finalScore = action.payload;
    },
    setSummary: (state, action) => {
      state.summary = action.payload;
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    setChatHistory: (state, action) => {
      state.chatHistory = action.payload;
    },
    setMissingFields: (state, action) => {
      state.missingFields = action.payload;
    },
    setTerminated: (state, action) => {
      state.terminated = action.payload;
    },
    resetInterview: (state) => {
      state.sessionId = null;
      state.currentQuestion = '';
      state.questionNumber = 0;
      state.answer = '';
      state.timeLeft = 0;
      state.isInterviewActive = false;
      state.interviewCompleted = false;
      state.finalScore = 0;
      state.summary = '';
      state.chatHistory = [];
      state.missingFields = [];
      state.terminated = false;
    }
  }
});

// Dashboard Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    candidates: [],
    selectedCandidate: null,
    searchTerm: '',
    sortBy: 'finalScore',
    sortOrder: 'desc',
    loading: false
  },
  reducers: {
    setCandidates: (state, action) => {
      state.candidates = action.payload;
    },
    setSelectedCandidate: (state, action) => {
      state.selectedCandidate = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  interview: interviewSlice.reducer,
  dashboard: dashboardSlice.reducer
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'interview'] // Only persist auth and interview state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export const persistor = persistStore(store);

// Export actions
export const authActions = authSlice.actions;
export const interviewActions = interviewSlice.actions;
export const dashboardActions = dashboardSlice.actions;

export default store;