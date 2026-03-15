'use client';

export interface Device {
  id: string;
  name: string;      // Ej. "Sala"
  ip: string;        // Ej. "192.168.1.15"
  channel: number;   // 1 o 2 (el canal del relé físico)
  status: boolean;
}

const STORAGE_KEY = 'luz-control-devices-v2-independent';
const OWNER_KEY = 'luz-control-owner-name';
const PASSWORD_KEY = 'luz-control-owner-password';
const SESSION_KEY = 'luz-control-session-active';

export const getStoredDevices = (): Device[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const saveDevices = (devices: Device[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
};

export const getHomeOwnerName = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(OWNER_KEY) || '';
};

export const saveHomeOwnerName = (name: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OWNER_KEY, name);
};

export const getHomeOwnerPassword = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(PASSWORD_KEY) || '';
};

export const saveHomeOwnerPassword = (password: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PASSWORD_KEY, password);
};

export const setSessionActive = (active: boolean) => {
  if (typeof window === 'undefined') return;
  if (active) {
    localStorage.setItem(SESSION_KEY, 'true');
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const isSessionActive = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SESSION_KEY) === 'true';
};

export const clearSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
};
