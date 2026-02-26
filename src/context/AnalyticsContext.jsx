import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [visitorId] = useState(() => {
        let vid = sessionStorage.getItem('grillz_visitor_id');
        if (!vid) {
            vid = 'v_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('grillz_visitor_id', vid);
        }
        return vid;
    });

    // Track Page Views, Dwell Time, and Scroll Depth
    useEffect(() => {
        const startTime = Date.now();
        let maxScroll = 0;

        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            // Percentage scrolled (if no scrollbar, it's 100%)
            const winHeightPx = scrollHeight - clientHeight;
            const scrolled = winHeightPx > 0 ? Math.round((scrollTop / winHeightPx) * 100) : 100;

            if (scrolled > maxScroll) maxScroll = Math.min(scrolled, 100);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // When the user leaves the page or unmounts, log the elapsed event
        return () => {
            window.removeEventListener('scroll', handleScroll);
            const durationSec = Math.floor((Date.now() - startTime) / 1000);

            supabase.from('activity_logs').insert([{
                visitor_id: visitorId,
                user_email: user?.email || null,
                action_type: 'NAVIGATION',
                detail: `Visited ${location.pathname}`,
                session_duration_sec: durationSec,
                max_scroll_depth: maxScroll
            }]).then(({ error }) => {
                if (error) console.error("Telemetry error:", error);
            });

            // Still update online UI locally if signed in
            if (user) updateOnlineUser(user, { detail: `Visited ${location.pathname}`, timestamp: new Date().toISOString() });
        };
    }, [location, user, visitorId]);

    // Track Global Clicks
    useEffect(() => {
        const handleClick = (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button')) {
                const targetText = e.target.innerText || e.target.closest('button')?.innerText || e.target.tagName;

                supabase.from('activity_logs').insert([{
                    visitor_id: visitorId,
                    user_email: user?.email || null,
                    action_type: 'INTERACTION',
                    detail: `Clicked ${targetText}`,
                    session_duration_sec: null,
                    max_scroll_depth: null
                }]).then(({ error }) => {
                    if (error) console.error("Telemetry error:", error);
                });

                if (user) updateOnlineUser(user, { detail: `Clicked ${targetText}`, timestamp: new Date().toISOString() });
            }
        };

        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [user, visitorId]);

    // Mock "Online Presence"
    const updateOnlineUser = (user, latestActivity) => {
        setOnlineUsers(prev => {
            const others = prev.filter(u => u.email !== user.email);
            return [{ ...user, lastActive: latestActivity.timestamp, lastAction: latestActivity.detail }, ...others];
        });
    };

    // Fetch Historical Logs for Admin Dashboard
    const fetchActivityLogs = async (daysBack = 7) => {
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - daysBack);

        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .gte('timestamp', dateLimit.toISOString())
            .order('timestamp', { ascending: false })
            .limit(200);

        if (error) {
            console.error("Failed to fetch logs:", error);
            return [];
        }
        return data;
    };

    return (
        <AnalyticsContext.Provider value={{ fetchActivityLogs, onlineUsers }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalytics = () => {
    return useContext(AnalyticsContext);
};
