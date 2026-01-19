import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import ArExperience from './pages/ArExperience';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CustomCursor from './components/CustomCursor';
import BackToTop from './components/BackToTop';
import { AuthProvider } from './context/AuthContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { useAuth } from './context/AuthContext'; // Import hook to pass user to Analytics
import './App.css';
import './styles/animations.css';
import MobileTabBar from './components/MobileTabBar';

// Wrapper to pass auth user to analytics
const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <AuthConsumer>
        {children}
      </AuthConsumer>
    </AuthProvider>
  );
};

const AuthConsumer = ({ children }) => {
  const { user } = useAuth();
  return (
    <AnalyticsProvider user={user}>
      {children}
    </AnalyticsProvider>
  );
};

const AppContent = () => {
  const location = useLocation();

  // Pages where footer should be hidden
  const hideFooterRoutes = ['/login', '/dashboard', '/admin', '/ar-experience'];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <>
      <CustomCursor />
      <BackToTop />
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/ar-experience" element={<ArExperience />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <MobileTabBar />
        {!shouldHideFooter && <Footer />}
      </div>
    </>
  );
};


// Import the custom hook
import useAnimatedFavicon from './hooks/useAnimatedFavicon';

function App() {
  // Placeholder frames for now. 
  // User will provide numbered frames (e.g., favicon-0.png, favicon-1.png... favicon-10.png)
  // We'll generate the array dynamically based on a count.
  const frameCount = 10; // Adjust this number based on actual frames provided
  const faviconFrames = Array.from({ length: frameCount }, (_, i) => `/favicon-${i}.webp`);

  useAnimatedFavicon(faviconFrames, 100); // Faster interval for smooth animation

  return (
    <Router>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </Router>
  );
}

export default App;
