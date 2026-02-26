import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper component that protects routes requiring authentication.
 * It also seamlessly traps users who need to forcibly reset their password.
 */
export const PrivateRoute = ({ children, requireAdmin = false }) => {
    const { user, orders, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: '#5ac8fa' }}>
                Authenticating...
            </div>
        );
    }

    if (!user) {
        // Not logged in
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== 'admin') {
        // Logged in, but lacks admin clearance
        return <Navigate to="/dashboard" replace />;
    }

    // Trap Door Logic for Standard Users
    if (user.role === 'user' && orders[user.email]?.needs_password_change) {
        return <Navigate to="/force-reset" replace />;
    }

    // Passed all guards
    return children;
};
