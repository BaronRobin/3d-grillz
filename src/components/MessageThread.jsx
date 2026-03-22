import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

/**
 * In-app message thread component, used on both user & admin dashboards.
 * @param {string} orderEmail - The email that identifies this conversation thread
 * @param {string} label - Optional header label for the panel
 */
const MessageThread = ({ orderEmail, label = 'Messages' }) => {
    const { user, messages, sendMessage, fetchMessages, markMessagesRead } = useAuth();
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const thread = messages[orderEmail] || [];

    useEffect(() => {
        if (orderEmail) {
            fetchMessages(orderEmail);

            // Realtime subscription for new incoming messages
            const channel = supabase
                .channel(`messages_${orderEmail}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'messages',
                        filter: `order_email=eq.${orderEmail}`
                    },
                    () => {
                        fetchMessages(orderEmail);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [orderEmail]);

    useEffect(() => {
        // Scroll to bottom on new messages
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        // Mark incoming messages as read when thread opens
        if (orderEmail && thread.length > 0) {
            markMessagesRead(orderEmail);
        }
    }, [thread.length]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || sending) return;
        setSending(true);
        const error = await sendMessage(orderEmail, trimmed);
        if (error) {
            alert("Message failed to send: " + error.message + "\n\n(Tip: Check Supabase RLS policies for the 'messages' table!)");
        } else {
            setInput('');
        }
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: '300px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.07)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '0.85rem 1.25rem',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(0,0,0,0.3)',
                flexShrink: 0
            }}>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#4cd964', boxShadow: '0 0 6px #4cd964',
                    flexShrink: 0
                }} />
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#888', fontWeight: '600' }}>
                    {label}
                </span>
                {thread.filter(m => !m.read && m.sender !== (isAdmin ? 'admin' : user?.email)).length > 0 && (
                    <span style={{
                        marginLeft: 'auto',
                        background: 'var(--color-accent)',
                        color: '#000',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '2px 8px',
                        borderRadius: '20px'
                    }}>
                        {thread.filter(m => !m.read && m.sender !== (isAdmin ? 'admin' : user?.email)).length} new
                    </span>
                )}
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                {thread.length === 0 ? (
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#444', gap: '0.5rem', userSelect: 'none'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>💬</span>
                        <span style={{ fontSize: '0.85rem' }}>No messages yet. Say hello!</span>
                    </div>
                ) : (
                    thread.map((msg, i) => {
                        const isMine = isAdmin ? msg.sender === 'admin' : msg.sender === user?.email;
                        return (
                            <div key={msg.id || i} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMine ? 'flex-end' : 'flex-start',
                                gap: '3px'
                            }}>
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '0.6rem 0.9rem',
                                    borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: isMine
                                        ? 'linear-gradient(135deg, var(--color-accent), #a07a3d)'
                                        : 'rgba(255,255,255,0.08)',
                                    color: isMine ? '#000' : '#e0e0e0',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.4',
                                    fontWeight: isMine ? '500' : '400',
                                    wordBreak: 'break-word'
                                }}>
                                    {msg.body}
                                </div>
                                <span style={{
                                    fontSize: '0.65rem',
                                    color: '#555',
                                    paddingInline: '4px'
                                }}>
                                    {!isMine && <span style={{ color: '#888', marginRight: '6px' }}>{msg.sender === 'admin' ? 'Robin' : msg.sender.split('@')[0]}</span>}
                                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                gap: '0.5rem',
                background: 'rgba(0,0,0,0.2)',
                flexShrink: 0
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        padding: '0.6rem 1rem',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    style={{
                        background: input.trim() ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '38px',
                        height: '38px',
                        cursor: input.trim() ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background 0.2s',
                        color: input.trim() ? '#000' : '#555',
                        fontSize: '1.1rem'
                    }}
                >
                    ➤
                </button>
            </div>
        </div>
    );
};

export default MessageThread;
