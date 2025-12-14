import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import ArExperience from './pages/ArExperience';
import CustomCursor from './components/CustomCursor';
import BackToTop from './components/BackToTop';
import './App.css';
import './styles/animations.css';

function App() {
  return (
    <Router>
      <CustomCursor />
      <BackToTop />
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/ar-experience" element={<ArExperience />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
