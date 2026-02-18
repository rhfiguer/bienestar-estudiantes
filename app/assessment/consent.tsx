import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAssessment } from '@/context/AssessmentContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConsentScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const { user } = useAuth();
    const { saveConsent } = useAssessment();

    const [analyticsConsent, setAnalyticsConsent] = useState(false);
    const [contactConsent, setContactConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const canProceed = analyticsConsent; // Analytics consent is required

    const handleAccept = async () => {
        if (!canProceed) return;
        setSubmitting(true);
        try {
            await saveConsent({
                analytics: analyticsConsent,
                contact: contactConsent,
                timestamp: new Date(),
            });
            router.replace('/assessment/pulse' as any);
        } catch (error) {
            console.error('Error saving consent:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDecline = () => {
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    Tu Privacidad
                </Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={styles.scrollContentInner}
                showsVerticalScrollIndicator={false}
            >
                {/* Shield Icon */}
                <View style={styles.iconContainer}>
                    <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1a3a2a' : '#E8F5E9' }]}>
                        <Ionicons name="shield-checkmark" size={48} color="#4CAF50" />
                    </View>
                </View>

                <Text style={[styles.title, { color: theme.text }]}>
                    Antes de comenzar
                </Text>

                <Text style={[styles.description, { color: theme.secondaryText }]}>
                    Este cuestionario forma parte de nuestro sistema de bienestar estudiantil. Tus respuestas
                    nos ayudan a detectar si necesitas apoyo adicional.
                </Text>

                {/* Info Cards */}
                <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                    <Ionicons name="lock-closed" size={20} color="#4CAF50" />
                    <Text style={[styles.infoText, { color: theme.text }]}>
                        Tus respuestas individuales son privadas y están cifradas. Solo tú puedes verlas.
                    </Text>
                </View>

                <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                    <Ionicons name="analytics" size={20} color="#2196F3" />
                    <Text style={[styles.infoText, { color: theme.text }]}>
                        Solo se comparten datos anónimos y agregados para mejorar los programas de bienestar.
                    </Text>
                </View>

                <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                    <Ionicons name="trash" size={20} color="#FF9800" />
                    <Text style={[styles.infoText, { color: theme.text }]}>
                        Puedes eliminar todos tus datos en cualquier momento desde tu perfil.
                    </Text>
                </View>

                {/* Consent Checkboxes */}
                <View style={styles.consentSection}>
                    <Text style={[styles.consentTitle, { color: theme.text }]}>
                        Tu consentimiento
                    </Text>

                    {/* Required: Analytics */}
                    <Pressable
                        style={styles.checkboxRow}
                        onPress={() => setAnalyticsConsent(!analyticsConsent)}
                    >
                        <View style={[
                            styles.checkbox,
                            { borderColor: analyticsConsent ? '#4CAF50' : theme.secondaryText },
                            analyticsConsent && styles.checkboxChecked,
                        ]}>
                            {analyticsConsent && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                        <View style={styles.checkboxTextContainer}>
                            <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                                Acepto participar en el programa de bienestar{' '}
                                <Text style={{ color: '#FF6B6B' }}>*</Text>
                            </Text>
                            <Text style={[styles.checkboxDescription, { color: theme.secondaryText }]}>
                                Tus datos anonimizados ayudan a mejorar el apoyo estudiantil.
                            </Text>
                        </View>
                    </Pressable>

                    {/* Optional: Contact */}
                    <Pressable
                        style={styles.checkboxRow}
                        onPress={() => setContactConsent(!contactConsent)}
                    >
                        <View style={[
                            styles.checkbox,
                            { borderColor: contactConsent ? '#4CAF50' : theme.secondaryText },
                            contactConsent && styles.checkboxChecked,
                        ]}>
                            {contactConsent && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                        <View style={styles.checkboxTextContainer}>
                            <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                                Acepto ser contactado si necesito apoyo
                            </Text>
                            <Text style={[styles.checkboxDescription, { color: theme.secondaryText }]}>
                                Opcional. Si detectamos que podrías necesitar ayuda, un tutor puede comunicarse contigo.
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.borderColor }]}>
                <Pressable
                    style={[styles.declineButton, { borderColor: theme.borderColor }]}
                    onPress={handleDecline}
                >
                    <Text style={[styles.declineText, { color: theme.secondaryText }]}>
                        Ahora no
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.acceptButton,
                        !canProceed && styles.buttonDisabled,
                    ]}
                    onPress={handleAccept}
                    disabled={!canProceed || submitting}
                >
                    <Text style={styles.acceptText}>
                        {submitting ? 'Guardando...' : 'Continuar'}
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentInner: {
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    iconContainer: {
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    iconCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 10,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    consentSection: {
        marginTop: 20,
    },
    consentTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 18,
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    checkboxTextContainer: {
        flex: 1,
    },
    checkboxLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    checkboxDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 12,
        borderTopWidth: 1,
    },
    declineButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    declineText: {
        fontSize: 16,
        fontWeight: '600',
    },
    acceptButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
    },
    acceptText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
