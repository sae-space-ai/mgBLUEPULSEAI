/**
 * BLUEPULSE AI - Anomaly Detection Module
 * Implements Isolation Forest simulation and statistical anomaly detection
 * Target: 90% detection performance, 20% reduction in false alarms
 */

export interface AnomalyResult {
  timestamp: string;
  parameter: string;
  value: number;
  zScore: number;
  isolationScore: number;
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Calculate z-score for a value given mean and standard deviation
 */
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

/**
 * Calculate mean of an array
 */
function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function stdDev(values: number[]): number {
  const avg = mean(values);
  const squaredDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length);
}

/**
 * Simulated Isolation Forest anomaly score
 * Based on isolation concept: anomalies are easier to isolate
 */
function isolationForestScore(value: number, values: number[], nTrees: number = 100): number {
  let avgPathLength = 0;
  
  for (let t = 0; t < nTrees; t++) {
    // Simulate random partitioning
    const sorted = [...values].sort((a, b) => a - b);
    let pathLength = 0;
    let min = sorted[0];
    let max = sorted[sorted.length - 1];
    let current = value;
    
    while (max - min > 0.01 && pathLength < 20) {
      const split = min + Math.random() * (max - min);
      if (current <= split) {
        max = split;
      } else {
        min = split;
      }
      pathLength++;
    }
    
    avgPathLength += pathLength;
  }
  
  avgPathLength /= nTrees;
  
  // Normalize: shorter paths = more anomalous
  const maxPath = Math.log2(values.length);
  const score = Math.pow(2, -avgPathLength / maxPath);
  
  return score;
}

/**
 * Detect anomalies in sensor data using combined z-score and Isolation Forest
 */
export function detectAnomalies(
  data: { timestamp: string; tension: number; acceleration: number; inclination: number; temperature: number; corrosion: number; cyclicLoads: number }[],
  zThreshold: number = 3.0,
  isolationThreshold: number = 0.6
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];
  const parameters = ['tension', 'acceleration', 'inclination', 'temperature', 'corrosion', 'cyclicLoads'] as const;
  
  parameters.forEach(param => {
    const values = data.map(d => d[param]);
    const avg = mean(values);
    const std = stdDev(values);
    
    data.forEach((point, idx) => {
      const value = point[param];
      const z = Math.abs(calculateZScore(value, avg, std));
      const isoScore = isolationForestScore(value, values);
      
      const isAnomaly = z > zThreshold || isoScore > isolationThreshold;
      
      if (isAnomaly) {
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (z > 5 || isoScore > 0.85) severity = 'critical';
        else if (z > 4 || isoScore > 0.75) severity = 'high';
        else if (z > 3.5 || isoScore > 0.7) severity = 'medium';
        
        anomalies.push({
          timestamp: point.timestamp,
          parameter: param,
          value,
          zScore: z,
          isolationScore: isoScore,
          isAnomaly: true,
          severity
        });
      }
    });
  });
  
  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Calculate anomaly score for a component (0-1 scale)
 */
export function calculateAnomalyScore(anomalies: AnomalyResult[]): number {
  if (anomalies.length === 0) return 0;
  
  const severityWeights = { critical: 1.0, high: 0.7, medium: 0.4, low: 0.1 };
  const totalWeight = anomalies.reduce((sum, a) => sum + severityWeights[a.severity], 0);
  
  // Normalize to 0-1
  return Math.min(1, totalWeight / 10);
}

/**
 * Multi-variate anomaly detection using Mahalanobis distance (simplified)
 */
export function multivariateAnomalyDetection(
  data: { tension: number; acceleration: number; inclination: number }[]
): { index: number; distance: number; isAnomaly: boolean }[] {
  const results: { index: number; distance: number; isAnomaly: boolean }[] = [];
  
  // Calculate means
  const meanTension = mean(data.map(d => d.tension));
  const meanAccel = mean(data.map(d => d.acceleration));
  const meanIncl = mean(data.map(d => d.inclination));
  
  // Calculate standard deviations
  const stdTension = stdDev(data.map(d => d.tension));
  const stdAccel = stdDev(data.map(d => d.acceleration));
  const stdIncl = stdDev(data.map(d => d.inclination));
  
  data.forEach((point, idx) => {
    // Simplified Mahalanobis distance (assuming independence)
    const distance = Math.sqrt(
      Math.pow((point.tension - meanTension) / stdTension, 2) +
      Math.pow((point.acceleration - meanAccel) / stdAccel, 2) +
      Math.pow((point.inclination - meanIncl) / stdIncl, 2)
    );
    
    results.push({
      index: idx,
      distance,
      isAnomaly: distance > 5 // Threshold for multivariate
    });
  });
  
  return results;
}

/**
 * Rolling window anomaly detection for real-time monitoring
 */
export function rollingWindowAnomalyDetection(
  data: number[],
  windowSize: number = 100,
  threshold: number = 3.0
): { index: number; isAnomaly: boolean; zScore: number }[] {
  const results: { index: number; isAnomaly: boolean; zScore: number }[] = [];
  
  for (let i = windowSize; i < data.length; i++) {
    const window = data.slice(i - windowSize, i);
    const avg = mean(window);
    const std = stdDev(window);
    const z = Math.abs(calculateZScore(data[i], avg, std));
    
    results.push({
      index: i,
      isAnomaly: z > threshold,
      zScore: z
    });
  }
  
  return results;
}
