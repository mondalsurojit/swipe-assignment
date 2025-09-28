# AI-Powered Interview Assistant

A full-stack application that provides an AI-powered interview experience with separate interfaces for candidates and interviewers.

## 🚀 Features

- **Candidate Interface**
  - Resume upload (PDF/DOCX) with automatic information extraction
  - AI-generated questions with difficulty progression (Easy → Medium → Hard)
  - Timed responses with automatic submission
  - Real-time scoring and feedback
  - Session persistence and restoration

- **Interviewer Dashboard**
  - Candidate management with scoring overview
  - Detailed interview analysis with Q&A history
  - Search and sorting functionality
  - Real-time synchronization

- **Authentication & Security**
  - Google Firebase authentication
  - Referral code system for candidates
  - Role-based access control

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **Google Gemini AI** for question generation and evaluation
- **Firebase Admin SDK** for authentication
- **Multer** for file uploads
- **PDF-Parse & Mammoth** for document processing

### Frontend
- **React 18** with hooks
- **Redux Toolkit** with Redux Persist for state management
- **Ant Design** for UI components
- **Firebase SDK** for authentication

## 📦 Project Structure

```
ai-interview-assistant/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── firebase-service-account.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.js
│   ├── package.json
│   └── .env
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase project with authentication enabled
- Google Gemini AI API key

### Backend Setup

1. Clone and navigate to backend directory:
```bash
git clone <repo-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Add Firebase service account:
   - Download service account JSON from Firebase Console
   - Save as `firebase-service-account.json` in backend root

5. Start the server:
```bash
npm run dev  # Development
npm start    # Production
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase config
```

4. Start the development server:
```bash
npm start
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... other Firebase config
```

### Firebase Setup

1. Create a Firebase project
2. Enable Authentication with Google provider
3. Generate a service account key
4. Configure security rules as needed

### Gemini AI Setup

1. Get API key from Google AI Studio
2. Add to backend environment variables
3. Configure rate limits and safety settings as needed

## 📊 API Endpoints

### Authentication
- `POST /api/validate-referral` - Validate referral code
- `POST /api/verify-token` - Verify Firebase token

### Interview Management
- `POST /api/upload-resume` - Upload and parse resume
- `POST /api/start-interview` - Start interview session
- `POST /api/submit-answer` - Submit answer and get next question
- `GET /api/session/:id` - Get session details

### Dashboard
- `GET /api/candidates` - Get candidates with filtering
- `GET /api/candidate/:id` - Get detailed candidate info

## 🎯 Usage Flow

### For Candidates
1. Enter referral code (try: `SWIPE2024`, `INTERN123`, or `DEMO2024`)
2. Sign in with Google
3. Upload resume (PDF or DOCX)
4. Complete missing information if needed
5. Answer 6 AI-generated questions with timers
6. View final score and feedback

### For Interviewers
1. Sign in with Google (no referral code needed)
2. View candidate dashboard with scores
3. Search and sort candidates
4. Click on candidates to view detailed interview analysis

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy build/ directory
```

### Backend (Vercel/Railway/Heroku)
```bash
# Add vercel.json for Vercel deployment
# Set environment variables in platform
```

### Docker Deployment
```bash
docker-compose up --build
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Key Features Implementation

### Resume Processing
- Supports PDF and DOCX formats
- Extracts name, email, and phone using regex patterns
- Validates extracted information before proceeding

### AI Integration
- Uses Google Gemini for dynamic question generation
- Implements difficulty progression (Easy: 20s, Medium: 60s, Hard: 120s)
- Provides real-time answer evaluation and feedback

### State Management
- Redux Toolkit for clean state management
- Redux Persist for session restoration
- Optimistic updates for better UX

### Security
- Firebase authentication with role-based access
- Referral code system for candidate access
- Input validation and sanitization

## 🔍 Demo

### Live Demo
- Frontend: [Netlify/Vercel URL]
- Backend: [Railway/Heroku URL]

### Demo Video
[2-5 minute demo video showing key features]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent question generation
- Firebase for authentication and real-time features
- Ant Design for beautiful UI components
- React and Node.js communities for excellent tooling

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Email: [your-email@example.com]
- Demo form: https://forms.gle/Yx5HGCQzHFmHF1wM6