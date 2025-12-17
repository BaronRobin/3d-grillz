import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import WebGLShowcase from '../components/WebGLShowcase';

const Dashboard = () => {
    const { user, getUserOrder } = useAuth();

    if (!user) return <Navigate to="/login" />;

    const order = getUserOrder(user.email);
    const stages = ['Scan Received', '3D Design', 'Casting', 'Polishing', 'Delivery'];
    const currentStage = order.stage;

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }} className="container">
            <div className="section-header fade-in-up">
                <h2 className="gradient-text">Your Dashboard</h2>
                <p style={{ color: '#aaa' }}>Welcome back, {user.displayName || 'Customer'}</p>
            </div>

            {/* Status Tracker */}
            <div className="glass" style={{ padding: '2rem', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ marginBottom: '2rem', fontSize: '1.25rem' }}>Order Status: <span style={{ color: 'var(--color-accent)' }}>{stages[currentStage]}</span></h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Progress Bar Background */}
                    <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '0',
                        width: '100%',
                        height: '2px',
                        background: '#333',
                        zIndex: 0
                    }}></div>

                    {/* Active Progress Bar */}
                    <div style={{
                        position: 'absolute',
                        top: '15px',
                        left: '0',
                        width: `${(currentStage / (stages.length - 1)) * 100}%`,
                        height: '2px',
                        background: 'var(--color-accent)',
                        zIndex: 0,
                        transition: 'width 1s ease'
                    }}></div>

                    {stages.map((stage, index) => (
                        <div key={index} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            zIndex: 1,
                            cursor: 'default',
                            opacity: index <= currentStage ? 1 : 0.5
                        }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: index <= currentStage ? 'var(--color-accent)' : '#1a1a1a',
                                border: `2px solid ${index <= currentStage ? 'var(--color-accent)' : '#444'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                color: index <= currentStage ? '#000' : '#888',
                                fontWeight: 'bold'
                            }}>
                                {index + 1}
                            </div>
                            <span style={{
                                fontSize: '0.8rem',
                                color: index === currentStage ? 'var(--color-accent)' : '#888',
                                fontWeight: index === currentStage ? 'bold' : 'normal',
                                display: window.innerWidth < 768 ? 'none' : 'block' // Hide text on mobile
                            }}>{stage}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {/* 3D Preview */}
                <div className="glass" style={{ padding: '0', overflow: 'hidden', minHeight: '400px' }}>
                    <WebGLShowcase />
                </div>

                {/* Details & Actions */}
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Order Details</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
                            <span style={{ color: '#888' }}>Model Type</span>
                            <span>{['Custom Molded Gold', 'Classic Grill', 'Diamond Cut'][order.modelType]}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
                            <span style={{ color: '#888' }}>Material</span>
                            <span>18k Yellow Gold</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #333' }}>
                            <span style={{ color: '#888' }}>Order Date</span>
                            <span>{order.history[0]?.date}</span>
                        </div>
                    </div>

                    <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Actions</h4>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Link to="/ar-experience" className="btn btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.9rem' }}>
                            Try in AR
                        </Link>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn btn-secondary"
                                style={{
                                    padding: '0.6rem 0.8rem',
                                    fontSize: '1.2rem',
                                    minWidth: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Email Support"
                            >
                                ✉
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{
                                    padding: '0.6rem 0.8rem',
                                    fontSize: '1.2rem',
                                    minWidth: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Call Support"
                            >
                                ☎
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
