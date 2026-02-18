// ─────────────────────────────────────────────────────────
// Risk Calculator — Generic Scoring Engine
// Works for any instrument (Pulse, Intermediate, Comprehensive)
// ─────────────────────────────────────────────────────────

import {
    AssessmentResponse,
    Instrument,
    InstrumentItem,
    OverrideRule,
    RiskLevel,
    RiskResult,
} from '@/constants/assessmentTypes';

/**
 * Aligns a single item response to the risk direction.
 * For "positive" items (high value = low risk), we invert: (scaleMax + 1 - value)
 * For "negative" items (high value = high risk), we keep as-is.
 */
function alignToRisk(value: number, item: InstrumentItem): number {
    if (item.direction === 'positive') {
        return item.scaleMax + 1 - value;
    }
    return value;
}

/**
 * Normalizes an aligned value to [0, 1] range.
 * Formula: (aligned - scaleMin) / (scaleMax - scaleMin)
 */
function normalize(aligned: number, item: InstrumentItem): number {
    const range = item.scaleMax - item.scaleMin;
    if (range === 0) return 0;
    return (aligned - item.scaleMin) / range;
}

/**
 * Evaluates a single override rule against the raw responses.
 */
function evaluateOverrideRule(
    rule: OverrideRule,
    responses: AssessmentResponse
): boolean {
    const value = responses[rule.itemKey];
    if (value === undefined) return false;

    switch (rule.operator) {
        case '<=':
            return value <= rule.threshold;
        case '>=':
            return value >= rule.threshold;
        case '==':
            return value === rule.threshold;
        case '<':
            return value < rule.threshold;
        case '>':
            return value > rule.threshold;
        default:
            return false;
    }
}

/**
 * Classifies a risk score into a risk level based on instrument thresholds.
 */
function classifyRiskLevel(
    score: number,
    thresholds: { low: number; medium: number }
): RiskLevel {
    if (score <= thresholds.low) return 'low';
    if (score <= thresholds.medium) return 'medium';
    return 'high';
}

/**
 * Calculates the risk score for any instrument.
 *
 * Formula: R = 100 × Σ(w_i × normalize(align(x_i)))
 *
 * Where:
 * - x_i = raw response for item i
 * - align() inverts "positive" items so all point toward risk
 * - normalize() scales each aligned value to [0, 1]
 * - w_i = weight of item i (Σw_i = 1.0)
 *
 * After calculating the weighted score, override rules are evaluated.
 * If an override fires, the risk_level is forced regardless of the score.
 *
 * @param responses - Map of item key → numeric value
 * @param instrument - The instrument definition (items, weights, thresholds, overrides)
 * @returns RiskResult with score [0-100], level, and optional override reason
 */
export function calculateRiskScore(
    responses: AssessmentResponse,
    instrument: Instrument
): RiskResult {
    // Validate that all items have responses
    for (const item of instrument.items) {
        if (responses[item.key] === undefined) {
            throw new Error(`Missing response for item: ${item.key}`);
        }
        const val = responses[item.key];
        if (val < item.scaleMin || val > item.scaleMax) {
            throw new Error(
                `Response for ${item.key} (${val}) is out of range [${item.scaleMin}, ${item.scaleMax}]`
            );
        }
    }

    // Validate weights sum to 1.0 (with tolerance for floating point)
    const totalWeight = instrument.items.reduce((sum, item) => sum + item.weight, 0);
    if (Math.abs(totalWeight - 1.0) > 0.001) {
        throw new Error(
            `Instrument weights must sum to 1.0, got ${totalWeight.toFixed(4)}`
        );
    }

    // Calculate weighted normalized score
    let weightedSum = 0;
    for (const item of instrument.items) {
        const raw = responses[item.key];
        const aligned = alignToRisk(raw, item);
        const normalized = normalize(aligned, item);
        weightedSum += item.weight * normalized;
    }

    // Scale to 0-100 with 2 decimal places
    const score = Math.round(weightedSum * 100 * 100) / 100;

    // Evaluate override rules (checked against RAW responses)
    for (const rule of instrument.overrideRules) {
        if (evaluateOverrideRule(rule, responses)) {
            return {
                score,
                level: rule.result,
                overrideReason: rule.reason,
            };
        }
    }

    // Classify by thresholds
    const level = classifyRiskLevel(score, instrument.thresholds);

    return {
        score,
        level,
        overrideReason: null,
    };
}

// Re-export for convenience
export { alignToRisk, classifyRiskLevel, evaluateOverrideRule, normalize };

