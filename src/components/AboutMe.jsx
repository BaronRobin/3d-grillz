import React from 'react';
import './AboutMe.css';

const AboutMe = () => {
    return (
        <section className="about-section section" id="about">
            <div className="container">
                <div className="about-grid">
                    <div className="about-content fade-in-up">
                        <div className="about-header">
                            <span className="greeting">Yo, I'm Rob</span>
                            <h2>Let's discover something new. Together.</h2>
                        </div>
                        <p className="about-text">
                            I see utility in paying attention to details, from exact spacing to materials
                            and colors. As a multidisciplinary designer, I blend technical precision
                            with artistic vision.
                        </p>

                        <div className="skills-container">
                            <div className="skill-category">
                                <h4>Design</h4>
                                <ul>
                                    <li>Cinema 4D</li>
                                    <li>Octane Render</li>
                                    <li>Adobe CC</li>
                                    <li>Figma</li>
                                </ul>
                            </div>
                            <div className="skill-category">
                                <h4>Development</h4>
                                <ul>
                                    <li>React / Vite</li>
                                    <li>HTML / CSS / JS</li>
                                    <li>Three.js / WebGL</li>
                                    <li>Tailwind</li>
                                </ul>
                            </div>
                        </div>

                        <div className="about-cta">
                            <button className="btn btn-primary" onClick={() => window.location.href = 'mailto:contact@baron.com'}>
                                Get in Touch
                            </button>
                        </div>
                    </div>

                    <div className="about-visual glass-dark fade-in-right stagger-2">
                        <div className="visual-card">
                            <h3>Why Work With Me?</h3>
                            <p>
                                I specialize in creating immersive digital experiences that bridge the gap
                                between 3D artistry and web performance. Whether it's custom jewelry visualization
                                or interactive web showcases.
                            </p>
                        </div>
                        <div className="visual-card">
                            <h3>Restoring my Soul</h3>
                            <p>
                                When I'm not designing, I'm exploring the world through a lens—capturing
                                nature, architecture, and the moments in between.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutMe;
