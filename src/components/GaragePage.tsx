import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../App';
import { Plus, Car, Star, Trash2, Edit3, Trash, Camera, Loader2, Sparkles, X } from 'lucide-react';
import { identifyCarFromImage, IdentifiedCar } from '../services/geminiService';

interface Build {
  id: string;
  make: string;
  model: string;
  year: number;
  hp?: number;
  specs?: string;
  imageUrl: string;
  isDreamCar: boolean;
}

export default function GaragePage() {
  const { user } = useAuth();
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBuild, setEditingBuild] = useState<Build | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [newCar, setNewCar] = useState({
    make: '',
    model: '',
    year: 2024,
    hp: 0,
    specs: '',
    imageUrl: '',
    isDreamCar: false
  });

  const fetchBuilds = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'builds'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Build));
      setBuilds(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'builds');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuild = async (buildId: string) => {
    if (!window.confirm("Are you sure you want to remove this unit from the hangar?")) return;
    
    try {
      await deleteDoc(doc(db, 'builds', buildId));
      fetchBuilds();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `builds/${buildId}`);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, [user]);

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      if (editingBuild) {
        await updateDoc(doc(db, 'builds', editingBuild.id), {
          ...newCar,
        });
        setEditingBuild(null);
      } else {
        await addDoc(collection(db, 'builds'), {
          ...newCar,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
      }
      setShowAddForm(false);
      setNewCar({ make: '', model: '', year: 2024, hp: 0, specs: '', imageUrl: '', isDreamCar: false });
      fetchBuilds();
    } catch (error) {
      handleFirestoreError(error, editingBuild ? OperationType.UPDATE : OperationType.CREATE, editingBuild ? `builds/${editingBuild.id}` : 'builds');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (build: Build) => {
    setEditingBuild(build);
    setNewCar({
      make: build.make,
      model: build.model,
      year: build.year,
      hp: build.hp || 0,
      specs: build.specs || '',
      imageUrl: build.imageUrl,
      isDreamCar: build.isDreamCar,
    });
    setShowAddForm(true);
  };

  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 70% quality jpeg to ensure small size
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsIdentifying(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const originalBase64 = reader.result as string;
        
        // Compress the image before anything else to save memory and database space
        const compressedBase64 = await compressImage(originalBase64);
        const base64DataOnly = compressedBase64.split(',')[1];
        
        const result = await identifyCarFromImage(base64DataOnly, 'image/jpeg');
        
        setNewCar(prev => ({
          ...prev,
          make: result.make,
          model: result.model,
          year: result.year,
          hp: result.hp,
          specs: result.specs,
          imageUrl: compressedBase64
        }));
        setShowAddForm(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Identification failed:", error);
      alert("Could not identify the car. Please try again with a clearer image.");
    } finally {
      setIsIdentifying(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-center">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Garage Locked</h2>
        <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-8">Authorization Required to Access Terminal</p>
        <button className="px-8 py-3 bg-cyan-400 text-black font-black uppercase text-[10px] tracking-widest rounded transition-transform hover:scale-105">
          Authenticate Driver
        </button>
      </div>
    );
  }

  const ownedBuilds = builds.filter(b => !b.isDreamCar);
  const dreamCars = builds.filter(b => b.isDreamCar);

  return (
    <div className="py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-none mb-2 underline decoration-cyan-400/30 decoration-8 underline-offset-8">THE HANGAR</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-bold">Base of Operations / {user.displayName?.toUpperCase()}</p>
        </div>
        <div className="flex gap-4">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            disabled={isIdentifying}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-3 px-8 py-4 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400 hover:text-black transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isIdentifying ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} className="group-hover:scale-125 transition-transform" />
            )}
            AI ID Scan
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase text-[11px] tracking-widest hover:bg-cyan-400 transition-all group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform" />
            Acquire New Unit
          </button>
        </div>
      </header>

      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="bg-jdm-dark border border-white/10 p-8 rounded-3xl w-full max-w-xl shadow-2xl relative">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-cyan-400">
                {editingBuild ? 'Modify Unit Data' : 'Log New Build Data'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingBuild(null);
                  setNewCar({ make: '', model: '', year: 2024, hp: 0, specs: '', imageUrl: '', isDreamCar: false });
                }} 
                className="text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddCar} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Manufacturer</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Nissan"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-400 outline-none"
                    value={newCar.make}
                    onChange={e => setNewCar({...newCar, make: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Model Variant</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. Skyline R32"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-400 outline-none"
                    value={newCar.model}
                    onChange={e => setNewCar({...newCar, model: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Model Year</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-400 outline-none"
                    value={newCar.year}
                    onChange={e => setNewCar({...newCar, year: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Est. Horsepower</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-400 outline-none"
                    value={newCar.hp}
                    onChange={e => setNewCar({...newCar, hp: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-white/40 tracking-widest">Image URL</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-400 outline-none"
                  value={newCar.imageUrl}
                  onChange={e => setNewCar({...newCar, imageUrl: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl">
                <input 
                  type="checkbox" 
                  id="dream"
                  className="w-4 h-4 accent-cyan-400"
                  checked={newCar.isDreamCar}
                  onChange={e => setNewCar({...newCar, isDreamCar: e.target.checked})}
                />
                <label htmlFor="dream" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Mark as Dream Car (Wishlist)</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 bg-cyan-400 text-black font-black uppercase text-xs tracking-widest rounded-xl hover:bg-cyan-300 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin mx-auto" />
                  ) : (
                    editingBuild ? 'Update Unit Data' : 'Confirm Unit Data'
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-8 py-4 bg-white/5 text-white/40 font-black uppercase text-xs tracking-widest rounded-xl hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Garage Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-[2px] flex-1 bg-white/10"></div>
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/60">Active Builds ({ownedBuilds.length})</h2>
          <div className="h-[2px] flex-1 bg-white/10"></div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-3xl">
            <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
          </div>
        ) : ownedBuilds.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/5 p-8 text-center">
            <Car size={32} className="text-white/10 mb-4" />
            <p className="text-xs text-white/40 uppercase font-black tracking-widest">Hangar Empty / Awaiting Deployment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {ownedBuilds.map((build) => (
              <div key={build.id} className="group bg-jdm-dark rounded-3xl border border-white/10 overflow-hidden hover:border-cyan-400/50 transition-all shadow-xl hover:shadow-cyan-400/5">
                <div className="relative h-48 bg-black">
                  {build.imageUrl ? (
                    <img src={build.imageUrl} alt={build.model} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                       <Car size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => startEdit(build)}
                      className="p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white/40 hover:text-cyan-400 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteBuild(build.id)}
                      className="p-2 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white/40 hover:text-red-500 transition-colors"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-1">{build.make}</div>
                      <h3 className="text-xl font-bold italic tracking-tighter truncate w-40">{build.year} {build.model}</h3>
                    </div>
                    {build.hp && (
                      <div className="bg-white/5 border border-white/10 px-3 py-1 rounded text-right">
                        <div className="text-[8px] font-black uppercase text-white/40">Power</div>
                        <div className="text-xs font-mono font-bold">{build.hp} HP</div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-black transition-all">View Specs</button>
                    <button className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-cyan-400/10 hover:border-cyan-400/50 transition-all">
                      <Star size={14} className="text-white/20" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dream Garage Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-[2px] flex-1 bg-white/10"></div>
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/60">DREAM GARAGE ({dreamCars.length})</h2>
          <div className="h-[2px] flex-1 bg-white/10"></div>
        </div>

        {dreamCars.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-cyan-400/5 p-8 text-center group cursor-pointer" onClick={() => {setShowAddForm(true); setNewCar({...newCar, isDreamCar: true})}}>
            <Star size={24} className="text-cyan-400/20 mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">No Dream Targets Locked / Log Future Build Objectives</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {dreamCars.map((car) => (
              <div key={car.id} className="relative group bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-cyan-400/30 transition-all aspect-square flex flex-col justify-end overflow-hidden">
                <img 
                  src={car.imageUrl || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b'} 
                  className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" 
                  alt={car.model} 
                />
                <div className="relative z-10">
                  <div className="text-[8px] font-black uppercase text-cyan-400 mb-1">{car.make}</div>
                  <div className="text-sm font-bold truncate tracking-tight">{car.model}</div>
                  <div className="text-[9px] text-white/40 font-mono mt-1 italic tracking-widest">{car.year} DESTINATION</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
