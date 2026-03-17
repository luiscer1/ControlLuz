'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Settings2,
  AlertCircle,
  Cpu,
  Zap,
  Lightbulb,
  Info,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';
import { vibrate } from '@/lib/haptics';
import { cn } from '@/lib/utils';

export function GuideTab() {
  const [copied, setCopied] = useState(false);
  const [selectedFirmware, setSelectedFirmware] = useState<'esp32' | 'esp8266'>('esp32');

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

  const esp8266Code = `#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

const char* ssid = "TU_RED_WIFI";
const char* password = "TU_PASS_WIFI";

ESP8266WebServer server(80);

const int PIN_R1 = 5; 
const int PIN_R2 = 4; 

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

  const currentCode = selectedFirmware === 'esp32' ? esp32Code : esp8266Code;

  const copyToClipboard = () => {
    vibrate(50);
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-40">
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
          <Settings2 size={14} /> MANUAL TÉCNICO
        </div>
        
        <h2 className="text-4xl md:text-6xl font-black tracking-tight uppercase text-slate-900 leading-none italic">CONFIGURACIÓN</h2>

        <Alert className="max-w-2xl mx-auto border-rose-200 bg-rose-50 rounded-[2rem] text-left p-6">
          <ShieldAlert className="h-6 w-6 text-rose-500" />
          <AlertTitle className="text-rose-700 font-black uppercase tracking-widest text-xs">¡IMPORTANTE: ERROR DE CONEXIÓN EN MÓVIL!</AlertTitle>
          <AlertDescription className="text-rose-600 text-sm font-medium mt-2 leading-relaxed">
            Si en la computadora funciona pero en el celular dice "Offline", es por seguridad del navegador (HTTPS bloqueando HTTP local).
            <br/><br/>
            <strong>SOLUCIÓN:</strong> En Chrome/Safari de tu celular, ve a Configuración del sitio ➔ "Contenido no seguro" y actívalo para esta página. Así el celular podrá hablar con la placa.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 px-4 italic">ESQUEMA DE CONEXIÓN</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-8 rounded-[2rem] bg-slate-900 text-white border-none shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="bg-primary h-12 w-12 rounded-xl flex items-center justify-center"><Cpu size={24} /></div>
                <h4 className="font-black text-lg uppercase tracking-tight italic">ESP ➔ RELÉ</h4>
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
                  <span className="uppercase">FASE AL 'COM' DEL RELÉ.</span>
                </li>
                <li className="flex gap-3 text-slate-600 text-[11px] font-medium leading-tight">
                  <Lightbulb size={14} className="text-primary shrink-0"/>
                  <span className="uppercase">'NO' AL FOCO.</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4">
            <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none italic">FIRMWARE</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => { vibrate(10); setSelectedFirmware('esp32'); }}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedFirmware === 'esp32' ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white text-slate-400 border border-slate-100"
                )}
              >
                ESP32
              </button>
              <button 
                onClick={() => { vibrate(10); setSelectedFirmware('esp8266'); }}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedFirmware === 'esp8266' ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white text-slate-400 border border-slate-100"
                )}
              >
                ESP8266
              </button>
            </div>
          </div>
          <Button 
            className="h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-8 action-button shadow-xl"
            onClick={copyToClipboard}
          >
            {copied ? <><Check size={18} className="mr-2" /> COPIADO</> : <><Copy size={18} className="mr-2" /> COPIAR CÓDIGO</>}
          </Button>
        </div>

        <Card className="border-none bg-slate-900 text-slate-300 shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-0">
            <pre className="p-8 text-[11px] font-mono leading-relaxed overflow-x-auto h-[400px] bg-slate-950">
              <code>{currentCode}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}