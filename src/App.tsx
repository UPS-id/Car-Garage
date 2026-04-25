import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  ShoppingCart, 
  MessageSquare, 
  Image as ImageIcon, 
  Newspaper, 
  User as UserIcon,
  LogOut,
  Plus,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';

import GaragePage from './components/GaragePage';
import MarketPage from './components/MarketPage';
import ForumPage from './components/ForumPage';
import GalleryPage from './components/GalleryPage';
import NewsPage from './components/NewsPage';

// --- Contexts ---
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// --- Components ---

const Navbar = () => {
  const { user, login } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Garage', path: '/garage', icon: <Car size={14} /> },
    { name: 'Market', path: '/market', icon: <ShoppingCart size={14} /> },
    { name: 'Forum', path: '/forum', icon: <MessageSquare size={14} /> },
    { name: 'Gallery', path: '/gallery', icon: <ImageIcon size={14} /> },
    { name: 'News', path: '/news', icon: <Newspaper size={14} /> },
  ];

  return (
    <nav className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-12">
        <Link to="/" className="text-2xl font-black tracking-tighter text-white">
          JDM<span className="text-cyan-400">DNA</span>
        </Link>
        <div className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 hover:text-white transition-colors ${
                location.pathname === item.path ? 'text-cyan-400' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <div className="hidden sm:block text-right mr-2">
              <div className="text-[9px] uppercase tracking-tighter text-white/40">Active Driver</div>
              <div className="text-xs font-bold tracking-tight">{user.displayName}</div>
            </div>
            <Link to="/profile">
              <img 
                src={user.photoURL || ''} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border border-white/20 hover:border-cyan-400 transition-colors"
              />
            </Link>
          </>
        ) : (
          <button 
            onClick={login}
            className="px-4 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded transition-transform hover:scale-105 active:scale-95"
          >
            Join the Club
          </button>
        )}
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="footer h-10 flex items-center justify-between px-8 text-[8px] uppercase tracking-[0.3em] text-white/20 font-bold border-t border-white/5 bg-black/40 mt-auto">
    <div>Est. 2026 / Built for the Culture</div>
    <div className="flex gap-6">
      <a href="#" className="hover:text-white/40">Discord</a>
      <a href="#" className="hover:text-white/40">Instagram</a>
      <a href="#" className="hover:text-white/40">X / Twitter</a>
    </div>
    <div className="flex items-center gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
      System Optimal
    </div>
  </footer>
);

// --- Pages ---

const Home = () => {
  const [latestListing, setLatestListing] = useState<any>(null);

  useEffect(() => {
    const fetchLatestListing = async () => {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setLatestListing({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) {
        console.error("Error fetching latest listing:", error);
      }
    };
    fetchLatestListing();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-8 py-8 animate-in fade-in duration-700">
      {/* Left Column: My Garage Summary */}
      <aside className="col-span-12 lg:col-span-3 space-y-8">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-6 flex justify-between items-center">
            Virtual Garage
            <Car size={12} />
          </h3>
          <div className="space-y-4">
            <div className="group relative cursor-pointer">
              <div className="h-28 w-full bg-jdm-dark rounded-xl overflow-hidden border border-white/10 group-hover:border-cyan-400/50 transition-all">
                <img 
                  src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d" 
                  alt="RX-7"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-4">
                  <div className="text-xs font-bold italic">98 Mazda RX-7 FD3S</div>
                  <div className="text-[9px] text-white/50 uppercase tracking-widest mt-0.5">Stage 2 Turbo • 420 WHP</div>
                </div>
              </div>
            </div>
          </div>
          <Link to="/garage" className="w-full mt-6 py-4 bg-white/5 border border-dashed border-white/20 rounded-xl text-[9px] uppercase font-bold tracking-[0.2em] hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-2">
            <Plus size={10} /> Add Build
          </Link>
        </section>

        <section className="bg-cyan-400/5 border border-cyan-400/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              Market Alert
            </div>
            <div className="text-xl font-bold leading-tight italic tracking-tighter">
              {latestListing ? `${latestListing.title} Listed` : 'New Units Incoming'}
            </div>
            <div className="text-[10px] text-white/60 mt-2 uppercase tracking-widest">
              {latestListing ? `${latestListing.location}` : 'Osaka / Chiba / Tokyo'}
            </div>
            <Link to="/market" className="mt-6 inline-block text-[10px] font-black uppercase py-2 px-6 bg-cyan-400 text-black rounded hover:bg-cyan-300 transition-colors">
              {latestListing ? 'View Unit' : 'Browse Exchange'}
            </Link>
          </div>
          <div className="absolute -right-8 -bottom-8 text-cyan-400/5 group-hover:text-cyan-400/10 transition-colors">
            <TrendingUp size={160} />
          </div>
        </section>
      </aside>

      {/* Main Content: Featured Stories & News */}
      <main className="col-span-12 lg:col-span-6 space-y-8">
        <section className="relative h-[480px] bg-jdm-dark rounded-[2.5rem] border border-white/10 overflow-hidden group border-cyan-400/10">
          <img 
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            alt="Midnight Run"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          <div className="absolute top-8 right-8 bg-red-600 px-4 py-1.5 rounded text-[10px] font-black uppercase italic tracking-widest shadow-2xl">
            Featured Restoration
          </div>
          <div className="absolute bottom-10 left-10 right-10">
            <div className="flex gap-2 mb-4">
              <span className="px-2.5 py-1 rounded bg-cyan-400/20 border border-cyan-400/30 text-cyan-400 text-[9px] font-black uppercase tracking-widest">Wangan Culture</span>
              <span className="px-2.5 py-1 rounded bg-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest">History</span>
            </div>
            <h1 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.85] mb-6">
              THE MIDNIGHT<br/>RESTORATION
            </h1>
            <p className="text-white/70 text-sm max-w-sm mb-8 leading-relaxed">
              Inside Hiroshi-san's R32 build, meticulously restored for high-speed runs on the Bayshore Route.
            </p>
            <div className="flex gap-4">
              <Link to="/news" className="px-10 py-4 bg-white text-black font-black uppercase text-[11px] tracking-[0.2em] hover:bg-cyan-400 transition-colors">
                Read Specs
              </Link>
              <Link to="/gallery" className="px-10 py-4 border border-white/20 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-white/5 transition-colors">
                View Gallery
              </Link>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Latest News</h4>
              <Link to="/news" className="text-cyan-400 text-[9px] font-black uppercase tracking-widest hover:underline">Stream</Link>
            </div>
            <div className="space-y-4">
              {[
                "Daikoku PA Meet: Sunday Morning Special",
                "TE37 Sagas: New Bronze Finish Review",
                "HKS Hi-Power Spec-L II Unboxed"
              ].map((news, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                  <div className="w-1 h-8 rounded bg-cyan-400/20 group-hover:bg-cyan-400 transition-colors"></div>
                  <div>
                    <div className="text-xs font-bold leading-tight group-hover:text-cyan-400 transition-colors">{news}</div>
                    <div className="text-[9px] text-white/40 uppercase mt-1 tracking-widest">2 Hours ago</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40">Forum Pulse</h4>
              <Link to="/forum" className="text-cyan-400 text-[9px] font-black uppercase tracking-widest hover:underline">Join Discussion</Link>
            </div>
            <div className="space-y-4">
              {[
                { rank: '01', title: 'SR20DET vs EJ20 Swap Discussion', replies: 84 },
                { rank: '02', title: 'Best Coilover Setup for Street/Track', replies: 126 },
                { rank: '03', title: 'Importing from Japan in 2026', replies: 42 }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="font-mono text-[10px] text-cyan-400/40 group-hover:text-cyan-400 transition-colors font-bold">{item.rank}</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold truncate group-hover:text-cyan-400 transition-colors">{item.title}</div>
                    <div className="text-[9px] text-white/40 font-mono mt-0.5">{item.replies} Replies</div>
                  </div>
                  <ArrowUpRight size={12} className="text-white/20 group-hover:text-cyan-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Right Column: Marketplace */}
      <aside className="col-span-12 lg:col-span-3 space-y-8">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-black mb-6">Marketplace</h3>
          <div className="space-y-6 flex-1">
            {[
              { name: "Volk Rays CE28N Bronze", price: "2,800", loc: "Osaka, JP", img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=100" },
              { name: "HKS Hi-Power S15 Exhaust", price: "850", loc: "California, US", img: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&q=80&w=100" },
              { name: "Recaro SR3 Confetti Pair", price: "1,200", loc: "London, UK", img: "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&q=80&w=100" }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-center group cursor-pointer">
                <div className="w-16 h-16 bg-jdm-dark rounded-xl flex-shrink-0 border border-white/5 overflow-hidden">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold text-white group-hover:text-cyan-400 truncate tracking-tight">{item.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono font-black mt-1">${item.price}</div>
                  <div className="flex items-center gap-1 text-[8px] text-white/40 mt-0.5 uppercase font-bold">
                    <MapPin size={8} /> {item.loc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-xl p-5 text-black shadow-lg shadow-cyan-500/10">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Pro Membership</div>
            <div className="text-lg font-black italic leading-none tracking-tighter">UNLIMITED STORAGE</div>
            <p className="text-[9px] font-bold mt-2 opacity-80 leading-tight">Save 50+ builds and share hi-res dream garages with the community.</p>
            <button className="mt-5 w-full py-3 bg-black text-white text-[10px] font-black uppercase rounded-lg hover:bg-white hover:text-black transition-all">
              Go Pro
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
};

// --- Profile Page ---
const ProfilePage = () => {
  const { user, logout } = useAuth();
  
  if (!user) return <Placeholder name="Driver Profile" />;

  return (
    <div className="py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
           <button 
             onClick={logout}
             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 transition-colors"
           >
             <LogOut size={14} /> Terminate Session
           </button>
        </div>
        
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 p-1">
            <img 
              src={user.photoURL || ''} 
              className="w-full h-full rounded-full object-cover border-4 border-jdm-bg" 
              alt="Avatar" 
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-black border border-white/20 p-3 rounded-2xl shadow-xl">
             <UserIcon size={20} className="text-cyan-400" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="text-cyan-400 font-black uppercase tracking-[0.4em] text-[10px]">Verified Driver / ID {user.uid.slice(0, 8)}</div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{user.displayName}</h1>
          <p className="text-white/60 text-sm max-w-md mx-auto md:mx-0">High-performance enthusiast specializing in 90s era turbo builds. Active in the Osaka Kansai loop scene.</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
               <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Builds</div>
               <div className="text-xl font-bold font-mono">12</div>
            </div>
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
               <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Standing</div>
               <div className="text-xl font-bold font-mono">A+</div>
            </div>
            <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
               <div className="text-[8px] font-black uppercase text-white/30 tracking-widest mb-1">Rep</div>
               <div className="text-xl font-bold font-mono">4.2k</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">DRIVER'S BRIEF</h2>
           <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Bio Signature</label>
                <div className="text-sm border-l-2 border-cyan-400 pl-4 py-1 leading-relaxed">
                  "Life at 8000 RPM. Currently restoring a 1994 supra and searching for authentic TRD body parts. Interested in track days and wangan runs."
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Base of Ops</label>
                  <div className="text-sm font-bold flex items-center gap-2 italic">
                    <MapPin size={14} className="text-cyan-400" /> TOKYO, JAPAN
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-white/30 tracking-widest">Favorite Chassis</label>
                  <div className="text-sm font-bold italic tracking-tighter">MAZDA FD3S / NISSAN BNR34</div>
                </div>
              </div>
           </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
           <h2 className="text-2xl font-black italic uppercase tracking-tighter">VIRTUAL GARAGE</h2>
           <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6">
              <Car size={40} className="text-white/10" />
              <p className="text-xs text-white/40 font-bold uppercase tracking-widest">You have 12 active builds logged in the cloud.</p>
              <Link to="/garage" className="w-full py-4 border border-cyan-400/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 hover:text-black transition-all">
                Enter Hangar
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Layout ---

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col relative overflow-hidden bg-jdm-bg">
    {/* Background Effects */}
    <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
    <div className="fixed bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
    
    <div className="relative z-10 flex flex-col flex-1">
      <Navbar />
      <div className="flex-1 w-full max-w-7xl mx-auto px-8">
        {children}
      </div>
      <Footer />
    </div>
  </div>
);

const Placeholder = ({ name }: { name: string }) => (
  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-500">
    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-6">
      <Clock size={24} className="text-cyan-400 animate-pulse" />
    </div>
    <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">{name} Under Construction</h1>
    <p className="text-white/40 text-sm uppercase tracking-[0.3em] font-bold">Calibration in Progress / Stand By</p>
    <Link to="/" className="mt-10 px-8 py-3 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
      Return to Hangar
    </Link>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/garage" element={<GaragePage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
