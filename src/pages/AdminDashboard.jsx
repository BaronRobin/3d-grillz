import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAnalytics } from '../context/AnalyticsContext';
import { Navigate } from 'react-router-dom';
import { CalendarDays, User as UserIcon, Compass, MousePointerClick, Clock, FileText, Box } from 'lucide-react';
import { generateGrillzMesh } from '../services/tripoApi';

/**
 * Admin Panel for managing orders and viewing live analytics.
 * Accessible only to users with the 'admin' role.
 * @returns {JSX.Element}
 */
const AdminDashboard = () => {
    const { user, tickets, orders, loading, fetchAdminData, logout, approveTicket, updateTicketStatus, updateOrderStatus, deleteOrder, updateOrderDetails, triggerPasswordReset, saveAiMeshToTicket, uploadCustomDesign } = useAuth();
    const { fetchActivityLogs, onlineUsers } = useAnalytics();
    const [activeTab, setActiveTab] = useState('tickets');
    const [logs, setLogs] = useState([]);
    const [daysBack, setDaysBack] = useState(7);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    // Deep Edit State
    const [editingUser, setEditingUser] = useState(null);
    const [userLogs, setUserLogs] = useState([]);
    const [deleteInput, setDeleteInput] = useState('');
    const [editForm, setEditForm] = useState({ name: '', modelType: '', stage: '', adminNotes: '' });

    // Custom Design Upload State
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadVariantName, setUploadVariantName] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // AI Generation State
    const [generatingAiFor, setGeneratingAiFor] = useState(null);

    const handleGenerateAi = async (email, comments) => {
        try {
            setGeneratingAiFor(email);
            const modelUrl = await generateGrillzMesh(comments);
            await saveAiMeshToTicket(email, modelUrl);
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

    // Calculate Top 3 Visiting Days based on unique visitor IDs
    const getTopDays = () => {
        const dayCounts = {};
        logs.forEach(log => {
            const dateStr = new Date(log.timestamp).toLocaleDateString();
            if (!dayCounts[dateStr]) dayCounts[dateStr] = new Set();
            dayCounts[dateStr].add(log.visitor_id);
        });

        const sorted = Object.entries(dayCounts)
            .map(([date, visitors]) => ({ date, uniqueCount: visitors.size }))
            .sort((a, b) => b.uniqueCount - a.uniqueCount)
            .slice(0, 3);

        return sorted;
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" />;
    }

    const stages = ['Quote Approved & Email Sent', 'Scan Received', '3D Design', 'Revision Loop', 'Casting', 'Polishing', 'Delivery'];
    const topDays = getTopDays();

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', paddingBottom: '4rem' }} className="container">
            <div className="section-header fade-in-up">
                <h2 className="gradient-text">Mission Control</h2>
                <p style={{ color: '#aaa' }}>Admin Panel - {user.email}</p>
            </div>

            {/* Toggle Tabs */}
            <div className="tabs-container">
                <button
                    onClick={() => setActiveTab('tickets')}
                    className={`btn ${activeTab === 'tickets' ? 'btn-primary' : 'btn-secondary'}`}
                >
                    Quote Requests
                </button>
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

            {activeTab === 'tickets' && (
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Incoming Quote Requests</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Date</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Client Info</th>
                                    <th className="hide-on-mobile" style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Material</th>
                                    <th className="hide-on-mobile" style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Comments</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(tickets || {})
                                    .filter(([_, t]) => t.status === 'pending')
                                    .map(([email, ticket]) => (
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
                                                <div style={{ fontSize: '0.7rem', color: '#5ac8fa', marginTop: '4px' }}>
                                                    {ticket.device_os || 'Unknown Device'}
                                                </div>
                                            </td>
                                            <td className="hide-on-mobile" style={{ padding: '1rem', textTransform: 'capitalize' }}>{ticket.materialId || ticket.material_id}</td>
                                            <td className="hide-on-mobile" style={{ padding: '1rem', maxWidth: '300px' }}>
                                                <div style={{ fontSize: '0.9rem', color: '#ccc', maxHeight: '60px', overflowY: 'auto' }}>
                                                    {ticket.comments}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {ticket.ai_mesh_url ? (
                                                    <a href={ticket.ai_mesh_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Box size={14} /> View AI Mesh
                                                    </a>
                                                ) : (
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}
                                                        onClick={() => handleGenerateAi(email, ticket.comments)}
                                                        disabled={generatingAiFor === email}
                                                    >
                                                        {generatingAiFor === email ? 'Generating... (~15s)' : 'Generate AI Mesh'}
                                                    </button>
                                                )}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                        onClick={() => approveTicket(email)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                        onClick={() => updateTicketStatus(email, 'declined')}
                                                    >
                                                        Decline
                                                    </button>
                                                    <a
                                                        href={`mailto:${email}?subject=Regarding Your Quote Request - 3D Grillz`}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', textDecoration: 'none' }}
                                                    >
                                                        Email
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                {Object.values(tickets || {}).filter(t => t.status === 'pending').length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                                            No pending quote requests.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Active Orders</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #333' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>User</th>
                                    <th className="hide-on-mobile" style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Model Type</th>
                                    <th className="hide-on-mobile" style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Current Stage</th>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#888' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(orders).map(([email, order]) => (
                                    <tr key={email} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 'bold' }}>{order.name || email.split('@')[0]}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{email}</div>
                                        </td>
                                        <td className="hide-on-mobile" style={{ padding: '1rem' }}>{['Gold', 'Classic', 'Diamond'][order.modelType] || 'Standard'}</td>
                                        <td className="hide-on-mobile" style={{ padding: '1rem' }}>
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
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                                                onClick={async () => {
                                                    setEditingUser(email);
                                                    setDeleteInput('');
                                                    setEditForm({
                                                        name: order.name,
                                                        modelType: order.modelType,
                                                        stage: order.stage,
                                                        adminNotes: order.admin_notes || ''
                                                    });
                                                    // Immediately fetch their personal telemetry history
                                                    const hist = await fetchActivityLogs(30);
                                                    setUserLogs(hist.filter(l => l.user_email === email || l.visitor_id === email));
                                                }}
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                        {/* Online Users */}
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

                        {/* Top 3 Visiting Days */}
                        <div className="glass" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                📅 Top 3 High-Volume Days
                            </h3>
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

                    {/* Live Activity Feed */}
                    <div className="glass" style={{ padding: '2rem', marginTop: '2rem', maxHeight: '600px', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3>Cloud Telemetry Feed</h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#888' }}>Date Range:</span>
                                    <select
                                        value={daysBack}
                                        onChange={(e) => setDaysBack(Number(e.target.value))}
                                        style={{ padding: '0.5rem', borderRadius: '5px', background: '#222', color: 'white', border: '1px solid #444' }}
                                    >
                                        <option value={1}>Last 24 Hours</option>
                                        <option value={7}>Last 7 Days</option>
                                        <option value={30}>Last 30 Days</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {isLoadingLogs ? (
                            <p style={{ color: '#888', textAlign: 'center' }}>Syncing with Supabase...</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {logs.map((log) => {
                                    const isNav = log.action_type === 'NAVIGATION';
                                    const color = isNav ? '#5ac8fa' : '#ffcc00';

                                    return (
                                        <div key={log.id} style={{
                                            padding: '1rem',
                                            borderLeft: `3px solid ${color}`,
                                            background: 'rgba(0,0,0,0.2)',
                                            borderRadius: '0 8px 8px 0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#ccc', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                                    <UserIcon size={14} color="#888" /> {log.visitor_id} {log.user_email ? `(${log.user_email})` : ''}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {isNav ? <Compass size={16} color="#5ac8fa" /> : <MousePointerClick size={16} color="#ffcc00" />} {log.detail}
                                            </div>

                                            {/* Telemetry Visualizers */}
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
            {/* DEEP EDIT MODAL OVERLAY */}
            {editingUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="glass admin-modal" style={{ width: '100%', maxWidth: '1200px', maxHeight: '95vh', overflowY: 'auto', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0 }}>Advanced Order Management</h2>
                            <button onClick={() => setEditingUser(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Two Column Layout */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                            {/* LEFT COLUMN: Data Mutation */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3>Data Modifiers</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label>Account ID</label>
                                    <input type="text" value={editingUser} disabled style={{ padding: '0.75rem', borderRadius: '5px', border: '1px solid #333', background: '#111', color: '#888' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label>Client Name</label>
                                    <input type="text" value={editForm.name} onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))} style={{ padding: '0.75rem', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label>Pipeline Stage</label>
                                        <select value={editForm.stage} onChange={(e) => setEditForm(prev => ({ ...prev, stage: parseInt(e.target.value) }))} style={{ padding: '0.75rem', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff' }}>
                                            {stages.map((stage, idx) => (
                                                <option key={idx} value={idx}>{stage}</option>
                                            ))}
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
                                    <textarea value={editForm.adminNotes} onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))} rows={4} style={{ padding: '0.75rem', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#ffcc00', resize: 'vertical' }} placeholder="Log private vendor history here..." />
                                </div>

                                {/* Custom Design Upload */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', padding: '1rem', background: 'rgba(201,169,97,0.05)', borderRadius: '8px', border: '1px solid rgba(201,169,97,0.2)' }}>
                                    <h4 style={{ margin: 0, color: 'var(--color-accent)' }}>Upload Custom 3D Design</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.5rem', alignItems: 'center' }}>
                                        <input type="text" placeholder="Variant (e.g. Snake, V2)" value={uploadVariantName} onChange={(e) => setUploadVariantName(e.target.value)} style={{ padding: '0.5rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', width: '100%' }} />
                                        <input type="file" accept=".glb,.gltf" onChange={(e) => setUploadFile(e.target.files[0])} style={{ color: '#888', fontSize: '0.75rem', maxWidth: '100%', overflow: 'hidden' }} />
                                    </div>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '0.5rem', marginTop: '0.5rem', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
                                        disabled={isUploading || !uploadFile || !uploadVariantName}
                                        onClick={async () => {
                                            setIsUploading(true);
                                            const res = await uploadCustomDesign(editingUser, uploadFile, uploadVariantName);
                                            setIsUploading(false);
                                            if (res.success) {
                                                setUploadFile(null);
                                                setUploadVariantName('');
                                                alert("Design attached to client dashboard successfully!");
                                            } else {
                                                alert("Upload failed: " + res.error);
                                            }
                                        }}
                                    >
                                        {isUploading ? 'Pushing to Supabase...' : 'Push Design to Client'}
                                    </button>
                                </div>

                                {/* Save Actions */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {deleteInput === 'Delete' ? (
                                            <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', background: '#ff3b30' }} onClick={async () => {
                                                await deleteOrder(editingUser);
                                                setEditingUser(null);
                                            }}>Purge Order Record</button>
                                        ) : (
                                            <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder="Type 'Delete' to unlock wipe" style={{ padding: '0.5rem', border: '1px solid red', borderRadius: '5px', background: 'transparent', color: 'red', fontSize: '0.85rem' }} />
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }} onClick={async () => {
                                            await updateOrderDetails(editingUser, editForm);
                                            setEditingUser(null);
                                        }}>Save Changes</button>

                                        <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }} onClick={async () => {
                                            if (window.confirm("Send a forced password reset link to this user? They will be locked out until they set a new password.")) {
                                                await triggerPasswordReset(editingUser);
                                                alert("Magic Link dispatched.");
                                            }
                                        }}>Send Reset Link</button>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Target Analytics */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3>Target Analytics Feed</h3>
                                <div style={{ background: '#111', borderRadius: '8px', border: '1px solid #333', padding: '1.5rem', height: '100%', minHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {userLogs.length === 0 ? (
                                        <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>No telemetry data captured for this address in the last 30 days.</p>
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
                                                        <span style={{ fontSize: '0.8rem', color: '#888' }}><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Dwell time: {Math.floor(log.session_duration_sec / 60)}m {log.session_duration_sec % 60}s</span>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
