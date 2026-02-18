import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { PULSE_INSTRUMENT, type AssessmentResponse } from '@/constants/assessmentTypes';
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
        <SafeAreaView style={[styles.container, { backgroundColor: '#FBFBFB' }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000000" />
                </Pressable>
                <Text style={[styles.headerTitle, { color: '#828282', fontFamily: 'RobotoMono_400Regular' }]}>
                    {currentStep + 1} de {totalSteps}
                </Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressTrack, { backgroundColor: '#EDEDED' }]}>
                <Animated.View
                    style={[
                        styles.progressFill,
                        { width: `${progress * 100}%`, backgroundColor: '#000000' },
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
                    <View style={[styles.dimensionBadge, { backgroundColor: '#F5F5F5' }]}>
                        <Text style={[styles.dimensionText, { color: '#828282', fontFamily: 'RobotoMono_400Regular' }]}>
                            {currentItem.dimension}
                        </Text>
                    </View>

                    {/* Question Text */}
                    <Text style={[styles.questionText, { color: '#000000', fontFamily: 'EBGaramond_500Medium' }]}>
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
                                                ? '#000000'
                                                : '#FFFFFF',
                                            borderColor: isSelected
                                                ? '#000000'
                                                : '#EDEDED',
                                        },
                                    ]}
                                    onPress={() => handleSelect(value)}
                                >
                                    <View style={styles.optionContent}>
                                        <View style={[
                                            styles.optionNumber,
                                            {
                                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#F5F5F5',
                                            },
                                        ]}>
                                            <Text style={[
                                                styles.optionNumberText,
                                                { color: isSelected ? '#FFFFFF' : '#828282', fontFamily: 'RobotoMono_400Regular' },
                                            ]}>
                                                {value}
                                            </Text>
                                        </View>
                                        <Text style={[
                                            styles.optionLabel,
                                            { color: isSelected ? '#FFFFFF' : '#000000', fontFamily: 'RobotoMono_400Regular' },
                                        ]}>
                                            {label}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Submit Button (only on last step) */}
            {isLastStep && allAnswered && (
                <View style={[styles.bottomBar, { borderTopColor: '#EDEDED' }]}>
                    <Pressable
                        style={[styles.submitButton, submitting && styles.buttonDisabled]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        <Text style={[styles.submitText, { fontFamily: 'RobotoMono_400Regular' }]}>
                            {submitting ? 'Calculando...' : 'Ver mi resultado'}
                        </Text>
                        {!submitting && <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
                    </Pressable>
                </View>
            )}
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
        fontSize: 14,
        fontWeight: '500',
    },
    progressTrack: {
        height: 2,
        marginHorizontal: 16,
        borderRadius: 1,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 1,
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
        fontSize: 12,
        fontWeight: '600',
    },
    questionText: {
        fontSize: 28,
        lineHeight: 36,
        marginBottom: 40,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 14,
    },
    optionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionNumberText: {
        fontSize: 13,
        fontWeight: '600',
    },
    optionLabel: {
        fontSize: 15,
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
        gap: 10,
        backgroundColor: '#000000',
        paddingVertical: 16,
        borderRadius: 12,
    },
    submitText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
