import { SensorReading, MooringComponent, Alert } from '../types';

// Gaussian noise generator
function gaussianRandom(mean = 0, stdev = 1): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

// Generate sensor readings for the last 30 days (every 5 minutes)
function generateSensorData(baseTension: number, baseAccel: number, degradation: number): SensorReading[] {
  const data: SensorReading[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const interval = 5 * 60 * 1000; // 5 minutes
  let current = new Date(thirtyDaysAgo);

  while (current <= now) {
    const dayProgress = (current.getTime() - thirtyDaysAgo.getTime()) / (30 * 24 * 60 * 60 * 1000);
    const tension = baseTension + gaussianRandom(0, 15) + degradation * dayProgress * 50;
    const acceleration = baseAccel + gaussianRandom(0, 0.3) + degradation * dayProgress * 0.5;
    const inclination = 2.5 + gaussianRandom(0, 0.8) + Math.sin(dayProgress * Math.PI * 4) * 1.5;
    const temperature = 12 + gaussianRandom(0, 3) + Math.sin(dayProgress * Math.PI * 2) * 4;
    const corrosion = Math.min(100, (degradation * 10) + dayProgress * degradation * 20 + gaussianRandom(0, 2));
    const cyclicLoads = Math.floor(1000 + gaussianRandom(0, 200) + dayProgress * degradation * 500);

    data.push({
      timestamp: current.toISOString(),
      tension: Math.max(0, tension),
      acceleration: Math.max(0, acceleration),
      inclination: Math.abs(inclination),
      temperature,
      corrosion: Math.max(0, Math.min(100, corrosion)),
      cyclicLoads: Math.max(0, cyclicLoads),
    });

    current = new Date(current.getTime() + interval);
  }

  return data;
}

export function generateComponents(): MooringComponent[] {
  const components: MooringComponent[] = [];
  const mooringNames = ['Mooring Line A1', 'Mooring Line A2', 'Mooring Line A3', 'Mooring Line B1', 'Mooring Line B2', 'Mooring Line B3'];
  const anchorNames = ['Anchor Suction Pile 1', 'Anchor Suction Pile 2', 'Anchor Suction Pile 3', 'Anchor Drag Embedment 1', 'Anchor Drag Embedment 2', 'Anchor Drag Embedment 3'];

  mooringNames.forEach((name, i) => {
    const degradation = 0.3 + Math.random() * 0.7;
    const fatigue = Math.min(0.95, degradation * 0.6 + Math.random() * 0.2);
    const failureProb = Math.min(0.9, Math.pow(fatigue, 2.5) * 0.8);
    const status = failureProb > 0.6 ? 'critical' : failureProb > 0.3 ? 'warning' : 'optimal';

    components.push({
      id: `mooring-${i + 1}`,
      name,
      type: 'mooring',
      status,
      lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      fatigueAccumulation: fatigue,
      failureProbability: failureProb,
      sensorData: generateSensorData(450 + i * 30, 1.2 + i * 0.1, degradation),
      position: { x: 50 + Math.cos((i * Math.PI * 2) / 6) * 35, y: 50 + Math.sin((i * Math.PI * 2) / 6) * 35 },
    });
  });

  anchorNames.forEach((name, i) => {
    const degradation = 0.2 + Math.random() * 0.5;
    const fatigue = Math.min(0.85, degradation * 0.5 + Math.random() * 0.15);
    const failureProb = Math.min(0.8, Math.pow(fatigue, 2.5) * 0.6);
    const status = failureProb > 0.5 ? 'critical' : failureProb > 0.25 ? 'warning' : 'optimal';

    components.push({
      id: `anchor-${i + 1}`,
      name,
      type: 'anchor',
      status,
      lastInspection: new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString(),
      fatigueAccumulation: fatigue,
      failureProbability: failureProb,
      sensorData: generateSensorData(300 + i * 25, 0.8 + i * 0.05, degradation),
      position: { x: 50 + Math.cos((i * Math.PI * 2) / 6 + Math.PI / 6) * 55, y: 50 + Math.sin((i * Math.PI * 2) / 6 + Math.PI / 6) * 55 },
    });
  });

  return components;
}

export function generateAlerts(components: MooringComponent[]): Alert[] {
  const alerts: Alert[] = [];
  const descriptions = [
    { desc: 'Tension exceeds operational threshold', action: 'Reduce pretension and schedule inspection within 48h', severity: 'high' as const },
    { desc: 'Abnormal vibration pattern detected', action: 'Perform modal analysis and check for structural damage', severity: 'medium' as const },
    { desc: 'Corrosion rate above expected degradation model', action: 'Apply cathodic protection check and schedule underwater inspection', severity: 'high' as const },
    { desc: 'Fatigue accumulation approaching critical level', action: 'Prioritize for detailed inspection and consider replacement planning', severity: 'critical' as const },
    { desc: 'Temperature anomaly in sensor readings', action: 'Verify sensor calibration and check for environmental factors', severity: 'low' as const },
    { desc: 'Cyclic load frequency shift detected', action: 'Review environmental conditions and update fatigue model parameters', severity: 'medium' as const },
    { desc: 'Anchor holding capacity below safety margin', action: 'Immediate inspection required. Consider emergency retensioning.', severity: 'critical' as const },
    { desc: 'Mooring line angle deviation from design', action: 'Check fairlead condition and verify platform offset', severity: 'medium' as const },
  ];

  components.forEach((comp) => {
    if (comp.status !== 'optimal') {
      const numAlerts = comp.status === 'critical' ? 2 : 1;
      for (let i = 0; i < numAlerts; i++) {
        const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
        alerts.push({
          id: `alert-${comp.id}-${i}`,
          severity: desc.severity,
          componentId: comp.id,
          componentName: comp.name,
          description: desc.desc,
          recommendedAction: desc.action,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          acknowledged: Math.random() > 0.6,
        });
      }
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export function getRecentSensorData(component: MooringComponent, hours = 24): SensorReading[] {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return component.sensorData.filter(d => new Date(d.timestamp) >= cutoff);
}

export function getAggregatedData(component: MooringComponent, intervalMinutes = 60): SensorReading[] {
  const recent = getRecentSensorData(component, 168); // last 7 days
  const aggregated: SensorReading[] = [];
  let bucket: SensorReading[] = [];

  recent.forEach((reading, idx) => {
    bucket.push(reading);
    if (bucket.length >= intervalMinutes / 5 || idx === recent.length - 1) {
      const avg: SensorReading = {
        timestamp: bucket[Math.floor(bucket.length / 2)].timestamp,
        tension: bucket.reduce((s, r) => s + r.tension, 0) / bucket.length,
        acceleration: bucket.reduce((s, r) => s + r.acceleration, 0) / bucket.length,
        inclination: bucket.reduce((s, r) => s + r.inclination, 0) / bucket.length,
        temperature: bucket.reduce((s, r) => s + r.temperature, 0) / bucket.length,
        corrosion: bucket.reduce((s, r) => s + r.corrosion, 0) / bucket.length,
        cyclicLoads: Math.floor(bucket.reduce((s, r) => s + r.cyclicLoads, 0) / bucket.length),
      };
      aggregated.push(avg);
      bucket = [];
    }
  });

  return aggregated;
}
