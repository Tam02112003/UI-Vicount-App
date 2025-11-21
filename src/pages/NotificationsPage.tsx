import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/notifications';
import { useAuth } from '../context/AuthContext';
import Button from '../components/UI/Button';
import type { Notification } from '../types';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const fetchedNotifications = await notificationsAPI.getNotifications();
      // Sort notifications by createdAt, newest first
      setNotifications(fetchedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err.response?.data?.meta?.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
      alert(err.response?.data?.meta?.message || 'Failed to mark notification as read.');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationsAPI.deleteNotification(notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      } catch (err: any) {
        console.error('Failed to delete notification:', err);
        alert(err.response?.data?.meta?.message || 'Failed to delete notification.');
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading notifications...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Notifications</h1>
      
      {notifications.length === 0 ? (
        <p className="text-center text-gray-600">No notifications yet.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-sm border ${
                notification.read ? 'bg-gray-100 border-gray-200' : 'bg-white border-blue-200'
              } flex justify-between items-center`}
            >
              <div>
                <p className={`font-medium ${notification.read ? 'text-gray-700' : 'text-blue-700'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex space-x-2">
                {!notification.read && (
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
      )}
    </div>
  );
};

export default NotificationsPage;