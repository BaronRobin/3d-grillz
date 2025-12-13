import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMobileAlt, FaTimes, FaCamera } from 'react-icons/fa';
import '../App.css';

const ArExperience = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [showDevicePopup, setShowDevicePopup] = useState(false);
    const [cameraPermission, setCameraPermission] = useState('prompt'); // prompt, granted, denied

    useEffect(() => {
        // Simple mobile detection
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android/i.test(userAgent) || /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            setIsMobile(true);
        }

        // Close popup on Esc
        const handleEsc = (e) => {
            if (e.key === 'Escape') setShowDevicePopup(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const requestUsage = () => {
        // Mock permission request logic
        if (cameraPermission === 'prompt') {
            alert("This site would like to access your camera for AR features.");
            setCameraPermission('granted');
        } else if (cameraPermission === 'granted') {
            alert("Starting AR Session... (This is a demo)");
        }
    };

    const containerStyle = {
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        paddingTop: '100px', // Header space
        position: 'relative',
        overflow: 'hidden'
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.95)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)'
    };

    if (!isMobile) {
        return (
            <div style={containerStyle}>
                <div style={overlayStyle}>
                    <div className="glass-dark" style={{ padding: '3rem', maxWidth: '500px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <FaMobileAlt style={{ fontSize: '4rem', color: 'var(--color-accent)', marginBottom: '1.5rem' }} />
                        <h2 style={{ marginBottom: '1rem' }}>Mobile Device Required</h2>
                        <p style={{ color: '#aaa', marginBottom: '2rem', lineHeight: '1.6' }}>
                            The AR Experience relies on mobile sensors and camera input.
                            Please open this page on your iPhone or Android device.
                        </p>
                        <div style={{ padding: '1rem', background: 'white', display: 'inline-block', borderRadius: '10px' }}>
                            {/* Placeholder for QR Code */}
                            <div style={{ width: '150px', height: '150px', background: '#000', opacity: 0.1 }}></div>
                            <p style={{ color: '#000', margin: '0.5rem 0 0 0', fontWeight: 'bold', fontSize: '0.8rem' }}>SCAN QR CODE</p>
                        </div>
                        <div style={{ marginTop: '2rem' }}>
                            <Link to="/" className="btn btn-secondary">Return Home</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div className="glass" style={{ padding: '2rem', borderRadius: '20px', width: '100%', maxWidth: '400px' }}>
                <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>AR Try-On</h1>
                <p style={{ marginBottom: '2rem', color: '#ccc' }}>
                    Visualize custom grillz in real-time.
                </p>

                <div className="ar-viewport-placeholder" style={{
                    width: '100%',
                    height: '400px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '15px',
                    marginBottom: '2rem',
                    border: '1px dashed #444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                    <FaCamera style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
                    <span style={{ fontSize: '0.9rem', color: '#888' }}>Camera Feed Placeholder</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={requestUsage}>
                        {cameraPermission === 'granted' ? 'Start Session' : 'Enable Camera Access'}
                    </button>

                    <button
                        className="btn-text"
                        onClick={() => setShowDevicePopup(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-accent)', marginTop: '1rem', cursor: 'pointer' }}
                    >
                        View Compatible Devices
                    </button>

                    <Link to="/" style={{ color: '#666', fontSize: '0.9rem', marginTop: '1rem', textDecoration: 'none' }}>
                        Cancel
                    </Link>
                </div>
            </div>

            {/* Compatible Devices Modal */}
            {showDevicePopup && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 3000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '2rem'
                }} onClick={() => setShowDevicePopup(false)}>
                    <div
                        className="glass-dark"
                        style={{ padding: '2rem', width: '100%', maxWidth: '90%', maxHeight: '80vh', overflowY: 'auto' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0 }}>Compatible Devices</h3>
                            <button onClick={() => setShowDevicePopup(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem' }}>
                                <FaTimes />
                            </button>
                        </div>
                        <ul style={{ textAlign: 'left', color: '#ccc', lineHeight: '1.8' }}>
                            <li>iPhone 12 Pro / Pro Max (LiDAR)</li>
                            <li>iPhone 13 Pro / Pro Max</li>
                            <li>iPhone 14 Pro / Pro Max</li>
                            <li>iPad Pro (2020+)</li>
                            <li>Samsung Galaxy S20+ / Ultra</li>
                            <li>Google Pixel 5+</li>
                            <li>Wait for more...</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArExperience;
