import React, { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  visible, 
  onHide, 
  duration = 5000
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onHide();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, onHide, duration]);

  if (!visible) return null;

  return (
    <div className="notification">{message}</div>
  );
};

export default Notification;
