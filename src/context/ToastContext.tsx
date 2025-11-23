import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Toast, { ToastType } from '../components/UI/Toast';
import { useAuth } from './AuthContext'; // Import useAuth to get user id
import { usePollingInvites } from '../hooks/usePollingInvites';
import { usePollingGeneralNotifications } from '../hooks/usePollingGeneralNotifications';

interface ToastMessage {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Get user from AuthContext
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const { pendingInvites, hasNewInvites } = usePollingInvites();
  const { generalNotifications, hasNewGeneralNotifications } = usePollingGeneralNotifications();

  // Keep track of shown invite IDs to avoid re-showing
  const shownInviteIdsRef = useRef<Set<string>>(new Set());
  const shownNotificationIdsRef = useRef<Set<string>>(new Set());


  const addToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
    // Toasts are automatically dismissed by the Toast component after `duration`
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Effect for new pending invites
  useEffect(() => {
    if (user && hasNewInvites && pendingInvites.length > 0) {
      pendingInvites.forEach((invite) => {
        if (!shownInviteIdsRef.current.has(invite.id)) {
          addToast(`You have a new invite to group ${invite.groupName} from ${invite.invitedByName}.`, 'info', 10000);
          shownInviteIdsRef.current.add(invite.id);
        }
      });
    }
  }, [user, hasNewInvites, pendingInvites, addToast]);

  // Effect for new general notifications
  useEffect(() => {
    if (user && hasNewGeneralNotifications && generalNotifications.length > 0) {
        generalNotifications.forEach((notification) => {
            if (!notification.readStatus && !shownNotificationIdsRef.current.has(notification.id)) {
                addToast(notification.message, notification.type === 'INVITE_ACCEPTED' ? 'success' : 'info', 10000);
                shownNotificationIdsRef.current.add(notification.id);
            }
        });
    }
  }, [user, hasNewGeneralNotifications, generalNotifications, addToast]);


  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};