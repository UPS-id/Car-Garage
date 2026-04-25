import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../App';
import { MessageSquare, Plus, ArrowUpRight, Hash, Users, MessageCircle, X, Loader2 } from 'lucide-react';

interface Thread {
  id: string;
  userId: string;
  author: string;
  title: string;
  content: string;
  category: string;
  replyCount: number;
  createdAt: any;
}

export default function ForumPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'Technical'
  });

  const fetchThreads = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Thread));
      setThreads(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'threads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  const handleAddThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'threads'), {
        ...newThread,
        userId: user.uid,
        author: user.displayName || 'Anonymous Driver',
        replyCount: 0,
        createdAt: serverTimestamp()
      });
      setShowAddForm(false);
      setNewThread({ title: '', content: '', category: 'Technical' });
      fetchThreads();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'threads');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { name: 'Technical', icon: <Hash size={12} />, desc: 'Engine tuning, aero, suspension dynamics' },
    { name: 'Events', icon: <Users size={12} />, desc: 'PA meets, track days, show rollouts' },
    { name: 'Showcase', icon: <MessageCircle size={12} />, desc: 'Build logs and project reveals' },
  ];

  return (
    <div className="py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <div className="text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Community / Radio</div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">THE COMM-LINK</h1>
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold max-w-lg">Technical data exchange and cultural transmissions from across the JDM spectrum.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-10 py-4 bg-cyan-400 text-black font-black uppercase text-[11px] tracking-widest hover:bg-white transition-colors flex items-center gap-3 rounded-xl"
        >
          <Plus size={16} /> New Transmission
        </button>
      </header>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="bg-jdm-dark border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-cyan-400">Initiate Transmission</h2>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddThread} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Discussion Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Best turbo setup for daily SR20DET?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-400 outline-none"
                  value={newThread.title}
                  onChange={e => setNewThread({...newThread, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Category</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-400 outline-none appearance-none"
                  value={newThread.category}
                  onChange={e => setNewThread({...newThread, category: e.target.value})}
                >
                  {categories.map(c => <option key={c.name} value={c.name} className="bg-jdm-dark">{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Transmission Payload (Content)</label>
                <textarea 
                  required
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-400 outline-none resize-none"
                  placeholder="Speak your mind, share knowledge, or ask for help."
                  value={newThread.content}
                  onChange={e => setNewThread({...newThread, content: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-cyan-400 text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Broadcast Thread
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        {/* Categories Sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <h2 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-6">Channels</h2>
          {categories.map((cat, i) => (
            <div key={i} className="group bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-cyan-400/50 hover:bg-cyan-400/[0.02] cursor-pointer transition-all">
              <div className="flex items-center gap-3 text-cyan-400 mb-2">
                {cat.icon}
                <span className="text-xs font-black uppercase tracking-widest">{cat.name}</span>
              </div>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </aside>

        {/* Threads Area */}
        <main className="col-span-12 lg:col-span-8 space-y-6">
          <h2 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em] mb-6">Recent Transmissions</h2>
          
          {loading ? (
             <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-32 bg-white/5 animate-pulse rounded-3xl" />)}
             </div>
          ) : threads.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/5 p-12 text-center">
              <MessageSquare size={32} className="text-white/10 mb-4" />
              <p className="text-xs text-white/40 uppercase font-black tracking-widest">Static Observed / No Transmissions Logged</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className="mt-6 px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-colors"
                >
                  Start Transmission
                </button>
            </div>
          ) : (
            <div className="space-y-4">
              {threads.map((thread) => (
                <div key={thread.id} className="group bg-white/5 border border-white/10 p-6 rounded-3xl hover:border-white/30 transition-all flex items-center gap-6 cursor-pointer">
                  <div className="h-10 w-1 rounded-full bg-cyan-400/20 group-hover:bg-cyan-400 transition-colors"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-black uppercase text-cyan-400/60 tracking-wider mb-1">{thread.category}</div>
                    <h3 className="text-lg font-bold tracking-tight group-hover:text-cyan-400 transition-colors truncate">{thread.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">{thread.replyCount} Replies</span>
                      <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest text-white/60">By: {thread.author}</span>
                    </div>
                  </div>
                  <ArrowUpRight size={20} className="text-white/10 group-hover:text-cyan-400" />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
