import { SensorReading, Alert } from '../types';

// Z-score based anomaly detection (simulated Isolation Forest)
export function detectAnomalies(readings: SensorReading[], threshold = 3): { index: number; reading: SensorReading; zScore: number; parameter: string }[] {
  const anomalies: { index: number; reading: SensorReading; zScore: number; parameter: string }[] = [];
  
  const parameters: (keyof SensorReading)[] = ['tension', 'acceleration', 'inclination', 'temperature', 'corrosion'];
  
  parameters.forEach(param => {
    const values = readings.map(r => r[param] as number);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length);
    
    if (stdDev === 0) return;
    
    readings.forEach((reading, idx) => {
      const value = reading[param] as number;
      const zScore = Math.abs((value - mean) / stdDev);
      
      if (zScore > threshold) {
        anomalies.push({
          index: idx,
          reading,
          zScore,
          parameter: param as string,
        });
      }
    });
  });
  
  return anomalies.sort((a, b) => b.zScore - a.zScore).slice(0, 50);
}

// Generate alerts from anomalies
export function generateAnomalyAlerts(
  anomalies: { index: number; reading: SensorReading; zScore: number; parameter: string }[],
  componentName: string,
  componentId: string
): Alert[] {
  return anomalies.slice(0, 5).map((anomaly, idx) => ({
    id: `anomaly-${componentId}-${idx}`,
    severity: anomaly.zScore > 5 ? 'critical' as const : anomaly.zScore > 4 ? 'high' as const : 'medium' as const,
    componentId,
    componentName,
    description: `Anomalous ${anomaly.parameter} detected (z-score: ${anomaly.zScore.toFixed(2)}). Value: ${(anomaly.reading[anomaly.parameter as keyof SensorReading] as number).toFixed(2)}`,
    recommendedAction: getRecommendedAction(anomaly.parameter, anomaly.zScore),
    timestamp: anomaly.reading.timestamp,
    acknowledged: false,
  }));
}

function getRecommendedAction(parameter: string, zScore: number): string {
  const actions: Record<string, string[]> = {
    tension: [
      'Verify load cell calibration',
      'Check for sudden environmental load changes',
      'Inspect mooring line for damage or wear',
    ],
    acceleration: [
      'Review vibration analysis data',
      'Check for vortex-induced vibration',
      'Inspect fairlead and chain stopper',
    ],
    inclination: [
      'Verify platform offset and heading',
      'Check mooring line geometry',
      'Review environmental conditions',
    ],
    temperature: [
      'Verify sensor calibration',
      'Check for corrosion-related heating',
      'Review ambient temperature data',
    ],
    corrosion: [
      'Schedule underwater inspection',
      'Verify cathodic protection system',
      'Update corrosion growth model',
    ],
  };
  
  const paramActions = actions[parameter] || ['Investigate anomalous reading'];
  return paramActions[Math.min(Math.floor(zScore) - 3, paramActions.length - 1)] || paramActions[0];
}

// Calculate overall health score (0-100)
export function calculateHealthScore(
  avgFatigue: number,
  avgFailureProb: number,
  anomalyCount: number,
  totalComponents: number
): number {
  const fatigueScore = (1 - avgFatigue) * 40;
  const failureScore = (1 - avgFailureProb) * 35;
  const anomalyScore = Math.max(0, (1 - anomalyCount / (totalComponents * 3)) * 25);
  
  return Math.round(fatigueScore + failureScore + anomalyScore);
}
