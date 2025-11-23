import React from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import { usePollingInvites } from '../hooks/usePollingInvites';
import { usePollingGeneralNotifications } from '../hooks/usePollingGeneralNotifications';
import { invitesAPI } from '../services/invites'; // For accepting/declining invites
import { notificationsAPI } from '../services/notifications'; // For marking general notifications as read
import { useNavigate } from 'react-router-dom'; // For navigating after accepting an invite


const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { pendingInvites, refetchInvites } = usePollingInvites();
  const { generalNotifications, refetchNotifications } = usePollingGeneralNotifications();

  // Handle invite actions
  const handleAcceptInvite = async (inviteId: string, token: string) => {
    if (!user?._id) return;
    try {
      await invitesAPI.acceptInvite(token, user._id);
      alert('Invite accepted successfully!');
      refetchInvites(); // Refresh pending invites
      refetchNotifications(); // Refresh general notifications (for inviter's notification)
      navigate(`/groups/${pendingInvites.find(inv => inv.id === inviteId)?.groupId}`); // Navigate to the group page
    } catch (err: any) {
      console.error('Failed to accept invite:', err);
      alert(err.response?.data?.meta?.message || 'Failed to accept invite.');
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    if (!user?._id) return;
    const inviteToDecline = pendingInvites.find(inv => inv.id === inviteId);
    if (!inviteToDecline) {
      console.error('Invite to decline not found in pending invites:', inviteId);
      return;
    }
    if (window.confirm('Are you sure you want to decline this invite?')) {
        try {
            await invitesAPI.deleteInvite(inviteToDecline.groupId, inviteId, user._id);
            alert('Invite declined successfully!');
            refetchInvites(); // Refresh pending invites
        } catch (err: any) {
            console.error('Failed to decline invite:', err);
            alert(err.response?.data?.meta?.message || 'Failed to decline invite.');
        }
    }
  };

  // Handle general notification actions
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      refetchNotifications(); // Refresh general notifications
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      alert(err.response?.data?.meta?.message || 'Failed to mark notification as read.');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationsAPI.deleteNotification(notificationId);
        refetchNotifications(); // Refresh general notifications
      } catch (err: any) {
        console.error('Failed to delete notification:', err);
        alert(err.response?.data?.meta?.message || 'Failed to delete notification.');
      }
    }
  };

  const hasNotifications = pendingInvites.length > 0 || generalNotifications.length > 0;

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Your Notifications</h1>
      
      {!user ? (
        <p className="text-center text-gray-600">Please log in to view notifications.</p>
      ) : (
        <>
          {pendingInvites.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Pending Invites</h2>
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="p-4 rounded-lg shadow-sm border bg-white border-yellow-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-yellow-700">
                        You have been invited to group "{invite.groupName}" by {invite.invitedByName}!
                      </p>
                      <p className="text-xs text-gray-500">
                        Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleAcceptInvite(invite.id, invite.token)}>
                        Accept
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeclineInvite(invite.id)}>
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generalNotifications.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">General Notifications</h2>
              <div className="space-y-4">
                {generalNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg shadow-sm border ${
                      notification.readStatus ? 'bg-gray-100 border-gray-200' : 'bg-white border-blue-200'
                    } flex justify-between items-center`}
                  >
                    <div>
                      <p className={`font-medium ${notification.readStatus ? 'text-gray-700' : 'text-blue-700'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!notification.readStatus && (
                        <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(notification.id)}>
                          Mark as Read
                        </Button>
                      )}
                      <Button variant="danger" size="sm" onClick={() => handleDeleteNotification(notification.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasNotifications && (
            <p className="text-center text-gray-600">No notifications yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default NotificationsPage;