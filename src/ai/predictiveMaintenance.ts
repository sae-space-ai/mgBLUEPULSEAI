/**
 * BLUEPULSE AI - Predictive Maintenance Module
 * Generates maintenance recommendations and prioritizes inspections
 */

import { calculateRemainingUsefulLife, calculateRiskScore } from './probabilisticModels';
import { calculateAnomalyScore, AnomalyResult } from './anomalyDetection';

export interface MaintenanceRecommendation {
  componentId: string;
  componentName: string;
  priority: 'immediate' | 'high' | 'medium' | 'low';
  action: string;
  estimatedCost: number; // EUR
  estimatedDowntime: number; // hours
  deadline: string; // ISO date
  riskScore: number;
}

export interface InspectionPlan {
  componentId: string;
  componentName: string;
  inspectionType: 'visual' | 'detailed' | 'NDT' | 'replacement';
  scheduledDate: string;
  estimatedDuration: number; // hours
  requiredResources: string[];
  priority: number; // 1-10
}

/**
 * Generate maintenance recommendations based on component health
 */
export function generateMaintenanceRecommendations(
  components: {
    id: string;
    name: string;
    fatigueDamage: number;
    failureProbability: number;
    anomalies: AnomalyResult[];
    lastInspection: string;
  }[],
  environmentalSeverity: number = 0.5
): MaintenanceRecommendation[] {
  const recommendations: MaintenanceRecommendation[] = [];
  
  components.forEach(comp => {
    const anomalyScore = calculateAnomalyScore(comp.anomalies);
    const riskScore = calculateRiskScore(
      comp.fatigueDamage,
      comp.failureProbability,
      anomalyScore,
      environmentalSeverity
    );
    
    let priority: 'immediate' | 'high' | 'medium' | 'low' = 'low';
    let action = 'Continue routine monitoring';
    let estimatedCost = 0;
    let estimatedDowntime = 0;
    let deadline = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year
    
    if (riskScore > 0.7) {
      priority = 'immediate';
      action = 'Emergency inspection and potential replacement. Critical risk of failure.';
      estimatedCost = 150000;
      estimatedDowntime = 72;
      deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
    } else if (riskScore > 0.5) {
      priority = 'high';
      action = 'Schedule detailed inspection and NDT testing within 30 days.';
      estimatedCost = 50000;
      estimatedDowntime = 24;
      deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    } else if (riskScore > 0.3) {
      priority = 'medium';
      action = 'Plan visual inspection and monitoring enhancement.';
      estimatedCost = 15000;
      estimatedDowntime = 8;
      deadline = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days
    } else {
      priority = 'low';
      action = 'Continue routine monitoring. Next scheduled inspection in 6 months.';
      estimatedCost = 5000;
      estimatedDowntime = 4;
      deadline = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(); // 180 days
    }
    
    recommendations.push({
      componentId: comp.id,
      componentName: comp.name,
      priority,
      action,
      estimatedCost,
      estimatedDowntime,
      deadline,
      riskScore
    });
  });
  
  // Sort by priority
  const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 };
  return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Generate inspection plan based on maintenance recommendations
 */
export function generateInspectionPlan(
  recommendations: MaintenanceRecommendation[]
): InspectionPlan[] {
  const plan: InspectionPlan[] = [];
  
  recommendations.forEach(rec => {
    let inspectionType: 'visual' | 'detailed' | 'NDT' | 'replacement';
    let estimatedDuration = 4;
    let requiredResources: string[] = [];
    let priority = 1;
    
    switch (rec.priority) {
      case 'immediate':
        inspectionType = 'replacement';
        estimatedDuration = 72;
        requiredResources = ['Crane vessel', 'Diving team', 'Replacement mooring line', 'ROV'];
        priority = 10;
        break;
      case 'high':
        inspectionType = 'NDT';
        estimatedDuration = 24;
        requiredResources = ['Diving team', 'NDT equipment', 'ROV'];
        priority = 8;
        break;
      case 'medium':
        inspectionType = 'detailed';
        estimatedDuration = 8;
        requiredResources = ['Diving team', 'Visual inspection equipment'];
        priority = 5;
        break;
      case 'low':
        inspectionType = 'visual';
        estimatedDuration = 4;
        requiredResources = ['ROV'];
        priority = 2;
        break;
    }
    
    plan.push({
      componentId: rec.componentId,
      componentName: rec.componentName,
      inspectionType,
      scheduledDate: rec.deadline,
      estimatedDuration,
      requiredResources,
      priority
    });
  });
  
  return plan.sort((a, b) => b.priority - a.priority);
}

/**
 * Calculate optimal maintenance schedule
 */
export function calculateOptimalMaintenanceSchedule(
  components: { id: string; name: string; fatigueDamage: number; failureProbability: number }[],
  budget: number = 500000, // EUR
  maxDowntime: number = 168 // hours per year
): { componentId: string; scheduledDate: string; estimatedCost: number }[] {
  const schedule: { componentId: string; scheduledDate: string; estimatedCost: number }[] = [];
  let remainingBudget = budget;
  let remainingDowntime = maxDowntime;
  
  // Sort components by risk (failure probability * fatigue damage)
  const sortedComponents = [...components].sort((a, b) => {
    const riskA = a.failureProbability * a.fatigueDamage;
    const riskB = b.failureProbability * b.fatigueDamage;
    return riskB - riskA;
  });
  
  sortedComponents.forEach(comp => {
    const rul = calculateRemainingUsefulLife(comp.fatigueDamage);
    const risk = comp.failureProbability * comp.fatigueDamage;
    
    let cost = 10000;
    let downtime = 4;
    
    if (risk > 0.5) {
      cost = 100000;
      downtime = 48;
    } else if (risk > 0.3) {
      cost = 50000;
      downtime = 24;
    } else if (risk > 0.1) {
      cost = 20000;
      downtime = 12;
    }
    
    if (remainingBudget >= cost && remainingDowntime >= downtime) {
      const scheduledDate = new Date(Date.now() + rul * 365 * 24 * 60 * 60 * 1000 * 0.8); // 80% of RUL
      
      schedule.push({
        componentId: comp.id,
        scheduledDate: scheduledDate.toISOString(),
        estimatedCost: cost
      });
      
      remainingBudget -= cost;
      remainingDowntime -= downtime;
    }
  });
  
  return schedule;
}

/**
 * Calculate maintenance cost savings from predictive vs reactive maintenance
 */
export function calculateMaintenanceCostSavings(
  predictiveCost: number,
  reactiveCost: number
): { savings: number; percentage: number; roi: number } {
  const savings = reactiveCost - predictiveCost;
  const percentage = (savings / reactiveCost) * 100;
  const roi = (savings / predictiveCost) * 100;
  
  return {
    savings,
    percentage,
    roi
  };
}

/**
 * Generate maintenance KPIs
 */
export function generateMaintenanceKPIs(
  recommendations: MaintenanceRecommendation[],
  totalComponents: number
): {
  availability: number;
  maintenanceCostPerComponent: number;
  averageRiskScore: number;
  criticalComponents: number;
  plannedVsUnplanned: number;
} {
  const criticalComponents = recommendations.filter(r => r.priority === 'immediate').length;
  const totalCost = recommendations.reduce((sum, r) => sum + r.estimatedCost, 0);
  const averageRisk = recommendations.reduce((sum, r) => sum + r.riskScore, 0) / recommendations.length;
  
  // Estimated availability (higher risk = lower availability)
  const availability = Math.max(0, 100 - (criticalComponents / totalComponents) * 20 - averageRisk * 30);
  
  // Planned vs unplanned ratio (higher is better)
  const plannedRatio = 1 - (criticalComponents / totalComponents);
  
  return {
    availability,
    maintenanceCostPerComponent: totalCost / totalComponents,
    averageRiskScore: averageRisk,
    criticalComponents,
    plannedVsUnplanned: plannedRatio * 100
  };
}
