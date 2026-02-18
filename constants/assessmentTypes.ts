// ─────────────────────────────────────────────────────────
// Assessment Types & Instrument Definitions
// ─────────────────────────────────────────────────────────

export type RiskLevel = 'low' | 'medium' | 'high';

export type ItemDirection = 'positive' | 'negative';

export interface ScaleLabels {
    [key: string]: string;
}

export interface OverrideRule {
    /** The item key to evaluate */
    itemKey: string;
    /** Operator for comparison */
    operator: '<=' | '>=' | '==' | '<' | '>';
    /** Threshold value for the condition */
    threshold: number;
    /** The risk level to force when condition is met */
    result: RiskLevel;
    /** Human-readable reason for the override */
    reason: string;
}

export interface InstrumentItem {
    /** Unique key for this item (used in responses object) */
    key: string;
    /** Dimension this item measures */
    dimension: string;
    /** The question shown to the student */
    question: string;
    /** Minimum scale value */
    scaleMin: number;
    /** Maximum scale value */
    scaleMax: number;
    /** Labels for scale endpoints */
    scaleLabels: ScaleLabels;
    /** Whether high values mean low risk (positive) or high risk (negative) */
    direction: ItemDirection;
    /** Weight of this item in the total score (all weights must sum to 1.0) */
    weight: number;
}

export interface InstrumentThresholds {
    /** Score at or below this = low risk */
    low: number;
    /** Score at or below this = medium risk (above = high) */
    medium: number;
}

export interface Instrument {
    id: string;
    name: string;
    version: number;
    items: InstrumentItem[];
    overrideRules: OverrideRule[];
    thresholds: InstrumentThresholds;
}

export interface AssessmentResponse {
    /** Map of item key → numeric response value */
    [itemKey: string]: number;
}

export interface RiskResult {
    /** Calculated score from 0 to 100 */
    score: number;
    /** Classified risk level */
    level: RiskLevel;
    /** If an override was triggered, the reason */
    overrideReason: string | null;
}

export interface AssessmentRecord {
    /** Unique assessment ID (Firestore document ID) */
    id?: string;
    /** Instrument used */
    instrumentId: string;
    /** Instrument version at the time */
    instrumentVersion: number;
    /** When the student completed it */
    completedAt: Date;
    /** Raw responses */
    responses: AssessmentResponse;
    /** Calculated risk score */
    riskScore: number;
    /** Classified risk level */
    riskLevel: RiskLevel;
    /** Override reason if applicable */
    overrideReason: string | null;
    /** Whether this record has been synced to admin analytics */
    syncedToAnalytics: boolean;
}

export interface UserConsent {
    /** Whether user consented to analytics data collection */
    analytics: boolean;
    /** Whether user consented to being contacted if at risk */
    contact: boolean;
    /** When consent was given/updated */
    timestamp: Date;
}

// ─────────────────────────────────────────────────────────
// Instrument Definitions (Pulse v1)
// ─────────────────────────────────────────────────────────

export const PULSE_INSTRUMENT: Instrument = {
    id: 'pulse_v1',
    name: 'Cuestionario de Pulso',
    version: 1,
    items: [
        {
            key: 'intention',
            dimension: 'Intención de Permanencia',
            question: '¿Qué probabilidad hay de que te vuelvas a matricular el próximo semestre en esta carrera?',
            scaleMin: 1,
            scaleMax: 5,
            scaleLabels: { '1': 'Nula', '2': 'Baja', '3': 'Moderada', '4': 'Alta', '5': 'Muy alta' },
            direction: 'positive',
            weight: 0.30,
        },
        {
            key: 'burnout',
            dimension: 'Agotamiento Académico',
            question: '¿En qué medida consideras que tu actividad académica está siendo generadora de estrés?',
            scaleMin: 1,
            scaleMax: 5,
            scaleLabels: { '1': 'Nada', '2': 'Poco', '3': 'Moderado', '4': 'Bastante', '5': 'Mucho' },
            direction: 'negative',
            weight: 0.25,
        },
        {
            key: 'belonging',
            dimension: 'Sentido de Pertenencia',
            question: '¿Sientes que eres una parte real de esta comunidad universitaria?',
            scaleMin: 1,
            scaleMax: 5,
            scaleLabels: { '1': 'No, en absoluto', '2': 'Poco', '3': 'Regular', '4': 'Bastante', '5': 'Sí, totalmente' },
            direction: 'positive',
            weight: 0.20,
        },
        {
            key: 'financial_stress',
            dimension: 'Estrés Financiero',
            question: '¿Qué tanta presión sientes respecto a tu situación económica para cubrir los costos de estudio?',
            scaleMin: 1,
            scaleMax: 5,
            scaleLabels: { '1': 'Ninguna', '2': 'Poca', '3': 'Moderada', '4': 'Bastante', '5': 'Extrema' },
            direction: 'negative',
            weight: 0.15,
        },
        {
            key: 'career_value',
            dimension: 'Valor de la Carrera',
            question: '¿Qué tan útil consideras que es lo que estás aprendiendo para tu futuro profesional?',
            scaleMin: 1,
            scaleMax: 5,
            scaleLabels: { '1': 'Inútil', '2': 'Poco útil', '3': 'Regular', '4': 'Útil', '5': 'Muy útil' },
            direction: 'positive',
            weight: 0.10,
        },
    ],
    overrideRules: [
        {
            itemKey: 'intention',
            operator: '<=',
            threshold: 2,
            result: 'high',
            reason: 'Intención de permanencia críticamente baja',
        },
    ],
    thresholds: {
        low: 40,
        medium: 70,
    },
};
