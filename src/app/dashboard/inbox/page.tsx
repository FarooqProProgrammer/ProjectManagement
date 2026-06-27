"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  getUserNotifications,
  markNotificationAsRead,
  Notification,
} from "@/lib/notification";
import { getTasksByWorkspace, Task } from "@/lib/task";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Inbox,
  Bell,
  CheckSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

type InboxItem =
  | { kind: "notification"; data: Notification }
  | { kind: "overdue"; data: Task }
  | { kind: "task"; data: Task };

function formatDate(value: string | undefined | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  due.setHours(23, 59, 59, 999);
  return due < new Date() && task.status !== "Done";
}

function LoadingRows() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-5 items-start">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-24 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  sub?: string;
}

function EmptyState({ icon, message, sub }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <div className="text-muted-foreground/30">{icon}</div>
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
      {sub && <p className="text-muted-foreground/70 text-xs">{sub}</p>}
    </div>
  );
}

interface NotificationRowProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function NotificationRow({ notification, onMarkRead }: NotificationRowProps) {
  const unread = !notification.isRead;
  return (
    <div
      className={[
        "flex gap-4 p-5 items-start transition-colors border-b last:border-b-0",
        unread
          ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50/80 dark:hover:bg-blue-950/30"
          : "bg-transparent hover:bg-muted/40",
      ].join(" ")}
    >
      <div
        className={[
          "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
          unread
            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        <Bell className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h4
            className={`text-sm font-semibold leading-snug ${
              unread ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {notification.title}
          </h4>
          <Badge
            variant="outline"
            className="text-xs whitespace-nowrap flex-shrink-0 font-normal text-muted-foreground"
          >
            {formatDate(notification.createdAt)}
          </Badge>
        </div>
        <p
          className={`text-sm leading-relaxed ${
            unread ? "text-foreground/80" : "text-muted-foreground"
          }`}
        >
          {notification.message}
        </p>
      </div>

      <div className="flex-shrink-0">
        {unread ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMarkRead(notification.id)}
            className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Mark Read
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Read
          </span>
        )}
      </div>
    </div>
  );
}

interface TaskRowProps {
  task: Task;
  overdue?: boolean;
}

function TaskRow({ task, overdue }: TaskRowProps) {
  return (
    <div
      className={[
        "flex gap-4 p-5 items-start transition-colors border-b last:border-b-0",
        overdue
          ? "bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50/80 dark:hover:bg-red-950/30"
          : "bg-transparent hover:bg-muted/40",
      ].join(" ")}
    >
      <div
        className={[
          "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
          overdue
            ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {overdue ? (
          <Clock className="w-4 h-4" />
        ) : (
          <CheckSquare className="w-4 h-4" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h4
            className={`text-sm font-semibold leading-snug ${
              overdue ? "text-red-700 dark:text-red-300" : "text-foreground"
            }`}
          >
            {task.title}
          </h4>
          {task.dueDate && (
            <Badge
              variant="outline"
              className={`text-xs whitespace-nowrap flex-shrink-0 font-normal ${
                overdue
                  ? "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
              }`}
            >
              {overdue ? "Due " : ""}
              {formatDate(task.dueDate)}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="secondary"
            className={`text-xs ${
              overdue
                ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                : ""
            }`}
          >
            {task.status}
          </Badge>
          {task.priority && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {task.priority}
            </Badge>
          )}
          {overdue && (
            <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
              <AlertTriangle className="w-3 h-3" />
              Overdue
            </span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <Link href="/dashboard/tasks">
          <Button
            variant="outline"
            size="sm"
            className={`text-xs ${
              overdue
                ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                : ""
            }`}
          >
            View Task
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const currentUser = auth.currentUser;
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || workspaceLoading) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [notifData, taskData] = await Promise.all([
          getUserNotifications(currentUser.uid),
          activeWorkspace
            ? getTasksByWorkspace(activeWorkspace.id)
            : Promise.resolve([] as Task[]),
        ]);
        setNotifications(notifData);
        setTasks(taskData);
      } catch (error) {
        console.error("Error fetching inbox data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, activeWorkspace, workspaceLoading]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const uid = currentUser?.uid;

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const myTasks = tasks.filter(
    (t) => t.assigneeId === uid && t.status !== "Done"
  );
  const overdueTasks = myTasks.filter(isOverdue);
  const actionTasks = myTasks.filter(
    (t) => !isOverdue(t) && t.status === "To Do"
  );

  const totalUnread = unreadNotifications.length + overdueTasks.length;

  const allItems: InboxItem[] = [
    ...overdueTasks.map((t): InboxItem => ({ kind: "overdue", data: t })),
    ...unreadNotifications.map(
      (n): InboxItem => ({ kind: "notification", data: n })
    ),
    ...actionTasks.map((t): InboxItem => ({ kind: "task", data: t })),
  ];

  if (!currentUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Please sign in to view your inbox.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 flex flex-col gap-6">
      <title>Inbox | Projectify</title>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Inbox className="w-7 h-7 text-blue-500" />
            Inbox
            {totalUnread > 0 && (
              <Badge variant="destructive" className="text-sm font-bold">
                {totalUnread}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Your notifications, action items, and overdue tasks — all in one
            place.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="mb-2">
          <TabsTrigger value="all" className="gap-2">
            All
            {totalUnread > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 h-5 min-w-5"
              >
                {allItems.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-3.5 h-3.5" />
            Notifications
            {unreadNotifications.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 h-5 min-w-5"
              >
                {unreadNotifications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <CheckSquare className="w-3.5 h-3.5" />
            My Tasks
            {actionTasks.length > 0 && (
              <Badge
                variant="secondary"
                className="text-xs px-1.5 py-0 h-5 min-w-5"
              >
                {actionTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overdue" className="gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Overdue
            {overdueTasks.length > 0 && (
              <Badge
                variant="destructive"
                className="text-xs px-1.5 py-0 h-5 min-w-5"
              >
                {overdueTasks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* All */}
        <TabsContent value="all">
          <Card className="overflow-hidden">
            <Separator />
            <CardContent className="p-0">
              {loading ? (
                <LoadingRows />
              ) : allItems.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="w-12 h-12" />}
                  message="Your inbox is empty"
                  sub="No notifications, overdue tasks, or action items right now."
                />
              ) : (
                <div>
                  {allItems.map((item, index) => {
                    if (item.kind === "notification") {
                      return (
                        <NotificationRow
                          key={`notif-${item.data.id}-${index}`}
                          notification={item.data}
                          onMarkRead={handleMarkRead}
                        />
                      );
                    }
                    if (item.kind === "overdue") {
                      return (
                        <TaskRow
                          key={`overdue-${item.data.id}-${index}`}
                          task={item.data}
                          overdue
                        />
                      );
                    }
                    return (
                      <TaskRow
                        key={`task-${item.data.id}-${index}`}
                        task={item.data}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="overflow-hidden">
            <Separator />
            <CardContent className="p-0">
              {loading ? (
                <LoadingRows />
              ) : unreadNotifications.length === 0 ? (
                <EmptyState
                  icon={<Bell className="w-12 h-12" />}
                  message="No unread notifications"
                  sub="You're all caught up!"
                />
              ) : (
                <div>
                  {unreadNotifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Tasks */}
        <TabsContent value="tasks">
          <Card className="overflow-hidden">
            <Separator />
            <CardContent className="p-0">
              {loading ? (
                <LoadingRows />
              ) : actionTasks.length === 0 ? (
                <EmptyState
                  icon={<CheckSquare className="w-12 h-12" />}
                  message="No action items"
                  sub="Tasks assigned to you with status 'To Do' will appear here."
                />
              ) : (
                <div>
                  {actionTasks.map((t) => (
                    <TaskRow key={t.id} task={t} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overdue */}
        <TabsContent value="overdue">
          <Card className="overflow-hidden">
            <Separator />
            <CardContent className="p-0">
              {loading ? (
                <LoadingRows />
              ) : overdueTasks.length === 0 ? (
                <EmptyState
                  icon={<Clock className="w-12 h-12" />}
                  message="No overdue tasks"
                  sub="Great work — nothing is past its due date."
                />
              ) : (
                <div>
                  {overdueTasks.map((t) => (
                    <TaskRow key={t.id} task={t} overdue />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
