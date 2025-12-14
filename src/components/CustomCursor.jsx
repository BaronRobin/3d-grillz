import React, { useEffect, useState } from 'react';

const CustomCursor = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [hidden, setHidden] = useState(false);
    const [clicked, setClicked] = useState(false);
    const [linkHovered, setLinkHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Disable on mobile
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android|iPad|iPhone|iPod/i.test(userAgent)) {
            setIsMobile(true);
            return;
        }

        const addEventListeners = () => {
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseenter', onMouseEnter);
            document.addEventListener('mouseleave', onMouseLeave);
            document.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mouseup', onMouseUp);
        };

        const removeEventListeners = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseenter', onMouseEnter);
            document.removeEventListener('mouseleave', onMouseLeave);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });

            // Check if hovering over clickable element
            const target = e.target;
            const isClickable =
                target.tagName === 'A' ||
                target.tagName === 'BUTTON' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('clickable') ||
                window.getComputedStyle(target).cursor === 'pointer';

            setLinkHovered(!!isClickable);
        };

        const onMouseEnter = () => setHidden(false);
        const onMouseLeave = () => setHidden(true);
        const onMouseDown = () => setClicked(true);
        const onMouseUp = () => setClicked(false);

        addEventListeners();
        return removeEventListeners;
    }, []);

    // Helper to inject Global CSS for hiding default cursor
    useEffect(() => {
        if (isMobile) return;

        const style = document.createElement('style');
        style.innerHTML = `
            body, a, button, input { cursor: none !important; }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, [isMobile]);

    if (isMobile) return null;

    return (
        <>
            {/* Main Dot */}
            <div
                style={{
                    position: 'fixed',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'var(--color-accent)', // Gold dot
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 10000,
                    opacity: hidden ? 0 : 1,
                    mixBlendMode: 'difference' // Cool contrast effect
                }}
            />
            {/* Outer Ring */}
            <div
                style={{
                    position: 'fixed',
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: '40px',
                    height: '40px',
                    border: '1px solid var(--color-accent)',
                    borderRadius: '50%',
                    transform: `translate(-50%, -50%) scale(${clicked ? 0.8 : linkHovered ? 1.5 : 1})`,
                    pointerEvents: 'none',
                    zIndex: 10000,
                    opacity: hidden ? 0 : 0.5,
                    transition: 'transform 0.15s ease-out, opacity 0.15s ease-out',
                    mixBlendMode: 'difference'
                }}
            />
        </>
    );
};

export default CustomCursor;
