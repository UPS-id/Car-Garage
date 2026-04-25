import React from 'react';
import { Newspaper, Calendar, ArrowRight, Bookmark } from 'lucide-react';

export default function NewsPage() {
  const articles = [
    {
      title: "TOKYO AUTO SALON 2026: THE FUTURE OF INTERNAL COMBUSTION",
      excerpt: "Inside the most anticipated reveals from HKS, Cusco, and Liberty Walk as they push the limits of traditional Japanese engineering.",
      category: "EVENTS",
      date: "OCT 24",
      image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b"
    },
    {
      title: "SR20DET REBORN: NISSAN ANNOUNCES NEW REPRODUCTION BLOCK PROGRAM",
      excerpt: "Following the success of the RB26 project, Nissan Heritage confirms the return of the legendary S-Chassis powerplant.",
      category: "TECHNICAL",
      date: "OCT 22",
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d"
    },
    {
      title: "WANGAN MIDNIGHT: THE LEGEND OF THE BLACKBIRD LIVES ON",
      excerpt: "An exclusive look at the record-shattering Porsche 911 that continues to haunt the Bayshore route decades later.",
      category: "CULTURE",
      date: "OCT 18",
      image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d"
    }
  ];

  return (
    <div className="py-12 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="text-cyan-400 font-black uppercase tracking-[0.5em] text-[10px]">Information / Log</div>
          <h1 className="text-8xl font-black italic uppercase tracking-tighter leading-[0.8]">PRESS FEED</h1>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-[10px] font-black uppercase text-white/30 tracking-widest">Database Sync</div>
            <div className="text-xs font-bold text-white uppercase tracking-widest">Active / 2026.10.25</div>
          </div>
        </div>
      </header>

      <div className="space-y-12">
        {articles.map((article, i) => (
          <div key={i} className="group grid grid-cols-12 gap-8 items-center cursor-pointer">
            <div className="col-span-12 lg:col-span-1 flex flex-col items-center">
               <div className="text-[10px] font-black uppercase text-cyan-400 rotate-[-90deg] origin-center whitespace-nowrap mb-4">{article.category}</div>
               <div className="h-20 w-[1px] bg-white/10"></div>
            </div>
            
            <div className="col-span-12 md:col-span-5 lg:col-span-4 relative h-64 md:h-80 rounded-[3rem] overflow-hidden border border-white/10">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
            </div>

            <div className="col-span-12 md:col-span-6 lg:col-span-6 space-y-6">
              <div className="flex items-center gap-4 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                <Calendar size={12} />
                {article.date}
                <span className="w-8 h-[1px] bg-white/10"></span>
                5 MIN READ
              </div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none group-hover:text-cyan-400 transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-xl">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-cyan-400 transition-colors">
                  Full Dossier <ArrowRight size={14} />
                </button>
                <button className="text-white/20 hover:text-white transition-colors">
                  <Bookmark size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
