import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMobileAlt, FaTimes, FaCamera } from 'react-icons/fa';
import '../App.css';

/**
 * AR Try-On Experience Page. Handles camera permissions and rendering the camera feed.
 * Requires a compatible mobile device.
 * @returns {JSX.Element}
 */
const ArExperience = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [showDevicePopup, setShowDevicePopup] = useState(false);
    const [cameraPermission, setCameraPermission] = useState('prompt'); // prompt, granted, denied

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);

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

    const videoRef = React.useRef(null);
    const [stream, setStream] = useState(null);

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const requestUsage = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            setStream(mediaStream);
            setCameraPermission('granted');
            // Wait for video ref to be available
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (err) {
            console.error("Camera error:", err);
            setCameraPermission('denied');
            alert("Could not access camera. Please ensure you have granted permission.");
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => stopCamera();
    }, [stream]);

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
            <div className="glass" style={{ padding: '2rem', borderRadius: '20px', width: '100%', maxWidth: '400px', zIndex: 2 }}>
                <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>AR Try-On</h1>
                <p style={{ marginBottom: '2rem', color: '#ccc' }}>
                    Visualize custom grillz in real-time.
                </p>

                <div className="ar-viewport-placeholder" style={{
                    width: '100%',
                    height: '400px',
                    background: '#000',
                    borderRadius: '15px',
                    marginBottom: '2rem',
                    border: '1px solid #333',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {cameraPermission === 'granted' ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <FaCamera style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
                            <span style={{ fontSize: '0.9rem', color: '#888' }}>Camera Feed Inactive</span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={requestUsage} disabled={cameraPermission === 'granted'}>
                        {cameraPermission === 'granted' ? 'Session Active' : 'Enable Camera Access'}
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
                            <li>iPhone 15 Pro / Pro Max</li>
                            <li>iPhone 16 Pro / Pro Max</li>
                            <li>iPhone 17 Pro / Pro Max</li>
                            <li>iPad Pro (2020+)</li>
                            <li>Samsung Galaxy S20+ and newer</li>
                            <li>Google Pixel 5 and newer</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArExperience;
