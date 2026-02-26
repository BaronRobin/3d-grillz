import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import WebGLShowcase from '../components/WebGLShowcase';
import {
    FiMail,
    FiPhone,
    FiCheckCircle,
    FiActivity
} from 'react-icons/fi';
import {
    Layers,
    ExternalLink,
    Zap,
    Box
} from 'lucide-react';

/**
 * Premium Bento-style Dashboard Tile Component
 */
const BentoTile = ({ children, title, icon: Icon, gridArea, delay = 0 }) => (
    <div
        className="glass fade-in-up"
        style={{
            gridArea,
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden',
            animationDelay: `${delay}s`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            {Icon && <Icon size={18} color="var(--color-accent)" style={{ opacity: 0.8 }} />}
            <span style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                color: '#888',
                fontWeight: '600'
            }}>{title}</span>
        </div>
        {children}
    </div>
);

const Dashboard = () => {
    const { user, getUserOrder } = useAuth();

    if (!user) return <Navigate to="/login" />;

    const order = getUserOrder(user.email);

    const stages = ['Quote Approved', 'Scan Received', '3D Design', 'Revision Loop', 'Casting', 'Polishing', 'Delivery'];
    const currentStage = order.stage;

    return (
        <div style={{
            paddingTop: '110px',
            minHeight: '100vh',
            paddingBottom: '5rem',
            background: 'radial-gradient(circle at top right, #1a1a1a 0%, #000 100%)'
        }} className="container">

            {/* Main Grid Layout */}
            <div className="dashboard-grid">

                {/* TILE 1: ELITE HEADER */}
                <div style={{ gridArea: 'header', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                    <div className="fade-in-up">
                        <h2 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>
                            Welcome, {user.displayName || user.email.split('@')[0]}
                        </h2>
                        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: 0 }}>
                            Track your premium grillz craftsmanship in real-time.
                        </p>
                    </div>
                    <div className="glass-dark fade-in-up" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</div>
                            <div style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{stages[currentStage]}</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(201,169,97,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-accent)', boxShadow: '0 0 10px var(--color-accent)' }}></div>
                        </div>
                    </div>
                </div>

                {/* TILE 2: TIMELINE HUB */}
                <BentoTile title="Milestone Progress" icon={FiActivity} gridArea="timeline" delay={0.1}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '0.5rem', marginTop: '0.5rem' }}>
                        {stages.map((stage, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                gap: '1.25rem',
                                position: 'relative',
                                opacity: index <= currentStage ? 1 : 0.3,
                                transition: 'opacity 0.5s ease'
                            }}>
                                {/* Connection Line */}
                                {index !== stages.length - 1 && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '11px',
                                        top: '24px',
                                        width: '2px',
                                        height: '24px',
                                        background: index < currentStage ? 'var(--color-accent)' : '#333'
                                    }}></div>
                                )}

                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: index < currentStage ? 'var(--color-accent)' : index === currentStage ? '#000' : '#1a1a1a',
                                    border: `2px solid ${index <= currentStage ? 'var(--color-accent)' : '#444'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    zIndex: 1
                                }}>
                                    {index < currentStage && <FiCheckCircle size={14} color="#000" />}
                                    {index === currentStage && <div className="pulse" style={{ width: '8px', height: '8px', background: 'var(--color-accent)', borderRadius: '50%' }}></div>}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{
                                        fontSize: '0.9rem',
                                        color: index === currentStage ? 'var(--color-accent)' : '#fff',
                                        fontWeight: index === currentStage ? '700' : '400'
                                    }}>{stage}</span>
                                    {index === currentStage && <span style={{ fontSize: '0.7rem', color: '#666' }}>Est. Completion: 3 Days</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </BentoTile>

                {/* TILE 3: MAIN SHOWCASE */}
                <div style={{ gridArea: 'showcase', position: 'relative' }} className="fade-in-up">
                    <div className="glass" style={{ height: '100%', padding: '0', overflow: 'hidden', position: 'relative' }}>
                        <WebGLShowcase
                            modelUrl={order.ai_mesh_url || null}
                            forcedMaterial={order.ai_mesh_url ? { color: '#eec95e', roughness: 0.1 } : null}
                        />

                        {/* Overlay HUD */}
                        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', right: '2rem', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
                            <div className="glass-dark" style={{ padding: '1rem', pointerEvents: 'auto' }}>
                                <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>Model Integrity</div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: '12px', height: '4px', background: 'var(--color-accent)', borderRadius: '2px' }}></div>)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'auto' }}>
                                <button title="Toggle Rotation" className="glass-dark" style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Zap size={16} color="#fff" />
                                </button>
                                <button title="Full Screen" className="glass-dark" style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ExternalLink size={16} color="#fff" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TILE 4: TECH SPECS */}
                <BentoTile title="Material Blueprint" icon={Layers} gridArea="details" delay={0.2}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#888', fontSize: '0.85rem' }}>Model Class</span>
                            <span style={{ fontWeight: '600' }}>{['Custom Molded', 'Classic Edition', 'Diamond Limited'][order.modelType]}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ color: '#888', fontSize: '0.85rem' }}>Material</span>
                            <span style={{ fontWeight: '600' }}>18k Yellow Gold</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                            <span style={{ color: '#888', fontSize: '0.85rem' }}>Order Date</span>
                            <span style={{ fontWeight: '600' }}>{order.history?.[0]?.date || 'Today'}</span>
                        </div>
                    </div>
                </BentoTile>

                {/* TILE 5: QUICK ACTIONS */}
                <BentoTile title="Deep Interaction" icon={Zap} gridArea="actions" delay={0.3}>
                    <div style={{ display: 'flex', gap: '0.75rem', height: '100%', alignItems: 'center' }}>
                        <Link to="/ar-experience" className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', fontSize: '0.8rem' }}>
                            <Box size={16} /> AR VR
                        </Link>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-icon" title="Mail" onClick={() => window.location.href = 'mailto:contact@baron.com'}>
                                <FiMail size={18} />
                            </button>
                            <button className="btn btn-secondary btn-icon" title="Call" onClick={() => window.location.href = 'tel:+1234567890'}>
                                <FiPhone size={18} />
                            </button>
                        </div>
                    </div>
                </BentoTile>

            </div>
        </div>
    );
};

export default Dashboard;
