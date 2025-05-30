# TaskMaster

TaskMaster is a full-stack project management application that helps users organize tasks, track progress, and manage projects efficiently. It features an AI assistant powered by Google's Gemini API to provide project insights and suggestions.

## Features

- **Project Management**: Create, edit, and delete projects
- **Task Tracking**: Add tasks with priorities, due dates, and completion status
- **AI Assistant**: Get AI-generated summaries, insights, and suggestions for your projects
- **AI Chat**: Interact with an AI assistant to get help with your projects
- **User Authentication**: Secure login and registration system

## Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Tailwind CSS for styling
- Shadcn UI components
- Zustand for state management

### Backend
- Node.js with Express
- PostgreSQL database
- Google Gemini API for AI features
- JWT for authentication

## Project Structure

- **client/**: Frontend React application
  - **src/**: Source code
    - **components/**: UI components
    - **stores/**: Zustand state management
    - **pages/**: Application pages
    - **hooks/**: Custom React hooks
    - **lib/**: Utility functions

- **server/**: Backend Node.js application
  - **src/**: Source code
    - **controllers/**: Request handlers
    - **models/**: Database models
    - **routes/**: API routes
    - **services/**: Gemini Service
    - **middleware/**: Express middleware

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Google Gemini API key

### Backend Setup
1. Navigate to the server directory
2. Install dependencies with `npm install`
3. Create a `.env` file with your environment variables:
   ```
   PORT=5000
   DATABASE_URL=postgres://username:password@localhost:5432/taskmaster
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Set up the PostgreSQL database using the scripts in `server/ddl-schema`

### Frontend Setup
1. Navigate to the client directory
2. Install dependencies with `npm install`
3. Create a `.env` file with:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Running the Application

1. Start the backend server:
   ```
   cd server/src
   npx nodemon index.js
   ```

2. Start the frontend development server:
   ```
   cd client
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## AI Features

TaskMaster includes AI-powered features:

1. **Project Summary**: Get an overview of your project status, completion rate, and task distribution
2. **Insights**: Receive AI-generated insights about your project's progress and potential issues
3. **Suggestions**: Get actionable recommendations to improve your project management
4. **Chat Assistant**: Ask questions about your project and get AI-powered responses
