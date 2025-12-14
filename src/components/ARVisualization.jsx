import React from 'react';
import { Link } from 'react-router-dom';
import './ARVisualization.css';

const ARVisualization = () => {
    return (
        <section className="ar-section section" id="ar-section">
            <div className="container">
                <div className="section-header fade-in-up">
                    <h2>XR Visualization</h2>
                    <p className="section-subtitle">
                        Experience your design in augmented reality before fabrication
                    </p>
                </div>

                <div className="ar-content">
                    <div className="ar-feature-grid">
                        <div className="ar-feature glass-dark hover-lift fade-in-left">
                            <div className="ar-gif-bg"></div> {/* Placeholder for UE5 GIF */}
                            <div className="feature-content-wrapper">
                                <div className="feature-icon">📱</div>
                                <h3>Real-Time Preview</h3>
                                <p>
                                    Using Apple's ARKit and Unreal Engine 5, visualize grillz designs
                                    directly on your teeth through your smartphone camera with photorealistic
                                    materials and lighting.
                                </p>
                            </div>
                        </div>

                        <div className="ar-feature glass-dark hover-lift fade-in-up stagger-2">
                            <div className="ar-gif-bg" style={{ animationDelay: '1s' }}></div> {/* Placeholder for GIF */}
                            <div className="feature-content-wrapper">
                                <div className="feature-icon">✨</div>
                                <h3>PBR Materials</h3>
                                <p>
                                    Physically-based rendering simulates real-world metal reflections,
                                    roughness, and environmental lighting for accurate material representation.
                                </p>
                            </div>
                        </div>

                        <div className="ar-feature glass-dark hover-lift fade-in-right stagger-3">
                            <div className="ar-gif-bg" style={{ animationDelay: '2s' }}></div> {/* Placeholder for GIF */}
                            <div className="feature-content-wrapper">
                                <div className="feature-icon">🎯</div>
                                <h3>Precise Tracking</h3>
                                <p>
                                    ARKit's face tracking technology ensures sub-millimeter alignment accuracy,
                                    following jaw movement and facial expressions in real time.
                                </p>
                            </div>
                        </div>
                    </div> {/* End ar-feature-grid */}

                    <div className="tech-comparison fade-in-up stagger-4">
                        <h3>Technology Stack</h3>
                        <div className="tech-stack-grid">
                            <div className="tech-item">
                                <div className="tech-name">Unreal Engine 5</div>
                                <div className="tech-desc">Real-time rendering & materials</div>
                            </div>
                            <div className="tech-item">
                                <div className="tech-name">Apple ARKit</div>
                                <div className="tech-desc">Face tracking & spatial awareness</div>
                            </div>
                            <div className="tech-item">
                                <div className="tech-name">WebXR / Three.js</div>
                                <div className="tech-desc">Browser-based AR alternative</div>
                            </div>
                            <div className="tech-item">
                                <div className="tech-name">glTF 2.0</div>
                                <div className="tech-desc">3D model format standard</div>
                            </div>
                        </div>
                    </div>

                    <div className="ar-cta fade-in-up stagger-5">
                        <Link to="/ar-experience" className="btn btn-primary">
                            Launch AR Experience
                        </Link>
                        <p className="ar-note">
                            *AR features require iOS 14+ with ARKit-compatible device
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ARVisualization;
