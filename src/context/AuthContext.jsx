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
        const initializeSession = async () => {
            // Check local storage for persisted admin/user session
            const storedUser = localStorage.getItem('grillz_user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                // If they are an admin, immediately fetch the live dashboard data
                if (parsedUser.role === 'admin') {
                    await fetchAdminData();
                }
            }
            setLoading(false);
        };
        initializeSession();
    }, []);

    const fetchAdminData = async () => {
        try {
            // Fetch tickets
            const { data: ticketData, error: tErr } = await supabase.from('tickets').select('*');
            if (!tErr && ticketData) {
                const ticketMap = {};
                ticketData.forEach(t => ticketMap[t.email] = {
                    ...t,
                    materialId: t.material_id
                });
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
                    comments: o.comments
                });
                setOrders(orderMap);
            }
        } catch (e) {
            console.error("Error fetching admin data:", e);
        }
    };

    const login = async (email, password) => {
        // Simple mock authentication simulating a backend token check
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email && password) {
                    // Determine role based on email
                    let role = 'user';
                    if (email.includes('admin')) {
                        role = 'admin';
                    } else if (email.includes('vip')) {
                        role = 'vip';
                    }

                    const newUser = {
                        email,
                        role,
                        displayName: email.split('@')[0],
                        uid: 'mock-uid-' + Date.now()
                    };
                    setUser(newUser);
                    localStorage.setItem('grillz_user', JSON.stringify(newUser));

                    // If login is successful, trigger safe data fetch if admin
                    if (role === 'admin') fetchAdminData();

                    resolve(newUser);
                } else {
                    reject("Invalid credentials");
                }
            }, 800);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('grillz_user');
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

    // User Action: Submit Quote Request (Ticket)
    const submitQuoteRequest = async (userEmail, ticketDetails) => {
        const newTicket = {
            email: userEmail,
            name: ticketDetails.name || 'Unknown',
            material_id: ticketDetails.materialId || 'gold',
            comments: ticketDetails.comments || 'N/A',
            date: new Date().toLocaleDateString(),
            status: 'pending'
        };

        const { error } = await supabase.from('tickets').insert([newTicket]);

        if (!error) {
            // Update local state instantly for UI
            setTickets(prev => ({
                ...prev,
                [userEmail]: {
                    email: userEmail,
                    date: newTicket.date,
                    status: 'pending',
                    ...ticketDetails
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
            model_type: ticket.materialId === 'gold' ? 0 : 1,
            current_stage: 0,
            history: [{ stage: 'Order Approved & Login Sent', date: new Date().toLocaleDateString() }],
            comments: ticket.comments
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
            getUserOrder
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
