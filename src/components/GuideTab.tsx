'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings2,
  Cpu,
  Zap,
  Lightbulb,
  Info,
  Copy,
  Check
} from 'lucide-react';
import { vibrate } from '@/lib/haptics';

export function GuideTab() {
  const [copied, setCopied] = useState(false);

  const esp32Code = `#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASS_WIFI";

WebServer server(80);

const int PIN_R1 = 25; 
const int PIN_R2 = 33;

void handleToggle1() {
  digitalWrite(PIN_R1, !digitalRead(PIN_R1));
  server.send(200, "text/plain", "OK");
}

void handleToggle2() {
  digitalWrite(PIN_R2, !digitalRead(PIN_R2));
  server.send(200, "text/plain", "OK");
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_R1, OUTPUT);
  pinMode(PIN_R2, OUTPUT);
  digitalWrite(PIN_R1, HIGH); 
  digitalWrite(PIN_R2, HIGH);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); }
  
  server.on("/toggle1", HTTP_POST, handleToggle1);
  server.on("/toggle2", HTTP_POST, handleToggle2);
  server.begin();
}`;

  const copyToClipboard = () => {
    vibrate(50);
    navigator.clipboard.writeText(esp32Code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-40">
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
          <Settings2 size={14} /> MANUAL TÉCNICO
        </div>
        
        <h2 className="text-5xl font-black tracking-tight uppercase text-slate-900 leading-none italic break-words">CONFIGURACIÓN</h2>
      </div>

      <div className="space-y-6">
        <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 px-4 italic">ESQUEMA DE CONEXIÓN</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 rounded-[2rem] bg-slate-900 text-white border-none shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="bg-primary h-12 w-12 rounded-xl flex items-center justify-center"><Cpu size={24} /></div>
                <h4 className="font-black text-lg uppercase tracking-tight italic text-white">ESP ➔ RELÉ</h4>
              </div>
              <ul className="space-y-4">
                <li className="flex flex-col gap-1">
                  <span className="text-primary text-[9px] font-black uppercase tracking-widest">ALIMENTACIÓN</span>
                  <span className="text-slate-300 text-xs font-medium">VIN a VCC / GND a GND</span>
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-primary text-[9px] font-black uppercase tracking-widest">PINES CONTROL</span>
                  <span className="text-slate-300 text-xs font-medium">GPIO 25 (CH1) / GPIO 33 (CH2)</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card className="p-8 rounded-[2rem] bg-white border-slate-100 shadow-xl">
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="bg-slate-900 h-12 w-12 rounded-xl flex items-center justify-center text-white"><Zap size={24} /></div>
                <h4 className="font-black text-lg uppercase tracking-tight italic text-slate-900">RELÉ ➔ FOCO</h4>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3 text-slate-600 text-[11px] font-medium leading-tight">
                  <Info size={14} className="text-primary shrink-0"/>
                  <span className="uppercase">CONECTA LA FASE AL 'COM' DEL RELÉ.</span>
                </li>
                <li className="flex gap-3 text-slate-600 text-[11px] font-medium leading-tight">
                  <Lightbulb size={14} className="text-primary shrink-0"/>
                  <span className="uppercase">CONECTA EL RETORNO AL 'NO'.</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none italic">FIRMWARE</h3>
            <span className="inline-block px-4 py-1.5 rounded-lg bg-slate-100 text-[10px] font-black uppercase text-slate-500 tracking-widest">ESP32 / ESP8266</span>
          </div>
          <Button 
            className="h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-8 action-button shadow-xl"
            onClick={copyToClipboard}
          >
            {copied ? <Check size={18} className="mr-2" /> : <Copy size={18} className="mr-2" />}
            {copied ? 'COPIADO' : 'COPIAR CÓDIGO'}
          </Button>
        </div>

        <Card className="border-none bg-slate-900 text-slate-300 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <pre className="p-8 text-[11px] font-mono leading-relaxed overflow-x-auto h-[400px] bg-slate-950">
              <code>{esp32Code}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
