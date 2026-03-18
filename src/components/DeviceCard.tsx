'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Power, Trash2, Edit2, Loader2, MoreVertical, Wifi, Cpu, AlertCircle, RefreshCw } from 'lucide-react';
import { Device } from '@/lib/devices-store';
import { vibrate } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface DeviceCardProps {
  device: Device;
  onUpdate: (id: string, updates: Partial<Device>) => void;
  onDelete: (id: string) => void;
  onEdit: (device: Device) => void;
  refreshTrigger?: number;
}

export const DeviceCard = React.memo(function DeviceCard({ 
  device, 
  onUpdate, 
  onDelete, 
  onEdit, 
  refreshTrigger 
}: DeviceCardProps) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const isMounted = useRef(true);
  const { toast } = useToast();

  const checkStatus = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      await fetch(`http://${device.ip}/`, { 
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      if (isMounted.current) setIsOnline(true);
    } catch (e) {
      if (isMounted.current) setIsOnline(false);
    }
  }, [device.ip]);

  useEffect(() => {
    isMounted.current = true;
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [checkStatus]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      checkStatus();
    }
  }, [refreshTrigger, checkStatus]);

  const toggle = useCallback(async () => {
    if (isOnline !== true) {
      vibrate([50, 50, 50]);
      toast({
        variant: "destructive",
        title: "SIN CONEXIÓN",
        description: "NO SE PUEDE OPERAR UN DISPOSITIVO FUERA DE LÍNEA"
      });
      return;
    }

    vibrate([20, 80]);
    
    const nextStatus = !device.status;
    onUpdate(device.id, { status: nextStatus });

    fetch(`http://${device.ip}/toggle${device.channel}`, { 
      method: 'POST',
      mode: 'no-cors'
    }).then(() => {
      if (isMounted.current) setIsOnline(true);
    }).catch(() => {
      if (isMounted.current) {
        setIsOnline(false);
        onUpdate(device.id, { status: device.status });
      }
    });
  }, [device.id, device.ip, device.channel, device.status, isOnline, onUpdate, toast]);

  const handleReconnect = useCallback(() => {
    vibrate(20);
    setIsReconnecting(true);
    setIsOnline(null);
    
    setTimeout(async () => {
      await checkStatus();
      if (isMounted.current) {
        setIsReconnecting(false);
      }
    }, 5000);
  }, [checkStatus]);

  return (
    <Card className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl transition-all duration-300">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-2.5 w-2.5 rounded-full",
                isOnline === true ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : (isOnline === false) ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-slate-300"
              )} />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
                {isOnline === true ? 'ONLINE' : isOnline === false ? 'OFFLINE' : 'CONECTANDO'}
              </span>
            </div>
            <h3 className="font-black text-2xl tracking-tighter uppercase leading-none italic text-slate-900 truncate max-w-[180px]">{device.name}</h3>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl text-[8px] font-black tracking-widest flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-500">
                <Wifi size={10} className="text-primary" /> {device.ip}
              </span>
              <span className="px-2.5 py-1 rounded-xl text-[8px] font-black tracking-widest flex items-center gap-1.5 bg-slate-50 border border-slate-100 text-slate-500">
                <Cpu size={10} className="text-primary" /> CH-{device.channel}
              </span>
            </div>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="h-10 w-10 flex items-center justify-center rounded-xl transition-all bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 border border-slate-100 action-button">
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl shadow-2xl bg-white p-2 border-none">
              <DropdownMenuItem onClick={() => onEdit(device)} className="gap-2 font-black text-[9px] uppercase tracking-widest cursor-pointer hover:bg-slate-50 rounded-xl">
                <Edit2 size={14} /> EDITAR
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(device.id)} className="text-rose-500 gap-2 font-black text-[9px] uppercase tracking-widest cursor-pointer hover:bg-rose-50 rounded-xl">
                <Trash2 size={14} /> ELIMINAR
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isOnline === false && !isReconnecting && (
          <div className="p-4 rounded-2xl flex flex-col gap-3 bg-rose-50 border border-rose-100 animate-in slide-in-from-top duration-300">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-500" />
              <p className="text-[10px] font-bold leading-tight uppercase tracking-tight text-rose-700">
                DISPOSITIVO FUERA DE LÍNEA VERIFICA LA IP DEL MICROCONTROLADOR Y QUE ESTES CONECTADO A LA MISMA RED WI-FI
              </p>
            </div>
            <button 
              onClick={handleReconnect}
              className="w-full py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={12} /> RECONECTAR
            </button>
          </div>
        )}

        {isReconnecting && (
          <div className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50 border border-slate-100">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">RECONECTANDO...</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
          <div className="space-y-0.5">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">ESTADO</p>
            <p className={cn(
              "font-black text-xl italic leading-none tracking-tight transition-colors duration-300",
              device.status ? "text-emerald-600" : "text-rose-600"
            )}>
              {device.status ? 'ENCENDIDO' : 'APAGADO'}
            </p>
          </div>
          <button
            onClick={toggle}
            disabled={isReconnecting || isOnline === false}
            className={cn(
              "h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-300 action-button shadow-xl border-2 text-white",
              device.status ? "bg-emerald-600 border-emerald-500" : "bg-rose-600 border-rose-500",
              isOnline === false && "grayscale opacity-50"
            )}
          >
            <Power size={32} strokeWidth={3} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
});