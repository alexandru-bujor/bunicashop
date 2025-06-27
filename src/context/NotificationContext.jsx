import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification/Notification';

const NotificationContext = createContext(null);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback(({ message, type = 'success', duration = 3000 }) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type, duration }]);
        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration) => {
        return addNotification({ message, type: 'success', duration });
    }, [addNotification]);

    const showError = useCallback((message, duration) => {
        return addNotification({ message, type: 'error', duration });
    }, [addNotification]);

    const showInfo = useCallback((message, duration) => {
        return addNotification({ message, type: 'info', duration });
    }, [addNotification]);

    return (
        <NotificationContext.Provider value={{ showSuccess, showError, showInfo }}>
            {children}
            <div className="notification-container">
                {notifications.map(notification => (
                    <Notification
                        key={notification.id}
                        message={notification.message}
                        type={notification.type}
                        duration={notification.duration}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
}; 