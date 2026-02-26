import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

const ForceReset = () => {
    const { user, forceUpdatePassword } = useAuth();
    const { logEvent } = useAnalytics();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            return setError('Password must be at least 6 characters.');
        }
        if (password !== confirm) {
            return setError('Passwords do not match.');
        }

        setLoading(true);
        const result = await forceUpdatePassword(password);

        if (result.success) {
            // Log security telemetry natively
            logEvent('SECURITY', 'Custom password set');
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'var(--color-bg)'
        }}>
            <div className="glass" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '3rem 2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                    background: 'linear-gradient(90deg, #ffcc00, #ff9500)'
                }}></div>

                <ShieldCheck size={48} color="#ffcc00" style={{ marginBottom: '1rem' }} />

                <h2 style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Secure Your Account</h2>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: '1.5' }}>
                    Welcome to your Mission Control. Before you can access your dashboard, please set a custom password for future logins.
                </p>

                {error && (
                    <div style={{
                        background: 'rgba(255, 59, 48, 0.1)',
                        color: '#ff3b30',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'left'
                    }}>
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color="#666" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color="#666" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem 1rem 1rem 3rem',
                                background: '#111',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            marginTop: '1rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {loading ? 'Securing Account...' : 'Set Password & Enter'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForceReset;
