import React from 'react';
import { Link } from 'react-router-dom';
import { Beaker, Activity, FileSpreadsheet, ShieldCheck, Cpu, FlaskConical } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-24 pb-20">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-24 text-center overflow-hidden">
        {/* Subtle Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 dark:opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500 rounded-full blur-3xl"></div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <ShieldCheck size={14} /> Exclusive for Dept. of Life Science, RKMRC
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-8 text-slate-900 dark:text-white tracking-tight leading-[1.1]">
          The Future of <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 to-cyan-500">
            In-Silico Bio-Analytics
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed px-4">
          A high-performance computational suite designed to automate laboratory quantitation. 
          Bridge the gap between <strong>Biological Data</strong> and <strong>Computer Science</strong> with precision modeling.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <Link 
            to="/lab-analyzer" 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            Launch Workspace <Cpu size={20} />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            Explore Modules
          </a>
        </div>
      </section>

      {/* --- CORE CAPABILITIES (FEATURES) --- */}
      <section id="features" className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black dark:text-white mb-4 uppercase tracking-tighter">Computational Modules</h2>
          <p className="text-slate-500 font-medium">Standardized algorithms for rigorous scientific analysis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Beaker className="text-indigo-500" />,
              title: "Molar Extinction",
              desc: "Determine ε with automated standard curve fitting and Beer-Lambert derivation."
            },
            {
              icon: <Activity className="text-emerald-500" />,
              title: "Enzyme Kinetics",
              desc: "Solve for Vmax and Km using Michaelis-Menten modeling and double-reciprocal plots."
            },
            {
              icon: <FileSpreadsheet className="text-cyan-500" />,
              title: "Data Archiving",
              desc: "Export results directly to professional PDF reports and Excel datasets for documentation."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 w-fit rounded-2xl group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-black mb-3 dark:text-white uppercase tracking-tight">{feature.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- INSTITUTIONAL SECTION --- */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-slate-900 dark:bg-indigo-950 rounded-[3rem] p-8 md:p-16 text-center text-white relative overflow-hidden">
            {/* Visual Flair */}
            <FlaskConical className="absolute -bottom-10 -left-10 text-indigo-500/20 rotate-12" size={240} />
            
            <div className="relative z-10">
                <h2 className="text-3xl font-black mb-6">Built for Excellence</h2>
                <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto font-medium">
                  This platform is exclusively developed and optimized for the students and research scholars of the 
                  <span className="text-white"> Department of Life Sciences, Ramakrishna Mission Residential College (Autonomous), Narendrapur.</span>
                </p>
                <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">RKMRC</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Narendrapur</span>
                    </div>
                    <div className="w-px h-10 bg-indigo-400/30 hidden sm:block"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black">LifeSci</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Analytics</span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="text-center py-10">
        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Ready to automate your wet-lab data?</p>
        <Link to="/register" className="text-indigo-600 dark:text-cyan-400 font-black hover:underline underline-offset-8">
            CREATE RESEARCHER ACCOUNT →
        </Link>
      </section>

    </div>
  );
}