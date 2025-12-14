import React from 'react';
import './AboutMe.css';

const AboutMe = () => {
    return (
        <section className="about-section section" id="about">
            <div className="container">
                <div className="about-grid">
                    <div className="about-content fade-in-down">
                        <div className="about-header-combined">
                            <div className="about-title-block">
                                <span className="greeting">The Creator</span>
                                <h2>Rob</h2>
                            </div>
                            <div className="about-photo-mini">
                                {/* Placeholder for user photo */}
                                <div className="photo-placeholder-mini">
                                    <span style={{ fontSize: '2rem' }}>👤</span>
                                </div>
                            </div>
                        </div>

                        <p className="about-text">
                            A multidisciplinary designer blending technical precision with artistic vision.
                            Specializing in procedural design and photorealistic rendering to bring
                            digital jewelry concepts to life.
                        </p>

                        {/* Vision collapsed into text */}
                        <p className="about-vision-text">
                            Restoring the soul of digital objects through imperfection and detail.
                            Exploring the intersection of fashion, technology, and identity.
                        </p>

                        <div className="skills-container" style={{ border: 'none' }}>
                            <div className="skill-category">
                                <h4>Design Stack</h4>
                                <ul>
                                    <li>Blender</li>
                                    <li>Houdini</li>
                                    <li>Adobe CC</li>
                                    {/* C4D & Octane removed */}
                                </ul>
                            </div>
                        </div>

                        <div className="about-cta">
                            <button className="btn btn-primary" onClick={() => window.location.href = 'mailto:contact@stuffmadebyrob.com'}>
                                Get in Touch
                            </button>
                        </div>
                    </div>

                    {/* Right side visual removed/merged as requested to put profile next to name */}
                    {/* If we want to keep the grid structure but empty right side, or just make it single column? 
                        The user screenshot showed "The Creator Rob" and the photo next to it (circled).
                        So likely single column centered or left aligned.
                        I will remove the second column div.
                    */}
                </div>
            </div>
        </section>
    );
};

export default AboutMe;
