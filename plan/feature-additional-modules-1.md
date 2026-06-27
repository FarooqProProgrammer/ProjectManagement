---
goal: Add Advanced Task Features, Activity Logs, and Notifications
version: 1.0
date_created: 2026-06-27
last_updated: 2026-06-27
owner: Antigravity
status: 'Planned'
tags: [feature, architecture]
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

This implementation plan outlines the architecture and tasks required to build out the next phase of modules for the Project Management application. This includes Advanced Task Features (Comments and Sub-tasks), a comprehensive Activity Log (Audit Trail), and In-App Notifications to improve team collaboration.

## 1. Requirements & Constraints

- **REQ-001**: Users must be able to add comments to tasks.
- **REQ-002**: Users must be able to break tasks down into checklist sub-tasks.
- **REQ-003**: The system must track changes to tasks (status changes, assignee changes) in an activity log.
- **REQ-004**: Users must receive in-app notifications when they are assigned a task or mentioned in a comment.
- **CON-001**: All data must be securely stored in Firebase Firestore with appropriate security rules.
- **PAT-001**: Use existing React hooks and Vercel Best Practices for data fetching.

## 2. Implementation Steps

### Implementation Phase 1: Task Comments & Sub-tasks

- GOAL-001: Implement the backend schemas and frontend UI for users to discuss tasks and create sub-task checklists.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Update `Task` interface in `src/lib/task.ts` to include `subtasks` array. | | |
| TASK-002 | Create `src/lib/comment.ts` for managing Firestore `comments` collection linked to `taskId`. | | |
| TASK-003 | Update Task Detail Modal UI to display a discussion thread and comment input. | | |
| TASK-004 | Update Task Detail Modal UI to display and toggle checklist sub-tasks. | | |

### Implementation Phase 2: Activity Logs

- GOAL-002: Implement an audit trail that automatically records who changed what on a task.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-005 | Create `src/lib/activity.ts` for managing Firestore `activity_logs` collection. | | |
| TASK-006 | Refactor `updateTaskStatus` and `updateTaskAssignee` to write to the activity log upon success. | | |
| TASK-007 | Create an `ActivityFeed` UI component to render the log inside the Task Detail Modal. | | |

### Implementation Phase 3: In-App Notifications

- GOAL-003: Notify users of important events (like being assigned to a task).

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-008 | Create `src/lib/notification.ts` for managing `notifications` sub-collection under users. | | |
| TASK-009 | Trigger a notification creation when `updateTaskAssignee` is called. | | |
| TASK-010 | Create a Notifications dropdown in the `AppSidebar` top navigation. | | |

## 3. Alternatives

- **ALT-001**: Using Firebase Cloud Functions to generate activity logs and notifications. *Reason not chosen: Requires upgrading to Firebase Blaze (paid) plan. Doing it client-side is free and sufficient for MVP.*
- **ALT-002**: Real-time push notifications via FCM. *Reason not chosen: Adds significant setup complexity for browsers; in-app polling/listeners are more reliable for a web app dashboard MVP.*

## 4. Dependencies

- **DEP-001**: `lucide-react` for Notification and Activity icons.
- **DEP-002**: `date-fns` for relative time formatting (e.g., "2 hours ago").

## 5. Files

- **FILE-001**: `src/lib/task.ts` (Update schema)
- **FILE-002**: `src/lib/comment.ts` (New)
- **FILE-003**: `src/lib/activity.ts` (New)
- **FILE-004**: `src/lib/notification.ts` (New)
- **FILE-005**: `src/components/AppSidebar.tsx` (Add notifications bell)
- **FILE-006**: `src/app/dashboard/tasks/page.tsx` (Update modal UI)

## 6. Testing

- **TEST-001**: Verify that adding a comment correctly links to the active user and task.
- **TEST-002**: Verify that changing an assignee creates an Activity Log entry.
- **TEST-003**: Verify that the newly assigned user receives a Notification in their dropdown.

## 7. Risks & Assumptions

- **RISK-001**: Client-side generation of activity logs means if the client loses connection between updating the task and writing the log, the log might be missed. 
- **ASSUMPTION-001**: Users will remain logged in to receive real-time Firestore updates for notifications.

## 8. Related Specifications / Further Reading
- [Firebase Firestore Data Modeling](https://firebase.google.com/docs/firestore/manage-data/structure-data)
