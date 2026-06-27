import { Task } from "@/lib/task";
import { UserProfile } from "@/lib/user";
import { Project } from "@/lib/project";

export interface TaskMetrics {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionRate: number;
}

export interface MemberWorkload {
  memberId: string;
  displayName: string;
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export interface ProjectMetrics {
  projectId: string;
  name: string;
  total: number;
  completed: number;
  progress: number;
}

export interface WeeklyVelocity {
  week: string;
  completed: number;
}

function getISOWeekLabel(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function getStartOfISOWeek(weeksAgo: number): Date {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - (day - 1) - weeksAgo * 7);
  return monday;
}

function resolveDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value === "object" && typeof value.toDate === "function") {
    return value.toDate();
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function getTaskMetrics(tasks: Task[]): TaskMetrics {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "Done").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const todo = tasks.filter((t) => t.status === "To Do").length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, inProgress, todo, completionRate };
}

export function getMemberWorkload(tasks: Task[], members: UserProfile[]): MemberWorkload[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return members.map((member) => {
    const memberTasks = tasks.filter((t) => t.assigneeId === member.uid);
    const total = memberTasks.length;
    const completed = memberTasks.filter((t) => t.status === "Done").length;
    const inProgress = memberTasks.filter((t) => t.status === "In Progress").length;
    const overdue = memberTasks.filter((t) => {
      if (!t.dueDate || t.status === "Done") return false;
      const due = new Date(t.dueDate);
      return !isNaN(due.getTime()) && due < today;
    }).length;

    return {
      memberId: member.uid,
      displayName: member.displayName || member.email,
      total,
      completed,
      inProgress,
      overdue,
    };
  });
}

export function getProjectMetrics(tasks: Task[], projects: Project[]): ProjectMetrics[] {
  return projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === "Done").length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    return {
      projectId: project.id,
      name: project.name,
      total,
      completed,
      progress,
    };
  });
}

export function getWeeklyVelocity(tasks: Task[], weeksBack: number = 8): WeeklyVelocity[] {
  const weekStart = getStartOfISOWeek(weeksBack - 1);

  const weekMap: Record<string, number> = {};

  for (let i = 0; i < weeksBack; i++) {
    const label = getISOWeekLabel(getStartOfISOWeek(weeksBack - 1 - i));
    weekMap[label] = 0;
  }

  for (const task of tasks) {
    if (task.status !== "Done") continue;
    const date = resolveDate(task.createdAt);
    if (!date || date < weekStart) continue;
    const label = getISOWeekLabel(date);
    if (label in weekMap) {
      weekMap[label] += 1;
    }
  }

  return Object.keys(weekMap)
    .sort()
    .map((week) => ({ week, completed: weekMap[week] }));
}

export function getOverdueTasks(tasks: Task[]): Task[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.filter((t) => {
    if (!t.dueDate || t.status === "Done") return false;
    const due = new Date(t.dueDate);
    return !isNaN(due.getTime()) && due < today;
  });
}
