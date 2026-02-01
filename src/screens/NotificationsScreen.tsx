import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { notificationsAPI } from '../services/api';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { 
  ArrowLeft, 
  Bell, 
  Calendar, 
  Heart, 
  Pill,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'health' | 'medication' | 'system';
  timestamp: Date;
  read: boolean;
}

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack
}) => {
  const { user } = useFirebaseAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadNotifications = async () => {
      try {
        // Load from localStorage
        const saved = localStorage.getItem('heal_link_notifications');
        const allNotifications = saved ? JSON.parse(saved) : [];
        
        // Filter by current user and convert timestamp strings to Date objects
        const userNotifications = user?.uid 
          ? allNotifications
              .filter((notif: any) => notif.user_id === user.uid)
              .map((notif: any) => ({
                ...notif,
                timestamp: new Date(notif.timestamp)
              }))
              .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())
          : [];
        
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'health':
        return <Heart className="w-5 h-5 text-red-600" />;
      case 'medication':
        return <Pill className="w-5 h-5 text-green-600" />;
      case 'system':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-100';
      case 'health':
        return 'bg-red-100';
      case 'medication':
        return 'bg-green-100';
      case 'system':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const markAsRead = (id: string) => {
    // Update in localStorage
    const saved = localStorage.getItem('heal_link_notifications');
    const allNotifications = saved ? JSON.parse(saved) : [];
    const updatedNotifications = allNotifications.map((notif: any) =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    localStorage.setItem('heal_link_notifications', JSON.stringify(updatedNotifications));
    
    // Update local state
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    // Update in localStorage
    const saved = localStorage.getItem('heal_link_notifications');
    const allNotifications = saved ? JSON.parse(saved) : [];
    const updatedNotifications = allNotifications.map((notif: any) =>
      notif.user_id === user?.uid ? { ...notif, read: true } : notif
    );
    localStorage.setItem('heal_link_notifications', JSON.stringify(updatedNotifications));
    
    // Update local state
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800 font-['Inter']">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-blue-600">
                {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-blue-600"
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3 pb-24">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-2xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500 text-sm">
              You're all caught up! Notifications about your appointments, health tips, and important updates will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={`border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer rounded-2xl ${
                !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className={`font-semibold text-base ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                    
                    <p className={`text-sm mb-2 ${
                      !notification.read ? 'text-gray-800' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(notification.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};