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
                <h1 className="hero-title fade-in-up" style={{ fontSize: '4.5rem', lineHeight: '1.1', marginBottom: '1.5rem' }}>
                    <span className="gradient-text">The 0-100 Digital Hub</span>
                    <br />For Custom Grillz
                </h1>

                <p className="hero-subtitle fade-in-up stagger-2" style={{ maxWidth: '800px', margin: '0 auto 2.5rem', fontSize: '1.3rem' }}>
                    No app installations. No physical meetups required. A completely seamless, customer-friendly web hub bridging custom 3D-modeling with cutting-edge physical craftsmanship.
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
