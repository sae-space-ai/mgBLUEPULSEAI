/**
 * BLUEPULSE AI - Prediction API Service
 * Simulates the Next.js API route for AI predictions
 * In production, this would be app/api/predict/route.ts
 */

import { calculateFatigueFromReadings, predictFatigueEvolution } from './fatigueModel';
import { calculateWeibullFailureProbability, calculateRemainingUsefulLife, calculateRiskScore, generateWeibullDistribution } from './probabilisticModels';
import { detectAnomalies, calculateAnomalyScore, AnomalyResult } from './anomalyDetection';
import { updateDigitalTwinState, calculateTotalLoad, EnvironmentalConditions } from './digitalTwin';
import { generateMaintenanceRecommendations, generateInspectionPlan, generateMaintenanceKPIs } from './predictiveMaintenance';

export interface PredictionRequest {
  componentId: string;
  componentName: string;
  sensorData: {
    timestamp: string;
    tension: number;
    acceleration: number;
    inclination: number;
    temperature: number;
    corrosion: number;
    cyclicLoads: number;
  }[];
  environmentalConditions: EnvironmentalConditions;
  lastInspection: string;
}

export interface PredictionResponse {
  componentId: string;
  timestamp: string;
  
  // Fatigue Analysis
  fatigue: {
    minerDamage: number;
    evolution: { month: number; damage: number; rate: number }[];
    trend: 'improving' | 'stable' | 'degrading';
  };
  
  // Failure Probability
  failure: {
    weibullProbability: number;
    remainingUsefulLife: number;
    confidenceInterval: { lower: number; upper: number };
    weibullDistribution: { time: number; pdf: number; cdf: number }[];
  };
  
  // Anomaly Detection
  anomalies: {
    detected: AnomalyResult[];
    anomalyScore: number;
    totalAnomalies: number;
    criticalAnomalies: number;
  };
  
  // Risk Assessment
  risk: {
    score: number;
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: {
      fatigue: number;
      failure: number;
      anomaly: number;
      environment: number;
    };
  };
  
  // Digital Twin
  digitalTwin: {
    visualState: 'optimal' | 'warning' | 'critical';
    recommendedAction: string;
    estimatedLifeReduction: number;
    totalLoad: number;
  };
  
  // Maintenance
  maintenance: {
    recommendation: string;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    estimatedCost: number;
    estimatedDowntime: number;
    deadline: string;
  };
}

/**
 * Main prediction endpoint - simulates POST /api/predict
 */
export async function predict(request: PredictionRequest): Promise<PredictionResponse> {
  const { componentId, componentName, sensorData, environmentalConditions, lastInspection } = request;
  
  // 1. Fatigue Analysis
  const minerDamage = calculateFatigueFromReadings(sensorData);
  const envFactor = calculateTotalLoad(environmentalConditions) / 500;
  const evolution = predictFatigueEvolution(minerDamage, envFactor);
  
  // Determine trend
  const recentDamage = evolution.slice(-3).reduce((s, e) => s + e.rate, 0) / 3;
  const olderDamage = evolution.slice(-6, -3).reduce((s, e) => s + e.rate, 0) / 3;
  const trend = recentDamage > olderDamage * 1.1 ? 'degrading' as const : 
                recentDamage < olderDamage * 0.9 ? 'improving' as const : 'stable' as const;
  
  // 2. Failure Probability
  const rul = calculateRemainingUsefulLife(minerDamage);
  const weibullProb = calculateWeibullFailureProbability(20 - rul);
  const weibullDist = generateWeibullDistribution();
  
  // 3. Anomaly Detection
  const anomalies = detectAnomalies(sensorData);
  const anomalyScore = calculateAnomalyScore(anomalies);
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critical').length;
  
  // 4. Risk Assessment
  const riskScore = calculateRiskScore(minerDamage, weibullProb, anomalyScore, envFactor / 5);
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskScore > 0.7) riskLevel = 'critical';
  else if (riskScore > 0.5) riskLevel = 'high';
  else if (riskScore > 0.3) riskLevel = 'medium';
  
  // 5. Digital Twin Update
  const twinState = updateDigitalTwinState(environmentalConditions, minerDamage, weibullProb);
  const totalLoad = calculateTotalLoad(environmentalConditions);
  
  // 6. Maintenance Recommendation
  const recommendations = generateMaintenanceRecommendations([{
    id: componentId,
    name: componentName,
    fatigueDamage: minerDamage,
    failureProbability: weibullProb,
    anomalies,
    lastInspection
  }], envFactor / 5);
  
  const maintRec = recommendations[0];
  
  return {
    componentId,
    timestamp: new Date().toISOString(),
    fatigue: {
      minerDamage,
      evolution,
      trend
    },
    failure: {
      weibullProbability: weibullProb,
      remainingUsefulLife: rul,
      confidenceInterval: {
        lower: Math.max(0, rul * 0.7),
        upper: rul * 1.3
      },
      weibullDistribution: weibullDist
    },
    anomalies: {
      detected: anomalies.slice(0, 20), // Top 20
      anomalyScore,
      totalAnomalies: anomalies.length,
      criticalAnomalies
    },
    risk: {
      score: riskScore,
      level: riskLevel,
      factors: {
        fatigue: minerDamage,
        failure: weibullProb,
        anomaly: anomalyScore,
        environment: envFactor / 5
      }
    },
    digitalTwin: {
      visualState: twinState.visualState,
      recommendedAction: twinState.recommendedAction,
      estimatedLifeReduction: twinState.estimatedLifeReduction,
      totalLoad
    },
    maintenance: {
      recommendation: maintRec.action,
      priority: maintRec.priority,
      estimatedCost: maintRec.estimatedCost,
      estimatedDowntime: maintRec.estimatedDowntime,
      deadline: maintRec.deadline
    }
  };
}

/**
 * Batch prediction for all components
 */
export async function predictAll(
  components: PredictionRequest[]
): Promise<PredictionResponse[]> {
  const results = await Promise.all(components.map(c => predict(c)));
  return results;
}

/**
 * Generate system-wide KPIs
 */
export async function generateSystemKPIs(
  predictions: PredictionResponse[]
): Promise<{
  overallHealth: number;
  totalAnomalies: number;
  criticalComponents: number;
  averageRisk: number;
  totalMaintenanceCost: number;
  availability: number;
}> {
  const avgHealth = 100 - (predictions.reduce((s, p) => s + p.risk.score, 0) / predictions.length) * 100;
  const totalAnomalies = predictions.reduce((s, p) => s + p.anomalies.totalAnomalies, 0);
  const criticalComponents = predictions.filter(p => p.risk.level === 'critical').length;
  const avgRisk = predictions.reduce((s, p) => s + p.risk.score, 0) / predictions.length;
  const totalCost = predictions.reduce((s, p) => s + p.maintenance.estimatedCost, 0);
  const availability = Math.max(0, 100 - criticalComponents * 5 - avgRisk * 30);
  
  return {
    overallHealth: avgHealth,
    totalAnomalies,
    criticalComponents,
    averageRisk: avgRisk,
    totalMaintenanceCost: totalCost,
    availability
  };
}
