'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Device } from '@/lib/devices-store';
import { vibrate } from '@/lib/haptics';
import { Cpu, Network, Tag, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeviceFormProps {
  initialData?: Device | null;
  devices: Device[];
  onSubmit: (data: Omit<Device, 'id' | 'status'>) => void;
  onCancel: () => void;
}

export function DeviceForm({ initialData, devices, onSubmit, onCancel }: DeviceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [ip, setIp] = useState(initialData?.ip || '');
  const [channel, setChannel] = useState<string>(initialData?.channel?.toString() || '1');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !ip.trim()) return;

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ip.trim())) {
      vibrate([50, 50, 50]);
      toast({
        variant: "destructive",
        title: "IP INVÁLIDA",
        description: "POR FAVOR INGRESA UNA DIRECCIÓN IP VÁLIDA (EJ: 192.168.1.10)",
      });
      return;
    }

    const channelNumber = parseInt(channel);

    const conflict = devices.find(d => 
      d.ip.trim() === ip.trim() && 
      d.channel === channelNumber && 
      d.id !== initialData?.id
    );

    if (conflict) {
      vibrate([50, 100, 50]);
      toast({
        variant: "destructive",
        title: "CANAL OCUPADO",
        description: `EL CANAL ${channelNumber} YA ESTÁ OCUPADO POR ${conflict.name.toUpperCase()}`,
      });
      return;
    }

    vibrate([20, 60]);
    onSubmit({ name: name.trim(), ip: ip.trim(), channel: channelNumber });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Tag size={12} className="text-primary" /> ZONA DE ILUMINACIÓN
          </Label>
          <Input
            placeholder="Ej: SALA DE ESTAR"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-2xl border-slate-100 bg-slate-50 h-14 px-5 text-lg font-bold text-slate-900 focus:ring-primary placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Network size={12} className="text-primary" /> DIRECCIÓN IP (ESP32)
          </Label>
          <Input
            placeholder="192.168.1.XX"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            required
            className="rounded-2xl border-slate-100 bg-slate-50 h-14 px-5 font-mono text-lg font-bold text-slate-900 focus:ring-primary placeholder:text-slate-300"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Cpu size={12} className="text-primary" /> CANAL DEL RELÉ
          </Label>
          <Select value={channel} onValueChange={(val) => { vibrate(10); setChannel(val); }}>
            <SelectTrigger className="rounded-2xl border-slate-100 bg-slate-50 h-14 px-5 text-lg font-bold text-slate-900 focus:ring-primary">
              <SelectValue placeholder="SELECCIONAR CANAL" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 bg-white shadow-2xl">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((ch) => (
                <SelectItem 
                  key={ch} 
                  value={ch.toString()}
                  className="py-3 font-bold text-slate-700 focus:bg-primary focus:text-white rounded-xl"
                >
                  CANAL {ch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 pt-4">
        <Button 
          type="submit" 
          className="w-full rounded-2xl h-16 bg-primary hover:bg-primary/90 text-white font-black uppercase text-[11px] tracking-widest shadow-lg action-button"
        >
          <Save size={16} className="mr-2" />
          {initialData ? 'GUARDAR CAMBIOS' : 'VINCULAR AHORA'}
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          className="w-full rounded-2xl h-12 font-bold uppercase text-[9px] tracking-widest text-slate-400 hover:text-slate-600" 
          onClick={() => { vibrate(10); onCancel(); }}
        >
          <X size={14} className="mr-2" />
          CANCELAR
        </Button>
      </div>
    </form>
  );
}