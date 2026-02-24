import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Mock Database of Orders
const INITIAL_ORDERS = {
    'user@grillz.com': {
        stage: 2, // 0: Scanned, 1: Design, 2: Casting, 3: Polished, 4: Shipping
        history: [
            { stage: 'Scan Received', date: '2025-10-12' },
            { stage: 'Design Started', date: '2025-10-15' },
        ],
        modelType: 1 // 0: Knot, 1: Torus, 2: Octahedron
    },
    'vip@grillz.com': {
        stage: 4,
        history: [
            { stage: 'Scan Received', date: '2025-08-01' },
            { stage: 'Shipped', date: '2025-08-20' }
        ],
        modelType: 0
    }
};

/**
 * Authentication Provider component that manages user state and mock order data.
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - Child components to wrap.
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState(INITIAL_ORDERS); // "Database" state
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('grillz_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Simulate API delay
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
    const updateOrderStatus = (userEmail, newStage) => {
        setOrders(prev => ({
            ...prev,
            [userEmail]: {
                ...prev[userEmail],
                stage: newStage
            }
        }));
    };

    // User Action: Create Order
    const createOrder = (userEmail, orderDetails) => {
        setOrders(prev => ({
            ...prev,
            [userEmail]: {
                stage: 0, // 0: Scanned / Order Received
                history: [{ stage: 'Order Placed', date: new Date().toLocaleDateString() }],
                modelType: orderDetails.materialId === 'gold' ? 0 : 1, // Mock logic
                ...orderDetails
            }
        }));
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
            updateOrderStatus,
            createOrder,
            getUserOrder
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
