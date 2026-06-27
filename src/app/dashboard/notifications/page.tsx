"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/lib/notification";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  Bell,
  CheckCircle2,
  UserCheck,
  Clock,
  MessageCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getGroup(dateStr: string): "Today" | "Yesterday" | "Earlier" {
  const now = new Date();
  const date = new Date(dateStr);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  if (date >= todayStart) return "Today";
  if (date >= yesterdayStart) return "Yesterday";
  return "Earlier";
}

type NotificationIconProps = { title: string; isRead: boolean };

function NotificationIcon({ title, isRead }: NotificationIconProps) {
  const lower = title.toLowerCase();
  if (lower.includes("assign")) {
    return (
      <Avatar className="flex-shrink-0 h-10 w-10">
        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
          <UserCheck className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
    );
  }
  if (lower.includes("due") || lower.includes("deadline")) {
    return (
      <Avatar className="flex-shrink-0 h-10 w-10">
        <AvatarFallback className="bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300">
          <Clock className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
    );
  }
  if (lower.includes("comment") || lower.includes("mention")) {
    return (
      <Avatar className="flex-shrink-0 h-10 w-10">
        <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
          <MessageCircle className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
    );
  }
  return (
    <Avatar className="flex-shrink-0 h-10 w-10">
      <AvatarFallback
        className={
          isRead
            ? "bg-muted text-muted-foreground"
            : "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
        }
      >
        <Bell className="w-4 h-4" />
      </AvatarFallback>
    </Avatar>
  );
}

type NotificationRowProps = {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  isLast: boolean;
};

function NotificationRow({
  notification,
  onMarkAsRead,
  onDelete,
  isLast,
}: NotificationRowProps) {
  return (
    <div
      className={[
        "flex gap-4 p-5 items-start transition-colors group",
        !isLast ? "border-b" : "",
        notification.isRead
          ? "bg-transparent hover:bg-muted/40"
          : "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/30",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <NotificationIcon title={notification.title} isRead={notification.isRead} />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h4
            className={`text-sm font-semibold leading-snug ${
              notification.isRead ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {notification.title}
          </h4>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {getRelativeTime(notification.createdAt)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(notification.id)}
              aria-label="Delete notification"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <p
          className={`text-sm leading-relaxed ${
            notification.isRead ? "text-muted-foreground" : "text-foreground/80"
          }`}
        >
          {notification.message}
        </p>

        {!notification.isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            className="mt-2 h-7 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Mark as read
          </Button>
        )}
      </div>
    </div>
  );
}

type GroupedListProps = {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
};

function GroupedNotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
}: GroupedListProps) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Bell className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground text-sm font-medium">
          No notifications here.
        </p>
      </div>
    );
  }

  const groups: Array<"Today" | "Yesterday" | "Earlier"> = [
    "Today",
    "Yesterday",
    "Earlier",
  ];
  const grouped: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  for (const n of notifications) {
    grouped[getGroup(n.createdAt)].push(n);
  }

  return (
    <div>
      {groups.map((group) => {
        const items = grouped[group];
        if (items.length === 0) return null;
        return (
          <div key={group}>
            <div className="px-5 py-2 bg-muted/40 border-b">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group}
              </span>
            </div>
            {items.map((notification, index) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                isLast={index === items.length - 1}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: Notification[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Notification, "id">),
        }));
        setNotifications(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error subscribing to notifications:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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

  const handleDelete = async (id: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      await deleteDoc(doc(db, "notifications", id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filterNotifications = (tab: string): Notification[] => {
    if (tab === "unread") return notifications.filter((n) => !n.isRead);
    if (tab === "mentions")
      return notifications.filter((n) =>
        n.title.toLowerCase().includes("mention")
      );
    if (tab === "assignments")
      return notifications.filter((n) =>
        n.title.toLowerCase().includes("assign")
      );
    return notifications;
  };

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
    <div className="w-full px-4 py-8 flex flex-col gap-6">
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
          ) : (
            <Tabs defaultValue="all">
              <div className="px-4 pt-3 border-b">
                <TabsList className="bg-transparent gap-1 h-auto p-0">
                  <TabsTrigger
                    value="all"
                    className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-3 pb-2"
                  >
                    All
                    {notifications.length > 0 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {notifications.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-3 pb-2"
                  >
                    Unread
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="mentions"
                    className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-3 pb-2"
                  >
                    Mentions
                  </TabsTrigger>
                  <TabsTrigger
                    value="assignments"
                    className="text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 px-3 pb-2"
                  >
                    Assignments
                  </TabsTrigger>
                </TabsList>
              </div>

              {(["all", "unread", "mentions", "assignments"] as const).map(
                (tab) => (
                  <TabsContent key={tab} value={tab} className="mt-0">
                    {filterNotifications(tab).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Bell className="w-12 h-12 text-muted-foreground/30" />
                        <p className="text-muted-foreground text-sm font-medium">
                          {tab === "all"
                            ? "You're all caught up!"
                            : `No ${tab} notifications.`}
                        </p>
                      </div>
                    ) : (
                      <GroupedNotificationList
                        notifications={filterNotifications(tab)}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    )}
                  </TabsContent>
                )
              )}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
