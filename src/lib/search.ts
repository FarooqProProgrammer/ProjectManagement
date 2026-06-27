import { Task } from "@/lib/task";
import { Project } from "@/lib/project";
import { Doc } from "@/lib/doc";
import { Goal } from "@/lib/goal";

export interface SearchResult {
  id: string;
  type: "task" | "project" | "doc" | "goal";
  title: string;
  subtitle?: string;
  href: string;
}

type RelevanceScore = 0 | 1 | 2;

function scoreMatch(text: string, query: string): RelevanceScore {
  const normalText = text.toLowerCase();
  const normalQuery = query.toLowerCase();
  if (normalText === normalQuery) return 0;
  if (normalText.startsWith(normalQuery)) return 1;
  if (normalText.includes(normalQuery)) return 2;
  return -1 as unknown as RelevanceScore;
}

function matchesQuery(fields: string[], query: string): RelevanceScore | -1 {
  let best: number = -1;
  for (const field of fields) {
    const score = scoreMatch(field, query);
    if (score !== -1 && (best === -1 || score < best)) {
      best = score;
    }
  }
  return best as RelevanceScore | -1;
}

export function searchAll(
  query: string,
  data: {
    tasks?: Task[];
    projects?: Project[];
    docs?: Doc[];
    goals?: Goal[];
  }
): SearchResult[] {
  if (!query || query.trim() === "") {
    return [];
  }

  const trimmedQuery = query.trim();

  const scored: { result: SearchResult; score: number }[] = [];

  if (data.tasks) {
    for (const task of data.tasks) {
      const fields: string[] = [task.title];
      if (task.description) fields.push(task.description);
      const score = matchesQuery(fields, trimmedQuery);
      if (score !== -1) {
        scored.push({
          result: {
            id: task.id,
            type: "task",
            title: task.title,
            subtitle: task.status,
            href: "/dashboard/tasks",
          },
          score,
        });
      }
    }
  }

  if (data.projects) {
    for (const project of data.projects) {
      const fields: string[] = [project.name];
      if (project.description) fields.push(project.description);
      const score = matchesQuery(fields, trimmedQuery);
      if (score !== -1) {
        scored.push({
          result: {
            id: project.id,
            type: "project",
            title: project.name,
            subtitle: project.status,
            href: `/dashboard/projects/${project.id}`,
          },
          score,
        });
      }
    }
  }

  if (data.docs) {
    for (const doc of data.docs) {
      const fields: string[] = [doc.title];
      if (doc.description) fields.push(doc.description);
      const score = matchesQuery(fields, trimmedQuery);
      if (score !== -1) {
        scored.push({
          result: {
            id: doc.id,
            type: "doc",
            title: doc.title,
            subtitle: doc.description,
            href: `/dashboard/docs/${doc.id}`,
          },
          score,
        });
      }
    }
  }

  if (data.goals) {
    for (const goal of data.goals) {
      const fields: string[] = [goal.title];
      if (goal.description) fields.push(goal.description);
      const score = matchesQuery(fields, trimmedQuery);
      if (score !== -1) {
        scored.push({
          result: {
            id: goal.id,
            type: "goal",
            title: goal.title,
            subtitle: goal.description,
            href: "/dashboard/goals",
          },
          score,
        });
      }
    }
  }

  scored.sort((a, b) => a.score - b.score);

  return scored.slice(0, 20).map((s) => s.result);
}
