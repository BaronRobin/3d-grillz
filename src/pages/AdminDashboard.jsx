import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { Navigate } from 'react-router-dom';

/**
 * Admin Panel for managing orders and viewing live analytics.
 * Accessible only to users with the 'admin' role.
 * @returns {JSX.Element}
 */
const AdminDashboard = () => {
    const { user, orders, updateOrderStatus } = useAuth();
    const { getLiveFeed, onlineUsers, sendLogsToPi } = useAnalytics();
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'analytics'
    const [piStatus, setPiStatus] = useState(null);

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    const stages = ['Scan Received', '3D Design', 'Casting', 'Polishing', 'Delivery'];
    const logs = getLiveFeed();

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }} className="container">
            <div className="section-header fade-in-up">
                <h2 className="gradient-text">Mission Control</h2>
                <p style={{ color: '#aaa' }}>Admin Panel - {user.email}</p>
            </div>

            {/* Toggle Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    Order Management
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    Live Operations
                </button>
            </div>

            {activeTab === 'orders' && (
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Active Orders</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>User</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Model Model</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Current Stage</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(orders).map(([email, order]) => (
                                    <tr key={email} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>{email}</td>
                                        <td style={{ padding: '1rem' }}>{['Gold', 'Classic', 'Diamond'][order.modelType]}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                background: 'rgba(201, 169, 97, 0.1)',
                                                color: 'var(--color-accent)',
                                                fontSize: '0.85rem'
                                            }}>
                                                {stages[order.stage]}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <select
                                                value={order.stage}
                                                onChange={(e) => updateOrderStatus(email, parseInt(e.target.value))}
                                                style={{
                                                    padding: '0.5rem',
                                                    borderRadius: '5px',
                                                    background: '#222',
                                                    color: 'white',
                                                    border: '1px solid #444',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {stages.map((stage, idx) => (
                                                    <option key={idx} value={idx}>{stage}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                    {/* Online Users */}
                    <div className="glass" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4cd964', display: 'inline-block' }}></span>
                            Online Users
                        </h3>
                        {onlineUsers.length === 0 ? (
                            <p style={{ color: '#666' }}>No active users detected.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {onlineUsers.map((u, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {u.email[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{u.displayName}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>Last: {u.lastAction}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Live Feed */}
                    <div className="glass" style={{ padding: '2rem', maxHeight: '500px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Activity Feed</h3>
                            <button
                                className="btn btn-primary"
                                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                onClick={async () => {
                                    setPiStatus('Sending...');
                                    const result = await sendLogsToPi();
                                    setPiStatus(result.success ? '✅ Sent to Pi!' : '❌ Failed');
                                    setTimeout(() => setPiStatus(null), 3000);
                                }}
                            >
                                📤 Send to Pi
                            </button>
                        </div>
                        {piStatus && <div style={{ marginBottom: '1rem', padding: '0.5rem', background: 'rgba(201, 169, 97, 0.1)', borderRadius: '5px', textAlign: 'center', fontSize: '0.9rem' }}>{piStatus}</div>}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {logs.map((log, i) => (
                                <div key={i} style={{
                                    padding: '0.75rem',
                                    borderLeft: `3px solid ${log.type === 'NAVIGATION' ? '#5ac8fa' : '#ffcc00'}`,
                                    background: 'rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#aaa' }}>{log.user}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#555' }}>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.9rem' }}>{log.detail}</div>
                                </div>
                            ))}
                            {logs.length === 0 && <p style={{ color: '#444' }}>Waiting for events...</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
