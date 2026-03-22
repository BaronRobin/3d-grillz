import React, { useState } from 'react';
import './AboutMe.css';
import { changelogData } from '../data/changelogData';

const AboutMe = () => {
    const [visibleVersions, setVisibleVersions] = useState(3);
    const [prevVisible, setPrevVisible] = useState(3);

    const loadMoreChangelog = () => {
        setPrevVisible(visibleVersions);
        setVisibleVersions(prev => prev + 3);
    };

    return (
        <section className="about-section section" id="about">
            <div className="container">
                <div className="about-grid">
                    <div className="about-content fade-in-down">
                        <div className="about-header-combined">
                            <div className="about-title-block">
                                <span className="greeting">The Creator</span>
                                <h2>Robin Baron</h2>
                            </div>
                            <div className="about-photo-mini" style={{ border: '2px solid var(--color-accent)' }}>
                                <img src="https://baronrobin.github.io/profile.webp?v=3" alt="Robin Baron" className="about-photo" />
                            </div>
                        </div>

                        <div className="about-cta" style={{ marginBottom: '3rem' }}>
                            <button className="btn btn-primary" onClick={() => window.open('https://baronrobin.github.io/', '_blank', 'noopener,noreferrer')}>
                                Learn More
                            </button>
                        </div>

                        {/* Changelog Section */}
                        <div className="changelog-container">
                            <h3 className="gradient-text" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>Project Changelog</h3>
                            <div className="changelog-timeline">
                                {changelogData.slice(0, visibleVersions).map((log, index) => (
                                    <div
                                        key={index}
                                        className={`changelog-item${index >= prevVisible ? ' changelog-item--reveal' : ''}`}
                                    >
                                        <div className="changelog-version-badge">{log.version}</div>
                                        <ul className="changelog-details">
                                            {log.changes.map((change, idx) => (
                                                <li key={idx}>{change}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            {visibleVersions < changelogData.length && (
                                <button className="btn btn-secondary load-more-btn" onClick={loadMoreChangelog}>
                                    Load Older Versions
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutMe;
