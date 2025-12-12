import React from 'react';
import './Craftsmanship.css';

const Craftsmanship = () => {
    const specs = [
        { label: 'Production Time', value: '10 months', icon: '⏱️' },
        { label: 'Setting Hours', value: '1,300 hrs', icon: '⚙️' },
        { label: 'Artisans', value: '4 craftsmen', icon: '👥' },
        { label: 'Diamond Count', value: '8,000+', icon: '💎' }
    ];

    const materials = [
        { name: 'Gold', purity: '14K-24K', finish: 'Mirror Polish' },
        { name: 'Platinum', purity: '950 PT', finish: 'Satin' },
        { name: 'Titanium', purity: 'Grade 5', finish: 'Brushed' },
        { name: 'Silver', purity: '925 Sterling', finish: 'Oxidized' }
    ];

    return (
        <section className="craftsmanship section" id="craftsmanship">
            <div className="container">
                <div className="section-header fade-in-up">
                    <h2>Cutting-Edge Craftsmanship</h2>
                    <p className="section-subtitle">
                        Where precision meets artistry in every detail
                    </p>
                </div>

                <div className="specs-grid">
                    {specs.map((spec, index) => (
                        <div
                            key={index}
                            className={`spec-card glass-dark hover-lift fade-in-up stagger-${index + 1}`}
                        >
                            <div className="spec-icon">{spec.icon}</div>
                            <div className="spec-value gradient-text">{spec.value}</div>
                            <div className="spec-label">{spec.label}</div>
                        </div>
                    ))}
                </div>

                <div className="materials-section fade-in-up stagger-3">
                    <h3>Premium Materials</h3>
                    <div className="materials-grid">
                        {materials.map((material, index) => (
                            <div key={index} className="material-card glass">
                                <div className="material-header">
                                    <h4>{material.name}</h4>
                                    <span className="material-purity">{material.purity}</span>
                                </div>
                                <div className="material-finish">{material.finish}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="process-description glass-dark fade-in-up stagger-4">
                    <h3>The Process</h3>
                    <p>
                        Each piece is handcrafted by expert artisans over months of meticulous work.
                        From initial 3D printing of master molds using castable resin to final polishing
                        with progressive abrasives, every step demands precision and patience. The result
                        is a wearable masterpiece that merges digital perfection with human craftsmanship.
                    </p>
                    <p>
                        After fabrication, pieces undergo rigorous quality control including dimensional
                        accuracy verification, biocompatibility testing, and surface integrity inspection.
                        Only designs meeting ISO 10993 standards for dental contact progress to final
                        finishing and delivery.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default Craftsmanship;
