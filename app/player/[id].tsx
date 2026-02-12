import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useFavorites } from '@/context/FavoritesContext';
import { ContentService } from '@/services/content';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import InlineAudioPlayer from '@/components/InlineAudioPlayer';

export default function PlayerScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const theme = isDark ? Colors.dark : Colors.light;
    const { toggleFavorite, isFavorite } = useFavorites();

    const [mode, setMode] = useState<'listen' | 'read'>('listen');
    const [item, setItem] = useState<any>(null);
    const videoRef = React.useRef<Video>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchItem = async () => {
            if (typeof id !== 'string') return;

            try {
                const dbItem = await ContentService.getContentById(id);
                setItem(dbItem);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchItem();
    }, [id]);






    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.text} />
            </View>
        );
    }

    if (!item) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.text }}>Contenido no encontrado</Text>
            </View>
        );
    }

    const isFav = isFavorite(item.id);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="chevron-down" size={30} color={theme.text} />
                </Pressable>
                <Text style={[styles.headerTitle, { color: theme.secondaryText }]}>
                    {item.category.toUpperCase()}
                </Text>
                <Pressable onPress={() => toggleFavorite(item.id)}>
                    <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={28}
                        color={isFav ? theme.tint : theme.text}
                    />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.author, { color: theme.secondaryText }]}>Curadoría Alba</Text>

                {/* Toggle Control */}
                <View style={[styles.toggleContainer, { borderColor: theme.borderColor }]}>
                    <Pressable
                        style={[
                            styles.toggleButton,
                            mode === 'listen' && { backgroundColor: theme.tint }
                        ]}
                        onPress={() => setMode('listen')}
                    >
                        <Text style={[
                            styles.toggleText,
                            { color: mode === 'listen' ? '#FFFFFF' : theme.text }
                        ]}>Escuchar</Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.toggleButton,
                            mode === 'read' && { backgroundColor: theme.tint }
                        ]}
                        onPress={() => setMode('read')}
                    >
                        <Text style={[
                            styles.toggleText,
                            { color: mode === 'read' ? '#FFFFFF' : theme.text }
                        ]}>Leer</Text>
                    </Pressable>
                </View>

                {mode === 'listen' ? (
                    <>
                        {item.type === 'video' && item.contentUrl && (
                            <View style={styles.videoContainer}>
                                <Video
                                    ref={videoRef}
                                    style={styles.video}
                                    source={{ uri: item.contentUrl }}
                                    useNativeControls
                                    resizeMode={ResizeMode.CONTAIN}
                                    isLooping
                                    onPlaybackStatusUpdate={status => setIsPlaying(status.isLoaded && status.isPlaying)}
                                    posterSource={{ uri: item.imageUrl }}
                                    usePoster
                                />
                                {!isPlaying && (
                                    <Pressable
                                        style={styles.videoOverlay}
                                        onPress={async () => {
                                            if (videoRef.current) {
                                                await videoRef.current.playAsync();
                                            }
                                        }}>
                                        <View style={[styles.playButton, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                                            <Ionicons name="play" size={40} color="#fff" />
                                        </View>
                                    </Pressable>
                                )}
                            </View>
                        )}

                        {item.type === 'audio' && item.contentUrl && (
                            <InlineAudioPlayer audioUri={item.contentUrl} />
                        )}
                    </>
                ) : (
                    <Text style={[styles.bodyText, { color: theme.text, marginTop: 24 }]}>
                        {item.script || item.body}
                    </Text>
                )}

            </ScrollView>
        </View>
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
        padding: 20,
        paddingTop: 50,
    },
    closeButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    author: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
    },
    videoContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    audioContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    audioPlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        alignSelf: 'center',
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        minWidth: 100,
        alignItems: 'center',
    },
    toggleText: {
        fontWeight: '600',
        fontSize: 14,
    },
    bodyText: {
        fontSize: 18,
        lineHeight: 28,
    },
});
