import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { PULSE_INSTRUMENT, type AssessmentResponse, type InstrumentItem } from '@/constants/assessmentTypes';
import { useAssessment } from '@/context/AssessmentContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const instrument = PULSE_INSTRUMENT;

export default function PulseScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const { submitAssessment, submitting } = useAssessment();

    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState<AssessmentResponse>({});
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const totalSteps = instrument.items.length;
    const currentItem = instrument.items[currentStep];
    const progress = (currentStep + 1) / totalSteps;

    const isLastStep = currentStep === totalSteps - 1;
    const allAnswered = instrument.items.every((item) => responses[item.key] !== undefined);

    const animateTransition = (callback: () => void) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
        setTimeout(callback, 150);
    };

    const handleSelect = (value: number) => {
        setResponses((prev) => ({ ...prev, [currentItem.key]: value }));

        // Auto-advance after a brief pause
        if (!isLastStep) {
            setTimeout(() => {
                animateTransition(() => setCurrentStep((prev) => prev + 1));
            }, 300);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            animateTransition(() => setCurrentStep((prev) => prev - 1));
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        if (!allAnswered) return;
        try {
            const result = await submitAssessment(responses, instrument);
            router.replace({
                pathname: '/assessment/result' as any,
                params: {
                    score: result.score.toString(),
                    level: result.level,
                    overrideReason: result.overrideReason || '',
                },
            });
        } catch (error) {
            console.error('Error submitting assessment:', error);
        }
    };

    const selectedValue = responses[currentItem.key];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.secondaryText }]}>
                    {currentStep + 1} de {totalSteps}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressTrack, { backgroundColor: theme.borderColor }]}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        { width: `${progress * 100}%` },
                    ]}
                />
            </View>

            {/* Question */}
            <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Dimension Badge */}
                    <View style={[styles.dimensionBadge, { backgroundColor: isDark ? '#1a2a3a' : '#E3F2FD' }]}>
                        <Text style={[styles.dimensionText, { color: '#2196F3' }]}>
                            {currentItem.dimension}
                        </Text>
                    </View>

                    {/* Question Text */}
                    <Text style={[styles.questionText, { color: theme.text }]}>
                        {currentItem.question}
                    </Text>

                    {/* Scale Options */}
                    <View style={styles.optionsContainer}>
                        {Array.from(
                            { length: currentItem.scaleMax - currentItem.scaleMin + 1 },
                            (_, i) => currentItem.scaleMin + i
                        ).map((value) => {
                            const isSelected = selectedValue === value;
                            const label = currentItem.scaleLabels[String(value)] || String(value);

                            return (
                                <Pressable
                                    key={value}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor: isSelected
                                                ? getColorForValue(value, currentItem)
                                                : theme.cardBackground,
                                            borderColor: isSelected
                                                ? getColorForValue(value, currentItem)
                                                : theme.borderColor,
                                        },
                                    ]}
                                    onPress={() => handleSelect(value)}
                                >
                                    <View style={styles.optionContent}>
                                        <View style={[
                                            styles.optionNumber,
                                            {
                                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : (isDark ? '#2A2A2A' : '#F5F5F5'),
                                            },
                                        ]}>
                                            <Text style={[
                                                styles.optionNumberText,
                                                { color: isSelected ? '#fff' : theme.secondaryText },
                                            ]}>
                                                {value}
                                            </Text>
                                        </View>
                                        <Text style={[
                                            styles.optionLabel,
                                            { color: isSelected ? '#fff' : theme.text },
                                        ]}>
                                            {label}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Submit Button (only on last step) */}
            {isLastStep && allAnswered && (
                <View style={[styles.bottomBar, { borderTopColor: theme.borderColor }]}>
                    <Pressable
                        style={[styles.submitButton, submitting && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <Text style={styles.submitText}>
                            {submitting ? 'Calculando...' : 'Ver mi resultado'}
                        </Text>
                        {!submitting && <Ionicons name="arrow-forward" size={20} color="#fff" />}
                    </Pressable>
                </View>
            )}
        </SafeAreaView>
    );
}

/**
 * Returns a color for the option based on the value and item direction.
 * For "negative" items (high = bad): green → red
 * For "positive" items (high = good): red → green
 */
function getColorForValue(value: number, item: InstrumentItem): string {
    const range = item.scaleMax - item.scaleMin;
    const normalized = (value - item.scaleMin) / range; // 0 to 1

    const colors = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];
    const index = item.direction === 'negative'
        ? Math.round(normalized * (colors.length - 1))
        : Math.round((1 - normalized) * (colors.length - 1));

    return colors[index];
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
        fontSize: 15,
        fontWeight: '600',
    },
    progressTrack: {
        height: 4,
        marginHorizontal: 16,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 2,
    },
    questionContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 100,
    },
    dimensionBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 20,
    },
    dimensionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    questionText: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
        marginBottom: 32,
    },
    optionsContainer: {
        gap: 10,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 14,
        borderWidth: 1.5,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 14,
    },
    optionNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionNumberText: {
        fontSize: 14,
        fontWeight: '700',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    bottomBar: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#4CAF50',
        paddingVertical: 16,
        borderRadius: 14,
    },
    submitText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
