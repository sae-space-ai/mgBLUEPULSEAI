export interface SensorReading {
  timestamp: string;
  tension: number;
  acceleration: number;
  inclination: number;
  temperature: number;
  corrosion: number;
  cyclicLoads: number;
}

export interface MooringComponent {
  id: string;
  name: string;
  type: 'mooring' | 'anchor';
  status: 'optimal' | 'warning' | 'critical';
  lastInspection: string;
  fatigueAccumulation: number;
  failureProbability: number;
  sensorData: SensorReading[];
  position: { x: number; y: number };
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  componentId: string;
  componentName: string;
  description: string;
  recommendedAction: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface FatiguePrediction {
  componentId: string;
  minerDamage: number;
  weibullProbability: number;
  estimatedRemainingLife: number;
  trend: 'improving' | 'stable' | 'degrading';
}

export interface AppSettings {
  tensionThreshold: number;
  accelerationThreshold: number;
  fatigueWarningLevel: number;
  fatigueCriticalLevel: number;
  safetyFactor: number;
  designLife: number;
  waveHeight: number;
  windSpeed: number;
  currentSpeed: number;
  darkMode: boolean;
}

export interface User {
  email: string;
  role: 'admin' | 'operator';
  name: string;
}
