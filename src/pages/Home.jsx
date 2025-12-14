import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import WebGLShowcase from '../components/WebGLShowcase';
import BehindTheDesign from '../components/BehindTheDesign';
import DigitalPipeline from '../components/DigitalPipeline';
import Craftsmanship from '../components/Craftsmanship';
import AboutMe from '../components/AboutMe';
import ARVisualization from '../components/ARVisualization';

const Home = () => {
    // Reset scroll on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="home-container">
            <Hero />
            <WebGLShowcase />

            <div id="process">
                <BehindTheDesign />
                <DigitalPipeline />
            </div>

            <div id="craft">
                <Craftsmanship />
            </div>

            <div id="ar-section">
                <ARVisualization />
            </div>
        </div>
    );
};

export default Home;
