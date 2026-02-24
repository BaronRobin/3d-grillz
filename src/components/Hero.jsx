import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero" id="hero">
            <div className="hero-background">
                {/* User to replace src with actual webm video path */}
                {/* <video autoPlay loop muted playsInline className="hero-video">
                    <source src="/assets/hero-loop.webm" type="video/webm" />
                </video> */}
                {/* Placeholder gradient until video is added */}
                <div className="hero-video-placeholder"></div>
                <div className="hero-overlay"></div>
            </div>

            <div className="hero-content container">
                <h1 className="hero-title fade-in-up">
                    <span className="gradient-text">3D Custom Grillz</span>
                </h1>

                <p className="hero-subtitle fade-in-up stagger-2">
                    Bespoke 3D-modeled grillz, seamlessly bridging augmented reality with physical craftsmanship.
                </p>

                <div className="hero-cta fade-in-up stagger-3">
                    <button
                        onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
                        className="btn btn-primary"
                    >
                        Explore the Pipeline
                    </button>
                    <Link to="/ar-experience" className="btn btn-secondary">
                        View AR Experience
                    </Link>
                </div>

                <div className="scroll-indicator fade-in stagger-4">
                    <div className="scroll-mouse">
                        <div className="scroll-wheel"></div>
                    </div>
                    <span className="scroll-text">Scroll to discover</span>
                </div>
            </div>
        </section>
    );
};

export default Hero;
