'use client';

import { useState, useEffect, useCallback, useMemo, useRef, useTransition } from 'react';
import { 
  Device, 
  getStoredDevices, 
  saveDevices, 
  getHomeOwnerName, 
  saveHomeOwnerName,
  getHomeOwnerPassword,
  saveHomeOwnerPassword
} from '@/lib/devices-store';
import { DeviceCard } from '@/components/DeviceCard';
import { DeviceForm } from '@/components/DeviceForm';
import { GuideTab } from '@/components/GuideTab';
import { vibrate } from '@/lib/haptics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Lightbulb, 
  BookOpen, 
  LayoutGrid,
  Zap,
  PowerOff,
  Search,
  User,
  RefreshCw,
  ArrowRight,
  Lock,
  LogOut,
  Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeTab, setActiveTab] = useState<'control' | 'guide'>('control');
  const [isPending, startTransition] = useTransition();
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  
  const [onboardingMode, setOnboardingMode] = useState<'signup' | 'login'>('signup');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);
  const [homeOwner, setHomeOwner] = useState('');
  
  // Form states
  const [nameInput, setNameInput] = useState('');
  const [passInput, setPassInput] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const touchStartRef = useRef(0);

  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const { toast } = useToast();

  // Escuchar evento de instalación (Chrome/Android)
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar si ya está instalada (standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({ 
        title: "SOPORTE DE INSTALACIÓN", 
        description: "PARA iOS: TOCA 'COMPARTIR' Y LUEGO 'AÑADIR A PANTALLA DE INICIO'" 
      });
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Carga inicial de datos
  useEffect(() => {
    const owner = getHomeOwnerName();
    const stored = getStoredDevices();
    setDevices(stored);
    
    if (owner) {
      setHomeOwner(owner);
      setOnboardingMode('login');
    }
    
    setIsInitialized(true);
  }, []);

  // Guardado automático persistente
  useEffect(() => {
    if (!isInitialized) return;
    saveDevices(devices);
  }, [devices, isInitialized]);

  const handleAddDevice = useCallback((data: Omit<Device, 'id' | 'status'>) => {
    const newDevice: Device = {
      id: Math.random().toString(36).substring(2, 15),
      ...data,
      status: false,
    };
    
    setIsAddOpen(false);
    
    setTimeout(() => {
      startTransition(() => {
        setDevices(prev => [...prev, newDevice]);
        vibrate([20, 50, 20]);
        toast({ title: "ZONA VINCULADA", description: data.name.toUpperCase() });
      });
    }, 100);
  }, [toast]);

  const handleUpdateDevice = useCallback((id: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const handleDeleteDevice = useCallback((id: string) => {
    startTransition(() => {
      setDevices(prev => prev.filter(d => d.id !== id));
      vibrate(50);
      toast({ title: "ZONA ELIMINADA" });
    });
  }, [toast]);

  const handleStartEdit = useCallback((device: Device) => {
    setDeviceToEdit(device);
    setIsEditOpen(true);
    vibrate(10);
  }, []);

  const handleSaveEdit = useCallback((data: Omit<Device, 'id' | 'status'>) => {
    if (!deviceToEdit) return;
    const targetId = deviceToEdit.id;
    setIsEditOpen(false);
    setTimeout(() => {
      startTransition(() => {
        setDevices(prev => prev.map(d => d.id === targetId ? { ...d, ...data } : d));
        setDeviceToEdit(null);
        vibrate(20);
        toast({ title: "ACTUALIZADO" });
      });
    }, 150);
  }, [deviceToEdit, toast]);

  const handleSignUp = useCallback(() => {
    if (!nameInput.trim() || !passInput.trim()) return;
    saveHomeOwnerName(nameInput);
    saveHomeOwnerPassword(passInput);
    setHomeOwner(nameInput);
    setIsAuthenticated(true);
    vibrate([20, 100]);
    toast({ title: "PERFIL CREADO", description: `BIENVENIDO, ${nameInput.toUpperCase()}` });
  }, [nameInput, passInput, toast]);

  const handleLogin = useCallback(() => {
    const savedName = getHomeOwnerName();
    const savedPass = getHomeOwnerPassword();
    
    if (nameInput.trim().toUpperCase() === savedName.toUpperCase() && passInput === savedPass) {
      setIsAuthenticated(true);
      setHomeOwner(savedName);
      vibrate([20, 100]);
      toast({ title: "ACCESO CONCEDIDO", description: `HOLA DE NUEVO, ${savedName.toUpperCase()}` });
    } else {
      vibrate([50, 50, 50]);
      toast({ variant: "destructive", title: "ERROR DE ACCESO", description: "NOMBRE O CONTRASEÑA INCORRECTOS" });
    }
  }, [nameInput, passInput, toast]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setNameInput('');
    setPassInput('');
    setOnboardingMode('login');
    vibrate(50);
  };

  const turnOffAll = useCallback(() => {
    vibrate([50, 100, 50]);
    const activeDevices = devices.filter(d => d.status);
    if (activeDevices.length === 0) {
      toast({ title: "ESTADO ACTUAL", description: "TODAS LAS LUCES YA ESTÁN APAGADAS" });
      return;
    }
    setDevices(prev => prev.map(d => ({ ...d, status: false })));
    activeDevices.forEach(device => {
      fetch(`http://${device.ip}/toggle${device.channel}`, { method: 'POST', mode: 'no-cors' }).catch(() => {});
    });
  }, [devices, toast]);

  const filteredDevices = useMemo(() => {
    if (!searchTerm) return devices;
    const lowerSearch = searchTerm.toLowerCase();
    return devices.filter(d => d.name.toLowerCase().includes(lowerSearch) || d.ip.includes(searchTerm));
  }, [devices, searchTerm]);

  // Pull-to-Refresh
  const handleTouchStart = (e: React.TouchEvent) => { if (window.scrollY === 0) touchStartRef.current = e.touches[0].clientY; };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      const diff = e.touches[0].clientY - touchStartRef.current;
      if (diff > 0) setPullDistance(Math.min(diff * 0.4, 100));
    }
  };
  const handleTouchEnd = () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      vibrate(15);
      setTimeout(() => { setRefreshTrigger(prev => prev + 1); setIsRefreshing(false); setPullDistance(0); }, 800);
    } else { setPullDistance(0); }
  };

  if (!isInitialized) return <div className="fixed inset-0 bg-[#F4F4F9]" />;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] bg-primary flex items-center justify-center p-6 text-white overflow-hidden">
        <div className="w-full max-w-md space-y-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="bg-white/20 h-24 w-24 rounded-[2.5rem] flex items-center justify-center mx-auto backdrop-blur-xl shadow-2xl">
            <Lightbulb size={48} className="text-white fill-current" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-tight">
              {onboardingMode === 'signup' ? 'BIENVENIDO' : 'INICIAR SESIÓN'}
            </h1>
            <p className="text-white/70 font-black uppercase tracking-widest text-[10px]">
              {onboardingMode === 'signup' ? 'CREA TU PERFIL DE HOGAR' : `HOGAR DE ${homeOwner.toUpperCase()}`}
            </p>
          </div>

          <div className="bg-white/10 p-8 rounded-[3rem] backdrop-blur-2xl border border-white/10 space-y-6">
            <div className="space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-4">NOMBRE</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <Input 
                    value={nameInput} 
                    onChange={(e) => setNameInput(e.target.value)} 
                    placeholder="TU NOMBRE" 
                    className="h-14 rounded-2xl bg-white/10 border-none text-white font-black text-lg placeholder:text-white/30 pl-14 uppercase"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 ml-4">CONTRASEÑA</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  <Input 
                    type="password"
                    value={passInput} 
                    onChange={(e) => setPassInput(e.target.value)} 
                    placeholder="••••••••" 
                    className="h-14 rounded-2xl bg-white/10 border-none text-white font-black text-lg placeholder:text-white/30 pl-14"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={onboardingMode === 'signup' ? handleSignUp : handleLogin} 
              disabled={!nameInput.trim() || !passInput.trim()}
              className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-white/90 font-black uppercase text-sm tracking-widest shadow-2xl action-button"
            >
              {onboardingMode === 'signup' ? 'COMENZAR' : 'ENTRAR'} <ArrowRight size={20} className="ml-2" />
            </Button>

            <button 
              onClick={() => {
                vibrate(10);
                setOnboardingMode(prev => prev === 'signup' ? 'login' : 'signup');
                setNameInput('');
                setPassInput('');
              }}
              className="text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors"
            >
              {onboardingMode === 'signup' 
                ? '¿YA TIENES UNA SESIÓN? INICIA AQUÍ' 
                : '¿NO TIENES CUENTA? REGÍSTRATE AQUÍ'}
            </button>
          </div>
          
          {isInstallable && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-full bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] border border-white/20 animate-bounce"
            >
              <Download size={14} /> INSTALAR APLICACIÓN
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col min-h-screen bg-[#F4F4F9] text-slate-900 pb-32 overflow-x-hidden"
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      <div 
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-200"
        style={{ transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`, opacity: pullDistance > 10 || isRefreshing ? 1 : 0 }}
      >
        <div className="bg-white p-3 rounded-full shadow-2xl border border-slate-100">
          <RefreshCw className={cn("text-primary", isRefreshing && "animate-spin")} size={24} />
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full glass px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-primary h-14 w-14 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30">
              <Zap className="text-white fill-current" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none uppercase italic">LUZ CONTROL</h1>
              <div onClick={() => { setIsOwnerOpen(true); vibrate(10); }} className="flex items-center gap-2 mt-1 cursor-pointer">
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 flex items-center gap-1.5 hover:text-primary transition-colors">
                  <User size={12} className="text-primary" /> HOGAR DE {homeOwner.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isInstallable && (
              <Button onClick={handleInstallClick} variant="outline" className="hidden md:flex rounded-2xl h-14 border-primary/20 text-primary font-black uppercase text-[10px] px-4 action-button">
                <Download size={18} className="mr-2" /> INSTALAR
              </Button>
            )}
            <Button onClick={handleLogout} variant="ghost" className="rounded-2xl h-14 w-14 p-0 bg-white shadow-sm text-slate-400 hover:text-rose-500">
              <LogOut size={24} />
            </Button>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl h-14 w-14 p-0 bg-primary shadow-xl action-button">
                  <Plus size={30} strokeWidth={3} className="text-white" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md rounded-[3rem] bg-white p-10 border-none">
                <DialogHeader><DialogTitle className="text-2xl font-black text-center uppercase text-primary italic">NUEVA ZONA</DialogTitle></DialogHeader>
                <DeviceForm devices={devices} onSubmit={handleAddDevice} onCancel={() => setIsAddOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'control' ? (
            <div className="space-y-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">PANEL</h2>
                  <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <LayoutGrid size={16} className="text-primary" /> CONTROL LOCAL
                  </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <Input placeholder="BUSCAR ZONA..." className="h-14 pl-12 pr-4 rounded-2xl border-none bg-white shadow-sm font-black text-[10px] uppercase tracking-widest" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  {devices.length > 0 && (
                    <Button onClick={turnOffAll} className="h-14 px-6 rounded-2xl font-black text-[10px] uppercase bg-slate-900 text-white shadow-xl action-button flex flex-col items-center justify-center">
                      <PowerOff size={18} /><span>OFF</span>
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDevices.map(device => (
                  <DeviceCard key={device.id} device={device} onUpdate={handleUpdateDevice} onDelete={handleDeleteDevice} onEdit={handleStartEdit} refreshTrigger={refreshTrigger} />
                ))}
                {filteredDevices.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto text-slate-300"><Search size={40} /></div>
                    <p className="text-slate-400 font-black uppercase text-xs tracking-widest">{searchTerm ? "NO SE ENCONTRARON ZONAS" : "COMIENZA AGREGANDO UNA LUZ"}</p>
                  </div>
                )}
              </div>
            </div>
          ) : ( <GuideTab /> )}
        </div>
      </main>

      <Dialog open={isOwnerOpen} onOpenChange={setIsOwnerOpen}>
        <DialogContent className="sm:max-w-md rounded-[3rem] bg-white p-10 border-none">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase text-primary italic text-center">PERFIL</DialogTitle></DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">NOMBRE DEL HOGAR</label>
              <Input value={homeOwner} onChange={(e) => setHomeOwner(e.target.value)} className="h-16 rounded-2xl font-black text-lg px-5 uppercase" />
            </div>
            {isInstallable && (
              <Button onClick={handleInstallClick} variant="outline" className="w-full h-16 rounded-2xl border-primary/20 text-primary font-black uppercase">
                <Download size={18} className="mr-2" /> INSTALAR APP EN CELULAR
              </Button>
            )}
            <Button onClick={() => { saveHomeOwnerName(homeOwner); setIsOwnerOpen(false); vibrate(20); toast({ title: "PERFIL ACTUALIZADO" }); }} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase">GUARDAR CAMBIOS</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md rounded-[3rem] bg-white p-10 border-none">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase text-primary italic text-center">EDITAR ZONA</DialogTitle></DialogHeader>
          {deviceToEdit && ( <DeviceForm initialData={deviceToEdit} devices={devices} onSubmit={handleSaveEdit} onCancel={() => setIsEditOpen(false)} /> )}
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-10 left-0 right-0 z-50 px-10">
        <nav className="bg-white/90 backdrop-blur-3xl p-2.5 rounded-[3rem] shadow-2xl flex gap-3 max-w-sm mx-auto border border-slate-200">
          <button onClick={() => { vibrate(15); setActiveTab('control'); }} className={cn("flex-1 flex flex-col items-center justify-center gap-2 h-20 rounded-[2.5rem] transition-all", activeTab === 'control' ? "bg-primary text-white font-black shadow-lg" : "text-slate-400 hover:bg-slate-50")}>
            <LayoutGrid size={24} strokeWidth={3} /><span className="text-[10px] uppercase font-black">CONTROL</span>
          </button>
          <button onClick={() => { vibrate(15); setActiveTab('guide'); }} className={cn("flex-1 flex flex-col items-center justify-center gap-2 h-20 rounded-[2.5rem] transition-all", activeTab === 'guide' ? "bg-primary text-white font-black shadow-lg" : "text-slate-400 hover:bg-slate-50")}>
            <BookOpen size={24} strokeWidth={3} /><span className="text-[10px] uppercase font-black">AYUDA</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
