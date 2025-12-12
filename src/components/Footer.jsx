import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const sections = {
        explore: [
            { label: 'Behind the Design', href: '#behind-design' },
            { label: 'Digital Pipeline', href: '#pipeline' },
            { label: 'Craftsmanship', href: '#craftsmanship' },
            { label: 'AR Experience', href: '#ar-section' }
        ],
        connect: [
            { label: 'Instagram', href: 'https://instagram.com/stuffmadebyrob', external: true },
            { label: 'Email', href: 'mailto:contact@grillzdesign.com', external: true },
            { label: 'LinkedIn', href: '#', external: true }
        ]
    };

    const scrollToSection = (href) => {
        if (href.startsWith('#')) {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3 className="footer-title gradient-text">3D Grillz</h3>
                        <p className="footer-description">
                            Bridging traditional craftsmanship with digital innovation.
                            A Bachelor's Thesis exploring the future of wearable design.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Explore</h4>
                        <ul className="footer-links">
                            {sections.explore.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            scrollToSection(link.href);
                                        }}
                                        className="footer-link"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Connect</h4>
                        <ul className="footer-links">
                            {sections.connect.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        target={link.external ? '_blank' : '_self'}
                                        rel={link.external ? 'noopener noreferrer' : ''}
                                        className="footer-link"
                                    >
                                        {link.label}
                                        {link.external && ' ↗'}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="copyright">
                        © {currentYear} 3D Grillz Digital Pipeline. Created by <a href="https://instagram.com/stuffmadebyrob" target="_blank" rel="noopener noreferrer">@stuffmadebyrob</a>
                    </p>
                    <p className="thesis-note">
                        Bachelor's Thesis — Virtual Design — Hochschule Kaiserslautern
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
