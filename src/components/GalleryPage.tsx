import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Camera, Heart, Share2, ZoomIn, Eye, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface Build {
  id: string;
  make: string;
  model: string;
  year: number;
  imageUrl: string;
  specs: string;
  userId: string;
  author?: string;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Build | null>(null);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'builds'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Build));
      setPhotos(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'builds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  return (
    <div className="py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <div className="text-cyan-400 font-black uppercase tracking-[0.6em] text-[10px]">Media / Capture</div>
        <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">THE SHOWCASE</h1>
        <p className="text-white/40 text-xs uppercase tracking-widest font-bold max-w-lg mx-auto">Visual archive of high-performance builds and aesthetic captures from the community.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="aspect-[4/5] bg-white/5 animate-pulse rounded-[2rem]"></div>
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[3rem] bg-white/5 p-12 text-center group">
          <ImageIcon size={48} className="text-white/10 mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">No Visuals Captured</h3>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest max-w-xs mx-auto">The stream is currently offline. Log into your garage to transmit your first build capture.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {photos.map((photo) => (
            <div 
              key={photo.id} 
              onClick={() => setSelectedPhoto(photo)}
              className="group relative bg-jdm-dark rounded-[2rem] overflow-hidden border border-white/10 hover:border-cyan-400/50 transition-all transition-transform hover:-translate-y-2 cursor-pointer"
            >
              <div className="aspect-[4/5] relative">
                <img 
                  src={photo.imageUrl || 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b'} 
                  alt={`${photo.year} ${photo.make} ${photo.model}`} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button className="p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 hover:text-red-500 transition-colors">
                    <Heart size={16} />
                  </button>
                  <button className="p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 hover:text-cyan-400 transition-colors">
                    <Share2 size={16} />
                  </button>
                  <button className="p-3 bg-black/60 backdrop-blur-md rounded-full border border-white/10 hover:text-cyan-400 transition-colors">
                    <ZoomIn size={16} />
                  </button>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="text-[10px] font-black uppercase text-cyan-400 tracking-widest mb-1 opacity-60">Visual Transmission</div>
                  <h3 className="text-xl font-bold italic tracking-tighter mb-4">{photo.year} {photo.make} {photo.model}</h3>
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 border border-white/20"></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/50">@DriveDNA</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-black text-white/30 uppercase">
                      <Eye size={10} /> {Math.floor(Math.random() * 500) + 10}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>
          
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-jdm-dark p-8 rounded-[3rem] border border-white/10">
            <div className="md:col-span-8 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src={selectedPhoto.imageUrl} 
                className="w-full h-auto" 
                alt="Selected build" 
              />
            </div>
            <div className="md:col-span-4 space-y-8">
              <div>
                <div className="text-cyan-400 font-black uppercase tracking-[0.3em] text-[10px] mb-2">{selectedPhoto.year} {selectedPhoto.make}</div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">{selectedPhoto.model}</h2>
                <p className="text-white/60 text-sm leading-relaxed">{selectedPhoto.specs}</p>
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-colors rounded-xl">讚 Like</button>
                <button className="px-6 py-4 border border-white/10 text-white hover:border-white transition-colors rounded-xl font-black">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
