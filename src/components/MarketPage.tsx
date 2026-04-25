import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../App';
import { ShoppingCart, Search, Filter, Plus, MapPin, Tag, X, Loader2 } from 'lucide-react';

interface Listing {
  id: string;
  userId: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  category: string;
  createdAt: any;
}

export default function MarketPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [newListing, setNewListing] = useState({
    title: '',
    price: 0,
    location: '',
    category: 'Wheels',
    imageUrl: '',
    description: ''
  });

  const categories = ['All', 'Cars', 'Wheels', 'Engine', 'Interior', 'Exterior'];
  const formCategories = ['Cars', 'Wheels', 'Engine', 'Interior', 'Exterior'];

  const fetchListings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
      setListings(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'listings'), {
        ...newListing,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      setShowAddForm(false);
      setNewListing({ title: '', price: 0, location: '', category: 'Wheels', imageUrl: '', description: '' });
      fetchListings();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'listings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredListings = filter === 'All' ? listings : listings.filter(l => l.category === filter);

  return (
    <div className="py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-cyan-400 tracking-[0.4em] mb-4">
            <span className="w-12 h-[1px] bg-cyan-400"></span>
            Classifieds
          </div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-6">THE EXCHANGE</h1>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filter === cat 
                    ? 'bg-cyan-400 border-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)]' 
                    : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full md:w-auto flex items-center gap-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="h-14 px-8 flex items-center justify-center bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400 transition-all rounded-2xl"
          >
            Post Listing
          </button>
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              type="text" 
              placeholder="Search components..."
              className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-sm focus:border-cyan-400/50 outline-none transition-all"
            />
          </div>
        </div>
      </header>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="bg-jdm-dark border border-white/10 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-cyan-400">Post New Listing</h2>
              <button onClick={() => setShowAddForm(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddListing} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Listing Title</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Rays Engineering TE37 OG Bronze"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-400 outline-none"
                  value={newListing.title}
                  onChange={e => setNewListing({...newListing, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Price (USD)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-400 outline-none"
                    value={newListing.price}
                    onChange={e => setNewListing({...newListing, price: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Location</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Osaka, JP"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-400 outline-none"
                    value={newListing.location}
                    onChange={e => setNewListing({...newListing, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Category</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-400 outline-none appearance-none"
                    value={newListing.category}
                    onChange={e => setNewListing({...newListing, category: e.target.value})}
                  >
                    {formCategories.map(c => <option key={c} value={c} className="bg-jdm-dark">{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Image URL</label>
                  <input 
                    type="url" 
                    placeholder="https://..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-400 outline-none"
                    value={newListing.imageUrl}
                    onChange={e => setNewListing({...newListing, imageUrl: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Item Description</label>
                <textarea 
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-400 outline-none resize-none"
                  placeholder="Details about condition, fitment, etc."
                  value={newListing.description}
                  onChange={e => setNewListing({...newListing, description: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-cyan-400 text-black font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-2 border-cyan-400 border-t-transparent rounded-full shadow-[0_0_20px_rgba(34,211,238,0.2)]"></div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[3rem] bg-white/5 p-12 text-center group">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <ShoppingCart size={32} className="text-white/10" />
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">No Parts Found</h3>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-10 max-w-xs mx-auto">The stock room is currently empty or your search criteria yielded no results.</p>
          <button onClick={() => setShowAddForm(true)} className="px-10 py-4 bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400 transition-colors">Post Listing</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
          {filteredListings.map((item) => (
            <div key={item.id} className="group flex flex-col bg-jdm-dark border border-white/10 rounded-3xl overflow-hidden hover:border-cyan-400/50 transition-all shadow-xl hover:shadow-cyan-400/5">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b'} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="flex flex-col gap-1">
                    <span className="px-2 py-0.5 bg-cyan-400 text-black text-[8px] font-black uppercase rounded w-fit tracking-widest">
                      {item.category}
                    </span>
                    <div className="text-2xl font-black italic tracking-tighter text-white">${item.price}</div>
                  </div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-sm font-bold tracking-tight mb-4 group-hover:text-cyan-400 transition-colors line-clamp-2 min-h-[40px]">
                  {item.title}
                </h3>
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] text-white/40 font-bold uppercase">
                    <MapPin size={10} />
                    {item.location}
                  </div>
                  <button className="text-[9px] font-black uppercase text-cyan-400 hover:underline tracking-widest">Inquire</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Featured Listing Banner */}
      <section className="bg-gradient-to-r from-jdm-dark to-black border border-white/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative group">
        <div className="relative z-10 flex-1 space-y-6">
          <div className="text-cyan-400 font-mono text-xs uppercase tracking-[0.5em] font-black">Featured Dealer</div>
          <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-[0.9]">TOP SECRET<br/>PARTS NETWORK</h2>
          <p className="text-sm text-white/60 max-w-md leading-relaxed">Direct access to verified exporters in Osaka and Chiba. High-flow intercoolers, forged internals, and rare body kits.</p>
          <button className="px-10 py-4 bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400 transition-colors shadow-2xl">Browse Official Collection</button>
        </div>
        <div className="relative z-10 w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl skew-x-[-2deg] group-hover:skew-x-0 transition-transform">
          <img 
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800" 
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
            alt="Dealer Shop" 
          />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 select-none pointer-events-none">
          <ShoppingCart size={400} />
        </div>
      </section>
    </div>
  );
}
