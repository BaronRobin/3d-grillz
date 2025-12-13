import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Process from './pages/Process';
import Craft from './pages/Craft';
import About from './pages/About';
import ArExperience from './pages/ArExperience';
import './App.css';
import './styles/animations.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/process" element={<Process />} />
          <Route path="/craft" element={<Craft />} />
          <Route path="/about" element={<About />} />
          <Route path="/ar-experience" element={<ArExperience />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
