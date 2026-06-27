import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#080c14] text-white font-sans overflow-hidden">

      {/* Background atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -left-[15%] w-[60%] h-[60%] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute top-[10%] -right-[15%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-cyan-600/8 blur-[120px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Top announcement bar */}
      <div className="relative z-20 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-white/5 py-2.5 px-4 text-center text-sm text-slate-300">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Projectify 2.0 is live — now with AI-powered automations
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 transition-colors">
            Try it free →
          </Link>
        </span>
      </div>

      <Header />

      <main className="relative z-10 flex-1 flex flex-col items-center w-full">

        {/* ── Hero ── */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 backdrop-blur-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Trusted by 12,000+ product teams worldwide
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] max-w-5xl">
            <span className="text-white">The workspace your</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              team actually loves.
            </span>
          </h1>

          <p className="mt-7 text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            Projectify brings tasks, timelines, and team collaboration into one
            fast, beautiful workspace — so you can focus on building, not managing.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(37,99,235,0.45)] hover:shadow-[0_0_65px_rgba(37,99,235,0.65)] hover:-translate-y-0.5 active:scale-95"
            >
              Start for free — no card needed
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2.5 hover:-translate-y-0.5 active:scale-95">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10">
                <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              Watch 2-min demo
            </button>
          </div>

          {/* Trust stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-6 border-y border-white/5 py-8 w-full max-w-3xl">
            {[
              { value: "12k+", label: "Teams worldwide" },
              { value: "4M+", label: "Tasks completed" },
              { value: "4.9 / 5", label: "Average rating" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map((stat) => (
              <div key={stat.value} className="flex flex-col items-center gap-1">
                <span className="text-3xl font-bold text-white">{stat.value}</span>
                <span className="text-sm text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dashboard Mockup ── */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="relative rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-slate-500">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
                app.projectify.io/dashboard
              </div>
              <div className="w-16" />
            </div>

            {/* App shell */}
            <div className="flex min-h-[420px]">
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-52 border-r border-white/5 bg-black/20 p-4 gap-1 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">P</div>
                  <span className="text-sm font-semibold text-white">Projectify</span>
                </div>
                {[
                  { label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", active: false },
                  { label: "My Tasks", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", active: true },
                  { label: "Projects", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z", active: false },
                  { label: "Team", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${item.active ? "bg-blue-500/15 text-blue-300" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"}`}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    {item.label}
                  </div>
                ))}
                <div className="mt-auto space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-slate-600 px-3 mb-2 mt-4">Projects</div>
                  {["Website Redesign", "Mobile App v2", "Q3 Marketing"].map((p, i) => (
                    <div key={p} className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-white/5 text-xs text-slate-500">
                      <span className={`w-2 h-2 rounded-full ${["bg-blue-500", "bg-purple-500", "bg-green-500"][i]}`} />
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Website Redesign</div>
                    <h3 className="text-base font-semibold text-white">Sprint Board</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-amber-500"].map((c, i) => (
                        <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-bold`}>
                          {["A", "B", "C", "D"][i]}
                        </div>
                      ))}
                    </div>
                    <div className="h-5 w-px bg-white/10" />
                    <div className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs font-medium border border-blue-500/20">
                      Sprint 4
                    </div>
                  </div>
                </div>

                {/* Kanban columns */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Todo */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Todo</span>
                      <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-500 text-[10px]">3</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="bg-white/[0.04] border border-white/8 rounded-xl p-3 hover:bg-white/[0.07] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-500/20 text-slate-400">Design</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        </div>
                        <p className="text-xs text-white font-medium leading-relaxed mb-2">Update hero section layout</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-600">Due Dec 15</span>
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white">A</div>
                        </div>
                      </div>
                      <div className="bg-white/[0.04] border border-white/8 rounded-xl p-3 hover:bg-white/[0.07] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/15 text-red-400">High</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        </div>
                        <p className="text-xs text-white font-medium leading-relaxed mb-2">Fix mobile nav overflow</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-600">Due Dec 12</span>
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[9px] font-bold text-white">B</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* In Progress */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">In Progress</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">2</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-xl p-3 hover:bg-blue-500/[0.1] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-300">Dev</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        </div>
                        <p className="text-xs text-white font-medium leading-relaxed mb-3">Implement auth flow redesign</p>
                        <div className="mb-2">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Progress</span>
                            <span>68%</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[68%] bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-600">Due Dec 18</span>
                          <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-[9px] font-bold text-white">C</div>
                        </div>
                      </div>
                      <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-xl p-3 hover:bg-blue-500/[0.1] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-300">Content</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        </div>
                        <p className="text-xs text-white font-medium leading-relaxed mb-3">Write onboarding copy</p>
                        <div className="mb-2">
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Progress</span>
                            <span>35%</span>
                          </div>
                          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[35%] bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-600">Due Dec 20</span>
                          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[9px] font-bold text-white">D</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Done */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Done</span>
                      <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px]">4</span>
                    </div>
                    <div className="space-y-2.5">
                      {["Set up CI/CD pipeline", "Design system tokens"].map((task, i) => (
                        <div key={task} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 opacity-60 cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-3.5 h-3.5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-xs text-slate-400 font-medium line-through">{task}</p>
                          </div>
                          <div className="w-5 h-5 rounded-full ml-auto flex items-center justify-center text-[9px] font-bold text-white"
                            style={{ background: ["#8b5cf6", "#ec4899"][i] }}>
                            {["B", "A"][i]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#080c14] to-transparent pointer-events-none" />
          </div>

          {/* Floating label below mockup */}
          <p className="text-center text-sm text-slate-500 mt-5">
            ↑ Interactive board, list, timeline, and calendar views built-in
          </p>
        </section>

        {/* ── Company logos strip ── */}
        <section className="w-full  px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-center text-xs uppercase tracking-widest text-slate-600 mb-8">Trusted by engineering and product teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
            {["Vercel", "Linear", "Stripe", "Notion", "Figma", "Loom"].map((name) => (
              <span key={name} className="text-slate-600 font-semibold text-lg tracking-tight hover:text-slate-400 transition-colors cursor-default">
                {name}
              </span>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 mb-4">
              Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              Everything your team needs.<br />
              <span className="text-slate-500">Nothing it doesn't.</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built for speed. Designed for focus. No bloat, no training required.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Real-time Sync",
                desc: "Changes push instantly across every device — no refreshing, no conflicts, no lost work.",
                color: "blue",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
              {
                title: "Multiple Views",
                desc: "Board, List, Timeline, and Calendar. Switch with one click to match how you think.",
                color: "purple",
                icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
              },
              {
                title: "Smart Automations",
                desc: "Set up workflows that handle the repetitive stuff — assignment, status updates, and notifications.",
                color: "pink",
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
              },
              {
                title: "Keyboard First",
                desc: "Open tasks, switch views, and take actions without ever touching the mouse.",
                color: "green",
                icon: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2",
              },
              {
                title: "Team Workload",
                desc: "See who's overloaded at a glance. Balance sprints before they burn out your team.",
                color: "amber",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
              },
              {
                title: "Activity & Audit",
                desc: "Every change logged. Know who moved what, when, and why — without the micromanaging.",
                color: "cyan",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
              },
            ].map((feature) => {
              const colors: Record<string, string> = {
                blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                pink: "text-pink-400 bg-pink-500/10 border-pink-500/20",
                green: "text-green-400 bg-green-500/10 border-green-500/20",
                amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
              };
              return (
                <div
                  key={feature.title}
                  className="group bg-white/[0.03] border border-white/8 rounded-2xl p-7 hover:bg-white/[0.06] hover:border-white/15 transition-all duration-300 cursor-default"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-5 group-hover:scale-110 transition-transform ${colors[feature.color]}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="w-full  px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 mb-4">
              How it works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Up and running in minutes</h2>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {[
              {
                step: "01",
                title: "Create your workspace",
                desc: "Sign up, invite your team, and set up your first project in under 3 minutes.",
              },
              {
                step: "02",
                title: "Add tasks & structure",
                desc: "Break work into tasks, set priorities, assign owners, and organize into sprints.",
              },
              {
                step: "03",
                title: "Ship faster, together",
                desc: "Track progress in real time, automate the routine, and keep everyone aligned.",
              },
            ].map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 mb-4">
              Testimonials
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Loved by product teams</h2>
            <p className="text-slate-400">Don't take our word for it — here's what our users say.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Jenkins",
                role: "Product Manager",
                company: "TechCorp",
                avatar: "SJ",
                avatarColor: "from-blue-500 to-cyan-500",
                content: "Projectify completely transformed how our team ships features. The interface is stunning and it's the fastest PM tool I've ever used.",
              },
              {
                name: "Michael Chen",
                role: "Engineering Lead",
                company: "StartupX",
                avatar: "MC",
                avatarColor: "from-purple-500 to-pink-500",
                content: "Finally, a PM tool that doesn't feel like a chore. The keyboard shortcuts alone saved me 30 minutes a day. My whole team is obsessed.",
              },
              {
                name: "Emily Rodriguez",
                role: "Senior Designer",
                company: "CreativeStudio",
                avatar: "ER",
                avatarColor: "from-amber-500 to-orange-500",
                content: "The attention to design detail is unmatched. It's the first PM tool I've used where the UI itself sparks joy. Nothing comes close.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="bg-white/[0.03] border border-white/8 rounded-2xl p-7 flex flex-col gap-5 hover:-translate-y-1 hover:border-white/15 transition-all duration-300"
              >
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed flex-1">"{t.content}"</p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/5">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role} @ {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="w-full  px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 mb-4">
              Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, honest pricing</h2>
            <p className="text-slate-400">Start free. Upgrade when you're ready. No surprises.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-8 flex flex-col gap-5">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Starter</h3>
                <p className="text-sm text-slate-500">For individuals and small teams.</p>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-slate-500 mb-1.5">/month</span>
              </div>
              <ul className="space-y-3 flex-1 text-sm">
                {["Up to 5 members", "Unlimited tasks", "Board & list views", "7-day activity log"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-400">
                    <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="mt-2 w-full py-3 rounded-2xl bg-white/8 border border-white/10 text-white font-medium hover:bg-white/15 transition-colors text-center text-sm">
                Get started free
              </Link>
            </div>

            {/* Pro — highlighted */}
            <div className="relative bg-gradient-to-b from-blue-600/15 to-purple-600/10 border border-blue-500/30 rounded-3xl p-8 flex flex-col gap-5 shadow-[0_0_60px_rgba(37,99,235,0.15)]">
              <div className="absolute -top-px inset-x-8 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-bold text-white">Pro</h3>
                  <span className="px-2.5 py-0.5 text-[11px] font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                    Most Popular
                  </span>
                </div>
                <p className="text-sm text-slate-500">For growing teams that move fast.</p>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-white">$12</span>
                <span className="text-slate-500 mb-1.5">/user/month</span>
              </div>
              <ul className="space-y-3 flex-1 text-sm">
                {[
                  "Unlimited members",
                  "Timeline & Gantt views",
                  "Custom automations",
                  "Advanced analytics",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300">
                    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=pro"
                className="mt-2 w-full py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all text-center text-sm shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)]"
              >
                Start Pro trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-8 flex flex-col gap-5">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Enterprise</h3>
                <p className="text-sm text-slate-500">For large orgs with custom needs.</p>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-3 flex-1 text-sm">
                {[
                  "Everything in Pro",
                  "SSO & SAML",
                  "SLA guarantee",
                  "Dedicated support",
                  "Custom integrations",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-400">
                    <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="mt-2 w-full py-3 rounded-2xl bg-white/8 border border-white/10 text-white font-medium hover:bg-white/15 transition-colors text-center text-sm">
                Talk to sales
              </button>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="w-full  px-4 sm:px-6 lg:px-8 py-20 pb-32">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/30 via-purple-900/30 to-slate-900/50 border border-white/10 p-12 md:p-20 text-center flex flex-col items-center">
            {/* Grid texture */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full bg-blue-600/15 blur-[80px] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5 text-white">
                Start shipping better work<br className="hidden md:block" /> today.
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10">
                Join 12,000+ teams who cut their planning overhead in half with Projectify.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-slate-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_55px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95"
                >
                  Get started for free
                </Link>
                <Link href="/login" className="px-8 py-4 rounded-full border border-white/15 text-white font-medium hover:border-white/30 hover:bg-white/5 transition-all">
                  Sign in
                </Link>
              </div>
              <p className="mt-6 text-sm text-slate-600">No credit card required · Cancel anytime</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 bg-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8 py-14">
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg text-sm">
                  P
                </div>
                <span className="font-semibold text-white">Projectify</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
                The modern project management platform for teams who care about craft and speed.
              </p>
            </div>

            {/* Links */}
            {[
              { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
              { heading: "Company", links: ["About", "Blog", "Careers", "Press"] },
              { heading: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
            ].map((col) => (
              <div key={col.heading}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">{col.heading}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-slate-500 hover:text-white transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">© 2025 Projectify Inc. All rights reserved.</p>
            <div className="flex items-center gap-5 text-slate-600">
              {/* Twitter */}
              <Link href="#" className="hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              {/* GitHub */}
              <Link href="#" className="hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
