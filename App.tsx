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
import { PlayScreen } from './components/screens/PlayScreen';
import { PlayOnlineLobbyScreen } from './components/screens/PlayOnlineLobbyScreen';
import { PlayComputerScreen } from './components/screens/PlayComputerScreen';
import { AnalysisScreen } from './components/screens/AnalysisScreen';
import { GameScreen } from './components/screens/GameScreen';
import { CoachRoute } from './components/utility/CoachRoute';
import { ProtectedRoute } from './components/utility/ProtectedRoute';
import { Crown } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

const SplashScreen: React.FC = () => (
    <div className="flex flex-col justify-center items-center h-screen bg-primary text-white">
        <Crown size={80} className="animate-pulse" />
        <h1 className="text-4xl font-bold mt-4">ChessMaster Academy</h1>
        <p className="mt-2 text-lg">Learn from the best.</p>
    </div>
);

// A small helper component to handle redirection for /profile
const ProfileRedirect: React.FC = () => {
    const { currentUser } = useAuth();
    // ProtectedRoute ensures currentUser is not null here.
    return <Navigate to={`/profile/${currentUser!.id}`} replace />;
};


const AppRouter: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Routes>
        {/* Auth routes: only accessible when logged out. Redirect to home if logged in. */}
        <Route path="/welcome" element={!currentUser ? <WelcomeScreen /> : <Navigate to="/home" replace />} />
        <Route path="/login" element={!currentUser ? <LoginScreen /> : <Navigate to="/home" replace />} />
        <Route path="/signup" element={!currentUser ? <SignUpScreen /> : <Navigate to="/home" replace />} />
        <Route path="/forgot-password" element={!currentUser ? <ForgotPasswordScreen /> : <Navigate to="/home" replace />} />

        {/* Main app layout accessible to all */}
        <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/home" replace />} />
            {/* Publicly accessible routes within MainLayout */}
            <Route path="home" element={<HomeScreen />} />
            <Route path="explore" element={<ExploreScreen />} />
            <Route path="find-coaches" element={<FindCoachesScreen />} />
            <Route path="live" element={<LiveScreen />} />
            <Route path="profile/:userId" element={<ProfileScreen />} />

            {/* Play routes that are now public */}
            <Route path="play" element={<PlayScreen />} />
            <Route path="play/computer" element={<PlayComputerScreen />} />
            <Route path="play/analysis" element={<AnalysisScreen />} />

            {/* Protected routes that require login */}
            <Route path="messages" element={<ProtectedRoute><MessagesScreen /></ProtectedRoute>} />
            <Route path="chat/:receiverId" element={<ProtectedRoute><ChatScreen /></ProtectedRoute>} />
            
            {/* Profile route for the current user */}
            <Route path="profile" element={<ProtectedRoute><ProfileRedirect /></ProtectedRoute>} />

            {/* Protected Play routes */}
            <Route path="play/online" element={<ProtectedRoute><PlayOnlineLobbyScreen /></ProtectedRoute>} />
            <Route path="game/:gameId" element={<ProtectedRoute><GameScreen /></ProtectedRoute>} />

            {/* Coach Only Routes */}
            <Route path="create-course" element={<CoachRoute><CreateCourseScreen /></CoachRoute>} />
            <Route path="create-live-session" element={<CoachRoute><CreateLiveSessionScreen /></CoachRoute>} />

             {/* A catch-all inside main layout to redirect to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
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