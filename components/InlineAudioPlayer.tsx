import { useColorScheme } from '@/components/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface InlineAudioPlayerProps {
    audioUri: string;
    style?: any;
}

export default function InlineAudioPlayer({ audioUri, style }: InlineAudioPlayerProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    // Using explicit colors from requirements, but adapting some if dark mode handles differently?
    // User requested specifically "Background: #FFFFFF", "Borde: #EDEDED".
    // I will stick to the user's specs for the "Notion-esque" look, maybe slightly adapting for dark mode if strictly necessary,
    // but the request was very specific on colors. I'll use those as defaults for Light mode.

    // Theme colors for dark mode fallback or integration
    const themeTextColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const themeBgColor = isDark ? '#2C2C2C' : '#FFFFFF';
    const themeBorderColor = isDark ? '#404040' : '#EDEDED';
    const themeSecondaryText = isDark ? '#A0A0A0' : '#828282';
    const activeColor = isDark ? '#FFFFFF' : '#1A1A1A';

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Scrubber ref to calculate position on press
    const scrubberRef = useRef<View>(null);
    const [scrubberWidth, setScrubberWidth] = useState(0);

    useEffect(() => {
        loadAudio();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [audioUri]);

    const loadAudio = async () => {
        setIsLoading(true);
        try {
            const { sound: newSound, status } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { shouldPlay: false, isLooping: isLooping },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            if (status.isLoaded) {
                setDuration(status.durationMillis || 0);
            }
        } catch (error) {
            console.error("Error loading audio", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
            setPosition(status.positionMillis);
            setIsPlaying(status.isPlaying);
            setIsLooping(status.isLooping);

            if (status.didJustFinish && !status.isLooping) {
                setIsPlaying(false);
                // Optional: reset to start? 
                // sound?.setPositionAsync(0);
            }
        }
    };

    const togglePlayPause = async () => {
        if (!sound) return;
        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            // If finished, restart
            if (position >= duration && duration > 0) {
                await sound.setPositionAsync(0);
            }
            await sound.playAsync();
        }
    };

    const skip = async (seconds: number) => {
        if (!sound) return;
        const newPosition = position + seconds * 1000;
        await sound.setPositionAsync(Math.max(0, Math.min(newPosition, duration)));
    };

    const toggleLoop = async () => {
        if (!sound) return;
        await sound.setIsLoopingAsync(!isLooping);
        setIsLooping(!isLooping);
    };

    const formatTime = (millis: number) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleScrubberPress = async (event: any) => {
        if (!sound || duration === 0 || scrubberWidth === 0) return;
        const locationX = event.nativeEvent.locationX;
        const percentage = locationX / scrubberWidth;
        const newPosition = percentage * duration;
        await sound.setPositionAsync(newPosition);
    };

    const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: themeBgColor,
                borderColor: themeBorderColor
            },
            style
        ]}>
            {/* Play/Pause Button - Leftmost */}
            <Pressable
                onPress={togglePlayPause}
                style={styles.playButton}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={activeColor} />
                ) : (
                    <Ionicons
                        name={isPlaying ? "pause-outline" : "play-outline"}
                        size={32}
                        color={activeColor}
                    />
                )}
            </Pressable>

            {/* Skip Controls */}
            <View style={styles.controlsGroup}>
                <Pressable onPress={() => skip(-15)} style={styles.iconButton}>
                    <Ionicons name="play-back-outline" size={22} color={activeColor} />
                    <Text style={[styles.tinyText, { color: activeColor }]}>15</Text>
                </Pressable>
                <Pressable onPress={() => skip(15)} style={styles.iconButton}>
                    <Ionicons name="play-forward-outline" size={22} color={activeColor} />
                    <Text style={[styles.tinyText, { color: activeColor }]}>15</Text>
                </Pressable>
            </View>

            {/* Scrubber Area */}
            <View
                style={styles.scrubberContainer}
                onLayout={(e) => setScrubberWidth(e.nativeEvent.layout.width)}
            >
                {/* Visual Track */}
                <Pressable
                    style={styles.scrubberTouchArea}
                    onPress={handleScrubberPress}
                    hitSlop={{ top: 10, bottom: 10 }}
                >
                    {/* Background Line */}
                    <View style={[styles.scrubberLine, { backgroundColor: '#EDEDED' }]} />
                    {/* Progress Line */}
                    <View
                        style={[
                            styles.scrubberProgress,
                            {
                                width: `${progressPercent}%`,
                                backgroundColor: activeColor
                            }
                        ]}
                    />
                    {/* Handle */}
                    <View
                        style={[
                            styles.scrubberHandle,
                            {
                                left: `${progressPercent}%`,
                                backgroundColor: activeColor,
                                // Adjust marginLeft to center the 8px handle (-4px)
                                marginLeft: -4
                            }
                        ]}
                    />
                </Pressable>
            </View>

            {/* Time Display */}
            <Text style={[styles.timeText, { color: themeSecondaryText }]}>
                {formatTime(position)} / {formatTime(duration)}
            </Text>

            {/* Loop Button */}
            <Pressable onPress={toggleLoop} style={[styles.iconButton, { marginLeft: 10 }]}>
                <Ionicons
                    name="infinite-outline"
                    size={20}
                    color={isLooping ? activeColor : themeSecondaryText}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 72,
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 20,
        marginVertical: 16,
        width: '100%',
    },
    playButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    controlsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginRight: 16,
    },
    iconButton: {
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tinyText: {
        fontSize: 10,
        fontFamily: 'Inter_600SemiBold',
        position: 'absolute',
        bottom: -2,
        fontWeight: '600',
    },
    scrubberContainer: {
        flex: 1,
        height: 40, // Taller touch area for usability
        justifyContent: 'center',
    },
    scrubberTouchArea: {
        height: 40,
        justifyContent: 'center',
    },
    scrubberLine: {
        height: 1,
        width: '100%',
        position: 'absolute',
        borderRadius: 1,
    },
    scrubberProgress: {
        height: 1, // Same as line
        position: 'absolute',
        borderRadius: 1,
    },
    scrubberHandle: {
        width: 12,
        height: 12,
        borderRadius: 6,
        position: 'absolute',
        top: '50%', // Center vertically relative to container ??? 
        // Actually since container is 30px, top 50% is 15px.
        // We need to offset by half height (-4px).
        marginTop: -6,
    },
    timeText: {
        fontFamily: 'Inter_600SemiBold', // Assuming Inter is loaded as per generic styles, or fallback
        fontSize: 14,
        marginLeft: 12,
        fontVariant: ['tabular-nums'], // Fixed width numbers if supported
    }
});
