import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Wallet, Bell, Clock, Settings, Mail, Info } from 'lucide-react'; // Import Mail icon for invites
import { useAuth } from '../../context/AuthContext';
import { usePollingInvites } from '../../hooks/usePollingInvites';
import { usePollingGeneralNotifications } from '../../hooks/usePollingGeneralNotifications';
import { notificationsAPI } from '../../services/notifications'; // For mark as read all

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false); // New state for notification dropdown
  
  const { pendingInvites, hasNewInvites, setHasNewInvites, refetchInvites } = usePollingInvites();
  const { generalNotifications, hasNewGeneralNotifications, setHasNewGeneralNotifications, refetchNotifications } = usePollingGeneralNotifications();

  const [totalUnreadNotifications, setTotalUnreadNotifications] = useState(0);
  const [anyNewNotifications, setAnyNewNotifications] = useState(false);


  useEffect(() => {
    const unreadGeneral = generalNotifications.filter(n => !n.readStatus).length;
    setTotalUnreadNotifications(pendingInvites.length + unreadGeneral);
    setAnyNewNotifications(hasNewInvites || hasNewGeneralNotifications);
  }, [pendingInvites, generalNotifications, hasNewInvites, hasNewGeneralNotifications]);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsNotificationDropdownOpen(false); // Close notification dropdown
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsUserDropdownOpen(false); // Close user dropdown
    if (!isNotificationDropdownOpen) {
      // If opening, mark all "new" flags as false
      setHasNewInvites(false);
      setHasNewGeneralNotifications(false);
    }
  };

  const handleMarkAllGeneralAsRead = async () => {
    if (!user) return;
    try {
      // This would require a new backend endpoint to mark all for a user as read
      // For now, iterate and mark individually or implement a batch API
      const unreadGeneralIds = generalNotifications.filter(n => !n.readStatus).map(n => n.id);
      await Promise.all(unreadGeneralIds.map(id => notificationsAPI.markAsRead(id)));
      refetchNotifications(); // Refresh notifications
      setHasNewGeneralNotifications(false); // Explicitly clear new flag
    } catch (error) {
      console.error('Failed to mark all general notifications as read:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Wallet className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Vicount</span>
          </Link>

          {isAuthenticated && (
            <div className="relative flex items-center space-x-4">
              {/* Notification Icon/Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleNotificationDropdown}
                  className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <Bell className="h-6 w-6" />
                  {anyNewNotifications && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                  )}
                  {totalUnreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                      {totalUnreadNotifications}
                    </span>
                  )}
                </button>

                {isNotificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-800">Notifications</span>
                      {generalNotifications.some(n => !n.readStatus) && (
                        <button
                          onClick={handleMarkAllGeneralAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {totalUnreadNotifications === 0 ? (
                      <p className="px-4 py-2 text-sm text-gray-500">No new notifications.</p>
                    ) : (
                      <div className="max-h-60 overflow-y-auto">
                        {pendingInvites.map((invite) => (
                          <Link
                            key={invite.id}
                            to={`/notifications`} // Link to notifications page to accept/decline
                            className="flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            onClick={() => setIsNotificationDropdownOpen(false)}
                          >
                            <Mail className="h-4 w-4 mr-2 text-yellow-500" />
                            <span>You're invited to "{invite.groupId}"!</span> {/* Display group name later */}
                          </Link>
                        ))}
                        {generalNotifications.filter(n => !n.readStatus).map((notification) => (
                          <Link
                            key={notification.id}
                            to={`/notifications`} // Link to notifications page
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                                notificationsAPI.markAsRead(notification.id); // Mark as read when clicked
                                refetchNotifications(); // Refresh notifications
                                setIsNotificationDropdownOpen(false);
                            }}
                          >
                            <Info className="h-4 w-4 mr-2" />
                            <span>{notification.message}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-gray-100 mt-1"></div>
                    <Link
                      to="/notifications"
                      className="block text-center px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800"
                      onClick={() => setIsNotificationDropdownOpen(false)}
                    >
                      View All Notifications
                    </Link>
                  </div>
                )}
              </div>


              <button
                onClick={toggleUserDropdown}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || user?.email}
                </span>
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </Link>
                  <Link
                    to="/transactions"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Transaction History
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;