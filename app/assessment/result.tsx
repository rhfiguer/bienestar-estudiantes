import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { RiskLevel } from '@/constants/assessmentTypes';
import { useAssessment } from '@/context/AssessmentContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RISK_CONFIG: Record<RiskLevel, {
    color: string;
    bgColor: string;
    darkBgColor: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    description: string;
}> = {
    low: {
        color: '#4CAF50',
        bgColor: '#E8F5E9',
        darkBgColor: '#1a3a2a',
        icon: 'leaf',
        title: '¡Todo en orden!',
        subtitle: 'Riesgo Bajo',
        description: 'Tus respuestas indican que estás en un buen momento. Sigue así y recuerda que siempre puedes acceder a nuestros recursos de bienestar.',
    },
    medium: {
        color: '#FF9800',
        bgColor: '#FFF3E0',
        darkBgColor: '#3a2a1a',
        icon: 'alert-circle',
        title: 'Necesitas atención',
        subtitle: 'Riesgo Medio',
        description: 'Detectamos algunas áreas donde podrías beneficiarte de apoyo adicional. Te recomendamos completar una evaluación más detallada para entender mejor tu situación.',
    },
    high: {
        color: '#F44336',
        bgColor: '#FFEBEE',
        darkBgColor: '#3a1a1a',
        icon: 'heart',
        title: 'Queremos ayudarte',
        subtitle: 'Riesgo Alto',
        description: 'Tus respuestas indican que podrías estar pasando por un momento difícil. No estás solo/a. Te animamos a conectarte con nuestro equipo de apoyo.',
    },
};

export default function ResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{
        score: string;
        level: string;
        overrideReason: string;
    }>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const { unlockIdentity, consent } = useAssessment();

    const score = parseFloat(params.score || '0');
    const level = (params.level || 'low') as RiskLevel;
    const overrideReason = params.overrideReason || null;
    const config = RISK_CONFIG[level];

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleContactConsent = async () => {
        try {
            await unlockIdentity();
            // Show confirmation
        } catch (error) {
            console.error('Error unlocking identity:', error);
        }
    };

    const handleDone = () => {
        router.replace('/(tabs)');
    };

    const handleViewHistory = () => {
        router.push('/assessment/history' as any);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#FBFBFB' }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Result Icon */}
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            transform: [
                                {
                                    scale: scaleAnim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0, 1.2, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={[styles.iconCircle, { backgroundColor: isDark ? config.darkBgColor : config.bgColor }]}>
                        <Ionicons name={config.icon} size={56} color={config.color} />
                    </View>
                </Animated.View>

                {/* Score */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={[styles.title, { color: '#000000', fontFamily: 'EBGaramond_500Medium' }]}>{config.title}</Text>

                    <View style={[styles.scoreBadge, { backgroundColor: isDark ? config.darkBgColor : config.bgColor }]}>
                        <Text style={[styles.scoreValue, { color: config.color, fontFamily: 'EBGaramond_500Medium' }]}>
                            {score.toFixed(0)}
                        </Text>
                        <Text style={[styles.scoreLabel, { color: config.color, fontFamily: 'RobotoMono_400Regular' }]}>
                            / 100
                        </Text>
                        <View style={[styles.separator, { backgroundColor: config.color }]} />
                        <Text style={[styles.scoreLabel, { color: config.color, fontFamily: 'RobotoMono_400Regular' }]}>
                            {config.subtitle}
                        </Text>
                    </View>

                    {/* Override Notice */}
                    {overrideReason && (
                        <View style={[styles.overrideCard, { backgroundColor: isDark ? '#3a1a1a' : '#FFEBEE' }]}>
                            <Ionicons name="warning" size={18} color="#F44336" />
                            <Text style={[styles.overrideText, { color: isDark ? '#FFCDD2' : '#C62828', fontFamily: 'RobotoMono_400Regular' }]}>
                                {overrideReason}
                            </Text>
                        </View>
                    )}

                    {/* Description */}
                    <Text style={[styles.description, { color: '#828282', fontFamily: 'RobotoMono_400Regular' }]}>
                        {config.description}
                    </Text>

                    {/* Actions Based on Level */}
                    {level === 'high' && (
                        <View style={styles.actionsSection}>
                            <Text style={[styles.actionsTitle, { color: '#000000', fontFamily: 'EBGaramond_500Medium' }]}>
                                Opciones de apoyo
                            </Text>

                            {/* Consent to Contact */}
                            {!consent?.contact && (
                                <Pressable
                                    style={[styles.actionCard, { backgroundColor: '#F44336' }]}
                                    onPress={handleContactConsent}
                                >
                                    <Ionicons name="call" size={24} color="#fff" />
                                    <View style={styles.actionCardText}>
                                        <Text style={[styles.actionCardTitle, { fontFamily: 'RobotoMono_400Regular' }]}>
                                            Quiero que me contacten
                                        </Text>
                                        <Text style={[styles.actionCardDescription, { fontFamily: 'RobotoMono_400Regular' }]}>
                                            Un tutor se comunicará contigo de manera confidencial
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                                </Pressable>
                            )}

                            {consent?.contact && (
                                <View style={[styles.actionCard, { backgroundColor: '#4CAF50' }]}>
                                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                    <View style={styles.actionCardText}>
                                        <Text style={[styles.actionCardTitle, { fontFamily: 'RobotoMono_400Regular' }]}>Contacto solicitado</Text>
                                        <Text style={[styles.actionCardDescription, { fontFamily: 'RobotoMono_400Regular' }]}>
                                            Un tutor se comunicará contigo pronto
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <Pressable
                                style={[styles.resourceCard, { backgroundColor: '#FFFFFF', borderColor: '#EDEDED' }]}
                                onPress={() => router.push('/(tabs)')}
                            >
                                <Ionicons name="headset" size={24} color="#2196F3" />
                                <View style={styles.actionCardText}>
                                    <Text style={[styles.resourceTitle, { color: '#000000', fontFamily: 'EBGaramond_500Medium' }]}>
                                        Recursos de apoyo
                                    </Text>
                                    <Text style={[styles.resourceDescription, { color: '#828282', fontFamily: 'RobotoMono_400Regular' }]}>
                                        Explora contenido de bienestar y herramientas de manejo de estrés
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#828282" />
                            </Pressable>
                        </View>
                    )}

                    {level === 'medium' && (
                        <View style={styles.actionsSection}>
                            <Pressable
                                style={[styles.resourceCard, { backgroundColor: '#FFFFFF', borderColor: '#EDEDED' }]}
                                onPress={() => router.push('/(tabs)')}
                            >
                                <Ionicons name="library" size={24} color="#FF9800" />
                                <View style={styles.actionCardText}>
                                    <Text style={[styles.resourceTitle, { color: '#000000', fontFamily: 'EBGaramond_500Medium' }]}>
                                        Recursos recomendados
                                    </Text>
                                    <Text style={[styles.resourceDescription, { color: '#828282', fontFamily: 'RobotoMono_400Regular' }]}>
                                        Contenido seleccionado para ayudarte con las áreas que identificamos
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#828282" />
                            </Pressable>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            {/* Bottom Buttons */}
            <View style={[styles.bottomBar, { borderTopColor: '#EDEDED' }]}>
                <Pressable
                    style={[styles.historyButton, { borderColor: '#EDEDED', backgroundColor: '#FFFFFF' }]}
                    onPress={handleViewHistory}
                >
                    <Ionicons name="time" size={20} color="#000000" />
                    <Text style={[styles.historyText, { color: '#000000', fontFamily: 'RobotoMono_400Regular' }]}>Historial</Text>
                </Pressable>

                <Pressable
                    style={[styles.doneButton, { backgroundColor: '#000000' }]}
                    onPress={handleDone}
                >
                    <Text style={[styles.doneText, { fontFamily: 'RobotoMono_400Regular' }]}>Volver al inicio</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 100,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconCircle: {
        width: 112,
        height: 112,
        borderRadius: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 20,
    },
    scoreBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        alignSelf: 'center',
        marginBottom: 24,
        gap: 8,
    },
    scoreValue: {
        fontSize: 28,
        fontWeight: '600',
    },
    scoreLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    separator: {
        width: 1,
        height: 16,
        opacity: 0.5,
    },
    overrideCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        gap: 10,
        marginBottom: 16,
    },
    overrideText: {
        fontSize: 13,
        flex: 1,
        fontWeight: '500',
    },
    description: {
        fontSize: 15,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 32,
    },
    actionsSection: {
        gap: 16,
    },
    actionsTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        gap: 14,
    },
    actionCardText: {
        flex: 1,
    },
    actionCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 2,
    },
    actionCardDescription: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
    },
    resourceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        gap: 14,
    },
    resourceTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    resourceDescription: {
        fontSize: 13,
    },
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 12,
        borderTopWidth: 1,
    },
    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
    },
    historyText: {
        fontSize: 15,
        fontWeight: '600',
    },
    doneButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    doneText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
