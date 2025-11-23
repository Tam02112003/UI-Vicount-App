import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../services/notifications';
import { useAuth } from '../context/AuthContext';
import { NotificationResponseDTO } from '../types';

const POLLING_INTERVAL_MS = 30000; // Poll every 30 seconds

export const usePollingGeneralNotifications = () => {
  const { user } = useAuth();
  const [generalNotifications, setGeneralNotifications] = useState<NotificationResponseDTO[]>([]);
  const [hasNewGeneralNotifications, setHasNewGeneralNotifications] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = async () => {
    if (!user) {
      setGeneralNotifications([]);
      setHasNewGeneralNotifications(false);
      return;
    }

    try {
      const fetchedNotifications = await notificationsAPI.getGeneralNotifications();
      
      // Check if there are any new unread notifications
      const unreadNotifications = fetchedNotifications.filter(n => !n.readStatus);
      const newUnreadNotificationsDetected = unreadNotifications.some(
        (fetchedNotification) => !generalNotifications.some((existingNotification) => existingNotification.id === fetchedNotification.id)
      );

      if (newUnreadNotificationsDetected && unreadNotifications.length > 0) {
        setHasNewGeneralNotifications(true);
      } else if (unreadNotifications.length === 0) {
        setHasNewGeneralNotifications(false);
      }
      
      setGeneralNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error polling for general notifications:', error);
      setGeneralNotifications([]);
      setHasNewGeneralNotifications(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up polling
    intervalRef.current = setInterval(fetchNotifications, POLLING_INTERVAL_MS);

    // Clear interval on unmount or user changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]); // Re-run effect if user changes (login/logout)

  return { generalNotifications, hasNewGeneralNotifications, refetchNotifications: fetchNotifications, setHasNewGeneralNotifications };
};
