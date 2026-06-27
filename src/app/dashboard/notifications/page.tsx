"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, Notification } from "@/lib/notification";
import { Bell, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const data = await getUserNotifications(currentUser.uid);
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  const handleMarkAsRead = async (id: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      await markNotificationAsRead(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      await markAllNotificationsAsRead(currentUser.uid);
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!currentUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Please sign in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Notifications | Projectify</title>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Bell className="w-8 h-8 text-blue-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full ml-2">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Stay up to date with your tasks and mentions.</p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p>You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-5 flex gap-4 transition-colors ${
                    notification.isRead 
                      ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50' 
                      : 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {notification.isRead ? (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    ) : (
                      <div className="relative">
                        <Bell className="w-5 h-5 text-blue-500" />
                        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className={`text-sm font-semibold mb-1 ${notification.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${notification.isRead ? 'text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                      {notification.message}
                    </p>
                    
                    {!notification.isRead && (
                      <button 
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
