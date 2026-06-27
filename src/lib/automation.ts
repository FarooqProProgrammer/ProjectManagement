import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { Task, updateTaskAssignee, updateTaskPriority, updateTaskStatus } from "./task";

export type TriggerType = 'status_equals' | 'priority_equals';
export type ActionType = 'assign_user' | 'set_priority' | 'set_status';

export interface AutomationTrigger {
  type: TriggerType;
  value: string;
}

export interface AutomationAction {
  type: ActionType;
  value: string;
}

export interface AutomationRule {
  id: string;
  workspaceId: string;
  name: string;
  trigger: AutomationTrigger;
  action: AutomationAction;
  isActive: boolean;
  createdAt: any;
}

export const getWorkspaceAutomations = async (workspaceId: string): Promise<AutomationRule[]> => {
  const q = query(collection(db, "automation_rules"), where("workspaceId", "==", workspaceId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as AutomationRule[];
};

export const createAutomation = async (
  workspaceId: string, 
  name: string, 
  trigger: AutomationTrigger, 
  action: AutomationAction
): Promise<AutomationRule> => {
  const newRule = {
    workspaceId,
    name,
    trigger,
    action,
    isActive: true,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, "automation_rules"), newRule);
  return { id: docRef.id, ...newRule } as AutomationRule;
};

export const toggleAutomation = async (ruleId: string, isActive: boolean): Promise<void> => {
  await updateDoc(doc(db, "automation_rules", ruleId), { isActive });
};

export const deleteAutomation = async (ruleId: string): Promise<void> => {
  await deleteDoc(doc(db, "automation_rules", ruleId));
};

// Evaluation Engine
export const evaluateAutomations = async (task: Task, triggerEvent: TriggerType, eventValue: string): Promise<void> => {
  try {
    const rules = await getWorkspaceAutomations(task.workspaceId);
    const activeRules = rules.filter(r => r.isActive);
    
    for (const rule of activeRules) {
      if (rule.trigger.type === triggerEvent && rule.trigger.value === eventValue) {
        console.log(`Executing automation: ${rule.name}`);
        
        switch (rule.action.type) {
          case 'assign_user':
            await updateTaskAssignee(task.id, rule.action.value);
            break;
          case 'set_priority':
            await updateTaskPriority(task.id, rule.action.value as any);
            break;
          case 'set_status':
            await updateTaskStatus(task.id, rule.action.value as any);
            break;
        }
      }
    }
  } catch (error) {
    console.error("Failed to evaluate automations:", error);
  }
};
