import React, { useState } from 'react';
import './Craftsmanship.css';

const Craftsmanship = () => {
    const [showDetails, setShowDetails] = useState(false);
    const [flippedMaterial, setFlippedMaterial] = useState(null);

    const specs = [
        { label: 'Production Time', value: '3 months', icon: '⏱️' },
        { label: 'Setting Hours', value: '480 hrs', icon: '⚙️' },
        { label: 'Expert Team', value: '4 Experts', icon: '👥' },
        { label: 'Avg Polygons', value: '250,000+', icon: '💎' }
    ];

    const materials = [
        {
            name: 'Gold',
            purity: '18K',
            finish: 'Mirror Polish',
            desc: 'Classic luxury with timeless durability.'
        },
        {
            name: 'Platinum',
            purity: '950 PT',
            finish: 'Satin',
            desc: 'Hypoallergenic density and weight.'
        },
        {
            name: 'Titanium',
            purity: 'Grade 5',
            finish: 'Brushed',
            desc: 'Aerospace-grade strength to weight ratio.'
        },
        {
            name: 'Cobalt',
            purity: 'Chrome',
            finish: 'High Glo',
            desc: 'Biocompatible alternative for precision fit.'
        }
    ];

    const handleMaterialClick = (index) => {
        setFlippedMaterial(flippedMaterial === index ? null : index);
    };

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
                            <div
                                key={index}
                                className={`material-card-wrapper ${flippedMaterial === index ? 'flipped' : ''}`}
                                onClick={() => handleMaterialClick(index)}
                            >
                                <div className="material-card-inner">
                                    <div className="material-card-front glass">
                                        <div className="material-header">
                                            <h4>{material.name}</h4>
                                            <span className="material-purity">{material.purity}</span>
                                        </div>
                                        <div className="material-finish">{material.finish}</div>
                                        <div className="click-hint">Click to flip ↻</div>
                                    </div>
                                    <div className="material-card-back glass-dark">
                                        <h4>{material.name}</h4>
                                        <p>{material.desc}</p>
                                    </div>
                                </div>
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

                    <div className={`process-details ${showDetails ? 'show' : ''}`} style={{
                        maxHeight: showDetails ? '500px' : '0',
                        overflow: 'hidden',
                        transition: 'max-height 0.5s ease',
                        opacity: showDetails ? 1 : 0
                    }}>
                        <p>
                            After fabrication, pieces undergo rigorous quality control including dimensional
                            accuracy verification, biocompatibility testing, and surface integrity inspection.
                            Only designs meeting ISO 10993 standards for dental contact progress to final
                            finishing and delivery.
                        </p>
                    </div>

                    <button
                        className="btn-text"
                        onClick={() => setShowDetails(!showDetails)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-accent)',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            fontWeight: '600',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            margin: '0 auto'
                        }}
                    >
                        {showDetails ? 'Read Less' : 'Read More'}
                        <span style={{
                            transform: showDetails ? 'rotate(180deg)' : 'rotate(0)',
                            display: 'inline-block',
                            transition: 'transform 0.3s ease'
                        }}>▼</span>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Craftsmanship;
