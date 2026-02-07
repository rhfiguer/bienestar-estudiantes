import { Colors } from '@/constants/Colors';
import { ContentItem } from '@/constants/data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface ContentCardProps {
    item: ContentItem;
    isDark: boolean;
}

export const ContentCard = ({ item, isDark }: ContentCardProps) => {
    const theme = isDark ? Colors.dark : Colors.light;
    const router = useRouter();

    return (
        <Pressable
            style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
            onPress={() => router.push(`/player/${item.id}`)}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                />
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.category, { color: theme.tint }]}>{item.category.toUpperCase()}</Text>
                </View>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                    {item.title}
                </Text>
                {item.body && (
                    <Text style={[styles.description, { color: theme.secondaryText }]} numberOfLines={2}>
                        {item.body}
                    </Text>
                )}
                <View style={styles.footer}>
                    <Text style={[styles.author, { color: theme.secondaryText }]}>Curadoría Alba</Text>
                    <View style={styles.typeContainer}>
                        <Ionicons
                            name={item.type === 'video' ? 'videocam' : 'musical-note'}
                            size={14}
                            color={theme.secondaryText}
                        />
                        <Text style={[styles.duration, { color: theme.secondaryText }]}> • {item.duration}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 48, // 48px separation
        borderWidth: 1,
        borderColor: Colors.light.borderColor, // Using a fixed color or theme color
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.borderColor,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 24, // Increased padding
        backgroundColor: '#FFFFFF', // Use explicit surface color
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    category: {
        fontSize: 12,
        fontFamily: 'RobotoMono_400Regular',
        opacity: 0.7,
        letterSpacing: 1,
    },
    title: {
        fontSize: 20, // Slightly larger for headings
        fontFamily: 'EBGaramond_500Medium',
        marginBottom: 8,
        lineHeight: 26,
    },
    description: {
        fontSize: 14,
        fontFamily: 'RobotoMono_400Regular',
        lineHeight: 22, // 1.6 line height
        marginBottom: 12,
        opacity: 0.8,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    author: {
        fontSize: 12,
        fontFamily: 'RobotoMono_400Regular',
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        opacity: 0.6,
    },
    duration: {
        fontSize: 12,
        fontFamily: 'RobotoMono_400Regular',
        marginLeft: 4,
    },
});
