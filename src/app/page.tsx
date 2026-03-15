'use client';

import { useState, useEffect, useCallback, useMemo, useRef, useTransition } from 'react';
import { 
  Device, 
  getStoredDevices, 
  saveDevices, 
  getHomeOwnerName, 
  saveHomeOwnerName,
  getHomeOwnerPassword,
  saveHomeOwnerPassword,
  isSessionActive,
  setSessionActive,
  clearSession
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
  Download,
  Smartphone,
  SmartphoneIcon as SmartphoneIos
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
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  
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
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('Evento beforeinstallprompt capturado');
    };

    window.addEventListener('beforeinstallprompt', handler);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) setIsAppInstalled(true);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallAndroid = async () => {
    vibrate(20);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        toast({ title: "INSTALANDO...", description: "AÑADIENDO A PANTALLA DE INICIO" });
      }
    } else {
      toast({ 
        title: "INSTALACIÓN MANUAL", 
        description: "TOCA EL MENÚ (⋮) DE CHROME Y SELECCIONA 'INSTALAR APLICACIÓN' O 'AÑADIR A PANTALLA DE INICIO'.",
        duration: 10000
      });
    }
  };

  const handleShowIosHelp = () => {
    vibrate(20);
    toast({ 
      title: "GUÍA PARA iPHONE", 
      description: "1. TOCA 'COMPARTIR' (CUADRADO CON FLECHA). 2. BUSCA 'AÑADIR A PANTALLA DE INICIO'.",
      duration: 10000
    });
  };

  useEffect(() => {
    const ownerName = getHomeOwnerName();
    const storedDevices = getStoredDevices();
    setDevices(storedDevices);
    
    if (ownerName) {
      setHasAccount(true);
      setHomeOwner(ownerName);
    }

    if (isSessionActive()) {
      setIsAuthenticated(true);
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    saveDevices(devices);
  }, [devices, isInitialized]);

  const handleAccess = useCallback(() => {
    const savedName = getHomeOwnerName();
    const savedPass = getHomeOwnerPassword();

    if (!hasAccount) {
      if (!nameInput.trim() || !passInput.trim()) return;
      saveHomeOwnerName(nameInput);
      saveHomeOwnerPassword(passInput);
      setHomeOwner(nameInput);
      setIsAuthenticated(true);
      setSessionActive(true);
      setHasAccount(true);
      vibrate([20, 100]);
      toast({ title: "PERFIL CREADO", description: `BIENVENIDO, ${nameInput.toUpperCase()}` });
    } else {
      if (nameInput.trim().toUpperCase() === savedName.toUpperCase() && passInput === savedPass) {
        setIsAuthenticated(true);
        setSessionActive(true);
        vibrate([20, 100]);
        toast({ title: "ACCESO CONCEDIDO", description: `HOLA DE NUEVO, ${savedName.toUpperCase()}` });
      } else {
        vibrate([50, 50, 50]);
        toast({ variant: "destructive", title: "ERROR DE ACCESO", description: "NOMBRE O CONTRASEÑA INCORRECTOS" });
      }
    }
  }, [nameInput, passInput, hasAccount, toast]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    clearSession();
    vibrate(50);
  };

  const handleAddDevice = (data: Omit<Device, 'id' | 'status'>) => {
    const newDevice: Device = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: false
    };
    setDevices(prev => [...prev, newDevice]);
    setIsAddOpen(false);
  };

  const handleUpdateDevice = (id: string, updates: Partial<Device>) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleDeleteDevice = (id: string) => {
    vibrate(30);
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const handleStartEdit = (device: Device) => {
    setDeviceToEdit(device);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (data: Omit<Device, 'id' | 'status'>) => {
    if (deviceToEdit) {
      handleUpdateDevice(deviceToEdit.id, data);
      setIsEditOpen(false);
      setDeviceToEdit(null);
    }
  };

  const turnOffAll = useCallback(() => {
    vibrate([50, 100, 50]);
    setDevices(prev => prev.map(d => ({ ...d, status: false })));
    devices.filter(d => d.status).forEach(device => {
      fetch(`http://${device.ip}/toggle${device.channel}`, { method: 'POST', mode: 'no-cors' }).catch(() => {});
    });
  }, [devices]);

  const filteredDevices = useMemo(() => {
    if (!searchTerm) return devices;
    const lowerSearch = searchTerm.toLowerCase();
    return devices.filter(d => d.name.toLowerCase().includes(lowerSearch) || d.ip.includes(searchTerm));
  }, [devices, searchTerm]);

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
              {!hasAccount ? 'REGISTRAR' : 'ACCEDER'}
            </h1>
            <p className="text-white/70 font-black uppercase tracking-widest text-[10px]">
              {!hasAccount ? 'CREA TU PERFIL DE HOGAR' : `HOGAR DE ${homeOwner.toUpperCase()}`}
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
              onClick={handleAccess} 
              disabled={!nameInput.trim() || !passInput.trim()}
              className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-white/90 font-black uppercase text-sm tracking-widest shadow-2xl action-button"
            >
              {!hasAccount ? 'COMENZAR' : 'ENTRAR'} <ArrowRight size={20} className="ml-2" />
            </Button>
          </div>
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
            <div onClick={() => { setIsOwnerOpen(true); vibrate(10); }} className="cursor-pointer group">
              <h1 className="text-2xl font-black tracking-tighter leading-none uppercase italic group-hover:text-primary transition-colors">LUZ CONTROL</h1>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 flex items-center gap-1.5 mt-1">
                <User size={12} className="text-primary" /> HOGAR DE {homeOwner.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {!isAppInstalled && (
              <Button onClick={() => setIsOwnerOpen(true)} variant="outline" className="rounded-2xl h-14 border-primary/20 text-primary font-black uppercase text-[10px] px-4 action-button shadow-sm bg-white">
                <Download size={18} className="mr-0 md:mr-2" /> <span className="hidden md:inline">INSTALAR</span>
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
              </div>
            </div>
          ) : ( <GuideTab /> )}
        </div>
      </main>

      <Dialog open={isOwnerOpen} onOpenChange={setIsOwnerOpen}>
        <DialogContent className="sm:max-w-md rounded-[3rem] bg-white p-10 border-none overflow-y-auto max-h-[90vh]">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase text-primary italic text-center">PERFIL Y AYUDA</DialogTitle></DialogHeader>
          <div className="space-y-8 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">NOMBRE DEL HOGAR</label>
              <Input value={homeOwner} onChange={(e) => setHomeOwner(e.target.value)} className="h-16 rounded-2xl font-black text-lg px-5 uppercase" />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-primary">
                <Smartphone size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest">INSTALACIÓN EN MÓVIL</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">ANDROID / CHROME</p>
                  <Button onClick={handleInstallAndroid} className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase text-[11px] flex items-center justify-center gap-3 action-button">
                    <Smartphone size={20} /> INSTALAR EN ANDROID
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">iPHONE / SAFARI</p>
                  <Button onClick={handleShowIosHelp} variant="outline" className="w-full h-16 rounded-2xl border-2 border-primary/20 text-primary font-black uppercase text-[11px] flex items-center justify-center gap-3 action-button">
                    <SmartphoneIos size={20} /> AYUDA PARA iOS
                  </Button>
                </div>
              </div>
              
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase text-center px-4 mt-2">
                AL INSTALAR LA APP APARECERÁ EL ICONO EN TU TELÉFONO Y SE ABRIRÁ A PANTALLA COMPLETA.
              </p>
            </div>

            <Button onClick={() => { saveHomeOwnerName(homeOwner); setIsOwnerOpen(false); vibrate(20); toast({ title: "PERFIL ACTUALIZADO" }); }} className="w-full h-16 rounded-2xl bg-primary text-white font-black uppercase shadow-xl mt-4">GUARDAR CAMBIOS</Button>
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
