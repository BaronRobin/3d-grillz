import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PageGuide = () => {
    const location = useLocation();

    // Define the flow: Home -> Process -> Craft -> AR -> Home
    // About is EXCLUDED as per user request (Footer only)
    const flow = {
        '/': { next: '/process', label: 'See The Process' },
        '/process': { next: '/craft', label: 'Explore Craftsmanship' },
        '/craft': { next: '/ar-experience', label: 'Try in AR' },
        '/ar-experience': { next: '/', label: 'Back to Showcase' }
    };

    // If current path isn't in flow (e.g. /about), don't show guide
    const current = flow[location.pathname];
    if (!current) return null;

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '4rem 0 2rem 0',
            background: 'transparent',
            pointerEvents: 'none' // Wrapper shouldn't block
        }}>
            <Link
                to={current.next}
                onClick={() => window.scrollTo(0, 0)}
                className="btn-text"
                style={{
                    pointerEvents: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    textDecoration: 'none',
                    color: 'var(--color-text-secondary)',
                    transition: 'color 0.3s ease'
                }}
            >
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Next Chapter</span>
                <span style={{ fontSize: '1.2rem', color: 'var(--color-accent)', fontFamily: 'serif' }}>{current.label} &rarr;</span>
            </Link>
        </div>
    );
};

export default PageGuide;
