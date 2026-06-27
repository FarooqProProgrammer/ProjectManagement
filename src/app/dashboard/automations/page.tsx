"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  AutomationRule,
  getWorkspaceAutomations,
  createAutomation,
  toggleAutomation,
  deleteAutomation,
  TriggerType,
  ActionType,
} from "@/lib/automation";
import { getUsersByIds, UserProfile } from "@/lib/user";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Zap, Plus, Trash2, ArrowRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Helper label maps
// ---------------------------------------------------------------------------
const TRIGGER_LABELS: Record<TriggerType, string> = {
  status_equals: "Status Changes To",
  priority_equals: "Priority Changes To",
};

const ACTION_LABELS: Record<ActionType, string> = {
  assign_user: "Assign To Member",
  set_priority: "Set Priority To",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AutomationsPage() {
  const { activeWorkspace, loading: wsLoading } = useWorkspace();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog open state
  const [dialogOpen, setDialogOpen] = useState(false);

  // New rule form state
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("status_equals");
  const [triggerValue, setTriggerValue] = useState("Done");
  const [actionType, setActionType] = useState<ActionType>("assign_user");
  const [actionValue, setActionValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedRules = await getWorkspaceAutomations(activeWorkspace.id);
        setRules(fetchedRules);

        const fetchedMembers = await getUsersByIds(activeWorkspace.members);
        setMembers(fetchedMembers);

        if (fetchedMembers.length > 0 && !actionValue) {
          setActionValue(fetchedMembers[0].uid);
        }
      } catch (error) {
        console.error("Error fetching automations data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  // Reset trigger value when trigger type changes
  useEffect(() => {
    setTriggerValue(triggerType === "status_equals" ? "Done" : "High");
  }, [triggerType]);

  // Reset action value when action type changes
  useEffect(() => {
    if (actionType === "assign_user") {
      setActionValue(members[0]?.uid ?? "");
    } else {
      setActionValue("High");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionType]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !name.trim() || !triggerValue || !actionValue) return;

    setIsSubmitting(true);
    try {
      const newRule = await createAutomation(
        activeWorkspace.id,
        name,
        { type: triggerType, value: triggerValue },
        { type: actionType, value: actionValue }
      );
      setRules([newRule, ...rules]);
      setName("");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating rule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (ruleId: string, currentState: boolean) => {
    try {
      setRules(rules.map((r) => (r.id === ruleId ? { ...r, isActive: !currentState } : r)));
      await toggleAutomation(ruleId, !currentState);
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    try {
      setRules(rules.filter((r) => r.id !== ruleId));
      await deleteAutomation(ruleId);
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  // ---------------------------------------------------------------------------
  // Derived helpers
  // ---------------------------------------------------------------------------
  const resolveTriggerText = (rule: AutomationRule): string => {
    if (rule.trigger.type === "status_equals") return `Status becomes ${rule.trigger.value}`;
    if (rule.trigger.type === "priority_equals") return `Priority becomes ${rule.trigger.value}`;
    return rule.trigger.value;
  };

  const resolveActionText = (rule: AutomationRule): string => {
    if (rule.action.type === "assign_user") {
      const user = members.find((m) => m.uid === rule.action.value);
      return `Assign to ${user?.displayName ?? "Unknown"}`;
    }
    if (rule.action.type === "set_priority") return `Set Priority to ${rule.action.value}`;
    return rule.action.value;
  };

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (wsLoading || loading) {
    return (
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full p-8">
        <title>Automations | Projectify</title>
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-48" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-36 rounded-md" />
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-8 w-36 rounded-md" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-10 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="p-8 text-slate-500">
        <title>Automations | Projectify</title>
        No active workspace selected.
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Automations | Projectify</title>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Zap className="w-8 h-8 text-amber-500" />
            Automations Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Set up "If-This-Then-That" rules to automate your team's workflow in{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {activeWorkspace.name}
            </span>
            .
          </p>
        </div>

        {/* Create Automation Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Automation
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Create Automation Rule
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateRule} className="space-y-5 pt-2">
              {/* Rule name */}
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  placeholder="e.g. Auto-assign QA"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <Separator />

              {/* WHEN */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  When (Trigger)
                </p>

                <div className="space-y-2">
                  <Label htmlFor="trigger-type">Trigger Condition</Label>
                  <Select
                    value={triggerType}
                    onValueChange={(val) => setTriggerType(val as TriggerType)}
                  >
                    <SelectTrigger id="trigger-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status_equals">Task Status Changes To</SelectItem>
                      <SelectItem value="priority_equals">Task Priority Changes To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trigger-value">Trigger Value</Label>
                  <Select value={triggerValue} onValueChange={setTriggerValue}>
                    <SelectTrigger id="trigger-value">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerType === "status_equals" ? (
                        <>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Review">Review</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* THEN */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                  Then (Action)
                </p>

                <div className="space-y-2">
                  <Label htmlFor="action-type">Action Type</Label>
                  <Select
                    value={actionType}
                    onValueChange={(val) => setActionType(val as ActionType)}
                  >
                    <SelectTrigger id="action-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign_user">Assign To Member</SelectItem>
                      <SelectItem value="set_priority">Set Priority To</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action-value">Action Value</Label>
                  <Select value={actionValue} onValueChange={setActionValue}>
                    <SelectTrigger id="action-value">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionType === "assign_user" ? (
                        members.map((m) => (
                          <SelectItem key={m.uid} value={m.uid}>
                            {m.displayName}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {isSubmitting ? "Saving..." : "Save Automation"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Rules list */}
      {rules.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Zap className="w-14 h-14 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="font-semibold text-slate-700 dark:text-slate-300 text-lg">
              No automations yet
            </p>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Create your first rule to start automating your workflow.
            </p>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Automation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const triggerText = resolveTriggerText(rule);
            const actionText = resolveActionText(rule);

            return (
              <Card
                key={rule.id}
                className={`transition-all duration-300 ${
                  !rule.isActive
                    ? "opacity-60 bg-slate-50 dark:bg-slate-900/40"
                    : "bg-white dark:bg-slate-900 shadow-sm border-amber-200/50 dark:border-amber-900/30"
                }`}
              >
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
                        {rule.name}
                      </CardTitle>
                      {!rule.isActive && (
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                          Paused
                        </Badge>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`toggle-${rule.id}`}
                          className="text-xs text-slate-500 cursor-pointer"
                        >
                          {rule.isActive ? "Active" : "Paused"}
                        </Label>
                        <Switch
                          id={`toggle-${rule.id}`}
                          checked={rule.isActive}
                          onCheckedChange={() => handleToggle(rule.id, rule.isActive)}
                        />
                      </div>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(rule.id)}
                        aria-label="Delete automation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <Separator className="mx-5 w-auto" />

                <CardContent className="px-5 py-4">
                  <div className="flex items-center gap-3 flex-wrap text-sm">
                    {/* Trigger */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 text-xs">
                        {TRIGGER_LABELS[rule.trigger.type]}
                      </Badge>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {rule.trigger.value}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />

                    {/* Action */}
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 text-xs">
                        {ACTION_LABELS[rule.action.type]}
                      </Badge>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {actionText.replace(`${ACTION_LABELS[rule.action.type]} `, "").replace("Assign to ", "").replace("Set Priority to ", "") || actionText}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
