import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { HomeScreen } from './components/screens/HomeScreen';
import { ExploreScreen } from './components/screens/ExploreScreen';
import { LiveScreen } from './components/screens/LiveScreen';
import { MessagesScreen } from './components/screens/MessagesScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { SignUpScreen } from './components/screens/SignUpScreen';
import { ForgotPasswordScreen } from './components/screens/ForgotPasswordScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { FindCoachesScreen } from './components/screens/FindCoachesScreen';
import { CreateCourseScreen } from './components/screens/CreateCourseScreen';
import { CreateLiveSessionScreen } from './components/screens/CreateLiveSessionScreen';
import { CoachRoute } from './components/utility/CoachRoute';
import { Crown } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

const SplashScreen: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-primary text-white">
        <Crown size={80} className="animate-pulse" />
        <h1 className="text-4xl font-bold mt-4">ChessMaster Academy</h1>
        <p className="mt-2 text-lg">Learn from the best.</p>
    </div>
);

const AppRouter: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      {!currentUser ? (
        <>
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<HomeScreen />} />
            <Route path="explore" element={<ExploreScreen />} />
            <Route path="find-coaches" element={<FindCoachesScreen />} />
            <Route path="live" element={<LiveScreen />} />
            <Route path="messages" element={<MessagesScreen />} />
            <Route path="chat/:receiverId" element={<ChatScreen />} />
            <Route path="profile/:userId" element={<ProfileScreen />} />
            <Route path="profile" element={<Navigate to={`/profile/${currentUser.id}`} replace />} />
            
            {/* Coach Only Routes */}
            <Route path="create-course" element={
                <CoachRoute>
                    <CreateCourseScreen />
                </CoachRoute>
            } />
             <Route path="create-live-session" element={
                <CoachRoute>
                    <CreateLiveSessionScreen />
                </CoachRoute>
            } />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
          {/* Redirect auth routes to home if logged in */}
          <Route path="/login" element={<Navigate to="/home" replace />} />
          <Route path="/signup" element={<Navigate to="/home" replace />} />
          <Route path="/welcome" element={<Navigate to="/home" replace />} />
        </>
      )}
    </Routes>
  );
};


const App: React.FC = () => {
    return (
        <HashRouter>
            <AuthProvider>
                <AppRouter />
            </AuthProvider>
        </HashRouter>
    );
}

export default App;