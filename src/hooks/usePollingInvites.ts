import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../services/notifications';
import { useAuth } from '../context/AuthContext';
import { InviteResponseDTO } from '../types';

const POLLING_INTERVAL_MS = 30000; // Poll every 30 seconds

export const usePollingInvites = () => {
  const { user } = useAuth();
  const [pendingInvites, setPendingInvites] = useState<InviteResponseDTO[]>([]);
  const [hasNewInvites, setHasNewInvites] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchInvites = async () => {
    if (!user) {
      setPendingInvites([]);
      setHasNewInvites(false);
      return;
    }

    try {
      const fetchedInvites = await notificationsAPI.getPendingInviteNotifications();
      
      // Check if there are any new invites compared to the current state
      const newInvitesDetected = fetchedInvites.some(
        (fetchedInvite) => !pendingInvites.some((existingInvite) => existingInvite.id === fetchedInvite.id)
      );

      if (newInvitesDetected && fetchedInvites.length > pendingInvites.length) {
        setHasNewInvites(true);
      } else if (fetchedInvites.length === 0) {
        setHasNewInvites(false);
      }
      
      setPendingInvites(fetchedInvites);
    } catch (error) {
      console.error('Error polling for pending invites:', error);
      setPendingInvites([]);
      setHasNewInvites(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchInvites();

    // Set up polling
    intervalRef.current = setInterval(fetchInvites, POLLING_INTERVAL_MS);

    // Clear interval on unmount or user changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]); // Re-run effect if user changes (login/logout)

  return { pendingInvites, hasNewInvites, refetchInvites: fetchInvites, setHasNewInvites };
};
