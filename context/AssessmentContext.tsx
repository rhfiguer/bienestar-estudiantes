import type {
    AssessmentRecord,
    AssessmentResponse,
    Instrument,
    RiskResult,
    UserConsent,
} from '@/constants/assessmentTypes';
import { PULSE_INSTRUMENT } from '@/constants/assessmentTypes';
import { AnalyticsService } from '@/services/analyticsService';
import { calculateRiskScore } from '@/services/riskCalculator';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

// ─── Types ───

interface AssessmentState {
    /** Current consent status */
    consent: UserConsent | null;
    /** Whether consent has been loaded */
    consentLoaded: boolean;
    /** Assessment history */
    history: AssessmentRecord[];
    /** Whether history is loading */
    historyLoading: boolean;
    /** The result of the most recent assessment */
    lastResult: RiskResult | null;
    /** Whether a submit is in progress */
    submitting: boolean;
}

interface AssessmentContextValue extends AssessmentState {
    /** Save user consent */
    saveConsent: (consent: UserConsent) => Promise<void>;
    /** Load consent from Firestore */
    loadConsent: () => Promise<void>;
    /** Submit an assessment: calculate score, save, sync */
    submitAssessment: (
        responses: AssessmentResponse,
        instrument?: Instrument
    ) => Promise<RiskResult>;
    /** Load assessment history */
    loadHistory: () => Promise<void>;
    /** Unlock identity (consent to contact) */
    unlockIdentity: () => Promise<void>;
}

// ─── Context ───

const AssessmentContext = createContext<AssessmentContextValue | undefined>(undefined);

// ─── Helpers ───

/** Returns the current academic semester string, e.g. "2026-1" */
function getCurrentSemester(): string {
    const now = new Date();
    const year = now.getFullYear();
    const half = now.getMonth() < 6 ? 1 : 2;
    return `${year}-${half}`;
}

// ─── Provider ───

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    const [state, setState] = useState<AssessmentState>({
        consent: null,
        consentLoaded: false,
        history: [],
        historyLoading: false,
        lastResult: null,
        submitting: false,
    });

    const loadConsent = useCallback(async () => {
        if (!user) return;
        try {
            const consent = await AnalyticsService.getConsent();
            setState((prev) => ({ ...prev, consent, consentLoaded: true }));
        } catch (error) {
            console.error('Failed to load consent:', error);
            setState((prev) => ({ ...prev, consentLoaded: true }));
        }
    }, [user]);

    const saveConsent = useCallback(async (consent: UserConsent) => {
        await AnalyticsService.saveConsent(consent);
        setState((prev) => ({ ...prev, consent }));
    }, []);

    const submitAssessment = useCallback(
        async (
            responses: AssessmentResponse,
            instrument: Instrument = PULSE_INSTRUMENT
        ): Promise<RiskResult> => {
            setState((prev) => ({ ...prev, submitting: true }));

            try {
                // 1. Calculate risk score locally
                const result = calculateRiskScore(responses, instrument);

                // 2. Save to Firestore (PII layer)
                await AnalyticsService.saveAssessment({
                    instrumentId: instrument.id,
                    instrumentVersion: instrument.version,
                    completedAt: new Date(),
                    responses,
                    riskScore: result.score,
                    riskLevel: result.level,
                    overrideReason: result.overrideReason,
                });

                // 3. Sync pseudonymized score to Admin API
                await AnalyticsService.syncScore({
                    instrumentId: instrument.id,
                    riskScore: result.score,
                    riskLevel: result.level,
                    overrideApplied: result.overrideReason !== null,
                    completedAt: new Date(),
                    semester: getCurrentSemester(),
                });

                // 4. If high risk, trigger alert
                if (result.level === 'high') {
                    await AnalyticsService.triggerAlert({
                        instrumentId: instrument.id,
                        riskScore: result.score,
                        riskLevel: result.level,
                        triggerSource: result.overrideReason ? 'pulse_override' : 'pulse_score',
                    });
                }

                setState((prev) => ({ ...prev, lastResult: result, submitting: false }));
                return result;
            } catch (error) {
                setState((prev) => ({ ...prev, submitting: false }));
                throw error;
            }
        },
        []
    );

    const loadHistory = useCallback(async () => {
        if (!user) return;
        setState((prev) => ({ ...prev, historyLoading: true }));
        try {
            const history = await AnalyticsService.getHistory();
            setState((prev) => ({ ...prev, history, historyLoading: false }));
        } catch (error) {
            console.error('Failed to load history:', error);
            setState((prev) => ({ ...prev, historyLoading: false }));
        }
    }, [user]);

    const unlockIdentity = useCallback(async () => {
        await AnalyticsService.unlockIdentity();
        // Also update consent to reflect contact permission
        if (state.consent) {
            const updatedConsent = { ...state.consent, contact: true, timestamp: new Date() };
            await AnalyticsService.saveConsent(updatedConsent);
            setState((prev) => ({ ...prev, consent: updatedConsent }));
        }
    }, [state.consent]);

    const value: AssessmentContextValue = {
        ...state,
        saveConsent,
        loadConsent,
        submitAssessment,
        loadHistory,
        unlockIdentity,
    };

    return (
        <AssessmentContext.Provider value={value}>
            {children}
        </AssessmentContext.Provider>
    );
}

// ─── Hook ───

export function useAssessment() {
    const context = useContext(AssessmentContext);
    if (context === undefined) {
        throw new Error('useAssessment must be used within an AssessmentProvider');
    }
    return context;
}
