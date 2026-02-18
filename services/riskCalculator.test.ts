// ─────────────────────────────────────────────────────────
// Risk Calculator Tests
// Run: npx tsx --test services/riskCalculator.test.ts
// ─────────────────────────────────────────────────────────

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PULSE_INSTRUMENT, type AssessmentResponse } from '../constants/assessmentTypes';
import { calculateRiskScore } from './riskCalculator';

describe('calculateRiskScore — Pulse Instrument', () => {
    it('should calculate minimum risk (score ≈ 0) when all responses favor low risk', () => {
        const responses: AssessmentResponse = {
            intention: 5,       // positive: 6-5=1 → normalized: 0/4 = 0
            burnout: 1,         // negative: 1 → normalized: 0/4 = 0
            belonging: 5,       // positive: 6-5=1 → normalized: 0/4 = 0
            financial_stress: 1, // negative: 1 → normalized: 0/4 = 0
            career_value: 5,    // positive: 6-5=1 → normalized: 0/4 = 0
        };
        const result = calculateRiskScore(responses, PULSE_INSTRUMENT);
        assert.equal(result.score, 0);
        assert.equal(result.level, 'low');
        assert.equal(result.overrideReason, null);
    });

    it('should calculate maximum risk (score = 100) when all responses favor high risk', () => {
        const responses: AssessmentResponse = {
            intention: 1,       // positive: 6-1=5 → normalized: 4/4 = 1
            burnout: 5,         // negative: 5 → normalized: 4/4 = 1
            belonging: 1,       // positive: 6-1=5 → normalized: 4/4 = 1
            financial_stress: 5, // negative: 5 → normalized: 4/4 = 1
            career_value: 1,    // positive: 6-1=5 → normalized: 4/4 = 1
        };
        const result = calculateRiskScore(responses, PULSE_INSTRUMENT);
        assert.equal(result.score, 100);
        // Override also fires here (intention=1 ≤ 2)
        assert.equal(result.level, 'high');
    });

    it('should match the manual example: I=3, E=4, P=2, F=3, S=4 → R=58.75 (medium)', () => {
        const responses: AssessmentResponse = {
            intention: 3,
            burnout: 4,
            belonging: 2,
            financial_stress: 3,
            career_value: 4,
        };
        const result = calculateRiskScore(responses, PULSE_INSTRUMENT);
        assert.equal(result.score, 58.75);
        assert.equal(result.level, 'medium');
        assert.equal(result.overrideReason, null);
    });

    it('should trigger override when intention ≤ 2, even if total score is low', () => {
        const responses: AssessmentResponse = {
            intention: 2,       // Override trigger: intention <= 2
            burnout: 1,         // Low risk
            belonging: 5,       // Low risk
            financial_stress: 1, // Low risk
            career_value: 5,    // Low risk
        };
        const result = calculateRiskScore(responses, PULSE_INSTRUMENT);
        assert.equal(result.level, 'high');
        assert.equal(result.overrideReason, 'Intención de permanencia críticamente baja');
        // Score should still be relatively low since other items are fine
        assert.ok(result.score < 40, `Expected score < 40, got ${result.score}`);
    });

    it('should trigger override when intention = 1', () => {
        const responses: AssessmentResponse = {
            intention: 1,
            burnout: 1,
            belonging: 5,
            financial_stress: 1,
            career_value: 5,
        };
        const result = calculateRiskScore(responses, PULSE_INSTRUMENT);
        assert.equal(result.level, 'high');
        assert.notEqual(result.overrideReason, null);
    });

    it('should NOT trigger override when intention = 3', () => {
        const responses: AssessmentResponse = {
            intention: 3,
            burnout: 1,
            belonging: 5,
            financial_stress: 1,
            career_value: 5,
        };
        const result = calculateRiskScore(responses, PULSE_INSTRUMENT);
        assert.notEqual(result.level, 'high');
        assert.equal(result.overrideReason, null);
    });

    it('should classify low risk correctly (score ≤ 40)', () => {
        const responses: AssessmentResponse = {
            intention: 4,       // 6-4=2 → 1/4 = 0.25
            burnout: 2,         // 2 → 1/4 = 0.25
            belonging: 4,       // 6-4=2 → 1/4 = 0.25
            financial_stress: 2, // 2 → 1/4 = 0.25
            career_value: 4,    // 6-4=2 → 1/4 = 0.25
        };
        const result = calculateRiskScore(responses, PULSE_INSTRUMENT);
        assert.equal(result.score, 25);
        assert.equal(result.level, 'low');
    });

    it('should classify high risk correctly (score > 70, no override)', () => {
        const responses: AssessmentResponse = {
            intention: 3,       // 6-3=3 → 2/4 = 0.50  (does NOT trigger override since 3 > 2)
            burnout: 5,         // 5 → 4/4 = 1.0
            belonging: 1,       // 6-1=5 → 4/4 = 1.0
            financial_stress: 5, // 5 → 4/4 = 1.0
            career_value: 1,    // 6-1=5 → 4/4 = 1.0
        };
        const result = calculateRiskScore(responses, PULSE_INSTRUMENT);
        // 0.30*0.5 + 0.25*1.0 + 0.20*1.0 + 0.15*1.0 + 0.10*1.0 = 0.15 + 0.25 + 0.20 + 0.15 + 0.10 = 0.85
        assert.equal(result.score, 85);
        assert.equal(result.level, 'high');
        assert.equal(result.overrideReason, null); // High by score, not by override
    });

    it('should throw if a response is missing', () => {
        const responses: AssessmentResponse = {
            intention: 5,
            burnout: 1,
            // missing: belonging, financial_stress, career_value
        };
        assert.throws(() => calculateRiskScore(responses, PULSE_INSTRUMENT), {
            message: /Missing response/,
        });
    });

    it('should throw if a response is out of range', () => {
        const responses: AssessmentResponse = {
            intention: 6, // Out of range (max is 5)
            burnout: 1,
            belonging: 5,
            financial_stress: 1,
            career_value: 5,
        };
        assert.throws(() => calculateRiskScore(responses, PULSE_INSTRUMENT), {
            message: /out of range/,
        });
    });

    it('should verify weights sum to 1.0', () => {
        const totalWeight = PULSE_INSTRUMENT.items.reduce((sum, item) => sum + item.weight, 0);
        assert.ok(
            Math.abs(totalWeight - 1.0) < 0.001,
            `Weights should sum to 1.0, got ${totalWeight}`
        );
    });
});
