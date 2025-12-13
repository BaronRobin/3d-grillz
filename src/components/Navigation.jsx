import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import '../App.css';

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        // Prevent scrolling when menu is open
        if (!isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    const closeMenu = () => {
        setIsOpen(false);
        document.body.style.overflow = 'unset';
    };

    // Styles
    const navStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        padding: scrolled ? '1rem 2rem' : '1.5rem 2rem',
        transition: 'all 0.4s ease',
        background: scrolled || isOpen ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
        backdropFilter: scrolled || isOpen ? 'blur(10px)' : 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
    };

    const logoStyle = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: '2px',
        zIndex: 1001,
        position: 'relative'
    };

    const linkStyle = ({ isActive }) => ({
        color: isActive ? 'var(--color-accent)' : '#fff',
        textDecoration: 'none',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        fontWeight: isActive ? '600' : '400',
        marginLeft: '2rem',
        transition: 'color 0.3s ease',
        position: 'relative'
    });

    // Mobile specific styles
    const mobileMenuStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'var(--color-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Below logo and toggle
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOpen ? 'translateY(0)' : 'translateY(-100%)',
        opacity: isOpen ? 1 : 0
    };

    const mobileLinkStyle = ({ isActive }) => ({
        ...linkStyle({ isActive }),
        fontSize: '2rem',
        marginLeft: 0,
        marginBottom: '2rem',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.4s ease 0.2s, transform 0.4s ease 0.2s'
    });

    return (
        <nav style={navStyle}>
            <div style={logoStyle}>
                AG<span style={{ color: 'var(--color-accent)' }}>.</span>PRO
            </div>

            {/* Desktop Menu */}
            <div className="desktop-menu">
                <NavLink to="/" style={linkStyle}>Showcase</NavLink>
                <NavLink to="/process" style={linkStyle}>Process</NavLink>
                <NavLink to="/craft" style={linkStyle}>Craft</NavLink>
                <NavLink to="/about" style={linkStyle}>About</NavLink>
            </div>

            {/* Mobile Toggle Button */}
            <div className="mobile-toggle" onClick={toggleMenu} style={{
                cursor: 'pointer',
                color: '#fff',
                fontSize: '1.5rem',
                zIndex: 1001
            }}>
                {isOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* Mobile Fullscreen Menu */}
            <div style={mobileMenuStyle}>
                <NavLink to="/" style={mobileLinkStyle} onClick={closeMenu}>Showcase</NavLink>
                <NavLink to="/process" style={mobileLinkStyle} onClick={closeMenu}>Process</NavLink>
                <NavLink to="/craft" style={mobileLinkStyle} onClick={closeMenu}>Craft</NavLink>
                <NavLink to="/about" style={mobileLinkStyle} onClick={closeMenu}>About</NavLink>
            </div>

            <style>{`
                .desktop-menu { display: flex; align-items: center; }
                .mobile-toggle { display: none; }
                
                @media (max-width: 768px) {
                    .desktop-menu { display: none !important; }
                    .mobile-toggle { display: block !important; }
                }
            `}</style>
        </nav>
    );
};

export default Navigation;
