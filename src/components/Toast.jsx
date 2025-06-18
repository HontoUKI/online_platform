import { useEffect } from 'react';
import "../assets/toast.css"

const Toast = ({ message, onClose, actionText = null, onAction = null, type = 'info' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!actionText) onClose?.();
    }, 3000); // автоскрытие через 3 сек
    return () => clearTimeout(timer);
  }, [onClose, actionText]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-message">{message}</span>
      <div className="toast-buttons">
        {actionText && onAction && (
          <button className="toast-action" onClick={onAction}>{actionText}</button>
        )}
        <button className="toast-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default Toast;
