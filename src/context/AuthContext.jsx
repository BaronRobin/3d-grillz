import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

import { supabase } from '../supabaseClient';

/**
 * Authentication Provider component that manages user state and mock order data.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to wrap.
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState({}); // Stores realtime active orders
    const [tickets, setTickets] = useState({}); // Stores realtime quote requests
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current session on mount
        const initializeSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@grillz.com';
                const parsedUser = {
                    email: session.user.email,
                    role: session.user.email === adminEmail ? 'admin' : 'user',
                    uid: session.user.id
                };
                setUser(parsedUser);
                if (parsedUser.role === 'admin') fetchAdminData();
            }
            setLoading(false);
        };
        initializeSession();

        // Listen for realtime auth changes (login/logout across tabs)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@grillz.com';
                const parsedUser = {
                    email: session.user.email,
                    role: session.user.email === adminEmail ? 'admin' : 'user',
                    uid: session.user.id
                };
                setUser(parsedUser);
                if (parsedUser.role === 'admin') fetchAdminData();
            } else {
                setUser(null);
                setTickets({});
                setOrders({});
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchAdminData = async () => {
        try {
            // Fetch tickets
            const { data: ticketData, error: tErr } = await supabase.from('tickets').select('*');
            if (!tErr && ticketData) {
                const ticketMap = {};
                ticketData.forEach(t => ticketMap[t.email] = { ...t, materialId: t.material_id });
                setTickets(ticketMap);
            }

            // Fetch orders
            const { data: orderData, error: oErr } = await supabase.from('orders').select('*');
            if (!oErr && orderData) {
                const orderMap = {};
                orderData.forEach(o => orderMap[o.email] = {
                    stage: o.current_stage,
                    modelType: o.model_type,
                    history: o.history,
                    name: o.name,
                    comments: o.comments,
                    device_os: o.device_os
                });
                setOrders(orderMap);
            }
        } catch (e) {
            console.error("Error fetching admin data:", e);
        }
    };

    const login = async (email, password) => {
        const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@grillz.com';
        const loginEmail = email.trim().toLowerCase() === 'admin' ? adminEmail : email;

        const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (error) throw error.message;

        return {
            email: data.user.email,
            role: data.user.email === adminEmail ? 'admin' : 'user'
        };
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    // Admin Action: Update Order Status
    const updateOrderStatus = async (userEmail, newStage) => {
        const { error } = await supabase
            .from('orders')
            .update({ current_stage: newStage })
            .eq('email', userEmail);

        if (!error) {
            setOrders(prev => ({
                ...prev,
                [userEmail]: {
                    ...prev[userEmail],
                    stage: newStage
                }
            }));
        } else {
            console.error("Failed to update status:", error);
        }
    };

    // Helper function to detect OS
    const getDeviceOS = () => {
        const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;
        if (/windows phone/i.test(userAgent)) return "Windows Phone";
        if (/android/i.test(userAgent)) return "Android";
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
        if (/Macintosh|Mac OS X/.test(userAgent)) return "Mac OS";
        if (/Windows NT/.test(userAgent)) return "Windows";
        if (/Linux/.test(userAgent)) return "Linux";
        return "Unknown";
    };

    // User Action: Submit Quote Request (Ticket)
    const submitQuoteRequest = async (userEmail, ticketDetails) => {
        const newTicket = {
            email: userEmail,
            name: ticketDetails.name || 'Unknown',
            material_id: ticketDetails.materialId || 'gold',
            comments: ticketDetails.comments || 'N/A',
            device_os: getDeviceOS(),
            status: 'pending'
        };

        const { error } = await supabase.from('tickets').insert([newTicket]);

        if (!error) {
            // Update local state instantly for UI
            setTickets(prev => ({
                ...prev,
                [userEmail]: {
                    ...newTicket,
                    created_at: new Date().toISOString()
                }
            }));
        } else {
            console.error("Failed to submit request to Supabase", error);
        }
    };

    // Admin Action: Approve Ticket (Creates Order)
    const approveTicket = async (email) => {
        const ticket = tickets[email];
        if (!ticket) return;

        const newOrder = {
            email: email,
            name: ticket.name,
            model_type: ticket.material_id === 'gold' ? 0 : 1,
            current_stage: 0,
            history: [{ stage: 'Quote Approved & Email Sent', date: new Date().toLocaleDateString() }],
            comments: ticket.comments,
            device_os: ticket.device_os
        };

        // Fire both queries to sync databases
        const [orderResp, ticketResp] = await Promise.all([
            supabase.from('orders').insert([newOrder]),
            supabase.from('tickets').update({ status: 'approved' }).eq('email', email)
        ]);

        if (!orderResp.error && !ticketResp.error) {
            // Add to orders local state
            setOrders(prev => ({
                ...prev,
                [email]: {
                    name: ticket.name,
                    stage: 0,
                    history: newOrder.history,
                    modelType: newOrder.model_type,
                    comments: ticket.comments
                }
            }));

            // Update ticket local status
            setTickets(prev => ({
                ...prev,
                [email]: { ...ticket, status: 'approved' }
            }));
        } else {
            console.error("Failed to convert ticket to order:", orderResp.error, ticketResp.error);
        }
    };

    // Admin Action: Delete Order and Revert Ticket
    const deleteOrder = async (email) => {
        // Drop the order
        const { error: orderError } = await supabase.from('orders').delete().eq('email', email);
        // Revert ticket to pending so it can be re-evaluated
        const { error: ticketError } = await supabase.from('tickets').update({ status: 'pending' }).eq('email', email);

        if (!orderError && !ticketError) {
            setOrders(prev => {
                const next = { ...prev };
                delete next[email];
                return next;
            });
            setTickets(prev => ({
                ...prev,
                [email]: { ...prev[email], status: 'pending' }
            }));
            return { success: true };
        } else {
            console.error("Failed to delete order:", orderError, ticketError);
            return { success: false, error: orderError || ticketError };
        }
    };

    // Admin Action: Deep Update Order Details
    const updateOrderDetails = async (email, updates) => {
        const payload = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.modelType !== undefined) payload.model_type = updates.modelType;
        if (updates.stage !== undefined) payload.current_stage = updates.stage;
        if (updates.adminNotes !== undefined) payload.admin_notes = updates.adminNotes;
        if (updates.comments !== undefined) payload.comments = updates.comments;

        const { error } = await supabase.from('orders').update(payload).eq('email', email);

        if (!error) {
            setOrders(prev => ({
                ...prev,
                [email]: {
                    ...prev[email],
                    ...updates
                }
            }));
            return { success: true };
        } else {
            console.error("Failed to deep update order:", error);
            return { success: false, error };
        }
    };

    // Admin Action: Update Ticket Status (Decline, Email)
    const updateTicketStatus = async (email, status) => {
        const { error } = await supabase.from('tickets').update({ status }).eq('email', email);
        if (!error) {
            setTickets(prev => ({
                ...prev,
                [email]: { ...prev[email], status }
            }));
        }
    };

    const getUserOrder = (email) => {
        return orders[email] || {
            stage: 1,
            history: [{ stage: 'Order Placed', date: new Date().toLocaleDateString() }],
            modelType: 0
        };
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            orders,
            tickets,
            updateOrderStatus,
            submitQuoteRequest,
            approveTicket,
            updateTicketStatus,
            getUserOrder,
            deleteOrder,
            updateOrderDetails
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
