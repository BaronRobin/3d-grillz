import React from 'react';
import Hero from './components/Hero';
import AboutMe from './components/AboutMe';
import BehindTheDesign from './components/BehindTheDesign';
import DigitalPipeline from './components/DigitalPipeline';
import Craftsmanship from './components/Craftsmanship';
import ARVisualization from './components/ARVisualization';
import WebGLShowcase from './components/WebGLShowcase';
import Footer from './components/Footer';
import './App.css';
import './styles/animations.css';

function App() {
  return (
    <div className="app">
      <Hero />
      <AboutMe />
      <WebGLShowcase />
      <BehindTheDesign />
      <DigitalPipeline />
      <Craftsmanship />
      <ARVisualization />
      <Footer />
    </div>
  );
}

export default App;
