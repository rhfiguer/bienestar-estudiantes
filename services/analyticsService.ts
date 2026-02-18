// ─────────────────────────────────────────────────────────
// Analytics Service
// Handles persistence (Firestore) and sync (Admin API)
// ─────────────────────────────────────────────────────────

import type {
    AssessmentRecord,
    RiskLevel,
    UserConsent
} from '@/constants/assessmentTypes';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    setDoc,
    Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// ─── Firestore helpers ───

/**
 * Gets the assessments subcollection reference for the current user.
 */
function getAssessmentsRef() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');
    return collection(db, 'users', uid, 'assessments');
}

/**
 * Gets the user consent document reference.
 */
function getConsentRef() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');
    return doc(db, 'users', uid, 'profile', 'consent');
}

// ─── Public API ───

export const AnalyticsService = {
    // ─── Consent ───

    /**
     * Saves or updates user consent preferences.
     */
    saveConsent: async (consent: UserConsent): Promise<void> => {
        const consentRef = getConsentRef();
        await setDoc(consentRef, {
            analytics: consent.analytics,
            contact: consent.contact,
            timestamp: Timestamp.fromDate(consent.timestamp),
        });
    },

    /**
     * Reads the current user's consent preferences.
     */
    getConsent: async (): Promise<UserConsent | null> => {
        const consentRef = getConsentRef();
        const snap = await getDoc(consentRef);
        if (!snap.exists()) return null;
        const data = snap.data();
        return {
            analytics: data.analytics,
            contact: data.contact,
            timestamp: data.timestamp.toDate(),
        };
    },

    // ─── Assessments ───

    /**
     * Saves an assessment record to Firestore under the user's uid.
     * Returns the generated document ID.
     */
    saveAssessment: async (record: Omit<AssessmentRecord, 'id' | 'syncedToAnalytics'>): Promise<string> => {
        const assessmentsRef = getAssessmentsRef();
        const docRef = doc(assessmentsRef);
        const data = {
            ...record,
            completedAt: Timestamp.fromDate(record.completedAt),
            syncedToAnalytics: false,
        };
        await setDoc(docRef, data);
        return docRef.id;
    },

    /**
     * Retrieves the assessment history for the current user, ordered by date.
     */
    getHistory: async (): Promise<AssessmentRecord[]> => {
        const assessmentsRef = getAssessmentsRef();
        const q = query(assessmentsRef, orderBy('completedAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                instrumentId: data.instrumentId,
                instrumentVersion: data.instrumentVersion,
                completedAt: data.completedAt.toDate(),
                responses: data.responses,
                riskScore: data.riskScore,
                riskLevel: data.riskLevel as RiskLevel,
                overrideReason: data.overrideReason,
                syncedToAnalytics: data.syncedToAnalytics,
            };
        });
    },

    // ─── Admin API Sync ───

    /**
     * Sends a pseudonymized score to the Admin API for aggregate analytics.
     * The pseudoId is generated server-side via HMAC-SHA256.
     */
    syncScore: async (record: {
        instrumentId: string;
        riskScore: number;
        riskLevel: RiskLevel;
        overrideApplied: boolean;
        completedAt: Date;
        semester: string;
        cohort?: string;
        faculty?: string;
    }): Promise<void> => {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');

        try {
            const response = await fetch(`${API_URL}/api/app/analytics/score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseUid: uid,
                    ...record,
                    completedAt: record.completedAt.toISOString(),
                }),
            });

            if (!response.ok) {
                console.error('Failed to sync score:', await response.text());
            }
        } catch (error) {
            // Silently fail sync — data is safe in Firestore
            console.error('Score sync failed (data safe in Firestore):', error);
        }
    },

    /**
     * Sends a high-risk alert to the Admin API.
     */
    triggerAlert: async (data: {
        instrumentId: string;
        riskScore: number;
        riskLevel: RiskLevel;
        triggerSource: 'pulse_score' | 'pulse_override' | 'intermediate' | 'comprehensive';
    }): Promise<void> => {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error('User not authenticated');

        try {
            const response = await fetch(`${API_URL}/api/app/analytics/alert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseUid: uid,
                    ...data,
                }),
            });

            if (!response.ok) {
                console.error('Failed to trigger alert:', await response.text());
            }
        } catch (error) {
            console.error('Alert trigger failed:', error);
        }
    },

    /**
     * Unlocks the student's identity on an alert when they consent to be contacted.
     * This is the GDPR-compliant de-pseudonymization step.
     */
    unlockIdentity: async (): Promise<void> => {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        try {
            const response = await fetch(`${API_URL}/api/app/analytics/unlock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firebaseUid: user.uid,
                    studentName: user.displayName || user.email?.split('@')[0] || 'Estudiante',
                    studentEmail: user.email,
                }),
            });

            if (!response.ok) {
                console.error('Failed to unlock identity:', await response.text());
            }
        } catch (error) {
            console.error('Identity unlock failed:', error);
        }
    },

    /**
     * Fetches an instrument definition from the Admin API.
     * Used to render questionnaires dynamically.
     */
    getInstrument: async (instrumentId: string) => {
        try {
            const response = await fetch(
                `${API_URL}/api/app/analytics/instrument?id=${instrumentId}`
            );
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch instrument:', error);
            return null;
        }
    },
};
