import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { Navigate } from 'react-router-dom';
import { CalendarDays, User as UserIcon, Compass, MousePointerClick, Clock, FileText, Box, Eye, MessageSquare } from 'lucide-react';
import { generateGrillzMesh } from '../services/tripoApi';
import WebGLShowcase from '../components/WebGLShowcase';
import UserWebGLShowcase from '../components/UserWebGLShowcase';
import MessageThread from '../components/MessageThread';

const AdminDashboard = () => {
    const { user, tickets, orders, messages, loading, fetchAdminData, logout, approveTicket, approveAndInvite, updateTicketStatus, updateOrderStatus, deleteOrder, updateOrderDetails, triggerPasswordReset, saveAiMeshToTicket, uploadCustomDesign } = useAuth();
    const { fetchActivityLogs, onlineUsers } = useAnalytics();
    const [activeTab, setActiveTab] = useState('tickets');
    const [logs, setLogs] = useState([]);
    const [daysBack, setDaysBack] = useState(7);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [invitingUser, setInvitingUser] = useState(null); // tracks in-progress invites

    // Deep Edit State
    const [editingUser, setEditingUser] = useState(null);
    const [userLogs, setUserLogs] = useState([]);
    const [deleteInput, setDeleteInput] = useState('');
    const [editForm, setEditForm] = useState({ name: '', modelType: '', stage: '', adminNotes: '' });
    const [editTab, setEditTab] = useState('data'); // 'data' | 'messages'

    // Custom Design Upload State
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadVariantName, setUploadVariantName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Preview State
    const [previewUser, setPreviewUser] = useState(null);

    // AI Generation State
    const [generatingAiFor, setGeneratingAiFor] = useState(null);

    const handleGenerateAi = async (email, comments) => {
        try {
            setGeneratingAiFor(email);
            const modelUrl = await generateGrillzMesh(comments);
            const res = await saveAiMeshToTicket(email, modelUrl);
            if (!res.success) {
                throw new Error("Could not save to Supabase Storage: " + res.error + "\n\n(Tip: Does the 'designs' storage bucket exist? Does it have public INSERT policies?)");
            }
        } catch (err) {
            alert("AI Generation Error: " + err.message);
        } finally {
            setGeneratingAiFor(null);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'analytics') {
            setIsLoadingLogs(true);
            fetchActivityLogs(daysBack).then(data => {
                setLogs(data);
                setIsLoadingLogs(false);
            });
        }
    }, [activeTab, daysBack]);

    const getTopDays = () => {
        const dayCounts = {};
        logs.forEach(log => {
            const dateStr = new Date(log.timestamp).toLocaleDateString();
            if (!dayCounts[dateStr]) dayCounts[dateStr] = new Set();
            dayCounts[dateStr].add(log.visitor_id);
        });
        return Object.entries(dayCounts)
            .map(([date, visitors]) => ({ date, uniqueCount: visitors.size }))
            .sort((a, b) => b.uniqueCount - a.uniqueCount)
            .slice(0, 3);
    };

    if (!user || user.role !== 'admin') return <Navigate to="/login" />;

    const stages = ['Quote Approved & Email Sent', 'Scan Received', '3D Design', 'Revision Loop', 'Casting', 'Polishing', 'Delivery'];
    const topDays = getTopDays();

    // Group ACTIVE orders (stages 0-5) by stage for Kanban
    const activeStages = stages.slice(0, 6); // exclude 'Delivery' (index 6) from active board
    const kanbanColumns = activeStages.map((stage, idx) => ({
        stage,
        idx,
        orders: Object.entries(orders).filter(([, o]) => o.stage === idx)
    }));

    // Archived: declined tickets + delivered orders (stage 6)
    const declinedTickets = Object.entries(tickets || {}).filter(([, t]) => t.status === 'declined');
    const deliveredOrders = Object.entries(orders || {}).filter(([, o]) => o.stage === 6);

    // Count unread messages across all threads (sent to admin)
    const unreadCount = Object.values(messages).flat().filter(m => m.sender !== 'admin' && !m.read).length;

    const openEdit = async (email) => {
        setEditingUser(email);
        setEditTab('data');
        setDeleteInput('');
        setEditForm({
            name: orders[email]?.name || '',
            modelType: orders[email]?.modelType || 0,
            stage: orders[email]?.stage || 0,
            adminNotes: orders[email]?.admin_notes || ''
        });
        const hist = await fetchActivityLogs(30);
        setUserLogs(hist.filter(l => l.user_email === email || l.visitor_id === email));
    };

    const tabBtnStyle = (tab) => ({
        padding: '0.5rem 1.2rem',
        borderRadius: '20px',
        border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.1)',
        background: activeTab === tab ? 'var(--color-accent)' : 'transparent',
        color: activeTab === tab ? '#000' : '#ccc',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: activeTab === tab ? '700' : '400',
        letterSpacing: '0.5px',
        transition: 'all 0.2s',
        position: 'relative'
    });

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }} className="container">
            <div className="section-header fade-in-up">
                <h2 className="gradient-text">Mission Control</h2>
                <p style={{ color: '#aaa' }}>Admin Panel — {user.email}</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
                {[
                    { id: 'tickets', label: 'Requests' },
                    { id: 'orders', label: 'Order Board' },
                    { id: 'messages', label: 'Messages', badge: unreadCount },
                    { id: 'archived', label: 'Archived' },
                    { id: 'analytics', label: 'Live Operations' }
                ].map(({ id, label, badge }) => (
                    <button key={id} style={tabBtnStyle(id)} onClick={() => setActiveTab(id)}>
                        {label}
                        {badge > 0 && (
                            <span style={{
                                position: 'absolute', top: '-6px', right: '-6px',
                                background: '#ff3b30', color: '#fff',
                                fontSize: '0.6rem', fontWeight: 'bold',
                                width: '16px', height: '16px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>{badge}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ===== QUOTE REQUESTS ===== */}
            {activeTab === 'tickets' && (
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Incoming Quote Requests</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Client</th>
                                    <th className="hide-on-mobile" style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Material</th>
                                    <th className="hide-on-mobile" style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Comments</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(tickets || {})
                                    .filter(([_, t]) => (t.status || 'pending').toLowerCase() === 'pending')
                                    .map(([email, ticket]) => {
                                        const emailBody = encodeURIComponent(
                                            `Hi ${ticket.name},\n\nThank you for your quote request for ${ticket.materialId || ticket.material_id} grillz.\n\nI've reviewed your request and would love to get started. Please let me know if you have any additional details.\n\nBest,\nRobin Baron`
                                        );
                                        const emailSubject = encodeURIComponent(`Re: Your Custom Grillz Quote Request`);
                                        return (
                                            <tr key={email} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                                                    <div>{ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : ticket.date}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                                        {ticket.created_at ? new Date(ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{ticket.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{email}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#5ac8fa', marginTop: '4px' }}>{ticket.device_os || 'Unknown Device'}</div>
                                                </td>
                                                <td className="hide-on-mobile" style={{ padding: '1rem', textTransform: 'capitalize' }}>{ticket.materialId || ticket.material_id}</td>
                                                <td className="hide-on-mobile" style={{ padding: '1rem', maxWidth: '300px' }}>
                                                    <div style={{ fontSize: '0.9rem', color: '#ccc', maxHeight: '60px', overflowY: 'auto' }}>{ticket.comments}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {/* Approve & Invite — creates account + sends invite email */}
                                                        <button
                                                            className="btn btn-primary"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', opacity: invitingUser === email ? 0.6 : 1 }}
                                                            disabled={invitingUser === email}
                                                            onClick={async () => {
                                                                setInvitingUser(email);
                                                                const res = await approveAndInvite(email);
                                                                setInvitingUser(null);
                                                                if (res.success) {
                                                                    // Open pre-filled invite email
                                                                    const subject = encodeURIComponent('Your Custom Grillz Order Has Been Approved');
                                                                    const body = encodeURIComponent(
                                                                        `Hi ${ticket.name},\n\nGreat news — your quote request for ${(ticket.materialId || ticket.material_id || 'custom grillz').replace(/_/g, ' ')} has been reviewed and approved.\n\nYour client dashboard is now live. You can log in using the details below:\n\n  URL: https://baronrobin.github.io/3d-grillz/#/login\n  Email: ${email}\n  Temporary password: WelcomeOnboard!\n\nYou will be prompted to choose your own password on your first login.\n\nFrom your dashboard you can:\n  • Track the progress of your order in real time\n  • View your 3D design previews\n  • Send messages directly to the team\n\nDon't hesitate to reach out if you have any questions.\n\nBest,\nRobin Baron`
                                                                    );
                                                                    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
                                                                } else {
                                                                    alert('Invite failed: ' + res.error);
                                                                }
                                                            }}
                                                        >
                                                            {invitingUser === email ? 'Processing...' : 'Approve & Invite'}
                                                        </button>

                                                        {/* Decline */}
                                                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px' }} onClick={() => updateTicketStatus(email, 'declined')}>Decline</button>

                                                        {/* Draft Reply — contextual email with full request details */}
                                                        <a
                                                            href={`mailto:${email}?subject=${encodeURIComponent('Re: Your Custom Grillz Quote Request')}&body=${encodeURIComponent(
                                                                `Hi ${ticket.name},\n\nThank you for reaching out about your custom grillz request.\n\nHere's a summary of what you submitted:\n  Material: ${(ticket.materialId || ticket.material_id || 'N/A').replace(/_/g, ' ')}\n  Device: ${ticket.device_os || 'Unknown'}\n  Your notes: "${ticket.comments || 'None provided'}"\n\nI'm currently reviewing your request and will get back to you shortly with next steps.\n\nBest,\nRobin Baron`
                                                            )}`}
                                                            className="btn btn-secondary"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', textDecoration: 'none', color: '#aaa' }}
                                                        >
                                                            Draft Reply
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                {Object.values(tickets || {}).filter(t => (t.status || 'pending').toLowerCase() === 'pending').length === 0 && (
                                    <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No pending quote requests.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== KANBAN ORDER BOARD ===== */}
            {activeTab === 'orders' && (
                <div>
                    <h3 style={{ marginBottom: '1.5rem' }}>Order Pipeline</h3>
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        overflowX: 'auto',
                        paddingBottom: '1rem',
                        alignItems: 'flex-start'
                    }}>
                        {kanbanColumns.map(({ stage, idx, orders: colOrders }) => (
                            <div key={idx} style={{
                                minWidth: '220px',
                                maxWidth: '220px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.06)',
                                padding: '1rem',
                                flexShrink: 0
                            }}>
                                {/* Column header */}
                                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: colOrders.length > 0 ? 'var(--color-accent)' : '#555' }}>
                                        {stage}
                                    </span>
                                    {colOrders.length > 0 && (
                                        <span style={{
                                            background: 'rgba(201,169,97,0.15)',
                                            color: 'var(--color-accent)',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            padding: '2px 8px',
                                            borderRadius: '20px'
                                        }}>{colOrders.length}</span>
                                    )}
                                </div>

                                {/* Cards */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {colOrders.length === 0 ? (
                                        <div style={{ padding: '1rem', textAlign: 'center', color: '#333', fontSize: '0.8rem', borderRadius: '8px', border: '1px dashed #222' }}>Empty</div>
                                    ) : (
                                        colOrders.map(([email, order]) => {
                                            const threadMsgs = messages[email] || [];
                                            const unread = threadMsgs.filter(m => m.sender !== 'admin' && !m.read).length;
                                            return (
                                                <div key={email} style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    borderRadius: '10px',
                                                    padding: '0.85rem',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    position: 'relative'
                                                }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,97,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,169,97,0.3)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                                                    onClick={() => openEdit(email)}
                                                >
                                                    {unread > 0 && (
                                                        <div style={{
                                                            position: 'absolute', top: '8px', right: '8px',
                                                            background: '#ff3b30', color: '#fff', fontSize: '0.6rem',
                                                            width: '14px', height: '14px', borderRadius: '50%',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                                                        }}>{unread}</div>
                                                    )}
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{order.name || email.split('@')[0]}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '6px' }}>{email}</div>
                                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: '0.65rem', background: 'rgba(201,169,97,0.1)', color: 'var(--color-accent)', padding: '2px 6px', borderRadius: '4px' }}>
                                                            {['Gold', 'Classic', 'Diamond'][order.modelType] || 'Standard'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        style={{ marginTop: '0.6rem', width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#888', borderRadius: '6px', padding: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                                                        onClick={e => { e.stopPropagation(); openEdit(email); }}
                                                    >
                                                        Manage →
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== ALL USERS ===== */}
            {activeTab === 'archived' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Delivered orders */}
                    <div className="glass" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>
                            ✓ Delivered Orders
                        </h3>
                        {deliveredOrders.length === 0 ? (
                            <p style={{ color: '#555' }}>No delivered orders yet.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #333' }}>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#888' }}>Client</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#888' }}>Material</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#888' }}>Original Request</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#888' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {deliveredOrders.map(([email, order]) => (
                                            <tr key={email} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{order.name || email.split('@')[0]}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{email}</div>
                                                </td>
                                                <td style={{ padding: '0.75rem', textTransform: 'capitalize', color: '#aaa' }}>
                                                    {order.original_quote?.material_id || ['Gold', 'Classic', 'Diamond'][order.modelType] || '—'}
                                                </td>
                                                <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.85rem', maxWidth: '260px' }}>
                                                    {order.original_quote?.comments || order.comments || '—'}
                                                </td>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px' }} onClick={() => openEdit(email)}>
                                                        View →
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Declined tickets */}
                    <div className="glass" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: '#ff3b30' }}>
                            ✕ Declined Requests
                        </h3>
                        {declinedTickets.length === 0 ? (
                            <p style={{ color: '#555' }}>No declined requests.</p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #333' }}>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#888' }}>Client</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#888' }}>Material</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#888' }}>Notes</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem', color: '#888' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {declinedTickets.map(([email, ticket]) => (
                                            <tr key={email} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                <td style={{ padding: '0.75rem' }}>
                                                    <div style={{ fontWeight: 600 }}>{ticket.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>{email}</div>
                                                </td>
                                                <td style={{ padding: '0.75rem', textTransform: 'capitalize', color: '#aaa' }}>
                                                    {ticket.materialId || ticket.material_id || '—'}
                                                </td>
                                                <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.85rem', maxWidth: '260px' }}>
                                                    {ticket.comments || '—'}
                                                </td>
                                                <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                    {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ===== MESSAGES ===== */}
            {activeTab === 'messages' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {Object.keys(orders).length === 0 ? (
                        <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No active orders to message.</div>
                    ) : (
                        Object.entries(orders).map(([email, order]) => {
                            const threadMsgs = messages[email] || [];
                            const unread = threadMsgs.filter(m => m.sender !== 'admin' && !m.read).length;
                            return (
                                <div key={email} className="glass" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{order.name || email.split('@')[0]}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888' }}>{email}</div>
                                        </div>
                                        {unread > 0 && (
                                            <span style={{ background: '#ff3b30', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '20px' }}>
                                                {unread} unread
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ height: '350px' }}>
                                        <MessageThread orderEmail={email} label={`Chat with ${order.name || email.split('@')[0]}`} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* ===== ANALYTICS ===== */}
            {activeTab === 'analytics' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                        <div className="glass" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4cd964', display: 'inline-block', boxShadow: '0 0 10px #4cd964' }}></span>
                                Active Sign-Ins
                            </h3>
                            {onlineUsers.length === 0 ? (
                                <p style={{ color: '#666' }}>No active user sessions.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {onlineUsers.map((u, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                            <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {u.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{u.email}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>Last: {u.lastAction}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="glass" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>📅 Top 3 High-Volume Days</h3>
                            {topDays.length === 0 ? (
                                <p style={{ color: '#666' }}>Not enough data collected yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {topDays.map((td, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{i + 1}. {td.date}</div>
                                            <div style={{ color: '#5ac8fa', fontWeight: 'bold' }}>{td.uniqueCount} Unique Visitors</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '2rem', marginTop: '2rem', maxHeight: '600px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                            <h3>Cloud Telemetry Feed</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.9rem', color: '#888' }}>Date Range:</span>
                                <select value={daysBack} onChange={(e) => setDaysBack(Number(e.target.value))} style={{ padding: '0.5rem', borderRadius: '5px', background: '#222', color: 'white', border: '1px solid #444' }}>
                                    <option value={1}>Last 24 Hours</option>
                                    <option value={7}>Last 7 Days</option>
                                    <option value={30}>Last 30 Days</option>
                                </select>
                            </div>
                        </div>
                        {isLoadingLogs ? (
                            <p style={{ color: '#888', textAlign: 'center' }}>Syncing with Supabase...</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {logs.map((log) => {
                                    const isNav = log.action_type === 'NAVIGATION';
                                    const isAi = log.action_type === 'AI_GENERATION';
                                    const color = isAi ? '#c9a961' : (isNav ? '#5ac8fa' : '#ffcc00');
                                    return (
                                        <div key={log.id} style={{ padding: '1rem', borderLeft: `3px solid ${color}`, background: 'rgba(0,0,0,0.2)', borderRadius: '0 8px 8px 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#ccc', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                                    <UserIcon size={14} color="#888" /> {log.visitor_id} {log.user_email ? `(${log.user_email})` : ''}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(log.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {isAi ? <Box size={16} color={color} /> : (isNav ? <Compass size={16} color={color} /> : <MousePointerClick size={16} color={color} />)}
                                                {log.detail}
                                            </div>
                                            {(log.session_duration_sec !== null || log.max_scroll_depth !== null) && (
                                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#888', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '6px' }}>
                                                    {log.session_duration_sec !== null && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Clock size={14} /> <span>{Math.floor(log.session_duration_sec / 60)}m {log.session_duration_sec % 60}s</span>
                                                        </div>
                                                    )}
                                                    {log.max_scroll_depth !== null && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '200px' }}>
                                                            <FileText size={14} /> <span style={{ width: '40px' }}>{log.max_scroll_depth}%</span>
                                                            <div style={{ height: '6px', background: '#333', borderRadius: '3px', flex: 1, overflow: 'hidden' }}>
                                                                <div style={{ width: `${log.max_scroll_depth}%`, height: '100%', background: '#ff3b30' }}></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {logs.length === 0 && <p style={{ color: '#5ac8fa', textAlign: 'center', padding: '1rem' }}>No activity matching this criteria.</p>}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ===== DEEP EDIT MODAL ===== */}
            {editingUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass admin-modal" style={{ width: '100%', maxWidth: '1200px', maxHeight: '95vh', overflowY: 'auto', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Order Management</h2>
                                <p style={{ color: '#888', margin: '4px 0 0', fontSize: '0.85rem' }}>{editingUser}</p>
                            </div>
                            <button onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Original Quote Snapshot */}
                        {orders[editingUser]?.original_quote && (
                            <div style={{ background: 'rgba(90,200,250,0.05)', border: '1px solid rgba(90,200,250,0.15)', borderRadius: '10px', padding: '1rem' }}>
                                <h4 style={{ margin: '0 0 0.75rem', color: '#5ac8fa', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Original Quote Request</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.85rem' }}>
                                    <div><span style={{ color: '#666' }}>Name: </span><span style={{ color: '#ccc' }}>{orders[editingUser].original_quote.name}</span></div>
                                    <div><span style={{ color: '#666' }}>Material: </span><span style={{ color: '#ccc', textTransform: 'capitalize' }}>{orders[editingUser].original_quote.material_id}</span></div>
                                    <div><span style={{ color: '#666' }}>Device: </span><span style={{ color: '#ccc' }}>{orders[editingUser].original_quote.device_os}</span></div>
                                    <div><span style={{ color: '#666' }}>Date: </span><span style={{ color: '#ccc' }}>{orders[editingUser].original_quote.created_at ? new Date(orders[editingUser].original_quote.created_at).toLocaleDateString() : '—'}</span></div>
                                </div>
                                {orders[editingUser].original_quote.comments && (
                                    <div style={{ marginTop: '0.5rem', color: '#ccc', fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                                        <span style={{ color: '#666' }}>Notes: </span>{orders[editingUser].original_quote.comments}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Edit sub-tabs */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['data', 'messages'].map(t => (
                                <button key={t} onClick={() => setEditTab(t)} style={{
                                    padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer',
                                    background: editTab === t ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                    color: editTab === t ? '#000' : '#aaa',
                                    border: 'none', fontWeight: editTab === t ? '700' : '400'
                                }}>
                                    {t === 'data' ? 'Data Modifiers' : '💬 Messages'}
                                </button>
                            ))}
                        </div>

                        {editTab === 'data' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                {/* LEFT: Data Mutation */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label>Client Name</label>
                                        <input type="text" value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} style={{ padding: '0.75rem', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label>Pipeline Stage</label>
                                            <select value={editForm.stage} onChange={(e) => setEditForm(prev => ({ ...prev, stage: parseInt(e.target.value) }))} style={{ padding: '0.75rem', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff' }}>
                                                {stages.map((stage, idx) => <option key={idx} value={idx}>{stage}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <label>Material Model</label>
                                            <select value={editForm.modelType} onChange={(e) => setEditForm(prev => ({ ...prev, modelType: parseInt(e.target.value) }))} style={{ padding: '0.75rem', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff' }}>
                                                <option value={0}>Gold</option>
                                                <option value={1}>Classic</option>
                                                <option value={2}>Diamond</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label>Internal Admin Notes (Hidden from Client)</label>
                                        <textarea value={editForm.adminNotes} onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))} rows={3} style={{ padding: '0.75rem', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#ffcc00', resize: 'vertical' }} placeholder="Private vendor notes..." />
                                    </div>

                                    {/* AI Mesh */}
                                    <div style={{ padding: '1rem', background: 'rgba(201,169,97,0.05)', borderRadius: '8px', border: '1px solid rgba(201,169,97,0.2)' }}>
                                        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--color-accent)' }}>Automated AI Mesh</h4>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {(orders[editingUser]?.ai_mesh_url || tickets[editingUser]?.ai_mesh_url) ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                                    <a href={orders[editingUser]?.ai_mesh_url || tickets[editingUser]?.ai_mesh_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px', width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Box size={14} /> View Mesh
                                                    </a>
                                                    <button className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px', width: '100%', borderColor: 'var(--color-accent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }} onClick={() => setPreviewUser(editingUser)}>
                                                        <Eye size={14} /> Preview 3D
                                                    </button>
                                                </div>
                                            ) : (
                                                <button className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px', width: '100%', color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }} onClick={() => handleGenerateAi(editingUser, tickets[editingUser]?.comments || editForm.adminNotes || "gold grillz")} disabled={generatingAiFor === editingUser}>
                                                    {generatingAiFor === editingUser ? 'Generating... (~15s)' : 'Generate AI Concept'}
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(201,169,97,0.1)', paddingTop: '1rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                <h4 style={{ margin: 0, color: 'var(--color-accent)', fontSize: '0.9rem' }}>Upload Custom 3D Design</h4>
                                                {orders[editingUser]?.custom_designs?.length > 0 && (
                                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '4px', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }} onClick={() => setPreviewUser(editingUser)}>
                                                        <Eye size={12} /> Preview
                                                    </button>
                                                )}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                <input type="text" placeholder="Variant (e.g. Snake, V2)" value={uploadVariantName} onChange={(e) => setUploadVariantName(e.target.value)} style={{ padding: '0.5rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} />
                                                <input type="file" accept=".glb,.gltf" onChange={(e) => setUploadFile(e.target.files[0])} style={{ color: '#888', fontSize: '0.75rem', overflow: 'hidden' }} />
                                            </div>
                                            <button className="btn btn-secondary" style={{ padding: '0.5rem', marginTop: '0.5rem', width: '100%', borderRadius: '4px', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }} disabled={isUploading || !uploadFile || !uploadVariantName} onClick={async () => { setIsUploading(true); const res = await uploadCustomDesign(editingUser, uploadFile, uploadVariantName); setIsUploading(false); if (res.success) { setUploadFile(null); setUploadVariantName(''); alert("Design pushed to client!"); } else alert("Upload failed: " + res.error); }}>
                                                {isUploading ? 'Pushing...' : 'Push Design to Client'}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <div>
                                            {deleteInput === 'Delete' ? (
                                                <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', borderRadius: '4px', background: '#ff3b30' }} onClick={async () => { await deleteOrder(editingUser); setEditingUser(null); }}>Purge & Archive</button>
                                            ) : (
                                                <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder="Type 'Delete' to unlock wipe" style={{ padding: '0.5rem', border: '1px solid red', borderRadius: '5px', background: 'transparent', color: 'red', fontSize: '0.85rem' }} />
                                            )}
                                        </div>
                                        <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', borderRadius: '4px' }} onClick={async () => { await updateOrderDetails(editingUser, editForm); setEditingUser(null); }}>Save Changes</button>
                                    </div>
                                </div>

                                {/* RIGHT: Analytics feed */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <h3>Target Analytics Feed</h3>
                                    <div style={{ background: '#111', borderRadius: '8px', border: '1px solid #333', padding: '1.5rem', height: '100%', minHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {userLogs.length === 0 ? (
                                            <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>No telemetry for this address in the last 30 days.</p>
                                        ) : (
                                            userLogs.map(log => {
                                                const isNav = log.action_type === 'NAVIGATION';
                                                return (
                                                    <div key={log.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingBottom: '1rem', borderBottom: '1px solid #222' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(log.timestamp).toLocaleString()}</span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isNav ? '#5ac8fa' : '#ffcc00' }}>
                                                            {isNav ? <Compass size={14} /> : <MousePointerClick size={14} />}
                                                            <span style={{ fontSize: '0.9rem', color: '#fff' }}>{log.detail}</span>
                                                        </div>
                                                        {log.session_duration_sec !== null && (
                                                            <span style={{ fontSize: '0.8rem', color: '#888' }}><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Dwell: {Math.floor(log.session_duration_sec / 60)}m {log.session_duration_sec % 60}s</span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {editTab === 'messages' && (
                            <div style={{ height: '500px' }}>
                                <MessageThread orderEmail={editingUser} label={`Chat with ${orders[editingUser]?.name || editingUser}`} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Admin 3D Preview Overlay */}
            {previewUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass admin-modal" style={{ width: '95%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 10 }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Eye size={18} color="var(--color-accent)" /> Client Dashboard Preview</h3>
                            <button onClick={() => setPreviewUser(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ flex: 1, position: 'relative', background: '#000' }}>
                            {orders[previewUser]?.custom_designs && orders[previewUser]?.custom_designs.length > 0 ? (
                                <UserWebGLShowcase designs={orders[previewUser].custom_designs} requestedMaterialName={['Gold', 'Classic', 'Diamond'][orders[previewUser].modelType || 0] || 'Gold'} />
                            ) : (
                                <WebGLShowcase modelUrl={orders[previewUser]?.ai_mesh_url || tickets[previewUser]?.ai_mesh_url || null} forcedMaterial={(orders[previewUser]?.ai_mesh_url || tickets[previewUser]?.ai_mesh_url) ? { color: '#eec95e', roughness: 0.1 } : null} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
