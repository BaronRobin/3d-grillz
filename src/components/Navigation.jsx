import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

const Navigation = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleNavClick = (id) => {
        setIsOpen(false);
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <Link to="/" className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    {/* Logo removed per user request */}
                </Link>

                <div className="menu-icon" onClick={toggleMenu}>
                    {isOpen ? <FaTimes /> : <FaBars />}
                </div>

                <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <span className="nav-link" onClick={() => handleNavClick('process')}>Process</span>
                    </li>
                    <li className="nav-item">
                        <span className="nav-link" onClick={() => handleNavClick('craft')}>Craft</span>
                    </li>
                    <li className="nav-item">
                        <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>About</Link>
                    </li>

                    {/* Role Based Links */}
                    {user && user.role === 'admin' && (
                        <li className="nav-item">
                            <Link to="/admin" className="nav-link" style={{ color: '#ffcc00' }} onClick={() => setIsOpen(false)}>Admin</Link>
                        </li>
                    )}
                    {user && user.role !== 'admin' && (
                        <li className="nav-item">
                            <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>Dashboard</Link>
                        </li>
                    )}

                    <li className="nav-item nav-btn-item">
                        {user ? (
                            <button onClick={() => { logout(); setIsOpen(false); }} className="btn btn-secondary nav-btn" style={{ padding: '0.5rem 1.5rem', marginTop: 0 }}>
                                Sign Out
                            </button>
                        ) : (
                            <Link to="/login" className="btn btn-primary nav-btn" onClick={() => setIsOpen(false)}>
                                Sign In
                            </Link>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navigation;
