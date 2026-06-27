"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/lib/notification";
import { Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      await markNotificationAsRead(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await markAllNotificationsAsRead(currentUser.uid);
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!currentUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Please sign in to view notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full 
     px-4 py-8 flex flex-col gap-6">
      <title>Notifications | Projectify</title>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="w-7 h-7 text-blue-500" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-sm font-bold">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay up to date with your tasks and mentions.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notification list card */}
      <Card className="overflow-hidden">
        <Separator />
        <CardContent className="p-0">
          {loading ? (
            <div className="divide-y">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-5 items-start">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Bell className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm font-medium">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={[
                    "flex gap-4 p-5 items-start transition-colors",
                    index < notifications.length - 1 ? "border-b" : "",
                    notification.isRead
                      ? "bg-transparent hover:bg-muted/40"
                      : "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/30",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {/* Icon avatar */}
                  <Avatar className="flex-shrink-0 h-10 w-10">
                    <AvatarFallback
                      className={
                        notification.isRead
                          ? "bg-muted text-muted-foreground"
                          : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                      }
                    >
                      <Bell className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h4
                        className={`text-sm font-semibold leading-snug ${
                          notification.isRead
                            ? "text-muted-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <Badge
                        variant="outline"
                        className="text-xs whitespace-nowrap flex-shrink-0 font-normal text-muted-foreground"
                      >
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>

                    <p
                      className={`text-sm leading-relaxed ${
                        notification.isRead
                          ? "text-muted-foreground"
                          : "text-foreground/80"
                      }`}
                    >
                      {notification.message}
                    </p>

                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-2 h-7 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
