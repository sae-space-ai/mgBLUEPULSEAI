import { create } from 'zustand';
import { MooringComponent, Alert, AppSettings } from '../types';
import { generateComponents, generateAlerts } from '../lib/mockData';
import { predict, PredictionResponse, generateSystemKPIs } from '../ai/predictApi';
import { detectAnomalies, calculateAnomalyScore } from '../ai/anomalyDetection';
import { calculateFatigueFromReadings } from '../ai/fatigueModel';
import { calculateWeibullFailureProbability, calculateRemainingUsefulLife } from '../ai/probabilisticModels';

interface AppState {
  components: MooringComponent[];
  alerts: Alert[];
  settings: AppSettings;
  selectedComponent: MooringComponent | null;
  sidebarOpen: boolean;
  predictions: Map<string, PredictionResponse>;
  systemKPIs: {
    overallHealth: number;
    totalAnomalies: number;
    criticalComponents: number;
    averageRisk: number;
    totalMaintenanceCost: number;
    availability: number;
  } | null;
  isLoading: boolean;
  lastPredictionUpdate: string | null;

  setSelectedComponent: (component: MooringComponent | null) => void;
  acknowledgeAlert: (alertId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  toggleSidebar: () => void;
  runAIPredictions: () => Promise<void>;
  runComponentPrediction: (componentId: string) => Promise<PredictionResponse | null>;
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

export const useAppStore = create<AppState>((set, get) => ({
  components: initialComponents,
  alerts: initialAlerts,
  settings: defaultSettings,
  selectedComponent: null,
  sidebarOpen: true,
  predictions: new Map(),
  systemKPIs: null,
  isLoading: false,
  lastPredictionUpdate: null,

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

  runAIPredictions: async () => {
    set({ isLoading: true });
    
    const { components, settings } = get();
    const predictions = new Map<string, PredictionResponse>();
    const allAlerts: Alert[] = [];
    
    // Run predictions for all components
    for (const comp of components) {
      const recentData = comp.sensorData.slice(-500).map(d => ({
        timestamp: d.timestamp,
        tension: d.tension,
        acceleration: d.acceleration,
        inclination: d.inclination,
        temperature: d.temperature,
        corrosion: d.corrosion,
        cyclicLoads: d.cyclicLoads,
      }));
      
      const prediction = await predict({
        componentId: comp.id,
        componentName: comp.name,
        sensorData: recentData,
        environmentalConditions: {
          waveHeight: settings.waveHeight,
          wavePeriod: 10,
          windSpeed: settings.windSpeed,
          currentSpeed: settings.currentSpeed,
          waterDepth: 200,
        },
        lastInspection: comp.lastInspection,
      });
      
      predictions.set(comp.id, prediction);
      
      // Generate AI-based alerts
      prediction.anomalies.detected.slice(0, 3).forEach((anomaly, idx) => {
        allAlerts.push({
          id: `ai-${comp.id}-${idx}`,
          severity: anomaly.severity,
          componentId: comp.id,
          componentName: comp.name,
          description: `AI detected anomaly in ${anomaly.parameter} (z-score: ${anomaly.zScore.toFixed(2)}, isolation score: ${anomaly.isolationScore.toFixed(2)})`,
          recommendedAction: prediction.maintenance.recommendation,
          timestamp: anomaly.timestamp,
          acknowledged: false,
        });
      });
    }
    
    // Generate system KPIs
    const kpis = await generateSystemKPIs(Array.from(predictions.values()));
    
    set({
      predictions,
      systemKPIs: kpis,
      alerts: [...allAlerts, ...get().alerts.filter(a => a.id.startsWith('alert-'))].slice(0, 50),
      isLoading: false,
      lastPredictionUpdate: new Date().toISOString(),
    });
  },

  runComponentPrediction: async (componentId: string) => {
    const { components, settings } = get();
    const comp = components.find(c => c.id === componentId);
    if (!comp) return null;
    
    const recentData = comp.sensorData.slice(-500).map(d => ({
      timestamp: d.timestamp,
      tension: d.tension,
      acceleration: d.acceleration,
      inclination: d.inclination,
      temperature: d.temperature,
      corrosion: d.corrosion,
      cyclicLoads: d.cyclicLoads,
    }));
    
    const prediction = await predict({
      componentId: comp.id,
      componentName: comp.name,
      sensorData: recentData,
      environmentalConditions: {
        waveHeight: settings.waveHeight,
        wavePeriod: 10,
        windSpeed: settings.windSpeed,
        currentSpeed: settings.currentSpeed,
        waterDepth: 200,
      },
      lastInspection: comp.lastInspection,
    });
    
    set((state) => {
      const newPredictions = new Map(state.predictions);
      newPredictions.set(componentId, prediction);
      return { predictions: newPredictions };
    });
    
    return prediction;
  },
}));
