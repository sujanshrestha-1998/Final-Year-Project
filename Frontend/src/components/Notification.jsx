import React, { useState, useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { MdOutlineClose } from "react-icons/md";
import axios from "axios";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        
        // If no userId is found in localStorage, try to get it from the email
        if (!userId) {
          const email = localStorage.getItem("userEmail");
          if (email) {
            const userResponse = await axios.get(
              `http://localhost:3000/api/get_user_by_email?email=${encodeURIComponent(email)}`
            );
            
            if (userResponse.data.success && userResponse.data.user) {
              localStorage.setItem("userId", userResponse.data.user.id);
            } else {
              throw new Error("Could not retrieve user information");
            }
          } else {
            throw new Error("User not logged in");
          }
        }
        
        // Fetch notifications for the user
        const response = await axios.get(
          `http://localhost:3000/api/user_notifications/${localStorage.getItem("userId")}`
        );
        
        if (response.data.success) {
          setNotifications(response.data.notifications);
        } else {
          throw new Error(response.data.message || "Failed to fetch notifications");
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message || "An error occurred while fetching notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up polling to refresh notifications every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/user_notifications/mark_read/${id}`
      );
      
      if (response.data.success) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
        
        // Update unread count in parent component
        if (window.updateUnreadNotificationCount) {
          window.updateUnreadNotificationCount();
        }
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Remove notification
  const removeNotification = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/user_notifications/${id}`
      );
      
      if (response.data.success) {
        setNotifications(
          notifications.filter((notification) => notification.id !== id)
        );
        
        // Update unread count in parent component
        if (window.updateUnreadNotificationCount) {
          window.updateUnreadNotificationCount();
        }
      }
    } catch (err) {
      console.error("Error removing notification:", err);
    }
  };

  // Format time to relative format (e.g., "2 hours ago")
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationTime) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return notificationTime.toLocaleDateString();
  };

  // Count unread notifications
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  if (loading) {
    return (
      <div className="px-4 py-3 mt-auto mb-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IoNotificationsOutline className="text-xl" />
              <h3 className="font-medium">Notifications</h3>
            </div>
          </div>
          <div className="p-4 text-center text-gray-500">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 mt-auto mb-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IoNotificationsOutline className="text-xl" />
              <h3 className="font-medium">Notifications</h3>
            </div>
          </div>
          <div className="p-4 text-center text-red-500">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 mt-auto mb-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <IoNotificationsOutline className="text-xl" />
            <h3 className="font-medium">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  !notification.read ? "bg-blue-50" : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(notification.created_at)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <MdOutlineClose />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {notification.message}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No notifications to display
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="bg-gray-50 px-4 py-2 text-center">
            <button 
              className="text-blue-600 text-sm font-medium hover:text-blue-800"
              onClick={() => {
                // Mark all as read
                notifications.forEach(notification => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                });
              }}
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
