/**
 * BLUEPULSE AI - Probabilistic Models Module
 * Implements Weibull distribution for failure probability
 * and statistical analysis for reliability assessment
 */

// Weibull distribution parameters
const BETA = 2.5; // Shape parameter
const ETA = 20; // Scale parameter (years)

/**
 * Calculate failure probability using Weibull distribution
 * F(t) = 1 - exp(-(t/η)^β)
 */
export function calculateWeibullFailureProbability(time: number): number {
  if (time <= 0) return 0;
  return 1 - Math.exp(-Math.pow(time / ETA, BETA));
}

/**
 * Calculate reliability (survival probability)
 * R(t) = 1 - F(t) = exp(-(t/η)^β)
 */
export function calculateReliability(time: number): number {
  return 1 - calculateWeibullFailureProbability(time);
}

/**
 * Calculate remaining useful life (RUL) based on current damage
 */
export function calculateRemainingUsefulLife(currentDamage: number): number {
  // Estimate equivalent time in service from damage
  const equivalentTime = Math.pow(-Math.log(1 - currentDamage), 1 / BETA) * ETA;
  const expectedLife = ETA * Math.pow(Math.log(2), 1 / BETA); // Median life
  return Math.max(0, expectedLife - equivalentTime);
}

/**
 * Calculate probability density function of Weibull
 * f(t) = (β/η) * (t/η)^(β-1) * exp(-(t/η)^β)
 */
export function weibullPDF(time: number): number {
  if (time <= 0) return 0;
  const term1 = BETA / ETA;
  const term2 = Math.pow(time / ETA, BETA - 1);
  const term3 = Math.exp(-Math.pow(time / ETA, BETA));
  return term1 * term2 * term3;
}

/**
 * Generate Weibull distribution data for visualization
 */
export function generateWeibullDistribution(points: number = 100): { time: number; pdf: number; cdf: number }[] {
  const data = [];
  const maxTime = ETA * 2;
  
  for (let i = 0; i <= points; i++) {
    const time = (i / points) * maxTime;
    data.push({
      time,
      pdf: weibullPDF(time),
      cdf: calculateWeibullFailureProbability(time)
    });
  }
  
  return data;
}

/**
 * Calculate confidence interval for failure time
 */
export function calculateConfidenceInterval(
  currentDamage: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number; mean: number } {
  const rul = calculateRemainingUsefulLife(currentDamage);
  const uncertainty = rul * 0.3; // 30% uncertainty
  
  return {
    lower: Math.max(0, rul - uncertainty),
    upper: rul + uncertainty,
    mean: rul
  };
}

/**
 * Bayesian update of failure probability with new evidence
 */
export function bayesianUpdate(
  priorProbability: number,
  likelihood: number,
  evidence: number
): number {
  // Simplified Bayesian update
  const posterior = (likelihood * priorProbability) / 
    ((likelihood * priorProbability) + ((1 - likelihood) * (1 - priorProbability)));
  return Math.min(1, Math.max(0, posterior));
}

/**
 * Calculate risk score combining multiple factors
 */
export function calculateRiskScore(
  fatigueDamage: number,
  failureProbability: number,
  anomalyScore: number,
  environmentalSeverity: number
): number {
  const weights = {
    fatigue: 0.3,
    failure: 0.3,
    anomaly: 0.25,
    environment: 0.15
  };
  
  return (
    fatigueDamage * weights.fatigue +
    failureProbability * weights.failure +
    anomalyScore * weights.anomaly +
    environmentalSeverity * weights.environment
  );
}
