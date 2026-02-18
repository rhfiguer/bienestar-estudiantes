import { useAssessment } from '@/context/AssessmentContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    Image as RnImage,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ConsentScreen() {
    const router = useRouter();
    const { saveConsent } = useAssessment();

    const [analyticsConsent, setAnalyticsConsent] = useState(false);
    const [contactConsent, setContactConsent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const canProceed = analyticsConsent; // Analytics consent is required

    const handleAccept = async () => {
        if (!canProceed) return;
        setSubmitting(true);
        try {
            console.log('Saving consent...');
            await saveConsent({
                analytics: analyticsConsent,
                contact: contactConsent,
                timestamp: new Date(),
            });
            console.log('Consent saved, navigating to pulse...');
            // Use push instead of replace to ensure we push onto the stack correctly
            // even if we are in a modal
            router.push('/assessment/pulse' as any);
        } catch (error: any) {
            console.error('Error saving consent:', error);
            Alert.alert('Error', 'No se pudo guardar tu consentimiento. ' + (error.message || 'Inténtalo de nuevo.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleDecline = () => {
        router.back();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#FBFBFB' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000000" />
                </Pressable>
                <Text style={[styles.headerTitle, { color: '#000000', fontFamily: 'EBGaramond_500Medium' }]}>
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
                    <RnImage
                        source={require('@/assets/images/doodle-consent-shield.png')}
                        style={{ width: 120, height: 120, resizeMode: 'contain' }}
                    />
                </View>

                <Text style={[styles.title, { color: '#000000', fontFamily: 'EBGaramond_500Medium' }]}>
                    Antes de comenzar
                </Text>

                <Text style={[styles.description, { color: '#828282', fontFamily: 'RobotoMono_400Regular' }]}>
                    Este cuestionario forma parte de nuestro sistema de bienestar estudiantil. Tus respuestas
                    nos ayudan a detectar si necesitas apoyo adicional.
                </Text>

                {/* Info Cards */}
                <View style={[styles.infoCard, { backgroundColor: '#FFFFFF', borderColor: '#EDEDED' }]}>
                    <View style={styles.infoIconContainer}>
                        <RnImage
                            source={require('@/assets/images/doodle-privacy-lock.png')}
                            style={{ width: 24, height: 24, resizeMode: 'contain' }}
                        />
                    </View>
                    <Text style={[styles.infoText, { color: '#000000', fontFamily: 'RobotoMono_400Regular' }]}>
                        Tus respuestas individuales son privadas y están cifradas.
                    </Text>
                </View>

                <View style={[styles.infoCard, { backgroundColor: '#FFFFFF', borderColor: '#EDEDED' }]}>
                    <View style={styles.infoIconContainer}>
                        <RnImage
                            source={require('@/assets/images/doodle-privacy-analytics.png')}
                            style={{ width: 24, height: 24, resizeMode: 'contain' }}
                        />
                    </View>
                    <Text style={[styles.infoText, { color: '#000000', fontFamily: 'RobotoMono_400Regular' }]}>
                        Solo se comparten datos anónimos y agregados.
                    </Text>
                </View>

                <View style={[styles.infoCard, { backgroundColor: '#FFFFFF', borderColor: '#EDEDED' }]}>
                    <View style={styles.infoIconContainer}>
                        <RnImage
                            source={require('@/assets/images/doodle-privacy-trash.png')}
                            style={{ width: 24, height: 24, resizeMode: 'contain' }}
                        />
                    </View>
                    <Text style={[styles.infoText, { color: '#000000', fontFamily: 'RobotoMono_400Regular' }]}>
                        Puedes eliminar todos tus datos en cualquier momento.
                    </Text>
                </View>

                {/* Consent Checkboxes */}
                <View style={styles.consentSection}>
                    <Text style={[styles.consentTitle, { color: '#000000', fontFamily: 'EBGaramond_500Medium' }]}>
                        Tu consentimiento
                    </Text>

                    {/* Required: Analytics */}
                    <Pressable
                        style={styles.checkboxRow}
                        onPress={() => setAnalyticsConsent(!analyticsConsent)}
                    >
                        <RnImage
                            source={analyticsConsent
                                ? require('@/assets/images/doodle-checkbox-checked.png')
                                : require('@/assets/images/doodle-checkbox-unchecked.png')
                            }
                            style={{ width: 26, height: 26, resizeMode: 'contain' }}
                        />
                        <View style={styles.checkboxTextContainer}>
                            <Text style={[styles.checkboxLabel, { color: '#000000', fontFamily: 'RobotoMono_400Regular', fontWeight: 'bold' }]}>
                                Acepto participar en el programa de bienestar{' '}
                                <Text style={{ color: '#000000' }}>*</Text>
                            </Text>
                            <Text style={[styles.checkboxDescription, { color: '#828282', fontFamily: 'RobotoMono_400Regular' }]}>
                                Tus datos anonimizados ayudan a mejorar el apoyo estudiantil.
                            </Text>
                        </View>
                    </Pressable>

                    {/* Optional: Contact */}
                    <Pressable
                        style={styles.checkboxRow}
                        onPress={() => setContactConsent(!contactConsent)}
                    >
                        <RnImage
                            source={contactConsent
                                ? require('@/assets/images/doodle-checkbox-checked.png')
                                : require('@/assets/images/doodle-checkbox-unchecked.png')
                            }
                            style={{ width: 26, height: 26, resizeMode: 'contain' }}
                        />
                        <View style={styles.checkboxTextContainer}>
                            <Text style={[styles.checkboxLabel, { color: '#000000', fontFamily: 'RobotoMono_400Regular', fontWeight: 'bold' }]}>
                                Acepto ser contactado si necesito apoyo
                            </Text>
                            <Text style={[styles.checkboxDescription, { color: '#828282', fontFamily: 'RobotoMono_400Regular' }]}>
                                Opcional. Un tutor puede comunicarse contigo.
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[styles.bottomBar, { backgroundColor: '#FBFBFB', borderTopColor: '#EDEDED' }]}>
                <Pressable
                    style={[styles.declineButton, { borderColor: 'transparent' }]}
                    onPress={handleDecline}
                >
                    <Text style={[styles.declineText, { color: '#828282', fontFamily: 'RobotoMono_400Regular' }]}>
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
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
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
        marginTop: 20,
        marginBottom: 24,
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
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        gap: 12,
    },
    infoIconContainer: {
        marginTop: 2,
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
        backgroundColor: '#000000',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    acceptText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'RobotoMono_400Regular',
        color: '#FFFFFF',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
