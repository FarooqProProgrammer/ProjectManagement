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
  ActionType
} from "@/lib/automation";
import { getUsersByIds, UserProfile } from "@/lib/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Plus, Trash2, Power, PowerOff, ArrowRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AutomationsPage() {
  const { activeWorkspace, loading: wsLoading } = useWorkspace();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // New Rule State
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("status_equals");
  const [triggerValue, setTriggerValue] = useState("Done");
  const [actionType, setActionType] = useState<ActionType>("assign_user");
  const [actionValue, setActionValue] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  }, [activeWorkspace]);

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
    } catch (error) {
      console.error("Error creating rule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (ruleId: string, currentState: boolean) => {
    try {
      setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !currentState } : r));
      await toggleAutomation(ruleId, !currentState);
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this automation?")) return;
    try {
      setRules(rules.filter(r => r.id !== ruleId));
      await deleteAutomation(ruleId);
    } catch (error) {
      console.error("Error deleting rule:", error);
    }
  };

  if (wsLoading || loading) {
    return <div className="p-8 text-slate-500">Loading automations...</div>;
  }

  if (!activeWorkspace) {
    return <div className="p-8 text-slate-500">No active workspace selected.</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Automations | Projectify</title>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-amber-500" />
          Automations Engine
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Set up "If-This-Then-That" rules to automate your team's workflow in {activeWorkspace.name}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Create Form */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                New Rule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRule} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Rule Name</label>
                  <Input 
                    placeholder="e.g. Auto-assign QA" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">When</p>
                  
                  <Select value={triggerType} onValueChange={(val: any) => setTriggerType(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status_equals">Task Status Changes To</SelectItem>
                      <SelectItem value="priority_equals">Task Priority Changes To</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={triggerValue} onValueChange={setTriggerValue}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerType === 'status_equals' ? (
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

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/50 space-y-3">
                  <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider">Then</p>
                  
                  <Select value={actionType} onValueChange={(val: any) => setActionType(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign_user">Assign To Member</SelectItem>
                      <SelectItem value="set_priority">Set Priority To</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={actionValue} onValueChange={setActionValue}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actionType === 'assign_user' ? (
                        members.map(m => (
                          <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
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

                <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  {isSubmitting ? "Saving..." : "Save Automation"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Rules List */}
        <div className="md:col-span-2">
          <div className="space-y-4">
            {rules.length === 0 ? (
              <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-300 dark:border-slate-800">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <Zap className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">No Automations Yet</p>
                  <p className="text-sm mt-1">Create your first rule on the left to start automating your workflow.</p>
                </CardContent>
              </Card>
            ) : (
              rules.map(rule => {
                let triggerText = "";
                if (rule.trigger.type === "status_equals") triggerText = `Status becomes ${rule.trigger.value}`;
                if (rule.trigger.type === "priority_equals") triggerText = `Priority becomes ${rule.trigger.value}`;

                let actionText = "";
                if (rule.action.type === "assign_user") {
                  const user = members.find(m => m.uid === rule.action.value);
                  actionText = `Assign to ${user?.displayName || 'Unknown'}`;
                }
                if (rule.action.type === "set_priority") actionText = `Set Priority to ${rule.action.value}`;

                return (
                  <Card key={rule.id} className={`transition-all duration-300 ${!rule.isActive ? 'opacity-60 bg-slate-50 dark:bg-slate-900/40' : 'bg-white dark:bg-slate-900 shadow-sm border-amber-200/50 dark:border-amber-900/30'}`}>
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{rule.name}</h3>
                          {!rule.isActive && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full">
                              Paused
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm flex-wrap">
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md text-slate-700 dark:text-slate-300">
                            <span className="text-xs font-bold text-slate-400">WHEN</span>
                            {triggerText}
                          </div>
                          
                          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 px-3 py-1.5 rounded-md text-amber-700 dark:text-amber-400">
                            <span className="text-xs font-bold text-amber-400 dark:text-amber-600">THEN</span>
                            {actionText}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 border-l border-slate-100 dark:border-slate-800 pl-4">
                        <Switch 
                          checked={rule.isActive} 
                          onCheckedChange={() => handleToggle(rule.id, rule.isActive)} 
                        />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(rule.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
