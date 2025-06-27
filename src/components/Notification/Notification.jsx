import React, { useEffect } from 'react';
import { FaCheck, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './Notification.css';

const Notification = ({ 
    message, 
    type = 'success', 
    duration = 3000, 
    onClose 
}) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheck />;
            case 'error':
                return <FaExclamationTriangle />;
            case 'info':
                return <FaInfoCircle />;
            default:
                return <FaCheck />;
        }
    };

    return (
        <div className={`notification notification-${type} slide-in`}>
            <div className="notification-icon">
                {getIcon()}
            </div>
            <div className="notification-content">
                <p>{message}</p>
            </div>
            <button 
                className="notification-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                <FaTimes />
            </button>
        </div>
    );
};

export default Notification; 