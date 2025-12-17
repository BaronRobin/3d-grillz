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
        {!shouldHideFooter && <Footer />}
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </Router>
  );
}

export default App;
