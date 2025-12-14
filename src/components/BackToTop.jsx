import React, { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const BackToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <button
            className={`btn-icon glass ${visible ? 'visible' : ''}`}
            onClick={scrollToTop}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 900, // Below nav/cursor but above content
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.3s ease',
                pointerEvents: visible ? 'auto' : 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
            }}
            aria-label="Back to Top"
        >
            <FaArrowUp />
        </button>
    );
};

export default BackToTop;
