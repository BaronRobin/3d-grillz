import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsContext = createContext(null);

/**
 * Analytics Provider component that tracks page views and clicks.
 * Sends data to a mock backend on the Raspberry Pi.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to wrap.
 * @param {Object} props.user - The currently authenticated user.
 * @returns {JSX.Element}
 */
export const AnalyticsProvider = ({ children, user }) => {
    const location = useLocation();
    const [clickLog, setClickLog] = useState([]);
    const [pageLog, setPageLog] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]); // Mock "Online" list

    // Track Page Views
    useEffect(() => {
        if (user) {
            const entry = {
                type: 'NAVIGATION',
                detail: `Visited ${location.pathname}`,
                timestamp: new Date().toISOString(),
                user: user.email
            };
            setPageLog(prev => [entry, ...prev].slice(0, 50)); // Keep last 50
            updateOnlineUser(user, entry);
        }
    }, [location, user]);

    // Track Clicks (Mock "Global" click listener)
    useEffect(() => {
        const handleClick = (e) => {
            if (user && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A')) {
                const entry = {
                    type: 'INTERACTION',
                    detail: `Clicked ${e.target.innerText || e.target.tagName}`,
                    timestamp: new Date().toISOString(),
                    user: user.email
                };
                setClickLog(prev => [entry, ...prev].slice(0, 50));
                updateOnlineUser(user, entry);
            }
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [user]);

    // Mock "Online Presence" (Update timestamp for user)
    const updateOnlineUser = (user, latestActivity) => {
        setOnlineUsers(prev => {
            const others = prev.filter(u => u.email !== user.email);
            return [{ ...user, lastActive: latestActivity.timestamp, lastAction: latestActivity.detail }, ...others];
        });
    };

    // Send logs to Raspberry Pi backend
    const sendLogsToPi = async () => {
        const PI_SERVER_URL = 'http://192.168.1.61:3001'; // Your Pi's IP
        const combined = getLiveFeed();

        if (combined.length === 0) return { success: false, message: 'No logs to send' };

        try {
            const response = await fetch(`${PI_SERVER_URL}/api/analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logs: combined })
            });

            const data = await response.json();
            console.log('Success! Logs sent to Pi:', data);
            return data;
        } catch (error) {
            console.error('Failed to send logs to Pi:', error);
            return { success: false, error: error.message };
        }
    };

    // Combined logs for Admin
    const getLiveFeed = () => {
        const combined = [...pageLog, ...clickLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return combined;
    };

    return (
        <AnalyticsContext.Provider value={{ getLiveFeed, onlineUsers, sendLogsToPi }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalytics = () => {
    return useContext(AnalyticsContext);
};
