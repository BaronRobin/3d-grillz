import React from 'react';
import './Hero.css';

const Hero = () => {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section className="hero" id="hero">
            <div className="hero-background">
                <div className="hero-overlay"></div>
            </div>

            <div className="hero-content container">
                <h1 className="hero-title fade-in-up">
                    Behind the Design:<br />
                    <span className="gradient-text">3D Custom Grillz</span>
                </h1>

                <p className="hero-subtitle fade-in-up stagger-2">
                    A digital pipeline merging traditional craftsmanship with cutting-edge technology.
                    <br />From 3D scanning to AR visualization – redefining wearable artistry.
                </p>

                <div className="hero-cta fade-in-up stagger-3">
                    <button
                        className="btn btn-primary"
                        onClick={() => scrollToSection('pipeline')}
                    >
                        Explore the Pipeline
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => scrollToSection('ar-section')}
                    >
                        View AR Experience
                    </button>
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
