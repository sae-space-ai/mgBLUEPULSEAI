import { create } from 'zustand';
import { MooringComponent, Alert, AppSettings, User } from '../types';
import { generateComponents, generateAlerts } from '../lib/mockData';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  components: MooringComponent[];
  alerts: Alert[];
  settings: AppSettings;
  selectedComponent: MooringComponent | null;
  sidebarOpen: boolean;
  
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setSelectedComponent: (component: MooringComponent | null) => void;
  acknowledgeAlert: (alertId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleSidebar: () => void;
}

const defaultSettings: AppSettings = {
  tensionThreshold: 600,
  accelerationThreshold: 2.5,
  fatigueWarningLevel: 0.5,
  fatigueCriticalLevel: 0.75,
  safetyFactor: 1.5,
  designLife: 25,
  waveHeight: 4.5,
  windSpeed: 12,
  currentSpeed: 1.2,
  darkMode: true,
};

const initialComponents = generateComponents();
const initialAlerts = generateAlerts(initialComponents);

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  components: initialComponents,
  alerts: initialAlerts,
  settings: defaultSettings,
  selectedComponent: null,
  sidebarOpen: true,

  login: (email: string, password: string) => {
    if (email === 'demo@bluepulse.ai' && password === 'demo123') {
      set({
        user: { email, role: 'admin', name: 'Demo User' },
        isAuthenticated: true,
      });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, selectedComponent: null });
  },

  setSelectedComponent: (component) => set({ selectedComponent: component }),

  acknowledgeAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.map(a =>
        a.id === alertId ? { ...a, acknowledged: true } : a
      ),
    }));
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
}));
