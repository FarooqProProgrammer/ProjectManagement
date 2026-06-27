import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white font-sans overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px]" />
      </div>

      <Header />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center justify-center max-w-4xl mx-auto space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 backdrop-blur-sm mb-4">
            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
            Projectify 2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Manage work beautifully.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            The modern project management platform that brings your team's tasks, timelines, and collaboration into one seamless, elegant workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:-translate-y-1">
              Start for free
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch demo
            </button>
          </div>
        </section>

        {/* Dashboard Preview mockup */}
        <section className="mt-24 w-full max-w-5xl mx-auto">
          <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden group">
             {/* Mockup Header */}
             <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
             </div>
             {/* Mockup Body */}
             <div className="p-8 grid gap-6 grid-cols-1 md:grid-cols-3 opacity-80 group-hover:opacity-100 transition-opacity duration-700">
                
                {/* Column 1 */}
                <div className="flex flex-col gap-4">
                  <div className="h-6 w-24 bg-white/10 rounded-md"></div>
                  <div className="h-24 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 transform transition-transform hover:-translate-y-1 cursor-pointer">
                    <div className="h-4 w-3/4 bg-white/20 rounded"></div>
                    <div className="h-3 w-1/2 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-24 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 transform transition-transform hover:-translate-y-1 cursor-pointer">
                    <div className="h-4 w-full bg-white/20 rounded"></div>
                    <div className="h-3 w-2/3 bg-white/10 rounded"></div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-4">
                  <div className="h-6 w-32 bg-white/10 rounded-md"></div>
                  <div className="h-32 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 transform transition-transform hover:-translate-y-1 cursor-pointer">
                    <div className="h-4 w-5/6 bg-white/20 rounded"></div>
                    <div className="h-3 w-3/4 bg-white/10 rounded"></div>
                    <div className="mt-auto h-6 w-16 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center justify-center">In Progress</div>
                  </div>
                </div>

                 {/* Column 3 */}
                 <div className="flex flex-col gap-4">
                  <div className="h-6 w-20 bg-white/10 rounded-md"></div>
                  <div className="h-24 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 transform transition-transform hover:-translate-y-1 cursor-pointer">
                    <div className="h-4 w-full bg-white/20 rounded"></div>
                    <div className="h-3 w-1/3 bg-white/10 rounded"></div>
                  </div>
                </div>
             </div>
             
             {/* Gradient overlay for effect */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="mt-40 w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to ship faster</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Powerful features designed for modern product teams without the clutter.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time sync",
                desc: "Updates push instantly across all devices. No refreshing required.",
                icon: (
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Beautiful Views",
                desc: "Switch between Board, List, and Timeline views with a single click.",
                icon: (
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                )
              },
              {
                title: "Keyboard First",
                desc: "Navigate the entire application without taking your hands off the keyboard.",
                icon: (
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                )
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors cursor-default group">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mt-40 w-full max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Loved by product teams</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Don't just take our word for it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Jenkins", role: "Product Manager @ TechCorp", content: "Projectify has completely transformed how our team ships features. The interface is stunning and blazing fast." },
              { name: "Michael Chen", role: "Engineering Lead @ StartupX", content: "Finally, a project management tool that doesn't feel like a chore to use. The keyboard shortcuts are a lifesaver." },
              { name: "Emily Rodriguez", role: "Designer @ CreativeStudio", content: "The visual design and attention to detail in Projectify are unmatched. It's a joy to look at every single day." }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col gap-6 hover:-translate-y-2 transition-transform duration-300">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-slate-300 italic leading-relaxed text-lg">"{testimonial.content}"</p>
                <div className="mt-auto">
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mt-40 w-full max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Start for free, upgrade when you need more power.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Starter</h3>
                <p className="text-slate-400">Perfect for small teams and individuals.</p>
              </div>
              <div className="text-4xl font-bold">$0<span className="text-lg text-slate-500 font-normal">/mo</span></div>
              <ul className="space-y-4 flex-1">
                {["Up to 5 team members", "Unlimited tasks & projects", "Basic list and board views", "Community support"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="w-full py-3 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors text-center mt-4">
                Get Started
              </Link>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-bold">Pro</h3>
                  <span className="px-3 py-1 text-xs font-medium bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">Most Popular</span>
                </div>
                <p className="text-slate-400">For growing teams that need advanced workflows.</p>
              </div>
              <div className="text-4xl font-bold">$12<span className="text-lg text-slate-500 font-normal">/user/mo</span></div>
              <ul className="space-y-4 flex-1">
                {["Unlimited team members", "Advanced timeline & Gantt views", "Custom workflows & automations", "Priority 24/7 support", "Advanced analytics"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup?plan=pro" className="w-full py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition-all text-center mt-4 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-40 mb-20 w-full">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 p-12 md:p-20 text-center max-w-5xl mx-auto flex flex-col items-center">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 relative z-10">Ready to transform how your team works?</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 relative z-10">Join thousands of teams already using Projectify to ship better products, faster.</p>
            <Link href="/signup" className="relative z-10 px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105">
              Get Started for Free
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-8 mt-auto z-10 bg-black/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">P</div>
             <span className="font-semibold text-sm">Projectify Inc.</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
