import React from 'react';
import './AboutMe.css';

const AboutMe = () => {
    return (
        <section className="about-section section" id="about">
            <div className="container">
                <div className="about-grid">
                    <div className="about-content fade-in-up">
                        <div className="about-header">
                            <span className="greeting">The Creator</span>
                            <h2>Rob</h2>
                        </div>
                        <p className="about-text">
                            A multidisciplinary designer blending technical precision with artistic vision.
                            Specializing in procedural design and photorealistic rendering to bring
                            digital jewelry concepts to life.
                        </p>

                        <div className="skills-container">
                            <div className="skill-category">
                                <h4>Design Stack</h4>
                                <ul>
                                    <li>Blender</li>
                                    <li>Houdini</li>
                                    <li>Cinema 4D</li>
                                    <li>Octane Render</li>
                                    <li>Adobe CC</li>
                                </ul>
                            </div>
                        </div>

                        <div className="about-cta">
                            <button className="btn btn-primary" onClick={() => window.location.href = 'mailto:contact@stuffmadebyrob.com'}>
                                Get in Touch
                            </button>
                        </div>
                    </div>

                    <div className="about-visual glass-dark fade-in-right stagger-2">
                        <div className="about-photo-wrapper">
                            {/* Placeholder for user photo - User to replace src */}
                            <div className="photo-placeholder">
                                <span style={{ fontSize: '3rem' }}>👤</span>
                                <p>Rob</p>
                            </div>
                            {/* <img src="/path-to-rob-photo.jpg" alt="Rob" className="about-photo" /> */}
                        </div>

                        <div className="visual-card" style={{ marginTop: '2rem' }}>
                            <h3>Vision</h3>
                            <p>
                                Restoring the soul of digital objects through imperfection and detail.
                                Exploring the intersection of fashion, technology, and identity.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutMe;
