import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleScroll = (id) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } else {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content" style={{ justifyContent: 'center', gap: '4rem' }}>
                    <div className="footer-links">
                        <h4>Explore</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><button onClick={() => [handleScroll('process')]} className="footer-nav-btn">The Process</button></li>
                            <li><button onClick={() => [handleScroll('craft')]} className="footer-nav-btn">Craftsmanship</button></li>
                            <li><Link to="/about" className="footer-nav-btn">About The Creator</Link></li>
                            <li><Link to="/ar-experience" className="footer-nav-btn">AR Experience</Link></li>
                        </ul>
                    </div>

                    <div className="footer-social">
                        <h4>Connect</h4>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><a href="https://instagram.com/stuffmadebyrob" target="_blank" rel="noopener noreferrer" className="footer-nav-btn"><FaInstagram style={{ marginRight: '8px' }} /> Instagram</a></li>
                            <li><a href="https://www.linkedin.com/in/baron-robin/" target="_blank" rel="noopener noreferrer" className="footer-nav-btn"><FaLinkedin style={{ marginRight: '8px' }} /> LinkedIn</a></li>
                            <li><a href="#" target="_blank" rel="noopener noreferrer" className="footer-nav-btn"><FaGithub style={{ marginRight: '8px' }} /> GitHub</a></li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="thesis-note" style={{ color: '#e0e0e0', fontSize: '0.85rem', letterSpacing: '1px', opacity: 0.8 }}>
                        Bachelor's Thesis • Virtual Design • Hochschule Kaiserslautern
                    </p>
                    <p style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                        &copy; {new Date().getFullYear()} Robin Baron. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
