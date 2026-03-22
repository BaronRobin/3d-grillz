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
    const [orders, setOrders] = useState({});
    const [tickets, setTickets] = useState({});
    const [messages, setMessages] = useState({});
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
                if (parsedUser.role === 'admin') {
                    fetchAdminData();
                } else {
                    fetchUserData(parsedUser.email);
                }
            }
            setLoading(false);
        };
        initializeSession();

        // Listen for realtime auth changes (login/logout across tabs)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@grillz.com';
                const parsedUser = {
                    email: session.user.email,
                    role: session.user.email === adminEmail ? 'admin' : 'user',
                    uid: session.user.id
                };
                setUser(parsedUser);
                if (parsedUser.role === 'admin') {
                    fetchAdminData();
                } else {
                    fetchUserData(parsedUser.email);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setTickets({});
                setOrders({});
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchAdminData = async () => {
        try {
            // Fetch tickets (all statuses — pending, approved, declined)
            const { data: ticketData, error: tErr } = await supabase.from('tickets').select('*');
            if (!tErr && ticketData) {
                const ticketMap = {};
                ticketData.forEach(t => ticketMap[t.email] = { ...t, materialId: t.material_id });
                setTickets(ticketMap);
            }

            // Fetch orders (all stages)
            const { data: orderData, error: oErr } = await supabase.from('orders').select('*');
            if (!oErr && orderData) {
                const orderMap = {};
                orderData.forEach(o => orderMap[o.email] = {
                    stage: o.current_stage,
                    modelType: o.model_type,
                    history: o.history,
                    name: o.name,
                    comments: o.comments,
                    admin_notes: o.admin_notes,
                    device_os: o.device_os,
                    needs_password_change: o.needs_password_change,
                    ai_mesh_url: o.ai_mesh_url,
                    custom_designs: o.custom_designs || [],
                    original_quote: o.original_quote || null
                });
                setOrders(orderMap);
            }
        } catch (e) {
            console.error('Error fetching admin data:', e);
        }
    };

    const fetchUserData = async (email) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('email', email)
                .single();

            if (!error && data) {
                setOrders(prev => ({
                    ...prev,
                    [email]: {
                        stage: data.current_stage,
                        modelType: data.model_type,
                        history: data.history,
                        name: data.name,
                        comments: data.comments,
                        admin_notes: data.admin_notes,
                        device_os: data.device_os,
                        needs_password_change: data.needs_password_change,
                        ai_mesh_url: data.ai_mesh_url,
                        custom_designs: data.custom_designs || [],
                        original_quote: data.original_quote || null
                    }
                }));

                // Fetch this user's messages
                fetchMessages(email);
            }
        } catch (e) {
            console.error("Error fetching user data:", e);
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

    const sendMagicLink = async (email) => {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
        if (error) throw error.message;
        return { success: true };
    };

    const forceUpdatePassword = async (newPassword) => {
        if (!user) return { success: false, error: 'Not authenticated' };

        const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
        if (authError) return { success: false, error: authError.message };

        // Unlock the trap door
        const { error: dbError } = await supabase.from('orders').update({ needs_password_change: false }).eq('email', user.email);
        if (dbError) return { success: false, error: dbError.message };

        setOrders(prev => ({
            ...prev,
            [user.email]: { ...prev[user.email], needs_password_change: false }
        }));

        return { success: true };
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

        const { error } = await supabase.from('tickets').upsert([newTicket], { onConflict: 'email' });

        if (!error) {
            // Update local state instantly for UI
            setTickets(prev => ({
                ...prev,
                [userEmail]: {
                    ...newTicket,
                    created_at: new Date().toISOString()
                }
            }));
            return { success: true };
        } else {
            console.error("Failed to submit request to Supabase", error);
            return { success: false, error };
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
            device_os: ticket.device_os,
            ai_mesh_url: ticket.ai_mesh_url,
            // Snapshot the full original ticket so it's never lost
            original_quote: {
                name: ticket.name,
                email: email,
                material_id: ticket.material_id,
                comments: ticket.comments,
                device_os: ticket.device_os,
                created_at: ticket.created_at,
                status: 'approved'
            }
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
                    comments: ticket.comments,
                    needs_password_change: true,
                    ai_mesh_url: ticket.ai_mesh_url,
                    custom_designs: [],
                    original_quote: newOrder.original_quote
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

    // Admin Action: Delete Order and Archive Ticket
    const deleteOrder = async (email) => {
        // Drop the active order
        const { error: orderError } = await supabase.from('orders').delete().eq('email', email);
        // Move the ticket to 'declined' so it shows up in Archived instead of returning to Requests
        const { error: ticketError } = await supabase.from('tickets').update({ status: 'declined' }).eq('email', email);

        if (!orderError && !ticketError) {
            setOrders(prev => {
                const next = { ...prev };
                delete next[email];
                return next;
            });
            setTickets(prev => ({
                ...prev,
                [email]: { ...prev[email], status: 'declined' }
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
        } else {
            console.error("Failed to update ticket form:", error);
        }
    };

    // Admin Action: Download and permanently host AI Mesh URL to ticket/order
    const saveAiMeshToTicket = async (email, temporaryUrl) => {
        try {
            // 1. Download the short-lived model directly into browser memory
            // Note: Tripo3D S3 URLs have permissive CORS, proxying large binaries often corrupts them
            const fetchRes = await fetch(temporaryUrl);
            if (!fetchRes.ok) throw new Error("Failed to download mesh. " + fetchRes.statusText);
            const blob = await fetchRes.blob();

            // 2. Upload it permanently to our own Supabase Storage bucket
            const fileName = `ai_mesh_${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.glb`;
            const { error: uploadError } = await supabase.storage
                .from('designs')
                .upload(fileName, blob, { contentType: 'model/gltf-binary' });

            if (uploadError) throw uploadError;

            // 3. Obtain the permanent public URL
            const { data: { publicUrl } } = supabase.storage
                .from('designs')
                .getPublicUrl(fileName);

            // 4. Update the DB ticket AND order with the permanent URL
            const { error: tErr } = await supabase.from('tickets').update({ ai_mesh_url: publicUrl }).eq('email', email);
            const { error: oErr } = await supabase.from('orders').update({ ai_mesh_url: publicUrl }).eq('email', email);
            
            if (tErr) console.warn("Could not update ticket AI URL:", tErr);
            if (oErr) console.warn("Could not update order AI URL:", oErr);

            // 5. Update local React state for both
            setTickets(prev => ({
                ...prev,
                [email]: { ...prev[email], ai_mesh_url: publicUrl }
            }));
            
            if (orders[email]) {
                setOrders(prev => ({
                    ...prev,
                    [email]: { ...prev[email], ai_mesh_url: publicUrl }
                }));
            }

            return { success: true };
        } catch (error) {
            console.error("Failed to host AI mesh:", error);
            return { success: false, error: error.message };
        }
    };

    // Admin Action: Upload Custom 3D Design
    const uploadCustomDesign = async (email, file, variantName) => {
        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('designs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('designs')
                .getPublicUrl(filePath);

            // 3. Append to orders.custom_designs JSONB array
            const currentDesigns = orders[email]?.custom_designs || [];
            const newDesign = {
                variant_name: variantName,
                url: publicUrl,
                uploaded_at: new Date().toISOString()
            };
            const updatedDesigns = [...currentDesigns, newDesign];

            const { error: dbError } = await supabase
                .from('orders')
                .update({ custom_designs: updatedDesigns })
                .eq('email', email);

            if (dbError) throw dbError;

            // 4. Update local state
            setOrders(prev => ({
                ...prev,
                [email]: { ...prev[email], custom_designs: updatedDesigns }
            }));

            return { success: true };
        } catch (error) {
            console.error("Failed to upload custom design:", error);
            return { success: false, error: error.message };
        }
    };

    // Admin Action: Approve ticket AND create auth account with temp password
    const TEMP_PASSWORD = 'WelcomeOnboard!';

    const approveAndInvite = async (email) => {
        try {
            // 1. Snapshot ticket data BEFORE signUp — signUp may fire auth listeners
            //    that reset state, causing approveTicket to see an empty tickets map.
            const ticket = tickets[email];
            if (!ticket) return { success: false, error: 'Ticket not found' };

            // 2. Create Supabase auth account with the temporary password
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password: TEMP_PASSWORD
            });

            // Ignore "already registered" — user might already have an account
            if (signUpError && !signUpError.message.toLowerCase().includes('already registered')) {
                return { success: false, error: signUpError.message };
            }

            // 3. Build the order using the pre-captured ticket (immune to state flush)
            const newOrder = {
                email,
                name: ticket.name,
                model_type: ticket.material_id === 'gold' ? 0 : 1,
                current_stage: 0,
                history: [{ stage: 'Quote Approved & Email Sent', date: new Date().toLocaleDateString() }],
                comments: ticket.comments,
                device_os: ticket.device_os,
                ai_mesh_url: ticket.ai_mesh_url,
                needs_password_change: true,
                original_quote: {
                    name: ticket.name,
                    email,
                    material_id: ticket.material_id,
                    comments: ticket.comments,
                    device_os: ticket.device_os,
                    created_at: ticket.created_at,
                    status: 'approved'
                }
            };

            const [orderResp, ticketResp] = await Promise.all([
                supabase.from('orders').insert([newOrder]),
                supabase.from('tickets').update({ status: 'approved' }).eq('email', email)
            ]);

            if (orderResp.error || ticketResp.error) {
                return { success: false, error: (orderResp.error || ticketResp.error).message };
            }

            // 4. Update local state immediately so UI reflects the change
            setOrders(prev => ({
                ...prev,
                [email]: {
                    name: ticket.name,
                    stage: 0,
                    history: newOrder.history,
                    modelType: newOrder.model_type,
                    comments: ticket.comments,
                    needs_password_change: true,
                    ai_mesh_url: ticket.ai_mesh_url,
                    custom_designs: [],
                    original_quote: newOrder.original_quote
                }
            }));

            setTickets(prev => ({
                ...prev,
                [email]: { ...ticket, status: 'approved' }
            }));

            return { success: true };
        } catch (e) {
            console.error('approveAndInvite failed:', e);
            return { success: false, error: e.message };
        }
    };


    // Admin Action: Trigger Password Reset Loop
    const triggerPasswordReset = async (email) => {
        const { error: dbError } = await supabase.from('orders').update({ needs_password_change: true }).eq('email', email);
        if (dbError) return { success: false, error: dbError.message };

        const { error: authError } = await supabase.auth.signInWithOtp({ email });
        if (authError) return { success: false, error: authError.message };

        setOrders(prev => ({
            ...prev,
            [email]: { ...prev[email], needs_password_change: true }
        }));
        return { success: true };
    };

    const getUserOrder = (email) => {
        return orders[email] || {
            stage: 1,
            history: [{ stage: 'Order Placed', date: new Date().toLocaleDateString() }],
            modelType: 0
        };
    };

    // --- In-App Messaging ---

    const fetchMessages = async (orderEmail) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('order_email', orderEmail)
            .order('created_at', { ascending: true });

        if (!error && data) {
            setMessages(prev => ({ ...prev, [orderEmail]: data }));
        }
    };

    const sendMessage = async (orderEmail, body) => {
        const sender = user?.role === 'admin' ? 'admin' : user?.email;
        const newMsg = {
            order_email: orderEmail,
            sender,
            body,
            read: false
        };

        const { data, error } = await supabase.from('messages').insert([newMsg]).select().single();

        if (!error && data) {
            setMessages(prev => ({
                ...prev,
                [orderEmail]: [...(prev[orderEmail] || []), data]
            }));
            return null;
        } else {
            console.error('Failed to send message:', error);
            return error;
        }
    };

    const markMessagesRead = async (orderEmail) => {
        // Mark all messages in this thread as read for the other party
        const senderFilter = user?.role === 'admin' ? user?.email : 'admin';
        await supabase
            .from('messages')
            .update({ read: true })
            .eq('order_email', orderEmail)
            .neq('sender', senderFilter);

        setMessages(prev => ({
            ...prev,
            [orderEmail]: (prev[orderEmail] || []).map(m =>
                m.sender !== user.email ? { ...m, read: true } : m
            )
        }));
    };

    return (
        <AuthContext.Provider value={{
            user,
            orders,
            tickets,
            messages,
            loading,
            login,
            sendMagicLink,
            logout,
            fetchAdminData,
            updateOrderStatus,
            submitQuoteRequest,
            approveTicket,
            updateTicketStatus,
            deleteOrder,
            updateOrderDetails,
            forceUpdatePassword,
            triggerPasswordReset,
            approveAndInvite,
            getUserOrder,
            saveAiMeshToTicket,
            uploadCustomDesign,
            sendMessage,
            fetchMessages,
            markMessagesRead
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
