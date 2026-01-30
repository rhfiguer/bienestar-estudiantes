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
            style={[styles.container, { backgroundColor: theme.cardBackground }]}
            onPress={() => router.push(`/player/${item.id}`)}
        >
            <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.content}>
                <Text style={[styles.category, { color: theme.tint }]}>{item.category.toUpperCase()}</Text>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                    {item.title}
                </Text>
                <View style={styles.footer}>
                    <Text style={[styles.author, { color: theme.secondaryText }]}>{item.author}</Text>
                    <View style={styles.typeContainer}>
                        <Ionicons
                            name={
                                item.type === 'video'
                                    ? 'videocam'
                                    : 'musical-note'
                            }
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
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
        flexDirection: 'row',
        height: 120,
    },
    image: {
        width: 120,
        height: '100%',
    },
    content: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    category: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    footer: {
        marginTop: 'auto',
    },
    author: {
        fontSize: 12,
        marginBottom: 4,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    duration: {
        fontSize: 12,
        marginLeft: 4,
    },
});
