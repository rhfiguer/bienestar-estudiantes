import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { AssessmentRecord, RiskLevel } from '@/constants/assessmentTypes';
import { useAssessment } from '@/context/AssessmentContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RISK_COLORS: Record<RiskLevel, string> = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
};

const RISK_LABELS: Record<RiskLevel, string> = {
    low: 'Bajo',
    medium: 'Medio',
    high: 'Alto',
};

const RISK_ICONS: Record<RiskLevel, keyof typeof Ionicons.glyphMap> = {
    low: 'leaf',
    medium: 'alert-circle',
    high: 'heart',
};

export default function HistoryScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const { history, historyLoading, loadHistory } = useAssessment();

    useEffect(() => {
        loadHistory();
    }, []);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const renderItem = ({ item, index }: { item: AssessmentRecord; index: number }) => {
        const color = RISK_COLORS[item.riskLevel];
        const label = RISK_LABELS[item.riskLevel];
        const icon = RISK_ICONS[item.riskLevel];

        // Simple trend indicator compared to previous
        const previousItem = index < history.length - 1 ? history[index + 1] : null;
        let trendIcon: keyof typeof Ionicons.glyphMap | null = null;
        let trendColor = theme.secondaryText;
        if (previousItem) {
            if (item.riskScore < previousItem.riskScore) {
                trendIcon = 'trending-down';
                trendColor = '#4CAF50'; // Improving (lower risk)
            } else if (item.riskScore > previousItem.riskScore) {
                trendIcon = 'trending-up';
                trendColor = '#F44336'; // Worsening
            } else {
                trendIcon = 'remove';
                trendColor = theme.secondaryText;
            }
        }

        return (
            <View style={[styles.historyCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                {/* Left color bar */}
                <View style={[styles.colorBar, { backgroundColor: color }]} />

                <View style={styles.cardContent}>
                    {/* Top row: date + badge */}
                    <View style={styles.cardHeader}>
                        <Text style={[styles.dateText, { color: theme.secondaryText }]}>
                            {formatDate(item.completedAt)}
                        </Text>
                        <View style={[styles.riskBadge, { backgroundColor: color + '20' }]}>
                            <Ionicons name={icon} size={14} color={color} />
                            <Text style={[styles.riskBadgeText, { color }]}>
                                {label}
                            </Text>
                        </View>
                    </View>

                    {/* Score row */}
                    <View style={styles.scoreRow}>
                        <Text style={[styles.scoreText, { color: theme.text }]}>
                            {item.riskScore.toFixed(1)}
                        </Text>
                        <Text style={[styles.scoreMax, { color: theme.secondaryText }]}>/ 100</Text>
                        {trendIcon && (
                            <View style={styles.trendContainer}>
                                <Ionicons name={trendIcon} size={18} color={trendColor} />
                                {previousItem && (
                                    <Text style={[styles.trendText, { color: trendColor }]}>
                                        {Math.abs(item.riskScore - previousItem.riskScore).toFixed(1)}
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Override notice */}
                    {item.overrideReason && (
                        <View style={styles.overrideRow}>
                            <Ionicons name="warning" size={14} color="#FF9800" />
                            <Text style={[styles.overrideText, { color: '#FF9800' }]} numberOfLines={1}>
                                {item.overrideReason}
                            </Text>
                        </View>
                    )}

                    {/* Instrument name */}
                    <Text style={[styles.instrumentText, { color: theme.secondaryText }]}>
                        {item.instrumentId === 'pulse_v1' ? 'Cuestionario de Pulso' : item.instrumentId}
                    </Text>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={64} color={theme.secondaryText} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Sin evaluaciones todavía
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.secondaryText }]}>
                Completa tu primer check-in de bienestar para ver tu historial aquí.
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Mi Historial</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Summary stats */}
            {history.length > 0 && (
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{history.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Evaluaciones</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                        <Text style={[styles.statValue, { color: RISK_COLORS[history[0]?.riskLevel || 'low'] }]}>
                            {history[0]?.riskScore.toFixed(1) || '—'}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Último score</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>
                            {history.length > 0
                                ? (history.reduce((sum, r) => sum + r.riskScore, 0) / history.length).toFixed(1)
                                : '—'}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Promedio</Text>
                    </View>
                </View>
            )}

            {/* History List */}
            {historyLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id || String(item.completedAt)}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
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
        fontSize: 18,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 10,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 11,
        marginTop: 2,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    historyCard: {
        flexDirection: 'row',
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 10,
        overflow: 'hidden',
    },
    colorBar: {
        width: 4,
    },
    cardContent: {
        flex: 1,
        padding: 14,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '500',
    },
    riskBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    riskBadgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    scoreText: {
        fontSize: 28,
        fontWeight: '800',
    },
    scoreMax: {
        fontSize: 14,
        fontWeight: '500',
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginLeft: 'auto',
    },
    trendText: {
        fontSize: 13,
        fontWeight: '600',
    },
    overrideRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    overrideText: {
        fontSize: 12,
        fontWeight: '500',
        flex: 1,
    },
    instrumentText: {
        fontSize: 12,
        marginTop: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 16,
    },
    emptyDescription: {
        fontSize: 15,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
