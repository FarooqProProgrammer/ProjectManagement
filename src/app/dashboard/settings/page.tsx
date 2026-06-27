import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Bell, Shield, Key } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20 text-left transition-colors">
            <User className="w-5 h-5" />
            Profile Settings
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 font-medium hover:bg-white/5 hover:text-white text-left transition-colors">
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 font-medium hover:bg-white/5 hover:text-white text-left transition-colors">
            <Shield className="w-5 h-5" />
            Security
          </button>
        </div>

        <div className="col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-slate-400">Update your personal details and public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Display Name</label>
                <input 
                  type="text" 
                  disabled
                  placeholder="Loading..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <p className="text-xs text-slate-500">This is the name displayed to other users.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  disabled
                  placeholder="Loading..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed">
                  Save Changes
                </button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-900 border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <Key className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-slate-400">Irreversible actions for your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <button className="border border-red-500/50 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg font-medium transition-colors">
                Delete Account
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
