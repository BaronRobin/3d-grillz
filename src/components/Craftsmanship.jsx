import React, { useState, useEffect, useRef } from 'react';
import { FaSquare } from 'react-icons/fa';
import './Craftsmanship.css';

// Simple CountUp Component
const CountUp = ({ start = 0, end, duration = 2000, suffix = '', prefix = '', decimals = 0 }) => {
    const [count, setCount] = useState(start);
    const elementRef = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated.current) {
                    hasAnimated.current = true;
                    let startTime = null;
                    const step = (timestamp) => {
                        if (!startTime) startTime = timestamp;
                        const progress = Math.min((timestamp - startTime) / duration, 1);

                        // Easing function (easeOutExpo)
                        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

                        const current = start + (end - start) * ease;
                        setCount(current);

                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        }
                    };
                    window.requestAnimationFrame(step);
                }
            },
            { threshold: 0.5 }
        );

        if (elementRef.current) observer.observe(elementRef.current);

        return () => observer.disconnect();
    }, [end, duration, start]);

    return (
        <span ref={elementRef}>
            {prefix}{count.toFixed(decimals)}{suffix}
        </span>
    );
};

/* 3D Material Card Component */
const Material3DCard = ({ material }) => {
    const cardRef = useRef(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation: Max +/- 12 degrees for "tvOS" feel
        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        setStyle({
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            '--mouse-x': `${x}px`,
            '--mouse-y': `${y}px`
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'rotateX(0deg) rotateY(0deg)',
            '--mouse-x': '50%',
            '--mouse-y': '50%'
        });
    };

    return (
        <div className="material-card-wrapper-3d">
            <div
                ref={cardRef}
                className={`material-card-3d ${material.className}`}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={style}
            >
                <div className="material-card-glare"></div>
                <div className="material-content">
                    <div className="material-header">
                        <h4>{material.name}</h4>
                        <span className="material-purity">{material.purity}</span>
                    </div>
                    <div className="material-finish">{material.finish}</div>
                    <p className="material-desc-static">{material.desc}</p>
                </div>
            </div>
        </div>
    );
};

const Craftsmanship = () => {
    const [showDetails, setShowDetails] = useState(false);
    const [showAllMaterials, setShowAllMaterials] = useState(false);

    const specs = [
        { label: 'Production Time', end: 3, suffix: ' months', icon: '⏱️' },
        { label: 'Working Hours', end: 480, suffix: ' hrs', icon: '⚙️' },
        { label: 'Precision', start: 10, end: 0.01, suffix: ' mm', icon: '🎯', decimals: 2 }
    ];

    const allMaterials = [
        {
            name: 'Gold',
            purity: '18K',
            finish: 'Mirror Polish',
            desc: 'Classic luxury with timeless durability.',
            className: 'mat-gold'
        },
        {
            name: 'Sterling Silver',
            purity: '925',
            finish: 'High Polish',
            desc: 'Brilliant luster with a modern edge.',
            className: 'mat-silver'
        },
        {
            name: 'Titanium',
            purity: 'Grade 5',
            finish: 'Brushed',
            desc: 'Aerospace-grade strength to weight ratio.',
            className: 'mat-titanium'
        },
        {
            name: 'Rose Gold',
            purity: '18K',
            finish: 'Satin',
            desc: 'Warm hues for a distinct aesthetic.',
            className: 'mat-rose'
        },
        {
            name: 'White Gold',
            purity: '18K',
            finish: 'Rhodium',
            desc: 'Bright, reflective, and hypoallergenic.',
            className: 'mat-white-gold'
        },
        {
            name: 'Black Gold',
            purity: '18K',
            finish: 'Matte',
            desc: 'Edgy, sophisticated dark finish.',
            className: 'mat-black-gold'
        },
        {
            name: 'Ceramic',
            purity: 'Zirconia',
            finish: 'Glazed',
            desc: 'Details so fine they look liquid.',
            className: 'mat-ceramic'
        },
        {
            name: 'Platinum',
            purity: '950',
            finish: 'Polished',
            desc: 'The ultimate symbol of prestige.',
            className: 'mat-platinum'
        },
        {
            name: 'VVS Diamond',
            purity: 'Flawless',
            finish: 'Pavé',
            desc: 'Hand-set stones for maximum brilliance.',
            className: 'mat-diamond'
        }
    ];

    return (
        <section className="craftsmanship section" id="craftsmanship">
            <div className="container">
                <div className="section-header fade-in-down">
                    <h2>Cutting-Edge Craftsmanship</h2>
                    <p className="section-subtitle">
                        Where precision meets artistry in every detail
                    </p>
                </div>

                <div className="specs-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', justifyContent: 'center' }}>
                    {specs.map((spec, index) => (
                        <div
                            key={index}
                            className={`spec-card glass-dark fade-in-down stagger-${index + 1}`}
                            style={{ border: 'none' }}
                        >
                            <div className="spec-icon">{spec.icon}</div>
                            <div className="spec-value gradient-text">
                                <CountUp
                                    start={spec.start || 0}
                                    end={spec.end}
                                    suffix={spec.suffix}
                                    decimals={spec.decimals || 0}
                                    duration={2000 + (index * 200)}
                                />
                            </div>
                            <div className="spec-label">{spec.label}</div>
                        </div>
                    ))}
                </div>

                <div className="materials-section fade-in-down stagger-3">
                    <h3>Premium Materials</h3>

                    <div className={`materials-grid-wrapper ${showAllMaterials ? 'expanded' : ''}`}>
                        <div className="materials-grid">
                            {allMaterials.map((material, index) => (
                                <div key={index} className="fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <Material3DCard material={material} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '2rem', position: 'relative', zIndex: 10 }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowAllMaterials(!showAllMaterials)}
                        >
                            {showAllMaterials ? 'Show Less' : 'Explore All Materials'}
                        </button>
                    </div>
                </div>

                <div className="process-description glass-dark fade-in-down stagger-4" style={{ border: 'none' }}>
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
