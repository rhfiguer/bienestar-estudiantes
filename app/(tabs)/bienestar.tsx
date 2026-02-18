import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useAssessment } from '@/context/AssessmentContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RISK_CONFIG = {
    low: { color: '#4CAF50', bg: '#E8F5E9', darkBg: '#1a3a2a', label: 'Bajo', icon: 'leaf' as const },
    medium: { color: '#FF9800', bg: '#FFF3E0', darkBg: '#3a2a1a', label: 'Medio', icon: 'alert-circle' as const },
    high: { color: '#F44336', bg: '#FFEBEE', darkBg: '#3a1a1a', label: 'Alto', icon: 'heart' as const },
};

export default function BienestarScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const { user } = useAuth();
    const {
        consent,
        consentLoaded,
        loadConsent,
        history,
        loadHistory,
        lastResult,
    } = useAssessment();

    useEffect(() => {
        loadConsent();
        loadHistory();
    }, []);

    const latestAssessment = history[0] || null;
    const latestConfig = latestAssessment ? RISK_CONFIG[latestAssessment.riskLevel] : null;

    const handleStartCheckin = () => {
        if (!consent?.analytics) {
            router.push('/assessment/consent' as any);
        } else {
            router.push('/assessment/pulse' as any);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Bienestar</Text>
                    <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
                        Tu espacio de autocuidado
                    </Text>
                </View>

                {/* Main CTA — Check-in Button */}
                <Pressable
                    style={[styles.checkinCard, { backgroundColor: isDark ? '#1a2a3a' : '#E3F2FD' }]}
                    onPress={handleStartCheckin}
                >
                    <View style={styles.checkinContent}>
                        <View style={[styles.checkinIcon, { backgroundColor: isDark ? '#2a3a4a' : '#BBDEFB' }]}>
                            <Ionicons name="pulse" size={28} color="#2196F3" />
                        </View>
                        <View style={styles.checkinText}>
                            <Text style={[styles.checkinTitle, { color: theme.text }]}>
                                Check-in de Bienestar
                            </Text>
                            <Text style={[styles.checkinDescription, { color: theme.secondaryText }]}>
                                5 preguntas · 1 minuto
                            </Text>
                        </View>
                        <View style={[styles.startBadge]}>
                            <Text style={styles.startText}>Iniciar</Text>
                            <Ionicons name="arrow-forward" size={16} color="#fff" />
                        </View>
                    </View>
                </Pressable>

                {/* Last Result Card */}
                {latestAssessment && latestConfig && (
                    <View style={[styles.lastResultCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                        <View style={styles.lastResultHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                Tu último resultado
                            </Text>
                            <Pressable onPress={() => router.push('/assessment/history' as any)}>
                                <Text style={[styles.seeAllText, { color: '#2196F3' }]}>
                                    Ver historial
                                </Text>
                            </Pressable>
                        </View>

                        <View style={styles.lastResultBody}>
                            {/* Score Circle */}
                            <View style={[styles.scoreCircle, {
                                backgroundColor: isDark ? latestConfig.darkBg : latestConfig.bg,
                                borderColor: latestConfig.color,
                            }]}>
                                <Text style={[styles.scoreValue, { color: latestConfig.color }]}>
                                    {latestAssessment.riskScore.toFixed(0)}
                                </Text>
                            </View>

                            <View style={styles.lastResultInfo}>
                                <View style={[styles.riskBadge, { backgroundColor: latestConfig.color + '20' }]}>
                                    <Ionicons name={latestConfig.icon} size={14} color={latestConfig.color} />
                                    <Text style={[styles.riskBadgeText, { color: latestConfig.color }]}>
                                        Riesgo {latestConfig.label}
                                    </Text>
                                </View>

                                <Text style={[styles.dateText, { color: theme.secondaryText }]}>
                                    {new Intl.DateTimeFormat('es', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    }).format(latestAssessment.completedAt)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>
                    Herramientas
                </Text>

                <View style={styles.quickActions}>
                    <Pressable
                        style={[styles.quickAction, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
                        onPress={() => router.push('/assessment/history' as any)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: isDark ? '#1a2a3a' : '#E3F2FD' }]}>
                            <Ionicons name="time" size={24} color="#2196F3" />
                        </View>
                        <Text style={[styles.quickActionLabel, { color: theme.text }]}>
                            Historial
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.quickAction, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
                        onPress={() => router.push('/(tabs)')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: isDark ? '#1a3a2a' : '#E8F5E9' }]}>
                            <Ionicons name="headset" size={24} color="#4CAF50" />
                        </View>
                        <Text style={[styles.quickActionLabel, { color: theme.text }]}>
                            Recursos
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.quickAction, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
                        onPress={() => router.push('/(tabs)/profile')}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: isDark ? '#3a2a1a' : '#FFF3E0' }]}>
                            <Ionicons name="shield-checkmark" size={24} color="#FF9800" />
                        </View>
                        <Text style={[styles.quickActionLabel, { color: theme.text }]}>
                            Privacidad
                        </Text>
                    </Pressable>
                </View>

                {/* Info Card */}
                <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                    <Ionicons name="information-circle" size={20} color="#2196F3" />
                    <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                        Tu bienestar importa. Este cuestionario se recomienda cada 2 semanas y te ayuda a detectar
                        necesidades de apoyo de manera temprana.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 4,
    },
    checkinCard: {
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
    },
    checkinContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    checkinIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkinText: {
        flex: 1,
    },
    checkinTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    checkinDescription: {
        fontSize: 13,
        marginTop: 2,
    },
    startBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#2196F3',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    startText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    lastResultCard: {
        marginHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
    },
    lastResultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        paddingHorizontal: 16,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    lastResultBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    scoreCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 26,
        fontWeight: '800',
    },
    lastResultInfo: {
        flex: 1,
        gap: 8,
    },
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    riskBadgeText: {
        fontSize: 13,
        fontWeight: '700',
    },
    dateText: {
        fontSize: 13,
    },
    quickActions: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginTop: 12,
    },
    quickAction: {
        flex: 1,
        alignItems: 'center',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        gap: 8,
    },
    quickActionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActionLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    infoCard: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 20,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
    },
});
